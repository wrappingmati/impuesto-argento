// src/hooks/useDolarRates.ts
import { useQuery } from "@tanstack/react-query";
import { fetchDolarRates, isStale, type DolarRates } from "@/lib/dolarApi";

const DEFAULT_RATES: DolarRates = {
  blue: null,
  oficial: null,
  tarjeta: null,
  mep: null,
};

export function useDolarRates() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["dolarRates"],
    queryFn: fetchDolarRates,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    rates: data?.rates ?? DEFAULT_RATES,
    source: data?.source ?? null,
    stale: data ? isStale(data) : false,
    loading: isLoading,
    isFetching,
    error: error instanceof Error ? error.message : null,
    refetch: () => {
      refetch();
    },
  };
}
