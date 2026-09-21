export interface SessionResponse {
  ok: boolean;
  username?: string;
  message?: string;
}

export async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch("/api/admin/session", { credentials: "same-origin" });
  return (await response.json()) as SessionResponse;
}

export async function requireSession(loginPath = "/admin/login/"): Promise<SessionResponse> {
  const session = await fetchSession();
  if (!session.ok) {
    window.location.href = loginPath;
    throw new Error("unauthenticated");
  }
  return session;
}

export async function apiJson<T>(
  url: string,
  options: RequestInit = {},
): Promise<T & { ok: boolean; message?: string }> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = (await response.json()) as T & { ok: boolean; message?: string };
  if (!response.ok || !data.ok) {
    throw new Error(data.message ?? "リクエストに失敗しました。");
  }
  return data;
}

export function showStatus(
  element: HTMLElement | null,
  message: string,
  type: "success" | "error" = "success",
): void {
  if (!element) return;
  element.textContent = message;
  element.className = `admin-status is-visible is-${type}`;
}
