import { useState, useEffect } from "react";
import GameSearch from "@/components/GameSearch";
import PriceBreakdown from "@/components/PriceBreakdown";
import TaxInfo from "@/components/TaxInfo";
import GameHistory from "@/components/GameHistory";
import { useToast } from "@/components/ui/use-toast";
import DolarInfo from "@/components/DolarInfo"; // 👈 import nuevo

interface SavedGame {
  name: string;
  originalPrice: number;
  thumbnail: string;
}

export default function Index() {
  const [currentPrice, setCurrentPrice] = useState<number | undefined>();
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const { toast } = useToast();

  // Cargar juegos guardados al iniciar
  useEffect(() => {
    const stored = localStorage.getItem("savedGames");
    if (stored) {
      setSavedGames(JSON.parse(stored));
    }
  }, []);

  const handleSaveGame = (game: { name: string; price: number; thumbnail: string }) => {
    const newGame = {
      name: game.name,
      originalPrice: game.price,
      thumbnail: game.thumbnail,
    };

    const updatedGames = [newGame, ...savedGames];
    setSavedGames(updatedGames);
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));
    setCurrentPrice(game.price);

    toast({
      title: "Juego guardado",
      description: `${game.name} ha sido agregado a tu historial.`,
    });
  };

  const handleDeleteGame = (index: number) => {
    const updatedGames = savedGames.filter((_, i) => i !== index);
    setSavedGames(updatedGames);
    localStorage.setItem("savedGames", JSON.stringify(updatedGames));
    
    toast({
      title: "Juego eliminado",
      description: "El juego ha sido eliminado de tu historial.",
    });
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white py-8 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <img
            src="/uploads/mati-logo.png"
            alt="WrappingMati Logo"
            className="w-24 h-24 mx-auto"
          />
          <h1 className="text-4xl font-bold text-gaming-accent">Impuesto Argento</h1>
          <p className="text-lg text-muted-foreground">
            Calcula el precio final de tus juegos en Argentina con Impuesto argento
          </p>
        </div>
{/* Cotización del dólar */}
        <DolarInfo /> {/* 👈 agregado */}

        {/* Main Content */}
        {/* Main Content */}
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <GameSearch onSave={handleSaveGame} />
            
            <PriceBreakdown originalPrice={currentPrice} />
            
            <TaxInfo />

            <GameHistory games={savedGames} onDeleteGame={handleDeleteGame} />
          </div>
        </div>
      </div>
    </div>
  );
}