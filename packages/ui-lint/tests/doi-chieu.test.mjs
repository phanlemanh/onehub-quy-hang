// Đối chiếu màn mới cạnh màn mẫu (hồ sơ vong-giao-dien-qua-ban-do, E1, E2, E3a). Kho git tạm chép design/patterns và
// apps/web/src thật; lệnh chạy bằng tiến trình con.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { docBanDo } from "../lib/ban-do.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const CLI = join(PKG, "doi-chieu.mjs");
const W = "apps/web/src";
const SLUG = "thu-doi-chieu";
const USERS = `${W}/app/settings/users/page.tsx`;
const LOGIN = `${W}/app/(auth)/login/page.tsx`;
const THU = `${W}/app/settings/thu/page.tsx`;

const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
function kho(fn) {
  const d = mkdtempSync(join(tmpdir(), "doi-chieu-"));
  try {
    for (const t of ["design/patterns", W]) cpSync(join(ROOT, t), join(d, t), { recursive: true });
    git(d, "init", "-q");
    git(d, "add", "-A");
    git(d, "commit", "-qm", "lanh");
    return fn(d, git(d, "rev-parse", "HEAD").trim());
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
const them = (d, t, s) => writeFileSync(join(d, t), readFileSync(join(d, t), "utf8") + s);
const chay = (d, ...a) => spawnSync(process.execPath, [CLI, "--root", d, ...a], { encoding: "utf8" });
const keHoach = (d) => JSON.parse(readFileSync(join(d, "_acceptance", SLUG, "doi-chieu/ke-hoach.json"), "utf8"));
const khoa = (c) => `${c.nhom}|${c.trang_thai}|${c.kho}|${c.tep_moi}`;

/** PNG 1×1 một màu — mỗi ảnh một màu để so byte theo cặp. */
function png(r, g, b) {
  const crc = (buf) => {
    let c = ~0;
    for (const x of buf) {
      c ^= x;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(Buffer.from([0, r, g, b]))), chunk("IEND", Buffer.alloc(0))]);
}

// Ma trận viết trước (E1): trạng thái lấy từ bản đồ thật của kho, khổ 1440 và 375.
const TT = { "cai-dat-san": ["mac-dinh", "khong-quyen", "loi"], "xac-thuc": ["mac-dinh", "loi"] };
const MONG = new Set(
  [
    ["cai-dat-san", USERS],
    ["xac-thuc", LOGIN],
  ].flatMap(([n, t]) => TT[n].flatMap((tt) => [1440, 375].map((k) => `${n}|${tt}|${k}|${t}`))),
);

describe("doi-chieu --base (E1)", () => {
  it("sửa Người dùng và đăng nhập → đúng 10 cặp viết trước, đủ trường, tên ảnh đúng khuôn", () =>
    kho((d, ref) => {
      them(d, USERS, "\n// sửa\n");
      them(d, LOGIN, "\n// sửa\n");
      const r = chay(d, "--base", ref, "--slug", SLUG);
      assert.equal(r.status, 0, r.stderr);
      const { cap } = keHoach(d);
      assert.deepEqual(new Set(cap.map(khoa)), MONG);
      assert.equal(cap.length, 10);
      const bd = docBanDo(ROOT);
      for (const c of cap) {
        const mau = bd.nhom.find((g) => g.data.nhom === c.nhom).data.mau_dang_chay;
        assert.deepEqual(c.mau, { tep: mau.tep, duong: mau.duong });
        assert.equal(c.anh_moi, `${c.nhom}--${c.trang_thai}--${c.kho}--moi.png`);
        assert.equal(c.anh_mau, `${c.nhom}--${c.trang_thai}--${c.kho}--mau.png`);
      }
      assert.equal(r.stdout.trim().split("\n").length, 10);
    }));

  it("màn mới chưa git add sinh đủ 6 cặp của nó; tệp chưa theo dõi dưới docs/ không sinh cặp nào", () =>
    kho((d, ref) => {
      ghi(d, THU, 'import { MucCaiDat } from "@/app/settings/khung";\n\nexport default function P() {\n  return <MucCaiDat title="Thử">x</MucCaiDat>;\n}\n');
      ghi(d, "docs/moi.md", "# x\n");
      const r = chay(d, "--base", ref, "--slug", SLUG);
      assert.equal(r.status, 0, r.stderr);
      const { cap } = keHoach(d);
      assert.equal(cap.length, 6);
      assert.ok(cap.every((c) => c.tep_moi === THU && c.nhom === "cai-dat-san"));
    }));

  it("im: vòng chỉ sửa docs/ và _acceptance/ → một dòng, không ghi tệp, mã 0", () =>
    kho((d, ref) => {
      ghi(d, "docs/x.md", "# x\n");
      ghi(d, "_acceptance/y/z.md", "# y\n");
      const r = chay(d, "--base", ref, "--slug", SLUG);
      assert.equal(r.status, 0);
      assert.equal(r.stdout.trim(), "đối chiếu: vòng không chạm màn của nhóm nào");
      assert.ok(!existsSync(join(d, "_acceptance", SLUG, "doi-chieu/ke-hoach.json")));
    }));
});

describe("doi-chieu --dung (E2)", () => {
  it("đủ ảnh → 10 hàng, mỗi hàng đúng ảnh mới và ảnh mẫu của cặp ấy; xoá một ảnh mẫu → đỏ đúng ô", () =>
    kho((d, ref) => {
      them(d, USERS, "\n// sửa\n");
      them(d, LOGIN, "\n// sửa\n");
      assert.equal(chay(d, "--base", ref, "--slug", SLUG).status, 0);
      const { cap } = keHoach(d);
      const dir = join(d, "_acceptance", SLUG, "doi-chieu");
      const anh = new Map();
      cap.forEach((c, i) => {
        for (const [ten, k] of [
          [c.anh_moi, 0],
          [c.anh_mau, 1],
        ]) {
          if (anh.has(ten)) continue;
          const b = png(i * 20, k * 200, 7);
          anh.set(ten, b);
          writeFileSync(join(dir, ten), b);
        }
      });
      const r = chay(d, "--dung", SLUG);
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), "đối chiếu: 10 cặp đủ");
      const html = readFileSync(join(dir, "index.html"), "utf8");
      const hang = [...html.matchAll(/<tr data-cap="(\d+)">([\s\S]*?)<\/tr>/g)];
      assert.equal(hang.length, 10);
      for (const [, i, h] of hang) {
        const c = cap[Number(i)];
        const src = [...h.matchAll(/<img src="data:image\/png;base64,([^"]+)" width="(\d+)"/g)];
        assert.equal(src.length, 2);
        assert.ok(Buffer.from(src[0][1], "base64").equals(anh.get(c.anh_moi)), `hàng ${i}: ảnh mới không phải của cặp`);
        assert.ok(Buffer.from(src[1][1], "base64").equals(anh.get(c.anh_mau)), `hàng ${i}: ảnh mẫu không phải của cặp`);
        assert.equal(src[0][2], src[1][2]);
        assert.ok(h.includes(`màn mới · ${c.tep_moi}`) && h.includes(`màn mẫu · ${c.mau.duong}`));
      }
      // Chiều đỏ.
      const mat = "cai-dat-san--loi--375--mau.png";
      unlinkSync(join(dir, mat));
      const r2 = chay(d, "--dung", SLUG);
      assert.equal(r2.status, 1);
      assert.ok(r2.stderr.includes(mat), r2.stderr);
      const html2 = readFileSync(join(dir, "index.html"), "utf8");
      const i = cap.findIndex((c) => c.anh_mau === mat);
      const h2 = [...html2.matchAll(/<tr data-cap="(\d+)">([\s\S]*?)<\/tr>/g)];
      for (const [, j, h] of h2) {
        const thieu = h.includes(`thiếu ảnh ${mat}`);
        assert.equal(thieu, Number(j) === i, `hàng ${j}`);
        if (Number(j) !== i) assert.equal((h.match(/<img /g) ?? []).length, 2);
      }
    }));
});

describe("doi-chieu --mau (E3a)", () => {
  it("kế hoạch màn mẫu phủ đúng tập nhóm của bản đồ, đường và trạng thái rút từ bản đồ, chỉ ảnh mẫu", () =>
    kho((d) => {
      const r = chay(d, "--mau", "--slug", SLUG);
      assert.equal(r.status, 0, r.stderr);
      const { cap } = keHoach(d);
      const bd = docBanDo(d);
      assert.deepEqual(new Set(cap.map((c) => c.nhom)), new Set(bd.nhom.map((g) => g.data.nhom)));
      for (const g of bd.nhom) {
        const m = g.data.mau_dang_chay;
        const cua = cap.filter((c) => c.nhom === g.data.nhom);
        assert.equal(cua.length, m.trang_thai.length * 2);
        assert.ok(cua.every((c) => c.mau.duong === m.duong && c.mau.tep === m.tep && c.anh_moi === null && c.tep_moi === null));
        assert.deepEqual(new Set(cua.map((c) => c.trang_thai)), new Set(m.trang_thai));
      }
    }));
});
