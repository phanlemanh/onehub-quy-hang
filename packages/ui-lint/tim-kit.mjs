#!/usr/bin/env node
// In đường bản acceptance-gate đang cài cho kho này, đọc từ sổ plugin của Claude Code
// (~/.claude/plugins/installed_plugins.json) — không đoán thư mục cache. Dùng khi CLAUDE_PLUGIN_ROOT vắng (tác tử chấm
// không có biến này): `executors.script.san_m1` đặt biến từ đây rồi gọi thu-san.mjs. Không tìm được → không in gì,
// thu-san.mjs tự dừng có tên.
//
// Thứ tự chọn: bản cài cho chính gốc kho (worktree) → cho checkout chính → bản cài phạm vi người dùng.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function chonBanCai(entries, goc) {
  const co = (e) => e?.installPath && existsSync(e.installPath);
  for (const g of goc) {
    const e = entries.find((x) => x.scope === "project" && x.projectPath && resolve(x.projectPath) === resolve(g));
    if (co(e)) return e.installPath;
  }
  const u = entries.find((x) => x.scope === "user");
  return co(u) ? u.installPath : "";
}

function gocKho(cwd) {
  const git = (...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    const top = git("rev-parse", "--show-toplevel");
    const chung = resolve(top, git("rev-parse", "--git-common-dir"));
    return [top, dirname(chung)];
  } catch {
    return [cwd];
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const so = process.env.QUY_HANG_PLUGIN_REGISTRY ?? `${homedir()}/.claude/plugins/installed_plugins.json`;
  let entries = [];
  try {
    entries = JSON.parse(readFileSync(so, "utf8")).plugins?.["acceptance-gate@acceptance-gate-kit"] ?? [];
  } catch {
    /* không có sổ → không in gì */
  }
  const p = chonBanCai(entries, gocKho(process.cwd()));
  if (p) process.stdout.write(p);
}
