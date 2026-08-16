// src/components/TaxInfo.tsx
import { Info } from "lucide-react";

export default function TaxInfo() {
  return (
    <div className="ticket w-full max-w-md p-5">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <h3 className="font-display font-semibold">
            Impuestos vigentes hoy (agosto 2026)
          </h3>
          <div className="space-y-1 text-muted-foreground font-nums">
            <div className="flex justify-between">
              <span className="font-display">✅ IVA (servicios digitales)</span>
              <span className="font-medium text-foreground">21%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-display">✅ Percepción Ganancias/BBPP (RG 5617)</span>
              <span className="font-medium text-foreground">30% · solo dólar tarjeta</span>
            </div>
            <div className="flex justify-between">
              <span className="font-display">✅ Percepción IIBB (según provincia)</span>
              <span className="font-medium text-foreground">0% – 5,5%</span>
            </div>
            <div className="flex justify-between line-through opacity-40">
              <span className="font-display">❌ Impuesto PAÍS</span>
              <span>30% (venció por ley el 2/1/2026)</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 pt-1">
            Hasta enero de 2026 el dólar tarjeta llevaba Impuesto PAÍS (30%) +
            percepción de Ganancias (30%) = 60% total. El Impuesto PAÍS tenía
            una vigencia legal de 5 años y venció; hoy solo queda la
            percepción RG 5617 del 30%, ya incorporada en la cotización
            "tarjeta" de esta app.
          </p>
          <p className="text-xs text-muted-foreground/70">
            La percepción de IIBB grava el consumo de servicios digitales de
            plataformas extranjeras (Steam, PlayStation Store, Xbox, etc.) y
            depende de tu provincia. Entre Ríos, Mendoza y la mayoría de las
            provincias no listadas no tienen, a esta fecha, un régimen
            específico para esto — CABA, Buenos Aires, Córdoba, Santa Fe,
            Chaco, La Pampa, Neuquén, Río Negro, Salta y Tierra del Fuego sí.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Son valores de referencia relevados de normativa pública, no
            asesoramiento impositivo. Las alícuotas provinciales cambian con
            frecuencia — confirmá siempre con el resumen de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
}
