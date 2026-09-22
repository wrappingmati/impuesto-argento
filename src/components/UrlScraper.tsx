// src/components/UrlScraper.tsx
import { useState } from "react";
import { Link2, Search, Loader2, Clipboard, ExternalLink, AlertCircle } from "lucide-react";
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
    label: "Steam: Baldur's Gate 3",
    url: "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
  },
  {
    label: "Steam: Counter-Strike 2",
    url: "https://store.steampowered.com/app/730/CounterStrike_2/",
  },
  {
    label: "Xbox Game Pass PC",
    url: "https://www.xbox.com/es-AR/xbox-game-pass/pc-game-pass",
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
        title: "¡Scraping exitoso!",
        description: `Se detectó ${scraped.title} (${scraped.currency} $${scraped.amount}).`,
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
    <div className="ticket w-full max-w-md p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2 text-primary">
          <Link2 className="w-5 h-5" />
          Scrapear cualquier URL
        </h3>
        <p className="text-xs text-muted-foreground">
          Pegá el link de cualquier juego, suscripción o tienda (Steam, Xbox, PlayStation, Amazon) y Scrapling extraerá el precio y calculará los impuestos al instante.
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
            className="pr-20 font-mono text-xs"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading}
            title="Pegar del portapapeles"
            className="absolute right-2 text-muted-foreground hover:text-foreground text-xs px-2 py-1 rounded bg-white/5 border border-border/50 flex items-center gap-1 transition-colors"
          >
            <Clipboard className="w-3 h-3" />
            <span>Pegar</span>
          </button>
        </div>

        <Button type="submit" disabled={!url.trim() || loading} className="w-full font-semibold">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extrayendo con Scrapling...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analizar y Calcular Impuestos
            </>
          )}
        </Button>
      </form>

      {/* Ejemplos rápidos */}
      <div className="pt-1 space-y-2">
        <p className="text-[11px] text-muted-foreground font-display uppercase tracking-wider">
          Probar enlaces de ejemplo:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_URLS.map((ex) => (
            <button
              key={ex.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setUrl(ex.url);
                handleScrape(ex.url);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-primary/20 border border-border/60 text-muted-foreground hover:text-primary transition-all flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error con botón para ir a la calculadora manual */}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-xs text-destructive flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <p className="font-semibold">No se pudo extraer el precio automáticamente</p>
            <p className="text-[11px] opacity-90">{error}</p>
            <button
              type="button"
              onClick={onSwitchToManual}
              className="text-[11px] underline font-semibold text-foreground hover:text-primary block pt-0.5"
            >
              Ingresar el precio manualmente en la calculadora &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

