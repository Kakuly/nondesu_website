import type { PagesEnv } from "./env";
import { timingSafeEqual, verifyPasswordAgainstCredentials } from "./password";

export interface AdminUser {
  username: string;
  password?: string;
  passwordHash?: string;
}

function loadMultiAdminUsers(env: PagesEnv): AdminUser[] {
  const users: AdminUser[] = [];

  const pairs: Array<[string | undefined, string | undefined]> = [
    [env.ADMIN_USER_1, env.ADMIN_PASS_1],
    [env.ADMIN_USER_2, env.ADMIN_PASS_2],
  ];

  for (const [username, password] of pairs) {
    const trimmedUsername = username?.trim();
    if (trimmedUsername && password) {
      users.push({ username: trimmedUsername, password });
    }
  }

  return users;
}

function loadLegacyAdminUser(env: PagesEnv): AdminUser | null {
  const username = env.ADMIN_USERNAME?.trim();
  if (!username) return null;

  if (env.ADMIN_PASSWORD_HASH) {
    return { username, passwordHash: env.ADMIN_PASSWORD_HASH.trim().toLowerCase() };
  }

  if (env.ADMIN_PASSWORD) {
    return { username, password: env.ADMIN_PASSWORD };
  }

  return null;
}

/** Load configured admin users. New-style vars take precedence over legacy single-user vars. */
export function loadAdminUsers(env: PagesEnv): AdminUser[] {
  const multi = loadMultiAdminUsers(env);
  if (multi.length > 0) return multi;

  const legacy = loadLegacyAdminUser(env);
  return legacy ? [legacy] : [];
}

export function adminUsersConfigured(env: PagesEnv): boolean {
  return loadAdminUsers(env).length > 0;
}

export function findAdminUser(username: string, env: PagesEnv): AdminUser | undefined {
  const trimmed = username.trim();
  return loadAdminUsers(env).find((user) => timingSafeEqual(user.username, trimmed));
}

function effectiveCredentials(
  user: AdminUser,
  overrides: Record<string, string>,
): Pick<AdminUser, "password" | "passwordHash"> {
  const override = overrides[user.username];
  if (override) {
    return { password: override };
  }
  return { password: user.password, passwordHash: user.passwordHash };
}

/**
 * Verify login credentials. Returns the matched username on success.
 * Uses timing-safe checks; always runs password verification even when username is wrong.
 */
export async function verifyAdminLogin(
  inputUsername: string,
  password: string,
  env: PagesEnv,
  overrides: Record<string, string> = {},
): Promise<string | null> {
  const users = loadAdminUsers(env);
  if (users.length === 0) return null;

  const trimmed = inputUsername.trim();
  let matched: AdminUser | undefined;

  for (const user of users) {
    if (timingSafeEqual(user.username, trimmed)) {
      matched = user;
      break;
    }
  }

  const target = matched ?? users[0];
  const credentials = effectiveCredentials(target, overrides);
  const valid = await verifyPasswordAgainstCredentials(password, credentials);
  if (!matched || !valid) return null;

  return matched.username;
}
