// src/pages/Index.tsx
import { useState } from "react";
import GameSearch from "@/components/GameSearch";
import PriceBreakdown from "@/components/PriceBreakdown";
import TaxInfo from "@/components/TaxInfo";
import GameHistory from "@/components/GameHistory";
import DolarInfo, { type DolarRates } from "@/components/DolarInfo";
import { useSavedGames } from "@/hooks/useSavedGames";
import { useToast } from "@/hooks/use-toast";
import { loadSettings, persistSettings } from "@/lib/storage";
import type { DolarType, ProvinceCode } from "@/lib/tax";

interface CurrentGame {
  price: number;
  usdPrice?: number;
  dolarType?: DolarType;
}

export default function Index() {
  const [currentGame, setCurrentGame] = useState<CurrentGame | undefined>();
  const [dolarRates, setDolarRates] = useState<DolarRates>({ blue: null, oficial: null, tarjeta: null });
  const [province, setProvince] = useState<ProvinceCode>(() => loadSettings().province);
  const { games, addGame, removeGame } = useSavedGames();
  const { toast } = useToast();

  const handleProvinceChange = (next: ProvinceCode) => {
    setProvince(next);
    persistSettings({ province: next, defaultDolarType: "tarjeta" });
  };

  const handleSaveGame = (game: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: DolarType;
  }) => {
    addGame({
      name: game.name,
      originalPrice: game.price,
      thumbnail: game.thumbnail,
      usdPrice: game.usdPrice,
      dolarType: game.dolarType,
    });

    setCurrentGame({
      price: game.price,
      usdPrice: game.usdPrice,
      dolarType: game.dolarType,
    });

    toast({
      title: "Juego guardado",
      description: `${game.name} fue agregado a tu historial.`,
    });
  };

  const handleDeleteGame = (index: number) => {
    removeGame(index);
    toast({
      title: "Juego eliminado",
      description: "Se quitó del historial.",
    });
  };

  const getDolarRate = (type?: DolarType): number | undefined => {
    if (!type) return undefined;
    return dolarRates[type] ?? undefined;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <img src="/uploads/mati-logo.png" alt="WrappingMati" className="w-16 h-16 mx-auto opacity-90" />
          <h1 className="text-4xl font-display font-bold text-primary">Impuesto Argento</h1>
          <p className="text-muted-foreground text-sm">
            Calculá el precio final de tus juegos en Argentina, con IVA e IIBB incluidos.
          </p>
        </div>

        <div className="flex justify-center">
          <DolarInfo onRatesLoaded={setDolarRates} />
        </div>

        <div className="flex flex-col items-center gap-6">
          <GameSearch
            onSave={handleSaveGame}
            dolarRates={dolarRates}
            province={province}
            onProvinceChange={handleProvinceChange}
          />

          {currentGame && (
            <PriceBreakdown
              originalPrice={currentGame.price}
              usdPrice={currentGame.usdPrice}
              dolarType={currentGame.dolarType}
              dolarRate={getDolarRate(currentGame.dolarType)}
              province={province}
            />
          )}

          <TaxInfo />

          <GameHistory games={games} province={province} onDeleteGame={handleDeleteGame} />
        </div>
      </div>
    </div>
  );
}
