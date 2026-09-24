// src/components/Footer.tsx
import React from "react";
import LegalModal from "./LegalModal";
import { ExternalLink, Github, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 border-t border-slate-800 bg-[#0A0F1D] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Autor */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img
                src="/logo-full.png"
                alt="Impuesto Argento"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo-icon.png";
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Un proyecto de{" "}
              <a
                href="https://www.wrappingmati.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#74ACDF] font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>Matías Casas – WrappingMati</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </p>
            <p className="text-[11px] text-slate-500">
              Desarrollado con pasión por la tecnología y la comunidad gamer.
            </p>
          </div>

          {/* Enlaces de pie de página */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <a
              href="#calculadora"
              className="hover:text-white transition-colors"
            >
              Calculadoras
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="#guias"
              className="hover:text-white transition-colors"
            >
              Guías
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://www.wrappingmati.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[#74ACDF]" />
              <span>Portafolio</span>
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/wrappingmati/impuesto-argento"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <span className="text-slate-700">•</span>
            <LegalModal>
              <button
                type="button"
                className="hover:text-white transition-colors"
              >
                Privacidad (Ley 25.326)
              </button>
            </LegalModal>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} Impuesto Argento. Código abierto bajo licencia MIT.</p>
          <p className="flex items-center gap-1.5">
            <span>Argentina · 2026 · Información con base en fuentes oficiales</span>
            <span>🇦🇷</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
