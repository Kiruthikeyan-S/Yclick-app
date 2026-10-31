import os
import io
import re
import json
import logging
import httpx
from typing import List, Optional, Dict, Any
from PIL import Image
from fastapi import HTTPException, status
from ..models.schemas import (
    ImprovementSuggestionModel,
    DesignPreferencesModel,
    AnalyzeImageResponse,
    RoomScores
)
from .groq_service import groq_service

logger = logging.getLogger(__name__)

def _extract_json_object(raw_text: str) -> Optional[Dict[str, Any]]:
    """Extract a JSON object from text that may contain markdown code fences or conversational wrappers."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        # Fallback: find outermost curly braces
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return None

class SpatialAnalysisEngine:
    @staticmethod
    async def analyze_space_photo(
        image_bytes: Optional[bytes] = None, 
        filename: str = "space.jpg",
        demo_mode: bool = False
    ) -> AnalyzeImageResponse:
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        token = os.getenv("CLOUDFLARE_API_TOKEN")
        is_demo_allowed = demo_mode or os.getenv("ALLOW_DEMO_MODE", "false").lower() in ("true", "1") or os.getenv("DEMO_MODE", "false").lower() in ("true", "1")

        if not image_bytes:
            if is_demo_allowed:
                return SpatialAnalysisEngine._get_demo_response()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image bytes are required for spatial analysis."
            )

        # 1. Image format and decoding verification via Pillow
        try:
            im = Image.open(io.BytesIO(image_bytes))
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            im.thumbnail((512, 512), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=85)
            compressed_bytes = list(buf.getvalue())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded file is not a valid or decodable image: {str(e)}"
            )

        # 2. Check service configuration
        if not (account_id and token and token.startswith("cfut_")):
            if is_demo_allowed:
                return SpatialAnalysisEngine._get_demo_response()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cloudflare Workers AI credentials not configured on backend (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)."
            )

        if not groq_service.is_configured:
            if is_demo_allowed:
                return SpatialAnalysisEngine._get_demo_response()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Groq API key is not configured on backend (GROQ_API_KEY)."
            )

        # 3. Cloudflare LLaVA Vision Scan
        vision_desc = ""
        cf_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/llava-hf/llava-1.5-7b-hf"
        cf_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        cf_payload = {
            "prompt": "Describe all furniture, windows, lighting, clutter, structural details, and surfaces in this room photograph.",
            "image": compressed_bytes,
            "max_tokens": 300,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                cf_res = await client.post(cf_url, headers=cf_headers, json=cf_payload)
                if cf_res.status_code == 200:
                    cf_data = cf_res.json()
                    vision_desc = cf_data.get("result", {}).get("description", "")
                else:
                    logger.error(f"Cloudflare Vision API error {cf_res.status_code}: {cf_res.text}")
                    if not is_demo_allowed:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"Cloudflare Vision service error ({cf_res.status_code}): {cf_res.text}"
                        )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Cloudflare Vision request exception: {e}")
            if not is_demo_allowed:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Failed to communicate with Cloudflare Vision AI: {str(e)}"
                )

        if not vision_desc:
            if is_demo_allowed:
                return SpatialAnalysisEngine._get_demo_response()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vision AI could not generate a visual description from the room photograph."
            )

        # 4. Groq Structured Room Diagnosis
        prompt = f"""Based on this room visual description:
"{vision_desc}"

Act as a master interior architect. Output a JSON diagnosis with:
1. "roomType": room category
2. "detectedObjects": array of items/furniture recognized in the room
3. "correctionsNeeded": array of 3-4 specific architectural, lighting, or layout flaws to fix
4. "itemsToRemove": array of 2-3 specific items to remove or declutter to instantly gain space
5. "diySelfImprovements": array of 3-4 actionable DIY steps the user can do completely on their own without contractors
6. "suggestedTemplate": recommended design style/template (e.g. Modern Scandinavian, Warm Minimalist, Japandi)
7. "scores": {{"lighting": "5/10", "spaciousness": "6/10", "coziness": "5/10"}}

Return ONLY valid JSON. No markdown ticks, no preamble."""

        try:
            raw_groq = await groq_service.chat([{"role": "user", "content": prompt}], max_tokens=1000)
            parsed = _extract_json_object(raw_groq)

            if not parsed:
                logger.error(f"Failed to extract JSON from Groq output: {raw_groq}")
                if not is_demo_allowed:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="AI diagnosis engine returned malformed structured data."
                    )
                return SpatialAnalysisEngine._get_demo_response()

            scores_data = parsed.get("scores", {})
            return AnalyzeImageResponse(
                roomType=parsed.get("roomType", "Living Space"),
                detectedObjects=parsed.get("detectedObjects", []),
                correctionsNeeded=parsed.get("correctionsNeeded", []),
                itemsToRemove=parsed.get("itemsToRemove", []),
                diySelfImprovements=parsed.get("diySelfImprovements", []),
                suggestedTemplate=parsed.get("suggestedTemplate", "Modern Scandinavian"),
                scores=RoomScores(
                    lighting=str(scores_data.get("lighting", "6/10")),
                    spaciousness=str(scores_data.get("spaciousness", "6/10")),
                    coziness=str(scores_data.get("coziness", "5/10")),
                ),
                detectedLighting="Natural daylight with secondary shadows",
                detectedFeatures=parsed.get("detectedObjects", [])[:4],
                spatialNotes=f"Identified {len(parsed.get('detectedObjects', []))} key room elements with actionable DIY steps.",
                isDemo=False,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Groq diagnosis exception: {e}")
            if is_demo_allowed:
                return SpatialAnalysisEngine._get_demo_response()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq interior diagnosis service failed: {str(e)}"
            )

    @staticmethod
    def _get_demo_response() -> AnalyzeImageResponse:
        """Provide transparent fallback diagnosis only when explicitly permitted in demo mode."""
        return AnalyzeImageResponse(
            roomType="Living & Work Space (Demo)",
            detectedObjects=["Primary Seating", "Perimeter Wall", "Window Opening", "Floor Surface"],
            correctionsNeeded=[
                "Unshaded direct lighting creates harsh shadows in corners",
                "Secondary furniture blocks natural walking corridor from the doorway",
                "Bare vertical walls cause sound echo and missed storage opportunities",
                "Exposed wiring and surface clutter reduces perceived room volume",
            ],
            itemsToRemove=[
                "Mismatched non-functional side items",
                "Floor clutter near the window walkway",
                "Excess decorative items crowding flat surfaces",
            ],
            diySelfImprovements=[
                "Shift main seating 30cm closer to the natural daylight source",
                "Swap unshaded bulb for a 2700K–3000K warm diffused floor lamp",
                "Install 2 shallow floating wall shelves for vertical storage",
                "Place a textured area rug to clearly define the room boundary",
            ],
            suggestedTemplate="Warm Minimalist / Modern Scandinavian",
            scores=RoomScores(lighting="5/10", spaciousness="6/10", coziness="4/10"),
            detectedLighting="Direct Window Daylight with Secondary Shadowed Areas",
            detectedFeatures=["Perimeter walls", "Floor boundary", "Walking corridor", "Windows"],
            spatialNotes="[Demo Mode] Predefined sample diagnosis. Configure Cloudflare and Groq credentials for live vision intelligence.",
            isDemo=True,
        )

    @staticmethod
    async def generate_practical_recommendations(preferences: DesignPreferencesModel) -> List[ImprovementSuggestionModel]:
        # 1. Try generating with fast Groq AI intelligence
        if groq_service.is_configured:
            try:
                groq_suggestions = await groq_service.generate_dynamic_recommendations(preferences)
                if groq_suggestions and len(groq_suggestions) >= 3:
                    return groq_suggestions
            except Exception as e:
                logger.warning(f"Groq recommendations failed, falling back: {e}")

        # 2. Fallback to curated architectural guidelines
        return [
            ImprovementSuggestionModel(
                id="sug-1",
                order=1,
                title="Optimize Natural Daylight & Primary Lighting",
                whyItMatters="Poorly positioned lighting creates harsh shadows, visual fatigue, and makes spaces feel smaller than their physical dimensions.",
                recommendedAction="Shift main seating 30cm closer to the primary window. Introduce a standing uplighter with a 3000K warm-white LED lamp to disperse light across the ceiling.",
                priority="High",
                difficulty="Easy",
                materialsNeeded=["Warm LED bulbs (3000K, 12W)", "Diffuser shade or standing floor lamp", "Cable organizer clips"],
                estimatedCostRange="₹1,200 – ₹2,500",
            ),
            ImprovementSuggestionModel(
                id="sug-2",
                order=2,
                title="Rearrange Furniture to Clear Primary Walking Pathway",
                whyItMatters="Obstructed movement paths cause friction and disrupt comfortable circulation throughout the room.",
                recommendedAction="Reposition bulky secondary furniture against the solid north wall, ensuring a minimum 75cm clear walkway between entry and primary seating.",
                priority="High",
                difficulty="Easy",
                materialsNeeded=["Furniture moving sliders or felt floor protector pads"],
                estimatedCostRange="₹300 – ₹600",
            ),
            ImprovementSuggestionModel(
                id="sug-3",
                order=3,
                title="Install Vertical Storage to Free Up Floor Footprint",
                whyItMatters="Floor clutter significantly impacts mental clarity and makes compact rooms feel overcrowded.",
                recommendedAction="Mount two shallow floating wooden shelves above desk height for books and display items, keeping floor space unobstructed.",
                priority="Medium",
                difficulty="Moderate",
                materialsNeeded=["Floating wooden shelves (60cm x 15cm)", "Wall anchors & mounting brackets", "Hand drill or adhesive heavy-duty strips"],
                estimatedCostRange="₹1,500 – ₹3,200",
            ),
            ImprovementSuggestionModel(
                id="sug-4",
                order=4,
                title="Apply Acoustic Soft Furnishings & Window Drapes",
                whyItMatters="Bare walls and hard floors cause unwanted audio reverberation and echo, diminishing cozy comfort.",
                recommendedAction="Hang floor-length linen drapes 10cm above the window frame to create visual height and absorb environmental noise.",
                priority="Low",
                difficulty="Easy",
                materialsNeeded=["Curtain rod with finials", "Dual panel semi-opaque textured linen curtains"],
                estimatedCostRange="₹2,000 – ₹4,500",
            ),
        ]
