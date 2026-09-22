"""Argentine Tax Engine - Python Port of the TypeScript Tax Calculator.

Accurate implementation according to current ARCA / AFIP regulations (Post Impuesto PAIS,
RG 5617/2024, Decree 813/2018, and provincial IIBB resolutions).
"""

from typing import Dict, List, Optional
from app.models.schemas import (
    ExchangeRates,
    MepComparison,
    OriginalPrice,
    PaymentMethod,
    ProvinceCode,
    ProvinceTaxInfo,
    TaxCalculationInput,
    TaxCalculationResult,
    TaxCategory,
    TaxItem,
)

import json
import logging
from pathlib import Path

logger = logging.getLogger("scraper_service.tax_engine")

IVA_DIGITAL_RATE = 0.21
GANANCIAS_RG5617_RATE = 0.30

# Attempt dynamic load from app/data/tax_config.json
_DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "tax_config.json"
if _DATA_FILE.exists():
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as _f:
            _cfg = json.load(_f)
            _nat = _cfg.get("national", {})
            if "ivaDigitalRate" in _nat:
                IVA_DIGITAL_RATE = float(_nat["ivaDigitalRate"])
            if "gananciasRg5617Rate" in _nat:
                GANANCIAS_RG5617_RATE = float(_nat["gananciasRg5617Rate"])
            logger.info("Loaded tax rates from %s (IVA=%.2f, Ganancias=%.2f)", _DATA_FILE.name, IVA_DIGITAL_RATE, GANANCIAS_RG5617_RATE)
    except Exception as _exc:
        logger.warning("Could not parse %s, using defaults: %s", _DATA_FILE, _exc)

# Table of Provincial Gross Income (IIBB) withholdings on Foreign Digital Services
PROVINCE_TAX_REGIMES: Dict[ProvinceCode, ProvinceTaxInfo] = {
    "CABA": ProvinceTaxInfo(
        code="CABA",
        label="Ciudad Autónoma de Buenos Aires",
        digitalServicesIibbRate=0.02,
        source="Resolución (AGIP) 312/2019",
        notes="Alícuota general del 2% para prestadores de servicios digitales no residentes.",
    ),
    "BA": ProvinceTaxInfo(
        code="BA",
        label="Buenos Aires (Provincia)",
        digitalServicesIibbRate=0.02,
        source="Resolución Normativa (ARBA) 38/2019",
        notes="Alícuota del 2% para sujetos prestadores de servicios digitales del exterior.",
    ),
    "CBA": ProvinceTaxInfo(
        code="CBA",
        label="Córdoba",
        digitalServicesIibbRate=0.03,
        source="Decreto 775/2018 y Ley Tarifaria Provincial",
        notes="3% de percepción practicada por entidades emisoras de tarjetas.",
    ),
    "SF": ProvinceTaxInfo(
        code="SF",
        label="Santa Fe",
        digitalServicesIibbRate=0.045,  # 4.5% general, 3% audiovisual
        source="Resolución General (API) 30/2025 y Ley Impositiva Anual",
        notes="4,5% para servicios en general; 3% para servicios audiovisuales y streaming (Netflix/Spotify).",
    ),
    "CHA": ProvinceTaxInfo(
        code="CHA",
        label="Chaco",
        digitalServicesIibbRate=0.055,
        source="Resolución General (ATP) 2046/2020",
        notes="Alícuota del 5,5% sobre el precio neto de la operación.",
    ),
    "LP": ProvinceTaxInfo(
        code="LP",
        label="La Pampa",
        digitalServicesIibbRate=0.01,
        source="Resolución General (DGR) 14/2019",
        notes="1% de percepción sobre liquidaciones de tarjetas.",
    ),
    "NQN": ProvinceTaxInfo(
        code="NQN",
        label="Neuquén",
        digitalServicesIibbRate=0.04,
        source="Resolución (DPR) 1/2022",
        notes="4% para servicios digitales prestados desde el exterior.",
    ),
    "RN": ProvinceTaxInfo(
        code="RN",
        label="Río Negro",
        digitalServicesIibbRate=0.05,
        source="Resolución (ART) 808/2020",
        notes="5% sobre el valor neto facturado.",
    ),
    "SAL": ProvinceTaxInfo(
        code="SAL",
        label="Salta",
        digitalServicesIibbRate=0.036,
        source="Resolución General (DGR) 34/2018",
        notes="3,6% de percepción.",
    ),
    "TF": ProvinceTaxInfo(
        code="TF",
        label="Tierra del Fuego",
        digitalServicesIibbRate=0.03,
        source="Resolución General (AREF) 929/2022",
        notes="3% sobre servicios digitales no residentes.",
    ),
    "TUC": ProvinceTaxInfo(
        code="TUC",
        label="Tucumán",
        digitalServicesIibbRate=0.05,
        source="Resolución General (DGR) 143/2021",
        notes="5% para sujetos radicados en el exterior.",
    ),
    "MZA": ProvinceTaxInfo(
        code="MZA",
        label="Mendoza",
        digitalServicesIibbRate=0.0,
        source="ATM Mendoza",
        notes="Sin régimen específico formal de percepción sobre servicios digitales del exterior.",
    ),
    "ER": ProvinceTaxInfo(
        code="ER",
        label="Entre Ríos",
        digitalServicesIibbRate=0.0,
        source="ATER Entre Ríos",
        notes="Sin régimen específico formal de percepción sobre servicios digitales del exterior.",
    ),
    "COR": ProvinceTaxInfo(
        code="COR",
        label="Corrientes",
        digitalServicesIibbRate=0.0,
        source="DGR Corrientes",
        notes="Sin régimen de percepción activo a través de tarjetas.",
    ),
    "MIS": ProvinceTaxInfo(
        code="MIS",
        label="Misiones",
        digitalServicesIibbRate=0.0,
        source="DGR Misiones",
        notes="Sin régimen específico generalizado para consumidores finales.",
    ),
    "JUJ": ProvinceTaxInfo(
        code="JUJ",
        label="Jujuy",
        digitalServicesIibbRate=0.03,
        source="Resolución General (DPR) 1572/2020",
        notes="3% de percepción.",
    ),
    "SL": ProvinceTaxInfo(
        code="SL",
        label="San Luis",
        digitalServicesIibbRate=0.02,
        source="DPIPN San Luis",
        notes="2% régimen general de percepciones con tarjeta.",
    ),
    "SJ": ProvinceTaxInfo(
        code="SJ",
        label="San Juan",
        digitalServicesIibbRate=0.03,
        source="Resolución (DGR) 1100/2021",
        notes="3% sobre servicios digitales.",
    ),
    "CAT": ProvinceTaxInfo(
        code="CAT",
        label="Catamarca",
        digitalServicesIibbRate=0.03,
        source="ARCA Catamarca",
        notes="3% de alícuota sobre operaciones con el exterior.",
    ),
    "LR": ProvinceTaxInfo(
        code="LR",
        label="La Rioja",
        digitalServicesIibbRate=0.025,
        source="DGIP La Rioja",
        notes="2,5% de percepción.",
    ),
    "SDE": ProvinceTaxInfo(
        code="SDE",
        label="Santiago del Estero",
        digitalServicesIibbRate=0.03,
        source="DGR Santiago del Estero",
        notes="3% sobre servicios digitales.",
    ),
    "CHU": ProvinceTaxInfo(
        code="CHU",
        label="Chubut",
        digitalServicesIibbRate=0.03,
        source="DGR Chubut",
        notes="3% sobre consumos del exterior.",
    ),
    "SC": ProvinceTaxInfo(
        code="SC",
        label="Santa Cruz",
        digitalServicesIibbRate=0.03,
        source="ASIP Santa Cruz",
        notes="3% de percepción.",
    ),
    "FORM": ProvinceTaxInfo(
        code="FORM",
        label="Formosa",
        digitalServicesIibbRate=0.03,
        source="DGR Formosa",
        notes="3% sobre servicios digitales.",
    ),
    "OTRA": ProvinceTaxInfo(
        code="OTRA",
        label="Otra jurisdicción / No informado",
        digitalServicesIibbRate=0.0,
        source="Valor de referencia",
        notes="Consultá la alícuota en el organismo recaudador de tu provincia.",
    ),
}


def calculate_argentine_taxes(input_data: TaxCalculationInput) -> TaxCalculationResult:
    """Calculate Argentine taxes for digital services, foreign purchases, and subscriptions.

    Implements exact tax rules:
    - Base imponible in ARS based on currency and official rate
    - IVA 21% (RG 4240 / Dec 813/2018)
    - Percepción Ganancias RG 5617 30% (exempt if paying with Dólar MEP)
    - Provincial IIBB withholdings
    - Comparative MEP savings analysis
    """
    amount = input_data.amount
    currency = input_data.currency
    category = input_data.category
    payment_method = input_data.payment_method or "TARJETA_ARS"
    province = input_data.province or "OTRA"
    rates = input_data.rates
    is_audio_visual_service = bool(input_data.is_audio_visual_service)

    taxes: List[TaxItem] = []
    notes: List[str] = []

    # 1. Determine exchange rate and base imponible in ARS
    exchange_rate_used: Optional[float] = None
    base_ars: float = 0.0

    if currency == "USD":
        exchange_rate_used = rates.oficial
        base_ars = round(amount * rates.oficial, 2)
    elif currency == "ARS":
        exchange_rate_used = 1.0
        base_ars = round(amount, 2)
    elif currency == "EUR":
        eur_to_usd = 1.08
        exchange_rate_used = round(rates.oficial * eur_to_usd, 2)
        base_ars = round(amount * exchange_rate_used, 2)

    # 2. Calculation by category
    if category == "DIGITAL_SERVICE_USD":
        # A) IVA Servicios Digitales (21%)
        iva_amount = round(base_ars * IVA_DIGITAL_RATE, 2)
        taxes.append(
            TaxItem(
                id="iva-21",
                name="IVA Servicios Digitales (21%)",
                rate=IVA_DIGITAL_RATE,
                amountArs=iva_amount,
                appliedOnArs=base_ars,
                legalReference="Decreto 813/2018 (Reglamentario Ley de IVA)",
                isWithholding=False,
                description="Aplica sobre el valor neto de la suscripción/juego liquidado en dólares al cambio oficial.",
            )
        )

        # B) Percepción Ganancias/Bienes Personales (RG 5617 - 30%)
        if payment_method == "TARJETA_ARS":
            ganancias_amount = round(base_ars * GANANCIAS_RG5617_RATE, 2)
            taxes.append(
                TaxItem(
                    id="rg-5617-30",
                    name="Percepción Ganancias / Bienes Personales (30%)",
                    rate=GANANCIAS_RG5617_RATE,
                    amountArs=ganancias_amount,
                    appliedOnArs=base_ars,
                    legalReference="RG (ARCA) 5617/2024",
                    isWithholding=True,
                    description="Percepción a cuenta del Impuesto a las Ganancias o Bienes Personales. Recuperable anualmente.",
                )
            )
        else:
            notes.append("Pago con Dólares propios (MEP) desde caja de ahorro: Exento de percepción RG 5617 (30%).")

        # C) Percepción IIBB Provincial
        iibb_info = PROVINCE_TAX_REGIMES.get(province, PROVINCE_TAX_REGIMES["OTRA"])
        iibb_rate = iibb_info.digital_services_iibb_rate
        if province == "SF" and is_audio_visual_service:
            iibb_rate = 0.03  # 3% for streaming in Santa Fe

        if iibb_rate > 0:
            iibb_amount = round(base_ars * iibb_rate, 2)
            taxes.append(
                TaxItem(
                    id=f"iibb-{province.lower()}",
                    name=f"Percepción IIBB ({iibb_info.label}) ({iibb_rate * 100:.1f}%)",
                    rate=iibb_rate,
                    amountArs=iibb_amount,
                    appliedOnArs=base_ars,
                    legalReference=iibb_info.source,
                    isWithholding=True,
                    description=iibb_info.notes,
                )
            )

    elif category == "DIGITAL_SERVICE_ARS_FOREIGN":
        # Services like Netflix, Spotify, Xbox in ARS from foreign entities
        iva_amount = round(base_ars * IVA_DIGITAL_RATE, 2)
        taxes.append(
            TaxItem(
                id="iva-21",
                name="IVA Servicios Digitales (21%)",
                rate=IVA_DIGITAL_RATE,
                amountArs=iva_amount,
                appliedOnArs=base_ars,
                legalReference="Decreto 813/2018 y RG (AFIP) 4240 (Anexo II)",
                isWithholding=False,
                description="Prestador extranjero listado por ARCA que factura nominalmente en pesos.",
            )
        )

        if payment_method == "TARJETA_ARS":
            ganancias_amount = round(base_ars * GANANCIAS_RG5617_RATE, 2)
            taxes.append(
                TaxItem(
                    id="rg-5617-30",
                    name="Percepción Ganancias / Bienes Personales (30%)",
                    rate=GANANCIAS_RG5617_RATE,
                    amountArs=ganancias_amount,
                    appliedOnArs=base_ars,
                    legalReference="RG (ARCA) 5617/2024",
                    isWithholding=True,
                    description="Aplica sobre el valor en pesos por tratarse de un prestador no residente.",
                )
            )

        iibb_info = PROVINCE_TAX_REGIMES.get(province, PROVINCE_TAX_REGIMES["OTRA"])
        iibb_rate = iibb_info.digital_services_iibb_rate
        if province == "SF" and is_audio_visual_service:
            iibb_rate = 0.03

        if iibb_rate > 0:
            iibb_amount = round(base_ars * iibb_rate, 2)
            taxes.append(
                TaxItem(
                    id=f"iibb-{province.lower()}",
                    name=f"Percepción IIBB ({iibb_info.label}) ({iibb_rate * 100:.1f}%)",
                    rate=iibb_rate,
                    amountArs=iibb_amount,
                    appliedOnArs=base_ars,
                    legalReference=iibb_info.source,
                    isWithholding=True,
                    description=iibb_info.notes,
                )
            )

    elif category == "PHYSICAL_GOOD_COURIER":
        if payment_method == "TARJETA_ARS":
            ganancias_amount = round(base_ars * GANANCIAS_RG5617_RATE, 2)
            taxes.append(
                TaxItem(
                    id="rg-5617-30",
                    name="Percepción Ganancias / Bienes Personales (30%)",
                    rate=GANANCIAS_RG5617_RATE,
                    amountArs=ganancias_amount,
                    appliedOnArs=base_ars,
                    legalReference="RG (ARCA) 5617/2024",
                    isWithholding=True,
                    description="Percepción por compra de bienes en el exterior con tarjeta en pesos.",
                )
            )
        notes.append(
            "En compras de bienes físicos el IVA no se percibe en la tarjeta de crédito; "
            "los impuestos y aranceles de importación se liquidan en aduana o están incluidos en la tarifa del courier."
        )

    elif category == "DIGITAL_SERVICE_LOCAL":
        notes.append("Servicio nacional facturado en pesos por empresa argentina con CUIT.")

    elif category == "PHYSICAL_GOOD_POSTAL":
        if payment_method == "TARJETA_ARS":
            ganancias_amount = round(base_ars * GANANCIAS_RG5617_RATE, 2)
            taxes.append(
                TaxItem(
                    id="rg-5617-30",
                    name="Percepción Ganancias / Bienes Personales (30%)",
                    rate=GANANCIAS_RG5617_RATE,
                    amountArs=ganancias_amount,
                    appliedOnArs=base_ars,
                    legalReference="RG (ARCA) 5617/2024",
                    isWithholding=True,
                )
            )
        notes.append(
            "Régimen Puerta a Puerta Correo Argentino: franquicia anual de USD 50 por envío. 50% sobre el excedente en el portal de Correo."
        )

    # 3. Sum total
    total_taxes_ars = round(sum(t.amount_ars for t in taxes), 2)
    total_ars = round(base_ars + total_taxes_ars, 2)

    # 4. MEP Dollar Comparison
    mep_comparison: Optional[MepComparison] = None
    if currency == "USD" and rates.mep and rates.mep > 0:
        non_card_taxes = sum(t.amount_ars for t in taxes if t.id != "rg-5617-30")
        total_with_mep_ars = round(amount * rates.mep + non_card_taxes, 2)
        savings_ars = round(total_ars - total_with_mep_ars, 2)
        savings_percentage = round((savings_ars / total_ars) * 100, 1) if total_ars > 0 else 0.0

        mep_comparison = MepComparison(
            mepRate=rates.mep,
            totalWithMepArs=total_with_mep_ars,
            savingsArs=savings_ars,
            savingsPercentage=savings_percentage,
            isRecommended=savings_ars > 0,
        )

    return TaxCalculationResult(
        category=category,
        paymentMethod=payment_method,
        province=province,
        originalPrice=OriginalPrice(amount=amount, currency=currency),
        baseArs=base_ars,
        exchangeRateUsed=exchange_rate_used,
        taxes=taxes,
        totalArs=total_ars,
        mepComparison=mep_comparison,
        notes=notes,
    )

