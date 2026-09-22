// src/components/GameSearch.tsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
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
  onProvinceChange,
}: GameSearchProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
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
    !!name.trim() &&
    !!price.trim() &&
    !!arsPreview &&
    (currencyMode === "ars" || !!getRate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const arsPrice = getArsPrice();
    if (!name.trim() || !arsPrice) return;

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
      name: name.trim(),
      price: calc ? calc.baseArs : arsPrice,
      thumbnail: thumbnail || "/placeholder.svg",
      usdPrice: isUsd ? numPrice : undefined,
      dolarType: isUsd ? dolarType : undefined,
      isForeignDigitalService: isUsd ? true : isForeignDigitalService,
      calculation: calc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {/* Nombre */}
        <div className="space-y-1">
          <Label htmlFor="manual-name" className="text-xs font-medium text-slate-300">
            Nombre del juego o servicio
          </Label>
          <Input
            id="manual-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mortal Kombat 1, Nintendo Switch Online..."
            className="bg-[#0b0e14] border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-xs h-11 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
            required
          />
        </div>

        {/* Moneda y Precio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-300">Moneda</Label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0b0e14] border border-white/[0.08] rounded-xl h-11">
              <button
                type="button"
                onClick={() => setCurrencyMode("usd")}
                className={`text-xs font-medium rounded-lg transition-all ${
                  currencyMode === "usd"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                USD (Dólar)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode("ars")}
                className={`text-xs font-medium rounded-lg transition-all ${
                  currencyMode === "ars"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ARS (Pesos)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-price" className="text-xs font-medium text-slate-300">
              Precio original
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-slate-400 font-mono">
                {currencyMode === "usd" ? "US$" : "$"}
              </span>
              <Input
                id="manual-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setTouched(true);
                }}
                placeholder="0.00"
                className="bg-[#0b0e14] border-white/[0.08] text-slate-100 placeholder:text-slate-500 pl-10 text-xs h-11 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                required
              />
            </div>
            {priceError && <p className="text-[11px] text-red-400">{priceError}</p>}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 mt-1 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Calcular desglose</span>
        </Button>
      </div>
    </form>
  );
}
