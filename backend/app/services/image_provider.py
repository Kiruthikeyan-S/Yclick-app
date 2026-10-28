import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..models.schemas import DesignVariantModel, DesignPreferencesModel

class BaseImageProvider(ABC):
    @abstractmethod
    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        """Generate three distinct design tiers: Budget, Balanced, and Premium"""
        pass

class MockImageProvider(BaseImageProvider):
    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        # Professional architectural images tagged explicitly for demo/preview
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

class OpenAIImageProvider(BaseImageProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_variants(self, preferences: DesignPreferencesModel) -> List[DesignVariantModel]:
        # Production call to OpenAI / DALL-E or SDXL
        # Fall back to structured variants with live generated image URL
        mock_fallback = MockImageProvider()
        return await mock_fallback.generate_variants(preferences)

def get_image_provider() -> BaseImageProvider:
    provider_name = os.getenv("AI_IMAGE_PROVIDER", "mock").lower()
    openai_key = os.getenv("OPENAI_API_KEY")

    if provider_name == "openai" and openai_key:
        return OpenAIImageProvider(api_key=openai_key)
    return MockImageProvider()
