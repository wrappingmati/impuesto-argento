// src/components/UrlScraper.tsx
import React, { useState } from "react";
import { Link2, Search, Loader2, Clipboard, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
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
  onSwitchToManual: () => void;
}

const EXAMPLE_URLS = [
  {
    label: "Baldur's Gate 3 (Steam)",
    url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
  },
  {
    label: "Xbox PC Game Pass",
    url: "https://www.xbox.com/es-AR/xbox-game-pass/pc-game-pass",
  },
  {
    label: "Counter-Strike 2 (Steam)",
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
          description: "El portapapeles no contiene un enlace web válido.",
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
        title: "¡Producto encontrado!",
        description: `${scraped.title} (${scraped.currency} \$${scraped.amount}).`,
      });
    } catch (err) {
      console.error("Error scraping:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo extraer la información de la URL provista.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-5">
      {/* Encabezado del modo */}
      <div className="space-y-1">
        <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-violet-400" />
          <span>Scrapear cualquier enlace</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Pegá la URL de Steam, Microsoft Store, PlayStation, Amazon o cualquier tienda para extraer automáticamente el título y calcular el precio final en pesos.
        </p>
      </div>

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
            placeholder="https://store.steampowered.com/app/..."
            className="bg-[#0F1626] border-slate-800 text-slate-100 placeholder:text-slate-500 pr-24 text-xs h-11 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors duration-200"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            title="Pegar del portapapeles"
            className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-750/80 hover:border-slate-650 flex items-center gap-1.5 transition-colors"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Pegar</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex-1 h-10 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extrayendo información...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Calcular precio real</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onSwitchToManual}
            disabled={loading}
            className="h-10 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 rounded-xl"
          >
            Ingreso manual
          </Button>
        </div>
      </form>

      {/* Mensaje de Error si ocurre */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="space-y-1">
            <p className="font-medium">No se pudo scrapear este enlace</p>
            <p className="text-[11px] text-red-400/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Ejemplos rápidos */}
      <div className="pt-2 border-t border-slate-800/50 space-y-2">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          Probar con enlaces de ejemplo
        </span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_URLS.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => {
                setUrl(item.url);
                handleScrape(item.url);
              }}
              disabled={loading}
              className="text-[11px] text-slate-400 hover:text-slate-200 bg-[#0F1626] border border-slate-800 hover:border-violet-500/50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
