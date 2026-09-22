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
    { label: "Dólar Oficial", value: rates.oficial, sub: "Base" },
    { label: "Dólar Tarjeta", value: rates.tarjeta, sub: "+30% Gan." },
    { label: "Dólar MEP", value: rates.mep, sub: "Bolsa", highlight: true },
    { label: "Dólar Blue", value: rates.blue, sub: "Informal" },
  ];

  return (
    <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            Cotizaciones de referencia
          </span>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          title="Actualizar cotizaciones"
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {rateItems.map(({ label, value, sub, highlight }) => (
          <div
            key={label}
            className={`p-2.5 rounded-xl border ${
              highlight
                ? "bg-emerald-500/[0.06] border-emerald-500/20"
                : "bg-[#0b0e14] border-white/[0.06]"
            }`}
          >
            <p className="font-sans text-[11px] text-slate-400">{label}</p>
            <p
              className={`text-base font-semibold mt-0.5 ${
                highlight ? "text-emerald-400" : "text-slate-200"
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
