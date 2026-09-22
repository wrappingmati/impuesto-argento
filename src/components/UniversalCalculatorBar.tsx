// src/components/UniversalCalculatorBar.tsx
import React, { useState } from "react";
import {
  Link2,
  Sparkles,
  Edit3,
  Clipboard,
  ArrowRight,
  Loader2,
  Plus,
  Check,
  AlertCircle,
  Gamepad2,
  Tv,
  Cpu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { scrapeAndCalculateApi } from "@/lib/api";
import { formatArs, formatUsd, type ProvinceCode } from "@/lib/tax";
import {
  calculateArgentineTaxes,
  POPULAR_PROVIDERS,
  type PaymentMethod,
  type ExchangeRates,
} from "@/lib/tax-engine";
import type { SavedGame } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface UniversalCalculatorBarProps {
  province: ProvinceCode;
  paymentMethod: PaymentMethod;
  dolarRates: {
    oficial: number | null;
    tarjeta: number | null;
    mep: number | null;
    blue: number | null;
  };
  onAddItem: (item: Omit<SavedGame, "savedAt">) => void;
  onOpenItemModal?: (item: Omit<SavedGame, "savedAt">) => void;
}

const STORE_EXAMPLES = [
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

export default function UniversalCalculatorBar({
  province,
  paymentMethod,
  dolarRates,
  onAddItem,
  onOpenItemModal,
}: UniversalCalculatorBarProps) {
  const [activeTab, setActiveTab] = useState<string>("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual inputs
  const [manualTitle, setManualTitle] = useState("");
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualCurrency, setManualCurrency] = useState<"USD" | "ARS">("USD");
  const [manualPlatform, setManualPlatform] = useState("Steam");

  // Subscriptions filter
  const [subCategory, setSubCategory] = useState<"all" | "gaming" | "streaming" | "ai">("all");

  const { toast } = useToast();

  const rates: ExchangeRates = {
    oficial: dolarRates.oficial ?? 1050,
    tarjeta: dolarRates.tarjeta ?? (dolarRates.oficial ? dolarRates.oficial * 1.3 : 1365),
    mep: dolarRates.mep ?? 1210,
    blue: dolarRates.blue ?? 1240,
  };

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

      const newItem: Omit<SavedGame, "savedAt"> = {
        name: scraped.title,
        originalPrice: calculation.baseArs,
        thumbnail: scraped.thumbnail || "/placeholder.svg",
        usdPrice: scraped.currency === "USD" ? scraped.amount : undefined,
        dolarType: "oficial",
        platform: scraped.platform || "Tienda Web",
      };

      onAddItem(newItem);
      onOpenItemModal?.(newItem);
      setUrl("");

      toast({
        title: "¡Juego agregado a tu biblioteca!",
        description: `${scraped.title} (${scraped.currency} \$${scraped.amount}).`,
      });
    } catch (err) {
      console.error("Error scraping:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo extraer el precio de este enlace. Podés cargarlo manualmente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(manualAmount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Monto inválido",
        description: "Ingresá un precio numérico mayor a cero.",
        variant: "destructive",
      });
      return;
    }

    const isUsd = manualCurrency === "USD";
    const name = manualTitle.trim() || `Juego (${manualPlatform})`;

    const newItem: Omit<SavedGame, "savedAt"> = {
      name,
      originalPrice: isUsd ? amountNum * rates.oficial : amountNum,
      usdPrice: isUsd ? amountNum : undefined,
      dolarType: "oficial",
      platform: manualPlatform,
      thumbnail: "/placeholder.svg",
    };

    onAddItem(newItem);
    onOpenItemModal?.(newItem);

    setManualTitle("");
    setManualAmount("");

    toast({
      title: "Agregado a tu biblioteca",
      description: `${name} fue guardado exitosamente.`,
    });
  };

  // Subscripciones disponibles
  const subscriptions = POPULAR_PROVIDERS.filter((p) => p.plans && p.plans.length > 0);
  const filteredSubs = subscriptions.filter((s) => {
    if (subCategory === "all") return true;
    if (subCategory === "gaming") {
      return ["steam", "xbox", "playstation", "nintendo", "epic-games"].includes(s.id);
    }
    if (subCategory === "streaming") {
      return ["netflix", "spotify", "youtube-premium", "disney-plus", "max"].includes(s.id);
    }
    if (subCategory === "ai") {
      return ["chatgpt", "claude", "midjourney", "github-copilot"].includes(s.id);
    }
    return true;
  });

  return (
    <div className="bg-[#131B2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Pestañas de modo unificado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Buscador y Calculadora Rápida</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6D28D9]/20 text-[#A78BFA] border border-[#6D28D9]/40 font-mono font-medium">
                V3 Live
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pegá un link o elegí un servicio para sumarlo automáticamente a tu biblioteca con desglose en pesos.
            </p>
          </div>

          <TabsList className="grid grid-cols-3 bg-[#0B0F19] border border-slate-800 h-10 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <TabsTrigger
              value="url"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Pegar Link</span>
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suscripciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Pegar Enlace */}
        <TabsContent value="url" className="space-y-3 mt-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScrape();
            }}
            className="flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative w-full flex items-center">
              <Input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="Pegá el link de Steam, PlayStation Store, Xbox o Nintendo..."
                className="bg-[#0B0F19] border-slate-700/80 text-slate-100 placeholder:text-slate-500 pr-24 text-xs sm:text-sm h-12 rounded-xl focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA]/20 transition-all"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={handlePaste}
                disabled={loading}
                title="Pegar del portapapeles"
                className="absolute right-2 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#1E1B2E] hover:bg-slate-700/60 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Pegar</span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto h-12 px-6 bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6D28D9]/25 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Leyendo precio...</span>
                </>
              ) : (
                <>
                  <span>Añadir a Biblioteca</span>
                  <Plus className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-0.5">
                <p className="font-semibold text-red-200">No pudimos leer este link automáticamente</p>
                <p className="text-[11px] text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {/* Enlaces de prueba rápidos */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">Ejemplos rápidos:</span>
            {STORE_EXAMPLES.map((item) => (
              <button
                key={item.url}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  handleScrape(item.url);
                }}
                disabled={loading}
                className="text-[11px] text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span className="text-[#22D3EE] font-mono text-[10px] font-bold">{item.platform}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Suscripciones con 1 Clic */}
        <TabsContent value="catalog" className="space-y-3 mt-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSubCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subCategory === "all"
                  ? "bg-[#6D28D9] text-white"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setSubCategory("gaming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                subCategory === "gaming"
                  ? "bg-[#6D28D9] text-white"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Gaming</span>
            </button>
            <button
              type="button"
              onClick={() => setSubCategory("streaming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                subCategory === "streaming"
                  ? "bg-[#6D28D9] text-white"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Streaming</span>
            </button>
            <button
              type="button"
              onClick={() => setSubCategory("ai")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                subCategory === "ai"
                  ? "bg-[#6D28D9] text-white"
                  : "bg-[#0B0F19] text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>IA & Cloud</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {filteredSubs.map((sub) => {
              const mainPlan = sub.plans?.[0];
              if (!mainPlan) return null;

              const isUsd = mainPlan.currency === "USD";
              const calc = calculateArgentineTaxes({
                amount: mainPlan.price,
                currency: mainPlan.currency,
                category: sub.category,
                paymentMethod,
                province,
                rates,
                isAudioVisualService: sub.isAudioVisual,
              });

              return (
                <div
                  key={sub.id}
                  className="bg-[#0B0F19] border border-slate-800/90 hover:border-[#6D28D9]/50 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs text-white truncate">{sub.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {mainPlan.name}: {isUsd ? formatUsd(mainPlan.price) : formatArs(mainPlan.price)}
                    </p>
                    <p className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
                      {formatArs(calc.totalArs)} <span className="text-[9px] text-slate-400 font-normal">ARS/mes</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const item: Omit<SavedGame, "savedAt"> = {
                        name: `${sub.name} (${mainPlan.name})`,
                        originalPrice: calc.baseArs,
                        usdPrice: isUsd ? mainPlan.price : undefined,
                        dolarType: "oficial",
                        platform: "Suscripción",
                        thumbnail: "/placeholder.svg",
                      };
                      onAddItem(item);
                      onOpenItemModal?.(item);
                      toast({
                        title: "Suscripción agregada",
                        description: `${sub.name} está ahora en tu biblioteca.`,
                      });
                    }}
                    title="Sumar a mi biblioteca"
                    className="w-8 h-8 rounded-lg bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Carga Manual Rápida */}
        <TabsContent value="manual" className="space-y-3 mt-0">
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs text-slate-400 font-medium">Nombre del juego o ítem</label>
              <Input
                type="text"
                placeholder="Ej: Silent Hill 2, Skin de CS2..."
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="bg-[#0B0F19] border-slate-700 text-xs text-slate-100 h-11 rounded-xl"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs text-slate-400 font-medium">Monto</label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 29.99"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="bg-[#0B0F19] border-slate-700 text-xs text-slate-100 font-mono h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-slate-400 font-medium">Moneda</label>
              <div className="grid grid-cols-2 gap-1 bg-[#0B0F19] p-1 border border-slate-700 rounded-xl h-11 items-center">
                <button
                  type="button"
                  onClick={() => setManualCurrency("USD")}
                  className={`text-xs font-semibold py-1 rounded-lg transition-all ${
                    manualCurrency === "USD"
                      ? "bg-[#6D28D9] text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => setManualCurrency("ARS")}
                  className={`text-xs font-semibold py-1 rounded-lg transition-all ${
                    manualCurrency === "ARS"
                      ? "bg-[#6D28D9] text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ARS
                </button>
              </div>
            </div>

            <div className="sm:col-span-3">
              <Button
                type="submit"
                className="w-full h-11 bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#6D28D9]/25"
              >
                <Plus className="w-4 h-4" />
                <span>Sumar a Biblioteca</span>
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
