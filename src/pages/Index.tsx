// src/pages/Index.tsx
import { useState, useEffect } from "react";
import GameSearch from "@/components/GameSearch";
import PriceBreakdown from "@/components/PriceBreakdown";
import TaxInfo from "@/components/TaxInfo";
import GameHistory from "@/components/GameHistory";
import { useToast } from "@/components/ui/use-toast";
import DolarInfo, { type DolarRates } from "@/components/DolarInfo";

interface SavedGame {
  name: string;
  originalPrice: number;
  thumbnail: string;
  usdPrice?: number;
  dolarType?: "blue" | "oficial" | "tarjeta";
}

interface CurrentGame {
  price: number;
  usdPrice?: number;
  dolarType?: "blue" | "oficial" | "tarjeta";
}

export default function Index() {
  const [currentGame, setCurrentGame] = useState<CurrentGame | undefined>();
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [dolarRates, setDolarRates] = useState<DolarRates>({ blue: null, oficial: null, tarjeta: null });
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("savedGames");
    if (stored) {
      setSavedGames(JSON.parse(stored));
    }
  }, []);

  const handleSaveGame = (game: {
    name: string;
    price: number;
    thumbnail: string;
    usdPrice?: number;
    dolarType?: "blue" | "oficial" | "tarjeta";
  }) => {
    const newGame: SavedGame = {
      name: game.name,
      originalPrice: game.price,
      thumbnail: game.thumbnail,
      usdPrice: game.usdPrice,
      dolarType: game.dolarType,
    };

    const updatedGames = [newGame, ...savedGames];
    setSavedGames(updatedGames);
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));

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
    const updatedGames = savedGames.filter((_, i) => i !== index);
    setSavedGames(updatedGames);
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));

    toast({
      title: "Juego eliminado",
      description: "El juego fue eliminado del historial.",
    });
  };

  const getDolarRate = (type?: "blue" | "oficial" | "tarjeta"): number | undefined => {
    if (!type) return undefined;
    return dolarRates[type] ?? undefined;
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white py-8 px-4">
      <div className="container max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="/uploads/mati-logo.png"
            alt="WrappingMati Logo"
            className="w-20 h-20 mx-auto"
          />
          <h1 className="text-4xl font-bold text-gaming-accent">Impuesto Argento</h1>
          <p className="text-muted-foreground">
            Calculá el precio final de tus juegos en Argentina, con impuestos incluidos
          </p>
        </div>

        {/* Cotización dólar */}
        <div className="flex justify-center">
          <DolarInfo onRatesLoaded={setDolarRates} />
        </div>

        {/* Formulario */}
        <div className="flex flex-col items-center gap-6">
          <GameSearch onSave={handleSaveGame} dolarRates={dolarRates} />

          {currentGame && (
            <PriceBreakdown
              originalPrice={currentGame.price}
              usdPrice={currentGame.usdPrice}
              dolarType={currentGame.dolarType}
              dolarRate={getDolarRate(currentGame.dolarType)}
            />
          )}

          <TaxInfo />

          <GameHistory games={savedGames} onDeleteGame={handleDeleteGame} />
        </div>
      </div>
    </div>
  );
}