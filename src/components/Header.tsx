// src/components/Header.tsx
import React from "react";
import { Search, ExternalLink, ShieldCheck } from "lucide-react";
import type { DolarRates } from "@/lib/dolarApi";

interface HeaderProps {
  backendOnline: boolean | null;
  dolarRates?: DolarRates;
  onNavigateSection?: (sectionId: string) => void;
  onOpenApiDocs?: () => void;
}

export default function Header({
  backendOnline,
  dolarRates,
  onNavigateSection,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo a la izquierda */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/logo-full.png"
              alt="Impuesto Argento"
              className="h-8 sm:h-9 w-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/logo-icon.png";
              }}
            />
          </a>

          {/* Navegación estilo desktop del mockup */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => onNavigateSection?.("calculadora")}
              className="hover:text-white transition-colors"
            >
              Calculadoras
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection?.("juegos")}
              className="hover:text-white transition-colors"
            >
              Juegos
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection?.("servicios")}
              className="hover:text-white transition-colors"
            >
              Servicios del exterior
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection?.("guias")}
              className="hover:text-white transition-colors"
            >
              Guías
            </button>
            <a
              href="https://github.com/wrappingmati/impuesto-argento#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>API</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </nav>
        </div>

        {/* Lado derecho: Buscador rápido o cotizaciones y botón Acceder */}
        <div className="flex items-center gap-3">
          {dolarRates?.tarjeta && (
            <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono bg-[#1E1B2E] border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
              <span className="text-slate-400">Tarjeta:</span>
              <span className="font-semibold text-white">${dolarRates.tarjeta.toFixed(0)}</span>
              {dolarRates.mep && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">MEP:</span>
                  <span className="font-semibold text-[#22D3EE]">${dolarRates.mep.toFixed(0)}</span>
                </>
              )}
            </div>
          )}

          {/* Botón Acceder estilo pill de la referencia */}
          <a
            href="https://github.com/wrappingmati/impuesto-argento"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
