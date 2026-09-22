"""Steam Store connector and scraper using Steam's official public API."""

import logging
import re
from typing import Optional
import httpx
from bs4 import BeautifulSoup

from app.config import settings
from app.models.schemas import ScrapedProduct
from app.scrapers.base import BaseScraper

logger = logging.getLogger("scraper_service.steam")


class SteamScraper(BaseScraper):
    """Scraper for Steam Store (store.steampowered.com).

    Steam Argentina switched to USD (LATAM-USD) in November 2023.
    This scraper uses the official Steam Store Web API with country code cc=ar.
    """

    STEAM_APP_REGEX = re.compile(r"store\.steampowered\.com/app/(\d+)", re.IGNORECASE)
    STEAM_SUB_REGEX = re.compile(r"store\.steampowered\.com/sub/(\d+)", re.IGNORECASE)

    def can_handle(self, url: str) -> bool:
        """Check if URL belongs to Steam Store."""
        return "store.steampowered.com" in url.lower() or "steamcommunity.com" in url.lower()

    async def scrape(self, url: str) -> Optional[ScrapedProduct]:
        """Fetch game metadata and price from Steam API with fallback to HTML."""
        app_match = self.STEAM_APP_REGEX.search(url)
        if app_match:
            app_id = app_match.group(1)
            product = await self._fetch_from_api(app_id, url)
            if product:
                return product

        # Fallback to HTML scraping for packages, subs or age-gated items
        return await self._scrape_html(url)

    async def _fetch_from_api(self, app_id: str, original_url: str) -> Optional[ScrapedProduct]:
        """Query official Steam AppDetails API."""
        api_url = f"{settings.STEAM_API_URL}?appids={app_id}&cc=ar&l=spanish"
        headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
        }

        try:
            async with httpx.AsyncClient(timeout=settings.SCRAPER_TIMEOUT, headers=headers) as client:
                resp = await client.get(api_url)
                if resp.status_code != 200:
                    logger.warning("Steam API returned %s for appid %s", resp.status_code, app_id)
                    return None

                payload = resp.json()
                app_data = payload.get(app_id, {})
                if not app_data.get("success"):
                    logger.warning("Steam API reports success=False for appid %s", app_id)
                    return None

                data = app_data.get("data", {})
                title = data.get("name", f"Steam App {app_id}")
                thumbnail = data.get("header_image")

                # Handle Free games
                if data.get("is_free"):
                    return ScrapedProduct(
                        title=title,
                        amount=0.0,
                        currency="USD",
                        domain="store.steampowered.com",
                        thumbnail=thumbnail,
                        isDigitalService=True,
                        category="DIGITAL_SERVICE_USD",
                    )

                # Handle priced games
                price_overview = data.get("price_overview")
                if price_overview:
                    final_cents = price_overview.get("final", 0)
                    amount = round(final_cents / 100.0, 2)
                    currency = price_overview.get("currency", "USD")
                    return ScrapedProduct(
                        title=title,
                        amount=amount,
                        currency=currency,
                        domain="store.steampowered.com",
                        thumbnail=thumbnail,
                        isDigitalService=True,
                        category="DIGITAL_SERVICE_USD",
                    )

        except Exception as e:
            logger.error("Error querying Steam API for app %s: %s", app_id, e)

        return None

    async def _scrape_html(self, url: str) -> Optional[ScrapedProduct]:
        """Scrape Steam web page directly (for subs, packages, or bundles)."""
        cookies = {"birthtime": "283996801", "mature_content": "1"}  # Bypass age gate
        headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
        }

        try:
            async with httpx.AsyncClient(
                timeout=settings.SCRAPER_TIMEOUT,
                cookies=cookies,
                headers=headers,
                follow_redirects=True,
            ) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return None

                soup = BeautifulSoup(resp.text, "html.parser")
                title_elem = soup.select_one(".apphub_AppName, #appHubAppName, .page_header h2")
                title = title_elem.get_text(strip=True) if title_elem else "Steam Item"

                # Image
                header_img = soup.select_one(".game_header_image_full, .package_header")
                thumbnail = header_img.get("src") if header_img else None

                # Look for price in .game_purchase_price or .discount_final_price
                price_elem = soup.select_one(".game_purchase_price, .discount_final_price")
                if price_elem:
                    text = price_elem.get_text(strip=True)
                    if "free" in text.lower() or "gratis" in text.lower():
                        amount = 0.0
                        currency = "USD"
                    else:
                        amount, currency = self.parse_price_and_currency(text, default_currency="USD")
                    if amount is not None:
                        return ScrapedProduct(
                            title=self.clean_title(title),
                            amount=amount,
                            currency=currency,
                            domain="store.steampowered.com",
                            thumbnail=thumbnail,
                            isDigitalService=True,
                            category="DIGITAL_SERVICE_USD",
                        )
        except Exception as e:
            logger.error("Failed scraping Steam HTML for %s: %s", url, e)

        return None

