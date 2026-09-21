export interface PagesEnv {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  ADMIN_USER_1?: string;
  ADMIN_PASS_1?: string;
  ADMIN_USER_2?: string;
  ADMIN_PASS_2?: string;
  /** @deprecated Use ADMIN_USER_1 / ADMIN_PASS_1 instead */
  ADMIN_USERNAME?: string;
  /** @deprecated Use ADMIN_PASS_1 instead */
  ADMIN_PASSWORD?: string;
  /** @deprecated Legacy single-user SHA-256 hash */
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
  CONTACT_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export function githubRepo(env: PagesEnv): string {
  return env.GITHUB_REPO ?? "Kakuly/nondesu_website";
}

export function githubBranch(env: PagesEnv): string {
  return env.GITHUB_BRANCH ?? "main";
}
