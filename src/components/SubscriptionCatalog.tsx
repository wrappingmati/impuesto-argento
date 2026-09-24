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

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "streaming", label: "Streaming" },
    { id: "gaming", label: "Gaming" },
    { id: "ai", label: "IA & Dev" },
    { id: "cloud", label: "Cloud" },
  ];

  return (
    <div className="space-y-4">
      {/* Filtros sutiles */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              category === c.id
                ? "bg-[#74ACDF]/15 text-[#74ACDF] border-[#74ACDF]/40 font-semibold"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading && !remoteServices && (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#74ACDF]" />
          <p className="text-xs">Cargando suscripciones...</p>
        </div>
      )}

      {/* Grilla limpia de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredServices.map((service) => {
          const planIndex = selectedPlanMap[service.id] ?? 0;
          const currentPlan = service.plans[planIndex] || service.plans[0];
          if (!currentPlan) return null;

          const calc = currentPlan.calculation;

          return (
            <div
              key={service.id}
              className="bg-[#0A0F1D] border border-slate-800 hover:border-[#74ACDF]/40 rounded-xl p-3.5 space-y-2.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm text-slate-100">{service.name}</h4>
                    <p className="text-[11px] text-slate-500">{service.domain}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-mono text-emerald-400">
                      {formatArs(calc.totalArs)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Base: {currentPlan.currency === "USD" ? formatUsd(currentPlan.price) : formatArs(currentPlan.price)}
                    </p>
                  </div>
                </div>

                {/* Planes si tiene más de 1 */}
                {service.plans.length > 1 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {service.plans.map((p, idx) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() =>
                          setSelectedPlanMap((prev) => ({ ...prev, [service.id]: idx }))
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                          planIndex === idx
                            ? "bg-[#74ACDF]/20 text-[#74ACDF] border-[#74ACDF]/40 font-semibold"
                            : "bg-transparent text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                className="w-full text-xs font-medium py-1.5 rounded-lg bg-[#111A2E] hover:bg-[#74ACDF] text-slate-300 hover:text-slate-950 hover:font-bold border border-slate-700/60 transition-all flex items-center justify-center gap-1"
              >
                <span>Calcular desglose</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-slate-950" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
