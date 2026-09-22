"""API routers package."""

from fastapi import APIRouter
from .routes_rates import router as rates_router
from .routes_services import router as services_router
from .routes_scrape import router as scrape_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(rates_router)
api_router.include_router(services_router)
api_router.include_router(scrape_router)

__all__ = ["api_router", "rates_router", "services_router", "scrape_router"]

