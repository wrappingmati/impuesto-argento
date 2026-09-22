// src/lib/tax-engine/types.ts
/**
 * Motor Tributario Argentino - Definición de Tipos y Modelos Fiscales
 * Actualizado a normativas vigentes (Post-vencimiento Impuesto PAÍS, RG 5617/2024 ARCA).
 */

export type Currency = "ARS" | "USD" | "EUR";

export type TaxCategory =
  | "DIGITAL_SERVICE_USD"          // Ej: Steam, PlayStation Store, ChatGPT Plus, Midjourney, Claude Pro
  | "DIGITAL_SERVICE_ARS_FOREIGN"  // Ej: Xbox Store, Netflix, Spotify, YouTube Premium (muestran ARS pero son prestadores del exterior RG 4240)
  | "DIGITAL_SERVICE_LOCAL"        // Ej: Flow, Telecom, hosting local con CUIT (IVA incluido o 21% local, sin percepciones del 30%)
  | "PHYSICAL_GOOD_COURIER"        // Ej: Amazon, Tiendamia (bienes físicos vía Courier privado)
  | "PHYSICAL_GOOD_POSTAL";        // Ej: AliExpress, eBay (correo postal oficial / puerta a puerta)

export type PaymentMethod =
  | "TARJETA_ARS"         // Pago del resumen en pesos: aplica percepción 30% RG 5617
  | "DOLAR_MEP_CUENTA";   // Pago del resumen con dólares propios (MEP) desde caja de ahorro: EXENTO de percepción 30% RG 5617

export type ProvinceCode =
  | "CABA" | "BA"  | "CBA" | "SF"  | "ER"  | "MZA"
  | "CHA"  | "LP"  | "NQN" | "RN"  | "SAL" | "TF"
  | "COR"  | "MIS" | "JUJ" | "TUC" | "SL"  | "SJ"
  | "CAT"  | "LR"  | "SDE" | "CHU" | "SC"  | "FORM"
  | "OTRA";

export interface ProvinceTaxInfo {
  code: ProvinceCode;
  label: string;
  digitalServicesIibbRate: number; // Tasa de percepción sobre servicios digitales
  generalIibbRate?: number;
  source: string;
  notes?: string;
}

export interface ExchangeRates {
  oficial: number;
  tarjeta: number;
  mep?: number | null;
  blue?: number | null;
}

export interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amountArs: number;
  appliedOnArs: number;
  legalReference: string;
  isWithholding: boolean; // ¿Es pago a cuenta deducible en Ganancias / Bienes Personales?
  description?: string;
}

export interface MepComparison {
  mepRate: number;
  totalWithMepArs: number;
  savingsArs: number;
  savingsPercentage: number;
  isRecommended: boolean;
}

export interface TaxCalculationResult {
  category: TaxCategory;
  paymentMethod: PaymentMethod;
  province: ProvinceCode;
  originalPrice: {
    amount: number;
    currency: Currency;
  };
  baseArs: number;
  exchangeRateUsed: number | null;
  taxes: TaxItem[];
  totalArs: number;
  mepComparison?: MepComparison;
  notes: string[];
}

export interface TaxCalculationInput {
  amount: number;
  currency: Currency;
  category: TaxCategory;
  paymentMethod?: PaymentMethod;
  province?: ProvinceCode;
  rates: ExchangeRates;
  isAudioVisualService?: boolean; // Para provincias como Santa Fe con alícuota reducida (3% vs 4.5%)
  customsDutyUsd?: number;        // Para bienes físicos (arancel aduanero)
}

