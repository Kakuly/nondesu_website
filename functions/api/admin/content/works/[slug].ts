import { jsonError, requireAdmin, type AdminContext } from "../../../../lib/admin-auth";
import { getRepoFile, putRepoFile } from "../../../../lib/github";
import { parseWorkYaml, stringifyWork, type WorkContent } from "../../../../lib/yaml-content";

const WORKS_DIR = "src/content/works";

function slugFromParams(params: Record<string, string | undefined>): string | null {
  const slug = params.slug?.trim();
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) return null;
  return slug;
}

export async function onRequestGet(context: AdminContext): Promise<Response> {
  const auth = await requireAdmin(context);
  if (!auth.ok) return auth.response;

  const slug = slugFromParams(context.params as Record<string, string | undefined>);
  if (!slug) return jsonError("作品 slug が不正です。");

  const path = `${WORKS_DIR}/${slug}.yaml`;

  try {
    const file = await getRepoFile(context.env, path);
    if (!file) {
      return jsonError("作品が見つかりません。", 404);
    }

    const data = parseWorkYaml(file.content);
    return Response.json({
      ok: true,
      slug,
      path,
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

  const slug = slugFromParams(context.params as Record<string, string | undefined>);
  if (!slug) return jsonError("作品 slug が不正です。");

  let body: { data?: WorkContent; sha?: string };
  try {
    body = await context.request.json();
  } catch {
    return jsonError("JSON の形式が正しくありません。");
  }

  if (!body.data?.title || !body.data.category || !body.data.date) {
    return jsonError("作品データが不足しています。");
  }

  const path = `${WORKS_DIR}/${slug}.yaml`;

  try {
    const content = stringifyWork(body.data);
    await putRepoFile(
      context.env,
      path,
      content,
      body.sha ?? null,
      `admin: update work ${slug} (${auth.username})`,
    );

    const updated = await getRepoFile(context.env, path);
    return Response.json({
      ok: true,
      message: "作品を保存しました。サイトの再ビルドが始まります。",
      sha: updated?.sha ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました。";
    return jsonError(message, 502);
  }
}
