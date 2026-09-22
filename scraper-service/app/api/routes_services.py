"""Subscriptions catalog API route with pre-calculated taxes."""

from typing import List, Optional
from fastapi import APIRouter, Query

from app.core.tax_engine import calculate_argentine_taxes
from app.models.schemas import (
    CalculatedPlan,
    CalculatedProviderService,
    PaymentMethod,
    ProvinceCode,
    TaxCalculationInput,
)
from app.scrapers.platforms.subscriptions import POPULAR_PROVIDERS
from .routes_rates import fetch_exchange_rates

router = APIRouter(prefix="/services", tags=["Services & Subscriptions"])


@router.get("", response_model=List[CalculatedProviderService], summary="List popular subscription services with calculated taxes")
async def get_services(
    province: ProvinceCode = Query(default="OTRA", description="Target Argentine province for IIBB calculations"),
    payment_method: PaymentMethod = Query(default="TARJETA_ARS", alias="paymentMethod", description="Payment method: TARJETA_ARS or DOLAR_MEP_CUENTA"),
) -> List[CalculatedProviderService]:
    """Return popular subscription services (Netflix, Spotify, ChatGPT, Steam, etc.)

    with their respective plans and fully computed Argentine tax breakdowns.
    """
    rates = await fetch_exchange_rates()
    results: List[CalculatedProviderService] = []

    for provider in POPULAR_PROVIDERS:
        if not provider.plans:
            continue

        calculated_plans: List[CalculatedPlan] = []
        for plan in provider.plans:
            calc_input = TaxCalculationInput(
                amount=plan.price,
                currency=plan.currency,
                category=provider.category,
                paymentMethod=payment_method,
                province=province,
                rates=rates,
                isAudioVisualService=provider.is_audio_visual,
            )
            calc_result = calculate_argentine_taxes(calc_input)
            calculated_plans.append(
                CalculatedPlan(
                    name=plan.name,
                    period=plan.period,
                    calculation=calc_result,
                )
            )

        results.append(
            CalculatedProviderService(
                id=provider.id,
                name=provider.name,
                category=provider.category,
                domain=provider.domain,
                plans=calculated_plans,
                notes=provider.notes,
            )
        )

    return results

