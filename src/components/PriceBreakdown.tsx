// src/components/PriceBreakdown.tsx
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import type { MepComparison, PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";
import { Sparkles, Copy, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceBreakdownProps {
  title?: string;
  thumbnail?: string;
  originalPrice?: number;
  usdPrice?: number;
  dolarType?: DolarType;
  dolarRate?: number;
  province: ProvinceCode;
  isForeignDigitalService?: boolean;
  paymentMethod?: PaymentMethod;
  calculation?: TaxCalculationResult;
  mepComparison?: MepComparison;
  isLoading?: boolean;
  error?: string;
}

const dolarLabels: Record<DolarType, string> = {
  blue: "Blue",
  oficial: "Oficial",
  tarjeta: "Tarjeta (+30% Ganancias)",
};

export default function PriceBreakdown({
  title,
  thumbnail,
  originalPrice,
  usdPrice,
  dolarType,
  dolarRate,
  province,
  isForeignDigitalService = false,
  paymentMethod = "TARJETA_ARS",
  calculation,
  mepComparison,
  isLoading,
  error,
}: PriceBreakdownProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl bg-slate-800" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
            <Skeleton className="h-3 w-1/2 bg-slate-800" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl bg-slate-800" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#131B2E]/40 border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
        <p className="text-sm text-red-400 font-medium">Error al calcular el precio</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  if (typeof originalPrice === "undefined" && !calculation) {
    return (
      <div className="bg-[#131B2E]/30 border border-slate-850 border-dashed rounded-2xl p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-750/50 mx-auto flex items-center justify-center text-slate-400">
          <Info className="w-6 h-6 text-violet-400/70" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">Resultado en tiempo real</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Pegá un enlace de Steam, elegí una suscripción o ingresá un valor para ver el desglose impositivo instantáneo.
          </p>
        </div>
      </div>
    );
  }

  const isForeign = isForeignDigitalService || (!!usdPrice && !!dolarType);
  const isMepPayment = paymentMethod === "DOLAR_MEP_CUENTA";
  const effectiveMep = calculation?.mepComparison ?? mepComparison;

  // Si tenemos la liquidación exacta del motor tributario oficial
  const hasEngineCalc = !!calculation;
  const baseArs = calculation ? calculation.baseArs : (originalPrice ?? 0);
  const totalArs = calculation ? calculation.totalArs : 0;

  // Fallback con computeBreakdown legacy
  const applyGananciasExplicitly = isForeign && !usdPrice && !isMepPayment;
  const legacyBreakdown = computeBreakdown(originalPrice ?? 0, province, isForeign, applyGananciasExplicitly);
  const iibbApplies = isForeign && PROVINCES[province]?.iibbRate > 0;
  const finalTotal = hasEngineCalc ? totalArs : legacyBreakdown.total;

  // Tasa de cambio usada
  const exchangeRateUsed = calculation?.exchangeRateUsed ?? (isMepPayment ? effectiveMep?.mepRate : dolarRate);

  const handleCopy = () => {
    const textToCopy = `Impuesto Argento - ${title || "Compra"}\nTotal Final Estimado: ${formatArs(finalTotal)}\nBase ARS: ${formatArs(baseArs)}\nProvincia: ${PROVINCES[province]?.label || province}\nCalculado en impuesto-argento.netlify.app`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Desglose copiado",
      description: "Se copió el detalle al portapapeles.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5 transition-all duration-300">
      {/* Cabecera del ítem */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3 min-w-0">
          {thumbnail && thumbnail !== "/placeholder.svg" ? (
            <img
              src={thumbnail}
              alt={title || "Producto"}
              className="w-12 h-12 object-cover rounded-xl border border-slate-750/70 shrink-0 bg-slate-900"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold shrink-0">
              $
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-slate-100 truncate">
              {title || "Producto sin nombre"}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{PROVINCES[province]?.label}</span>
              <span>•</span>
              <span className="text-violet-400 font-medium">
                {isMepPayment ? "Dólar MEP" : "Tarjeta ARS"}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar desglose"
          className="text-slate-400 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700/60 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Precio Final: El Rey Visual */}
      <div className="space-y-1">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Total Final Estimado
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-emerald-400">
            {formatArs(finalTotal)}
          </span>
        </div>
        <p className="text-[10px] text-slate-400/80">
          Estimación con impuestos incluidos · No válido como factura
        </p>
      </div>

      {/* Desglose Compacto y Limpio */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/60 text-xs">
        {usdPrice && (
          <>
            <div className="flex justify-between items-center text-slate-400">
              <span>Precio original (USD)</span>
              <span className="font-mono font-medium text-slate-200">{formatUsd(usdPrice)}</span>
            </div>
            {exchangeRateUsed && (
              <div className="flex justify-between items-center text-slate-400">
                <span>Tipo de cambio</span>
                <span className="font-mono">× ${exchangeRateUsed.toFixed(0)}</span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center text-slate-300">
          <span>Precio base (ARS)</span>
          <span className="font-mono font-medium text-slate-200">{formatArs(baseArs)}</span>
        </div>

        {hasEngineCalc ? (
          <>
            {calculation.taxes.map((t) => {
              const isIva = t.id === "iva-21";
              const isGanancias = t.id === "rg-5617-30";
              const colorClass = isIva
                ? "text-slate-300"
                : isGanancias
                ? "text-violet-300"
                : "text-amber-300";

              return (
                <div key={t.id} className="flex justify-between items-center">
                  <span className={colorClass}>{t.name}</span>
                  <span className="font-mono font-medium text-slate-200">
                    + {formatArs(t.amountArs)}
                  </span>
                </div>
              );
            })}

            {isMepPayment && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Percepción Ganancias (RG 5617)</span>
                <span className="font-mono font-medium">Exento (\$0)</span>
              </div>
            )}

            {!calculation.taxes.some((t) => t.id.startsWith("iibb")) && (
              <div className="flex justify-between items-center text-slate-400/60">
                <span className="line-through">Percepción IIBB</span>
                <span>no aplica</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center text-slate-300">
              <span>IVA (21%)</span>
              <span className="font-mono font-medium text-slate-200">
                + {formatArs(legacyBreakdown.iva)}
              </span>
            </div>

            {isMepPayment ? (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Percepción Ganancias (RG 5617)</span>
                <span className="font-mono font-medium">Exento (\$0)</span>
              </div>
            ) : legacyBreakdown.ganancias > 0 ? (
              <div className="flex justify-between items-center text-violet-300">
                <span>Percepción Ganancias (30%)</span>
                <span className="font-mono font-medium text-slate-200">
                  + {formatArs(legacyBreakdown.ganancias)}
                </span>
              </div>
            ) : null}

            {isForeign && iibbApplies && (
              <div className="flex justify-between items-center text-amber-300">
                <span>IIBB ({PROVINCES[province]?.label})</span>
                <span className="font-mono font-medium text-slate-200">
                  + {formatArs(legacyBreakdown.iibb)}
                </span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center text-slate-400/40">
          <span className="line-through">Impuesto PAÍS</span>
          <span className="text-[10px]">eliminado 2 ene. 2026</span>
        </div>
      </div>

      {/* Ahorro con Dólar MEP */}
      {effectiveMep && effectiveMep.isRecommended && !isMepPayment && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-emerald-300">
              ¡Ahorrá {formatArs(effectiveMep.savingsArs)} ({effectiveMep.savingsPercentage}%) con MEP!
            </p>
            <p className="text-[11px] text-emerald-400/80 leading-relaxed">
              Pagando tu resumen con dólares de tu cuenta antes del vencimiento no te cobran el 30% de percepción.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
