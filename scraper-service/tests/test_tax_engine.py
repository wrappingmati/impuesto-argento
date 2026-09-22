"""Unit tests for the Argentine Tax Engine."""

import pytest
from app.core.tax_engine import (
    calculate_argentine_taxes,
    PROVINCE_TAX_REGIMES,
    IVA_DIGITAL_RATE,
    GANANCIAS_RG5617_RATE,
)
from app.models.schemas import ExchangeRates, TaxCalculationInput


@pytest.fixture
def mock_rates() -> ExchangeRates:
    return ExchangeRates(
        oficial=1000.0,
        tarjeta=1300.0,
        mep=1150.0,
        blue=1200.0,
    )


def test_province_regimes_coverage():
    """Verify all 24 Argentine provinces plus OTRA exist in table."""
    assert len(PROVINCE_TAX_REGIMES) >= 25
    assert "CABA" in PROVINCE_TAX_REGIMES
    assert "BA" in PROVINCE_TAX_REGIMES
    assert "SF" in PROVINCE_TAX_REGIMES
    assert "CBA" in PROVINCE_TAX_REGIMES
    assert "OTRA" in PROVINCE_TAX_REGIMES
    assert PROVINCE_TAX_REGIMES["CABA"].digital_services_iibb_rate == 0.02
    assert PROVINCE_TAX_REGIMES["BA"].digital_services_iibb_rate == 0.02
    assert PROVINCE_TAX_REGIMES["CBA"].digital_services_iibb_rate == 0.03


def test_usd_digital_service_tarjeta_ars(mock_rates):
    """Test 10 USD game on Steam with ARS credit card in CABA."""
    calc_input = TaxCalculationInput(
        amount=10.0,
        currency="USD",
        category="DIGITAL_SERVICE_USD",
        paymentMethod="TARJETA_ARS",
        province="CABA",
        rates=mock_rates,
    )

    result = calculate_argentine_taxes(calc_input)

    # Base ARS = 10 * 1000 = 10,000
    assert result.base_ars == 10000.0

    tax_ids = [t.id for t in result.taxes]
    assert "iva-21" in tax_ids
    assert "rg-5617-30" in tax_ids
    assert "iibb-caba" in tax_ids

    # IVA = 2100, Ganancias = 3000, IIBB CABA (2%) = 200
    # Total = 10,000 + 5,300 = 15,300
    assert result.total_ars == 15300.0

    # MEP comparison:
    # MEP cost = 10 * 1150 + 2100 (IVA) + 200 (IIBB) = 13,800
    # Savings = 15,300 - 13,800 = 1,500
    assert result.mep_comparison is not None
    assert result.mep_comparison.total_with_mep_ars == 13800.0
    assert result.mep_comparison.savings_ars == 1500.0
    assert result.mep_comparison.is_recommended is True


def test_usd_digital_service_mep_payment(mock_rates):
    """Test paying with Dólar MEP from savings account (RG 5617 exemption)."""
    calc_input = TaxCalculationInput(
        amount=10.0,
        currency="USD",
        category="DIGITAL_SERVICE_USD",
        paymentMethod="DOLAR_MEP_CUENTA",
        province="BA",
        rates=mock_rates,
    )

    result = calculate_argentine_taxes(calc_input)

    tax_ids = [t.id for t in result.taxes]
    assert "iva-21" in tax_ids
    assert "rg-5617-30" not in tax_ids  # EXEMPT
    assert "iibb-ba" in tax_ids

    # Base: 10,000 + 2,100 (IVA) + 200 (IIBB) = 12,300
    assert result.total_ars == 12300.0
    assert any("Exento de percepción" in note for note in result.notes)


def test_santa_fe_audiovisual_reduced_rate(mock_rates):
    """Santa Fe general rate is 4.5%, but 3% for streaming (isAudioVisualService=True)."""
    # General service (e.g. ChatGPT)
    general_input = TaxCalculationInput(
        amount=10.0,
        currency="USD",
        category="DIGITAL_SERVICE_USD",
        province="SF",
        rates=mock_rates,
        isAudioVisualService=False,
    )
    gen_result = calculate_argentine_taxes(general_input)
    sf_tax_gen = next(t for t in gen_result.taxes if t.id == "iibb-sf")
    assert sf_tax_gen.rate == 0.045
    assert sf_tax_gen.amount_ars == 450.0

    # Audiovisual service (e.g. Netflix)
    audio_input = TaxCalculationInput(
        amount=10.0,
        currency="USD",
        category="DIGITAL_SERVICE_USD",
        province="SF",
        rates=mock_rates,
        isAudioVisualService=True,
    )
    audio_result = calculate_argentine_taxes(audio_input)
    sf_tax_audio = next(t for t in audio_result.taxes if t.id == "iibb-sf")
    assert sf_tax_audio.rate == 0.03
    assert sf_tax_audio.amount_ars == 300.0


def test_foreign_service_billed_in_ars(mock_rates):
    """Test service like Spotify / Netflix that quotes prices in ARS (RG 4240)."""
    calc_input = TaxCalculationInput(
        amount=5000.0,
        currency="ARS",
        category="DIGITAL_SERVICE_ARS_FOREIGN",
        paymentMethod="TARJETA_ARS",
        province="CBA",
        rates=mock_rates,
    )

    result = calculate_argentine_taxes(calc_input)
    assert result.base_ars == 5000.0
    assert result.exchange_rate_used == 1.0

    # IVA 21% = 1050, Ganancias 30% = 1500, IIBB Córdoba 3% = 150
    # Total = 5000 + 2700 = 7700
    assert result.total_ars == 7700.0


def test_physical_good_courier(mock_rates):
    """Test Amazon purchase via Courier: No IVA on card, only 30% Ganancias."""
    calc_input = TaxCalculationInput(
        amount=100.0,
        currency="USD",
        category="PHYSICAL_GOOD_COURIER",
        paymentMethod="TARJETA_ARS",
        province="CABA",
        rates=mock_rates,
    )

    result = calculate_argentine_taxes(calc_input)
    tax_ids = [t.id for t in result.taxes]

    assert "iva-21" not in tax_ids
    assert "rg-5617-30" in tax_ids
    assert result.base_ars == 100000.0
    # Ganancias = 30,000. Total = 130,000
    assert result.total_ars == 130000.0

