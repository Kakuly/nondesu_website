import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const works = defineCollection({
  loader: glob({ pattern: "**/*.{md,yml,yaml}", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    category: z.enum(["music", "illustration", "writing"]),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
    date: z.coerce.date(),
    embed: z
      .object({
        type: z.enum(["youtube", "spotify", "soundcloud"]),
        id: z.string(),
      })
      .optional(),
    gallery: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
  }),
});

const profile = defineCollection({
  loader: glob({ pattern: "**/*.{md,yml,yaml}", base: "./src/content/profile" }),
  schema: z.object({
    shortBio: z.string(),
    longBio: z.string(),
    roles: z.array(z.string()),
    sns: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
  }),
});

const releases = defineCollection({
  loader: glob({ pattern: "**/*.{md,yml,yaml}", base: "./src/content/releases" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    slug: z.string(),
    cover: z.string().optional(),
    releaseDate: z.coerce.date().optional(),
    game: z.enum(["collect"]).default("collect"),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        }),
      )
      .default([]),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: "**/*.{md,yml,yaml}", base: "./src/content/events" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    venue: z.string().optional(),
    url: z.string().url().optional(),
    status: z.enum(["upcoming", "past"]).default("upcoming"),
  }),
});

const goods = defineCollection({
  loader: glob({ pattern: "**/*.{md,yml,yaml}", base: "./src/content/goods" }),
  schema: z.object({
    title: z.string(),
    price: z.string().optional(),
    url: z.string().url().optional(),
    image: z.string().optional(),
    available: z.boolean().default(true),
  }),
});

export const collections = { works, profile, releases, events, goods };
