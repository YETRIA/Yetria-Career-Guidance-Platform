"""
Main FastAPI application for Yetria Career Guidance Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

from .api.endpoints import auth, users, scenarios, responses, mentorship, courses

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Yetria Career Guidance Platform API",
    description="AI-powered career guidance and mentorship platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development only!)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure this properly for production
)


@app.get("/")
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Yetria Career Guidance Platform API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "message": "API is running"}


# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(scenarios.router, prefix="/api/v1", tags=["scenarios"])
app.include_router(responses.router, prefix="/api/v1", tags=["responses"])
app.include_router(mentorship.router, prefix="/api/v1", tags=["mentorship"])
app.include_router(courses.router, prefix="/api/v1", tags=["courses"])