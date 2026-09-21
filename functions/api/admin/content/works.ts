import { jsonError, requireAdmin, type AdminContext } from "../../../lib/admin-auth";
import { getRepoFile, listRepoDirectory } from "../../../lib/github";
import { parseWorkYaml } from "../../../lib/yaml-content";

const WORKS_DIR = "src/content/works";

export async function onRequestGet(context: AdminContext): Promise<Response> {
  const auth = await requireAdmin(context);
  if (!auth.ok) return auth.response;

  try {
    const slugs = await listRepoDirectory(context.env, WORKS_DIR);
    const works = await Promise.all(
      slugs.map(async (slug) => {
        const file = await getRepoFile(context.env, `${WORKS_DIR}/${slug}.yaml`);
        if (!file) {
          return { slug, title: slug, category: "music", featured: false, date: "" };
        }
        const data = parseWorkYaml(file.content);
        return {
          slug,
          title: data.title,
          category: data.category,
          featured: Boolean(data.featured),
          date: data.date,
        };
      }),
    );

    works.sort((a, b) => (a.date < b.date ? 1 : -1));

    return Response.json({ ok: true, works });
  } catch (error) {
    const message = error instanceof Error ? error.message : "作品一覧の取得に失敗しました。";
    return jsonError(message, 502);
  }
}
