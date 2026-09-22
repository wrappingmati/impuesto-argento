// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { Link2, Sparkles, Edit3, ShieldCheck, WifiOff, CreditCard, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen py-8 px-4 font-sans selection:bg-primary/30">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <img
            src="/uploads/mati-logo.png"
            alt="WrappingMati"
            className="w-14 h-14 mx-auto opacity-95 transition-transform hover:scale-105"
          />
          <h1 className="text-4xl font-display font-bold text-primary tracking-tight">
            Impuesto Argento
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
            Calculá el precio real de cualquier juego, suscripción o compra en el exterior con IVA, IIBB y comparativa MEP.
          </p>

          {/* Badge de conexión */}
          <div className="pt-1 flex items-center justify-center gap-2">
            {backendOnline === true ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Scrapling Online
              </span>
            ) : backendOnline === false ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                <WifiOff className="w-3.5 h-3.5" />
                Modo Local (Calculadora Activa)
              </span>
            ) : null}
          </div>
        </div>

        {/* Barra de Cotizaciones */}
        <div className="flex justify-center">
          <DolarInfo onRatesLoaded={setDolarRates} />
        </div>

        {/* Panel de Controles Globales (Provincia y Método de Pago) */}
        <div className="ticket w-full max-w-md mx-auto p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Selector de Provincia */}
            <div className="space-y-1">
              <Label className="text-xs">Tu provincia (IIBB)</Label>
              <Select value={province} onValueChange={(v) => handleProvinceChange(v as ProvinceCode)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVINCES).map(([code, info]) => (
                    <SelectItem key={code} value={code} className="text-xs">
                      {info.label} ({((info.iibbRate || 0) * 100).toFixed(1)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Método de Pago */}
            <div className="space-y-1">
              <Label className="text-xs">¿Cómo vas a pagar?</Label>
              <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("TARJETA_ARS")}
                  className={`text-[11px] py-1.5 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1 ${
                    paymentMethod === "TARJETA_ARS"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("DOLAR_MEP_CUENTA")}
                  className={`text-[11px] py-1.5 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1 ${
                    paymentMethod === "DOLAR_MEP_CUENTA"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <DollarSign className="w-3 h-3" />
                  Dólar MEP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Modos de Cálculo */}
        <div className="flex flex-col items-center gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList className="grid grid-cols-3 w-full bg-white/5 border border-border/80 h-10">
              <TabsTrigger value="url" className="text-xs flex items-center gap-1.5 font-semibold">
                <Link2 className="w-3.5 h-3.5" />
                Pegar URL
              </TabsTrigger>
              <TabsTrigger value="catalog" className="text-xs flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Catálogo
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs flex items-center gap-1.5 font-semibold">
                <Edit3 className="w-3.5 h-3.5" />
                Manual
              </TabsTrigger>
            </TabsList>

            {/* Pestaña 1: Scrapear URL en vivo */}
            <TabsContent value="url" className="mt-4">
              <UrlScraper
                province={province}
                paymentMethod={paymentMethod}
                onResult={handleSaveItem}
                onSwitchToManual={() => setActiveTab("manual")}
              />
            </TabsContent>

            {/* Pestaña 2: Catálogo de Suscripciones */}
            <TabsContent value="catalog" className="mt-4">
              <SubscriptionCatalog
                province={province}
                paymentMethod={paymentMethod}
                dolarRates={dolarRates}
                onSelectPlan={handleSaveItem}
              />
            </TabsContent>

            {/* Pestaña 3: Calculadora Manual */}
            <TabsContent value="manual" className="mt-4">
              <GameSearch
                onSave={handleSaveItem}
                dolarRates={dolarRates}
                province={province}
                onProvinceChange={handleProvinceChange}
              />
            </TabsContent>
          </Tabs>

          {/* Comprobante de desglose impositivo si hay un ítem activo */}
          {currentItem && (
            <PriceBreakdown
              title={currentItem.title || currentItem.name}
              thumbnail={currentItem.thumbnail}
              originalPrice={currentItem.price}
              usdPrice={currentItem.usdPrice}
              dolarType={currentItem.dolarType}
              dolarRate={currentItem.calculation?.exchangeRateUsed || getDolarRate(currentItem.dolarType)}
              province={province}
              isForeignDigitalService={currentItem.isForeignDigitalService}
              paymentMethod={paymentMethod}
              calculation={currentItem.calculation}
              mepComparison={currentItem.calculation?.mepComparison}
            />
          )}

          {/* Información Impositiva Educativa */}
          <TaxInfo />

          {/* Historial de Cálculos Guardados */}
          <GameHistory games={games} province={province} onDeleteGame={handleDeleteGame} />

          {/* Pie de página con Términos, Privacidad, Marcas y Autoría */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
