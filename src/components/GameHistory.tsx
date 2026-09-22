// src/components/GameHistory.tsx
import React, { useState } from "react";
import { X, GitCompare, List, History } from "lucide-react";
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
    <div className="bg-[#131722] border border-white/[0.08] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-200">Historial de cálculos</h3>
        </div>
        <div className="flex gap-1 bg-[#0b0e14] rounded-lg p-0.5 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="w-3 h-3" />
            <span>Lista</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("compare")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === "compare"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCompare className="w-3 h-3" />
            <span>Comparar</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-white/[0.06]">
        <span>Total acumulado:</span>
        <span className="text-emerald-400 font-semibold">{formatArs(totalSpent)}</span>
      </div>

      {viewMode === "list" && (
        <div className="space-y-2">
          {games.map((game, index) => (
            <div
              key={index}
              className="bg-[#0b0e14] border border-white/[0.06] hover:border-white/[0.1] rounded-xl p-3 relative group transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={game.thumbnail || "/placeholder.svg"}
                  alt={game.name}
                  className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-white/[0.06] shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="min-w-0">
                  <h4 className="font-medium text-xs sm:text-sm text-slate-200 truncate">{game.name}</h4>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2.5 mt-0.5 font-mono">
                    {game.usdPrice && game.dolarType && (
                      <span>US$ {game.usdPrice.toFixed(2)}</span>
                    )}
                    <span>Base: {formatArs(game.originalPrice)}</span>
                    <span className="text-emerald-400 font-medium">
                      Final: {formatArs(finalOf(game, province))}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteGame?.(index)}
                aria-label={`Eliminar ${game.name}`}
                className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {viewMode === "compare" && (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-xs border-separate border-spacing-0 font-mono">
            <thead>
              <tr className="bg-[#0b0e14] text-slate-400 font-sans">
                {["Juego", "USD", "Base ARS", "Impuestos", "Final"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2 px-3 border-b border-white/[0.06] font-medium ${
                      i > 0 ? "text-right" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {games.map((game, index) => {
                const breakdown = getGameBreakdown(game, province);
                const cheapest = Math.min(...games.map((g) => finalOf(g, province)));
                const isCheapest = breakdown.total === cheapest;

                return (
                  <tr
                    key={index}
                    className={isCheapest ? "bg-emerald-500/[0.04]" : "hover:bg-white/[0.02]"}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-sans font-medium text-slate-200 truncate block max-w-[140px]" title={game.name}>
                        {game.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {game.usdPrice ? `$${game.usdPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      ${breakdown.base.toFixed(0)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
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
