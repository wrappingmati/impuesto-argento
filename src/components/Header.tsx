// src/components/Header.tsx
import React from "react";
import {
  CreditCard,
  DollarSign,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVINCES, type ProvinceCode } from "@/lib/tax";
import type { PaymentMethod } from "@/lib/tax-engine";
import type { DolarRates } from "@/lib/dolarApi";

interface HeaderProps {
  backendOnline: boolean | null;
  dolarRates?: DolarRates;
  province?: ProvinceCode;
  onProvinceChange?: (prov: ProvinceCode) => void;
  paymentMethod?: PaymentMethod;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Header({
  backendOnline,
  dolarRates,
  province = "ER",
  onProvinceChange,
  paymentMethod = "TARJETA_ARS",
  onPaymentMethodChange,
  onNavigateSection,
}: HeaderProps) {
  const isMep = paymentMethod === "DOLAR_MEP_CUENTA";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/90 bg-[#0A0F1D]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* 1. Logo Oficial: Icono 'IA' en mobile para encajar perfecto, logo completo en desktop */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 shrink-0 group" title="Impuesto Argento">
              {/* En mobile: solo el icono 'IA' */}
              <img
                src="/logo-icon.png"
                alt="Impuesto Argento"
                className="h-8 w-auto object-contain sm:hidden"
              />
              {/* En desktop (sm+): logo completo */}
              <img
                src="/logo-full.png"
                alt="Impuesto Argento"
                className="h-8 sm:h-9 w-auto object-contain hidden sm:block transition-transform group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo-icon.png";
                }}
              />
            </a>

            {/* Navegación sutil desktop */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-300">
              <a
                href="#biblioteca"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#74ACDF]" />
                <span>Mi Biblioteca</span>
              </a>
              <a
                href="#guias"
                className="hover:text-white transition-colors"
              >
                Impuestos y Normativas
              </a>
              <a
                href="https://github.com/wrappingmati/impuesto-argento#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>API REST</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </nav>
          </div>

          {/* 2. Controles Globales (Provincia + Método de Pago) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Selector de Provincia */}
            {onProvinceChange && (
              <div className="w-28 sm:w-36 md:w-44">
                <Select value={province} onValueChange={(v) => onProvinceChange(v as ProvinceCode)}>
                  <SelectTrigger className="bg-[#111A2E] border-slate-700/80 text-slate-200 text-[11px] sm:text-xs h-8 sm:h-9 px-2 sm:px-3 rounded-xl focus:border-[#74ACDF]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-[#74ACDF] shrink-0" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#111A2E] border-slate-700 text-slate-200 max-h-64 rounded-xl">
                    {Object.entries(PROVINCES).map(([code, info]) => (
                      <SelectItem key={code} value={code} className="text-xs hover:bg-slate-800">
                        {info.label} ({((info.iibbRate || 0) * 100).toFixed(1)}% IIBB)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Toggle de Medio de Pago */}
            {onPaymentMethodChange && (
              <div className="flex items-center bg-[#111A2E] border border-slate-700/80 p-0.5 rounded-xl h-8 sm:h-9 shrink-0">
                <button
                  type="button"
                  onClick={() => onPaymentMethodChange("TARJETA_ARS")}
                  className={`text-[11px] font-bold px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    !isMep
                      ? "bg-[#74ACDF] text-slate-950 shadow-sm shadow-[#74ACDF]/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Pago en pesos con tarjeta (+51% impuestos)"
                >
                  <CreditCard className="w-3 h-3" />
                  <span className="hidden sm:inline">Tarjeta</span>
                  <span className="sm:hidden">ARS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPaymentMethodChange("DOLAR_MEP_CUENTA")}
                  className={`text-[11px] font-bold px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    isMep
                      ? "bg-[#F6B40E] text-slate-950 shadow-sm shadow-[#F6B40E]/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Pago con dólares MEP en cuenta (-30% percepción)"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>MEP</span>
                </button>
              </div>
            )}

            {/* Cotizaciones en vivo pill (desktop) */}
            {dolarRates?.tarjeta && (
              <div className="hidden xl:flex items-center gap-2 text-xs font-mono bg-[#111A2E] border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
                <span className="text-slate-400">Tarjeta:</span>
                <span className="font-semibold text-white">${dolarRates.tarjeta.toFixed(0)}</span>
                {dolarRates.mep && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">MEP:</span>
                    <span className="font-semibold text-[#F6B40E]">${dolarRates.mep.toFixed(0)}</span>
                  </>
                )}
              </div>
            )}

            {/* Botón GitHub */}
            <a
              href="https://github.com/wrappingmati/impuesto-argento"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-white/10 hidden sm:flex items-center gap-1.5"
            >
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
