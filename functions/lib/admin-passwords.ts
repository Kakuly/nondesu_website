import type { PagesEnv } from "./env";
import { getRepoFile, putRepoFile } from "./github";
import { findAdminUser, verifyAdminLogin } from "./admin-users";

export const PASSWORD_OVERRIDES_PATH = "src/content/admin/password-overrides.yaml";
export const MIN_PASSWORD_LENGTH = 8;

function parseScalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Parse password-overrides.yaml (minimal schema). */
export function parsePasswordOverridesYaml(content: string): Record<string, string> {
  const overrides: Record<string, string> = {};
  let inOverrides = false;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "overrides: {}" || trimmed === "overrides:{}") {
      return {};
    }

    if (trimmed === "overrides:") {
      inOverrides = true;
      continue;
    }

    if (!inOverrides) continue;

    if (!/^\s/.test(line)) break;

    const match = trimmed.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    overrides[key.trim()] = parseScalar(rawValue);
  }

  return overrides;
}

function quoteYamlString(value: string): string {
  return JSON.stringify(value);
}

export function stringifyPasswordOverridesYaml(overrides: Record<string, string>): string {
  const lines = [
    "# Password overrides — updated via admin UI (/admin/settings/)",
    "# Usernames are defined in Cloudflare env (ADMIN_USER_1, ADMIN_USER_2).",
    "# Env passwords still work until a user changes their password here.",
  ];

  const keys = Object.keys(overrides).sort();
  if (keys.length === 0) {
    lines.push("overrides: {}");
  } else {
    lines.push("overrides:");
    for (const key of keys) {
      lines.push(`  ${key}: ${quoteYamlString(overrides[key])}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

/** Load password overrides from GitHub. Falls back to empty when token or file is missing. */
export async function loadPasswordOverrides(env: PagesEnv): Promise<Record<string, string>> {
  if (!env.GITHUB_TOKEN?.trim()) return {};

  try {
    const file = await getRepoFile(env, PASSWORD_OVERRIDES_PATH);
    if (!file) return {};
    return parsePasswordOverridesYaml(file.content);
  } catch {
    return {};
  }
}

export interface PasswordOverrideFile {
  content: string;
  sha: string | null;
}

export async function getPasswordOverrideFile(env: PagesEnv): Promise<PasswordOverrideFile> {
  const file = await getRepoFile(env, PASSWORD_OVERRIDES_PATH);
  if (!file) {
    return {
      content: stringifyPasswordOverridesYaml({}),
      sha: null,
    };
  }
  return { content: file.content, sha: file.sha };
}

export async function changeAdminPassword(
  username: string,
  currentPassword: string,
  newPassword: string,
  env: PagesEnv,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!env.GITHUB_TOKEN?.trim()) {
    return { ok: false, message: "GITHUB_TOKEN が未設定のためパスワードを保存できません。" };
  }

  const user = findAdminUser(username, env);
  if (!user) {
    return { ok: false, message: "アカウントが見つかりません。" };
  }

  const overrides = await loadPasswordOverrides(env);
  const verified = await verifyAdminLogin(username, currentPassword, env, overrides);
  if (!verified) {
    return { ok: false, message: "現在のパスワードが正しくありません。" };
  }

  const trimmedNew = newPassword.trim();
  if (trimmedNew.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `新しいパスワードは ${MIN_PASSWORD_LENGTH} 文字以上にしてください。`,
    };
  }

  if (trimmedNew === currentPassword) {
    return { ok: false, message: "新しいパスワードは現在のパスワードと異なるものにしてください。" };
  }

  const nextOverrides = { ...overrides, [username]: trimmedNew };
  const { sha } = await getPasswordOverrideFile(env);
  const nextContent = stringifyPasswordOverridesYaml(nextOverrides);

  try {
    await putRepoFile(
      env,
      PASSWORD_OVERRIDES_PATH,
      nextContent,
      sha,
      `admin: update password (${username})`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました。";
    return { ok: false, message };
  }

  return { ok: true };
}
