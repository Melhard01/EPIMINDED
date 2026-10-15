/**
 * Vitest root config.
 *
 * vite.config.ts sets `root: client/` for the app build, which makes Vitest
 * look for tests under client/ and find none. This keeps the test root at the
 * repository root so specs can import from server/, worker/ and client/ alike.
 */
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
      "@shared": resolve(__dirname, "shared"),
    },
  },
  test: {
    root: __dirname,
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
