import { jsonError, requireAdmin, type AdminContext } from "../../lib/admin-auth";
import { changeAdminPassword, MIN_PASSWORD_LENGTH } from "../../lib/admin-passwords";

interface PasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function onRequestPost(context: AdminContext): Promise<Response> {
  const auth = await requireAdmin(context);
  if (!auth.ok) return auth.response;

  let body: PasswordBody;
  try {
    body = await context.request.json();
  } catch {
    return jsonError("JSON の形式が正しくありません。");
  }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (!currentPassword || !newPassword) {
    return jsonError("現在のパスワードと新しいパスワードを入力してください。");
  }

  const result = await changeAdminPassword(auth.username, currentPassword, newPassword, context.env);
  if (!result.ok) {
    return jsonError(result.message, result.message.includes("正しくありません") ? 401 : 400);
  }

  return Response.json({
    ok: true,
    message: "パスワードを変更しました。次回ログインから新しいパスワードを使ってください。",
    minLength: MIN_PASSWORD_LENGTH,
  });
}
