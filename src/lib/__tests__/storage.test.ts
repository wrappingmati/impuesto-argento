import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSavedGames, persistSavedGames } from "../storage";

describe("storage de juegos guardados", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve [] si no hay nada guardado", () => {
    expect(loadSavedGames()).toEqual([]);
  });

  it("persiste y vuelve a leer un juego válido", () => {
    persistSavedGames([{ name: "Hades II", originalPrice: 15000, thumbnail: "/placeholder.svg" }]);
    const loaded = loadSavedGames();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("Hades II");
  });

  it("descarta datos corruptos sin tirar una excepción", () => {
    localStorage.setItem("impuesto-argento:saved-games:v1", "{esto no es json valido");
    expect(() => loadSavedGames()).not.toThrow();
    expect(loadSavedGames()).toEqual([]);
  });

  it("descarta datos con forma inválida (ej. precio negativo)", () => {
    localStorage.setItem(
      "impuesto-argento:saved-games:v1",
      JSON.stringify({ version: 1, games: [{ name: "X", originalPrice: -5, thumbnail: "" }] })
    );
    expect(loadSavedGames()).toEqual([]);
  });
});
