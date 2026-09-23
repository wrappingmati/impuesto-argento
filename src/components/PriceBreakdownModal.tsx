// src/components/PriceBreakdownModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatArs, formatUsd, PROVINCES, type DolarType, type ProvinceCode } from "@/lib/tax";
import {
  calculateArgentineTaxes,
  type PaymentMethod,
  type TaxCalculationResult,
  type ExchangeRates,
} from "@/lib/tax-engine";
import { Copy, Check, Sparkles, CreditCard, DollarSign, ShieldAlert, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ModalGameData {
  name: string;
  originalPrice: number;
  thumbnail: string;
  usdPrice?: number;
  dolarType?: DolarType;
  platform?: string;
  isForeignDigitalService?: boolean;
  calculation?: TaxCalculationResult;
}

interface PriceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: ModalGameData | null;
  province: ProvinceCode;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange?: (method: PaymentMethod) => void;
  dolarRates: {
    oficial: number | null;
    tarjeta: number | null;
    mep: number | null;
    blue: number | null;
  };
}

export default function PriceBreakdownModal({
  isOpen,
  onClose,
  game,
  province,
  paymentMethod,
  onPaymentMethodChange,
  dolarRates,
}: PriceBreakdownModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!game) return null;

  const isUsd = !!game.usdPrice;
  const numAmount = game.usdPrice || game.originalPrice;
  const category = isUsd
    ? "DIGITAL_SERVICE_USD"
    : game.isForeignDigitalService
    ? "DIGITAL_SERVICE_ARS_FOREIGN"
    : "DIGITAL_SERVICE_LOCAL";

  const rates: ExchangeRates = {
    oficial: dolarRates.oficial ?? 1050,
    tarjeta: dolarRates.tarjeta ?? (dolarRates.oficial ? dolarRates.oficial * 1.3 : 1365),
    mep: dolarRates.mep ?? 1210,
    blue: dolarRates.blue ?? 1240,
  };

  const calc: TaxCalculationResult = calculateArgentineTaxes({
    amount: numAmount,
    currency: isUsd ? "USD" : "ARS",
    category,
    paymentMethod,
    province,
    rates,
  });

  const isMep = paymentMethod === "DOLAR_MEP_CUENTA";
  const mepComparison = calc.mepComparison;
  const iibbRatePct = ((PROVINCES[province]?.iibbRate ?? 0) * 100).toFixed(1);

  const handleCopy = () => {
    const text = [
      `🎮 Impuesto Argento - Ticket de Compra`,
      `📦 ${game.name}`,
      `💵 Base: ${isUsd ? formatUsd(game.usdPrice!) : formatArs(game.originalPrice)} (${formatArs(calc.baseArs)} ARS)`,
      `🏛️ Impuestos: +${formatArs(calc.totalArs - calc.baseArs)} ARS (${calc.taxes.map((t) => `${t.name}: $${Math.round(t.amountArs)}`).join(", ")})`,
      `💰 Total a pagar: ${formatArs(calc.totalArs)} ARS`,
      `📍 Provincia: ${PROVINCES[province]?.label} · Medio: ${isMep ? "Dólar MEP" : "Tarjeta ARS"}`,
      mepComparison?.isRecommended && !isMep
        ? `💡 Ahorrás ${formatArs(mepComparison.savingsArs)} pagando con Dólar MEP`
        : null,
      `Calculado con https://impuesto-argento.netlify.app`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "¡Ticket copiado!",
      description: "Desglose completo listo para compartir en WhatsApp o Discord.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] bg-[#111A2E] border border-slate-700/80 p-0 overflow-hidden text-slate-100 rounded-2xl shadow-2xl">
        {/* Cabecera con imagen y degradado */}
        <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
          {game.thumbnail && game.thumbnail !== "/placeholder.svg" ? (
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover object-center filter brightness-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#74ACDF]/30 via-white/10 to-[#F6B40E]/30 flex items-center justify-center">
              <span className="text-4xl">🎮</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111A2E] via-[#111A2E]/60 to-transparent" />

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-[#74ACDF] border border-white/10">
              {game.platform || (isUsd ? "Tienda Digital (USD)" : "Digital ARS")}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
              📍 {PROVINCES[province]?.label}
            </span>
          </div>
        </div>

        <div className="p-5 pt-0 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
              {game.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Desglose fiscal transparente según normativa oficial vigente (ARCA / Dólar Oficial).
            </DialogDescription>
          </DialogHeader>

          {/* Selector de medio de pago interactivo */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onPaymentMethodChange?.("TARJETA_ARS")}
              className={`text-xs font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isMep
                  ? "bg-[#74ACDF] text-slate-950 shadow-md shadow-[#74ACDF]/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tarjeta ARS (+51%)</span>
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange?.("DOLAR_MEP_CUENTA")}
              className={`text-xs font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isMep
                  ? "bg-[#F6B40E] text-slate-950 shadow-md shadow-[#F6B40E]/25"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dólar MEP (+21%)</span>
            </button>
          </div>

          {/* Precio Final Destacado */}
          <div className="bg-[#0A0F1D]/80 border border-slate-800 rounded-xl p-4 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Total Final a Pagar</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {formatArs(calc.totalArs)}
                </span>
                <span className="text-xs font-bold text-[#74ACDF]">ARS</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Precio Base</span>
              <span className="text-sm font-semibold font-mono text-slate-300">
                {isUsd ? formatUsd(game.usdPrice!) : formatArs(game.originalPrice)}
              </span>
            </div>
          </div>

          {/* Ticket de Desglose */}
          <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Conversión a pesos (Oficial ${calc.exchangeRateUsed?.toFixed(0) || rates.oficial.toFixed(0)})</span>
              <span className="font-mono text-slate-200">{formatArs(calc.baseArs)}</span>
            </div>

            {calc.taxes.map((tax) => (
              <div key={tax.id} className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>{tax.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({tax.legalReference})</span>
                </span>
                <span className="font-mono text-slate-200 font-medium">+ {formatArs(tax.amountArs)}</span>
              </div>
            ))}

            {isMep && (
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1">
                  <span>Percepción Ganancias (30% RG 5617)</span>
                  <span className="text-[10px] text-emerald-500 font-mono">(Exento con MEP)</span>
                </span>
                <span className="font-mono font-semibold">$0</span>
              </div>
            )}

            <div className="flex justify-between items-center text-slate-500">
              <span className="line-through">Impuesto PAÍS</span>
              <span className="text-[10px] font-mono">0% (Vencido)</span>
            </div>
          </div>

          {/* Consejo Dólar MEP */}
          {mepComparison && mepComparison.isRecommended && !isMep && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="space-y-0.5">
                <p className="font-semibold text-emerald-200">
                  ¡Ahorrá {formatArs(mepComparison.savingsArs)} ({mepComparison.savingsPercentage}%) usando Dólar MEP!
                </p>
                <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                  Pagá la tarjeta antes del vencimiento en USD usando tu caja de ahorro en dólares y evitás la percepción del 30%.
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold py-2.5 px-4 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? "¡Comprobante copiado!" : "Copiar ticket"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#74ACDF] hover:bg-[#5B9CD6] text-slate-950 text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-[#74ACDF]/20"
            >
              Cerrar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

