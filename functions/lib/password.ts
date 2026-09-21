function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(
  password: string,
  env: { ADMIN_PASSWORD?: string; ADMIN_PASSWORD_HASH?: string },
): Promise<boolean> {
  if (env.ADMIN_PASSWORD_HASH) {
    const hash = await hashPassword(password);
    return timingSafeEqual(hash, env.ADMIN_PASSWORD_HASH.trim().toLowerCase());
  }

  if (env.ADMIN_PASSWORD) {
    return timingSafeEqual(password, env.ADMIN_PASSWORD);
  }

  return false;
}
