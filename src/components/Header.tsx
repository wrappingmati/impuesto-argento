// src/components/Header.tsx
import React, { useState } from "react";
import { ShieldCheck, WifiOff, LogIn, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  backendOnline: boolean | null;
  onNavigateTab?: (tab: "url" | "catalog" | "manual") => void;
}

export default function Header({ backendOnline, onNavigateTab }: HeaderProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0B0F19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo a la izquierda */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90 group"
          >
            <img
              src="/logo.png"
              alt="Impuesto Argento"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-102"
              onError={(e) => {
                // Fallback en caso de que la imagen no cargue
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Fallback de texto por accesibilidad si no está visible la imagen */}
            <span className="sr-only">Impuesto Argento</span>
          </a>

          {/* Menú de navegación minimalista (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400">
            <button
              type="button"
              onClick={() => onNavigateTab?.("url")}
              className="px-3 py-1.5 rounded-lg hover:text-slate-100 hover:bg-slate-850/60 transition-colors"
            >
              Calculadora
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.("catalog")}
              className="px-3 py-1.5 rounded-lg hover:text-slate-100 hover:bg-slate-850/60 transition-colors"
            >
              Suscripciones
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.("manual")}
              className="px-3 py-1.5 rounded-lg hover:text-slate-100 hover:bg-slate-850/60 transition-colors"
            >
              Entrada Manual
            </button>
            <a
              href="https://github.com/wrappingmati/impuesto-argento#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg hover:text-slate-100 hover:bg-slate-850/60 transition-colors flex items-center gap-1"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>
        </div>

        {/* Acciones a la derecha: Estado y Botón de Login */}
        <div className="flex items-center gap-3">
          {/* Badge de conexión sutil */}
          <div className="hidden sm:flex items-center">
            {backendOnline === true ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Scrapling Online
              </span>
            ) : backendOnline === false ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <WifiOff className="w-3 h-3" />
                Modo Local
              </span>
            ) : null}
          </div>

          {/* Botón de Login discreto */}
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-850/50 hover:bg-slate-850 border border-slate-750/70 hover:border-slate-600 px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Acceder</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0F1626] border-slate-800 text-slate-100 sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span>Tu cuenta gamer</span>
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Próximamente podrás iniciar sesión para sincronizar tus juegos guardados entre dispositivos, recibir alertas de descuentos y guardar listas de deseos personalizadas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#131B2E]/60 border border-slate-800 text-xs text-slate-300">
                  <p className="font-medium text-slate-200 mb-1">💡 ¿Sabías que?</p>
                  Por ahora, todos tus juegos y configuraciones se guardan de forma privada y segura en tu navegador actual sin necesidad de registrarte.
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setLoginOpen(false)}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-4 py-2 rounded-xl"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
