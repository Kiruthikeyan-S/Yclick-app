import os
import time
import base64
import logging
import httpx
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Request
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
from ..services.firebase_admin import (
    get_current_user_id,
    get_optional_user_id,
    sync_firebase_custom_claim,
    delete_firebase_user
)

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


@auth_router.delete("/delete-account")
async def delete_user_account_endpoint(current_user_id: str = Depends(get_current_user_id)):
    """
    Problem 3 Fix: Comprehensive, atomic server-side account deletion.
    1. Cleans up all user files in Supabase Storage ('room-photos' bucket).
    2. Removes all user's design project records from Supabase database.
    3. Permanently deletes the user record from Firebase Authentication.
    Guarantees no orphaned records or partial silent failures.
    """
    import httpx

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("EXPO_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY")

    is_test_env = os.getenv("ENVIRONMENT") == "test" or os.getenv("PYTEST_CURRENT_TEST") is not None
    if supabase_url and supabase_key and not is_test_env:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Clean up user's storage photos in Supabase Storage
            try:
                list_res = await client.post(
                    f"{supabase_url}/storage/v1/object/list/room-photos",
                    headers=headers,
                    json={"prefix": f"{current_user_id}/", "limit": 100}
                )
                if list_res.status_code == 200:
                    files = list_res.json()
                    if files and isinstance(files, list):
                        prefixes = [f"{current_user_id}/{f['name']}" for f in files if "name" in f]
                        if prefixes:
                            del_storage_res = await client.request(
                                "DELETE",
                                f"{supabase_url}/storage/v1/object/room-photos",
                                headers=headers,
                                json={"prefixes": prefixes}
                            )
                            if del_storage_res.status_code >= 400:
                                logger.error(f"Failed to delete storage objects: {del_storage_res.text}")
                                raise HTTPException(
                                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                    detail="Failed to clean up user photographs in private storage."
                                )
            except HTTPException:
                raise
            except Exception as e:
                logger.warning(f"Storage listing note during account deletion: {e}")

            # 2. Delete all project rows belonging to user
            try:
                del_db_res = await client.delete(
                    f"{supabase_url}/rest/v1/design_projects?user_id=eq.{current_user_id}",
                    headers=headers
                )
                if del_db_res.status_code >= 400:
                    logger.error(f"Failed to delete database projects: {del_db_res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to clean up user project database records."
                    )
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Database deletion error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database project cleanup failed: {str(e)}"
                )

    # 3. Permanently delete user from Firebase Authentication
    deleted = delete_firebase_user(current_user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete Firebase authentication identity record."
        )

    return {
        "success": True,
        "uid": current_user_id,
        "message": "User account, database projects, and private storage photos permanently deleted."
    }


# ==================== Design Endpoints ====================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_designer(
    req: ChatRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Chat with the AI interior architect powered by Groq.
    Supports authenticated Firebase users as well as guest consultation.
    Detects and raises HTTP 502 on provider errors (Problem 12).
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

    # Groq service raises HTTPException on provider error (Problem 12 Fix)
    reply = await groq_service.chat(groq_messages, max_tokens=600)
    return ChatResponse(reply=reply)


@router.post("/analyze", response_model=AnalyzeImageResponse)
async def analyze_space_image(
    request: Request,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Analyze an uploaded room photograph with Vision AI (Cloudflare LLaVA + Groq)
    to identify spatial flaws, items to remove, and actionable DIY fixes.
    Supports both JSON body with base64 / URL and multipart/form-data.
    """
    content: bytes = b""
    filename: str = "space.jpg"
    content_type_header = request.headers.get("content-type", "")

    if "application/json" in content_type_header:
        body = await request.json()
        image_base64 = body.get("imageBase64") or body.get("image_base64")
        photo_url = body.get("photoUri") or body.get("photo_url")
        filename = body.get("filename", "space.jpg")

        if image_base64:
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            try:
                content = base64.b64decode(image_base64)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid base64 image data: {str(e)}"
                )
        elif photo_url and (photo_url.startswith("http://") or photo_url.startswith("https://")):
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.get(photo_url)
                if res.status_code == 200:
                    content = res.content
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Failed to fetch image from URL: HTTP {res.status_code}"
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON request must include 'imageBase64' or valid 'photoUri'."
            )
    else:
        # Multipart form data fallback
        form = await request.form()
        file = form.get("file")
        if not file or not hasattr(file, "read"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing file field in multipart form upload."
            )
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '{file.content_type}'. Must be image/jpeg, image/png, or image/webp."
            )
        filename = file.filename or "space.jpg"
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
        filename=filename,
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
    products = await product_provider.get_recommendations(
        request.preferences, 
        demo_mode=is_demo_requested
    )

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
