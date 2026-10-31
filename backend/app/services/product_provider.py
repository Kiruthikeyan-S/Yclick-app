import os
from abc import ABC, abstractmethod
from typing import List
from ..models.schemas import ProductRecommendationModel, DesignPreferencesModel

class BaseProductProvider(ABC):
    @abstractmethod
    async def get_recommendations(self, preferences: DesignPreferencesModel, demo_mode: bool = False) -> List[ProductRecommendationModel]:
        pass

class RealProductApiProvider(BaseProductProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def get_recommendations(self, preferences: DesignPreferencesModel, demo_mode: bool = False) -> List[ProductRecommendationModel]:
        # Connect to a real commercial merchant affiliate API (e.g. Amazon PA-API, Pepperfry, or IKEA)
        # When not configured with real product catalog endpoints, returns empty list
        return []

class CuratedReferenceProductProvider(BaseProductProvider):
    """
    Curated reference interior items for architectural specification.
    Does NOT use fake purchase links or invent unverified merchants.
    """
    async def get_recommendations(self, preferences: DesignPreferencesModel, demo_mode: bool = False) -> List[ProductRecommendationModel]:
        # If not explicitly in demo mode or reference mode, do not inject unverified products
        allow_demo = demo_mode or os.getenv("ALLOW_DEMO_PRODUCTS", "true").lower() == "true"
        if not allow_demo:
            return []

        return [
            ProductRecommendationModel(
                id="ref-prod-1",
                name="Nordic Minimalist Standing Floor Lamp (3000K Warm White)",
                category="Lighting",
                imageUrl="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
                reason="Provides warm diffused 3000K uplighting to brighten dark corners without harsh glare.",
                price=2499.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",  # No fake links
                isEssential=True,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="ref-prod-2",
                name="Natural Braided Jute Area Rug (120x180cm)",
                category="Decoration",
                imageUrl="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80",
                reason="Defines the central activity zone while introducing natural organic texture.",
                price=1850.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",  # No fake links
                isEssential=False,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="ref-prod-3",
                name="Solid Pine Wall-Mounted Floating Shelf (2-pack)",
                category="Storage",
                imageUrl="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80",
                reason="Adds vertical display space without consuming precious floor footprint.",
                price=999.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",  # No fake links
                isEssential=True,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="ref-prod-4",
                name="Textured Semi-Sheer Linen Window Drapes (Pair)",
                category="Curtains",
                imageUrl="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
                reason="Softens harsh daylight and reduces ambient acoustic reverberation.",
                price=1450.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",  # No fake links
                isEssential=False,
                isDemo=True,
            ),
        ]

def get_product_provider() -> BaseProductProvider:
    provider_type = os.getenv("PRODUCT_PROVIDER", "curated_reference").lower()
    api_key = os.getenv("PRODUCT_API_KEY")

    if provider_type == "commercial" and api_key:
        return RealProductApiProvider(api_key=api_key)

    return CuratedReferenceProductProvider()
