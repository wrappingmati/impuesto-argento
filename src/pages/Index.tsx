// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import UniversalCalculatorBar from "@/components/UniversalCalculatorBar";
import GameLibrary, { PRESET_FEATURED_GAMES } from "@/components/GameLibrary";
import PriceBreakdownModal, { type ModalGameData } from "@/components/PriceBreakdownModal";
import DolarInfo, { type DolarRates } from "@/components/DolarInfo";
import TaxInfo from "@/components/TaxInfo";
import Footer from "@/components/Footer";
import { useSavedGames } from "@/hooks/useSavedGames";
import { loadSettings, persistSettings, type SavedGame } from "@/lib/storage";
import { type ProvinceCode } from "@/lib/tax";
import { loadRemoteTaxConfig, type PaymentMethod } from "@/lib/tax-engine";
import { checkBackendHealth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Sparkles, BookOpen, ShieldCheck } from "lucide-react";

export default function Index() {
  const [dolarRates, setDolarRates] = useState<DolarRates>({
    blue: null,
    oficial: null,
    tarjeta: null,
    mep: null,
  });

  const [province, setProvince] = useState<ProvinceCode>(() => loadSettings().province);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TARJETA_ARS");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<ModalGameData | null>(null);
  const [showGuides, setShowGuides] = useState<boolean>(false);

  const { games, addGame, removeGame, clearAll } = useSavedGames();
  const { toast } = useToast();

  useEffect(() => {
    loadRemoteTaxConfig();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const isOnline = await checkBackendHealth();
      if (isMounted) setBackendOnline(isOnline);
    };
    check();
    const interval = setInterval(check, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleProvinceChange = (next: ProvinceCode) => {
    setProvince(next);
    persistSettings({ province: next, defaultDolarType: "tarjeta" });
  };

  const handleItemCalculated = (item: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: "tarjeta" | "oficial" | "blue";
    isForeignDigitalService?: boolean;
    platform?: string;
    calculation?: any;
  }) => {
    addGame({
      name: item.name,
      originalPrice: item.price,
      thumbnail: item.thumbnail || "/placeholder.svg",
      usdPrice: item.usdPrice,
      dolarType: item.dolarType,
      platform: item.platform,
    });

    setActiveModalItem({
      name: item.name,
      originalPrice: item.price,
      thumbnail: item.thumbnail || "/placeholder.svg",
      usdPrice: item.usdPrice,
      dolarType: item.dolarType,
      platform: item.platform,
      isForeignDigitalService: item.isForeignDigitalService,
      calculation: item.calculation,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col justify-between selection:bg-[#74ACDF]/30">
      {/* 1. Header con logo transparente, cotizaciones en vivo y controles globales */}
      <Header
        backendOnline={backendOnline}
        dolarRates={dolarRates}
        province={province}
        onProvinceChange={handleProvinceChange}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* 2. Hero & Dock Universal de Entrada */}
        <section className="space-y-5 sm:space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3 px-1">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#111A2E] border border-[#74ACDF]/30 text-[11px] sm:text-xs font-semibold shadow-sm">
              <span className="text-[#74ACDF]">Calculá.</span>
              <span className="text-white">Coleccioná.</span>
              <span className="text-[#F6B40E]">Jugá sin sorpresas 🇦🇷</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Calculá tus juegos y armá tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74ACDF] via-white to-[#F6B40E]">
                Biblioteca Gamer
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-lg mx-auto">
              Precios transparentes en pesos argentinos para Steam, PlayStation, Xbox, Nintendo y suscripciones digitales.
            </p>
          </div>

          {/* Grid de 2 columnas: Buscador y Calculadora (izquierda) + Cotizaciones Dólar en Vivo (derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <UniversalCalculatorBar
                province={province}
                onProvinceChange={handleProvinceChange}
                paymentMethod={paymentMethod}
                dolarRates={dolarRates}
                onItemCalculated={handleItemCalculated}
              />
            </div>
            <div className="lg:col-span-4">
              <DolarInfo onRatesLoaded={setDolarRates} />
            </div>
          </div>
        </section>

        {/* 3. La Biblioteca Gamer: Experiencia Principal de Pósters y Shelf */}
        <GameLibrary
          games={games}
          province={province}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          dolarRates={dolarRates}
          onDeleteGame={removeGame}
          onClearAll={clearAll}
          onAddPresetGame={(preset) => {
            handleItemCalculated({
              name: preset.name,
              price: preset.originalPrice,
              thumbnail: preset.thumbnail,
              usdPrice: preset.usdPrice,
              dolarType: preset.dolarType,
              platform: preset.platform,
            });
          }}
        />

        {/* 4. Panel Plegable de Normativas Fiscales */}
        <section id="guias" className="border-t border-slate-800/80 pt-8 space-y-4">
          <button
            type="button"
            onClick={() => setShowGuides(!showGuides)}
            className="w-full bg-[#111A2E]/70 hover:bg-[#111A2E] border border-slate-800 hover:border-[#74ACDF]/40 p-4 rounded-2xl flex items-center justify-between transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#74ACDF]/15 border border-[#74ACDF]/30 flex items-center justify-center text-[#74ACDF]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#74ACDF] transition-colors">
                  Guía de Impuestos y Normativas Oficiales
                </h3>
                <p className="text-xs text-slate-400">
                  Consultá las fuentes tributarias (ARCA, Ley 27.430, RG 5617) y marco legal vigente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-white">
              <span>{showGuides ? "Ocultar" : "Ver información"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showGuides ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showGuides && (
            <div className="pt-2 animate-fade-in">
              <TaxInfo />
            </div>
          )}
        </section>
      </main>

      {/* 5. Modal global para ver el desglose al scrapear o inspeccionar */}
      <PriceBreakdownModal
        isOpen={!!activeModalItem}
        onClose={() => setActiveModalItem(null)}
        game={activeModalItem}
        province={province}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        dolarRates={dolarRates}
      />

      {/* 6. Footer con créditos oficiales de Matías Casas - WrappingMati */}
      <Footer />
    </div>
  );
}
