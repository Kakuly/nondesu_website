export interface ProfileContent {
  shortBio: string;
  longBio: string;
  roles: string[];
  sns: Array<{ label: string; url: string }>;
}

export interface WorkContent {
  title: string;
  category: "music" | "illustration" | "writing";
  tags: string[];
  cover?: string;
  excerpt?: string;
  featured?: boolean;
  date: string;
  embed?: { type: "youtube" | "spotify" | "soundcloud"; id: string };
  gallery?: string[];
  links: Array<{ label: string; url: string }>;
}

function quoteString(value: string): string {
  if (/[:#{}[\],&*!|>'"%@`]|^\s|\s$|^$/.test(value) || value.includes("\n")) {
    return JSON.stringify(value);
  }
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function parseScalar(value: string): string | boolean | number {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseBlockScalar(lines: string[], startIndex: number): { value: string; nextIndex: number } {
  const indent = lines[startIndex].match(/^(\s*)/)?.[1].length ?? 0;
  const contentLines: string[] = [];
  let i = startIndex + 1;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      contentLines.push("");
      i++;
      continue;
    }
    const lineIndent = line.match(/^(\s*)/)?.[1].length ?? 0;
    if (lineIndent <= indent && line.trim() !== "") break;
    contentLines.push(line.slice(indent + 2));
    i++;
  }

  while (contentLines.length > 0 && contentLines[contentLines.length - 1] === "") {
    contentLines.pop();
  }

  return { value: contentLines.join("\n"), nextIndex: i };
}

function parseStringList(lines: string[], startIndex: number): { items: string[]; nextIndex: number } {
  const items: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const match = lines[i].match(/^\s*-\s+(.+)$/);
    if (!match) break;
    items.push(String(parseScalar(match[1])));
    i++;
  }

  return { items, nextIndex: i };
}

function parseObjectList(
  lines: string[],
  startIndex: number,
): { items: Array<Record<string, string>>; nextIndex: number } {
  const items: Array<Record<string, string>> = [];
  let i = startIndex;

  while (i < lines.length) {
    if (!lines[i].match(/^\s*-\s/)) break;
    const item: Record<string, string> = {};
    i++;

    while (i < lines.length) {
      const keyMatch = lines[i].match(/^\s{2,}([a-zA-Z]+):\s*(.*)$/);
      if (!keyMatch) break;
      item[keyMatch[1]] = String(parseScalar(keyMatch[2]));
      i++;
    }

    items.push(item);
  }

  return { items, nextIndex: i };
}

export function parseProfileYaml(text: string): ProfileContent {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const profile: ProfileContent = { shortBio: "", longBio: "", roles: [], sns: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("shortBio:")) {
      profile.shortBio = String(parseScalar(line.slice("shortBio:".length)));
      continue;
    }
    if (line.startsWith("longBio:")) {
      if (line.includes("|")) {
        const block = parseBlockScalar(lines, i);
        profile.longBio = block.value;
        i = block.nextIndex - 1;
      } else {
        profile.longBio = String(parseScalar(line.slice("longBio:".length)));
      }
      continue;
    }
    if (line.startsWith("roles:")) {
      const list = parseStringList(lines, i + 1);
      profile.roles = list.items;
      i = list.nextIndex - 1;
      continue;
    }
    if (line.startsWith("sns:")) {
      const list = parseObjectList(lines, i + 1);
      profile.sns = list.items.map((item) => ({
        label: item.label ?? "",
        url: item.url ?? "",
      }));
      i = list.nextIndex - 1;
    }
  }

  return profile;
}

export function stringifyProfile(data: ProfileContent): string {
  const lines: string[] = [];
  lines.push(`shortBio: ${quoteString(data.shortBio)}`);
  lines.push("longBio: |");
  for (const line of data.longBio.replace(/\r\n/g, "\n").split("\n")) {
    lines.push(`  ${line}`);
  }
  lines.push("roles:");
  for (const role of data.roles) {
    lines.push(`  - ${quoteString(role)}`);
  }
  lines.push("sns:");
  for (const item of data.sns) {
    lines.push(`  - label: ${quoteString(item.label)}`);
    lines.push(`    url: ${item.url}`);
  }
  return `${lines.join("\n")}\n`;
}

export function parseWorkYaml(text: string): WorkContent {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const work: WorkContent = {
    title: "",
    category: "music",
    tags: [],
    links: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("title:")) {
      work.title = String(parseScalar(line.slice("title:".length)));
      continue;
    }
    if (line.startsWith("category:")) {
      work.category = String(parseScalar(line.slice("category:".length))) as WorkContent["category"];
      continue;
    }
    if (line.startsWith("cover:")) {
      work.cover = String(parseScalar(line.slice("cover:".length)));
      continue;
    }
    if (line.startsWith("excerpt:")) {
      work.excerpt = String(parseScalar(line.slice("excerpt:".length)));
      continue;
    }
    if (line.startsWith("featured:")) {
      work.featured = parseScalar(line.slice("featured:".length)) === true;
      continue;
    }
    if (line.startsWith("date:")) {
      work.date = String(parseScalar(line.slice("date:".length)));
      continue;
    }
    if (line.startsWith("tags:")) {
      const list = parseStringList(lines, i + 1);
      work.tags = list.items;
      i = list.nextIndex - 1;
      continue;
    }
    if (line.startsWith("gallery:")) {
      const list = parseStringList(lines, i + 1);
      work.gallery = list.items;
      i = list.nextIndex - 1;
      continue;
    }
    if (line.startsWith("links:")) {
      const list = parseObjectList(lines, i + 1);
      work.links = list.items.map((item) => ({
        label: item.label ?? "",
        url: item.url ?? "",
      }));
      i = list.nextIndex - 1;
      continue;
    }
    if (line.startsWith("embed:")) {
      const embed: { type?: string; id?: string } = {};
      i++;
      while (i < lines.length) {
        const keyMatch = lines[i].match(/^\s{2}([a-zA-Z]+):\s*(.*)$/);
        if (!keyMatch) break;
        embed[keyMatch[1] as "type" | "id"] = String(parseScalar(keyMatch[2]));
        i++;
      }
      if (embed.type && embed.id) {
        work.embed = {
          type: embed.type as NonNullable<WorkContent["embed"]>["type"],
          id: embed.id,
        };
      }
    }
  }

  return work;
}

export function stringifyWork(data: WorkContent): string {
  const lines: string[] = [];
  lines.push(`title: ${quoteString(data.title)}`);
  lines.push(`category: ${data.category}`);
  lines.push("tags:");
  for (const tag of data.tags) {
    lines.push(`  - ${tag}`);
  }
  if (data.featured) {
    lines.push("featured: true");
  }
  lines.push(`date: ${data.date}`);
  if (data.excerpt) {
    lines.push(`excerpt: ${quoteString(data.excerpt)}`);
  }
  if (data.cover) {
    lines.push(`cover: ${quoteString(data.cover)}`);
  }
  if (data.embed?.type && data.embed.id) {
    lines.push("embed:");
    lines.push(`  type: ${data.embed.type}`);
    lines.push(`  id: ${quoteString(data.embed.id)}`);
  }
  if (data.gallery?.length) {
    lines.push("gallery:");
    for (const item of data.gallery) {
      lines.push(`  - ${quoteString(item)}`);
    }
  }
  lines.push("links:");
  for (const link of data.links) {
    lines.push(`  - label: ${quoteString(link.label)}`);
    lines.push(`    url: ${link.url}`);
  }
  return `${lines.join("\n")}\n`;
}
