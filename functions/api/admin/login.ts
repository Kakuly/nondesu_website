import type { PagesEnv } from "../../lib/env";
import { verifyPassword } from "../../lib/password";
import { createSessionToken, sessionCookieHeader } from "../../lib/session";

interface LoginContext {
  request: Request;
  env: PagesEnv;
}

export async function onRequestPost(context: LoginContext): Promise<Response> {
  const { request, env } = context;

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "JSON の形式が正しくありません。" }, { status: 400 });
  }

  const username = env.ADMIN_USERNAME?.trim();
  const secret = env.SESSION_SECRET?.trim();

  if (!username || !secret) {
    return Response.json(
      { ok: false, message: "ADMIN_USERNAME / SESSION_SECRET が未設定です。" },
      { status: 500 },
    );
  }

  if (!env.ADMIN_PASSWORD && !env.ADMIN_PASSWORD_HASH) {
    return Response.json(
      { ok: false, message: "ADMIN_PASSWORD または ADMIN_PASSWORD_HASH が未設定です。" },
      { status: 500 },
    );
  }

  if (!body.username || !body.password) {
    return Response.json({ ok: false, message: "ユーザー名とパスワードを入力してください。" }, { status: 400 });
  }

  if (body.username !== username) {
    return Response.json({ ok: false, message: "ログイン情報が正しくありません。" }, { status: 401 });
  }

  const valid = await verifyPassword(body.password, env);
  if (!valid) {
    return Response.json({ ok: false, message: "ログイン情報が正しくありません。" }, { status: 401 });
  }

  const token = await createSessionToken(username, secret);

  return Response.json(
    { ok: true, username },
    {
      headers: {
        "Set-Cookie": sessionCookieHeader(token),
      },
    },
  );
}
