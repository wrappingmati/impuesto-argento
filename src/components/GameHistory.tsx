// src/components/GameHistory.tsx
import { Card } from "@/components/ui/card";
import { X, GitCompare, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const IVA_RATE = 0.21;

interface SavedGame {
  name: string;
  originalPrice: number;
  thumbnail: string;
  usdPrice?: number;
  dolarType?: string;
}

interface GameHistoryProps {
  games: SavedGame[];
  onDeleteGame?: (index: number) => void;
}

type ViewMode = "list" | "compare";

const dolarLabels: Record<string, string> = {
  blue: "Blue",
  oficial: "Oficial",
  tarjeta: "Tarjeta",
};

function calcFinal(originalPrice: number) {
  return originalPrice * (1 + IVA_RATE);
}

export default function GameHistory({ games, onDeleteGame }: GameHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  if (!games.length) return null;

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* Header con toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gaming-accent">Juegos Guardados</h3>
        <div className="flex gap-1 bg-gaming-darker/50 rounded-lg p-1 border border-gaming-accent/10">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === "list"
                ? "bg-gaming-accent text-white"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
          <button
            onClick={() => setViewMode("compare")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === "compare"
                ? "bg-gaming-accent text-white"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Comparar
          </button>
        </div>
      </div>

      {/* Vista Lista */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {games.map((game, index) => (
            <Card
              key={index}
              className="w-full p-4 bg-gaming-darker/50 backdrop-blur-sm relative group border-gaming-accent/10"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={() => onDeleteGame?.(index)}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <div className="flex items-center gap-4">
                <img
                  src={game.thumbnail || "/placeholder.svg"}
                  alt={game.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{game.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                    {game.usdPrice && game.dolarType && (
                      <p className="text-xs">
                        USD ${game.usdPrice.toFixed(2)} · Dólar {dolarLabels[game.dolarType] ?? game.dolarType}
                      </p>
                    )}
                    <p>Base: ARS ${game.originalPrice.toFixed(2)}</p>
                    <p className="text-gaming-accent font-medium">
                      Final (c/IVA): ARS ${calcFinal(game.originalPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vista Comparación */}
      {viewMode === "compare" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 rounded-tl-lg border-b border-gaming-accent/10 w-32">
                  Juego
                </th>
                <th className="text-right text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 border-b border-gaming-accent/10">
                  USD
                </th>
                <th className="text-right text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 border-b border-gaming-accent/10">
                  Dólar
                </th>
                <th className="text-right text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 border-b border-gaming-accent/10">
                  Base ARS
                </th>
                <th className="text-right text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 border-b border-gaming-accent/10">
                  IVA (21%)
                </th>
                <th className="text-right text-muted-foreground font-medium py-2 px-3 bg-gaming-darker/30 rounded-tr-lg border-b border-gaming-accent/10">
                  Final
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const iva = game.originalPrice * IVA_RATE;
                const final = game.originalPrice + iva;
                const cheapest = Math.min(...games.map((g) => calcFinal(g.originalPrice)));
                const isCheapest = calcFinal(game.originalPrice) === cheapest;

                return (
                  <tr
                    key={index}
                    className={`group transition-colors ${
                      isCheapest ? "bg-gaming-accent/5" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="py-3 px-3 border-b border-gaming-accent/5">
                      <div className="flex items-center gap-2">
                        <img
                          src={game.thumbnail || "/placeholder.svg"}
                          alt={game.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div>
                          <span className="font-medium truncate block max-w-[100px]" title={game.name}>
                            {game.name}
                          </span>
                          {isCheapest && games.length > 1 && (
                            <span className="text-[10px] text-gaming-accent">✓ más barato</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right border-b border-gaming-accent/5 text-muted-foreground">
                      {game.usdPrice ? `$${game.usdPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-gaming-accent/5 text-muted-foreground">
                      {game.dolarType ? dolarLabels[game.dolarType] ?? game.dolarType : "—"}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-gaming-accent/5 tabular-nums">
                      ${game.originalPrice.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-gaming-accent/5 text-gaming-accent/70 tabular-nums">
                      +${iva.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-gaming-accent/5 font-semibold tabular-nums">
                      <span className={isCheapest && games.length > 1 ? "text-gaming-accent" : ""}>
                        ${final.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}