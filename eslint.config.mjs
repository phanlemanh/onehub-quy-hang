import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

// Một cấu hình cho cả kho: luật Next.js cho apps/web, luật TypeScript cho các gói, luật JS cho script .mjs.
// Luật UI dùng chung (gói lint UI tách từ onehub-invest) gắn vào khi dựng màn đầu tiên.
const WEB = "apps/web/**/*.{ts,tsx}";
const scope = (configs, files) => configs.map((c) => ({ ...c, files }));

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/.next/**", "**/dist/**", "**/next-env.d.ts"]),
  ...scope(nextVitals, [WEB]),
  ...scope(nextTs, [WEB]),
  { files: [WEB], settings: { next: { rootDir: "apps/web" } } },
  ...scope(tseslint.configs.recommended, ["packages/**/*.ts"]),
  {
    files: ["**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: { globals: globals.node },
  },
]);
