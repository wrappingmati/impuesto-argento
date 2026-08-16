// src/components/DolarInfo.tsx
import { useEffect } from "react";
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

  // Avisamos al padre cada vez que cambian las tasas (como efecto, no
  // durante el render, para no disparar un setState del padre en medio
  // del render de este componente).
  useEffect(() => {
    if (!loading && !error) {
      onRatesLoaded?.(rates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates.blue, rates.oficial, rates.tarjeta, loading, error]);

  const rateItems = [
    { label: "Blue", value: rates.blue, className: "text-blue" },
    { label: "Oficial", value: rates.oficial, className: "text-oficial" },
    { label: "Tarjeta", value: rates.tarjeta, className: "text-tarjeta", note: "+45% Ganancias" },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="ticket p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              Cotización del dólar
            </span>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            aria-label="Actualizar cotización"
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && !error && (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p>No se pudo obtener la cotización. Probá de nuevo en un momento.</p>
              <Button size="sm" variant="outline" onClick={refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 gap-3 font-nums">
              {rateItems.map(({ label, value, className, note }) => (
                <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="font-display text-xs text-muted-foreground mb-1">{label}</p>
                  <p className={`text-lg font-semibold ${className}`}>
                    {value != null ? `$${value.toFixed(0)}` : "—"}
                  </p>
                  {note && <p className="text-[10px] text-muted-foreground mt-1 font-display">{note}</p>}
                </div>
              ))}
            </div>
            {(stale || source === "cache") && (
              <p className="text-[11px] text-muted-foreground mt-2">
                {source === "cache"
                  ? "Mostrando la última cotización guardada (sin conexión con las APIs)."
                  : "Cotización de hace más de 10 minutos."}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
