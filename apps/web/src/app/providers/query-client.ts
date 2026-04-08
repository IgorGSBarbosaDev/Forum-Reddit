import { QueryClient } from "@tanstack/react-query";

import { AppApiError } from "../../shared/api/http-client";

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof AppApiError) {
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
    mutations: {
      retry: 0,
    },
  },
});