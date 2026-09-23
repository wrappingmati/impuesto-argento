// src/components/DolarInfo.tsx
import React, { useEffect } from "react";
import { RefreshCw, TrendingUp, Sparkles } from "lucide-react";
import { useDolarRates } from "@/hooks/useDolarRates";
import type { DolarRates } from "@/lib/dolarApi";

export type { DolarRates };

interface DolarInfoProps {
  onRatesLoaded?: (rates: DolarRates) => void;
  className?: string;
}

export default function DolarInfo({ onRatesLoaded, className = "" }: DolarInfoProps) {
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
    <div
      className={`bg-[#111A2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#74ACDF]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Cotizaciones en Vivo
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#74ACDF]/15 text-[#74ACDF] border border-[#74ACDF]/30 font-mono font-medium">
            BCRA / MEP
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

      {/* Matriz 2x2 para adaptarse perfectamente al ancho de columna */}
      <div className="grid grid-cols-2 gap-2.5 font-mono">
        {rateItems.map(({ label, value, sub, highlight }) => (
          <div
            key={label}
            className={`p-3 rounded-xl border transition-all ${
              highlight
                ? "bg-[#F6B40E]/10 border-[#F6B40E]/30"
                : "bg-[#0A0F1D] border-slate-800 hover:border-slate-700/80"
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
            <p className="font-sans text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tip de Ahorro con Dólar MEP */}
      <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-[11px] text-slate-300 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F6B40E]" />
            <span className="font-semibold text-slate-200">Tip de Ahorro:</span>
          </span>
          <span className="text-[#F6B40E] font-mono font-bold">-30% Percepción</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Pagando con saldo en dólares evitás el 30% de adelanto de Ganancias (RG 5617).
        </p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-800/60">
        <span>Fuente: Ámbito / BCRA</span>
        <span>{stale || source === "cache" ? "Último registro" : "Actualizado"}</span>
      </div>
    </div>
  );
}
