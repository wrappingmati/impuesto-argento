// src/components/TaxInfo.tsx
import React from "react";
import { Info, CheckCircle2, XCircle } from "lucide-react";

export default function TaxInfo() {
  return (
    <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2.5">
        <Info className="w-5 h-5 text-violet-400 shrink-0" />
        <h3 className="font-semibold text-base text-slate-100">
          Marco tributario argentino vigente
        </h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0F1626] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                IVA Servicios Digitales
              </span>
              <span className="text-emerald-400 font-mono font-bold">21%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Decreto 813/2018. Aplica a Netflix, Steam, Spotify, ChatGPT y cualquier servicio del exterior.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1626] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Percepción Ganancias / BBPP
              </span>
              <span className="text-violet-300 font-mono font-bold">30%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Resolución General ARCA 5617. Exenta si cancelás el resumen con dólares propios (Dólar MEP).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1626] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                Percepción IIBB Provincial
              </span>
              <span className="text-sky-300 font-mono font-bold">0% a 5,5%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Según tu jurisdicción fiscal (CABA, BsAs, Córdoba, Santa Fe reducida 3%, etc.).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F1626] border border-slate-800 space-y-1 opacity-70">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-400 flex items-center gap-1.5 line-through">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                Impuesto PAÍS
              </span>
              <span className="text-red-400 font-mono font-bold">0% (Vencido)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Venció por ley el 2 de enero de 2026. Ya no se cobra en consumos con tarjeta en el exterior.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
          Los valores son estimaciones técnicas de carácter informativo para orientar a consumidores y gamers. Las normas y alícuotas bancarias pueden actualizarse periódicamente.
        </p>
      </div>
    </div>
  );
}
