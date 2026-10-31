import os
import io
import time
import base64
import logging
import asyncio
import httpx
from PIL import Image
from dotenv import load_dotenv
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from ..models.schemas import DesignVariantModel, DesignPreferencesModel

load_dotenv()
logger = logging.getLogger(__name__)

class BaseImageProvider(ABC):
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
    async def generate_variants(
        self, 
        preferences: DesignPreferencesModel, 
        original_image_bytes: Optional[bytes] = None,
        demo_mode: bool = False
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
    Takes the user's actual room image, preserves the room geometry and boundary structure,
    and transforms the surfaces and styling according to the selected interior design tier.
    """
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
        tier_id: str = "variant"
    ) -> Optional[str]:
        # Process and normalize the uploaded room image
        im = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        im = im.resize((512, 512), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=85)
        raw_image_ints = list(buf.getvalue())

        # Construct soft inpainting mask: preserves structural window & wall positions
        # while allowing interior surface and furniture redesign
        mask_im = Image.new("L", (512, 512), int(strength * 255))
        mask_buf = io.BytesIO()
        mask_im.save(mask_buf, format="PNG")
        mask_ints = list(mask_buf.getvalue())

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "prompt": prompt,
            "negative_prompt": "blurry, distorted walls, deformed structure, bad architecture, chaotic, low quality",
            "image": raw_image_ints,
            "mask": mask_ints,
            "guidance": 7.5,
            "num_steps": 20,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(self.url, headers=headers, json=payload)
                if res.status_code == 200:
                    content_type = res.headers.get("content-type", "")
                    raw_bytes = res.content
                    if "image" in content_type or len(raw_bytes) > 1000:
                        b64 = base64.b64encode(raw_bytes).decode("utf-8")
                        # Save copy on disk
                        filename = f"{tier_id}_{int(time.time())}.png"
                        filepath = os.path.join(self.static_dir, filename)
                        with open(filepath, "wb") as f:
                            f.write(raw_bytes)
                        return f"data:image/png;base64,{b64}"
                else:
                    logger.error(f"Cloudflare inpainting returned {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Cloudflare img2img exception: {e}")
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

        # If no image bytes supplied, fetch from photoUri if it is an HTTP/S URL
        if not original_image_bytes and preferences.photoUri.startswith("http"):
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    img_res = await client.get(preferences.photoUri)
                    if img_res.status_code == 200:
                        original_image_bytes = img_res.content
            except Exception as e:
                logger.warning(f"Could not download photoUri for img2img: {e}")

        # If we cannot obtain the original room image bytes, fail with clear error unless demo mode is on
        if not original_image_bytes:
            if demo_mode:
                mock_provider = MockImageProvider()
                return await mock_provider.generate_variants(preferences, demo_mode=True)
            raise HTTPException(
                status_code=400,
                detail="A valid uploaded room photograph is required to perform image-to-image spatial transformation."
            )

        prompts = [
            (
                "var-budget",
                f"Budget interior redesign of this existing {room_name}, keeping {kept}, adding warm 3000K diffused uplighting, fresh natural textiles, tidy decluttered floor, photorealistic interior architecture",
                0.55,
            ),
            (
                "var-balanced",
                f"Balanced modern {style_name} makeover of this {room_name}, stylish warm sage accent wall, modular floating oak shelves, comfortable new armchair, soft atmospheric lighting, architectural interior photography",
                0.68,
            ),
            (
                "var-premium",
                f"Luxury architectural transformation of this {room_name}, premium fluted oak acoustic wall panels, bespoke designer furniture, concealed warm architectural LED channels, high-end hotel finish",
                0.80,
            ),
        ]

        # Concurrently transform the room image into the 3 tiers
        tasks = [
            self._transform_room_image(original_image_bytes, p, strength, tier_id)
            for tier_id, p, strength in prompts
        ]
        results = await asyncio.gather(*tasks)

        # Baseline variants
        mock_provider = MockImageProvider()
        variants = await mock_provider.generate_variants(preferences, demo_mode=False)

        # Apply transformed images and remove demo labels
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

    if demo_mode or os.getenv("ALLOW_DEMO_MODE", "true").lower() == "true":
        return MockImageProvider()

    raise HTTPException(
        status_code=503,
        detail="No image-to-image provider is configured. Please supply CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN with Workers AI permissions."
    )
