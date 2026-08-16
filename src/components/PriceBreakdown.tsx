// src/components/PriceBreakdown.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";

interface PriceBreakdownProps {
  originalPrice?: number;
  usdPrice?: number;
  dolarType?: DolarType;
  dolarRate?: number;
  province: ProvinceCode;
  isLoading?: boolean;
  error?: string;
}

const dolarLabels: Record<DolarType, string> = {
  blue: "Blue",
  oficial: "Oficial",
  tarjeta: "Tarjeta (+45% Ganancias)",
};

export default function PriceBreakdown({
  originalPrice,
  usdPrice,
  dolarType,
  dolarRate,
  province,
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

  if (typeof originalPrice === "undefined") return null;

  const isForeign = !!usdPrice && !!dolarType;
  const breakdown = computeBreakdown(originalPrice, province, isForeign);
  const iibbApplies = isForeign && PROVINCES[province].iibbRate > 0;

  return (
    <div className="ticket w-full max-w-md p-6 space-y-4 animate-print-in font-nums">
      <div className="flex items-center justify-between font-display">
        <h3 className="text-base font-semibold tracking-wide">Comprobante estimado</h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          no válido como factura
        </span>
      </div>

      <div className="ticket-divider" />

      <div className="space-y-2 text-sm">
        {usdPrice && dolarType && dolarRate && (
          <div className="pb-3 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="font-display">Precio en USD</span>
              <span>{formatUsd(usdPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="font-display">Dólar {dolarLabels[dolarType]}</span>
              <span>× ${dolarRate.toFixed(0)}</span>
            </div>
            <div className="ticket-divider pt-2" />
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground font-display">Precio base (ARS)</span>
          <span>{formatArs(breakdown.base)}</span>
        </div>

        <div className="flex justify-between text-primary">
          <span className="font-display">IVA (21%)</span>
          <span>+ {formatArs(breakdown.iva)}</span>
        </div>

        {isForeign ? (
          iibbApplies ? (
            <div className="flex justify-between text-tarjeta">
              <span className="font-display">
                Percepción IIBB · {PROVINCES[province].label}
              </span>
              <span>+ {formatArs(breakdown.iibb)}</span>
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

        {dolarType === "tarjeta" && (
          <div className="flex justify-between text-muted-foreground/40">
            <span className="font-display line-through">Percepción Ganancias/BBPP (RG 5617)</span>
            <span className="text-xs self-center">ya incluida en el dólar tarjeta</span>
          </div>
        )}

        <div className="flex justify-between text-muted-foreground/40">
          <span className="font-display line-through">Impuesto PAÍS</span>
          <span className="text-xs self-center">eliminado 2 ene. 2026</span>
        </div>

        <div className="ticket-divider" />

        <div className="flex justify-between font-display font-bold text-base pt-1">
          <span>Total estimado</span>
          <span className="text-primary">{formatArs(breakdown.total)}</span>
        </div>
      </div>

      <div className="barcode mt-2" aria-hidden="true" />
    </div>
  );
}
