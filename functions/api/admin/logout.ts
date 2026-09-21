import { clearSessionCookieHeader } from "../../lib/session";

export async function onRequestPost(): Promise<Response> {
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": clearSessionCookieHeader(),
      },
    },
  );
}
