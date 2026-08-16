// src/lib/storage.ts
// Persistencia en localStorage con validación de esquema (zod) y
// versionado, para que un dato corrupto o un cambio de forma futuro
// no rompa la carga de toda la app.

import { z } from "zod";
import type { DolarType, ProvinceCode } from "./tax";

const SavedGameSchema = z.object({
  name: z.string().min(1),
  originalPrice: z.number().nonnegative(),
  thumbnail: z.string(),
  usdPrice: z.number().nonnegative().optional(),
  dolarType: z.enum(["blue", "oficial", "tarjeta"]).optional(),
  province: z.string().optional(),
  savedAt: z.number().optional(),
});

const SavedGamesFileSchema = z.object({
  version: z.literal(1),
  games: z.array(SavedGameSchema),
});

export type SavedGame = z.infer<typeof SavedGameSchema>;

const GAMES_KEY = "impuesto-argento:saved-games:v1";
const SETTINGS_KEY = "impuesto-argento:settings:v1";

export function loadSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    if (!raw) return [];
    const parsed = SavedGamesFileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn("Datos guardados con formato inválido, se descartan:", parsed.error);
      return [];
    }
    return parsed.data.games;
  } catch (err) {
    console.warn("No se pudo leer el historial guardado:", err);
    return [];
  }
}

export function persistSavedGames(games: SavedGame[]): boolean {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify({ version: 1, games }));
    return true;
  } catch (err) {
    console.error("No se pudo guardar el historial (¿localStorage lleno?):", err);
    return false;
  }
}

interface Settings {
  province: ProvinceCode;
  defaultDolarType: DolarType;
}

const DEFAULT_SETTINGS: Settings = {
  province: "ER",
  defaultDolarType: "tarjeta",
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function persistSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // no fatal
  }
}
