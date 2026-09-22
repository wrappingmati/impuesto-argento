// src/lib/api.ts
import type { ProvinceCode } from "@/lib/tax";
import type { PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface ScrapedProductInfo {
  title: string;
  amount: number;
  currency: string;
  domain: string;
  thumbnail?: string;
  isDigitalService: boolean;
}

export interface ScrapeAndCalculateResponse {
  scraped: ScrapedProductInfo;
  calculation: TaxCalculationResult;
}

export interface CatalogPlan {
  name: string;
  price: number;
  currency: string;
  period: string;
  calculation: TaxCalculationResult;
}

export interface CatalogService {
  id: string;
  name: string;
  category: string;
  defaultCurrency: string;
  isAudioVisual: boolean;
  domain: string;
  plans: CatalogPlan[];
  notes?: string;
}

/**
 * Verifica si el microservicio de scraping en FastAPI está online.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Scrapea una URL arbitraria y calcula el desglose impositivo argentino.
 */
export async function scrapeAndCalculateApi(
  url: string,
  province: ProvinceCode = "OTRA",
  paymentMethod: PaymentMethod = "TARJETA_ARS"
): Promise<ScrapeAndCalculateResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/scrape-and-calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      province,
      paymentMethod,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error al procesar la URL (código ${res.status})`);
  }

  return res.json();
}

/**
 * Obtiene el catálogo de suscripciones pre-calculadas con impuestos para la provincia y método de pago.
 */
export async function fetchServicesCatalogApi(
  province: ProvinceCode = "OTRA",
  paymentMethod: PaymentMethod = "TARJETA_ARS"
): Promise<CatalogService[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/services?province=${province}&paymentMethod=${paymentMethod}`
  );

  if (!res.ok) {
    throw new Error(`No se pudo cargar el catálogo de servicios (código ${res.status})`);
  }

  return res.json();
}

