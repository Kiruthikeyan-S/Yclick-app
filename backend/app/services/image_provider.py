import os
import io
import time
import base64
import logging
import asyncio
import httpx
from PIL import Image, ImageDraw, ImageOps
from dotenv import load_dotenv
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from ..models.schemas import DesignVariantModel, DesignPreferencesModel

load_dotenv()
logger = logging.getLogger(__name__)

class BaseImageProvider(ABC):
    is_demo: bool = False

    @abstractmethod
    async def generate_variants(
        self, 
        preferences: DesignPreferencesModel, 
        original_image_bytes: Optional[bytes] = None,
        demo_mode: bool = False
    ) -> List[DesignVariantModel]:
        """Generate three distinct design tiers transforming the original room photograph."""
        pass

class MockImageProvider(BaseImageProvider):
    is_demo: bool = True

    async def generate_variants(
        self, 
        preferences: DesignPreferencesModel, 
        original_image_bytes: Optional[bytes] = None,
        demo_mode: bool = True
    ) -> List[DesignVariantModel]:
        return [
            DesignVariantModel(
                id="var-budget",
                type="Budget Refresh",
                title=f"{preferences.style} Budget Refresh (Demo)",
                imageUrl="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
                summary="Rearranges layout, enhances diffused lighting, and introduces natural textiles without replacing main furniture.",
                proposedChanges=[
                    "Shift primary seating towards natural window daylight",
                    "Add warm 3000K ambient floor uplighting in shadowed corners",
                    "Introduce textured linen curtains to reduce glare",
                    "Place a natural woven jute rug to define the central area",
                ],
                estimatedBudgetRange="₹3,500 – ₹6,000",
                itemsPreserved=preferences.itemsToKeep if preferences.itemsToKeep else ["Existing furniture", "Flooring", "Doors & Windows"],
                pros=["Extremely cost effective", "Non-invasive, no drilling needed", "Completed in 1 day"],
                limitations=["Retains old furniture profiles", "No built-in storage additions"],
            ),
            DesignVariantModel(
                id="var-balanced",
                type="Balanced Makeover",
                title=f"{preferences.style} Balanced Makeover (Demo)",
                imageUrl="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80",
                summary="Refreshes focal walls with warm earthy sage tones, modular vertical open shelving, and ergonomic seating upgrades.",
                proposedChanges=[
                    "Paint an earthy sage accent wall behind main focal zone",
                    "Mount modular floating timber shelves for vertical storage",
                    "Upgrade ceiling light to a diffused warm pendant lamp",
                    "Incorporate an ergonomic curved accent lounge chair",
                ],
                estimatedBudgetRange="₹12,000 – ₹18,000",
                itemsPreserved=["Primary room boundary", "Flooring", "Windows"],
                pros=["Significant aesthetic transformation", "Substantially improved organization", "High ROI"],
                limitations=["Requires painting work and wall bracket mounting"],
            ),
            DesignVariantModel(
                id="var-premium",
                type="Premium Redesign",
                title=f"{preferences.style} Premium Redesign (Demo)",
                imageUrl="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80",
                summary="High-end architectural transformation with fluted acoustic timber wall cladding, bespoke storage, and layered smart dimming.",
                proposedChanges=[
                    "Install fluted acoustic oak wall panels with concealed warm LED channels",
                    "Commission bespoke solid oak desk and ergonomic executive seating",
                    "Refinish perimeter lighting with dual-zone smart dimmer controls",
                    "Introduce integrated concealed storage cabinetry with brushed brass hardware",
                ],
                estimatedBudgetRange="₹35,000 – ₹55,000",
                itemsPreserved=["Core room boundary and perimeter walls"],
                pros=["Luxury boutique finish", "Maximum space optimization", "Longest lasting materials"],
                limitations=["Higher upfront capital", "Requires licensed carpenter & electrician assistance"],
            ),
        ]

class CloudflareInpaintingImageToImageProvider(BaseImageProvider):
    """
    Cloudflare Workers AI Image-to-Image provider using runwayml/stable-diffusion-v1-5-inpainting.
    Preserves original photograph proportions without squishing/stretching,
    generates contextual inpainting masks that protect preserved items (doors, windows, flooring),
    and transforms room aesthetics into 3 distinct spatial tiers.
    """
    is_demo: bool = False

    def __init__(self, account_id: str, api_token: str):
        self.account_id = account_id
        self.api_token = api_token
        self.model = "@cf/runwayml/stable-diffusion-v1-5-inpainting"
        self.url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{self.model}"
        self.static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "generated")
        os.makedirs(self.static_dir, exist_ok=True)

    async def _transform_room_image(
        self, 
        image_bytes: bytes, 
        prompt: str, 
        strength: float = 0.65,
        tier_id: str = "variant",
        items_to_keep: List[str] = None
    ) -> Optional[str]:
        # 1. Open and preserve original aspect ratio
        im = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        orig_w, orig_h = im.size

        # Fit within 512x512 maintaining aspect ratio (Problem 6 Fix)
        thumb = im.copy()
        thumb.thumbnail((512, 512), Image.Resampling.LANCZOS)
        thumb_w, thumb_h = thumb.size

        # Pad into standard 512x512 canvas for the inpainting model
        padded_im = Image.new("RGB", (512, 512), (0, 0, 0))
        offset_x = (512 - thumb_w) // 2
        offset_y = (512 - thumb_h) // 2
        padded_im.paste(thumb, (offset_x, offset_y))

        buf = io.BytesIO()
        padded_im.save(buf, format="JPEG", quality=85)
        raw_image_ints = list(buf.getvalue())

        # 2. Contextual Inpainting Mask (Problem 6 Fix)
        # Background padding is 0 (unmodified)
        mask_im = Image.new("L", (512, 512), 0)
        draw = ImageDraw.Draw(mask_im)

        # Base editable strength across active room area
        base_val = int(strength * 255)
        draw.rectangle([offset_x, offset_y, offset_x + thumb_w, offset_y + thumb_h], fill=base_val)

        # Preserve structural items based on user preferences
        items_lower = [it.lower() for it in (items_to_keep or [])]

        # Preserve windows & doors (keep perimeter frame boundaries at 0 mask)
        if any("window" in it or "door" in it for it in items_lower):
            # Upper-left and upper-right window perimeter zones
            draw.rectangle([offset_x, offset_y, offset_x + int(thumb_w * 0.15), offset_y + int(thumb_h * 0.70)], fill=0)
            draw.rectangle([offset_x + int(thumb_w * 0.85), offset_y, offset_x + thumb_w, offset_y + int(thumb_h * 0.70)], fill=0)

        # Preserve existing flooring
        if any("floor" in it for it in items_lower):
            draw.rectangle([offset_x, offset_y + int(thumb_h * 0.78), offset_x + thumb_w, offset_y + thumb_h], fill=0)

        mask_buf = io.BytesIO()
        mask_im.save(mask_buf, format="PNG")
        mask_ints = list(mask_buf.getvalue())

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": prompt,
            "negative_prompt": "blurry, distorted walls, chaotic, deformed geometry, unrealistic architecture, low resolution",
            "image": raw_image_ints,
            "mask": mask_ints,
            "guidance": 7.5,
            "num_steps": 20,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(self.url, headers=headers, json=payload)
                if res.status_code == 200:
                    raw_bytes = res.content
                    if len(raw_bytes) > 1000:
                        gen_img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
                        # Crop out the letterbox padding to preserve user's exact original aspect ratio
                        cropped_gen = gen_img.crop((offset_x, offset_y, offset_x + thumb_w, offset_y + thumb_h))
                        final_im = cropped_gen.resize((orig_w, orig_h), Image.Resampling.LANCZOS)
                        
                        out_buf = io.BytesIO()
                        final_im.save(out_buf, format="JPEG", quality=85)
                        final_bytes = out_buf.getvalue()

                        # Save disk cache
                        filename = f"{tier_id}_{int(time.time())}.jpg"
                        filepath = os.path.join(self.static_dir, filename)
                        with open(filepath, "wb") as f:
                            f.write(final_bytes)

                        b64 = base64.b64encode(final_bytes).decode("utf-8")
                        return f"data:image/jpeg;base64,{b64}"
                else:
                    logger.error(f"Cloudflare inpainting failed ({res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Cloudflare inpainting exception: {e}")
        return None

    async def generate_variants(
        self, 
        preferences: DesignPreferencesModel, 
        original_image_bytes: Optional[bytes] = None,
        demo_mode: bool = False
    ) -> List[DesignVariantModel]:
        room_name = preferences.subcategoryId.replace("-", " ").title()
        style_name = preferences.style
        kept = ", ".join(preferences.itemsToKeep) if preferences.itemsToKeep else "main wall positions and windows"

        # If no raw bytes passed, download from photoUri
        if not original_image_bytes and preferences.photoUri.startswith("http"):
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    img_res = await client.get(preferences.photoUri)
                    if img_res.status_code == 200:
                        original_image_bytes = img_res.content
            except Exception as e:
                logger.warning(f"Could not retrieve photoUri for img2img: {e}")

        # If image bytes unavailable:
        if not original_image_bytes:
            if demo_mode:
                mock_provider = MockImageProvider()
                return await mock_provider.generate_variants(preferences, demo_mode=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid uploaded room photograph is required to perform image-to-image spatial transformation."
            )

        prompts = [
            (
                "var-budget",
                f"Interior photography of this exact {room_name}, maintaining room perspective and {kept}, budget styling with warm 3000K diffused uplighting, fresh organic textiles, decluttered clean floor",
                0.55,
            ),
            (
                "var-balanced",
                f"Interior architectural redesign of this exact {room_name}, maintaining perspective, stylish {style_name} makeover, refined accent focal wall, modular floating oak shelves, warm layered lighting",
                0.68,
            ),
            (
                "var-premium",
                f"Luxury architectural transformation of this exact {room_name}, maintaining perspective, bespoke {style_name} design, fluted acoustic timber wall cladding, recessed warm architectural LED channels, high-end bespoke finish",
                0.80,
            ),
        ]

        # Concurrently transform the room image into the 3 tiers
        tasks = [
            self._transform_room_image(original_image_bytes, p, strength, tier_id, preferences.itemsToKeep)
            for tier_id, p, strength in prompts
        ]
        results = await asyncio.gather(*tasks)

        # Problem 3 Fix: If real AI inpainting fails and not in demo mode, fail honestly
        successful_gens = [r for r in results if r is not None]
        if len(successful_gens) == 0:
            if demo_mode:
                mock_provider = MockImageProvider()
                return await mock_provider.generate_variants(preferences, demo_mode=True)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI image-to-image provider could not synthesize room variants from the uploaded photo."
            )

        # Build variants with generated image outputs
        mock_provider = MockImageProvider()
        variants = await mock_provider.generate_variants(preferences, demo_mode=False)

        for i, gen_uri in enumerate(results):
            if gen_uri:
                variants[i].imageUrl = gen_uri
                variants[i].title = variants[i].title.replace(" (Demo)", "")

        return variants

def get_image_provider(demo_mode: bool = False) -> BaseImageProvider:
    cf_account = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    cf_token = os.getenv("CLOUDFLARE_API_TOKEN")

    if cf_account and cf_token and cf_token.startswith("cfut_"):
        return CloudflareInpaintingImageToImageProvider(account_id=cf_account, api_token=cf_token)

    # Problem 3 Fix: ALLOW_DEMO_MODE defaults to false
    is_demo_allowed = demo_mode or os.getenv("ALLOW_DEMO_MODE", "false").lower() in ("true", "1")
    if is_demo_allowed:
        return MockImageProvider()

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="No image-to-image provider is configured. Please supply CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN with Workers AI permissions."
    )
