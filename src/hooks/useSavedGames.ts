// src/hooks/useSavedGames.ts
import { useCallback, useEffect, useState } from "react";
import { loadSavedGames, persistSavedGames, type SavedGame } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export function useSavedGames() {
  const [games, setGames] = useState<SavedGame[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setGames(loadSavedGames());
  }, []);

  const addGame = useCallback(
    (game: Omit<SavedGame, "savedAt">) => {
      setGames((prev) => {
        const next = [{ ...game, savedAt: Date.now() }, ...prev];
        const ok = persistSavedGames(next);
        if (!ok) {
          toast({
            title: "No se pudo guardar",
            description: "El almacenamiento local está lleno o bloqueado.",
            variant: "destructive",
          });
        }
        return next;
      });
    },
    [toast]
  );

  const removeGame = useCallback((index: number) => {
    setGames((prev) => {
      const next = prev.filter((_, i) => i !== index);
      persistSavedGames(next);
      return next;
    });
  }, []);

  return { games, addGame, removeGame };
}
