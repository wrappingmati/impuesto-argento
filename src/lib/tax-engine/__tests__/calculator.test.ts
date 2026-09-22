// src/lib/tax-engine/__tests__/calculator.test.ts
import { describe, expect, it } from "vitest";
import { calculateArgentineTaxes } from "../calculator";
import { findProviderByDomainOrName, POPULAR_PROVIDERS } from "../providers";
import type { ExchangeRates } from "../types";

const mockRates: ExchangeRates = {
  oficial: 1000,
  tarjeta: 1300,
  mep: 1200,
  blue: 1250,
};

describe("calculateArgentineTaxes", () => {
  describe("DIGITAL_SERVICE_USD (ej. Steam, PlayStation, ChatGPT)", () => {
    it("aplica IVA 21%, Percepción Ganancias 30% e IIBB provincial sobre base convertida a Dólar Oficial", () => {
      const result = calculateArgentineTaxes({
        amount: 20, // $20 USD
        currency: "USD",
        category: "DIGITAL_SERVICE_USD",
        paymentMethod: "TARJETA_ARS",
        province: "CABA", // 2%
        rates: mockRates,
      });

      // Base ARS: 20 * 1000 = 20.000
      expect(result.baseArs).toBe(20000);
      expect(result.exchangeRateUsed).toBe(1000);

      // IVA 21%: 4.200
      const iva = result.taxes.find((t) => t.id === "iva-21");
      expect(iva).toBeDefined();
      expect(iva?.amountArs).toBe(4200);

      // Ganancias RG 5617 (30%): 6.000
      const ganancias = result.taxes.find((t) => t.id === "rg-5617-30");
      expect(ganancias).toBeDefined();
      expect(ganancias?.amountArs).toBe(6000);

      // IIBB CABA (2%): 400
      const iibb = result.taxes.find((t) => t.id === "iibb-caba");
      expect(iibb).toBeDefined();
      expect(iibb?.amountArs).toBe(400);

      // Total: 20.000 + 4.200 + 6.000 + 400 = 30.600
      expect(result.totalArs).toBe(30600);
    });

    it("calcula la comparativa con Dólar MEP y muestra el ahorro cuando se paga con dólares propios", () => {
      const result = calculateArgentineTaxes({
        amount: 50, // $50 USD
        currency: "USD",
        category: "DIGITAL_SERVICE_USD",
        paymentMethod: "TARJETA_ARS",
        province: "BA", // 2%
        rates: mockRates, // oficial: 1000, mep: 1200, tarjeta: 1300
      });

      expect(result.mepComparison).toBeDefined();
      expect(result.mepComparison?.mepRate).toBe(1200);
      // Con tarjeta total = 50.000 + 10.500 (IVA) + 15.000 (Ganancias) + 1.000 (IIBB) = 76.500 ARS
      // Con MEP = 50 * 1200 (60.000) + 10.500 (IVA) + 1.000 (IIBB) = 71.500 ARS
      // Ahorro: 76.500 - 71.500 = 5.000 ARS
      expect(result.mepComparison?.savingsArs).toBe(5000);
      expect(result.mepComparison?.isRecommended).toBe(true);
    });

    it("exime la percepción del 30% RG 5617 si el método de pago seleccionado es DOLAR_MEP_CUENTA", () => {
      const result = calculateArgentineTaxes({
        amount: 20,
        currency: "USD",
        category: "DIGITAL_SERVICE_USD",
        paymentMethod: "DOLAR_MEP_CUENTA",
        province: "CABA",
        rates: mockRates,
      });

      const ganancias = result.taxes.find((t) => t.id === "rg-5617-30");
      expect(ganancias).toBeUndefined();
      // IVA (4.200) + IIBB (400) + Base (20.000) = 24.600
      expect(result.totalArs).toBe(24600);
    });
  });

  describe("DIGITAL_SERVICE_ARS_FOREIGN (ej. Xbox Store, Netflix, Spotify en ARS)", () => {
    it("aplica 21% IVA, 30% RG 5617 e IIBB aunque el precio esté nominalmente en pesos", () => {
      const result = calculateArgentineTaxes({
        amount: 10000, // $10.000 ARS
        currency: "ARS",
        category: "DIGITAL_SERVICE_ARS_FOREIGN",
        province: "CBA", // Córdoba 3%
        rates: mockRates,
      });

      expect(result.baseArs).toBe(10000);

      // IVA 21%: 2.100
      const iva = result.taxes.find((t) => t.id === "iva-21");
      expect(iva?.amountArs).toBe(2100);

      // Ganancias RG 5617 (30%): 3.000
      const ganancias = result.taxes.find((t) => t.id === "rg-5617-30");
      expect(ganancias?.amountArs).toBe(3000);

      // IIBB CBA (3%): 300
      const iibb = result.taxes.find((t) => t.id === "iibb-cba");
      expect(iibb?.amountArs).toBe(300);

      // Total: 10.000 + 2.100 + 3.000 + 300 = 15.400
      expect(result.totalArs).toBe(15400);
    });

    it("aplica alícuota reducida al 3% en Santa Fe para servicios audiovisuales", () => {
      const resultAudiovisual = calculateArgentineTaxes({
        amount: 10000,
        currency: "ARS",
        category: "DIGITAL_SERVICE_ARS_FOREIGN",
        province: "SF",
        isAudioVisualService: true,
        rates: mockRates,
      });

      const resultGeneral = calculateArgentineTaxes({
        amount: 10000,
        currency: "ARS",
        category: "DIGITAL_SERVICE_ARS_FOREIGN",
        province: "SF",
        isAudioVisualService: false,
        rates: mockRates,
      });

      const iibbAudiovisual = resultAudiovisual.taxes.find((t) => t.id === "iibb-sf");
      const iibbGeneral = resultGeneral.taxes.find((t) => t.id === "iibb-sf");

      expect(iibbAudiovisual?.rate).toBe(0.03); // 3%
      expect(iibbGeneral?.rate).toBe(0.045);    // 4.5%
    });

    it("no aplica IIBB en provincias sin régimen específico de servicios del exterior (ej. Entre Ríos)", () => {
      const result = calculateArgentineTaxes({
        amount: 5000,
        currency: "ARS",
        category: "DIGITAL_SERVICE_ARS_FOREIGN",
        province: "ER",
        rates: mockRates,
      });

      const iibb = result.taxes.find((t) => t.id.startsWith("iibb-"));
      expect(iibb).toBeUndefined();
    });
  });

  describe("PHYSICAL_GOOD_COURIER (ej. Amazon US, Tiendamia)", () => {
    it("no cobra IVA 21% en la tarjeta bancaria, solo percepción 30% RG 5617", () => {
      const result = calculateArgentineTaxes({
        amount: 100, // $100 USD
        currency: "USD",
        category: "PHYSICAL_GOOD_COURIER",
        province: "BA",
        rates: mockRates,
      });

      // No debe existir IVA 21% en el extracto de tarjeta
      const iva = result.taxes.find((t) => t.id === "iva-21");
      expect(iva).toBeUndefined();

      // Debe existir percepción RG 5617 del 30%: 100 * 1000 * 0.30 = 30.000
      const ganancias = result.taxes.find((t) => t.id === "rg-5617-30");
      expect(ganancias?.amountArs).toBe(30000);

      // Total: 100.000 + 30.000 = 130.000 ARS (equivalente a Oficial * 1.30)
      expect(result.totalArs).toBe(130000);
    });
  });

  describe("providers catalog", () => {
    it("encuentra proveedores por nombre o dominio", () => {
      expect(findProviderByDomainOrName("netflix")?.id).toBe("netflix");
      expect(findProviderByDomainOrName("store.steampowered.com")?.id).toBe("steam");
      expect(findProviderByDomainOrName("openai")?.id).toBe("chatgpt");
      expect(findProviderByDomainOrName("xbox")?.defaultCurrency).toBe("ARS");
    });
  });
});

