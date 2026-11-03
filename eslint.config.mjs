import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";
import quyHangUi from "./packages/ui-lint/index.mjs";
import { VENDOR_DIRS } from "./packages/ui-lint/lib/vendor.mjs";

// Một cấu hình cho cả kho: luật Next.js cho apps/web, luật TypeScript cho các gói, luật JS cho script .mjs.
// Luật giao diện quy-hang-ui (packages/ui-lint, chuyển từ onehub-invest) áp mức error cho mã giao diện của app, trừ
// thành phần cài nguyên bản bằng shadcn CLI (components/ui, components/reui) — không sửa tay, không bị luật quét.
const WEB = "apps/web/**/*.{ts,tsx}";
const WEB_SRC = "apps/web/src/**/*.{ts,tsx}";
const VENDOR = VENDOR_DIRS.map((d) => `apps/web/src/components/${d}/**`);
const UI_RULES = Object.fromEntries(Object.keys(quyHangUi.rules).map((r) => [`quy-hang-ui/${r}`, "error"]));
const scope = (configs, files) => configs.map((c) => ({ ...c, files }));

export default defineConfig([
  globalIgnores(["**/node_modules/**", "**/.next/**", "**/dist/**", "**/next-env.d.ts"]),
  // Thư mục đợt Điều phối – Thợ chỉ có trên máy (git bỏ qua): bộ lõi chép từ kit, không phải mã của kho.
  globalIgnores([".acceptance-runs/**"]),
  // Mã ReUI cài nguyên bản bằng shadcn CLI: không sửa tay, nên không lint (như onehub-invest). components/ui vẫn
  // chạy luật Next; chỉ luật quy-hang-ui bỏ qua nó (dưới).
  globalIgnores(["apps/web/src/components/reui/**"]),
  ...scope(nextVitals, [WEB]),
  ...scope(nextTs, [WEB]),
  { files: [WEB], settings: { next: { rootDir: "apps/web" } } },
  { files: [WEB_SRC], ignores: VENDOR, plugins: { "quy-hang-ui": quyHangUi }, rules: UI_RULES },
  // Hook cài nguyên bản cùng sidebar của shadcn: đặt state trong effect để đọc bề rộng lần đầu. Sửa tay thì mất đường
  // cập nhật — chỉ tắt đúng luật này cho đúng tệp này.
  { files: ["apps/web/src/hooks/use-mobile.ts"], rules: { "react-hooks/set-state-in-effect": "off" } },
  ...scope(tseslint.configs.recommended, ["packages/**/*.ts"]),
  {
    files: ["**/*.mjs"],
    ...js.configs.recommended,
    languageOptions: { globals: globals.node },
  },
]);
