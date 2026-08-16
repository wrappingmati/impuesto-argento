// src/components/GameSearch.tsx
import { useState } from "react";
import { DollarSign } from "lucide-react";
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

type CurrencyMode = "ars" | "usd";

interface GameSearchProps {
  onSave: (game: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: DolarType;
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
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("ars");
  const [dolarType, setDolarType] = useState<DolarType>("tarjeta");
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

    onSave({
      name: name.trim(),
      price: arsPrice,
      thumbnail: thumbnail || "/placeholder.svg",
      usdPrice: currencyMode === "usd" ? parseFloat(price) : undefined,
      dolarType: currencyMode === "usd" ? dolarType : undefined,
    });

    setName("");
    setPrice("");
    setThumbnail("");
    setTouched(false);
  };

  const dolarOptions: { key: DolarType; label: string; className: string }[] = [
    { key: "oficial", label: "Oficial", className: "text-oficial" },
    { key: "blue", label: "Blue", className: "text-blue" },
    { key: "tarjeta", label: "Tarjeta", className: "text-tarjeta" },
  ];

  return (
    <form onSubmit={handleSubmit} className="ticket w-full max-w-md p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="game-name">Nombre del juego</Label>
        <Input
          id="game-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Elden Ring, GTA VI..."
        />
      </div>

      <div className="space-y-2">
        <Label>Tu provincia (para la percepción de IIBB)</Label>
        <Select value={province} onValueChange={(v) => onProvinceChange(v as ProvinceCode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROVINCES).map(([code, info]) => (
              <SelectItem key={code} value={code}>
                {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Moneda del precio</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["ars", "usd"] as CurrencyMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCurrencyMode(mode)}
              className={`py-2 px-4 rounded-lg text-sm font-semibold border transition-all ${
                currencyMode === mode
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white/5 text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {mode === "ars" ? "🇦🇷 ARS" : "🇺🇸 USD"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="game-price">
          Precio ({currencyMode === "ars" ? "ARS $" : "USD $"})
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-nums">
            {currencyMode === "ars" ? "ARS $" : "USD $"}
          </span>
          <Input
            id="game-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="0.00"
            className="pl-16 font-nums"
            aria-invalid={!!priceError}
          />
        </div>
        {priceError && <p className="text-xs text-destructive">{priceError}</p>}
      </div>

      {currencyMode === "usd" && (
        <div className="space-y-2">
          <Label>Tipo de dólar para conversión</Label>
          <div className="grid grid-cols-3 gap-2">
            {dolarOptions.map(({ key, label, className }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDolarType(key)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                  dolarType === key
                    ? "bg-white/10 border-primary"
                    : "bg-white/5 border-border hover:border-primary/40"
                }`}
              >
                <span className={className}>{label}</span>
                <div className="text-xs text-muted-foreground mt-0.5 font-nums">
                  {dolarRates[key] ? `$${dolarRates[key]?.toFixed(0)}` : "..."}
                </div>
              </button>
            ))}
          </div>

          {arsPreview !== null && price && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 flex justify-between items-center text-sm font-nums">
              <span className="text-muted-foreground">
                USD ${parseFloat(price).toFixed(2)} × ${getRate()?.toFixed(0)}
              </span>
              <span className="text-primary font-semibold">
                = ARS ${arsPreview.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="game-thumbnail">URL de imagen (opcional)</Label>
        <Input
          id="game-thumbnail"
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="https://..."
          aria-invalid={!!thumbnailError}
        />
        {thumbnailError && <p className="text-xs text-destructive">{thumbnailError}</p>}
      </div>

      <Button type="submit" className="w-full font-semibold" disabled={!canSubmit}>
        <DollarSign className="w-4 h-4 mr-1" />
        Calcular y guardar
      </Button>
    </form>
  );
}
