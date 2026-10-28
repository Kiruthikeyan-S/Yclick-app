import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .api.endpoints import router as design_router

load_dotenv()

app = FastAPI(
    title="YClick AI Backend",
    description="FastAPI service for spatial analysis, AI image-to-image redesign, and practical improvement reports.",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(design_router)

@app.get("/health")
def health_check():
    """Health check endpoint for mobile client connectivity verification."""
    return {
        "status": "ok",
        "service": "YClick Backend",
        "version": "1.0.0",
        "ai_provider": os.getenv("AI_IMAGE_PROVIDER", "mock"),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
