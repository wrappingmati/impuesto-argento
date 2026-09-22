import { PROVINCE_TAX_REGIMES } from "./provinces";
import { getTaxConfig } from "./config";
import type {
  MepComparison,
  PaymentMethod,
  ProvinceCode,
  TaxCalculationInput,
  TaxCalculationResult,
  TaxItem,
} from "./types";

export const IVA_DIGITAL_RATE = 0.21;
export const GANANCIAS_RG5617_RATE = 0.30;

/**
 * Motor de cálculo tributario argentino de alta precisión.
 */
export function calculateArgentineTaxes(input: TaxCalculationInput): TaxCalculationResult {
  const config = getTaxConfig();
  const ivaRate = config.national?.ivaDigitalRate ?? IVA_DIGITAL_RATE;
  const gananciasRate = config.national?.gananciasRg5617Rate ?? GANANCIAS_RG5617_RATE;
  const provinceRegimes = config.provinces ?? PROVINCE_TAX_REGIMES;

  const {
    amount,
    currency,
    category,
    paymentMethod = "TARJETA_ARS",
    province = "OTRA",
    rates,
    isAudioVisualService = false,
  } = input;

  const taxes: TaxItem[] = [];
  const notes: string[] = [];

  // 1. Determinar el tipo de cambio y la base imponible en ARS
  let exchangeRateUsed: number | null = null;
  let baseArs = 0;

  if (currency === "USD") {
    // Para consumos en moneda extranjera, la base imponible legal de impuestos se calcula sobre el Dólar Oficial
    exchangeRateUsed = rates.oficial;
    baseArs = amount * rates.oficial;
  } else if (currency === "ARS") {
    exchangeRateUsed = 1;
    baseArs = amount;
  } else if (currency === "EUR") {
    // Estimación EUR: aproximado 1.08 USD o conversión directa si fuera provista
    const eurToUsd = 1.08;
    exchangeRateUsed = rates.oficial * eurToUsd;
    baseArs = amount * exchangeRateUsed;
  }

  // 2. Cálculo según la categoría fiscal
  switch (category) {
    case "DIGITAL_SERVICE_USD": {
      // A) IVA Servicios Digitales (21%)
      const ivaAmount = Math.round(baseArs * ivaRate * 100) / 100;
      taxes.push({
        id: "iva-21",
        name: `IVA Servicios Digitales (${(ivaRate * 100).toFixed(0)}%)`,
        rate: ivaRate,
        amountArs: ivaAmount,
        appliedOnArs: baseArs,
        legalReference: "Decreto 813/2018 (Reglamentario Ley de IVA)",
        isWithholding: false,
        description: "Aplica sobre el valor neto de la suscripción/juego liquidado en dólares al cambio oficial.",
      });

      // B) Percepción Ganancias/Bienes Personales (RG 5617 - 30%)
      if (paymentMethod === "TARJETA_ARS") {
        const gananciasAmount = Math.round(baseArs * gananciasRate * 100) / 100;
        taxes.push({
          id: "rg-5617-30",
          name: `Percepción Ganancias / Bienes Personales (${(gananciasRate * 100).toFixed(0)}%)`,
          rate: gananciasRate,
          amountArs: gananciasAmount,
          appliedOnArs: baseArs,
          legalReference: "RG (ARCA) 5617/2024",
          isWithholding: true,
          description: "Percepción a cuenta del Impuesto a las Ganancias o Bienes Personales. Recuperable anualmente.",
        });
      } else {
        notes.push("Pago con Dólares propios (MEP) desde caja de ahorro: Exento de percepción RG 5617 (30%).");
      }

      // C) Percepción de Ingresos Brutos (IIBB) Provincial
      const iibbInfo = provinceRegimes[province] || provinceRegimes.OTRA || PROVINCE_TAX_REGIMES.OTRA;
      let iibbRate = iibbInfo.digitalServicesIibbRate;
      if (province === "SF" && isAudioVisualService) {
        iibbRate = iibbInfo.audiovisualIibbRate ?? 0.03; // 3% para streaming audiovisual en Santa Fe
      }

      if (iibbRate > 0) {
        const iibbAmount = Math.round(baseArs * iibbRate * 100) / 100;
        taxes.push({
          id: `iibb-${province.toLowerCase()}`,
          name: `Percepción IIBB (${iibbInfo.label}) (${(iibbRate * 100).toFixed(1)}%)`,
          rate: iibbRate,
          amountArs: iibbAmount,
          appliedOnArs: baseArs,
          legalReference: iibbInfo.source,
          isWithholding: true,
          description: iibbInfo.notes,
        });
      }
      break;
    }

    case "DIGITAL_SERVICE_ARS_FOREIGN": {
      // Servicios como Netflix, Xbox, Spotify que muestran precios en ARS pero son prestadores del exterior (RG 4240)
      const ivaAmount = Math.round(baseArs * ivaRate * 100) / 100;
      taxes.push({
        id: "iva-21",
        name: `IVA Servicios Digitales (${(ivaRate * 100).toFixed(0)}%)`,
        rate: ivaRate,
        amountArs: ivaAmount,
        appliedOnArs: baseArs,
        legalReference: "Decreto 813/2018 y RG (AFIP) 4240 (Anexo II)",
        isWithholding: false,
        description: "Prestador extranjero listado por ARCA que factura nominalmente en pesos.",
      });

      // El banco retiene el 30% a cuenta de Ganancias aunque el precio esté en ARS
      if (paymentMethod === "TARJETA_ARS") {
        const gananciasAmount = Math.round(baseArs * gananciasRate * 100) / 100;
        taxes.push({
          id: "rg-5617-30",
          name: `Percepción Ganancias / Bienes Personales (${(gananciasRate * 100).toFixed(0)}%)`,
          rate: gananciasRate,
          amountArs: gananciasAmount,
          appliedOnArs: baseArs,
          legalReference: "RG (ARCA) 5617/2024",
          isWithholding: true,
          description: "Aplica sobre el valor en pesos por tratarse de un prestador no residente.",
        });
      }

      const iibbInfo = provinceRegimes[province] || provinceRegimes.OTRA || PROVINCE_TAX_REGIMES.OTRA;
      let iibbRate = iibbInfo.digitalServicesIibbRate;
      if (province === "SF" && isAudioVisualService) {
        iibbRate = iibbInfo.audiovisualIibbRate ?? 0.03;
      }

      if (iibbRate > 0) {
        const iibbAmount = Math.round(baseArs * iibbRate * 100) / 100;
        taxes.push({
          id: `iibb-${province.toLowerCase()}`,
          name: `Percepción IIBB (${iibbInfo.label}) (${(iibbRate * 100).toFixed(1)}%)`,
          rate: iibbRate,
          amountArs: iibbAmount,
          appliedOnArs: baseArs,
          legalReference: iibbInfo.source,
          isWithholding: true,
          description: iibbInfo.notes,
        });
      }
      break;
    }

    case "PHYSICAL_GOOD_COURIER": {
      // Bienes físicos (Amazon, Tiendamia): NO pagan IVA en el resumen de la tarjeta
      if (paymentMethod === "TARJETA_ARS") {
        const gananciasAmount = Math.round(baseArs * gananciasRate * 100) / 100;
        taxes.push({
          id: "rg-5617-30",
          name: `Percepción Ganancias / Bienes Personales (${(gananciasRate * 100).toFixed(0)}%)`,
          rate: gananciasRate,
          amountArs: gananciasAmount,
          appliedOnArs: baseArs,
          legalReference: "RG (ARCA) 5617/2024",
          isWithholding: true,
          description: "Percepción por compra de bienes en el exterior con tarjeta en pesos.",
        });
      }

      notes.push(
        "En compras de bienes físicos el IVA no se percibe en la tarjeta de crédito; los impuestos y aranceles de importación se liquidan en aduana o están incluidos en la tarifa del courier."
      );
      break;
    }

    case "DIGITAL_SERVICE_LOCAL": {
      // Empresa local argentina: no hay percepción del 30% ni IIBB de exterior
      notes.push("Servicio nacional facturado en pesos por empresa argentina con CUIT.");
      break;
    }

    case "PHYSICAL_GOOD_POSTAL": {
      if (paymentMethod === "TARJETA_ARS") {
        const gananciasAmount = Math.round(baseArs * gananciasRate * 100) / 100;
        taxes.push({
          id: "rg-5617-30",
          name: `Percepción Ganancias / Bienes Personales (${(gananciasRate * 100).toFixed(0)}%)`,
          rate: gananciasRate,
          amountArs: gananciasAmount,
          appliedOnArs: baseArs,
          legalReference: "RG (ARCA) 5617/2024",
          isWithholding: true,
        });
      }
      notes.push("Régimen Puerta a Puerta Correo Argentino: franquicia anual de USD 50 por envío. 50% sobre el excedente en el portal de Correo.");
      break;
    }
  }

  // 3. Sumar total
  const totalTaxesArs = taxes.reduce((acc, t) => acc + t.amountArs, 0);
  const totalArs = Math.round((baseArs + totalTaxesArs) * 100) / 100;

  // 4. Comparativa con Dólar MEP (si la moneda es USD y tenemos cotización MEP)
  let mepComparison: MepComparison | undefined;
  if (currency === "USD" && rates.mep && rates.mep > 0) {
    // Si paga con MEP:
    // Paga `amount * mepRate` + los impuestos que no dependan del pago en pesos (ej. IVA 21% e IIBB calculados al oficial)
    const nonCardTaxes = taxes
      .filter((t) => t.id !== "rg-5617-30")
      .reduce((acc, t) => acc + t.amountArs, 0);

    const totalWithMepArs = Math.round((amount * rates.mep + nonCardTaxes) * 100) / 100;
    const savingsArs = Math.round((totalArs - totalWithMepArs) * 100) / 100;
    const savingsPercentage = totalArs > 0 ? Math.round((savingsArs / totalArs) * 1000) / 10 : 0;

    mepComparison = {
      mepRate: rates.mep,
      totalWithMepArs,
      savingsArs,
      savingsPercentage,
      isRecommended: savingsArs > 0,
    };
  }

  return {
    category,
    paymentMethod,
    province,
    originalPrice: { amount, currency },
    baseArs,
    exchangeRateUsed,
    taxes,
    totalArs,
    mepComparison,
    notes,
  };
}

