// src/components/GameSearch.tsx
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import type { DolarRates } from "@/lib/dolarApi";
import { calculateArgentineTaxes, type TaxCalculationResult } from "@/lib/tax-engine";

type CurrencyMode = "ars" | "usd";

interface GameSearchProps {
  onSave: (game: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: DolarType;
    isForeignDigitalService?: boolean;
    calculation?: TaxCalculationResult;
  }) => void;
  dolarRates: DolarRates;
  province: ProvinceCode;
  onProvinceChange: (province: ProvinceCode) => void;
}

export default function GameSearch({
  onSave,
  dolarRates,
  province,
}: GameSearchProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("usd");
  const [dolarType, setDolarType] = useState<DolarType>("oficial");
  const [isForeignDigitalService, setIsForeignDigitalService] = useState(true);
  const [touched, setTouched] = useState(false);

  const getRate = (): number | null => dolarRates[dolarType];

  const getArsPrice = (): number | null => {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) return null;
    if (currencyMode === "ars") return p;
    const rate = getRate();
    if (!rate) return null;
    return p * rate;
  };

  const arsPreview = getArsPrice();
  const priceError =
    touched && price.trim() && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      ? "Ingresá un precio mayor a 0."
      : null;

  const canSubmit =
    !!price.trim() &&
    !!arsPreview &&
    (currencyMode === "ars" || !!getRate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const arsPrice = getArsPrice();
    if (!arsPrice) return;

    const numPrice = parseFloat(price);
    const isUsd = currencyMode === "usd";
    const category = isUsd
      ? "DIGITAL_SERVICE_USD"
      : isForeignDigitalService
      ? "DIGITAL_SERVICE_ARS_FOREIGN"
      : "DIGITAL_SERVICE_LOCAL";

    let calc: TaxCalculationResult | undefined;
    if (dolarRates.oficial) {
      calc = calculateArgentineTaxes({
        amount: numPrice,
        currency: isUsd ? "USD" : "ARS",
        category,
        province,
        rates: {
          oficial: dolarRates.oficial,
          tarjeta: dolarRates.tarjeta ?? dolarRates.oficial * 1.3,
          mep: dolarRates.mep,
          blue: dolarRates.blue,
        },
      });
    }

    onSave({
      name: name.trim() || (isUsd ? `Juego (US$ ${numPrice})` : `Compra ($ ${numPrice})`),
      price: calc ? calc.baseArs : arsPrice,
      thumbnail: "/placeholder.svg",
      usdPrice: isUsd ? numPrice : undefined,
      dolarType: isUsd ? dolarType : undefined,
      isForeignDigitalService: isUsd ? true : isForeignDigitalService,
      calculation: calc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {/* Nombre opcional */}
        <div className="space-y-1">
          <Label htmlFor="manual-name" className="text-xs font-medium text-slate-300">
            Nombre o título (opcional)
          </Label>
          <Input
            id="manual-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mortal Kombat 1, Nintendo Switch Online..."
            className="bg-[#0A0F1D] border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm h-11 rounded-xl focus:border-[#74ACDF] focus:ring-1 focus:ring-[#74ACDF]/20"
          />
        </div>

        {/* Input con selector de moneda integrado como en la referencia */}
        <div className="space-y-1">
          <Label htmlFor="manual-price" className="text-xs font-medium text-slate-300">
            Precio del juego o compra
          </Label>
          <div className="relative flex items-center bg-[#0A0F1D] border border-slate-800 rounded-xl overflow-hidden focus-within:border-[#74ACDF] focus-within:ring-1 focus-within:ring-[#74ACDF]/20 transition-all">
            <span className="pl-3.5 text-slate-400 font-mono text-sm">
              {currencyMode === "usd" ? "US$" : "$"}
            </span>
            <input
              id="manual-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setTouched(true);
              }}
              placeholder="59.99"
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 px-2 py-3 text-sm sm:text-base font-mono focus:outline-none"
              required
            />
            {/* Pill de Moneda */}
            <div className="pr-1.5 flex items-center">
              <select
                value={currencyMode}
                onChange={(e) => setCurrencyMode(e.target.value as CurrencyMode)}
                className="bg-[#111A2E] text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="usd">USD</option>
                <option value="ars">ARS</option>
              </select>
            </div>
          </div>
          {priceError && <p className="text-xs text-red-400">{priceError}</p>}
        </div>

        {/* Botón primario de calcular */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 bg-[#74ACDF] hover:bg-[#5B9CD6] text-slate-950 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#74ACDF]/20 mt-2"
        >
          <span>Calcular impuestos</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
