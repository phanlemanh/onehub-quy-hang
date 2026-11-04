// Ảnh chuẩn của hệ bố cục, khoá bo_cuc của bản đồ và cặp đối chiếu với ảnh chuẩn (hàng 91, AC-8, E8). Ca «cây thật»
// đọc chính kho; mỗi ca đỏ chép vật thật sang thư mục tạm, kiểm bản sao lành trước, rồi phá đúng một chỗ.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { anhPhaiCo, beRongPng, kiemAnhChuan, THU_MUC_ANH_CHUAN } from "../lib/anh-chuan.mjs";
import { docBanDo, kieuBoCuc } from "../lib/ban-do.mjs";
import { keHoachDoiChieu } from "../lib/doi-chieu.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const W = "apps/web/src";
const CATALOG = ".agents/skills/quy-hang-ui/catalog.md";
const MA_TRAN = `${W}/components/bo-cuc/ma-tran.ts`;

function banSao(tep) {
  const d = mkdtempSync(join(tmpdir(), "anh-chuan-"));
  for (const t of tep) cpSync(join(ROOT, t), join(d, t), { recursive: true });
  return d;
}
function voi(tep, fn) {
  const d = banSao(tep);
  try {
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const ghi = (d, t, s) => (mkdirSync(dirname(join(d, t)), { recursive: true }), writeFileSync(join(d, t), s));
function sua(d, t, cu, moi) {
  const s = readFileSync(join(d, t), "utf8");
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.replace(cu, moi));
}

// Bảy mã viết trước, theo ADR-0024 quyết định 2.
const BAY = ["tran", "danh-sach-chi-tiet", "doc", "ho-so", "bang-dieu-khien", "luong-nhieu-buoc", "dong-tin"];

describe("ảnh chuẩn", () => {
  it("ảnh chuẩn: đủ 21", () => {
    assert.deepEqual(kieuBoCuc(ROOT), BAY);
    const r = kiemAnhChuan(ROOT);
    assert.deepEqual(r.loi, []);
    assert.equal(r.sang, 21);
    assert.equal(r.toi, 7);
    assert.equal(r.ke, 28);
    // Bề rộng đọc lại độc lập với bộ kiểm: tên tệp mang khổ.
    for (const a of anhPhaiCo(ROOT)) assert.equal(beRongPng(readFileSync(join(ROOT, THU_MUC_ANH_CHUAN, a.tep))), Number(/-(\d+)(?:-toi)?\.png$/.exec(a.tep)[1]), a.tep);
  });

  const VAT = [THU_MUC_ANH_CHUAN, CATALOG, MA_TRAN];
  it("đối chứng: bản sao lành 0 lỗi; xoá một ảnh → lỗi gọi tên ảnh", () =>
    voi(VAT, (d) => {
      assert.deepEqual(kiemAnhChuan(d).loi, [], "đối chứng dương");
      unlinkSync(join(d, THU_MUC_ANH_CHUAN, "ho-so-375.png"));
      assert.deepEqual(kiemAnhChuan(d).loi, [`ảnh chuẩn thiếu: ${THU_MUC_ANH_CHUAN}/ho-so-375.png`]);
    }));
  it("đối chứng: ảnh sai khổ → lỗi bề rộng", () =>
    voi(VAT, (d) => {
      cpSync(join(d, THU_MUC_ANH_CHUAN, "doc-375.png"), join(d, THU_MUC_ANH_CHUAN, "doc-1024.png"));
      assert.deepEqual(kiemAnhChuan(d).loi, ["ảnh chuẩn doc-1024.png: bề rộng 375, phải là 1024"]);
    }));
  it("đối chứng: thiếu tấm tối → lỗi gọi tên", () =>
    voi(VAT, (d) => {
      unlinkSync(join(d, THU_MUC_ANH_CHUAN, "dong-tin-1440-toi.png"));
      assert.deepEqual(kiemAnhChuan(d).loi, [`ảnh chuẩn thiếu: ${THU_MUC_ANH_CHUAN}/dong-tin-1440-toi.png`]);
    }));
  it("đối chứng: ke.json mất một dòng → lỗi đếm và gọi tên tấm", () =>
    voi(VAT, (d) => {
      const p = join(d, THU_MUC_ANH_CHUAN, "ke.json");
      writeFileSync(p, JSON.stringify(JSON.parse(readFileSync(p, "utf8")).filter((k) => k.tep !== "tran-375.png"), null, 2));
      assert.deepEqual(kiemAnhChuan(d).loi, ["ke.json: 27 dòng, phải là 28", "ke.json: tran-375.png có 0 dòng, phải là 1"]);
    }));
  it("đối chứng: danh mục mất dòng của một bố cục → lỗi gọi tên bố cục", () =>
    voi(VAT, (d) => {
      const p = join(d, CATALOG);
      writeFileSync(p, readFileSync(p, "utf8").split("\n").filter((l) => !l.startsWith("| Luồng nhiều bước |")).join("\n"));
      assert.deepEqual(kiemAnhChuan(d).loi, ["catalog.md: mục ảnh chuẩn thiếu dòng của bố cục luong-nhieu-buoc"]);
    }));
});

// Nhóm đơn vị màn dưới (app) khai bo_cuc — bảng viết trước theo cột «Bố cục» của vo-va-ia.md §2.
const BO_CUC_NHOM = {
  "bang-hang": "tran",
  "cai-dat-san": "doc",
  "cuoc-goi": "ho-so",
  gui: "luong-nhieu-buoc",
  "ho-so-can": "ho-so",
  "hom-nay-dau-chu": "tran",
  "lead-cua-toi": "danh-sach-chi-tiet",
  "o-nhan-lead": "doc",
  toi: "doc",
  "trang-tam": "doc",
};

describe("bản đồ: khoá bo_cuc", () => {
  it("bản đồ: khoá bo_cuc", () => {
    const b = docBanDo(ROOT);
    assert.deepEqual(b.loi, []);
    const duoiApp = b.nhom.filter((g) => g.donVi === "man" && g.data.nhan_dien.some((gl) => gl.startsWith(`${W}/app/(app)/`)));
    assert.deepEqual(Object.fromEntries(duoiApp.map((g) => [g.data.nhom, g.data.bo_cuc])), BO_CUC_NHOM);
    for (const g of duoiApp) assert.ok(BAY.includes(g.data.bo_cuc), g.data.nhom);
  });
  it("mã lạ → lỗi đọc ghim «bo_cuc lạ»; đối chứng: mã đúng thì 0 lỗi", () =>
    voi(["design/patterns", W], (d) => {
      assert.deepEqual(docBanDo(d).loi, [], "đối chứng dương");
      sua(d, "design/patterns/cai-dat-san.md", "\nbo_cuc: doc", "\nbo_cuc: hai-cot");
      const { loi } = docBanDo(d);
      assert.equal(loi.length, 1, JSON.stringify(loi));
      assert.match(loi[0], /^cai-dat-san\.md: bo_cuc lạ: «hai-cot»/);
    }));
});

// Nhóm mới khai bo_cuc, màn mẫu chính là màn vòng này dựng.
const THU = `${W}/app/(app)/thu-moi/page.tsx`;
const THU_MD = `---
nhom: thu-moi
doi_tuong: [thu]
khuon: { ten: KhungThu, nhap: "@/components/thu-moi/khung" }
nhan_dien: ["${THU}"]
mau_dang_chay: { tep: "${THU}", duong: "/thu-moi", trang_thai: [mac-dinh, loi] }
khe_bat_buoc: [title]
cam_ngoai_khuon: [Card]
ngoai_le: []
luat: [KH-thu-mot]
bo_cuc: doc
---
# Thử

- **KH-thu-mot** — Màn thử dựng qua KhungThu.
`;
function nhomMoi(d, { boCuc = true } = {}) {
  ghi(d, `${W}/components/thu-moi/khung.tsx`, "export function KhungThu({ title }: { title: string }) {\n  return <section>{title}</section>;\n}\n");
  ghi(d, THU, 'import { KhungThu } from "@/components/thu-moi/khung";\n\nexport default function P() {\n  return <KhungThu title="Thử" />;\n}\n');
  ghi(d, "design/patterns/thu-moi.md", boCuc ? THU_MD : THU_MD.replace("bo_cuc: doc\n", ""));
  // Trang tạm phủ mọi page.tsx dưới (app): màn mới khai rời trang tạm (KH-tt-roi-nhom).
  sua(d, "design/patterns/trang-tam.md", "ngoai_le: [{", `ngoai_le: [{ tep: "${THU}", ly_do: "Màn thử rời trang tạm." }, {`);
  const b = docBanDo(d);
  assert.deepEqual(b.loi, [], "bản đồ thử phải đọc 0 lỗi");
  return b;
}
const gon = (cap) => cap.map((c) => [c.nhom, c.trang_thai, c.kho, c.tep_moi, c.anh_chuan ?? null, c.anh_mau]);

describe("đối chiếu: cặp ảnh chuẩn", () => {
  it("đối chiếu: cặp ảnh chuẩn", () =>
    voi(["design/patterns", W], (d) => {
      const b = nhomMoi(d);
      assert.deepEqual(gon(keHoachDoiChieu(d, b, [THU], () => false)), [
        ["thu-moi", "mac-dinh", 1440, THU, "design/anh-chuan/doc-1440.png", null],
        ["thu-moi", "mac-dinh", 375, THU, "design/anh-chuan/doc-375.png", null],
      ]);
    }));
  it("đối chứng: màn mẫu đã có ở base → cặp với màn mẫu, không ảnh chuẩn", () =>
    voi(["design/patterns", W], (d) => {
      const b = nhomMoi(d);
      const cap = keHoachDoiChieu(d, b, [THU], () => true);
      assert.equal(cap.length, 4);
      assert.ok(cap.every((c) => !c.anh_chuan && c.anh_mau.startsWith("thu-moi--")), JSON.stringify(cap));
    }));
  it("đối chứng: nhóm không khai bo_cuc → không ảnh chuẩn", () =>
    voi(["design/patterns", W], (d) => {
      const b = nhomMoi(d, { boCuc: false });
      assert.ok(keHoachDoiChieu(d, b, [THU], () => false).every((c) => !c.anh_chuan));
    }));

  const CLI = join(PKG, "doi-chieu.mjs");
  const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
  it("lệnh: --base lập cặp ảnh chuẩn, --dung đọc ảnh chuẩn ở gốc kho; xoá ảnh chuẩn → đỏ gọi tên", () =>
    voi(["design/patterns", W, THU_MUC_ANH_CHUAN], (d) => {
      git(d, "init", "-q");
      git(d, "add", "-A");
      git(d, "commit", "-qm", "lanh");
      const ref = git(d, "rev-parse", "HEAD").trim();
      nhomMoi(d);
      const chay = (...a) => spawnSync(process.execPath, [CLI, "--root", d, ...a], { encoding: "utf8" });
      assert.equal(chay("--base", ref, "--slug", "thu").status, 0);
      const { cap } = JSON.parse(readFileSync(join(d, "_acceptance/thu/doi-chieu/ke-hoach.json"), "utf8"));
      assert.deepEqual(cap.map((c) => c.anh_chuan), ["design/anh-chuan/doc-1440.png", "design/anh-chuan/doc-375.png"]);
      for (const c of cap) cpSync(join(d, c.anh_chuan), join(d, "_acceptance/thu/doi-chieu", c.anh_moi));
      const du = chay("--dung", "thu");
      assert.equal(du.status, 0, du.stderr);
      assert.match(readFileSync(join(d, "_acceptance/thu/doi-chieu/index.html"), "utf8"), /ảnh chuẩn · design\/anh-chuan\/doc-375\.png/);
      unlinkSync(join(d, "design/anh-chuan/doc-375.png"));
      const thieu = chay("--dung", "thu");
      assert.equal(thieu.status, 1);
      assert.equal(thieu.stderr.trim(), "thiếu ảnh design/anh-chuan/doc-375.png");
    }));
});
