// src/components/GameLibrary.tsx
import React, { useState, useMemo } from "react";
import {
  Gamepad2,
  Trash2,
  Receipt,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  CreditCard,
  DollarSign,
  Plus,
  Share2,
  Check,
} from "lucide-react";
import { formatArs, formatUsd, PROVINCES, type ProvinceCode } from "@/lib/tax";
import {
  calculateArgentineTaxes,
  type PaymentMethod,
  type ExchangeRates,
  type TaxCalculationResult,
} from "@/lib/tax-engine";
import type { SavedGame } from "@/lib/storage";
import PriceBreakdownModal, { type ModalGameData } from "./PriceBreakdownModal";
import { useToast } from "@/hooks/use-toast";

interface GameLibraryProps {
  games: SavedGame[];
  province: ProvinceCode;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  dolarRates: {
    oficial: number | null;
    tarjeta: number | null;
    mep: number | null;
    blue: number | null;
  };
  onDeleteGame: (index: number) => void;
  onClearAll: () => void;
  onAddPresetGame: (game: Omit<SavedGame, "savedAt">) => void;
}

export const PRESET_FEATURED_GAMES: Array<Omit<SavedGame, "savedAt">> = [
  {
    name: "Baldur's Gate 3",
    originalPrice: 34.99,
    usdPrice: 34.99,
    dolarType: "oficial",
    platform: "Steam",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
  },
  {
    name: "Counter-Strike 2 (Prime)",
    originalPrice: 14.99,
    usdPrice: 14.99,
    dolarType: "oficial",
    platform: "Steam",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
  },
  {
    name: "Elden Ring",
    originalPrice: 39.99,
    usdPrice: 39.99,
    dolarType: "oficial",
    platform: "Steam",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
  },
  {
    name: "Xbox PC Game Pass",
    originalPrice: 8999,
    dolarType: "oficial",
    platform: "Xbox",
    thumbnail: "https://compass-ssl.xbox.com/assets/f6/cb/f6cb0088-34ee-48c9-a9a3-5c0a37946955.jpg",
  },
  {
    name: "EA SPORTS FC 25",
    originalPrice: 69.99,
    usdPrice: 69.99,
    dolarType: "oficial",
    platform: "Steam / EA",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2195250/header.jpg",
  },
  {
    name: "Cyberpunk 2077",
    originalPrice: 29.99,
    usdPrice: 29.99,
    dolarType: "oficial",
    platform: "Steam / GOG",
    thumbnail: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
  },
];

export default function GameLibrary({
  games,
  province,
  paymentMethod,
  onPaymentMethodChange,
  dolarRates,
  onDeleteGame,
  onClearAll,
  onAddPresetGame,
}: GameLibraryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedGame, setSelectedGame] = useState<ModalGameData | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const rates: ExchangeRates = useMemo(
    () => ({
      oficial: dolarRates.oficial ?? 1050,
      tarjeta: dolarRates.tarjeta ?? (dolarRates.oficial ? dolarRates.oficial * 1.3 : 1365),
      mep: dolarRates.mep ?? 1210,
      blue: dolarRates.blue ?? 1240,
    }),
    [dolarRates]
  );

  // Calcular totales en tiempo real para todos los juegos de la biblioteca
  const calculatedItems = useMemo(() => {
    return games.map((game, index) => {
      const isUsd = !!game.usdPrice;
      const numAmount = game.usdPrice || game.originalPrice;
      const category = isUsd
        ? "DIGITAL_SERVICE_USD"
        : "DIGITAL_SERVICE_ARS_FOREIGN";

      const calculation: TaxCalculationResult = calculateArgentineTaxes({
        amount: numAmount,
        currency: isUsd ? "USD" : "ARS",
        category,
        paymentMethod,
        province,
        rates,
      });

      return {
        game,
        index,
        calculation,
      };
    });
  }, [games, paymentMethod, province, rates]);

  // Totales acumulados
  const summary = useMemo(() => {
    let totalBaseArs = 0;
    let totalFinalArs = 0;
    let totalTaxesArs = 0;
    let totalMepSavingsArs = 0;

    calculatedItems.forEach(({ calculation }) => {
      totalBaseArs += calculation.baseArs;
      totalFinalArs += calculation.totalArs;
      totalTaxesArs += calculation.totalArs - calculation.baseArs;
      if (calculation.mepComparison && calculation.mepComparison.isRecommended) {
        totalMepSavingsArs += calculation.mepComparison.savingsArs;
      }
    });

    return {
      count: calculatedItems.length,
      totalBaseArs,
      totalFinalArs,
      totalTaxesArs,
      totalMepSavingsArs,
    };
  }, [calculatedItems]);

  const filteredItems = useMemo(() => {
    if (!filterQuery.trim()) return calculatedItems;
    const q = filterQuery.toLowerCase();
    return calculatedItems.filter(
      (item) =>
        item.game.name.toLowerCase().includes(q) ||
        (item.game.platform && item.game.platform.toLowerCase().includes(q))
    );
  }, [calculatedItems, filterQuery]);

  const isMep = paymentMethod === "DOLAR_MEP_CUENTA";

  const handleShareLibrary = () => {
    const text = `🎮 Mi Biblioteca Gamer en Impuesto Argento:\n${games.length} juegos · Total ARS: ${formatArs(
      summary.totalFinalArs
    )}\nCalculá y armá tu biblioteca en: https://impuesto-argento.netlify.app`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast({
      title: "Enlace copiado",
      description: "Compartí tu biblioteca gamer con tus amigos.",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="biblioteca" className="space-y-6">
      {/* 1. Header de la Biblioteca con Métricas Clave */}
      <div className="bg-[#111A2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#74ACDF]/15 border border-[#74ACDF]/30 flex items-center justify-center text-[#74ACDF]">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Mi Biblioteca Gamer
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0A0F1D] border border-slate-700 text-[#74ACDF] font-mono">
                {summary.count} {summary.count === 1 ? "título" : "títulos"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Coleccioná tus juegos y suscripciones. Precios finales en pesos argentinos actualizados en vivo.
            </p>
          </div>

          {/* Vistas y Acciones */}
          <div className="flex items-center gap-2 flex-wrap">
            {summary.count > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleShareLibrary}
                  className="bg-[#0A0F1D] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700/80 transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Compartir</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Seguro que querés vaciar tu biblioteca?")) {
                      onClearAll();
                    }
                  }}
                  className="bg-[#0A0F1D] hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium px-3 py-2 rounded-xl border border-slate-800 hover:border-red-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar</span>
                </button>
              </>
            )}

            {/* Alternador de Modo: Pósters vs Tabla */}
            <div className="flex items-center bg-[#0A0F1D] border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Ver pósters"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-[#74ACDF] text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Ver tabla comparativa"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-[#74ACDF] text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Tarjetas de Resumen Financiero Total */}
        {summary.count > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
            <div className="bg-[#0A0F1D]/90 border border-slate-800/90 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block">Inversión Total Biblioteca</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {formatArs(summary.totalFinalArs)}
                </span>
                <span className="text-[11px] font-bold text-[#74ACDF]">ARS</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                Base neta: {formatArs(summary.totalBaseArs)}
              </span>
            </div>

            <div className="bg-[#0A0F1D]/90 border border-slate-800/90 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block">Total Impuestos Retenidos</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F6B40E]">
                  +{formatArs(summary.totalTaxesArs)}
                </span>
                <span className="text-[11px] font-bold text-[#F6B40E]">ARS</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                IVA (21%) + Ganancias ({isMep ? "0% MEP" : "30%"}) + IIBB
              </span>
            </div>

            <div className="bg-[#0A0F1D]/90 border border-slate-800/90 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block">Ahorro con Dólar MEP</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                  {summary.totalMepSavingsArs > 0 ? `-${formatArs(summary.totalMepSavingsArs)}` : "$0"}
                </span>
                <span className="text-[11px] font-bold text-emerald-400">ARS</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 block mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Exención total de percepción 30%</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Contenido Principal: Grilla de Pósters o Tabla */}
      {summary.count === 0 ? (
        /* Empty State con Showcase de Juegos Populares */
        <div className="bg-[#111A2E]/60 border border-slate-800/90 rounded-2xl p-8 sm:p-12 text-center space-y-8">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#74ACDF]/15 border border-[#74ACDF]/30 mx-auto flex items-center justify-center text-[#74ACDF] text-3xl shadow-lg shadow-[#74ACDF]/10">
              🎮
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tu biblioteca gamer está lista
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pegá el link de una tienda arriba o sumá juegos populares del momento a tu colección con 1 clic para ver sus precios en pesos.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F6B40E]" />
                <span>Juegos populares recomendados</span>
              </span>
              <span className="text-slate-500">Sumá con 1 clic</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {PRESET_FEATURED_GAMES.map((preset) => {
                const isUsd = !!preset.usdPrice;
                const calc = calculateArgentineTaxes({
                  amount: preset.usdPrice || preset.originalPrice,
                  currency: isUsd ? "USD" : "ARS",
                  category: isUsd ? "DIGITAL_SERVICE_USD" : "DIGITAL_SERVICE_ARS_FOREIGN",
                  paymentMethod,
                  province,
                  rates,
                });

                return (
                  <div
                    key={preset.name}
                    className="bg-[#0A0F1D] border border-slate-800/90 hover:border-[#74ACDF]/60 rounded-xl overflow-hidden group transition-all flex flex-col justify-between text-left shadow-md hover:shadow-xl hover:shadow-[#74ACDF]/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={preset.thumbnail}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 backdrop-blur-md text-[#74ACDF] uppercase tracking-wider">
                        {preset.platform}
                      </div>
                    </div>

                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-white line-clamp-1 group-hover:text-[#74ACDF] transition-colors">
                          {preset.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Base: {isUsd ? formatUsd(preset.usdPrice!) : formatArs(preset.originalPrice)}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Final ARS</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            {formatArs(calc.totalArs)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onAddPresetGame(preset)}
                          title={`Sumar ${preset.name} a mi biblioteca`}
                          className="w-7 h-7 rounded-lg bg-[#74ACDF] hover:bg-[#5B9CD6] text-slate-950 font-bold flex items-center justify-center transition-all shadow-sm shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Modo 1: Pósters Gamer en Grilla */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredItems.map(({ game, index, calculation }) => {
            const isUsd = !!game.usdPrice;

            return (
              <div
                key={`${game.name}-${index}`}
                className="bg-[#111A2E] border border-slate-800 hover:border-[#74ACDF]/80 rounded-2xl overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-[#74ACDF]/15 hover:-translate-y-1 relative"
              >
                {/* Portada / Cover Art con Aspect Ratio 16/10 o Póster */}
                <div
                  className="relative aspect-[16/10] bg-slate-900 overflow-hidden cursor-pointer"
                  onClick={() =>
                    setSelectedGame({
                      name: game.name,
                      originalPrice: game.originalPrice,
                      thumbnail: game.thumbnail,
                      usdPrice: game.usdPrice,
                      dolarType: game.dolarType,
                      platform: game.platform,
                      calculation,
                    })
                  }
                >
                  <img
                    src={game.thumbnail || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111A2E] via-transparent to-black/40" />

                  {/* Badges superiores sobre la imagen */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-[#74ACDF] border border-white/10 uppercase tracking-wider">
                      {game.platform || (isUsd ? "USD" : "ARS")}
                    </span>
                  </div>

                  {/* Botón de eliminar discreto */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGame(index);
                    }}
                    title="Eliminar de mi biblioteca"
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/80 text-slate-300 hover:text-white backdrop-blur-md flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all border border-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Tax badge flotante */}
                  <div className="absolute bottom-2 left-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-md border border-white/10 ${
                      isMep ? "bg-[#F6B40E] text-slate-950" : "bg-[#74ACDF] text-slate-950"
                    }`}>
                      {isMep ? "+21% MEP" : "+51% Impuestos"}
                    </span>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3
                      onClick={() =>
                        setSelectedGame({
                          name: game.name,
                          originalPrice: game.originalPrice,
                          thumbnail: game.thumbnail,
                          usdPrice: game.usdPrice,
                          dolarType: game.dolarType,
                          platform: game.platform,
                          calculation,
                        })
                      }
                      className="font-bold text-xs sm:text-sm text-white line-clamp-2 cursor-pointer hover:text-[#74ACDF] transition-colors leading-snug"
                      title={game.name}
                    >
                      {game.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Base: {isUsd ? formatUsd(game.usdPrice!) : formatArs(game.originalPrice)}
                    </p>
                  </div>

                  {/* Precio Final Grande y Botón de Ticket */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                        Precio Final ARS
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-emerald-400">
                          {formatArs(calculation.totalArs)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">ARS</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGame({
                          name: game.name,
                          originalPrice: game.originalPrice,
                          thumbnail: game.thumbnail,
                          usdPrice: game.usdPrice,
                          dolarType: game.dolarType,
                          platform: game.platform,
                          calculation,
                        })
                      }
                      className="w-full bg-[#0A0F1D] hover:bg-[#74ACDF]/15 text-slate-300 hover:text-white border border-slate-800 hover:border-[#74ACDF]/40 text-xs font-semibold py-1.5 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#74ACDF]" />
                      <span>Ver ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modo 2: Tabla Comparativa Elegante */
        <div className="bg-[#111A2E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#0A0F1D] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4">Juego / Servicio</th>
                  <th className="py-3.5 px-3">Plataforma</th>
                  <th className="py-3.5 px-3 text-right">Precio Original</th>
                  <th className="py-3.5 px-3 text-right">Base ARS</th>
                  <th className="py-3.5 px-3 text-right">Impuestos ARS</th>
                  <th className="py-3.5 px-3 text-right font-bold text-white">Total Final ARS</th>
                  <th className="py-3.5 px-3 text-right">Ahorro MEP</th>
                  <th className="py-3.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredItems.map(({ game, index, calculation }) => {
                  const isUsd = !!game.usdPrice;
                  const taxesAmount = calculation.totalArs - calculation.baseArs;

                  return (
                    <tr
                      key={`${game.name}-${index}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.thumbnail || "/placeholder.svg"}
                            alt={game.name}
                            className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-slate-800 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white truncate block max-w-xs">
                              {game.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {PROVINCES[province]?.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-[#0A0F1D] border border-slate-800 text-[10px] text-[#74ACDF] font-semibold">
                          {game.platform || (isUsd ? "USD" : "ARS")}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300">
                        {isUsd ? formatUsd(game.usdPrice!) : formatArs(game.originalPrice)}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300">
                        {formatArs(calculation.baseArs)}
                      </td>

                      <td className="py-3 px-3 text-right text-[#F6B40E]">
                        +{formatArs(taxesAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-sm text-emerald-400">
                        {formatArs(calculation.totalArs)}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400/90">
                        {calculation.mepComparison?.isRecommended
                          ? `-${formatArs(calculation.mepComparison.savingsArs)}`
                          : "—"}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedGame({
                                name: game.name,
                                originalPrice: game.originalPrice,
                                thumbnail: game.thumbnail,
                                usdPrice: game.usdPrice,
                                dolarType: game.dolarType,
                                platform: game.platform,
                                calculation,
                              })
                            }
                            title="Ver ticket de desglose"
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Receipt className="w-4 h-4 text-[#74ACDF]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteGame(index)}
                            title="Eliminar juego"
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal del Ticket Fiscal Detallado */}
      <PriceBreakdownModal
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        game={selectedGame}
        province={province}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={onPaymentMethodChange}
        dolarRates={dolarRates}
      />
    </section>
  );
}

