"""Unit tests for FastAPI endpoints and price parser."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.scrapers.base import BaseScraper


def test_price_and_currency_parsing():
    """Test regex price parser across different currencies and notations."""
    # US format
    amt, curr = BaseScraper.parse_price_and_currency("$19.99")
    assert amt == 19.99
    assert curr == "ARS"  # default

    amt, curr = BaseScraper.parse_price_and_currency("USD 59.99")
    assert amt == 59.99
    assert curr == "USD"

    amt, curr = BaseScraper.parse_price_and_currency("US$ 1,234.50")
    assert amt == 1234.50
    assert curr == "USD"

    # Argentine format
    amt, curr = BaseScraper.parse_price_and_currency("ARS 4.299,00")
    assert amt == 4299.0
    assert curr == "ARS"

    # Euro format
    amt, curr = BaseScraper.parse_price_and_currency("29,90 €")
    assert amt == 29.90
    assert curr == "EUR"


@pytest.mark.asyncio
async def test_root_and_health_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "online"
        assert "endpoints" in data

        resp_health = await ac.get("/health")
        assert resp_health.status_code == 200
        assert resp_health.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_rates_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/rates")
        assert resp.status_code == 200
        data = resp.json()
        assert "oficial" in data
        assert "tarjeta" in data
        assert data["oficial"] > 0
        assert data["tarjeta"] > 0


@pytest.mark.asyncio
async def test_services_catalog_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/api/v1/services?province=CABA&paymentMethod=TARJETA_ARS")
        assert resp.status_code == 200
        services = resp.json()
        assert isinstance(services, list)
        assert len(services) > 0

        # Check Netflix or Spotify structure
        netflix = next((s for s in services if s["id"] == "netflix"), None)
        assert netflix is not None
        assert len(netflix["plans"]) > 0
        plan = netflix["plans"][0]
        assert "calculation" in plan
        assert plan["calculation"]["province"] == "CABA"
        assert plan["calculation"]["totalArs"] > 0


@pytest.mark.asyncio
async def test_scrape_validation_error():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Invalid URL format (missing scheme)
        resp = await ac.post("/api/v1/scrape", json={"url": "not-a-valid-url"})
        assert resp.status_code == 400


def test_scraper_dispatching_for_xbox():
    from app.scrapers import get_scraper_for_url
    from app.scrapers.platforms.xbox import XboxScraper
    from app.scrapers.platforms.subscriptions import SubscriptionScraper

    store_url = "https://www.xbox.com/es-AR/games/store/minecraft-java-bedrock-edition-for-pc/9nxp44l49shj"
    scraper = get_scraper_for_url(store_url)
    assert isinstance(scraper, XboxScraper)

    home_url = "https://www.xbox.com"
    scraper_home = get_scraper_for_url(home_url)
    assert isinstance(scraper_home, SubscriptionScraper)


