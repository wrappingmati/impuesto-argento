// src/components/TaxInfo.tsx
import React from "react";
import { Info, BookOpen, ShieldCheck } from "lucide-react";

export default function TaxInfo() {
  return (
    <div className="bg-[#131B2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 text-xs shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-[#A78BFA] shrink-0" />
          <span>Guía Tributaria: Impuestos Digitales en Argentina</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Actualizado 2026</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400">
        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>IVA Servicios Digitales (Dec. 813/2018)</span>
            <span className="text-emerald-400 font-mono text-sm">21%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Se aplica sobre el valor base en pesos de compras digitales del exterior (Steam, PlayStation Store, Netflix, Spotify, etc.).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>Percepción Ganancias (RG 5617 ARCA)</span>
            <span className="text-[#A78BFA] font-mono text-sm">30%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Percepción a cuenta deducible de Ganancias o Bienes Personales. <strong>Exenta (\$0)</strong> si pagás tu resumen bancario con Dólar MEP desde caja de ahorro.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>Percepción Ingresos Brutos (IIBB)</span>
            <span className="text-cyan-400 font-mono text-sm">0% a 5,5%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Régimen local según tu provincia (CABA: 2%, Buenos Aires: 2%, Córdoba: 3%, Entre Ríos: 3%, Santa Fe: 4,5%, etc.).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800/60 space-y-1 opacity-65">
          <div className="flex items-center justify-between font-medium text-slate-400 line-through">
            <span>Impuesto PAÍS (Ley 27.541)</span>
            <span className="font-mono text-sm">0%</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Finalizó su vigencia legal de 5 años. Ya no se cobra en ninguna tarjeta ni consumo con moneda extranjera.
          </p>
        </div>
      </div>
    </div>
  );
}
