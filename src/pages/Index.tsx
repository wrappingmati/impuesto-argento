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

  // Cargar configuración impositiva remota/estática si está disponible
  useEffect(() => {
    loadRemoteTaxConfig();
  }, []);

  // Verificar estado del microservicio backend
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

  // Recalcular el ítem activo si el usuario cambia de provincia o método de pago
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
    // Confirmamos estado online si el resultado provino del backend
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
      title: "Guardado en el historial",
      description: `${item.name} se agregó a tus cálculos.`,
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-violet-500/30">
      {/* 1. Header Superior */}
      <Header
        backendOnline={backendOnline}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Contenedor Principal */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* 2. Hero Section */}
        <section className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Motor Tributario & Scraper 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-100">
            Calculá el precio real de tus juegos y servicios digitales
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Obtené el valor final exacto en pesos con IVA (21%), Ganancias (30% RG 5617), alícuotas provinciales de IIBB y comparativa inmediata con Dólar MEP.
          </p>
        </section>

        {/* 3. Layout Principal de 3 Columnas (2 cols inputs / 1 col resultado) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Columna Izquierda (2 columnas en desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta de Parámetros Globales (Provincia y Método de Pago) */}
            <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selector de Provincia */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Tu provincia (Alícuota IIBB)
                  </Label>
                  <Select
                    value={province}
                    onValueChange={(v) => handleProvinceChange(v as ProvinceCode)}
                  >
                    <SelectTrigger className="bg-[#0F1626] border-slate-800 text-slate-100 text-xs h-10 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F1626] border-slate-800 text-slate-100 max-h-60 rounded-xl">
                      {Object.entries(PROVINCES).map(([code, info]) => (
                        <SelectItem key={code} value={code} className="text-xs hover:bg-slate-800">
                          {info.label} ({((info.iibbRate || 0) * 100).toFixed(1)}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selector de Método de Pago */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">
                    Método de pago
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0F1626] border border-slate-800 rounded-xl h-10">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TARJETA_ARS")}
                      className={`text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === "TARJETA_ARS"
                          ? "bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta ARS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("DOLAR_MEP_CUENTA")}
                      className={`text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === "DOLAR_MEP_CUENTA"
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Dólar MEP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pestañas de Modos de Entrada */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full space-y-4"
            >
              <TabsList className="grid grid-cols-3 w-full bg-[#0F1626] border border-slate-800 h-11 p-1 rounded-xl">
                <TabsTrigger
                  value="url"
                  className="text-xs font-medium flex items-center gap-1.5 rounded-lg data-[state=active]:bg-violet-600/30 data-[state=active]:text-violet-200 data-[state=active]:border data-[state=active]:border-violet-500/40 transition-all text-slate-400"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Pegar URL</span>
                </TabsTrigger>
                <TabsTrigger
                  value="catalog"
                  className="text-xs font-medium flex items-center gap-1.5 rounded-lg data-[state=active]:bg-violet-600/30 data-[state=active]:text-violet-200 data-[state=active]:border data-[state=active]:border-violet-500/40 transition-all text-slate-400"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Catálogo</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="text-xs font-medium flex items-center gap-1.5 rounded-lg data-[state=active]:bg-violet-600/30 data-[state=active]:text-violet-200 data-[state=active]:border data-[state=active]:border-violet-500/40 transition-all text-slate-400"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Manual</span>
                </TabsTrigger>
              </TabsList>

              {/* Pestaña 1: Scrapear URL en vivo */}
              <TabsContent value="url" className="mt-0">
                <UrlScraper
                  province={province}
                  paymentMethod={paymentMethod}
                  onResult={handleSaveItem}
                  onSwitchToManual={() => setActiveTab("manual")}
                />
              </TabsContent>

              {/* Pestaña 2: Catálogo de Suscripciones */}
              <TabsContent value="catalog" className="mt-0">
                <SubscriptionCatalog
                  province={province}
                  paymentMethod={paymentMethod}
                  dolarRates={dolarRates}
                  onSelectPlan={handleSaveItem}
                />
              </TabsContent>

              {/* Pestaña 3: Calculadora Manual */}
              <TabsContent value="manual" className="mt-0">
                <GameSearch
                  onSave={handleSaveItem}
                  dolarRates={dolarRates}
                  province={province}
                  onProvinceChange={handleProvinceChange}
                />
              </TabsContent>
            </Tabs>

            {/* Historial de Cálculos Guardados */}
            <GameHistory
              games={games}
              province={province}
              onDeleteGame={handleDeleteGame}
            />

            {/* Información Tributaria Vigente */}
            <TaxInfo />
          </div>

          {/* Columna Derecha (1 columna en desktop): Tarjeta de Resultado Sticky + Cotizaciones */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
            {/* Tarjeta de Resultado en Tiempo Real */}
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

            {/* Barra de Cotizaciones */}
            <DolarInfo onRatesLoaded={setDolarRates} />
          </div>
        </div>
      </main>

      {/* 4. Footer con Redes del Autor */}
      <Footer />
    </div>
  );
}
