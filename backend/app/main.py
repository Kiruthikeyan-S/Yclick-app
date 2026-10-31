import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from .api.endpoints import router as design_router, auth_router

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate backend environment configuration on startup."""
    cf_account = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    cf_token = os.getenv("CLOUDFLARE_API_TOKEN")
    groq_key = os.getenv("GROQ_API_KEY")

    if not (cf_account and cf_token and cf_token.startswith("cfut_")):
        print("[YClick Backend] Cloudflare Workers AI credentials missing or unconfigured.")
    else:
        print("[YClick Backend] Cloudflare Workers AI verified.")

    if not (groq_key and groq_key.startswith("gsk_")):
        print("[YClick Backend] Groq LPU API credentials missing or unconfigured.")
    else:
        print("[YClick Backend] Groq LPU API verified.")
    yield

app = FastAPI(
    title="YClick AI Backend",
    description="FastAPI service for spatial analysis, AI image-to-image redesign, and practical improvement reports.",
    version="1.0.0",
    lifespan=lifespan
)

# Mount static directory for generated images
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(os.path.join(static_dir, "generated"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# CORS configuration
raw_origins = os.getenv("CORS_ORIGINS", "*").split(",")
origins = [o.strip() for o in raw_origins if o.strip()]
is_wildcard = origins == ["*"] or not origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,  # Spec requires allow_credentials=False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(design_router)

@app.get("/health")
def health_check():
    """Health check endpoint for mobile client connectivity verification (public)."""
    cf_ready = bool(os.getenv("CLOUDFLARE_ACCOUNT_ID") and os.getenv("CLOUDFLARE_API_TOKEN"))
    groq_ready = bool(os.getenv("GROQ_API_KEY", "").startswith("gsk_"))
    
    return {
        "status": "ok",
        "service": "YClick Backend",
        "version": "1.0.0",
        "ai_vision_ready": cf_ready,
        "ai_chat_ready": groq_ready,
        "ai_provider": "cloudflare" if cf_ready else "mock",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
