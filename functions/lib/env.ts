export interface PagesEnv {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
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
