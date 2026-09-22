// src/components/Header.tsx
import React from "react";
import { Github, Sparkles } from "lucide-react";
import type { DolarRates } from "@/lib/dolarApi";

interface HeaderProps {
  backendOnline: boolean | null;
  dolarRates?: DolarRates;
  onNavigateTab?: (tab: "url" | "catalog" | "manual") => void;
  activeTab?: string;
}

export default function Header({
  backendOnline,
  dolarRates,
  onNavigateTab,
  activeTab,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0b0e14]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo a la izquierda */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-95"
          >
            <img
              src="/logo-full.png"
              alt="Impuesto Argento"
              className="h-8 sm:h-9 w-auto object-contain"
              onError={(e) => {
                // Fallback a logo-icon o texto
                (e.currentTarget as HTMLImageElement).src = "/logo-icon.png";
              }}
            />
          </a>
        </div>

        {/* Centro / Accesos rápidos de pestaña (desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131722] p-1 rounded-xl border border-white/[0.06] text-xs">
          <button
            type="button"
            onClick={() => onNavigateTab?.("url")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "url"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Pegar Link
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab?.("catalog")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "catalog"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Suscripciones
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab?.("manual")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "manual"
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Manual
          </button>
        </nav>

        {/* Acciones a la derecha: Estado sutil y enlaces */}
        <div className="flex items-center gap-3">
          {/* Ticker rápido de cotización si está disponible */}
          {dolarRates?.tarjeta && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono bg-[#131722] px-2.5 py-1 rounded-lg border border-white/[0.06] text-slate-400">
              <span>Tarjeta:</span>
              <span className="text-slate-200 font-semibold">${dolarRates.tarjeta.toFixed(0)}</span>
              {dolarRates.mep && (
                <>
                  <span className="text-slate-600">|</span>
                  <span>MEP:</span>
                  <span className="text-emerald-400 font-semibold">${dolarRates.mep.toFixed(0)}</span>
                </>
              )}
            </div>
          )}

          {/* Indicador silencioso de estado */}
          <div
            className="flex items-center gap-1.5 text-[11px] text-slate-400 px-2 py-1 rounded-md"
            title={backendOnline ? "Servicio de scraping conectado" : "Modo local activo"}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendOnline ? "bg-emerald-400" : "bg-amber-400/80"
              }`}
            />
            <span className="hidden sm:inline text-slate-400 text-[10px]">
              {backendOnline ? "Scraper listo" : "Local"}
            </span>
          </div>

          <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

          {/* Enlace al autor / repo */}
          <a
            href="https://github.com/wrappingmati/impuesto-argento"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver código fuente en GitHub"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
