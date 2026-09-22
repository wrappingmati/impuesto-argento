// src/lib/tax-engine/providers.ts
import type { Currency, TaxCategory } from "./types";

export interface ProviderPlan {
  name: string;
  price: number;
  currency: Currency;
  period: "monthly" | "yearly" | "one-time";
}

export interface DigitalProvider {
  id: string;
  name: string;
  category: TaxCategory;
  defaultCurrency: Currency;
  isAudioVisual: boolean; // Para IIBB reducido (ej. Santa Fe 3%)
  isListedInArcaAnnexII: boolean; // ¿Está en el listado oficial de prestadores de servicios digitales del exterior (RG 4240)?
  domain: string;
  plans?: ProviderPlan[];
  notes?: string;
}

/**
 * Catálogo de los principales prestadores de servicios digitales consumidos en Argentina.
 * Sirve de fuente de verdad para scrapers y para el catálogo pre-cacheado de la web.
 */
export const POPULAR_PROVIDERS: DigitalProvider[] = [
  // --- STREAMING & AUDIOVISUAL ---
  {
    id: "netflix",
    name: "Netflix",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: true,
    isListedInArcaAnnexII: true,
    domain: "netflix.com",
    notes: "Factura nominalmente en ARS pero procesa como prestador del exterior vía banco emisor.",
    plans: [
      { name: "Básico", price: 4299, currency: "ARS", period: "monthly" },
      { name: "Estándar", price: 7199, currency: "ARS", period: "monthly" },
      { name: "Premium", price: 9699, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: true,
    isListedInArcaAnnexII: true,
    domain: "spotify.com",
    notes: "Precios de planes en ARS sujetos a 21% IVA + 30% RG 5617 + IIBB provincial.",
    plans: [
      { name: "Individual", price: 2499, currency: "ARS", period: "monthly" },
      { name: "Dúo", price: 3299, currency: "ARS", period: "monthly" },
      { name: "Familiar", price: 4199, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: true,
    isListedInArcaAnnexII: true,
    domain: "youtube.com",
    plans: [
      { name: "Individual", price: 1899, currency: "ARS", period: "monthly" },
      { name: "Familiar", price: 3699, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "disney-plus",
    name: "Disney+ / Star+",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: true,
    isListedInArcaAnnexII: true,
    domain: "disneyplus.com",
    plans: [
      { name: "Estándar", price: 3999, currency: "ARS", period: "monthly" },
      { name: "Premium", price: 6699, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "max",
    name: "Max (HBO)",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: true,
    isListedInArcaAnnexII: true,
    domain: "max.com",
    plans: [
      { name: "Básico con Anuncios", price: 2190, currency: "ARS", period: "monthly" },
      { name: "Estándar", price: 2890, currency: "ARS", period: "monthly" },
      { name: "Platino", price: 3490, currency: "ARS", period: "monthly" },
    ],
  },

  // --- GAMING ---
  {
    id: "steam",
    name: "Steam",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "store.steampowered.com",
    notes: "Dolarizado en LATAM-USD desde noviembre de 2023.",
  },
  {
    id: "playstation",
    name: "PlayStation Store",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "store.playstation.com",
    notes: "Precios de juegos y PS Plus siempre en dólares estadounidenses (USD).",
  },
  {
    id: "xbox",
    name: "Xbox / Microsoft Store",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "xbox.com",
    notes: "Muestra precios en pesos argentinos sin impuestos. En la tarjeta entra con 21% IVA + 30% RG 5617 + IIBB.",
    plans: [
      { name: "PC Game Pass", price: 5399, currency: "ARS", period: "monthly" },
      { name: "Game Pass Ultimate", price: 8999, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo eShop Argentina",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "nintendo.com",
    notes: "Tienda regional en ARS sin impuestos agregados en la web.",
  },
  {
    id: "epic-games",
    name: "Epic Games Store",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "store.epicgames.com",
  },

  // --- IA, SOFTWARE & DEV TOOLS ---
  {
    id: "chatgpt",
    name: "ChatGPT Plus / OpenAI",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "openai.com",
    plans: [
      { name: "Plus", price: 20, currency: "USD", period: "monthly" },
      { name: "Team", price: 25, currency: "USD", period: "monthly" },
      { name: "Pro", price: 200, currency: "USD", period: "monthly" },
    ],
  },
  {
    id: "claude",
    name: "Claude Pro / Anthropic",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "anthropic.com",
    plans: [
      { name: "Pro", price: 20, currency: "USD", period: "monthly" },
    ],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "midjourney.com",
    plans: [
      { name: "Basic", price: 10, currency: "USD", period: "monthly" },
      { name: "Standard", price: 30, currency: "USD", period: "monthly" },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "github.com",
    plans: [
      { name: "Individual", price: 10, currency: "USD", period: "monthly" },
    ],
  },
  {
    id: "google-one",
    name: "Google One / Drive",
    category: "DIGITAL_SERVICE_ARS_FOREIGN",
    defaultCurrency: "ARS",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "one.google.com",
    plans: [
      { name: "100 GB", price: 1199, currency: "ARS", period: "monthly" },
      { name: "2 TB", price: 3999, currency: "ARS", period: "monthly" },
    ],
  },
  {
    id: "apple-icloud",
    name: "Apple iCloud+ / Apple One",
    category: "DIGITAL_SERVICE_USD",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: true,
    domain: "apple.com",
    plans: [
      { name: "50 GB", price: 0.99, currency: "USD", period: "monthly" },
      { name: "200 GB", price: 2.99, currency: "USD", period: "monthly" },
      { name: "2 TB", price: 9.99, currency: "USD", period: "monthly" },
    ],
  },

  // --- E-COMMERCE & BIENES FÍSICOS ---
  {
    id: "amazon-us",
    name: "Amazon USA",
    category: "PHYSICAL_GOOD_COURIER",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: false,
    domain: "amazon.com",
    notes: "Bienes físicos enviados por Courier o servicio internacional.",
  },
  {
    id: "aliexpress",
    name: "AliExpress",
    category: "PHYSICAL_GOOD_POSTAL",
    defaultCurrency: "USD",
    isAudioVisual: false,
    isListedInArcaAnnexII: false,
    domain: "aliexpress.com",
    notes: "Compras postales puerta a puerta. Sujetas a franquicia Correo Argentino.",
  },
];

export function findProviderByDomainOrName(query: string): DigitalProvider | undefined {
  const clean = query.trim().toLowerCase();
  return POPULAR_PROVIDERS.find(
    (p) =>
      p.id.toLowerCase() === clean ||
      p.name.toLowerCase().includes(clean) ||
      p.domain.toLowerCase().includes(clean)
  );
}

