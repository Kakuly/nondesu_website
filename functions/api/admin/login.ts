import { adminUsersConfigured, verifyAdminLogin } from "../../lib/admin-users";
import { loadPasswordOverrides } from "../../lib/admin-passwords";
import type { PagesEnv } from "../../lib/env";
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

  const secret = env.SESSION_SECRET?.trim();
  if (!secret) {
    return Response.json({ ok: false, message: "SESSION_SECRET が未設定です。" }, { status: 500 });
  }

  if (!adminUsersConfigured(env)) {
    return Response.json(
      {
        ok: false,
        message:
          "ADMIN_USER_1 / ADMIN_PASS_1（および ADMIN_USER_2 / ADMIN_PASS_2）が未設定です。旧設定の場合は ADMIN_USERNAME / ADMIN_PASSWORD を確認してください。",
      },
      { status: 500 },
    );
  }

  if (!body.username || !body.password) {
    return Response.json({ ok: false, message: "ユーザー名とパスワードを入力してください。" }, { status: 400 });
  }

  const overrides = await loadPasswordOverrides(env);
  const username = await verifyAdminLogin(body.username, body.password, env, overrides);
  if (!username) {
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
