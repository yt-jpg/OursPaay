<<<<<<< HEAD
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
=======

import { QueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "./authUtils";
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
<<<<<<< HEAD
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
=======
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
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
    },
    mutations: {
      retry: false,
    },
  },
});
<<<<<<< HEAD
=======

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
>>>>>>> a757380dbfe2d95040e42f9db40e45de5910a0af
