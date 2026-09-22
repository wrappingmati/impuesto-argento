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

  const handleAddItem = (item: Omit<SavedGame, "savedAt">) => {
    addGame(item);
  };

  const handleOpenItemModal = (item: Omit<SavedGame, "savedAt">) => {
    setActiveModalItem({
      name: item.name,
      originalPrice: item.originalPrice,
      thumbnail: item.thumbnail,
      usdPrice: item.usdPrice,
      dolarType: item.dolarType,
      platform: item.platform,
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-[#6D28D9]/30">
      {/* 1. Header con logo transparente, cotizaciones en vivo y controles globales */}
      <Header
        backendOnline={backendOnline}
        dolarRates={dolarRates}
        province={province}
        onProvinceChange={handleProvinceChange}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* 2. Hero & Dock Universal de Entrada */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#131B2E] border border-slate-700/80 text-xs font-semibold">
              <span className="text-[#A78BFA]">Calculá.</span>
              <span className="text-[#22D3EE]">Coleccioná.</span>
              <span className="text-emerald-400">Jugá sin sorpresas.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Calculá tus juegos y armá tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#60A5FA] to-[#22D3EE]">
                Biblioteca Gamer
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              Precios transparentes en pesos argentinos para Steam, PlayStation, Xbox, Nintendo y suscripciones digitales.
            </p>
          </div>

          {/* Dock unificado de pegado de links, catálogo y cálculo manual */}
          <UniversalCalculatorBar
            province={province}
            paymentMethod={paymentMethod}
            dolarRates={dolarRates}
            onAddItem={handleAddItem}
            onOpenItemModal={handleOpenItemModal}
          />
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
            handleAddItem(preset);
            handleOpenItemModal(preset);
          }}
        />

        {/* 4. Panel Plegable de Cotizaciones y Normativas Fiscales */}
        <section id="guias" className="border-t border-slate-800/80 pt-8 space-y-4">
          <button
            type="button"
            onClick={() => setShowGuides(!showGuides)}
            className="w-full bg-[#131B2E]/60 hover:bg-[#131B2E] border border-slate-800 p-4 rounded-2xl flex items-center justify-between transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6D28D9]/20 border border-[#6D28D9]/40 flex items-center justify-center text-[#A78BFA]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                  Cotizaciones del Dólar y Guía de Impuestos Oficiales
                </h3>
                <p className="text-xs text-slate-400">
                  Consultá las fuentes tributarias (ARCA, Ley 27.430, RG 5617) y cotizaciones oficiales.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-white">
              <span>{showGuides ? "Ocultar" : "Ver información"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showGuides ? "rotate-180" : ""}`} />
            </div>
          </button>

          {showGuides && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 animate-fade-in">
              <div className="lg:col-span-6">
                <DolarInfo onRatesLoaded={setDolarRates} />
              </div>
              <div className="lg:col-span-6">
                <TaxInfo />
              </div>
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
