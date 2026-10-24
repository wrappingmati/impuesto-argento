// src/components/DolarInfo.tsx
import React, { useEffect } from "react";
import { RefreshCw, TrendingUp, Sparkles, DollarSign, ShieldAlert, ArrowDownRight } from "lucide-react";
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

  const mepSavingsPerDollar =
    rates.tarjeta && rates.mep ? Math.max(0, rates.tarjeta - rates.mep) : null;

  return (
    <div
      className={`relative bg-[#111A2E]/95 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 overflow-hidden transition-all ${className}`}
    >
      {/* Acento de luz neon dorado Sol de Mayo */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F6B40E]/80 to-transparent" />

      {/* Header del Widget */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#74ACDF]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">
            Cotizaciones en Vivo
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#74ACDF]/15 text-[#74ACDF] border border-[#74ACDF]/30 font-mono font-bold">
            BCRA · MEP
          </span>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          title="Actualizar cotizaciones en vivo"
          className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Grid 2x2 de Cotizaciones con estética Gamer HUD */}
      <div className="grid grid-cols-2 gap-2.5 font-mono">
        {/* Dólar MEP (Destacado) */}
        <div className="p-3 rounded-xl border border-[#F6B40E]/40 bg-gradient-to-br from-[#1c180b] to-[#111A2E] shadow-md shadow-[#F6B40E]/5 hover:border-[#F6B40E]/70 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-[#F6B40E]">Dólar MEP</span>
            <span className="text-[9px] font-mono font-extrabold bg-[#F6B40E] text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Sin 30%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 tabular-nums text-[#F6B40E]">
            {rates.mep != null ? `$${rates.mep.toFixed(0)}` : "—"}
          </p>
          <p className="font-sans text-[10px] text-slate-400 mt-0.5 truncate">Bolsa / Dólares propios</p>
        </div>

        {/* Dólar Tarjeta */}
        <div className="p-3 rounded-xl border border-slate-800/90 bg-[#0A0F1D] hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-slate-300">Dólar Tarjeta</span>
            <span className="text-[9px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
              +30%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 tabular-nums text-white">
            {rates.tarjeta != null ? `$${rates.tarjeta.toFixed(0)}` : "—"}
          </p>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5 truncate">Oficial + Ganancias</p>
        </div>

        {/* Dólar Oficial */}
        <div className="p-3 rounded-xl border border-slate-800/90 bg-[#0A0F1D] hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-slate-300">Dólar Oficial</span>
            <span className="text-[9px] font-mono font-semibold bg-[#74ACDF]/15 text-[#74ACDF] border border-[#74ACDF]/30 px-1.5 py-0.5 rounded">
              BCRA
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 tabular-nums text-white">
            {rates.oficial != null ? `$${rates.oficial.toFixed(0)}` : "—"}
          </p>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5 truncate">Base imponible</p>
        </div>

        {/* Dólar Blue */}
        <div className="p-3 rounded-xl border border-slate-800/90 bg-[#0A0F1D] hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-medium text-slate-300">Dólar Blue</span>
            <span className="text-[9px] font-mono font-semibold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              Informal
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-1 tabular-nums text-white">
            {rates.blue != null ? `$${rates.blue.toFixed(0)}` : "—"}
          </p>
          <p className="font-sans text-[10px] text-slate-500 mt-0.5 truncate">Mercado libre</p>
        </div>
      </div>

      {/* Mini-Banner de Ahorro Instantáneo MEP */}
      {mepSavingsPerDollar !== null && mepSavingsPerDollar > 0 ? (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#0A0F1D] to-[#F6B40E]/10 border border-emerald-500/30 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F6B40E]" />
              <span>Ahorro con Dólar MEP</span>
            </span>
            <p className="text-xs text-slate-300 font-sans">
              Ahorrás <strong className="text-emerald-400 font-mono font-bold">${mepSavingsPerDollar.toFixed(0)}</strong> por cada dólar gastado
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-30%</span>
            </span>
          </div>
        </div>
      ) : (
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
      )}

      {/* Footer del Widget */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        <span>Fuente: Ámbito / BCRA</span>
        <span className="font-mono">{stale || source === "cache" ? "Registro previo" : "En vivo"}</span>
      </div>
    </div>
  );
}
