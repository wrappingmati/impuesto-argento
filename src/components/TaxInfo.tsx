// src/components/TaxInfo.tsx
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function TaxInfo() {
  return (
    <Card className="w-full max-w-md p-5 bg-gaming-darker/50 backdrop-blur-sm border-gaming-accent/10">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gaming-accent flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">Impuestos en compras digitales (Argentina)</h3>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>✅ IVA</span>
              <span className="font-medium text-white">21%</span>
            </div>
            <div className="flex justify-between line-through opacity-40">
              <span>❌ Percepción Ganancias/BBPP</span>
              <span>45% (eliminado sept. 2024)</span>
            </div>
            <div className="flex justify-between line-through opacity-40">
              <span>❌ Impuesto PAÍS</span>
              <span>30% (eliminado sept. 2024)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 pt-1">
            El dólar tarjeta ya incorpora la retención del 45% de Ganancias sobre el tipo de cambio.
          </p>
        </div>
      </div>
    </Card>
  );
}