#!/usr/bin/env node
// Bài thử sàn thiết kế M1 (hồ sơ tang-5-giao-dien, executors.script.san_m1) — chạy ở bước chấm, không ở CI (cần kit).
//   1. Kit tìm qua CLAUDE_PLUGIN_ROOT (như product_map); vắng → thoát 2, không đoán đường cache.
//   2. design-floor-bac.mjs trên kho thật phải ra M1.
//   3. Kho tạm ngoài cây kho, chép NGUYÊN _acceptance/config.yaml thật: commit mốc trên main, nhánh thử chạm
//      apps/web/src/app/thu.tsx — có #ff0000 → design-floor-s4.mjs mã 2; cùng tệp đổi sang bg-primary → mã 0.
//
//   node packages/ui-lint/thu-san.mjs [--root <kho>]      0 đạt · 1 lệch · 2 thiếu kit
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const a = process.argv.slice(2);
const root = a.includes("--root") ? a[a.lastIndexOf("--root") + 1] : join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const kit = process.env.CLAUDE_PLUGIN_ROOT;
const BAC = kit && join(kit, "scripts", "design-floor-bac.mjs");
const S4 = kit && join(kit, "scripts", "design-floor-s4.mjs");
if (!kit || !existsSync(BAC) || !existsSync(S4)) {
  console.error("thiếu CLAUDE_PLUGIN_ROOT (bản acceptance-gate có scripts/design-floor-s4.mjs) — không chạy được bài thử sàn");
  process.exit(2);
}

const lech = [];
const bac = JSON.parse(execFileSync("node", [BAC, "--root", root, "--json"], { encoding: "utf8" }));
if (bac.bac !== "M1") lech.push(`bậc design-floor của kho là ${bac.bac}, không phải M1 (${bac.ly_do ?? ""})`);

const tam = realpathSync(mkdtempSync(join(tmpdir(), "thu-san-")));
const git = (...x) => execFileSync("git", x, { cwd: tam, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const san = () => spawnSync("node", [S4, "--root", tam, "--base", "main"], { encoding: "utf8" });
try {
  git("init", "-q", "-b", "main");
  git("config", "user.email", "thu@example.invalid");
  git("config", "user.name", "Thu");
  mkdirSync(join(tam, "_acceptance"), { recursive: true });
  cpSync(join(root, "_acceptance/config.yaml"), join(tam, "_acceptance/config.yaml"));
  mkdirSync(join(tam, "apps/web/src/app"), { recursive: true });
  writeFileSync(join(tam, "apps/web/src/app/page.tsx"), "export default function P() { return null; }\n");
  git("add", ".");
  git("commit", "-q", "-m", "mốc");
  git("checkout", "-q", "-b", "thu");
  const tep = join(tam, "apps/web/src/app/thu.tsx");
  writeFileSync(tep, 'export const T = () => <div style={{ color: "#ff0000" }} />;\n');
  git("add", ".");
  git("commit", "-q", "-m", "chạm tệp giao diện có hex thô");
  const do_ = san();
  if (do_.status !== 2) lech.push(`ca hex thô: design-floor-s4 trả ${do_.status}, kỳ vọng 2 — ${do_.stdout}${do_.stderr}`.trim());
  writeFileSync(tep, 'export const T = () => <div className="bg-primary" />;\n');
  git("commit", "-q", "-am", "đổi sang token");
  const xanh = san();
  if (xanh.status !== 0) lech.push(`ca token: design-floor-s4 trả ${xanh.status}, kỳ vọng 0 — ${xanh.stdout}${xanh.stderr}`.trim());
  if (!lech.length) console.log(`bậc: ${bac.bac} · sàn: hex → ${do_.status}, token → ${xanh.status}`);
} finally {
  rmSync(tam, { recursive: true, force: true });
}
for (const l of lech) console.error(l);
process.exit(lech.length ? 1 : 0);
