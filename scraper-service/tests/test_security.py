"""Tests for SSRF protection and security validator."""

import pytest
from fastapi.testclient import TestClient

from app.core.security import validate_scrape_url
from app.main import app

client = TestClient(app)


def test_validate_safe_public_url():
    """Verify that public HTTPS domains pass validation."""
    is_safe, msg = validate_scrape_url("https://store.steampowered.com/app/1086940/Baldurs_Gate_3/")
    assert is_safe is True
    assert msg == ""


def test_validate_safe_xbox_url():
    """Verify that Xbox public store URLs pass validation."""
    is_safe, msg = validate_scrape_url("https://www.xbox.com/es-AR/games/store/minecraft-java-bedrock-edition-for-pc/9nxp44l49shj")
    assert is_safe is True
    assert msg == ""


@pytest.mark.parametrize(
    "malicious_url",
    [
        "http://localhost:8000/docs",
        "http://127.0.0.1:8000/api/v1/rates",
        "http://0.0.0.0:8000",
        "http://169.254.169.254/latest/meta-data/",
        "http://192.168.1.1/admin",
        "http://10.0.0.1/secret",
        "http://172.16.0.1/api",
        "ftp://example.com/file.txt",
        "file:///etc/passwd",
        "",
        "not_a_url",
    ],
)
def test_validate_blocks_malicious_and_private_urls(malicious_url):
    """Verify that private IPs, localhost, cloud metadata, and invalid schemes are blocked."""
    is_safe, msg = validate_scrape_url(malicious_url)
    assert is_safe is False
    assert len(msg) > 0


def test_api_blocks_ssrf_attempt_on_scrape_endpoint():
    """Verify that /api/v1/scrape returns 400 Bad Request when receiving a private IP or localhost."""
    response = client.post(
        "/api/v1/scrape",
        json={"url": "http://127.0.0.1:8000/health"},
    )
    assert response.status_code == 400
    assert "Acceso denegado" in response.json()["detail"] or "red privada" in response.json()["detail"]


def test_api_blocks_ssrf_attempt_on_scrape_and_calculate_endpoint():
    """Verify that /api/v1/scrape-and-calculate returns 400 Bad Request when receiving cloud metadata."""
    response = client.post(
        "/api/v1/scrape-and-calculate",
        json={"url": "http://169.254.169.254/latest/meta-data/"},
    )
    assert response.status_code == 400
    assert "Acceso denegado" in response.json()["detail"]

