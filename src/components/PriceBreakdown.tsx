// src/components/PriceBreakdown.tsx
import React, { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import type { MepComparison, PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";
import { Copy, Check, Info, Sparkles, ChevronRight } from "lucide-react";
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
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="bg-[#1E1B2E] border border-slate-800 rounded-2xl p-6 space-y-4">
        <Skeleton className="h-4 w-32 bg-slate-800" />
        <Skeleton className="h-12 w-3/4 bg-slate-800" />
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
      <div className="bg-[#1E1B2E] border border-red-500/30 rounded-2xl p-6 text-center space-y-2">
        <p className="text-sm text-red-400 font-medium">Error al procesar el precio</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  if (typeof originalPrice === "undefined" && !calculation) {
    return (
      <div className="bg-[#1E1B2E]/60 border border-slate-800 rounded-2xl p-7 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 mx-auto flex items-center justify-center text-slate-400">
          <Info className="w-5 h-5 text-[#A78BFA]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">Resultado estimado</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Ingresá un precio o pegá un enlace para ver el desglose en pesos al instante.
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

  const handleCopy = () => {
    const textToCopy = `Impuesto Argento - ${title || "Juego"}\nTotal estimado: ${formatArs(finalTotal)}\nBase ARS: ${formatArs(baseArs)}\nProvincia: ${PROVINCES[province]?.label || province}\nCalculá en impuesto-argento.netlify.app`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Copiado al portapapeles",
      description: "El desglose del precio fue copiado con éxito.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1E1B2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Cabecera del producto */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          {thumbnail && thumbnail !== "/placeholder.svg" ? (
            <img
              src={thumbnail}
              alt={title || "Producto"}
              className="w-10 h-10 object-cover rounded-lg border border-slate-700/60 shrink-0 bg-black/40"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-[#6D28D9]/20 border border-[#6D28D9]/40 flex items-center justify-center text-[#A78BFA] font-bold shrink-0">
              🎮
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-white truncate">
              {title || "Producto seleccionado"}
            </h3>
            <p className="text-xs text-slate-400">
              {PROVINCES[province]?.label} · {isMepPayment ? "Dólar MEP" : "Tarjeta ARS"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar comprobante"
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Precio Final: Grande y claro como en el mockup */}
      <div className="space-y-1">
        <p className="text-xs text-slate-400 font-medium">Total estimado</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
            {formatArs(finalTotal)}
          </span>
          <span className="text-xs font-semibold text-[#A78BFA]">ARS</span>
        </div>
      </div>

      {/* Desglose de impuestos limpio */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs sm:text-sm">
        {usdPrice && (
          <div className="flex justify-between items-center text-slate-400">
            <span>Precio original</span>
            <span className="font-mono text-slate-200">{formatUsd(usdPrice)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-300">
          <span>Precio base</span>
          <span className="font-mono text-slate-200">{formatArs(baseArs)}</span>
        </div>

        {hasEngineCalc ? (
          <>
            {calculation.taxes.map((t) => {
              const isIva = t.id === "iva-21";
              const isGanancias = t.id === "rg-5617-30";
              const label = isIva
                ? "IVA (21%)"
                : isGanancias
                ? "Percepción (30% RG 5617)"
                : t.name;

              return (
                <div key={t.id} className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">{label}</span>
                  <span className="font-mono text-slate-200">+ {formatArs(t.amountArs)}</span>
                </div>
              );
            })}

            {isMepPayment && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Percepción (30% RG 5617)</span>
                <span className="font-mono font-medium">Exento (\$0)</span>
              </div>
            )}

            {!calculation.taxes.some((t) => t.id.startsWith("iibb")) && (
              <div className="flex justify-between items-center text-slate-500">
                <span>Otros cargos (IIBB)</span>
                <span className="text-xs">no aplica</span>
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
                <span>Percepción (30% RG 5617)</span>
                <span className="font-mono font-medium">Exento (\$0)</span>
              </div>
            ) : legacyBreakdown.ganancias > 0 ? (
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Percepción (30%)</span>
                <span className="font-mono text-slate-200">
                  + {formatArs(legacyBreakdown.ganancias)}
                </span>
              </div>
            ) : null}

            {isForeign && iibbApplies && (
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Otros cargos (IIBB)</span>
                <span className="font-mono text-slate-200">
                  + {formatArs(legacyBreakdown.iibb)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Impuesto PAIS tachado */}
        <div className="flex justify-between items-center text-slate-500">
          <span className="line-through">Impuesto PAÍS</span>
          <span className="text-xs">0% (Vencido 2/1/2026)</span>
        </div>
      </div>

      {/* Ahorro con Dólar MEP */}
      {effectiveMep && effectiveMep.isRecommended && !isMepPayment && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div className="space-y-0.5">
            <p className="font-semibold text-emerald-200">
              ¡Ahorrás {formatArs(effectiveMep.savingsArs)} ({effectiveMep.savingsPercentage}%) con Dólar MEP!
            </p>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              Pagá tu resumen en dólares antes del vencimiento con saldo en cuenta para no pagar el 30% de percepción.
            </p>
          </div>
        </div>
      )}

      {/* Link estilo "Ver detalle de impuestos >" de la referencia */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>Ver detalle de impuestos</span>
        </span>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-90" : ""}`} />
      </button>

      {showDetails && (
        <div className="p-3 rounded-xl bg-[#0F172A] border border-slate-800 text-[11px] text-slate-400 space-y-1.5 animate-fade-in">
          <p><strong className="text-slate-200">IVA (21%):</strong> Decreto 813/2018 para servicios digitales del exterior.</p>
          <p><strong className="text-slate-200">Percepción Ganancias (30%):</strong> RG 5617/2024 sobre compra de moneda extranjera.</p>
          <p><strong className="text-slate-200">IIBB Provincial:</strong> Régimen de percepción local ({PROVINCES[province]?.label}: {((PROVINCES[province]?.iibbRate || 0) * 100).toFixed(1)}%).</p>
        </div>
      )}
    </div>
  );
}
