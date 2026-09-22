// src/components/GameHistory.tsx
import React, { useState } from "react";
import { X, GitCompare, List, History, Trash2 } from "lucide-react";
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

function getGameBreakdown(game: SavedGame, province: ProvinceCode) {
  const isForeign = !!game.usdPrice || game.dolarType !== undefined;
  // Todo consumo del exterior o liquidado en moneda extranjera con tarjeta lleva IVA (21%) + Ganancias (30%) + IIBB
  return computeBreakdown(game.originalPrice, province, isForeign, isForeign);
}

function finalOf(game: SavedGame, province: ProvinceCode) {
  return getGameBreakdown(game, province).total;
}

export default function GameHistory({ games, province, onDeleteGame }: GameHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  if (!games.length) return null;

  const totalSpent = games.reduce((sum, g) => sum + finalOf(g, province), 0);

  return (
    <div className="bg-[#131B2E]/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-violet-400" />
          <h3 className="text-base font-semibold text-slate-100">Juegos e ítems guardados</h3>
        </div>
        <div className="flex gap-1 bg-[#0F1626] rounded-xl p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("compare")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === "compare"
                ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Comparar</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1 border-b border-slate-800/50">
        <span>Total acumulado estimado:</span>
        <span className="text-emerald-400 font-bold text-sm">{formatArs(totalSpent)}</span>
      </div>

      {viewMode === "list" && (
        <div className="space-y-2.5">
          {games.map((game, index) => (
            <div
              key={index}
              className="bg-[#0F1626] border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 relative group transition-all"
            >
              <button
                type="button"
                onClick={() => onDeleteGame?.(index)}
                aria-label={`Eliminar ${game.name}`}
                className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3.5 pr-6">
                <img
                  src={game.thumbnail || "/placeholder.svg"}
                  alt={game.name}
                  className="w-12 h-12 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-slate-200 truncate">{game.name}</h4>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 font-mono">
                    {game.usdPrice && game.dolarType && (
                      <span>USD ${game.usdPrice.toFixed(2)}</span>
                    )}
                    <span>Base: {formatArs(game.originalPrice)}</span>
                    <span className="text-emerald-400 font-medium">
                      Final: {formatArs(finalOf(game, province))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "compare" && (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs border-separate border-spacing-0 font-mono">
            <thead>
              <tr className="bg-[#0F1626] text-slate-400 font-sans">
                {["Juego", "USD", "Dólar", "Base ARS", "Impuestos", "Final"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2.5 px-3 border-b border-slate-800 font-medium ${
                      i > 0 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {games.map((game, index) => {
                const breakdown = getGameBreakdown(game, province);
                const cheapest = Math.min(...games.map((g) => finalOf(g, province)));
                const isCheapest = breakdown.total === cheapest;

                return (
                  <tr
                    key={index}
                    className={isCheapest ? "bg-emerald-500/5" : "hover:bg-slate-850/30"}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={game.thumbnail || "/placeholder.svg"}
                          alt={game.name}
                          className="w-7 h-7 object-cover rounded bg-slate-900 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        <span className="font-sans font-medium text-slate-200 truncate block max-w-[120px]" title={game.name}>
                          {game.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {game.usdPrice ? `$${game.usdPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {game.dolarType ? dolarLabels[game.dolarType] ?? game.dolarType : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      ${breakdown.base.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-violet-300">
                      +${(breakdown.iva + breakdown.ganancias + breakdown.iibb).toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ${breakdown.total.toFixed(0)}
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
