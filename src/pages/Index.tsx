// src/pages/Index.tsx
import { useEffect, useState, useRef } from "react";
import {
  Gamepad2,
  ShoppingCart,
  Globe,
  Code2,
  BookOpen,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Link2,
  Edit3,
  CreditCard,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
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

  const calculatorRef = useRef<HTMLDivElement>(null);
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

  const scrollToCalculator = (tab?: "url" | "catalog" | "manual") => {
    if (tab) setActiveTab(tab);
    calculatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between selection:bg-[#6D28D9]/30">
      {/* 1. Header con logo y navegación */}
      <Header
        backendOnline={backendOnline}
        dolarRates={dolarRates}
        onNavigateSection={(sec) => {
          if (sec === "juegos") scrollToCalculator("url");
          else if (sec === "servicios") scrollToCalculator("catalog");
          else if (sec === "guias") {
            const el = document.getElementById("guias");
            el?.scrollIntoView({ behavior: "smooth" });
          } else scrollToCalculator();
        }}
      />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* 2. Hero Section (Inspirada en el mockup) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 sm:pt-6">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1B2E] border border-slate-700/60 text-xs text-slate-300 font-medium">
              <span className="text-[#A78BFA]">Calculá. Entendé.</span>
              <span className="text-[#22D3EE]">Jugá sin sorpresas.</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Calculá tus impuestos en{" "}
              <span className="text-[#A78BFA]">juegos</span> y{" "}
              <span className="text-[#22D3EE]">compras del exterior</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Conocé cuánto vas a pagar antes de comprar. Todo en segundos, con información actualizada y fuentes oficiales.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => scrollToCalculator()}
                className="w-full sm:w-auto bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-[#6D28D9]/25 flex items-center justify-center gap-2"
              >
                <span>Ir a las calculadoras</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#guias"
                className="w-full sm:w-auto bg-[#1E1B2E] hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium px-5 py-3 rounded-full border border-slate-700 transition-colors text-center"
              >
                Consultar guías de impuestos
              </a>
            </div>
          </div>

          {/* Tarjeta de preview rápido en Hero */}
          <div className="lg:col-span-5">
            <div className="bg-[#1E1B2E] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">Ejemplo en tiempo real</span>
                <span className="text-[#22D3EE] font-mono">Dólar Oficial + Impuestos</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-medium">Juego estreno (USD 59.99)</p>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  ${((dolarRates.oficial ?? 1535) * 59.99 * 1.51).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  <span className="text-xs text-[#A78BFA] font-sans font-semibold ml-2">ARS final</span>
                </p>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Precio base (ARS)</span>
                  <span className="font-mono text-slate-200">${((dolarRates.oficial ?? 1535) * 59.99).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Servicios Digitales (21%)</span>
                  <span className="font-mono text-slate-200">+ ${((dolarRates.oficial ?? 1535) * 59.99 * 0.21).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Percepción Ganancias (30%)</span>
                  <span className="font-mono text-slate-200">+ ${((dolarRates.oficial ?? 1535) * 59.99 * 0.30).toLocaleString("es-AR", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Panel de la Calculadora Principal */}
        <div ref={calculatorRef} id="calculadora" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Calculadora interactiva
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Steam, PlayStation, Xbox, Nintendo, suscripciones y compras internacionales.
              </p>
            </div>

            {/* Selector de Provincia integrado */}
            <div className="w-full sm:w-64 space-y-1">
              <Select
                value={province}
                onValueChange={(v) => handleProvinceChange(v as ProvinceCode)}
              >
                <SelectTrigger className="bg-[#1E1B2E] border-slate-700 text-slate-200 text-xs h-10 rounded-xl focus:border-[#A78BFA]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1B2E] border-slate-700 text-slate-200 max-h-60 rounded-xl">
                  {Object.entries(PROVINCES).map(([code, info]) => (
                    <SelectItem key={code} value={code} className="text-xs hover:bg-slate-800">
                      {info.label} ({((info.iibbRate || 0) * 100).toFixed(1)}% IIBB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Lado Izquierdo: Formularios y Pestañas (7 columnas) */}
            <div className="lg:col-span-7 bg-[#1E1B2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Selector de medio de pago */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-300">Medio de pago:</span>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#0F172A] border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TARJETA_ARS")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      paymentMethod === "TARJETA_ARS"
                        ? "bg-[#6D28D9] text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tarjeta (ARS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("DOLAR_MEP_CUENTA")}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      paymentMethod === "DOLAR_MEP_CUENTA"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Dólar MEP</span>
                  </button>
                </div>
              </div>

              {/* Pestañas de modo de cálculo */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
                <TabsList className="grid grid-cols-3 w-full bg-[#0F172A] border border-slate-800 h-11 p-1 rounded-xl">
                  <TabsTrigger
                    value="url"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Pegar Link</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="catalog"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suscripciones</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manual"
                    className="text-xs font-medium rounded-lg data-[state=active]:bg-[#6D28D9] data-[state=active]:text-white text-slate-400 transition-all flex items-center gap-1.5"
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
            <div className="lg:col-span-5 lg:sticky lg:top-20">
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

        {/* 4. 4 Tarjetas de Categoría (Directo del mockup de referencia) */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Explorar por categoría
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Juegos */}
            <div
              onClick={() => scrollToCalculator("url")}
              className="bg-[#1E1B2E] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/20 border border-[#6D28D9]/40 flex items-center justify-center text-[#A78BFA]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white group-hover:text-[#A78BFA] transition-colors">
                  Juegos
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Steam, PlayStation, Xbox, Nintendo y más.
                </p>
              </div>
              <p className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1 pt-1">
                <span>Ver calculadoras</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>

            {/* Card 2: Servicios del exterior */}
            <div
              onClick={() => scrollToCalculator("catalog")}
              className="bg-[#1E1B2E] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">
                  Servicios del exterior
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Netflix, Spotify, YouTube, Adobe y más.
                </p>
              </div>
              <p className="text-xs font-semibold text-blue-400 flex items-center gap-1 pt-1">
                <span>Ver calculadoras</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>

            {/* Card 3: Compras internacionales */}
            <div
              onClick={() => scrollToCalculator("manual")}
              className="bg-[#1E1B2E] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 cursor-pointer group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors">
                  Compras internacionales
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tiendas, marketplaces y envíos puerta a puerta.
                </p>
              </div>
              <p className="text-xs font-semibold text-cyan-400 flex items-center gap-1 pt-1">
                <span>Ver calculadoras</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>

            {/* Card 4: API REST */}
            <a
              href="https://github.com/wrappingmati/impuesto-argento#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1E1B2E] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-3 group transition-all block"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-[#A78BFA]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white group-hover:text-[#A78BFA] transition-colors">
                  API REST
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Integrá nuestras calculadoras en tus proyectos.
                </p>
              </div>
              <p className="text-xs font-semibold text-[#A78BFA] flex items-center gap-1 pt-1">
                <span>Ver documentación</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </a>
          </div>
        </section>

        {/* 5. Sección "También podés..." y Cotizaciones */}
        <section id="guias" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lado Izquierdo: Cotizaciones y Guías tributarias (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <DolarInfo onRatesLoaded={setDolarRates} />
            <TaxInfo />
            <GameHistory
              games={games}
              province={province}
              onDeleteGame={handleDeleteGame}
            />
          </div>

          {/* Lado Derecho: Bloques de "También podés..." del mockup (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-white">También podés...</h3>

            <div className="space-y-3">
              <div className="bg-[#1E1B2E] border border-slate-800 p-4 rounded-xl flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Consultar guías</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Explicaciones simples y claras sobre cada impuesto (IVA, Ganancias, IIBB).
                  </p>
                </div>
              </div>

              <div className="bg-[#1E1B2E] border border-slate-800 p-4 rounded-xl flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Ahorrar con Dólar MEP</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Pagá el resumen de tu tarjeta antes del vencimiento en USD para ahorrarte el 30% de percepción.
                  </p>
                </div>
              </div>

              <a
                href="https://github.com/wrappingmati/impuesto-argento#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1E1B2E] border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-start gap-3.5 transition-colors block"
              >
                <div className="w-9 h-9 rounded-lg bg-[#6D28D9]/20 border border-[#6D28D9]/40 flex items-center justify-center text-[#A78BFA] shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white flex items-center gap-1">
                    <span>Usar la API</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Integrá nuestras calculadoras y cotizaciones en tus bots de Discord y proyectos.
                  </p>
                </div>
              </a>

              {/* Información confiable */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Información confiable</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Usamos fuentes oficiales y públicas (ARCA, decretos del IVA y alícuotas provinciales) para darte datos actualizados y precisos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Banner "Menos letra chica. Más juego." (Directo del mockup) */}
        <section className="bg-gradient-to-r from-[#1E1B2E] via-[#161426] to-[#1E1B2E] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Menos letra chica. <span className="text-[#A78BFA]">Más juego.</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cálculos transparentes para toda la comunidad gamer en Argentina.
            </p>
          </div>

          <div className="flex items-center gap-6 sm:gap-8 text-xs font-medium text-slate-300">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xl">🎮</span>
              <span>Comprá</span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xl">✓</span>
              <span>Calculá</span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xl">⚡</span>
              <span>Disfrutá</span>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer oficial con mención a Matías Casas - WrappingMati */}
      <Footer />
    </div>
  );
}
