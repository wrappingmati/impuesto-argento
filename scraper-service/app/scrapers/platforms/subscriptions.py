"""Catalog of popular subscriptions and digital providers in Argentina."""

import logging
from typing import List, Optional
from app.models.schemas import DigitalProvider, ProviderPlan, ScrapedProduct
from app.scrapers.base import BaseScraper

logger = logging.getLogger("scraper_service.subscriptions")

POPULAR_PROVIDERS: List[DigitalProvider] = [
    # --- STREAMING & AUDIOVISUAL ---
    DigitalProvider(
        id="netflix",
        name="Netflix",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=True,
        isListedInArcaAnnexII=True,
        domain="netflix.com",
        notes="Factura nominalmente en ARS pero procesa como prestador del exterior vía banco emisor.",
        plans=[
            ProviderPlan(name="Básico", price=4299.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Estándar", price=7199.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Premium", price=9699.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="spotify",
        name="Spotify",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=True,
        isListedInArcaAnnexII=True,
        domain="spotify.com",
        notes="Precios de planes en ARS sujetos a 21% IVA + 30% RG 5617 + IIBB provincial.",
        plans=[
            ProviderPlan(name="Individual", price=2499.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Dúo", price=3299.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Familiar", price=4199.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="youtube-premium",
        name="YouTube Premium",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=True,
        isListedInArcaAnnexII=True,
        domain="youtube.com",
        notes="Planes familiares e individuales de YouTube Music y Premium.",
        plans=[
            ProviderPlan(name="Individual", price=1899.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Familiar", price=3699.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="disney-plus",
        name="Disney+ / Star+",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=True,
        isListedInArcaAnnexII=True,
        domain="disneyplus.com",
        plans=[
            ProviderPlan(name="Estándar", price=3999.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Premium", price=6699.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="max",
        name="Max (HBO)",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=True,
        isListedInArcaAnnexII=True,
        domain="max.com",
        plans=[
            ProviderPlan(name="Básico con Anuncios", price=2190.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Estándar", price=2890.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Platino", price=3490.0, currency="ARS", period="monthly"),
        ],
    ),
    # --- GAMING & PLATFORMS ---
    DigitalProvider(
        id="steam",
        name="Steam",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="store.steampowered.com",
        notes="Dolarizado en LATAM-USD desde noviembre de 2023.",
    ),
    DigitalProvider(
        id="playstation",
        name="PlayStation Store",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="store.playstation.com",
        notes="Precios de juegos y suscripción PS Plus siempre en USD.",
        plans=[
            ProviderPlan(name="PS Plus Essential (1 mes)", price=6.99, currency="USD", period="monthly"),
            ProviderPlan(name="PS Plus Extra (1 mes)", price=10.49, currency="USD", period="monthly"),
            ProviderPlan(name="PS Plus Deluxe (1 mes)", price=11.99, currency="USD", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="xbox",
        name="Xbox / Microsoft Store",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="xbox.com",
        notes="Muestra precios en ARS sin impuestos. Aplica 21% IVA + 30% RG 5617 + IIBB.",
        plans=[
            ProviderPlan(name="PC Game Pass", price=5399.0, currency="ARS", period="monthly"),
            ProviderPlan(name="Game Pass Ultimate", price=8999.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="nintendo",
        name="Nintendo eShop Argentina",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="nintendo.com",
        notes="Tienda regional en ARS sin impuestos agregados en la web.",
        plans=[
            ProviderPlan(name="Nintendo Switch Online (12 meses)", price=9499.0, currency="ARS", period="yearly"),
            ProviderPlan(name="Familiar + Paquete de Expansión (12 meses)", price=29999.0, currency="ARS", period="yearly"),
        ],
    ),
    DigitalProvider(
        id="epic-games",
        name="Epic Games Store",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="store.epicgames.com",
    ),
    # --- IA, PRODUCTIVIDAD & SOFTWARE ---
    DigitalProvider(
        id="chatgpt",
        name="ChatGPT Plus / OpenAI",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="openai.com",
        plans=[
            ProviderPlan(name="Plus", price=20.0, currency="USD", period="monthly"),
            ProviderPlan(name="Team", price=25.0, currency="USD", period="monthly"),
            ProviderPlan(name="Pro", price=200.0, currency="USD", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="claude",
        name="Claude Pro / Anthropic",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="anthropic.com",
        plans=[
            ProviderPlan(name="Pro", price=20.0, currency="USD", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="midjourney",
        name="Midjourney",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="midjourney.com",
        plans=[
            ProviderPlan(name="Basic Plan", price=10.0, currency="USD", period="monthly"),
            ProviderPlan(name="Standard Plan", price=30.0, currency="USD", period="monthly"),
            ProviderPlan(name="Pro Plan", price=60.0, currency="USD", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="github-copilot",
        name="GitHub Copilot",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="github.com",
        plans=[
            ProviderPlan(name="Individual", price=10.0, currency="USD", period="monthly"),
            ProviderPlan(name="Individual Anual", price=100.0, currency="USD", period="yearly"),
        ],
    ),
    DigitalProvider(
        id="google-one",
        name="Google One / Drive",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        defaultCurrency="ARS",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="one.google.com",
        plans=[
            ProviderPlan(name="100 GB", price=1199.0, currency="ARS", period="monthly"),
            ProviderPlan(name="2 TB", price=3999.0, currency="ARS", period="monthly"),
        ],
    ),
    DigitalProvider(
        id="apple-icloud",
        name="Apple iCloud+ / Apple One",
        category="DIGITAL_SERVICE_USD",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=True,
        domain="apple.com",
        plans=[
            ProviderPlan(name="50 GB", price=0.99, currency="USD", period="monthly"),
            ProviderPlan(name="200 GB", price=2.99, currency="USD", period="monthly"),
            ProviderPlan(name="2 TB", price=9.99, currency="USD", period="monthly"),
        ],
    ),
    # --- E-COMMERCE & BIENES FÍSICOS ---
    DigitalProvider(
        id="amazon-us",
        name="Amazon USA",
        category="PHYSICAL_GOOD_COURIER",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=False,
        domain="amazon.com",
        notes="Bienes físicos enviados por Courier o servicio internacional.",
    ),
    DigitalProvider(
        id="aliexpress",
        name="AliExpress",
        category="PHYSICAL_GOOD_POSTAL",
        defaultCurrency="USD",
        isAudioVisual=False,
        isListedInArcaAnnexII=False,
        domain="aliexpress.com",
        notes="Compras postales puerta a puerta. Sujetas a franquicia Correo Argentino.",
    ),
]


class SubscriptionCatalog:
    """Subscription provider lookup and query service."""

    @staticmethod
    def get_all() -> List[DigitalProvider]:
        return POPULAR_PROVIDERS

    @staticmethod
    def find_by_domain_or_name(query: str) -> Optional[DigitalProvider]:
        """Find matching provider by domain or keyword."""
        clean = query.strip().lower()
        for p in POPULAR_PROVIDERS:
            if p.id.lower() == clean or clean in p.name.lower() or p.domain.lower() in clean or clean in p.domain.lower():
                return p
        return None


class SubscriptionScraper(BaseScraper):
    """Scraper that resolves known subscriptions when a service landing page or domain is passed."""

    def can_handle(self, url: str) -> bool:
        domain = self.extract_domain(url).lower()
        provider = SubscriptionCatalog.find_by_domain_or_name(domain)
        if not provider:
            return False

        # No interceptar páginas de productos específicos (ej. /games/store/ en Xbox o /app/ en Steam)
        lower_url = url.lower()
        store_paths = ["/games/store/", "/games/", "/app/", "/dp/", "/product/", "/buy/", "/concept/"]
        if any(sp in lower_url for sp in store_paths):
            return False

        return True

    async def scrape(self, url: str) -> Optional[ScrapedProduct]:
        domain = self.extract_domain(url)
        provider = SubscriptionCatalog.find_by_domain_or_name(domain)
        if not provider:
            return None

        # If provider has plans, return the base entry plan
        if provider.plans and len(provider.plans) > 0:
            first_plan = provider.plans[0]
            return ScrapedProduct(
                title=f"{provider.name} - Plan {first_plan.name}",
                amount=first_plan.price,
                currency=first_plan.currency,
                domain=provider.domain,
                thumbnail=f"https://logo.clearbit.com/{provider.domain}",
                isDigitalService=provider.category.startswith("DIGITAL_SERVICE"),
                category=provider.category,
            )

        return None

