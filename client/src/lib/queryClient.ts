import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getUserId } from "@/hooks/use-auth";

function appendUserId(url: string): string {
  const userId = getUserId();
  if (!userId) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}userId=${userId}`;
}

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
  // For POST/PATCH requests, include userId in body
  let finalData = data;
  if ((method === "POST" || method === "PATCH") && data) {
    const userId = getUserId();
    if (userId) {
      finalData = { ...data as object, userId };
    }
  }

  const res = await fetch(url, {
    method,
    headers: finalData ? { "Content-Type": "application/json" } : {},
    body: finalData ? JSON.stringify(finalData) : undefined,
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
    const url = appendUserId(queryKey.join("/") as string);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});