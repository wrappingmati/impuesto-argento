import React from "react";
import LegalModal from "./LegalModal";
import { ShieldCheck, Code2, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full max-w-md mt-10 mb-6 px-4 pt-6 border-t border-border/40 text-center space-y-4">
      {/* Enlaces de interés y disclaimers */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <LegalModal>
          <button
            type="button"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Términos y Privacidad</span>
          </button>
        </LegalModal>

        <span className="text-border">•</span>

        <a
          href="https://github.com/wrappingmati"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Code2 className="w-3.5 h-3.5 text-primary" />
          <span>Código Abierto</span>
        </a>
      </div>

      {/* Exención rápida */}
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        Simulador estimativo no oficial para fines educativos. Basado en normativas ARCA/AFIP y regímenes de IIBB provinciales. No válido como factura.
      </p>

      {/* Firma de autor */}
      <div className="text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1">
        <span>Hecho con</span>
        <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
        <span>por</span>
        <strong className="text-foreground font-medium">wrappingmati</strong>
        <span>© {currentYear}</span>
      </div>
    </footer>
  );
}

