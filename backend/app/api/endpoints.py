import os
import time
import logging
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel, Field

from ..models.schemas import (
    GenerateDesignRequest,
    GenerateDesignResponse,
    AnalyzeImageResponse,
    ImprovementSuggestionModel,
    ProductRecommendationModel,
    DesignPreferencesModel
)
from ..services.image_provider import get_image_provider
from ..services.product_provider import get_product_provider
from ..services.ai_analysis import SpatialAnalysisEngine
from ..services.groq_service import groq_service
from ..services.firebase_admin import get_current_user_id, sync_firebase_custom_claim

logger = logging.getLogger(__name__)

# Constants
MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Routers
router = APIRouter(prefix="/api/designs", tags=["designs"])
auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    roomContext: str = ""

class ChatResponse(BaseModel):
    reply: str
    provider: str = "groq-oss-120b"


# ==================== Auth Endpoints ====================

@auth_router.post("/sync-claims")
async def sync_custom_claims_endpoint(current_user_id: str = Depends(get_current_user_id)):
    """
    Ensure the authenticated Firebase user has the 'role: authenticated' claim
    required by Supabase Postgres RLS policies, preserving all existing claims.
    """
    claims = sync_firebase_custom_claim(current_user_id, claim_key="role", claim_value="authenticated")
    return {
        "success": True,
        "uid": current_user_id,
        "claims": claims,
        "message": "Custom claims synchronized successfully. Refresh ID token on client."
    }


# ==================== Design Endpoints ====================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_designer(
    req: ChatRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Chat with the AI interior architect powered by Groq.
    Requires authenticated Firebase user session.
    """
    system_prompt = (
        "You are YClick's Senior Interior Architect and Spatial Designer. "
        "You provide actionable, budget-conscious, aesthetic interior advice for Indian homes and modern spaces. "
        "Keep your tone encouraging, sophisticated, and practical with measurements and lighting temperatures (e.g. 3000K warm white)."
    )
    if req.roomContext:
        system_prompt += f"\nCurrent Room Context: {req.roomContext}"

    groq_messages = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        groq_messages.append({"role": m.role, "content": m.content})

    reply = await groq_service.chat(groq_messages, max_tokens=600)
    return ChatResponse(reply=reply)


@router.post("/analyze", response_model=AnalyzeImageResponse)
async def analyze_space_image(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Analyze an uploaded room photograph with Vision AI (Cloudflare LLaVA + Groq)
    to identify spatial flaws, items to remove, and actionable DIY fixes.
    Requires authenticated Firebase user session.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Must be image/jpeg, image/png, or image/webp."
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty."
        )

    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 15MB (received {len(content)} bytes)."
        )

    demo_mode = os.getenv("ALLOW_DEMO_MODE", "false").lower() in ("true", "1")
    analysis = await SpatialAnalysisEngine.analyze_space_photo(
        image_bytes=content,
        filename=file.filename or "space.jpg",
        demo_mode=demo_mode
    )
    return analysis


@router.post("/generate", response_model=GenerateDesignResponse)
async def generate_designs(
    request: GenerateDesignRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Generate 3 distinct design tiers (Budget Refresh, Balanced Makeover, Premium Redesign)
    transforming the uploaded room photograph using image-to-image AI.
    Derives authenticated user identity securely from verified Firebase ID token.
    """
    # Reject mismatched user IDs with HTTP 403 Forbidden
    if request.userId and request.userId != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Requested userId '{request.userId}' does not match authenticated token UID '{current_user_id}'."
        )

    # Derive authenticated user ID strictly from the verified bearer token
    request.userId = current_user_id

    if not request.preferences.photoUri:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="photoUri is required to generate design alternatives."
        )

    if not request.preferences.consentGiven:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Explicit user consent is mandatory for AI photo processing."
        )

    is_demo_requested = bool(request.demoMode)
    image_provider = get_image_provider(demo_mode=is_demo_requested)
    product_provider = get_product_provider()

    # 1. Generate the 3 design tiers (image-to-image)
    variants = await image_provider.generate_variants(
        request.preferences,
        demo_mode=is_demo_requested
    )

    # 2. Generate prioritized improvement recommendations
    suggestions = await SpatialAnalysisEngine.generate_practical_recommendations(request.preferences)

    # 3. Retrieve matching product recommendations
    products = await product_provider.get_recommendations(request.preferences)

    project_id = f"proj-{int(time.time())}"
    is_demo = getattr(image_provider, "is_demo", is_demo_requested)

    return GenerateDesignResponse(
        success=True,
        projectId=project_id,
        variants=variants,
        suggestions=suggestions,
        products=products,
        isDemo=is_demo,
        message="3 distinct design alternatives generated successfully."
    )
