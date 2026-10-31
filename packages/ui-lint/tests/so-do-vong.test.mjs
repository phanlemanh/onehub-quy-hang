// Số đo một vòng giao diện (hồ sơ vong-giao-dien-qua-ban-do, E6–E7). Kho git tạm chép design/patterns và apps/web/src
// thật; các commit của vòng viết trước, mỗi commit một bước của đường «lệch → sửa».
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "so-do-vong.mjs");
const W = "apps/web/src";
const SLUG = "thu-so-do";
const THU = `${W}/app/settings/thu/page.tsx`;
const BAO_CAO = `${W}/app/(app)/bao-cao/page.tsx`;
const NHAN_TRANG_TAM = 'nhan_dien: ["apps/web/src/app/(app)/**/page.tsx", "apps/web/src/app/settings/[section]/page.tsx"]';
const TRANG_TAM = ["today", "me", "team", "shares", "viewings", "exports/new", "imports/new", "leads/new", "units/[code]", "inventory"];

const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
const commit = (d, m) => (git(d, "add", "-A"), git(d, "commit", "-qm", m));
const chay = (d, ...a) => spawnSync(process.execPath, [CLI, "--root", d, "--slug", SLUG, ...a], { encoding: "utf8" });
const soDo = (d) => JSON.parse(readFileSync(join(d, "_acceptance", SLUG, "khuon-so-do.json"), "utf8"));

const MAIN = 'export default function P() {\n  return <main className="min-h-svh">x</main>;\n}\n';
const MUC = 'import { MucCaiDat } from "@/app/settings/khung";\n\nexport default function P() {\n  return <MucCaiDat title="Thử">x</MucCaiDat>;\n}\n';
const BAO_CAO_MD = `---
nhom: bao-cao
doi_tuong: [bao-cao]
khuon: { ten: KhungBaoCao, nhap: "@/components/bao-cao/khung" }
nhan_dien: ["apps/web/src/app/(app)/bao-cao/page.tsx"]
mau_dang_chay: { tep: "apps/web/src/app/(app)/bao-cao/page.tsx", duong: "/bao-cao", trang_thai: [mac-dinh] }
khe_bat_buoc: [title]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-bc-mot]
---
# Báo cáo

- **KH-bc-mot** — Báo cáo dựng qua KhungBaoCao.
`;
const LECH_LOT = `# Lệch lọt

| Ngày | Màn | Lệch chủ sản phẩm thấy | Vòng làm ra |
| --- | --- | --- | --- |
| 2026-10-31 | Thử | khung lệch | \`${SLUG}\` |
| 2026-10-31 | Khác | chữ lệch | vong-khac |
`;

/** Kho thử: <ref> = cây lành + sổ lệch lọt; rồi bốn commit c1…c4 của vòng. */
function kho(fn) {
  const d = mkdtempSync(join(tmpdir(), "so-do-vong-"));
  try {
    for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
    ghi(d, "docs/design/lech-lot.md", LECH_LOT);
    git(d, "init", "-q");
    commit(d, "lanh");
    const ref = git(d, "rev-parse", "HEAD").trim();
    ghi(d, THU, MAIN);
    commit(d, "c1 lệch cai-dat-san");
    ghi(d, THU, MUC);
    commit(d, "c2 sửa");
    const tt = readFileSync(join(d, "design/patterns/trang-tam.md"), "utf8");
    ghi(d, "design/patterns/trang-tam.md", tt.replace(NHAN_TRANG_TAM, `nhan_dien: [${TRANG_TAM.map((m) => `"apps/web/src/app/(app)/${m}/page.tsx"`).join(", ")}, "apps/web/src/app/settings/[section]/page.tsx"]`));
    ghi(d, BAO_CAO, 'import { KhungBaoCao } from "@/components/bao-cao/khung";\n\nexport default function P() {\n  return <KhungBaoCao title="Báo cáo" />;\n}\n');
    commit(d, "c3 màn ngoài bản đồ");
    ghi(d, `${W}/components/bao-cao/khung.tsx`, "export function KhungBaoCao({ title }: { title: string }) {\n  return <section>{title}</section>;\n}\n");
    ghi(d, "design/patterns/bao-cao.md", BAO_CAO_MD);
    commit(d, "c4 mục bản đồ");
    return fn(d, ref);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

describe("so-do-vong — răng bắt, tệp theo khuôn, lệch lọt (E6)", () => {
  it("bốn commit: rang_bat 2 đúng tập, lech_lot 1, tep_theo_khuon đúng tập; worktree tạm được dọn", () =>
    kho((d, ref) => {
      const r = chay(d, "--base", ref, "--write");
      assert.equal(r.status, 0, r.stderr);
      const s = soDo(d);
      assert.equal(s.rang_bat, 2);
      assert.deepEqual(new Set(s.rang_bat_chi_tiet.map((x) => `${x.tep}|${x.nhom}`)), new Set([`${THU}|cai-dat-san`, `${BAO_CAO}|ngoai-ban-do`]));
      assert.equal(s.lech_lot, 1);
      assert.deepEqual(new Set(s.tep_theo_khuon), new Set([THU, BAO_CAO]));
      assert.equal(s.base, ref);
      assert.equal(git(d, "worktree", "list").trim().split("\n").length, 1);
    }));

  it("đối chứng «còn ở HEAD»: c5 làm settings/thu lệch lại như c1 → cặp ấy không tính, rang_bat 1", () =>
    kho((d, ref) => {
      ghi(d, THU, MAIN);
      commit(d, "c5 lệch lại");
      const r = chay(d, "--base", ref, "--write");
      assert.equal(r.status, 0, r.stderr);
      const s = soDo(d);
      assert.equal(s.rang_bat, 1);
      assert.deepEqual(s.rang_bat_chi_tiet.map((x) => x.nhom), ["ngoai-ban-do"]);
      assert.ok(!s.tep_theo_khuon.includes(THU));
    }));
});

describe("so-do-vong — nợ cũ không phải răng bắt (E6)", () => {
  it("lệch có sẵn ở <ref> trong tệp khác, vòng sửa nó ở commit cuối → không tính vào rang_bat", () => {
    const d = mkdtempSync(join(tmpdir(), "so-do-vong-no-"));
    try {
      const U = `${W}/app/settings/users/page.tsx`;
      for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
      const lanh = readFileSync(join(d, U), "utf8");
      git(d, "init", "-q");
      ghi(d, U, MAIN);
      commit(d, "no-cu");
      const ref = git(d, "rev-parse", "HEAD").trim();
      ghi(d, "docs/x.md", "# x\n");
      commit(d, "c1 không chạm Người dùng");
      ghi(d, U, lanh);
      commit(d, "c2 trả nợ");
      const r = chay(d, "--base", ref, "--write");
      assert.equal(r.status, 0, r.stderr);
      assert.equal(soDo(d).rang_bat, 0, JSON.stringify(soDo(d).rang_bat_chi_tiet));
    } finally {
      rmSync(d, { recursive: true, force: true });
    }
  });
});

describe("so-do-vong — số của kit và dòng báo (E7)", () => {
  const RUN_LOG = [
    { ts: "2026-10-31T10:00:00Z", kind: "gio-may", gio_may: 9.9, gio_cho: 9.9, token: { a: { ra: 1 } }, phan_tram_tuan: 1 },
    { ts: "2026-10-31T12:00:00Z", kind: "gio-may", gio_may: 1.5, gio_cho: 0.5, token: { "claude-opus-5-5": { ra: 200 }, "claude-haiku-5-5": { ra: 100 } }, phan_tram_tuan: 31.2 },
  ];
  const SO = [
    { id: "d-1", type: "seal", gate: 1, at: "x" },
    { id: "d-2", type: "revisit", stage: "gate2", decided_by: "[Tên]", decision: "x" },
    { id: "d-3", type: "approach", stage: "gate1", decision: "không có decided_by" },
  ];
  const hoSo = (d, runLog) => {
    ghi(d, `_acceptance/${SLUG}/opportunity.md`, "---\nslug: thu-so-do\nlo_trinh_ma: 60\n---\n");
    ghi(d, `_acceptance/${SLUG}/run-log.jsonl`, runLog.map((x) => JSON.stringify(x)).join("\n") + "\n");
    ghi(d, `_acceptance/${SLUG}/decisions.jsonl`, SO.map((x) => JSON.stringify(x)).join("\n") + "\n");
  };

  it("kho riêng tới c4: khối kit lấy dòng gio-may cuối, gọi người 2; dòng --bao bằng đúng số trong khuon-so-do.json", () =>
    kho((d, ref) => {
      hoSo(d, RUN_LOG);
      const r = chay(d, "--base", ref, "--write", "--bao");
      assert.equal(r.status, 0, r.stderr);
      const s = soDo(d);
      assert.deepEqual(s.kit, { gio_may: 1.5, gio_cho: 0.5, token_ra: 300, phan_tram_tuan: 31.2, luot_goi_nguoi: 2 });
      const bao = r.stdout.split("\n").filter((l) => l.startsWith("quy-hang · "));
      assert.deepEqual(bao, ["quy-hang · hàng 60 · khuôn 2 tệp · răng bắt 2 · lệch lọt 1 · giờ máy 1.5 · giờ chờ 0.5 · token ra 300 · gọi người 2"]);
      // Kho kit công khai: dòng không mang tên hồ sơ hay chữ ngoài nhãn số.
      assert.ok(!bao[0].includes(SLUG));
      assert.match(bao[0], /^quy-hang( · [a-zà-ỹ ]+ [\d.]+(?: tệp)?)+$/u);
      const [, n, k, j] = /khuôn (\d+) tệp · răng bắt (\d+) · lệch lọt (\d+)/.exec(bao[0]).map(Number);
      assert.deepEqual([n, k, j], [s.tep_theo_khuon.length, s.rang_bat, s.lech_lot]);
    }));

  it("thiếu gio-may → mã 0, kit null kèm lý do, dòng --bao «giờ máy chưa đo»", () =>
    kho((d, ref) => {
      hoSo(d, []);
      const r = chay(d, "--base", ref, "--write", "--bao");
      assert.equal(r.status, 0, r.stderr);
      const s = soDo(d);
      assert.equal(s.kit, null);
      assert.match(s.ly_do_kit, /gio-may/);
      assert.ok(r.stdout.includes("giờ máy chưa đo · giờ chờ chưa đo · token ra chưa đo · gọi người 2"), r.stdout);
    }));

  it("từ chối khi không đo được: <ref> không có → mã 2 nêu ref, không ghi tệp; đối chứng ref thật → mã 0", () =>
    kho((d, ref) => {
      const r = chay(d, "--base", "khong-co-ref", "--write");
      assert.equal(r.status, 2);
      assert.ok(r.stderr.includes("khong-co-ref"), r.stderr);
      assert.throws(() => soDo(d));
      assert.equal(chay(d, "--base", ref).status, 0);
    }));
});
