import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://nondesu.com",
  output: "static",
  build: {
    format: "directory",
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
