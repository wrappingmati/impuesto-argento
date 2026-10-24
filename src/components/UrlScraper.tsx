// src/components/UrlScraper.tsx
import React, { useState } from "react";
import { Link2, Loader2, Clipboard, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
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
    color: "text-[#66c0f4] border-[#66c0f4]/40 bg-[#171a21]/90",
    url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
  },
  {
    label: "PC Game Pass",
    platform: "Xbox",
    color: "text-emerald-300 border-emerald-500/40 bg-[#0f2415]/90",
    url: "https://www.xbox.com/es-AR/xbox-game-pass/pc-game-pass",
  },
  {
    label: "Counter-Strike 2",
    platform: "Steam",
    color: "text-[#66c0f4] border-[#66c0f4]/40 bg-[#171a21]/90",
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
        title: "¡Precio obtenido con éxito!",
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
        <div className="relative flex items-center group">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#74ACDF] transition-colors">
            <Link2 className="w-4 h-4" />
          </div>
          <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="Pegá el link de Steam, PlayStation, Xbox o Nintendo..."
            className="bg-[#080D1A] border-slate-700/80 hover:border-slate-600 focus:border-[#74ACDF] text-slate-100 placeholder:text-slate-500 pl-10 pr-24 text-xs sm:text-sm h-13 rounded-xl focus:ring-2 focus:ring-[#74ACDF]/25 transition-all shadow-inner"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            title="Pegar enlace del portapapeles"
            className="absolute right-2.5 text-xs text-[#74ACDF] hover:text-white px-3 py-1.5 rounded-lg bg-[#111A2E] hover:bg-slate-700/60 border border-[#74ACDF]/30 hover:border-[#74ACDF] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#74ACDF]" />
            <span className="font-semibold">Pegar</span>
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full h-12 bg-gradient-to-r from-[#74ACDF] to-[#5B9CD6] hover:from-[#8ec6f7] hover:to-[#6bb0ed] text-slate-950 text-sm font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#74ACDF]/25 hover:shadow-[#74ACDF]/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-wider"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analizando precio y desglosando impuestos...</span>
            </>
          ) : (
            <>
              <span>Calcular impuestos</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-fade-in shadow-inner">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="space-y-1">
            <p className="font-bold text-red-200">No pudimos leer este link automáticamente</p>
            <p className="text-[11px] text-red-300/80 leading-relaxed">{error}</p>
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="text-[11px] font-bold text-[#74ACDF] hover:underline pt-1 inline-block"
              >
                Ingresar precio de forma manual →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enlaces de ejemplo rápidos con estética de chips gamer */}
      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-medium text-slate-500">Ejemplos:</span>
        {EXAMPLE_URLS.map((item) => (
          <button
            key={item.url}
            type="button"
            onClick={() => {
              setUrl(item.url);
              handleScrape(item.url);
            }}
            disabled={loading}
            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-[1.03] active:scale-100 ${item.color}`}
          >
            <span className="font-mono text-[10px] font-bold uppercase">{item.platform}</span>
            <span className="text-slate-200">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
