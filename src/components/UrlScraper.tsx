// src/components/UrlScraper.tsx
import React, { useState } from "react";
import { Link2, Search, Loader2, Clipboard, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scrapeAndCalculateApi, type ScrapeAndCalculateResponse } from "@/lib/api";
import type { ProvinceCode } from "@/lib/tax";
import type { PaymentMethod } from "@/lib/tax-engine";
import { useToast } from "@/hooks/use-toast";

interface UrlScraperProps {
  province: ProvinceCode;
  paymentMethod: PaymentMethod;
  onResult: (data: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: "tarjeta" | "oficial" | "blue";
    isForeignDigitalService: boolean;
    calculation?: ScrapeAndCalculateResponse["calculation"];
  }) => void;
  onSwitchToManual?: () => void;
}

const EXAMPLE_URLS = [
  {
    label: "Baldur's Gate 3",
    platform: "Steam",
    url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
  },
  {
    label: "PC Game Pass",
    platform: "Xbox",
    url: "https://www.xbox.com/es-AR/xbox-game-pass/pc-game-pass",
  },
  {
    label: "Counter-Strike 2",
    platform: "Steam",
    url: "https://store.steampowered.com/app/730/CounterStrike_2/",
  },
];

export default function UrlScraper({
  province,
  paymentMethod,
  onResult,
  onSwitchToManual,
}: UrlScraperProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http://") || text.startsWith("https://")) {
        setUrl(text);
        setError(null);
      } else {
        toast({
          title: "URL inválida",
          description: "El portapapeles no contiene un enlace web.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Permiso denegado",
        description: "Pegá el enlace manualmente en el campo.",
      });
    }
  };

  const handleScrape = async (targetUrl = url) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    setLoading(true);
    setError(null);

    try {
      const result = await scrapeAndCalculateApi(cleanUrl, province, paymentMethod);
      const { scraped, calculation } = result;

      onResult({
        name: scraped.title,
        price: calculation.baseArs,
        thumbnail: scraped.thumbnail || "/placeholder.svg",
        usdPrice: scraped.currency === "USD" ? scraped.amount : undefined,
        dolarType: "oficial",
        isForeignDigitalService: scraped.isDigitalService,
        calculation,
      });

      toast({
        title: "¡Precio obtenido!",
        description: `${scraped.title} (${scraped.currency} \$${scraped.amount}).`,
      });
    } catch (err) {
      console.error("Error scraping:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo extraer la información del enlace provisto.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScrape();
        }}
        className="space-y-3"
      >
        <div className="relative flex items-center">
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="Pegá el link de Steam, PlayStation, Xbox o Nintendo..."
            className="bg-[#0A0F1D] border-slate-700/80 text-slate-100 placeholder:text-slate-500 pr-24 text-xs sm:text-sm h-12 rounded-xl focus:border-[#74ACDF] focus:ring-1 focus:ring-[#74ACDF]/20 transition-all"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            title="Pegar del portapapeles"
            className="absolute right-2.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#111A2E] hover:bg-slate-700/60 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#74ACDF]" />
            <span>Pegar</span>
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full h-12 bg-[#74ACDF] hover:bg-[#5B9CD6] text-slate-950 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#74ACDF]/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Extrayendo precio de la tienda...</span>
            </>
          ) : (
            <>
              <span>Calcular impuestos</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="space-y-0.5">
            <p className="font-medium text-red-200">No pudimos leer este link automáticamente</p>
            <p className="text-[11px] text-red-300/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Enlaces de ejemplo rápidos */}
      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="text-[11px] text-slate-500">Ejemplos:</span>
        {EXAMPLE_URLS.map((item) => (
          <button
            key={item.url}
            type="button"
            onClick={() => {
              setUrl(item.url);
              handleScrape(item.url);
            }}
            disabled={loading}
            className="text-[11px] text-slate-300 hover:text-white bg-[#0A0F1D] hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="text-[#74ACDF] font-mono text-[10px]">{item.platform}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
