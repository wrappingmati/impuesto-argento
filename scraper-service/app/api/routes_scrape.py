"""Web scraping and tax calculation API routes."""

import logging
from fastapi import APIRouter, HTTPException, status

from app.core.tax_engine import calculate_argentine_taxes
from app.models.schemas import (
    Currency,
    ScrapeAndCalculateResponse,
    ScrapedProduct,
    ScrapeRequest,
    TaxCalculationInput,
    TaxCategory,
)
from app.core.security import validate_scrape_url
from app.scrapers import get_scraper_for_url
from app.scrapers.platforms.subscriptions import SubscriptionCatalog
from .routes_rates import fetch_exchange_rates

logger = logging.getLogger("scraper_service.routes_scrape")

router = APIRouter(prefix="", tags=["Scraping & Tax Estimation"])


@router.post(
    "/scrape",
    response_model=ScrapedProduct,
    summary="Scrape product or service price from URL",
)
async def scrape_url(request: ScrapeRequest) -> ScrapedProduct:
    """Scrape title, price, currency, and metadata from any e-commerce or digital service URL."""
    url = request.url.strip()
    is_safe, error_msg = validate_scrape_url(url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    scraper = get_scraper_for_url(url)
    product = await scraper.scrape(url)

    if not product or product.amount is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se pudo extraer automáticamente el precio de la página solicitada. Podés ingresar el monto manualmente.",
        )

    return product


@router.post(
    "/scrape-and-calculate",
    response_model=ScrapeAndCalculateResponse,
    summary="Scrape URL and calculate full Argentine tax breakdown",
)
async def scrape_and_calculate(request: ScrapeRequest) -> ScrapeAndCalculateResponse:
    """Scrape product or game price from URL and immediately compute the complete Argentine tax breakdown."""
    url = request.url.strip()
    is_safe, error_msg = validate_scrape_url(url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    scraper = get_scraper_for_url(url)
    product = await scraper.scrape(url)

    if not product or product.amount is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se pudo extraer automáticamente el precio de la página solicitada. Podés ingresar el monto manualmente.",
        )

    # Determine currency
    currency_clean: Currency = "ARS"
    curr_upper = (product.currency or "ARS").upper()
    if curr_upper in ("USD", "US$", "U$S"):
        currency_clean = "USD"
    elif curr_upper in ("EUR", "€"):
        currency_clean = "EUR"
    else:
        currency_clean = "ARS"

    # Determine category
    category: TaxCategory
    if product.category:
        category = product.category
    else:
        known_provider = SubscriptionCatalog.find_by_domain_or_name(product.domain)
        if known_provider:
            category = known_provider.category
        elif currency_clean == "USD" or currency_clean == "EUR":
            category = "DIGITAL_SERVICE_USD"
        else:
            category = "DIGITAL_SERVICE_ARS_FOREIGN"

    # Check audiovisual flag for Santa Fe IIBB reduction
    is_audiovisual = False
    known_provider = SubscriptionCatalog.find_by_domain_or_name(product.domain)
    if known_provider and known_provider.is_audio_visual:
        is_audiovisual = True

    rates = await fetch_exchange_rates()

    calc_input = TaxCalculationInput(
        amount=product.amount,
        currency=currency_clean,
        category=category,
        paymentMethod=request.payment_method or "TARJETA_ARS",
        province=request.province or "OTRA",
        rates=rates,
        isAudioVisualService=is_audiovisual,
    )

    calculation = calculate_argentine_taxes(calc_input)

    return ScrapeAndCalculateResponse(
        scraped=product,
        calculation=calculation,
    )

