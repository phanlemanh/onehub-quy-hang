// Bản đồ hệ thiết kế (hàng 91, AC-10): bảng ở skill quy-hang-ui phủ mỗi tệp khớp mẫu đúng một dòng, lớp thuộc danh sách
// đóng, docs/README.md trỏ sang bảng. Bản sao chép đúng các tệp bảng trỏ tới, phá một chỗ mỗi ca, thông điệp ghim tệp.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo } from "../lib/ban-do.mjs";
import { kiemBoCuc } from "../lib/bo-cuc.mjs";
import { docBanDoHeThietKe, kiemBanDoHeThietKe, LOP, SKILL, tepBanDoHeThietKe, tepHeThietKe } from "../lib/ban-do-he-thiet-ke.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function voi(fn) {
  const d = mkdtempSync(join(tmpdir(), "he-thiet-ke-"));
  try {
    for (const t of tepBanDoHeThietKe(ROOT)) cpSync(join(ROOT, t), join(d, t));
    assert.deepEqual(kiemBanDoHeThietKe(d).loi, [], "đối chứng dương: bản sao lành phải 0 lỗi");
    fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
function sua(d, t, cu, moi) {
  const s = readFileSync(join(d, t), "utf8");
  assert.ok(s.includes(cu), `bản sao ${t} không có đoạn cần phá: ${cu}`);
  writeFileSync(join(d, t), s.split(cu).join(moi));
}

describe("bản đồ hệ thiết kế", () => {
  it("bản đồ hệ thiết kế: mỗi tệp một dòng", () => {
    const bd = docBanDoHeThietKe(readFileSync(join(ROOT, SKILL), "utf8"));
    const cay = tepHeThietKe(ROOT, bd.mau, bd.bo);
    assert.ok(cay.length >= 60, `chỉ thấy ${cay.length} tệp hệ thiết kế`);
    assert.deepEqual(bd.dong.map((x) => x.tep).sort(), cay, "bảng và cây phải trùng từng tệp");
    for (const x of bd.dong) assert.ok(LOP.includes(x.lop), `${x.tep}: lớp «${x.lop}»`);
    assert.equal(LOP.length, 10);
    assert.deepEqual(kiemBanDoHeThietKe(ROOT).loi, []);
  });

  it("đối chứng: xoá một dòng thì đỏ gọi tên tệp", () =>
    voi((d) => {
      const s = readFileSync(join(d, SKILL), "utf8");
      const dong = s.split("\n").find((x) => x.endsWith("`apps/web/src/components/bo-cuc/ngan-noi.tsx` |"));
      assert.ok(dong);
      writeFileSync(join(d, SKILL), s.replace(`${dong}\n`, ""));
      assert.deepEqual(kiemBanDoHeThietKe(d).loi, [`bản đồ hệ thiết kế: thiếu dòng: apps/web/src/components/bo-cuc/ngan-noi.tsx — thêm vào bảng ở ${SKILL}`]);
    }));

  it("đối chứng: tệp mới khớp mẫu mà không có dòng thì đỏ gọi tên tệp", () =>
    voi((d) => {
      writeFileSync(join(d, "apps/web/src/components/bo-cuc/thu.tsx"), "export function Thu() {\n  return null;\n}\n");
      assert.deepEqual(kiemBanDoHeThietKe(d).loi, [`bản đồ hệ thiết kế: thiếu dòng: apps/web/src/components/bo-cuc/thu.tsx — thêm vào bảng ở ${SKILL}`]);
    }));

  it("đối chứng: lớp ngoài danh sách thì đỏ", () =>
    voi((d) => {
      sua(d, SKILL, "| nhãn | Từ vựng", "| màu | Từ vựng");
      const l = kiemBanDoHeThietKe(d).loi;
      assert.equal(l.length, 1, JSON.stringify(l));
      assert.match(l[0], /«CONTEXT\.md» lớp «màu» ngoài danh sách/);
    }));

  it("README trỏ bảng", () => {
    assert.match(readFileSync(join(ROOT, "docs/README.md"), "utf8"), /\]\([^)]*\.agents\/skills\/quy-hang-ui\/SKILL\.md#bản-đồ-hệ-thiết-kế\)/);
    assert.match(readFileSync(join(ROOT, SKILL), "utf8"), /^## Bản đồ hệ thiết kế$/m);
  });

  it("đối chứng: README không trỏ bảng thì đỏ", () =>
    voi((d) => {
      sua(d, "docs/README.md", "SKILL.md#bản-đồ-hệ-thiết-kế", "SKILL.md");
      assert.deepEqual(kiemBanDoHeThietKe(d).loi, ["bản đồ hệ thiết kế: docs/README.md chưa trỏ sang bảng «Bản đồ hệ thiết kế»"]);
    }));
});

describe("Cài đặt sàn vào vỏ", () => {
  it("Cài đặt sàn: bố cục Đọc", () => {
    const bd = docBanDo(ROOT);
    const g = (n) => bd.nhom.find((x) => x.data.nhom === n);
    const cd = g("cai-dat-san");
    assert.equal(cd.data.bo_cuc, "doc");
    assert.ok(cd.data.nhan_dien.every((gl) => gl.startsWith("apps/web/src/app/(app)/settings/")), JSON.stringify(cd.data.nhan_dien));
    assert.equal(cd.data.khuon.ten, "MucCaiDat");
    assert.equal(cd.khuonTep, "apps/web/src/app/(app)/settings/khung.tsx");
    assert.match(readFileSync(join(ROOT, cd.khuonTep), "utf8"), /<BoCuc[^>]*kieu="doc"/);
    assert.deepEqual(kiemBoCuc(ROOT, bd).lech.filter((l) => l.nhom === "cai-dat-san"), []);
    assert.equal(g("trang-tam").data.bo_cuc, "doc");
    const vo = readFileSync(join(ROOT, "docs/design/vo-va-ia.md"), "utf8");
    const dau = vo.split("\n").find((l) => l.startsWith("| Màn | Phác thảo"));
    assert.ok(dau.split("|").map((c) => c.trim()).includes("Bố cục"), dau);
  });
});
