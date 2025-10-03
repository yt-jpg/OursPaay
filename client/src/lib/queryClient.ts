
import { QueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "./authUtils";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(`401: ${response.statusText || 'Unauthorized'}`);
          }
          if (response.status >= 500) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error as Error)) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<any> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(`401: ${response.statusText || 'Unauthorized'}`);
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `${response.status}: ${response.statusText}`);
  }

  return response.json();
}
