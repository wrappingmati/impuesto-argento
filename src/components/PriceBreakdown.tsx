// src/components/PriceBreakdown.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceBreakdownProps {
  originalPrice?: number;
  usdPrice?: number;
  dolarType?: "blue" | "oficial" | "tarjeta";
  dolarRate?: number;
  isLoading?: boolean;
  error?: string;
}

const IVA_RATE = 0.21;

const dolarLabels: Record<string, string> = {
  blue: "Blue",
  oficial: "Oficial",
  tarjeta: "Tarjeta (+45% Ganancias)",
};

export default function PriceBreakdown({
  originalPrice,
  usdPrice,
  dolarType,
  dolarRate,
  isLoading,
  error,
}: PriceBreakdownProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md p-6 space-y-4 bg-gaming-darker/50 backdrop-blur-sm">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md p-6 bg-gaming-darker/50 backdrop-blur-sm border-destructive">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (typeof originalPrice === "undefined") return null;

  const ivaAmount = originalPrice * IVA_RATE;
  const finalPrice = originalPrice + ivaAmount;

  return (
    <Card className="w-full max-w-md p-6 space-y-4 bg-gaming-darker/50 backdrop-blur-sm animate-fade-in">
      <h3 className="text-lg font-semibold">Desglose de Precio</h3>

      <div className="space-y-2 text-sm">
        {/* Conversión USD si aplica */}
        {usdPrice && dolarType && dolarRate && (
          <div className="pb-3 mb-1 border-b border-gaming-accent/10 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Precio en USD:</span>
              <span>USD ${usdPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Dólar {dolarLabels[dolarType]}:</span>
              <span>× ${dolarRate.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Precio base en ARS */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Precio base (ARS):</span>
          <span>${originalPrice.toFixed(2)}</span>
        </div>

        {/* IVA */}
        <div className="flex justify-between text-gaming-accent">
          <span>IVA (21%):</span>
          <span>+ ${ivaAmount.toFixed(2)}</span>
        </div>

        {/* Percepción Ganancias/BBPP - eliminado desde 2024 */}
        <div className="flex justify-between text-muted-foreground/40">
          <span className="line-through">Percepción Ganancias/BBPP (45%):</span>
          <span className="line-through text-xs self-center">eliminado</span>
        </div>

        {/* Total */}
        <div className="flex justify-between font-bold text-base pt-3 border-t border-gaming-accent/20">
          <span>Precio Final:</span>
          <span className="text-gaming-accent">ARS ${finalPrice.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}