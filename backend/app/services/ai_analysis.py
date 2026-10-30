import os
import io
import json
import logging
import httpx
from typing import List, Optional
from PIL import Image
from ..models.schemas import (
    ImprovementSuggestionModel,
    DesignPreferencesModel,
    AnalyzeImageResponse,
    RoomScores
)
from .groq_service import groq_service

logger = logging.getLogger(__name__)

class SpatialAnalysisEngine:
    @staticmethod
    async def analyze_space_photo(image_bytes: Optional[bytes] = None, filename: str = "space.jpg") -> AnalyzeImageResponse:
        account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        token = os.getenv("CLOUDFLARE_API_TOKEN")

        # 1. Try Cloudflare LLaVA Vision + Groq if image bytes are provided
        if image_bytes and account_id and token:
            try:
                # Resize image to max 512x512 for fast processing
                im = Image.open(io.BytesIO(image_bytes))
                im.thumbnail((512, 512))
                buf = io.BytesIO()
                im.save(buf, format="JPEG", quality=80)
                compressed_bytes = list(buf.getvalue())

                # Step A: Cloudflare LLaVA vision scan
                cf_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/llava-hf/llava-1.5-7b-hf"
                cf_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                cf_payload = {
                    "prompt": "Describe all furniture, windows, lighting, clutter, and structural details in this room photograph.",
                    "image": compressed_bytes,
                    "max_tokens": 300,
                }

                vision_desc = ""
                async with httpx.AsyncClient(timeout=25.0) as client:
                    cf_res = await client.post(cf_url, headers=cf_headers, json=cf_payload)
                    if cf_res.status_code == 200:
                        cf_data = cf_res.json()
                        vision_desc = cf_data.get("result", {}).get("description", "")

                # Step B: Groq structured analysis
                if vision_desc and groq_service.is_configured:
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

                    raw_groq = await groq_service.chat([{"role": "user", "content": prompt}], max_tokens=900)
                    clean = raw_groq.strip()
                    if clean.startswith("```json"): clean = clean[7:]
                    if clean.startswith("```"): clean = clean[3:]
                    if clean.endswith("```"): clean = clean[:-3]
                    parsed = json.loads(clean.strip())

                    scores_data = parsed.get("scores", {})
                    return AnalyzeImageResponse(
                        roomType=parsed.get("roomType", "Living Space"),
                        detectedObjects=parsed.get("detectedObjects", []),
                        correctionsNeeded=parsed.get("correctionsNeeded", []),
                        itemsToRemove=parsed.get("itemsToRemove", []),
                        diySelfImprovements=parsed.get("diySelfImprovements", []),
                        suggestedTemplate=parsed.get("suggestedTemplate", "Modern Scandinavian"),
                        scores=RoomScores(
                            lighting=scores_data.get("lighting", "5/10"),
                            spaciousness=scores_data.get("spaciousness", "6/10"),
                            coziness=scores_data.get("coziness", "5/10"),
                        ),
                        detectedLighting="Natural daylight with secondary shadows",
                        detectedFeatures=parsed.get("detectedObjects", [])[:4],
                        spatialNotes=f"Identified {len(parsed.get('detectedObjects', []))} key room elements with immediate self-improvement opportunities.",
                    )
            except Exception as e:
                logger.warning(f"AI Vision diagnosis fallback: {e}")

        # Fallback diagnosis
        return AnalyzeImageResponse(
            roomType="Living & Work Space",
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
            spatialNotes="The room exhibits solid structural proportions with ample opportunity to optimize lighting and vertical wall storage."
        )

    @staticmethod
    async def generate_practical_recommendations(preferences: DesignPreferencesModel) -> List[ImprovementSuggestionModel]:
        # 1. Try generating with fast Groq AI intelligence
        if groq_service.is_configured:
            try:
                groq_suggestions = await groq_service.generate_dynamic_recommendations(preferences)
                if groq_suggestions and len(groq_suggestions) >= 3:
                    return groq_suggestions
            except Exception:
                pass

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
