// Cặp hai chiều của kiem-ho-so.mjs (E9): bản sao hồ sơ lành → đạt; phá đúng một chỗ → đỏ ghim tên.
import { it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const HS = join(DAY, "..");
const CLI = join(DAY, "kiem-ho-so.mjs");
function voi(fn) {
  const d = mkdtempSync(join(tmpdir(), "kiem-ho-so-"));
  try {
    for (const t of ["khuon-so-do.json", "doi-chieu"]) cpSync(join(HS, t), join(d, t), { recursive: true });
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const chay = (d) => spawnSync(process.execPath, [CLI, "--ho-so", d], { encoding: "utf8" });

it("đối chứng dương: bản sao hồ sơ lành → mã 0", () =>
  voi((d) => {
    const r = chay(d);
    assert.equal(r.status, 0, r.stderr);
  }));

it("thiếu khuon-so-do.json → mã 1 nêu tên tệp", () =>
  voi((d) => {
    unlinkSync(join(d, "khuon-so-do.json"));
    const r = chay(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /^khuon-so-do\.json: không có$/m);
  }));

it("kế hoạch thiếu một nhóm → mã 1 nêu đúng nhóm thiếu", () =>
  voi((d) => {
    const p = join(d, "doi-chieu/ke-hoach.json");
    const k = JSON.parse(readFileSync(p, "utf8"));
    k.cap = k.cap.filter((c) => c.nhom !== "trang-tam");
    writeFileSync(p, JSON.stringify(k));
    const r = chay(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /thiếu nhóm trang-tam/);
  }));

it("trang ghép có ô thiếu ảnh → mã 1", () =>
  voi((d) => {
    const p = join(d, "doi-chieu/index.html");
    writeFileSync(p, readFileSync(p, "utf8").replace(/<td><figure>[\s\S]*?<\/figure><\/td>/, '<td class="thieu">thiếu ảnh x--mau.png</td>'));
    const r = chay(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /thiếu ảnh x--mau\.png/);
  }));
