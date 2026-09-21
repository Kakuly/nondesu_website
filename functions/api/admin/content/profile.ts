import { jsonError, requireAdmin, type AdminContext } from "../../../lib/admin-auth";
import { getRepoFile, putRepoFile } from "../../../lib/github";
import { parseProfileYaml, stringifyProfile, type ProfileContent } from "../../../lib/yaml-content";

const PROFILE_PATH = "src/content/profile/nondesu.yaml";

export async function onRequestGet(context: AdminContext): Promise<Response> {
  const auth = await requireAdmin(context);
  if (!auth.ok) return auth.response;

  try {
    const file = await getRepoFile(context.env, PROFILE_PATH);
    if (!file) {
      return jsonError("プロフィールファイルが見つかりません。", 404);
    }

    const data = parseProfileYaml(file.content);
    return Response.json({
      ok: true,
      path: PROFILE_PATH,
      sha: file.sha,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "読み込みに失敗しました。";
    return jsonError(message, 502);
  }
}

export async function onRequestPut(context: AdminContext): Promise<Response> {
  const auth = await requireAdmin(context);
  if (!auth.ok) return auth.response;

  let body: { data?: ProfileContent; sha?: string };
  try {
    body = await context.request.json();
  } catch {
    return jsonError("JSON の形式が正しくありません。");
  }

  if (!body.data?.shortBio || !body.data.longBio || !Array.isArray(body.data.roles)) {
    return jsonError("プロフィールデータが不足しています。");
  }

  try {
    const content = stringifyProfile(body.data);
    await putRepoFile(
      context.env,
      PROFILE_PATH,
      content,
      body.sha ?? null,
      `admin: update profile (${auth.username})`,
    );

    const updated = await getRepoFile(context.env, PROFILE_PATH);
    return Response.json({
      ok: true,
      message: "プロフィールを保存しました。サイトの再ビルドが始まります。",
      sha: updated?.sha ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました。";
    return jsonError(message, 502);
  }
}
