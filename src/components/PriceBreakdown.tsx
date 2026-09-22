// src/components/PriceBreakdown.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import type { MepComparison, PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";
import { Sparkles } from "lucide-react";

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
  if (isLoading) {
    return (
      <div className="ticket w-full max-w-md p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket w-full max-w-md p-6 border-destructive">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (typeof originalPrice === "undefined" && !calculation) return null;

  const isForeign = isForeignDigitalService || (!!usdPrice && !!dolarType);
  const isMepPayment = paymentMethod === "DOLAR_MEP_CUENTA";
  const effectiveMep = calculation?.mepComparison ?? mepComparison;

  // Si tenemos la liquidación exacta del motor tributario oficial, la usamos directamente
  const hasEngineCalc = !!calculation;
  const baseArs = calculation ? calculation.baseArs : (originalPrice ?? 0);
  const totalArs = calculation ? calculation.totalArs : 0;

  // Fallback con computeBreakdown legacy
  const applyGananciasExplicitly = isForeign && !usdPrice && !isMepPayment;
  const legacyBreakdown = computeBreakdown(originalPrice ?? 0, province, isForeign, applyGananciasExplicitly);
  const iibbApplies = isForeign && PROVINCES[province]?.iibbRate > 0;

  // La tasa de cambio que se usó para calcular el precio base
  const exchangeRateUsed = calculation?.exchangeRateUsed ?? (isMepPayment ? effectiveMep?.mepRate : dolarRate);

  return (
    <div className="ticket w-full max-w-md p-6 space-y-4 animate-print-in font-nums">
      {/* Portada y título si proviene de scraping o catálogo */}
      {title && (
        <div className="flex items-center gap-3 pb-2 border-b border-border/40">
          {thumbnail && thumbnail !== "/placeholder.svg" && (
            <img
              src={thumbnail}
              alt={title}
              className="w-12 h-12 object-cover rounded-md border border-border/50 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-sm truncate text-foreground">{title}</h4>
            <p className="text-[11px] text-muted-foreground">Desglose impositivo en tiempo real</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between font-display">
        <h3 className="text-base font-semibold tracking-wide">Comprobante estimado</h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          no válido como factura
        </span>
      </div>

      <div className="ticket-divider" />

      <div className="space-y-2 text-sm">
        {usdPrice && (
          <div className="pb-3 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="font-display">Precio original</span>
              <span>{formatUsd(usdPrice)}</span>
            </div>
            {exchangeRateUsed && (
              <div className="flex justify-between text-muted-foreground">
                <span className="font-display">
                  {isMepPayment
                    ? "Dólar MEP (Bolsa)"
                    : calculation?.exchangeRateUsed
                    ? "Dólar Oficial (cambio base)"
                    : `Dólar ${dolarLabels[dolarType || "oficial"]}`}
                </span>
                <span>× ${exchangeRateUsed.toFixed(0)}</span>
              </div>
            )}
            <div className="ticket-divider pt-2" />
          </div>
        )}

        {hasEngineCalc ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-display">Precio base (ARS)</span>
              <span>{formatArs(baseArs)}</span>
            </div>

            {/* Impuestos desglosados del motor tributario */}
            {calculation.taxes.map((t) => {
              const isIva = t.id === "iva-21";
              const isGanancias = t.id === "rg-5617-30";
              const colorClass = isIva
                ? "text-primary"
                : isGanancias
                ? "text-tarjeta"
                : "text-amber-400";

              return (
                <div key={t.id} className={`flex justify-between ${colorClass}`}>
                  <span className="font-display">{t.name}</span>
                  <span>+ {formatArs(t.amountArs)}</span>
                </div>
              );
            })}

            {/* Si paga con MEP, mostrar exención explícita de Ganancias */}
            {isMepPayment && (
              <div className="flex justify-between text-emerald-500">
                <span className="font-display">Percepción Ganancias (RG 5617)</span>
                <span className="text-xs font-semibold">Exento ($0) con Dólar MEP</span>
              </div>
            )}

            {/* Si IIBB no aplica en la provincia */}
            {!calculation.taxes.some((t) => t.id.startsWith("iibb")) && (
              <div className="flex justify-between text-muted-foreground/50">
                <span className="font-display line-through">Percepción IIBB</span>
                <span className="text-xs self-center">
                  {province === "OTRA" ? "elegí tu provincia" : "no aplica en tu provincia"}
                </span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground/40">
              <span className="font-display line-through">Impuesto PAÍS</span>
              <span className="text-xs self-center">eliminado 2 ene. 2026</span>
            </div>

            <div className="ticket-divider" />

            <div className="flex justify-between font-display font-bold text-base pt-1">
              <span>Total estimado</span>
              <span className="text-primary">{formatArs(totalArs)}</span>
            </div>
          </>
        ) : (
          /* Modo de compatibilidad / fallback legacy */
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-display">Precio base (ARS)</span>
              <span>{formatArs(legacyBreakdown.base)}</span>
            </div>

            <div className="flex justify-between text-primary">
              <span className="font-display">IVA (21%)</span>
              <span>+ {formatArs(legacyBreakdown.iva)}</span>
            </div>

            {/* Percepción Ganancias / BBPP */}
            {isMepPayment ? (
              <div className="flex justify-between text-emerald-500">
                <span className="font-display">Percepción Ganancias (RG 5617)</span>
                <span className="text-xs font-semibold">Exento ($0) con Dólar MEP</span>
              </div>
            ) : legacyBreakdown.ganancias > 0 ? (
              <div className="flex justify-between text-tarjeta">
                <span className="font-display">
                  Percepción Ganancias/BBPP (RG 5617) · 30%
                </span>
                <span>+ {formatArs(legacyBreakdown.ganancias)}</span>
              </div>
            ) : dolarType === "tarjeta" ? (
              <div className="flex justify-between text-muted-foreground/40">
                <span className="font-display line-through">Percepción Ganancias/BBPP (RG 5617)</span>
                <span className="text-xs self-center">ya incluida en el dólar tarjeta</span>
              </div>
            ) : null}

            {/* IIBB Provincial */}
            {isForeign ? (
              iibbApplies ? (
                <div className="flex justify-between text-tarjeta">
                  <span className="font-display">
                    Percepción IIBB · {PROVINCES[province]?.label}
                  </span>
                  <span>+ {formatArs(legacyBreakdown.iibb)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-muted-foreground/50">
                  <span className="font-display line-through">Percepción IIBB</span>
                  <span className="text-xs self-center">
                    {province === "OTRA" ? "elegí tu provincia" : "no aplica en tu provincia"}
                  </span>
                </div>
              )
            ) : (
              <div className="flex justify-between text-muted-foreground/40">
                <span className="font-display line-through">Percepción IIBB</span>
                <span className="text-xs self-center">solo aplica a compras en plataformas extranjeras</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground/40">
              <span className="font-display line-through">Impuesto PAÍS</span>
              <span className="text-xs self-center">eliminado 2 ene. 2026</span>
            </div>

            <div className="ticket-divider" />

            <div className="flex justify-between font-display font-bold text-base pt-1">
              <span>Total estimado</span>
              <span className="text-primary">{formatArs(legacyBreakdown.total)}</span>
            </div>
          </>
        )}

        {/* Recomendación de ahorro con Dólar MEP */}
        {effectiveMep && effectiveMep.isRecommended && !isMepPayment && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                ¡Pagando con Dólares MEP te ahorrás {formatArs(effectiveMep.savingsArs)} ({effectiveMep.savingsPercentage}%)!
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Si pagás tu resumen en dólares antes del vencimiento con saldo en cuenta, no te cobran el 30% de percepción.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="barcode mt-2" aria-hidden="true" />
    </div>
  );
}
