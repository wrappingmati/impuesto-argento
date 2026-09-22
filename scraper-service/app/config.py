"""Configuration module for the Scraper Service."""

import json
import os
from typing import List, Optional
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file if present
env_path = BASE_DIR / ".env"
if env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=env_path)
    except ImportError:
        pass


def _parse_list_from_env(key: str, default: List[str]) -> List[str]:
    """Parse comma-separated or JSON list from environment variable."""
    val = os.getenv(key)
    if not val:
        return default
    val = val.strip()
    if val.startswith("[") and val.endswith("]"):
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return [str(x) for x in parsed]
        except Exception:
            pass
    return [x.strip() for x in val.split(",") if x.strip()]


class Settings:
    """Application settings with environment variable fallbacks."""

    APP_NAME: str = "Impuesto Argento Scraper Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    REDIS_URL: Optional[str] = os.getenv("REDIS_URL") or None
    CORS_ORIGINS: List[str] = _parse_list_from_env(
        "CORS_ORIGINS",
        [
            "https://impuesto-argento.netlify.app",
            "http://localhost:8080",
            "http://localhost:5173",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:5173",
            "*"
        ]
    )

    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "600"))

    # External APIs
    DOLAR_API_URL: str = os.getenv("DOLAR_API_URL", "https://dolarapi.com/v1/dolares")
    BLUELYTICS_API_URL: str = os.getenv("BLUELYTICS_API_URL", "https://api.bluelytics.com.ar/v2/latest")
    STEAM_API_URL: str = os.getenv("STEAM_API_URL", "https://store.steampowered.com/api/appdetails")

    # Scraper configuration
    SCRAPER_TIMEOUT: float = float(os.getenv("SCRAPER_TIMEOUT", "12.0"))
    USER_AGENT: str = os.getenv(
        "USER_AGENT",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 ImpuestoArgentoScraper/1.0"
    )


settings = Settings()

