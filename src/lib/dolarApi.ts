// src/lib/dolarApi.ts
// Cliente de cotizaciones con reintento, timeout, fallback a un segundo
// proveedor y caché en localStorage para no dejar al usuario sin datos
// si ambas APIs fallan.

import { computeTarjetaRate, type DolarType } from "./tax";

export interface DolarRates {
  blue: number | null;
  oficial: number | null;
  tarjeta: number | null;
}

export interface DolarResult {
  rates: DolarRates;
  source: "bluelytics" | "dolarapi" | "cache";
  fetchedAt: number;
}

const CACHE_KEY = "impuesto-argento:dolar-cache:v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos
const FETCH_TIMEOUT_MS = 6000;

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

async function fetchBluelytics(): Promise<DolarRates> {
  const { signal, cancel } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.bluelytics.com.ar/v2/latest", { signal });
    if (!res.ok) throw new Error(`bluelytics respondió ${res.status}`);
    const data = await res.json();
    const oficial = data?.oficial?.value_avg;
    const blue = data?.blue?.value_avg;
    if (typeof oficial !== "number" || typeof blue !== "number") {
      throw new Error("bluelytics devolvió un formato inesperado");
    }
    return { blue, oficial, tarjeta: computeTarjetaRate(oficial) };
  } finally {
    cancel();
  }
}

/** Proveedor de respaldo: https://dolarapi.com */
async function fetchDolarApi(): Promise<DolarRates> {
  const { signal, cancel } = withTimeout(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", { signal });
    if (!res.ok) throw new Error(`dolarapi respondió ${res.status}`);
    const data: Array<{ casa: string; venta: number }> = await res.json();
    const oficial = data.find((d) => d.casa === "oficial")?.venta;
    const blue = data.find((d) => d.casa === "blue")?.venta;
    const tarjetaFromApi = data.find((d) => d.casa === "tarjeta")?.venta;
    if (typeof oficial !== "number" || typeof blue !== "number") {
      throw new Error("dolarapi devolvió un formato inesperado");
    }
    return {
      blue,
      oficial,
      tarjeta: tarjetaFromApi ?? computeTarjetaRate(oficial),
    };
  } finally {
    cancel();
  }
}

function readCache(): DolarResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DolarResult;
    if (
      typeof parsed?.fetchedAt !== "number" ||
      typeof parsed?.rates !== "object"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(result: DolarResult) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {
    // localStorage puede estar lleno o bloqueado (modo privado); no es fatal.
  }
}

/**
 * Trae las cotizaciones probando bluelytics primero y dolarapi.com como
 * respaldo. Si ambas fallan, devuelve la última cotización cacheada
 * (marcada como `source: "cache"`) en vez de dejar la UI vacía.
 */
export async function fetchDolarRates(): Promise<DolarResult> {
  try {
    const rates = await fetchBluelytics();
    const result: DolarResult = { rates, source: "bluelytics", fetchedAt: Date.now() };
    writeCache(result);
    return result;
  } catch (primaryError) {
    try {
      const rates = await fetchDolarApi();
      const result: DolarResult = { rates, source: "dolarapi", fetchedAt: Date.now() };
      writeCache(result);
      return result;
    } catch (fallbackError) {
      const cached = readCache();
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS * 6) {
        return { ...cached, source: "cache" };
      }
      console.error("Fallaron ambas APIs de cotización:", primaryError, fallbackError);
      throw new Error(
        "No se pudo obtener la cotización del dólar (bluelytics y dolarapi.com fallaron)."
      );
    }
  }
}

export function isStale(result: DolarResult): boolean {
  return Date.now() - result.fetchedAt > CACHE_TTL_MS;
}

export type { DolarType };
