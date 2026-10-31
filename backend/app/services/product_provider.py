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
        # Problem 9 Fix: Default demo products to disabled (ALLOW_DEMO_PRODUCTS defaults to false)
        allow_demo = demo_mode or os.getenv("ALLOW_DEMO_PRODUCTS", "false").lower() in ("true", "1")
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
                productUrl="",  # Problem 9 Fix: No fake merchant links
                isEssential=True,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="ref-prod-2",
                name="Natural Braided Jute Area Rug (120x180cm)",
                category="Decoration",
                imageUrl="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80",
                reason="Defines the central activity zone while introducing natural organic texture.",
                price=3200.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",
                isEssential=False,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="ref-prod-3",
                name="Floating Natural Oak Wall Display Shelf (Set of 2)",
                category="Storage",
                imageUrl="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80",
                reason="Recovers vertical storage capacity without encroaching on floor circulation space.",
                price=1850.0,
                currency="₹",
                merchant="Design Specification Reference",
                productUrl="",
                isEssential=True,
                isDemo=True,
            ),
        ]

def get_product_provider() -> BaseProductProvider:
    product_api_key = os.getenv("PRODUCT_API_KEY")
    if product_api_key and not product_api_key.startswith("your_"):
        return RealProductApiProvider(api_key=product_api_key)
    return CuratedReferenceProductProvider()
