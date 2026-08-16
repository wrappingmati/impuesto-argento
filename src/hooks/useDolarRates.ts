// src/hooks/useDolarRates.ts
import { useCallback, useEffect, useState } from "react";
import { fetchDolarRates, isStale, type DolarResult } from "@/lib/dolarApi";

interface UseDolarRatesState {
  result: DolarResult | null;
  loading: boolean;
  error: string | null;
}

export function useDolarRates() {
  const [state, setState] = useState<UseDolarRatesState>({
    result: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await fetchDolarRates();
      setState({ result, loading: false, error: null });
    } catch (err) {
      setState({
        result: null,
        loading: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    rates: state.result?.rates ?? { blue: null, oficial: null, tarjeta: null },
    source: state.result?.source ?? null,
    stale: state.result ? isStale(state.result) : false,
    loading: state.loading,
    error: state.error,
    refetch: load,
  };
}
