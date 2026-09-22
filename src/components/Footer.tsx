// src/components/Footer.tsx
import React from "react";
import LegalModal from "./LegalModal";
import { ShieldCheck, Code2, Globe, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-16 border-t border-slate-850 bg-[#080C14] text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Marca */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <img
                src="/logo.png"
                alt="Impuesto Argento"
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Calculadora transparente de precios en moneda extranjera y suscripciones digitales con alícuotas tributarias oficiales para Argentina.
            </p>
          </div>

          {/* Redes y enlaces de wrappingmati */}
          <div className="flex flex-col items-center md:items-end gap-2.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              Desarrollado por <span className="text-violet-400 font-bold">wrappingmati</span>
            </span>
            <div className="flex items-center gap-3 text-xs">
              <a
                href="https://github.com/wrappingmati"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-slate-850/60 border border-slate-750/70 hover:border-slate-600 px-3 py-1.5 rounded-xl"
              >
                <Code2 className="w-3.5 h-3.5 text-violet-400" />
                <span>GitHub</span>
              </a>

              <a
                href="https://x.com/wrappingmati"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-slate-850/60 border border-slate-750/70 hover:border-slate-600 px-3 py-1.5 rounded-xl"
              >
                <span className="font-bold text-xs">𝕏</span>
                <span>Twitter / X</span>
              </a>

              <a
                href="https://github.com/wrappingmati"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors bg-slate-850/60 border border-slate-750/70 hover:border-slate-600 px-3 py-1.5 rounded-xl"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portafolio</span>
              </a>
            </div>
          </div>
        </div>

        {/* Separador sutil */}
        <div className="border-t border-slate-850/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <LegalModal>
              <button
                type="button"
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Términos y Privacidad (Ley 25.326)</span>
              </button>
            </LegalModal>
            <span>•</span>
            <a
              href="https://github.com/wrappingmati/impuesto-argento"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Código Abierto (Licencia MIT)
            </a>
          </div>

          <p className="text-[11px] text-slate-500 text-center sm:text-right">
            Simulador informativo no oficial. © {currentYear} Impuesto Argento.
          </p>
        </div>
      </div>
    </footer>
  );
}
