// src/components/GameHistory.tsx
import { useState } from "react";
import { X, GitCompare, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeBreakdown, formatArs, PROVINCES, type ProvinceCode } from "@/lib/tax";
import type { SavedGame } from "@/lib/storage";

interface GameHistoryProps {
  games: SavedGame[];
  province: ProvinceCode;
  onDeleteGame?: (index: number) => void;
}

type ViewMode = "list" | "compare";

const dolarLabels: Record<string, string> = {
  blue: "Blue",
  oficial: "Oficial",
  tarjeta: "Tarjeta",
};

function finalOf(game: SavedGame, province: ProvinceCode) {
  const isForeign = !!game.usdPrice && !!game.dolarType;
  return computeBreakdown(game.originalPrice, province, isForeign).total;
}

export default function GameHistory({ games, province, onDeleteGame }: GameHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  if (!games.length) return null;

  const totalSpent = games.reduce((sum, g) => sum + finalOf(g, province), 0);

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-semibold text-primary">Juegos guardados</h3>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-border">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Lista
          </button>
          <button
            onClick={() => setViewMode("compare")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === "compare" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Comparar
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-nums">
        Total estimado del historial:{" "}
        <span className="text-primary font-semibold">{formatArs(totalSpent)}</span>
        {PROVINCES[province].iibbRate === 0 && (
          <span className="ml-1 opacity-70">(sin IIBB — revisá tu provincia arriba)</span>
        )}
      </p>

      {viewMode === "list" && (
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={index} className="ticket w-full p-4 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                onClick={() => onDeleteGame?.(index)}
                aria-label={`Eliminar ${game.name}`}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <div className="flex items-center gap-4">
                <img
                  src={game.thumbnail || "/placeholder.svg"}
                  alt={game.name}
                  className="w-14 h-14 object-cover rounded-lg"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold truncate">{game.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-0.5 mt-1 font-nums">
                    {game.usdPrice && game.dolarType && (
                      <p className="text-xs">
                        USD ${game.usdPrice.toFixed(2)} · Dólar{" "}
                        {dolarLabels[game.dolarType] ?? game.dolarType}
                      </p>
                    )}
                    <p>Base: {formatArs(game.originalPrice)}</p>
                    <p className="text-primary font-medium">
                      Final estimado: {formatArs(finalOf(game, province))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "compare" && (
        <div className="overflow-x-auto ticket p-0">
          <table className="w-full text-sm border-separate border-spacing-0 font-nums">
            <thead>
              <tr>
                {["Juego", "USD", "Dólar", "Base ARS", "IVA+IIBB", "Final"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-display text-left text-muted-foreground font-medium py-2 px-3 bg-white/5 border-b border-border ${
                      i > 0 ? "text-right" : "w-32"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {games.map((game, index) => {
                const isForeign = !!game.usdPrice && !!game.dolarType;
                const breakdown = computeBreakdown(game.originalPrice, province, isForeign);
                const cheapest = Math.min(
                  ...games.map((g) => finalOf(g, province))
                );
                const isCheapest = breakdown.total === cheapest;

                return (
                  <tr key={index} className={isCheapest ? "bg-primary/5" : "hover:bg-white/[0.02]"}>
                    <td className="py-3 px-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <img
                          src={game.thumbnail || "/placeholder.svg"}
                          alt={game.name}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <div>
                          <span className="font-display font-medium truncate block max-w-[100px]" title={game.name}>
                            {game.name}
                          </span>
                          {isCheapest && games.length > 1 && (
                            <span className="text-[10px] text-primary">✓ más barato</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right border-b border-border/50 text-muted-foreground">
                      {game.usdPrice ? `$${game.usdPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-border/50 text-muted-foreground">
                      {game.dolarType ? dolarLabels[game.dolarType] ?? game.dolarType : "—"}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-border/50">
                      ${breakdown.base.toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-border/50 text-primary/70">
                      +${(breakdown.iva + breakdown.iibb).toFixed(0)}
                    </td>
                    <td className="py-3 px-3 text-right border-b border-border/50 font-semibold">
                      <span className={isCheapest && games.length > 1 ? "text-primary" : ""}>
                        ${breakdown.total.toFixed(0)}
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
