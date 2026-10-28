import time
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..models.schemas import (
    GenerateDesignRequest,
    GenerateDesignResponse,
    AnalyzeImageResponse,
    ProductRecommendationModel
)
from ..services.image_provider import get_image_provider
from ..services.product_provider import get_product_provider
from ..services.ai_analysis import SpatialAnalysisEngine

router = APIRouter(prefix="/api/designs", tags=["designs"])

@router.post("/analyze", response_model=AnalyzeImageResponse)
async def analyze_space_image(file: UploadFile = File(...)):
    """Analyze an uploaded room/space photograph to identify geometry, light sources, and features."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format (JPEG/PNG/WEBP)")
    
    analysis = SpatialAnalysisEngine.analyze_space_photo(file.filename or "space.jpg")
    return analysis

@router.post("/generate", response_model=GenerateDesignResponse)
async def generate_designs(request: GenerateDesignRequest):
    """Generate 3 distinct design tiers (Budget, Balanced, Premium) with practical improvement suggestions."""
    if not request.preferences.photoUri:
        raise HTTPException(status_code=400, detail="photoUri is required to generate design alternatives")
    
    if not request.preferences.consentGiven:
        raise HTTPException(status_code=400, detail="Explicit user consent is mandatory for AI photo processing")

    image_provider = get_image_provider()
    product_provider = get_product_provider()

    # 1. Generate the 3 design tiers
    variants = await image_provider.generate_variants(request.preferences)

    # 2. Generate prioritized improvement recommendations
    suggestions = SpatialAnalysisEngine.generate_practical_recommendations(request.preferences)

    # 3. Retrieve matching product recommendations
    products = await product_provider.get_recommendations(request.preferences)

    project_id = f"proj-{int(time.time())}"

    return GenerateDesignResponse(
        success=True,
        projectId=project_id,
        variants=variants,
        suggestions=suggestions,
        products=products,
        isDemo=True,
        message="3 distinct design alternatives generated successfully."
    )
