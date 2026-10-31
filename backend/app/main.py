import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from .api.endpoints import router as design_router, auth_router

load_dotenv()

app = FastAPI(
    title="YClick AI Backend",
    description="FastAPI service for spatial analysis, AI image-to-image redesign, and practical improvement reports.",
    version="1.0.0"
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
    return {
        "status": "ok",
        "service": "YClick Backend",
        "version": "1.0.0",
        "ai_provider": os.getenv("AI_IMAGE_PROVIDER", "mock"),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
