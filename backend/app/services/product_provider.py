import os
from abc import ABC, abstractmethod
from typing import List
from ..models.schemas import ProductRecommendationModel, DesignPreferencesModel

class BaseProductProvider(ABC):
    @abstractmethod
    async def get_recommendations(self, preferences: DesignPreferencesModel) -> List[ProductRecommendationModel]:
        pass

class CuratedCatalogProductProvider(BaseProductProvider):
    async def get_recommendations(self, preferences: DesignPreferencesModel) -> List[ProductRecommendationModel]:
        return [
            ProductRecommendationModel(
                id="prod-1",
                name="Nordic Minimalist Standing Floor Lamp",
                category="Lighting",
                imageUrl="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
                reason="Provides warm diffused 3000K uplighting to brighten dark corners without glare.",
                price=2499.0,
                currency="₹",
                merchant="Verified Interior Catalog (Demo)",
                productUrl="https://example.com/products/nordic-floor-lamp",
                isEssential=True,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="prod-2",
                name="Natural Braided Jute Area Rug (120x180cm)",
                category="Decoration",
                imageUrl="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80",
                reason="Defines the central activity zone while introducing natural organic texture.",
                price=1850.0,
                currency="₹",
                merchant="Verified Interior Catalog (Demo)",
                productUrl="https://example.com/products/braided-jute-rug",
                isEssential=False,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="prod-3",
                name="Solid Pine Wall-Mounted Floating Shelf",
                category="Storage",
                imageUrl="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=600&q=80",
                reason="Adds vertical display space without consuming precious floor footprint.",
                price=999.0,
                currency="₹",
                merchant="Verified Interior Catalog (Demo)",
                productUrl="https://example.com/products/pine-floating-shelf",
                isEssential=True,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="prod-4",
                name="Textured Linen Blend Window Curtains (Pair)",
                category="Curtains",
                imageUrl="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
                reason="Softens harsh daylight and reduces ambient acoustic echoes.",
                price=1450.0,
                currency="₹",
                merchant="Verified Interior Catalog (Demo)",
                productUrl="https://example.com/products/linen-curtains",
                isEssential=False,
                isDemo=True,
            ),
            ProductRecommendationModel(
                id="prod-5",
                name="Ergonomic Curved Accent Lounge Chair",
                category="Furniture",
                imageUrl="https://images.unsplash.com/photo-1580481077197-04664a7810df?auto=format&fit=crop&w=600&q=80",
                reason="Compact ergonomic seating that preserves open movement pathways.",
                price=6800.0,
                currency="₹",
                merchant="Verified Interior Catalog (Demo)",
                productUrl="https://example.com/products/accent-chair",
                isEssential=False,
                isDemo=True,
            ),
        ]

def get_product_provider() -> BaseProductProvider:
    return CuratedCatalogProductProvider()
