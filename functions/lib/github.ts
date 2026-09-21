import { githubBranch, githubRepo, type PagesEnv } from "./env";

export interface GitHubFile {
  path: string;
  content: string;
  sha: string;
}

interface GitHubContentsResponse {
  content?: string;
  sha?: string;
  message?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "nondesu-admin",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function decodeContent(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function encodeContent(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function getRepoFile(env: PagesEnv, path: string): Promise<GitHubFile | null> {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }

  const repo = githubRepo(env);
  const branch = githubBranch(env);
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: authHeaders(token) });

  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub GET failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as GitHubContentsResponse;
  if (!data.content || !data.sha) {
    throw new Error("GitHub response missing content or sha.");
  }

  return {
    path,
    content: decodeContent(data.content),
    sha: data.sha,
  };
}

export async function putRepoFile(
  env: PagesEnv,
  path: string,
  content: string,
  sha: string | null,
  message: string,
): Promise<void> {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }

  const repo = githubRepo(env);
  const branch = githubBranch(env);
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const body: Record<string, string> = {
    message,
    content: encodeContent(content),
    branch,
  };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub PUT failed (${response.status}): ${detail}`);
  }
}

export async function listRepoDirectory(env: PagesEnv, dirPath: string): Promise<string[]> {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured.");
  }

  const repo = githubRepo(env);
  const branch = githubBranch(env);
  const url = `https://api.github.com/repos/${repo}/contents/${dirPath}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, { headers: authHeaders(token) });

  if (response.status === 404) return [];
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub list failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as Array<{ name?: string; type?: string }>;
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item.type === "file" && item.name?.match(/\.ya?ml$/i))
    .map((item) => item.name!.replace(/\.ya?ml$/i, ""));
}
