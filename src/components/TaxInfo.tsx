// src/components/TaxInfo.tsx
import React from "react";
import { Info } from "lucide-react";

export default function TaxInfo() {
  return (
    <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-5 space-y-3 text-xs">
      <div className="flex items-center gap-2 text-slate-300 font-medium">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>¿Qué impuestos se pagan hoy en Argentina?</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
        <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-200">
            <span>IVA Servicios Digitales</span>
            <span className="text-emerald-400 font-mono">21%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Aplica a suscripciones y plataformas del exterior (Steam, Netflix, Spotify).
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-200">
            <span>Percepción Ganancias / BBPP</span>
            <span className="text-slate-300 font-mono">30%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            RG ARCA 5617. No te la cobran si pagás tu resumen en dólares (Dólar MEP).
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-200">
            <span>Percepción IIBB Provincial</span>
            <span className="text-slate-300 font-mono">0% a 5,5%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Según tu provincia fiscal (CABA, Buenos Aires, Córdoba, Santa Fe, etc.).
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.06] space-y-1 opacity-60">
          <div className="flex items-center justify-between font-medium text-slate-400 line-through">
            <span>Impuesto PAÍS</span>
            <span className="font-mono">0%</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tenía vigencia por 5 años y venció el 2 de enero de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
