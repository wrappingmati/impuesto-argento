// src/components/DolarInfo.tsx
import React, { useEffect } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useDolarRates } from "@/hooks/useDolarRates";
import type { DolarRates } from "@/lib/dolarApi";

export type { DolarRates };

interface DolarInfoProps {
  onRatesLoaded?: (rates: DolarRates) => void;
}

export default function DolarInfo({ onRatesLoaded }: DolarInfoProps) {
  const { rates, source, stale, loading, error, refetch } = useDolarRates();

  useEffect(() => {
    if (!loading && !error) {
      onRatesLoaded?.(rates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.blue, rates.oficial, rates.tarjeta, rates.mep, loading, error]);

  const rateItems = [
    { label: "Dólar Oficial", value: rates.oficial, sub: "Base ARCA / BCRA" },
    { label: "Dólar Tarjeta", value: rates.tarjeta, sub: "Oficial + 30% Gan." },
    { label: "Dólar MEP", value: rates.mep, sub: "Bolsa (Sin percepción)", highlight: true },
    { label: "Dólar Blue", value: rates.blue, sub: "Mercado informal" },
  ];

  return (
    <div className="bg-[#111A2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#74ACDF]" />
          <span className="text-sm font-semibold text-slate-200">
            Cotizaciones del Dólar en Vivo
          </span>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          title="Actualizar cotizaciones"
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        {rateItems.map(({ label, value, sub, highlight }) => (
          <div
            key={label}
            className={`p-3 rounded-xl border ${
              highlight
                ? "bg-[#F6B40E]/10 border-[#F6B40E]/30"
                : "bg-[#0A0F1D] border-slate-800"
            }`}
          >
            <p className="font-sans text-xs text-slate-400 font-medium">{label}</p>
            <p
              className={`text-lg sm:text-xl font-bold mt-0.5 ${
                highlight ? "text-[#F6B40E]" : "text-white"
              }`}
            >
              {value != null ? `$${value.toFixed(0)}` : "—"}
            </p>
            <p className="font-sans text-[10px] text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {(stale || source === "cache") && (
        <p className="text-[10px] text-slate-500 text-center">
          {source === "cache"
            ? "Mostrando última cotización guardada."
            : "Actualizado recientemente."}
        </p>
      )}
    </div>
  );
}
