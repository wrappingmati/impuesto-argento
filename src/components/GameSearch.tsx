// src/components/GameSearch.tsx
import React, { useState } from "react";
import { DollarSign, Edit3, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const isValidThumbnail = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };
  const thumbnailError =
    touched && thumbnail.trim() && !isValidThumbnail(thumbnail)
      ? "Tiene que ser una URL https:// válida."
      : null;

  const canSubmit =
    !!name.trim() &&
    !!price.trim() &&
    !!arsPreview &&
    isValidThumbnail(thumbnail) &&
    (currencyMode === "ars" || !!getRate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const arsPrice = getArsPrice();
    if (!name.trim() || !arsPrice || !isValidThumbnail(thumbnail)) return;

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

    setName("");
    setPrice("");
    setThumbnail("");
    setTouched(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4"
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-violet-400" />
          <span>Ingreso manual de producto</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Completá el nombre y el valor para simular compras en cualquier plataforma que no admita scraping directo.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="game-name" className="text-xs text-slate-300">
            Nombre del ítem
          </Label>
          <Input
            id="game-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mortal Kombat 1, Nintendo Switch Online..."
            className="bg-[#0F1626] border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-10 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-200"
            required
          />
        </div>

        {/* Moneda y Precio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Moneda original</Label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0F1626] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setCurrencyMode("usd")}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  currencyMode === "usd"
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                USD (Dólares)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyMode("ars")}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  currencyMode === "ars"
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ARS (Pesos)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="game-price" className="text-xs text-slate-300">
              Precio {currencyMode === "usd" ? "en dólares (USD)" : "en pesos (ARS)"}
            </Label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-slate-500 font-mono">
                {currencyMode === "usd" ? "US$" : "$"}
              </span>
              <Input
                id="game-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setTouched(true);
                }}
                placeholder="0.00"
                className="bg-[#0F1626] border-slate-800 text-slate-100 placeholder:text-slate-500 pl-10 text-xs h-10 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-200 font-mono"
                required
              />
            </div>
            {priceError && <p className="text-[11px] text-red-400">{priceError}</p>}
          </div>
        </div>

        {/* Imagen opcional */}
        <div className="space-y-1.5">
          <Label htmlFor="game-thumbnail" className="text-xs text-slate-300 flex items-center justify-between">
            <span>URL de portada (opcional)</span>
            <span className="text-[10px] text-slate-500">https://...</span>
          </Label>
          <Input
            id="game-thumbnail"
            type="url"
            value={thumbnail}
            onChange={(e) => {
              setThumbnail(e.target.value);
              setTouched(true);
            }}
            placeholder="https://images.example.com/cover.jpg"
            className="bg-[#0F1626] border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-10 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-200"
          />
          {thumbnailError && <p className="text-[11px] text-red-400">{thumbnailError}</p>}
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2"
        >
          <Plus className="w-4 h-4" />
          <span>Calcular y mostrar desglose</span>
        </Button>
      </div>
    </form>
  );
}
