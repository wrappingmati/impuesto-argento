"""Exchange rates router (Dólar Oficial, Tarjeta, MEP, Blue) with caching."""

import logging
from typing import Optional
import httpx
from fastapi import APIRouter

from app.config import settings
from app.core.cache import cache
from app.models.schemas import ExchangeRates

logger = logging.getLogger("scraper_service.rates")

router = APIRouter(prefix="/rates", tags=["Rates"])

CACHE_KEY_RATES = "exchange_rates_v1"
RATES_TTL_SECONDS = 600  # 10 minutes

# Conservative fallback rates in case all upstream APIs are unreachable
FALLBACK_RATES = ExchangeRates(
    oficial=1060.0,
    tarjeta=1378.0,
    mep=1220.0,
    blue=1240.0,
)


async def fetch_exchange_rates() -> ExchangeRates:
    """Fetch exchange rates with cache-aside pattern."""
    cached = await cache.get(CACHE_KEY_RATES)
    if cached:
        try:
            return ExchangeRates(**cached)
        except Exception:
            pass

    # 1. Try DolarApi
    rates = await _fetch_from_dolarapi()
    if rates:
        await cache.set(CACHE_KEY_RATES, rates.model_dump(), ttl_seconds=RATES_TTL_SECONDS)
        return rates

    # 2. Try Bluelytics as backup
    rates = await _fetch_from_bluelytics()
    if rates:
        await cache.set(CACHE_KEY_RATES, rates.model_dump(), ttl_seconds=RATES_TTL_SECONDS)
        return rates

    logger.warning("All exchange rate APIs failed. Returning fallback rates.")
    return FALLBACK_RATES


async def _fetch_from_dolarapi() -> Optional[ExchangeRates]:
    """Fetch all dollar rates from DolarApi."""
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(settings.DOLAR_API_URL)
            if resp.status_code == 200:
                data = resp.json()
                oficial = 0.0
                tarjeta = 0.0
                mep = 0.0
                blue = 0.0

                for item in data:
                    casa = item.get("casa", "").lower()
                    venta = float(item.get("venta") or 0.0)
                    if casa == "oficial":
                        oficial = venta
                    elif casa == "tarjeta":
                        tarjeta = venta
                    elif casa in ("bolsa", "mep"):
                        mep = venta
                    elif casa == "blue":
                        blue = venta

                if oficial > 0:
                    if tarjeta == 0:
                        # Post-Impuesto PAIS (30% Ganancias only)
                        tarjeta = round(oficial * 1.30, 2)
                    return ExchangeRates(
                        oficial=round(oficial, 2),
                        tarjeta=round(tarjeta, 2),
                        mep=round(mep, 2) if mep > 0 else None,
                        blue=round(blue, 2) if blue > 0 else None,
                    )
    except Exception as e:
        logger.warning("Failed fetching from DolarApi (%s): %s", settings.DOLAR_API_URL, e)

    return None


async def _fetch_from_bluelytics() -> Optional[ExchangeRates]:
    """Fetch dollar rates from Bluelytics."""
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(settings.BLUELYTICS_API_URL)
            if resp.status_code == 200:
                data = resp.json()
                oficial = float(data.get("oficial", {}).get("value_sell") or 0.0)
                blue = float(data.get("blue", {}).get("value_sell") or 0.0)

                if oficial > 0:
                    tarjeta = round(oficial * 1.30, 2)
                    return ExchangeRates(
                        oficial=round(oficial, 2),
                        tarjeta=round(tarjeta, 2),
                        mep=None,
                        blue=round(blue, 2) if blue > 0 else None,
                    )
    except Exception as e:
        logger.warning("Failed fetching from Bluelytics (%s): %s", settings.BLUELYTICS_API_URL, e)

    return None


@router.get("", response_model=ExchangeRates, summary="Get current Argentine exchange rates")
async def get_rates() -> ExchangeRates:
    """Retrieve current exchange rates (Oficial, Tarjeta, MEP, Blue) with 10-minute cache."""
    return await fetch_exchange_rates()

