// src/lib/tax.ts
// Única fuente de verdad para alícuotas y cálculo de precio final.
// Si cambia una norma fiscal, se toca ESTE archivo y nada más.
//
// Fuentes verificadas en agosto de 2026:
// - RG 5617/2024 (ARCA): percepción del 30% a cuenta de Ganancias/Bienes
//   Personales sobre consumos con tarjeta en moneda extranjera. Hasta el
//   1/1/2026 convivía con el Impuesto PAÍS (otro 30%), que venció por ley
//   el 2/1/2026 y ya NO se cobra. Por eso el "dólar tarjeta" pasó de
//   oficial×1.60 a oficial×1.30.
// - Decreto 813/2018 (IVA servicios digitales del exterior): 21%, sin
//   cambios.
// - Percepción de IIBB sobre servicios digitales de sujetos no residentes:
//   régimen provincial, no todas las provincias lo aplican. Tabla de
//   alícuotas relevada de normativa de cada fisco (ver comentario junto a
//   cada provincia). Entre Ríos (ATER) no tiene, a la fecha, un régimen
//   específico de percepción sobre servicios digitales del exterior.

export type DolarType = "blue" | "oficial" | "tarjeta";

export type ProvinceCode =
  | "CABA"
  | "BA"
  | "CBA"
  | "SF"
  | "ER"
  | "MZA"
  | "CHA"
  | "LP"
  | "NQN"
  | "RN"
  | "SAL"
  | "TF"
  | "OTRA";

interface ProvinceInfo {
  label: string;
  /** Percepción de IIBB sobre servicios digitales de sujetos no residentes (juegos, streaming, software, etc.). */
  iibbRate: number;
  /** Normativa que la establece, para que se pueda verificar. */
  source: string;
}

export const PROVINCES: Record<ProvinceCode, ProvinceInfo> = {
  CABA: { label: "Ciudad de Buenos Aires", iibbRate: 0.02, source: "R. (AGIP) 312/2019" },
  BA: { label: "Buenos Aires (provincia)", iibbRate: 0.02, source: "RN (ARBA) 38/2019" },
  CBA: { label: "Córdoba", iibbRate: 0.03, source: "Decreto 775/2018" },
  SF: { label: "Santa Fe", iibbRate: 0.045, source: "RG (API) 30/2025 — 3% audiovisual / 4,5% resto" },
  ER: { label: "Entre Ríos", iibbRate: 0, source: "ATER: sin régimen específico confirmado sobre servicios digitales del exterior" },
  MZA: { label: "Mendoza", iibbRate: 0, source: "sin régimen específico confirmado sobre servicios digitales del exterior" },
  CHA: { label: "Chaco", iibbRate: 0.055, source: "RG (ATP) 2046/2020" },
  LP: { label: "La Pampa", iibbRate: 0.01, source: "RG (DGR) 14/2019" },
  NQN: { label: "Neuquén", iibbRate: 0.04, source: "R. (DPR) 1/2022" },
  RN: { label: "Río Negro", iibbRate: 0.05, source: "R. (ART) 808/2020" },
  SAL: { label: "Salta", iibbRate: 0.036, source: "RG (DGR) 34/2018" },
  TF: { label: "Tierra del Fuego", iibbRate: 0.03, source: "RG (AREF) 929/2022" },
  OTRA: { label: "Otra / no estoy seguro", iibbRate: 0, source: "consultá el fisco de tu provincia" },
};

export const IVA_RATE = 0.21;

/**
 * Percepción RG 5617/2024 (ARCA) a cuenta de Ganancias/Bienes Personales
 * sobre consumos con tarjeta en moneda extranjera. Vigente desde el
 * 2/1/2026 en soledad (30%), tras el vencimiento del Impuesto PAÍS.
 */
export const TARJETA_PERCEPCION_RATE = 0.3;

export function computeTarjetaRate(oficial: number): number {
  return Math.round(oficial * (1 + TARJETA_PERCEPCION_RATE) * 100) / 100;
}

export interface PriceBreakdown {
  base: number;
  iva: number;
  iibb: number;
  total: number;
  province: ProvinceCode;
}

/**
 * Calcula el desglose de un precio base en ARS.
 *
 * - IVA (21%) se aplica siempre.
 * - IIBB por servicios digitales del exterior se aplica solo si el precio
 *   se originó en una plataforma extranjera (isForeignDigitalService),
 *   independientemente de con qué cotización se haya convertido a pesos:
 *   la percepción grava el consumo del servicio, no el mecanismo de
 *   conversión de moneda.
 * - La percepción RG 5617 (30%) del dólar tarjeta NO se sub-aplica acá:
 *   ya está incorporada en la cotización "tarjeta" (ver computeTarjetaRate),
 *   así que sumarla de nuevo sobre el total sería contarla dos veces.
 */
export function computeBreakdown(
  basePriceArs: number,
  province: ProvinceCode = "OTRA",
  isForeignDigitalService: boolean = false
): PriceBreakdown {
  const iva = basePriceArs * IVA_RATE;
  const iibbRate = isForeignDigitalService ? PROVINCES[province].iibbRate : 0;
  const iibb = basePriceArs * iibbRate;
  const total = basePriceArs + iva + iibb;

  return { base: basePriceArs, iva, iibb, total, province };
}

export function convertUsdToArs(usdPrice: number, rate: number): number {
  return usdPrice * rate;
}

export function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
