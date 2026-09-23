// src/components/UniversalCalculatorBar.tsx
import React, { useState } from "react";
import { Link2, Sparkles, Edit3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UrlScraper from "@/components/UrlScraper";
import SubscriptionCatalog from "@/components/SubscriptionCatalog";
import GameSearch from "@/components/GameSearch";
import type { ProvinceCode } from "@/lib/tax";
import type { PaymentMethod, TaxCalculationResult } from "@/lib/tax-engine";
import type { DolarRates } from "@/lib/dolarApi";

export interface CalculatedItemEvent {
  name: string;
  price: number;
  thumbnail: string;
  usdPrice?: number;
  dolarType?: "tarjeta" | "oficial" | "blue";
  isForeignDigitalService?: boolean;
  platform?: string;
  calculation?: TaxCalculationResult;
}

interface UniversalCalculatorBarProps {
  province: ProvinceCode;
  onProvinceChange: (province: ProvinceCode) => void;
  paymentMethod: PaymentMethod;
  dolarRates: DolarRates;
  onItemCalculated: (item: CalculatedItemEvent) => void;
}

export default function UniversalCalculatorBar({
  province,
  onProvinceChange,
  paymentMethod,
  dolarRates,
  onItemCalculated,
}: UniversalCalculatorBarProps) {
  const [activeTab, setActiveTab] = useState<string>("url");

  return (
    <div className="bg-[#111A2E] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        {/* Cabecera del Dock con selector de modos */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Buscador y Calculadora de Impuestos</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#74ACDF]/15 text-[#74ACDF] border border-[#74ACDF]/30 font-mono font-medium">
                En vivo
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pegá un enlace de tienda, elegí una suscripción o cotizá manualmente. Se añadirá a tu biblioteca con desglose en pesos.
            </p>
          </div>

          <TabsList className="grid grid-cols-3 bg-[#0A0F1D] border border-slate-800 h-10 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <TabsTrigger
              value="url"
              className="text-xs font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#74ACDF] data-[state=active]:text-slate-950 text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Pegar Link</span>
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="text-xs font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#74ACDF] data-[state=active]:text-slate-950 text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suscripciones</span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-xs font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-[#74ACDF] data-[state=active]:text-slate-950 text-slate-400 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Componente canónico UrlScraper */}
        <TabsContent value="url" className="mt-0 pt-1">
          <UrlScraper
            province={province}
            paymentMethod={paymentMethod}
            onResult={(item) =>
              onItemCalculated({
                ...item,
                platform: item.usdPrice ? "Steam / Ext." : "Tienda Digital",
              })
            }
            onSwitchToManual={() => setActiveTab("manual")}
          />
        </TabsContent>

        {/* 2. Componente canónico SubscriptionCatalog */}
        <TabsContent value="catalog" className="mt-0 pt-1">
          <SubscriptionCatalog
            province={province}
            paymentMethod={paymentMethod}
            dolarRates={dolarRates}
            onSelectPlan={(plan) =>
              onItemCalculated({
                ...plan,
                platform: "Suscripción",
              })
            }
          />
        </TabsContent>

        {/* 3. Componente canónico GameSearch */}
        <TabsContent value="manual" className="mt-0 pt-1">
          <GameSearch
            province={province}
            onProvinceChange={onProvinceChange}
            dolarRates={dolarRates}
            onSave={(item) =>
              onItemCalculated({
                ...item,
                platform: item.usdPrice ? "USD Digital" : "ARS",
              })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
