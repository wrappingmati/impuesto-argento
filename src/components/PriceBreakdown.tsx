import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceBreakdownProps {
  originalPrice?: number;
  isLoading?: boolean;
  error?: string;
}

export default function PriceBreakdown({
  originalPrice,
  isLoading,
  error,
}: PriceBreakdownProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md p-6 space-y-4 bg-gaming-darker/50 backdrop-blur-sm">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
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

  if (typeof originalPrice === "undefined") {
    return null;
  }

  const ivaRate = 0.21; // 21% IVA
  const percepcionRate = 0.45; // 45% Percepción

  const ivaAmount = originalPrice * ivaRate;
  const percepcionAmount = originalPrice * percepcionRate;
  const finalPrice = originalPrice + ivaAmount + percepcionAmount;

  return (
    <Card className="w-full max-w-md p-6 space-y-4 bg-gaming-darker/50 backdrop-blur-sm animate-fade-in">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Desglose de Precio</h3>
        <div className="flex justify-between">
          <span>Precio Original:</span>
          <span>ARS ${originalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gaming-accent">
          <span>IVA (21%):</span>
          <span>ARS ${ivaAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gaming-accent">
          <span>Percepción Ganancias/BBPP (45%):</span>
          <span>ARS ${percepcionAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t border-gaming-accent/20">
          <span>Precio Final:</span>
          <span>ARS ${finalPrice.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}