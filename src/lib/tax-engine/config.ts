// src/lib/tax-engine/config.ts
import type { ProvinceCode, ProvinceTaxInfo } from "./types";
import { PROVINCE_TAX_REGIMES } from "./provinces";

export interface NationalTaxConfig {
  ivaDigitalRate: number;
  gananciasRg5617Rate: number;
  impuestoPaisRate: number;
  impuestoPaisExpired: boolean;
  impuestoPaisExpiryDate?: string;
  notes?: string;
}

export interface TaxConfig {
  version: string;
  updatedAt: string;
  sourceNotice?: string;
  national: NationalTaxConfig;
  provinces: Record<ProvinceCode, ProvinceTaxInfo>;
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  version: "2026.1",
  updatedAt: "2026-09-21T00:00:00Z",
  sourceNotice: "Basado en normativa oficial ARCA/AFIP y leyes provinciales.",
  national: {
    ivaDigitalRate: 0.21,
    gananciasRg5617Rate: 0.30,
    impuestoPaisRate: 0.00,
    impuestoPaisExpired: true,
    impuestoPaisExpiryDate: "2026-01-02",
    notes: "Impuesto PAÍS vencido el 2/1/2026.",
  },
  provinces: PROVINCE_TAX_REGIMES,
};

let currentTaxConfig: TaxConfig = DEFAULT_TAX_CONFIG;

/**
 * Retorna la configuración impositiva activa en memoria.
 */
export function getTaxConfig(): TaxConfig {
  return currentTaxConfig;
}

/**
 * Actualiza la configuración impositiva en memoria.
 */
export function setTaxConfig(config: Partial<TaxConfig>): void {
  currentTaxConfig = {
    ...currentTaxConfig,
    ...config,
    national: {
      ...currentTaxConfig.national,
      ...(config.national || {}),
    },
    provinces: {
      ...currentTaxConfig.provinces,
      ...(config.provinces || {}),
    },
  };
}

/**
 * Carga dinámicamente la configuración impositiva desde /tax-config.json o una URL remota.
 * Si falla la red, mantiene de forma segura los valores por defecto.
 */
export async function loadRemoteTaxConfig(url = "/tax-config.json"): Promise<TaxConfig> {
  if (typeof window === "undefined" || !window.fetch) {
    return currentTaxConfig;
  }

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      return currentTaxConfig;
    }
    const data = (await res.json()) as TaxConfig;
    if (data && data.national && typeof data.national.ivaDigitalRate === "number") {
      setTaxConfig(data);
    }
  } catch {
    // Si no hay conexión o falla el endpoint remoto, opera con los defaults sin romper la UI
  }

  return currentTaxConfig;
}

