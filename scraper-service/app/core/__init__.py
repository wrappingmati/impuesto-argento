"""Core domain logic: Argentine tax calculation engine and caching layer."""

from .tax_engine import (
    calculate_argentine_taxes,
    PROVINCE_TAX_REGIMES,
    IVA_DIGITAL_RATE,
    GANANCIAS_RG5617_RATE,
)
from .cache import CacheManager, cache

__all__ = [
    "calculate_argentine_taxes",
    "PROVINCE_TAX_REGIMES",
    "IVA_DIGITAL_RATE",
    "GANANCIAS_RG5617_RATE",
    "CacheManager",
    "cache",
]

