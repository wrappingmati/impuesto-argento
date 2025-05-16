import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedGame {
  name: string;
  originalPrice: number;
  thumbnail: string;
}

interface GameHistoryProps {
  games: SavedGame[];
  onDeleteGame?: (index: number) => void;
}

export default function GameHistory({ games, onDeleteGame }: GameHistoryProps) {
  if (!games.length) return null;

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-xl font-semibold text-gaming-accent">Juegos Guardados</h3>
      <div className="space-y-4">
        {games.map((game, index) => {
          const ivaAmount = game.originalPrice * 0.21;
          
          const finalPrice = game.originalPrice + ivaAmount ;

          return (
            <Card key={index} className="w-full p-4 bg-gaming-darker/50 backdrop-blur-sm relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteGame?.(index)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
              <div className="flex items-center gap-4">
                <img
                  src={game.thumbnail || "/placeholder.svg"}
                  alt={game.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{game.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Precio Original: ARS ${game.originalPrice.toFixed(2)}</p>
                    <p>Precio Final: ARS ${finalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}