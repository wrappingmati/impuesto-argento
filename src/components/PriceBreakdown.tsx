// src/components/PriceBreakdown.tsx
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import type { MepComparison, PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";
import { Copy, Check, ReceiptText, Sparkles } from "lucide-react";
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
      <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl bg-white/5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4 bg-white/5" />
            <Skeleton className="h-3 w-1/2 bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-10 w-1/2 bg-white/5" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#131722] border border-red-500/20 rounded-2xl p-6 text-center space-y-2">
        <p className="text-sm text-red-400 font-medium">Error al calcular</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  if (typeof originalPrice === "undefined" && !calculation) {
    return (
      <div className="bg-[#131722] border border-white/[0.06] rounded-2xl p-7 text-center space-y-3">
        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] mx-auto flex items-center justify-center text-slate-400">
          <ReceiptText className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-slate-200">Comprobante en tiempo real</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Pegá un enlace de tienda o elegí una suscripción para ver el precio final y el desglose de impuestos.
          </p>
        </div>
      </div>
    );
  }

  const isForeign = isForeignDigitalService || (!!usdPrice && !!dolarType);
  const isMepPayment = paymentMethod === "DOLAR_MEP_CUENTA";
  const effectiveMep = calculation?.mepComparison ?? mepComparison;

  const hasEngineCalc = !!calculation;
  const baseArs = calculation ? calculation.baseArs : (originalPrice ?? 0);
  const totalArs = calculation ? calculation.totalArs : 0;

  const applyGananciasExplicitly = isForeign && !usdPrice && !isMepPayment;
  const legacyBreakdown = computeBreakdown(originalPrice ?? 0, province, isForeign, applyGananciasExplicitly);
  const iibbApplies = isForeign && PROVINCES[province]?.iibbRate > 0;
  const finalTotal = hasEngineCalc ? totalArs : legacyBreakdown.total;

  const exchangeRateUsed = calculation?.exchangeRateUsed ?? (isMepPayment ? effectiveMep?.mepRate : dolarRate);

  const handleCopy = () => {
    const textToCopy = `Impuesto Argento - ${title || "Compra"}\nTotal estimado: ${formatArs(finalTotal)}\nBase ARS: ${formatArs(baseArs)}\nProvincia: ${PROVINCES[province]?.label || province}\nCalculado en impuesto-argento.netlify.app`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Copiado al portapapeles",
      description: "El desglose del precio fue copiado.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-6 shadow-sm space-y-5">
      {/* Cabecera del comprobante */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          {thumbnail && thumbnail !== "/placeholder.svg" ? (
            <img
              src={thumbnail}
              alt={title || "Producto"}
              className="w-11 h-11 object-cover rounded-lg border border-white/[0.08] shrink-0 bg-black/40"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 shrink-0">
              <ReceiptText className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-slate-100 truncate">
              {title || "Producto sin nombre"}
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{PROVINCES[province]?.label}</span>
              <span>•</span>
              <span className="text-slate-300">
                {isMepPayment ? "Pago con Dólar MEP" : "Tarjeta en pesos"}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar comprobante"
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Precio Final: Claro, elegante y visible */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Total Final Estimado
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-emerald-400">
            {formatArs(finalTotal)}
          </span>
        </div>
      </div>

      {/* Desglose Impositivo Ordenado */}
      <div className="space-y-2.5 pt-3 border-t border-white/[0.06] text-xs">
        {usdPrice && (
          <>
            <div className="flex justify-between items-center text-slate-400">
              <span>Precio en origen</span>
              <span className="font-mono text-slate-200">{formatUsd(usdPrice)}</span>
            </div>
            {exchangeRateUsed && (
              <div className="flex justify-between items-center text-slate-400">
                <span>Tipo de cambio base</span>
                <span className="font-mono">× ${exchangeRateUsed.toFixed(0)}</span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center text-slate-300">
          <span>Precio base (ARS)</span>
          <span className="font-mono font-medium text-slate-100">{formatArs(baseArs)}</span>
        </div>

        {hasEngineCalc ? (
          <>
            {calculation.taxes.map((t) => {
              return (
                <div key={t.id} className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">{t.name}</span>
                  <span className="font-mono text-slate-200">+ {formatArs(t.amountArs)}</span>
                </div>
              );
            })}

            {isMepPayment && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Percepción Ganancias (RG 5617)</span>
                <span className="font-mono">Exento (\$0)</span>
              </div>
            )}

            {!calculation.taxes.some((t) => t.id.startsWith("iibb")) && (
              <div className="flex justify-between items-center text-slate-500">
                <span>Percepción IIBB</span>
                <span className="text-[11px]">no aplica en tu provincia</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">IVA (21%)</span>
              <span className="font-mono text-slate-200">+ {formatArs(legacyBreakdown.iva)}</span>
            </div>

            {isMepPayment ? (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Percepción Ganancias (RG 5617)</span>
                <span className="font-mono">Exento (\$0)</span>
              </div>
            ) : legacyBreakdown.ganancias > 0 ? (
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Percepción Ganancias (30%)</span>
                <span className="font-mono text-slate-200">
                  + {formatArs(legacyBreakdown.ganancias)}
                </span>
              </div>
            ) : null}

            {isForeign && iibbApplies && (
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">IIBB ({PROVINCES[province]?.label})</span>
                <span className="font-mono text-slate-200">
                  + {formatArs(legacyBreakdown.iibb)}
                </span>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center text-slate-500">
          <span className="line-through">Impuesto PAÍS</span>
          <span className="text-[10px]">eliminado 2 ene. 2026</span>
        </div>
      </div>

      {/* Sugerencia de Ahorro MEP si aplica */}
      {effectiveMep && effectiveMep.isRecommended && !isMepPayment && (
        <div className="p-3.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div className="space-y-0.5">
            <p className="font-medium text-emerald-200">
              Ahorrás {formatArs(effectiveMep.savingsArs)} ({effectiveMep.savingsPercentage}%) con Dólar MEP
            </p>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              Si pagás tu resumen antes del vencimiento con dólares propios de tu cuenta bancaria, evitás el 30% de percepción.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
