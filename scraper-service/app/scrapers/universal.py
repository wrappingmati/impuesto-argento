"""Universal Scraper with 3-Layer Heuristic Fallback (JSON-LD, OpenGraph, DOM/Scrapling)."""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple
import httpx
from bs4 import BeautifulSoup

from app.config import settings
from app.models.schemas import ScrapedProduct, TaxCategory
from .base import BaseScraper

logger = logging.getLogger("scraper_service.universal")

# Try importing Scrapling
try:
    from scrapling import Adaptor  # type: ignore
    HAS_SCRAPLING = True
except ImportError:
    HAS_SCRAPLING = False


class UniversalScraper(BaseScraper):
    """Universal heuristic web scraper for e-commerce and subscription landing pages."""

    COMMON_PRICE_SELECTORS = [
        "[itemprop='price']",
        "meta[itemprop='price']",
        "[data-price]",
        "[data-product-price]",
        ".price",
        ".product-price",
        ".current-price",
        ".sale-price",
        ".regular-price",
        ".offer-price",
        "#price",
        "#product-price",
        "span[class*='price']",
        "div[class*='price']",
        "p[class*='price']",
        "span[class*='Price']",
        "div[class*='Price']",
    ]

    def can_handle(self, url: str) -> bool:
        """Universal scraper is the catch-all fallback for any HTTP/HTTPS URL."""
        return url.startswith("http://") or url.startswith("https://")

    async def scrape(self, url: str) -> Optional[ScrapedProduct]:
        """Execute 3-tier heuristic extraction on target page."""
        html = await self._fetch_html(url)
        if not html:
            return None

        domain = self.extract_domain(url)

        # Layer 1: JSON-LD Structured Data
        result = self._extract_json_ld(html, domain)
        if result and result.amount > 0:
            logger.info("Universal scraper layer 1 (JSON-LD) hit for %s", url)
            return result

        # Layer 2: OpenGraph & Meta Tags
        result = self._extract_opengraph(html, domain)
        if result and result.amount > 0:
            logger.info("Universal scraper layer 2 (OpenGraph) hit for %s", url)
            return result

        # Layer 3: DOM Selectors & Scrapling / BeautifulSoup Regex
        result = self._extract_dom(html, domain)
        if result and result.amount > 0:
            logger.info("Universal scraper layer 3 (DOM Selectors) hit for %s", url)
            return result

        logger.warning("Universal scraper could not find price for %s", url)
        return None

    async def _fetch_html(self, url: str) -> Optional[str]:
        """Fetch raw HTML using HTTPX with browser-like headers."""
        headers = {
            "User-Agent": settings.USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-419,es;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
        }
        try:
            async with httpx.AsyncClient(
                timeout=settings.SCRAPER_TIMEOUT,
                follow_redirects=True,
                headers=headers,
            ) as client:
                resp = await client.get(url)
                if resp.status_code < 400:
                    return resp.text
                else:
                    logger.warning("HTTP error %s fetching %s", resp.status_code, url)
                    return None
        except Exception as e:
            logger.error("Error fetching URL %s: %s", url, e)
            return None

    def _extract_json_ld(self, html: str, domain: str) -> Optional[ScrapedProduct]:
        """Layer 1: Extract product details from schema.org JSON-LD."""
        soup = BeautifulSoup(html, "html.parser")
        scripts = soup.find_all("script", type="application/ld+json")

        for script in scripts:
            if not script.string:
                continue
            try:
                data = json.loads(script.string.strip())
                items: List[Dict[str, Any]] = []
                if isinstance(data, list):
                    items = data
                elif isinstance(data, dict):
                    if "@graph" in data and isinstance(data["@graph"], list):
                        items = data["@graph"]
                    else:
                        items = [data]

                for item in items:
                    item_type = item.get("@type", "")
                    if isinstance(item_type, list):
                        is_product = any("product" in str(t).lower() for t in item_type)
                    else:
                        is_product = "product" in str(item_type).lower()

                    if is_product:
                        title = item.get("name") or soup.title.string if soup.title else "Producto"
                        image = None
                        if "image" in item:
                            img = item["image"]
                            if isinstance(img, str):
                                image = img
                            elif isinstance(img, list) and img:
                                image = img[0] if isinstance(img[0], str) else img[0].get("url")
                            elif isinstance(img, dict):
                                image = img.get("url")

                        # Extract price from offers
                        offers = item.get("offers", {})
                        if isinstance(offers, list) and offers:
                            offers = offers[0]

                        raw_price = offers.get("price") or offers.get("lowPrice")
                        raw_curr = offers.get("priceCurrency") or "ARS"

                        if raw_price is not None:
                            amt, curr = self.parse_price_and_currency(f"{raw_curr} {raw_price}", default_currency="ARS")
                            if amt is not None:
                                return ScrapedProduct(
                                    title=self.clean_title(str(title)),
                                    amount=amt,
                                    currency=curr,
                                    domain=domain,
                                    thumbnail=image,
                                    isDigitalService=self._detect_digital_service(domain, str(title)),
                                    category=self._detect_category(domain, curr),
                                )
            except Exception as e:
                logger.debug("Failed parsing JSON-LD script: %s", e)
                continue

        return None

    def _extract_opengraph(self, html: str, domain: str) -> Optional[ScrapedProduct]:
        """Layer 2: Extract details from OpenGraph and standard meta tags."""
        soup = BeautifulSoup(html, "html.parser")

        # Title
        title_tag = (
            soup.find("meta", property="og:title")
            or soup.find("meta", attrs={"name": "twitter:title"})
            or soup.find("title")
        )
        title = title_tag.get("content") if title_tag and title_tag.has_attr("content") else (soup.title.string if soup.title else "Producto")

        # Thumbnail
        img_tag = (
            soup.find("meta", property="og:image")
            or soup.find("meta", attrs={"name": "twitter:image"})
        )
        thumbnail = img_tag.get("content") if img_tag and img_tag.has_attr("content") else None

        # Price tags
        price_tag = (
            soup.find("meta", property="product:price:amount")
            or soup.find("meta", property="og:price:amount")
            or soup.find("meta", attrs={"name": "price"})
        )

        curr_tag = (
            soup.find("meta", property="product:price:currency")
            or soup.find("meta", property="og:price:currency")
            or soup.find("meta", attrs={"name": "currency"})
        )

        if price_tag and price_tag.get("content"):
            raw_price = price_tag["content"]
            raw_curr = curr_tag.get("content", "ARS") if curr_tag else "ARS"
            amt, curr = self.parse_price_and_currency(f"{raw_curr} {raw_price}")
            if amt is not None:
                return ScrapedProduct(
                    title=self.clean_title(str(title)),
                    amount=amt,
                    currency=curr,
                    domain=domain,
                    thumbnail=thumbnail,
                    isDigitalService=self._detect_digital_service(domain, str(title)),
                    category=self._detect_category(domain, curr),
                )

        return None

    def _extract_dom(self, html: str, domain: str) -> Optional[ScrapedProduct]:
        """Layer 3: Extract price by querying common DOM selectors and regex matching."""
        soup = BeautifulSoup(html, "html.parser")

        title = soup.title.string if soup.title and soup.title.string else "Producto"

        # Search selectors
        for sel in self.COMMON_PRICE_SELECTORS:
            try:
                elements = soup.select(sel)
                for el in elements:
                    # Check attributes first
                    attr_price = el.get("data-price") or el.get("content") or el.get("value")
                    text = attr_price or el.get_text(strip=True)
                    if text:
                        amt, curr = self.parse_price_and_currency(text)
                        if amt is not None and amt > 0:
                            # Verify if reasonable price
                            return ScrapedProduct(
                                title=self.clean_title(title),
                                amount=amt,
                                currency=curr,
                                domain=domain,
                                thumbnail=None,
                                isDigitalService=self._detect_digital_service(domain, title),
                                category=self._detect_category(domain, curr),
                            )
            except Exception:
                continue

        # Regex fallback on body text for patterns like "$ 1.234,00" or "US$ 19.99"
        body = soup.find("body")
        if body:
            body_text = body.get_text()
            matches = re.findall(
                r"(?:(?:USD|US\$|U\$S|ARS|AR\$|\$|€)\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*(?:USD|ARS|€))",
                body_text,
            )
            for m in matches[:10]:
                amt, curr = self.parse_price_and_currency(m)
                if amt is not None and amt > 0:
                    return ScrapedProduct(
                        title=self.clean_title(title),
                        amount=amt,
                        currency=curr,
                        domain=domain,
                        thumbnail=None,
                        isDigitalService=self._detect_digital_service(domain, title),
                        category=self._detect_category(domain, curr),
                    )

        return None

    def _detect_digital_service(self, domain: str, title: str) -> bool:
        """Infer if target item is digital service or physical good."""
        physical_domains = ["amazon.com", "aliexpress.com", "ebay.com", "tiendamia.com"]
        if any(d in domain for d in physical_domains):
            return False
        return True

    def _detect_category(self, domain: str, currency: str) -> TaxCategory:
        """Heuristically assign the tax category based on domain and currency."""
        domain_lower = domain.lower()
        if "amazon" in domain_lower or "tiendamia" in domain_lower:
            return "PHYSICAL_GOOD_COURIER"
        if "aliexpress" in domain_lower or "ebay" in domain_lower:
            return "PHYSICAL_GOOD_POSTAL"

        if currency == "USD" or currency == "EUR":
            return "DIGITAL_SERVICE_USD"
        return "DIGITAL_SERVICE_ARS_FOREIGN"

