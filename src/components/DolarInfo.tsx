// src/components/DolarInfo.tsx
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

export interface DolarRates {
  blue: number | null;
  oficial: number | null;
  tarjeta: number | null;
}

interface DolarInfoProps {
  onRatesLoaded?: (rates: DolarRates) => void;
}

export default function DolarInfo({ onRatesLoaded }: DolarInfoProps) {
  const [rates, setRates] = useState<DolarRates>({ blue: null, oficial: null, tarjeta: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.bluelytics.com.ar/v2/latest")
      .then((res) => res.json())
      .then((data) => {
        const oficial = data.oficial.value_avg;
        const blue = data.blue.value_avg;
        // Dólar tarjeta = oficial + 30% PAÍS + 45% Ganancias (impuesto PAIS eliminado desde sept 2024, pero tarjeta sigue teniendo retención 45% ganancias)
        // Actualmente: oficial * 1.45 (solo retención de ganancias, PAÍS eliminado)
        const tarjeta = parseFloat((oficial * 1.45).toFixed(2));
        const newRates = { blue, oficial, tarjeta };
        setRates(newRates);
        onRatesLoaded?.(newRates);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al traer dólar:", err);
        setLoading(false);
      });
  }, []);

  const rateItems = [
    { label: "Blue", value: rates.blue, color: "text-blue-400" },
    { label: "Oficial", value: rates.oficial, color: "text-green-400" },
    { label: "Tarjeta", value: rates.tarjeta, color: "text-yellow-400", note: "+45% Ganancias" },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="bg-gaming-darker/60 backdrop-blur-sm border border-gaming-accent/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-gaming-accent" />
          <span className="text-sm font-semibold text-gaming-accent tracking-wide uppercase">
            Cotización del Dólar
          </span>
        </div>
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {rateItems.map(({ label, value, color, note }) => (
              <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>
                  ${value?.toFixed(0) ?? "—"}
                </p>
                {note && <p className="text-[10px] text-muted-foreground mt-1">{note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}