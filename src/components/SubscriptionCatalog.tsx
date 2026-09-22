// src/components/SubscriptionCatalog.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchServicesCatalogApi, type CatalogService } from "@/lib/api";
import { POPULAR_PROVIDERS, calculateArgentineTaxes, type PaymentMethod, type ProvinceCode, type ExchangeRates, type TaxCalculationResult } from "@/lib/tax-engine";
import { formatArs, formatUsd } from "@/lib/tax";
import { Film, Gamepad2, Bot, Cloud, Check, Loader2, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";

interface SubscriptionCatalogProps {
  province: ProvinceCode;
  paymentMethod: PaymentMethod;
  dolarRates: {
    oficial: number | null;
    tarjeta: number | null;
    mep: number | null;
    blue: number | null;
  };
  onSelectPlan: (data: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: "tarjeta" | "oficial" | "blue";
    isForeignDigitalService: boolean;
    calculation?: TaxCalculationResult;
  }) => void;
}

type FilterCategory = "all" | "streaming" | "gaming" | "ai" | "cloud";

export default function SubscriptionCatalog({
  province,
  paymentMethod,
  dolarRates,
  onSelectPlan,
}: SubscriptionCatalogProps) {
  const [category, setCategory] = useState<FilterCategory>("all");
  const [selectedPlanMap, setSelectedPlanMap] = useState<Record<string, number>>({});

  // Consultar el catálogo del backend
  const { data: remoteServices, isLoading } = useQuery({
    queryKey: ["servicesCatalog", province, paymentMethod],
    queryFn: () => fetchServicesCatalogApi(province, paymentMethod),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fallback local en caso de que el backend esté desconectado
  const localRates: ExchangeRates = {
    oficial: dolarRates.oficial ?? 1050,
    tarjeta: dolarRates.tarjeta ?? 1365,
    mep: dolarRates.mep ?? 1210,
    blue: dolarRates.blue ?? 1240,
  };

  const services = remoteServices ?? POPULAR_PROVIDERS.filter((p) => p.plans && p.plans.length > 0).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    defaultCurrency: p.defaultCurrency,
    isAudioVisual: p.isAudioVisual,
    domain: p.domain,
    notes: p.notes,
    plans: (p.plans ?? []).map((pl) => {
      const calc = calculateArgentineTaxes({
        amount: pl.price,
        currency: pl.currency,
        category: p.category,
        paymentMethod,
        province,
        rates: localRates,
        isAudioVisualService: p.isAudioVisual,
      });
      return {
        name: pl.name,
        price: pl.price,
        currency: pl.currency,
        period: pl.period,
        calculation: calc,
      };
    }),
  }));

  const filteredServices = services.filter((s) => {
    if (category === "all") return true;
    const cat = s.category.toLowerCase();
    const id = s.id.toLowerCase();
    if (category === "streaming") {
      return (
        cat.includes("streaming") ||
        s.isAudioVisual ||
        ["netflix", "spotify", "youtube-premium", "disney-plus", "max"].includes(id)
      );
    }
    if (category === "gaming") {
      return ["steam", "playstation", "xbox", "nintendo", "epic-games"].includes(id);
    }
    if (category === "ai") {
      return ["chatgpt", "claude", "midjourney", "github-copilot"].includes(id);
    }
    if (category === "cloud") {
      return ["google-one", "apple-icloud"].includes(id);
    }
    return true;
  });

  const categories: { id: FilterCategory; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "Todas", icon: Sparkles },
    { id: "streaming", label: "Streaming", icon: Film },
    { id: "gaming", label: "Gaming", icon: Gamepad2 },
    { id: "ai", label: "IA & Dev", icon: Bot },
    { id: "cloud", label: "Cloud", icon: Cloud },
  ];

  return (
    <div className="space-y-4">
      {/* Selector de categoría */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                category === c.id
                  ? "bg-violet-600/20 text-violet-300 border-violet-500/40"
                  : "bg-[#0F1626] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading && !remoteServices && (
        <div className="p-8 text-center text-slate-400 space-y-2 bg-[#131B2E]/20 border border-slate-800 rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-400" />
          <p className="text-xs">Cargando catálogo actualizado de suscripciones...</p>
        </div>
      )}

      {/* Grilla de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredServices.map((service) => {
          const planIndex = selectedPlanMap[service.id] ?? 0;
          const currentPlan = service.plans[planIndex] || service.plans[0];
          if (!currentPlan) return null;

          const calc = currentPlan.calculation;

          return (
            <div
              key={service.id}
              className="bg-[#131B2E]/40 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 space-y-3 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-100 truncate">{service.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{service.domain}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-emerald-400 font-mono">
                      {formatArs(calc.totalArs)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Base: {currentPlan.currency === "USD" ? formatUsd(currentPlan.price) : formatArs(currentPlan.price)}
                    </p>
                  </div>
                </div>

                {/* Selector de plan si tiene más de 1 */}
                {service.plans.length > 1 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {service.plans.map((p, idx) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setSelectedPlanMap((prev) => ({ ...prev, [service.id]: idx }))
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border transition-colors ${
                          planIndex === idx
                            ? "bg-violet-600/30 text-violet-200 border-violet-500/50"
                            : "bg-[#0F1626] text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón para calcular */}
              <button
                type="button"
                onClick={() =>
                  onSelectPlan({
                    name: `${service.name} (${currentPlan.name})`,
                    price: calc.baseArs,
                    thumbnail: "/placeholder.svg",
                    usdPrice: currentPlan.currency === "USD" ? currentPlan.price : undefined,
                    dolarType: "oficial",
                    isForeignDigitalService: true,
                    calculation: calc,
                  })
                }
                className="w-full text-xs font-medium py-2 rounded-xl bg-slate-850 hover:bg-violet-600 text-slate-200 hover:text-white border border-slate-750 hover:border-violet-500 transition-all duration-200 flex items-center justify-center gap-1.5 mt-1"
              >
                <span>Ver comprobante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
