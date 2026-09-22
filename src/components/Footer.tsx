// src/components/Footer.tsx
import React from "react";
import LegalModal from "./LegalModal";
import { Github, Globe, ShieldCheck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 border-t border-white/[0.06] bg-[#080b10] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        {/* Marca & Autor */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <img
            src="/logo-icon.png"
            alt="Impuesto Argento"
            className="w-7 h-7 object-contain"
          />
          <div>
            <p className="text-slate-200 font-medium">
              Impuesto Argento
              <span className="text-slate-500 font-normal ml-2">por wrappingmati</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Estimador no oficial para compras en moneda extranjera y servicios digitales.
            </p>
          </div>
        </div>

        {/* Enlaces a redes y términos */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="https://github.com/wrappingmati/impuesto-argento"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <a
            href="https://x.com/wrappingmati"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="font-bold text-xs">𝕏</span>
            <span>Twitter</span>
          </a>

          <a
            href="https://github.com/wrappingmati"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Portafolio</span>
          </a>

          <LegalModal>
            <button
              type="button"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacidad</span>
            </button>
          </LegalModal>
        </div>
      </div>
    </footer>
  );
}
