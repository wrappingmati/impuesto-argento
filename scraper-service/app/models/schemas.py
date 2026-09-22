"""Pydantic schemas and models for Argentine Tax Engine and Scraper Service."""

from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

# Core types
Currency = Literal["ARS", "USD", "EUR"]

TaxCategory = Literal[
    "DIGITAL_SERVICE_USD",          # Ej: Steam, PlayStation Store, ChatGPT Plus, Midjourney
    "DIGITAL_SERVICE_ARS_FOREIGN",  # Ej: Xbox Store, Netflix, Spotify, YouTube Premium (muestran ARS pero procesan en exterior RG 4240)
    "DIGITAL_SERVICE_LOCAL",        # Ej: Flow, Telecom, hosting local con CUIT
    "PHYSICAL_GOOD_COURIER",        # Ej: Amazon, Tiendamia (bienes físicos vía Courier privado)
    "PHYSICAL_GOOD_POSTAL",         # Ej: AliExpress, eBay (correo postal oficial / puerta a puerta)
]

PaymentMethod = Literal[
    "TARJETA_ARS",        # Pago en pesos con tarjeta (aplica 30% RG 5617)
    "DOLAR_MEP_CUENTA",   # Pago con dólares propios (MEP) desde caja de ahorro (exento del 30%)
]

ProvinceCode = Literal[
    "CABA", "BA",  "CBA", "SF",  "ER",  "MZA",
    "CHA",  "LP",  "NQN", "RN",  "SAL", "TF",
    "COR",  "MIS", "JUJ", "TUC", "SL",  "SJ",
    "CAT",  "LR",  "SDE", "CHU", "SC",  "FORM",
    "OTRA",
]


class BaseSchema(BaseModel):
    """Base schema allowing both camelCase and snake_case."""
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class ProvinceTaxInfo(BaseSchema):
    code: ProvinceCode
    label: str
    digital_services_iibb_rate: float = Field(alias="digitalServicesIibbRate")
    general_iibb_rate: Optional[float] = Field(default=None, alias="generalIibbRate")
    source: str
    notes: Optional[str] = None


class ExchangeRates(BaseSchema):
    oficial: float
    tarjeta: float
    mep: Optional[float] = None
    blue: Optional[float] = None


class TaxItem(BaseSchema):
    id: str
    name: str
    rate: float
    amount_ars: float = Field(alias="amountArs")
    applied_on_ars: float = Field(alias="appliedOnArs")
    legal_reference: str = Field(alias="legalReference")
    is_withholding: bool = Field(alias="isWithholding")
    description: Optional[str] = None


class MepComparison(BaseSchema):
    mep_rate: float = Field(alias="mepRate")
    total_with_mep_ars: float = Field(alias="totalWithMepArs")
    savings_ars: float = Field(alias="savingsArs")
    savings_percentage: float = Field(alias="savingsPercentage")
    is_recommended: bool = Field(alias="isRecommended")


class OriginalPrice(BaseSchema):
    amount: float
    currency: Currency


class TaxCalculationResult(BaseSchema):
    category: TaxCategory
    payment_method: PaymentMethod = Field(alias="paymentMethod")
    province: ProvinceCode
    original_price: OriginalPrice = Field(alias="originalPrice")
    base_ars: float = Field(alias="baseArs")
    exchange_rate_used: Optional[float] = Field(default=None, alias="exchangeRateUsed")
    taxes: List[TaxItem]
    total_ars: float = Field(alias="totalArs")
    mep_comparison: Optional[MepComparison] = Field(default=None, alias="mepComparison")
    notes: List[str] = Field(default_factory=list)


class TaxCalculationInput(BaseSchema):
    amount: float
    currency: Currency
    category: TaxCategory
    payment_method: Optional[PaymentMethod] = Field(default="TARJETA_ARS", alias="paymentMethod")
    province: Optional[ProvinceCode] = "OTRA"
    rates: ExchangeRates
    is_audio_visual_service: Optional[bool] = Field(default=False, alias="isAudioVisualService")
    customs_duty_usd: Optional[float] = Field(default=0.0, alias="customsDutyUsd")


class ScrapeRequest(BaseSchema):
    url: str
    province: Optional[ProvinceCode] = "OTRA"
    payment_method: Optional[PaymentMethod] = Field(default="TARJETA_ARS", alias="paymentMethod")


class ScrapedProduct(BaseSchema):
    title: str
    amount: float
    currency: str
    is_digital_service: bool = Field(default=True, alias="isDigitalService")
    domain: str
    thumbnail: Optional[str] = None
    category: Optional[TaxCategory] = None


class ScrapeAndCalculateResponse(BaseSchema):
    scraped: ScrapedProduct
    calculation: TaxCalculationResult


# Subscription Catalog Models
class ProviderPlan(BaseSchema):
    name: str
    price: float
    currency: Currency
    period: Literal["monthly", "yearly", "one-time"]


class DigitalProvider(BaseSchema):
    id: str
    name: str
    category: TaxCategory
    default_currency: Currency = Field(alias="defaultCurrency")
    is_audio_visual: bool = Field(alias="isAudioVisual")
    is_listed_in_arca_annex_ii: bool = Field(alias="isListedInArcaAnnexII")
    domain: str
    plans: Optional[List[ProviderPlan]] = None
    notes: Optional[str] = None


class CalculatedPlan(BaseSchema):
    name: str
    period: str
    calculation: TaxCalculationResult


class CalculatedProviderService(BaseSchema):
    id: str
    name: str
    category: TaxCategory
    domain: str
    plans: List[CalculatedPlan]
    notes: Optional[str] = None

