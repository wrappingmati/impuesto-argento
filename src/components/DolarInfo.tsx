// src/components/DolarInfo.tsx
import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDolarRates } from "@/hooks/useDolarRates";
import type { DolarRates } from "@/lib/dolarApi";

export type { DolarRates };

interface DolarInfoProps {
  onRatesLoaded?: (rates: DolarRates) => void;
}

export default function DolarInfo({ onRatesLoaded }: DolarInfoProps) {
  const { rates, source, stale, loading, error, refetch } = useDolarRates();

  // Avisamos al padre cada vez que cambian las tasas
  useEffect(() => {
    if (!loading && !error) {
      onRatesLoaded?.(rates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.blue, rates.oficial, rates.tarjeta, rates.mep, loading, error]);

  const rateItems = [
    { label: "Oficial", value: rates.oficial, className: "text-slate-200" },
    { label: "Tarjeta", value: rates.tarjeta, className: "text-violet-300", note: "+30% Gan." },
    { label: "MEP (Bolsa)", value: rates.mep, className: "text-emerald-400 font-bold", note: "Ahorro" },
    { label: "Blue", value: rates.blue, className: "text-sky-300" },
  ];

  return (
    <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            Cotizaciones en vivo
          </span>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={loading}
          aria-label="Actualizar cotización"
          className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800/50 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-[#0F1626] border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="space-y-1">
            <p>No se pudo sincronizar cotizaciones en vivo.</p>
            <Button size="sm" variant="ghost" onClick={refetch} className="h-7 text-xs text-red-200">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            {rateItems.map(({ label, value, className, note }) => (
              <div key={label} className="bg-[#0F1626] border border-slate-800/80 rounded-xl p-2.5 text-center">
                <p className="font-sans text-[11px] text-slate-400 mb-0.5">{label}</p>
                <p className={`text-base font-semibold ${className}`}>
                  {value != null ? `$${value.toFixed(0)}` : "—"}
                </p>
                {note && <p className="text-[10px] text-slate-500 mt-0.5 font-sans">{note}</p>}
              </div>
            ))}
          </div>
          {(stale || source === "cache") && (
            <p className="text-[10px] text-slate-500 text-center">
              {source === "cache"
                ? "Mostrando última cotización en caché local."
                : "Cotización actualizada hace más de 10 minutos."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
