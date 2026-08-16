import { describe, expect, it } from "vitest";
import { computeBreakdown, computeTarjetaRate, IVA_RATE, PROVINCES } from "../tax";

describe("computeTarjetaRate", () => {
  it("aplica 30% (RG 5617) sobre el oficial, vigente desde ene. 2026", () => {
    expect(computeTarjetaRate(1000)).toBeCloseTo(1300, 2);
  });
});

describe("computeBreakdown", () => {
  it("aplica IVA aunque no sea una plataforma extranjera", () => {
    const result = computeBreakdown(1000, "BA", false);
    expect(result.iva).toBeCloseTo(1000 * IVA_RATE, 6);
    expect(result.iibb).toBe(0);
    expect(result.total).toBeCloseTo(1210, 6);
  });

  it("suma IIBB cuando es una compra en plataforma extranjera y la provincia tiene alícuota", () => {
    const result = computeBreakdown(1000, "CBA", true); // Córdoba: 3%
    expect(result.iibb).toBeCloseTo(30, 6);
    expect(result.total).toBeCloseTo(1000 + 210 + 30, 6);
  });

  it("no suma IIBB en Entre Ríos (sin régimen específico confirmado)", () => {
    const result = computeBreakdown(1000, "ER", true);
    expect(result.iibb).toBe(0);
  });

  it("no suma IIBB si el precio no vino de una plataforma extranjera, aunque la provincia tenga alícuota", () => {
    const result = computeBreakdown(1000, "CBA", false);
    expect(result.iibb).toBe(0);
  });

  it("nunca da un total negativo o NaN para precios válidos", () => {
    const result = computeBreakdown(0, "BA", true);
    expect(result.total).toBe(0);
    expect(Number.isNaN(result.total)).toBe(false);
  });
});

describe("PROVINCES", () => {
  it("incluye Entre Ríos", () => {
    expect(PROVINCES.ER).toBeDefined();
    expect(PROVINCES.ER.label).toBe("Entre Ríos");
  });
});
