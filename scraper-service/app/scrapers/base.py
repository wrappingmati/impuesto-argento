"""Abstract Base Scraper class and parsing utilities."""

from abc import ABC, abstractmethod
import re
from typing import Optional, Tuple
from urllib.parse import urlparse
from app.models.schemas import ScrapedProduct


class BaseScraper(ABC):
    """Abstract base class for all scrapers."""

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Return True if this scraper can handle the provided URL."""
        pass

    @abstractmethod
    async def scrape(self, url: str) -> Optional[ScrapedProduct]:
        """Scrape the target URL and return normalized product data."""
        pass

    @staticmethod
    def extract_domain(url: str) -> str:
        """Extract clean hostname/domain from URL."""
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc or url
        except Exception:
            return url

    @staticmethod
    def clean_title(title: Optional[str]) -> str:
        """Clean and normalize scraped title string."""
        if not title:
            return "Producto sin título"
        cleaned = re.sub(r"\s+", " ", title).strip()
        # Remove trailing site brand names like " - Steam", " | Tienda"
        cleaned = re.sub(r"\s*[-|–—]\s*(Steam|Netflix|Amazon|Tienda|Store).*$", "", cleaned, flags=re.IGNORECASE)
        return cleaned.strip() or title.strip()

    @classmethod
    def parse_price_and_currency(cls, text: str, default_currency: str = "ARS") -> Tuple[Optional[float], str]:
        """Extract numeric amount and currency string from raw text.

        Handles:
        - '$ 1.234,56', '$1,234.56', 'USD 19.99', 'US$ 29.99', '19,99 €', 'AR$ 5.499'
        """
        if not text:
            return None, default_currency

        raw = text.strip()

        # 1. Detect Currency
        currency = default_currency
        upper = raw.upper()
        if any(tok in upper for tok in ["USD", "US$", "U$S", "$USD"]):
            currency = "USD"
        elif any(tok in upper for tok in ["EUR", "€"]):
            currency = "EUR"
        elif any(tok in upper for tok in ["ARS", "AR$", "$ARS"]):
            currency = "ARS"
        elif "$" in raw and currency == default_currency:
            currency = default_currency

        # 2. Extract numeric digits with separators
        # Match pattern like 1.234,56 or 1,234.56 or 1234.56 or 1234,56 or 1234
        match = re.search(r"(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)", raw)
        if not match:
            return None, currency

        num_str = match.group(1)

        # Standardize decimal separator
        # Case A: Contains both '.' and ',' -> whichever appears last is the decimal separator
        if "." in num_str and "," in num_str:
            last_dot = num_str.rfind(".")
            last_comma = num_str.rfind(",")
            if last_comma > last_dot:
                # e.g. 1.234,56 -> Argentine/European format
                num_str = num_str.replace(".", "").replace(",", ".")
            else:
                # e.g. 1,234.56 -> US format
                num_str = num_str.replace(",", "")
        elif "," in num_str:
            # Only commas
            # If exactly 2 decimal digits after comma (e.g. "19,99" or "1299,50") -> decimal
            parts = num_str.split(",")
            if len(parts) == 2 and len(parts[1]) in (1, 2):
                num_str = parts[0] + "." + parts[1]
            else:
                # Thousand separator e.g. "1,000"
                num_str = num_str.replace(",", "")
        elif "." in num_str:
            # Only dots
            parts = num_str.split(".")
            if len(parts) == 2 and len(parts[1]) in (1, 2):
                pass  # standard decimal 19.99
            elif len(parts) > 2 or (len(parts) == 2 and len(parts[1]) == 3):
                # Thousand separator e.g. 1.000 or 1.234.567
                num_str = "".join(parts)

        try:
            amount = round(float(num_str), 2)
            return amount, currency
        except ValueError:
            return None, currency

