import os
import time
import base64
import logging
import asyncio
import httpx
from dotenv import load_dotenv
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from ..models.schemas import DesignVariantModel, DesignPreferencesModel

load_dotenv()
logger = logging.getLogger(__name__)

class BaseImageProvider(ABC):
    @abstractmethod
    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        """Generate three distinct design tiers: Budget, Balanced, and Premium"""
        pass

class MockImageProvider(BaseImageProvider):
    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        return [
            DesignVariantModel(
                id="var-budget",
                type="Budget Refresh",
                title=f"{preferences.style} Budget Refresh",
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
                title=f"{preferences.style} Balanced Makeover",
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
                title=f"{preferences.style} Premium Redesign",
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

class CloudflareImageProvider(BaseImageProvider):
    def __init__(self, account_id: str, api_token: str):
        self.account_id = account_id
        self.api_token = api_token
        self.model = "@cf/black-forest-labs/flux-1-schnell"
        self.url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{self.model}"
        self.static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "generated")
        os.makedirs(self.static_dir, exist_ok=True)

    async def _generate_single_image(self, prompt: str, tier_id: str) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
        payload = {"prompt": prompt}

        try:
            async with httpx.AsyncClient(timeout=35.0) as client:
                res = await client.post(self.url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    if "result" in data and "image" in data["result"]:
                        b64_image = data["result"]["image"]
                        # Save copy to static folder on disk
                        filename = f"{tier_id}_{int(time.time())}.jpg"
                        filepath = os.path.join(self.static_dir, filename)
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(b64_image))
                        
                        # Return base64 data URI for instant, reliable mobile display
                        return f"data:image/jpeg;base64,{b64_image}"
                else:
                    logger.error(f"Cloudflare Workers AI returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Cloudflare Workers AI exception: {e}")
        return None

    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        room_name = preferences.subcategoryId.replace("-", " ").title()
        style_name = preferences.style
        kept = ", ".join(preferences.itemsToKeep) if preferences.itemsToKeep else "existing room layout"

        # Construct specific architectural prompts for each tier
        prompts = [
            (
                "var-budget",
                f"Interior architectural photography of a {style_name} {room_name}, budget refresh makeover, keeping {kept}, soft warm 3000K diffused lighting, clean organized layout, high resolution 4k",
            ),
            (
                "var-balanced",
                f"Professional interior design photography of a {style_name} {room_name}, balanced modern makeover with stylish sage accent wall, modular floating wooden shelves, comfortable seating, warm lighting, cozy atmosphere, architectural digest style 4k",
            ),
            (
                "var-premium",
                f"Luxury architectural design of a high-end {style_name} {room_name}, premium fluted oak wood panels, bespoke designer furniture, concealed warm LED strip lighting, marble textures, minimalist elegance, 8k resolution masterwork",
            ),
        ]

        # Generate all 3 images concurrently via Cloudflare Workers AI
        tasks = [self._generate_single_image(p, tier_id) for tier_id, p in prompts]
        generated_images = await asyncio.gather(*tasks)

        # Baseline fallback templates
        mock_provider = MockImageProvider()
        defaults = await mock_provider.generate_variants(preferences)

        # Replace image URLs with real Cloudflare generated images
        for i, gen_img in enumerate(generated_images):
            if gen_img:
                defaults[i].imageUrl = gen_img

        return defaults

def get_image_provider() -> BaseImageProvider:
    cf_account = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    cf_token = os.getenv("CLOUDFLARE_API_TOKEN")

    if cf_account and cf_token and cf_token.startswith("cfut_"):
        return CloudflareImageProvider(account_id=cf_account, api_token=cf_token)

    return MockImageProvider()
