import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.database import engine, SessionLocal
from app.db.base import Base
import app.models  # Ensures all models are registered with Base.metadata
from app.services.seed_service import SeedService

# Import Routers
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router
from app.routers.inventory import router as inventory_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.returns import router as returns_router
from app.routers.admin import router as admin_router
from app.routers.chat import router as chat_router
from app.routers.store import router as store_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown handler."""
    logger.info("Initializing Rainbow Ready Mades Database & Tables...")
    try:
        # Create all tables on startup if not already existing
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")

        # Seed initial admin and default categories
        db = SessionLocal()
        try:
            SeedService.seed_initial_admin(db)
            SeedService.seed_default_categories(db)
            SeedService.import_verified_business_data(db)
            logger.info("Initial seeds verified.")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")
    
    yield
    logger.info("Rainbow Ready Mades Backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FastAPI Backend for Rainbow Ready Mades - Local Clothing Retail E-Commerce & Grounded Support",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ------------------------------------------------------------------------------
# CORS Middleware for React Frontend
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Standardized Error Handling (Contract-Compliant)
# ------------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Formats HTTP exceptions to match docs/api-contract.md."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
                "details": None
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats Pydantic 422 validation errors to clean JSON structure."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request payload parameters",
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catches unhandled errors and outputs safe 500 error."""
    logger.exception(f"Unhandled server error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(exc) if settings.DEBUG else None
            }
        }
    )


# ------------------------------------------------------------------------------
# Health Check Endpoint
# ------------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for container orchestrators and frontend pinging."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# ------------------------------------------------------------------------------
# Mount All API v1 Routers
# ------------------------------------------------------------------------------
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(users_router, prefix=api_v1)
app.include_router(categories_router, prefix=api_v1)
app.include_router(products_router, prefix=api_v1)
app.include_router(inventory_router, prefix=api_v1)
app.include_router(cart_router, prefix=api_v1)
app.include_router(orders_router, prefix=api_v1)
app.include_router(returns_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)
app.include_router(chat_router, prefix=api_v1)
app.include_router(store_router, prefix=api_v1)


# ------------------------------------------------------------------------------
# Static Files Serving (Store, Product & Model Assets)
# ------------------------------------------------------------------------------
# Resolve project root assets directory: Rainbow Readymades/assets
REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = REPO_ROOT / "assets"
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
    logger.info(f"Mounted static assets from: {ASSETS_DIR}")
else:
    logger.warning(f"Assets directory not found at: {ASSETS_DIR}")

