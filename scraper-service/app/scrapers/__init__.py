"""Scrapers package: base scraper, universal heuristic scraper, and platform adapters."""

from typing import List
from .base import BaseScraper
from .universal import UniversalScraper
from .platforms.steam import SteamScraper
from .platforms.xbox import XboxScraper
from .platforms.subscriptions import SubscriptionScraper, POPULAR_PROVIDERS, SubscriptionCatalog

# Registered scrapers in priority order: platform specific first, then universal, then generic subscription fallback
SCRAPERS: List[BaseScraper] = [
    SteamScraper(),
    XboxScraper(),
    SubscriptionScraper(),
    UniversalScraper(),  # Catch-all must always be last
]


def get_scraper_for_url(url: str) -> BaseScraper:
    """Return the most specific scraper that can handle the URL."""
    for scraper in SCRAPERS:
        if scraper.can_handle(url):
            return scraper
    return UniversalScraper()


__all__ = [
    "BaseScraper",
    "UniversalScraper",
    "SteamScraper",
    "XboxScraper",
    "SubscriptionScraper",
    "POPULAR_PROVIDERS",
    "SubscriptionCatalog",
    "SCRAPERS",
    "get_scraper_for_url",
]

