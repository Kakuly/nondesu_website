import type { PagesEnv } from "../lib/env";
import { oauthErrorPage, oauthSuccessPage } from "../lib/oauth-html";

interface CallbackContext {
  request: Request;
  env: PagesEnv;
}

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }

  return null;
}

export async function onRequestGet(context: CallbackContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = readCookie(request, "oauth_state");

  if (!code) {
    return htmlResponse(oauthErrorPage("GitHub から認可コードが返りませんでした。"), 400);
  }

  if (!state || !storedState || state !== storedState) {
    return htmlResponse(oauthErrorPage("state が一致しません。もう一度ログインしてください。"), 400);
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return htmlResponse(oauthErrorPage("GitHub OAuth の環境変数が未設定です。"), 500);
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/callback`;

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return htmlResponse(oauthErrorPage("GitHub トークンの取得に失敗しました。"), 502);
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    const detail = tokenData.error_description ?? tokenData.error ?? "unknown error";
    return htmlResponse(oauthErrorPage(detail), 502);
  }

  return htmlResponse(oauthSuccessPage(tokenData.access_token), 200, {
    "Set-Cookie": "oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  });
}

function htmlResponse(body: string, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...extraHeaders,
    },
  });
}
