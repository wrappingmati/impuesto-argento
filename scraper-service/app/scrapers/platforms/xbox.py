"""Xbox / Microsoft Store scraper for games and DLCs."""

import re
import logging
from typing import Optional
import httpx
from bs4 import BeautifulSoup

from ..base import BaseScraper
from ...models.schemas import ScrapedProduct

logger = logging.getLogger(__name__)


class XboxScraper(BaseScraper):
    """Scraper dedicated to Xbox & Microsoft Store game product pages."""

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/128.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    def can_handle(self, url: str) -> bool:
        """Match Xbox and Microsoft Store game product URLs."""
        domain = self.extract_domain(url).lower()
        if not ("xbox.com" in domain or "microsoft.com" in domain):
            return False

        lower_url = url.lower()
        # Must be a store product page, not just the homepage or root subscription page
        is_product_path = any(
            path in lower_url
            for path in [
                "/games/store/",
                "/games/",
                "/p/",
                "/detail/",
                "/buy/",
            ]
        )
        return is_product_path

    async def scrape(self, url: str) -> Optional[ScrapedProduct]:
        """Scrape game title, price, thumbnail, and metadata from Xbox Store."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                res = await client.get(url, headers=self.HEADERS)
                if res.status_code != 200:
                    logger.warning(f"Xbox Store returned HTTP {res.status_code} for {url}")
                    return None

                soup = BeautifulSoup(res.text, "html.parser")

                # 1. Extraer título
                h1 = soup.find("h1")
                title = h1.get_text(strip=True) if h1 else None
                if not title:
                    og_title = soup.find("meta", property="og:title")
                    title = og_title["content"] if og_title and og_title.get("content") else None
                if not title and soup.title:
                    title = soup.title.string.replace("Comprar ", "").replace(" | XBOX", "").strip()

                if not title:
                    title = "Juego en Xbox / Microsoft Store"

                # 2. Extraer thumbnail / portada
                thumbnail = None
                og_image = soup.find("meta", property="og:image")
                if og_image and og_image.get("content"):
                    thumbnail = og_image["content"]

                if not thumbnail:
                    # Buscar imágenes de producto
                    img = soup.find("img", class_=re.compile(r"productImage|boxart", re.I))
                    if img and img.get("src"):
                        thumbnail = img["src"]

                # 3. Extraer precio
                # En la web de Xbox, el precio del juego principal se encuentra en clases 'Price-module__boldText...'
                price_elements = soup.find_all(
                    ["span", "div", "button"],
                    class_=re.compile(r"Price-module__boldText|Price-module__priceText", re.I),
                )

                raw_price_str = None
                for elem in price_elements:
                    text = elem.get_text(strip=True)
                    if any(c.isdigit() for c in text):
                        raw_price_str = text
                        break

                # Fallback: buscar cualquier texto que contenga ARS$ o $ seguido de números
                if not raw_price_str:
                    match = re.search(r"(?:ARS\s*\$|\$)\s*([\d\.,]+)", res.text, re.I)
                    if match:
                        raw_price_str = match.group(0)

                amount = 0.0
                currency = "ARS"
                if raw_price_str:
                    parsed_amt, parsed_curr = self.parse_price_and_currency(raw_price_str, default_currency="ARS")
                    if parsed_amt is not None:
                        amount = parsed_amt
                    if parsed_curr:
                        currency = parsed_curr

                # La tienda de Xbox Argentina siempre factura en ARS
                if "es-ar" in url.lower():
                    currency = "ARS"
                elif "en-us" in url.lower() or "us" in self.extract_domain(url):
                    currency = "USD"

                domain = self.extract_domain(url)

                return ScrapedProduct(
                    title=title,
                    amount=amount,
                    currency=currency,
                    domain=domain,
                    thumbnail=thumbnail or "https://assets.xboxservices.com/assets/f4/b4/f4b4cefe-cf38-4e3a-939e-e67c87c92a6b.svg",
                    isDigitalService=True,
                    category="DIGITAL_SERVICE_ARS_FOREIGN" if currency == "ARS" else "DIGITAL_SERVICE_USD",
                    confidenceScore=0.92,
                )

        except Exception as err:
            logger.error(f"Error scraping Xbox Store URL {url}: {err}")
            return None
