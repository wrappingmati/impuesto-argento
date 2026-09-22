// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { Link2, Sparkles, Edit3, CreditCard, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import GameSearch from "@/components/GameSearch";
import UrlScraper from "@/components/UrlScraper";
import SubscriptionCatalog from "@/components/SubscriptionCatalog";
import PriceBreakdown from "@/components/PriceBreakdown";
import TaxInfo from "@/components/TaxInfo";
import GameHistory from "@/components/GameHistory";
import Footer from "@/components/Footer";
import DolarInfo, { type DolarRates } from "@/components/DolarInfo";
import { useSavedGames } from "@/hooks/useSavedGames";
import { useToast } from "@/hooks/use-toast";
import { loadSettings, persistSettings } from "@/lib/storage";
import { PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import { calculateArgentineTaxes, loadRemoteTaxConfig, type PaymentMethod, type TaxCalculationResult } from "@/lib/tax-engine";
import { checkBackendHealth } from "@/lib/api";

interface CurrentItem {
  title?: string;
  name: string;
  price: number;
  thumbnail: string;
  usdPrice?: number;
  dolarType?: DolarType;
  isForeignDigitalService?: boolean;
  calculation?: TaxCalculationResult;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>("url");
  const [currentItem, setCurrentItem] = useState<CurrentItem | undefined>();
  const [dolarRates, setDolarRates] = useState<DolarRates>({
    blue: null,
    oficial: null,
    tarjeta: null,
    mep: null,
  });
  const [province, setProvince] = useState<ProvinceCode>(() => loadSettings().province);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("TARJETA_ARS");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const { games, addGame, removeGame } = useSavedGames();
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
    const interval = setInterval(check, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleProvinceChange = (next: ProvinceCode) => {
    setProvince(next);
    persistSettings({ province: next, defaultDolarType: "tarjeta" });
  };

  useEffect(() => {
    if (!currentItem) return;

    const numAmount = currentItem.usdPrice || currentItem.price;
    const isUsd = !!currentItem.usdPrice;
    const category = isUsd
      ? "DIGITAL_SERVICE_USD"
      : currentItem.isForeignDigitalService
      ? "DIGITAL_SERVICE_ARS_FOREIGN"
      : "DIGITAL_SERVICE_LOCAL";

    if (dolarRates.oficial) {
      const updatedCalc = calculateArgentineTaxes({
        amount: numAmount,
        currency: isUsd ? "USD" : "ARS",
        category,
        paymentMethod,
        province,
        rates: {
          oficial: dolarRates.oficial,
          tarjeta: dolarRates.tarjeta ?? dolarRates.oficial * 1.3,
          mep: dolarRates.mep,
          blue: dolarRates.blue,
        },
      });

      setCurrentItem((prev) => {
        if (!prev) return undefined;
        if (
          prev.calculation?.totalArs === updatedCalc.totalArs &&
          prev.calculation?.baseArs === updatedCalc.baseArs
        ) {
          return prev;
        }
        return {
          ...prev,
          price: updatedCalc.baseArs,
          calculation: updatedCalc,
        };
      });
    }
  }, [province, paymentMethod, dolarRates.oficial, dolarRates.mep]);

  const handleSaveItem = (item: {
    title?: string;
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: DolarType;
    isForeignDigitalService?: boolean;
    calculation?: TaxCalculationResult;
  }) => {
    if (item.calculation) {
      setBackendOnline(true);
    }

    addGame({
      name: item.name,
      originalPrice: item.price,
      thumbnail: item.thumbnail,
      usdPrice: item.usdPrice,
      dolarType: item.dolarType,
    });

    setCurrentItem(item);

    toast({
      title: "Cálculo guardado",
      description: `${item.name} se agregó al historial.`,
    });
  };

  const handleDeleteGame = (index: number) => {
    removeGame(index);
    toast({
      title: "Elemento eliminado",
      description: "Se quitó del historial.",
    });
  };

  const getDolarRate = (type?: DolarType): number | undefined => {
    if (paymentMethod === "DOLAR_MEP_CUENTA") {
      return dolarRates.mep ?? undefined;
    }
    if (!type) return undefined;
    return dolarRates[type] ?? undefined;
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/20">
      {/* 1. Header con el logo provisto */}
      <Header
        backendOnline={backendOnline}
        dolarRates={dolarRates}
        onNavigateTab={(tab) => setActiveTab(tab)}
        activeTab={activeTab}
      />

      {/* Contenedor central */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* 2. Hero Section: Directo, humano, sin excesos */}
        <section className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-100">
            Calculá el precio real con impuestos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Pegá un enlace de Steam, Xbox o elegí tu servicio para ver cuánto te va a costar en pesos con IVA, Ganancias e Ingresos Brutos.
          </p>
        </section>

        {/* 3. Panel Principal (Workbench) */}
        <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Fila de configuración rápida: Provincia + Medio de Pago */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
            {/* Provincia */}
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-medium text-slate-400">
                Tu provincia (Ingresos Brutos)
              </Label>
              <Select
                value={province}
                onValueChange={(v) => handleProvinceChange(v as ProvinceCode)}
              >
                <SelectTrigger className="bg-[#0b0e14] border-white/[0.08] text-slate-200 text-xs h-10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#131722] border-white/[0.08] text-slate-200 max-h-60 rounded-xl">
                  {Object.entries(PROVINCES).map(([code, info]) => (
                    <SelectItem key={code} value={code} className="text-xs hover:bg-white/5">
                      {info.label} ({((info.iibbRate || 0) * 100).toFixed(1)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medio de Pago */}
            <div className="flex-1 space-y-1">
              <Label className="text-xs font-medium text-slate-400">
                Forma de pago
              </Label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#0b0e14] border border-white/[0.08] rounded-xl h-10">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TARJETA_ARS")}
                  className={`text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === "TARJETA_ARS"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tarjeta (ARS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("DOLAR_MEP_CUENTA")}
                  className={`text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === "DOLAR_MEP_CUENTA"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dólar MEP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grilla de 2 Columnas (Inputs a la izquierda, Resultado a la derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Lado Izquierdo: Pestañas y Formularios (7 columnas) */}
            <div className="lg:col-span-7 space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-4"
              >
                <TabsList className="grid grid-cols-3 w-full bg-[#0b0e14] border border-white/[0.08] h-11 p-1 rounded-xl">
                  <TabsTrigger
                    value="url"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Pegar Link</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="catalog"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suscripciones</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Manual</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Pegar link */}
                <TabsContent value="url" className="mt-0 pt-1">
                  <UrlScraper
                    province={province}
                    paymentMethod={paymentMethod}
                    onResult={handleSaveItem}
                    onSwitchToManual={() => setActiveTab("manual")}
                  />
                </TabsContent>

                {/* Tab 2: Suscripciones */}
                <TabsContent value="catalog" className="mt-0 pt-1">
                  <SubscriptionCatalog
                    province={province}
                    paymentMethod={paymentMethod}
                    dolarRates={dolarRates}
                    onSelectPlan={handleSaveItem}
                  />
                </TabsContent>

                {/* Tab 3: Manual */}
                <TabsContent value="manual" className="mt-0 pt-1">
                  <GameSearch
                    onSave={handleSaveItem}
                    dolarRates={dolarRates}
                    province={province}
                    onProvinceChange={handleProvinceChange}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Lado Derecho: Tarjeta de Resultado (5 columnas) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <PriceBreakdown
                title={currentItem?.title || currentItem?.name}
                thumbnail={currentItem?.thumbnail}
                originalPrice={currentItem?.price}
                usdPrice={currentItem?.usdPrice}
                dolarType={currentItem?.dolarType}
                dolarRate={
                  currentItem?.calculation?.exchangeRateUsed ||
                  getDolarRate(currentItem?.dolarType)
                }
                province={province}
                isForeignDigitalService={currentItem?.isForeignDigitalService}
                paymentMethod={paymentMethod}
                calculation={currentItem?.calculation}
                mepComparison={currentItem?.calculation?.mepComparison}
              />
            </div>
          </div>
        </div>

        {/* 4. Cotizaciones de Referencia */}
        <DolarInfo onRatesLoaded={setDolarRates} />

        {/* 5. Historial de cálculos (si hay guardados) */}
        <GameHistory
          games={games}
          province={province}
          onDeleteGame={handleDeleteGame}
        />

        {/* 6. Marco Tributario Informativo */}
        <TaxInfo />
      </main>

      {/* 7. Footer sutil con redes de autor */}
      <Footer />
    </div>
  );
}
