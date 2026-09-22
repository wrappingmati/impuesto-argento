"""FastAPI Main Application for Impuesto Argento Scraper Service."""

import logging
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scraper_service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting %s v%s on port %s", settings.APP_NAME, settings.VERSION, settings.PORT)
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Microservicio de web scraping de precios y motor tributario argentino para consumos digitales y en el exterior.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = settings.CORS_ORIGINS
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api/v1
app.include_router(api_router)


@app.get("/", tags=["Health Check"])
async def root() -> Dict[str, Any]:
    """Root endpoint with service metadata and documentation links."""
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "rates": "/api/v1/rates",
            "services": "/api/v1/services",
            "scrape": "/api/v1/scrape",
            "scrape_and_calculate": "/api/v1/scrape-and-calculate",
        },
    }


@app.get("/health", tags=["Health Check"])
async def health() -> Dict[str, str]:
    """Health probe endpoint for container orchestrators."""
    return {"status": "ok"}

