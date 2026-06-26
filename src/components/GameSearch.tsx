// src/components/GameSearch.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DollarSign, Package } from "lucide-react";
import type { DolarRates } from "./DolarInfo";

type CurrencyMode = "ars" | "usd";
type DolarType = "blue" | "oficial" | "tarjeta";

interface GameSearchProps {
  onSave: (game: { name: string; price: number; thumbnail: string; usdPrice?: number; dolarType?: DolarType }) => void;
  dolarRates: DolarRates;
}

export default function GameSearch({ onSave, dolarRates }: GameSearchProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("ars");
  const [dolarType, setDolarType] = useState<DolarType>("tarjeta");

  const getRate = (): number | null => {
    return dolarRates[dolarType];
  };

  const getArsPrice = (): number | null => {
    const p = parseFloat(price);
    if (isNaN(p)) return null;
    if (currencyMode === "ars") return p;
    const rate = getRate();
    if (!rate) return null;
    return p * rate;
  };

  const arsPreview = getArsPrice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const arsPrice = getArsPrice();
    if (!name.trim() || !price.trim() || !arsPrice) return;

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
  };

  const dolarOptions: { key: DolarType; label: string; color: string }[] = [
    { key: "oficial", label: "Oficial", color: "text-green-400" },
    { key: "blue", label: "Blue", color: "text-blue-400" },
    { key: "tarjeta", label: "Tarjeta", color: "text-yellow-400" },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="game-name">Nombre del Juego</Label>
        <Input
          id="game-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Elden Ring, GTA VI..."
          className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent"
        />
      </div>

      {/* Selector moneda */}
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
                  ? "bg-gaming-accent text-white border-gaming-accent"
                  : "bg-gaming-darker/50 text-muted-foreground border-gaming-accent/20 hover:border-gaming-accent/50"
              }`}
            >
              {mode === "ars" ? "🇦🇷 ARS" : "🇺🇸 USD"}
            </button>
          ))}
        </div>
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <Label htmlFor="game-price">
          Precio ({currencyMode === "ars" ? "ARS $" : "USD $"})
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {currencyMode === "ars" ? "ARS $" : "USD $"}
          </span>
          <Input
            id="game-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent pl-14"
          />
        </div>
      </div>

      {/* Selector tipo de dólar (solo si USD) */}
      {currencyMode === "usd" && (
        <div className="space-y-2">
          <Label>Tipo de dólar para conversión</Label>
          <div className="grid grid-cols-3 gap-2">
            {dolarOptions.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDolarType(key)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                  dolarType === key
                    ? "bg-gaming-accent/20 border-gaming-accent"
                    : "bg-gaming-darker/50 border-gaming-accent/20 hover:border-gaming-accent/40"
                }`}
              >
                <span className={color}>{label}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {dolarRates[key] ? `$${dolarRates[key]?.toFixed(0)}` : "..."}
                </div>
              </button>
            ))}
          </div>

          {/* Preview de conversión */}
          {arsPreview !== null && price && (
            <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                USD ${parseFloat(price).toFixed(2)} × ${getRate()?.toFixed(0)}
              </span>
              <span className="text-gaming-accent font-semibold">
                = ARS ${arsPreview.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* URL imagen */}
      <div className="space-y-2">
        <Label htmlFor="game-thumbnail">URL de imagen (opcional)</Label>
        <Input
          id="game-thumbnail"
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://..."
          className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gaming-accent hover:bg-gaming-accent/90 font-semibold"
        disabled={!name.trim() || !price.trim() || (currencyMode === "usd" && !getRate())}
      >
        Calcular y Guardar
      </Button>
    </form>
  );
}