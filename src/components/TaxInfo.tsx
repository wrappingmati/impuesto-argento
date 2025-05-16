import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export default function TaxInfo() {
  return (
    <Card className="w-full max-w-md p-6 bg-gaming-darker/50 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <Info className="w-6 h-6 text-gaming-accent flex-shrink-0" />
        <div className="space-y-2">
          <h3 className="font-semibold">Impuestos en Compras Digitales en Argentina</h3>
          <p className="text-sm text-muted-foreground">
            Las compras digitales en Argentina están sujetas a los siguientes impuestos:
            IVA (21%) </p>
        </div>
      </div>
    </Card>
  );
}