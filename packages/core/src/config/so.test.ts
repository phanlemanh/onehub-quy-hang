// Sổ ở mã (hàng 81: AC-1, AC-3). Bộ kiểm sổ nhận sổ làm tham số — chiều đỏ là cùng hàm trên bản sao có một dòng hỏng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DATA_CLASSES } from "../data-classes";
import { ROLES } from "../navigation";
import { kiemGiaTri, kiemSo } from "./khuon";
import { HIEU_LUC, SO_DIEM, TINH_TRANG, type DiemSo } from "./so";
import { docSoTaiLieu } from "./so-khop";

const KHUON_DON = /^[a-z_]+(\.([a-z_]+|<[^>]+>))+$/;
const KHUON_MAP = /^[a-z_]+(\.([a-z_]+|<[^>]+>))*$/;

test("sổ ở mã: mỗi dòng đủ cột và đúng khuôn", () => {
  assert.deepEqual(kiemSo(SO_DIEM), []);
  let so = 0;
  for (const d of SO_DIEM) {
    const ten = `${d.so} ${d.khoa}`;
    assert.ok(
      (d.kieu.loai === "map" ? KHUON_MAP : KHUON_DON).test(d.khoa) &&
        d.so.length > 0 &&
        d.ten.length > 0 &&
        d.aiDoi.length > 0 &&
        d.aiDoi.every((v) => ROLES.includes(v)) &&
        HIEU_LUC.includes(d.hieuLuc) &&
        DATA_CLASSES.includes(d.lop) &&
        TINH_TRANG.includes(d.tinhTrang) &&
        (d.kieu.loai === "map" || d.khoa.includes("<") || kiemGiaTri(d.khoa, d.macDinh).ok),
      ten,
    );
    so++;
  }
  assert.equal(so, SO_DIEM.length);
  assert.equal(new Set(SO_DIEM.map((d) => d.khoa)).size, SO_DIEM.length, "khoá không trùng");
  assert.equal(new Set(SO_DIEM.map((d) => d.so)).size, SO_DIEM.length, "số thứ tự không trùng");

  // Chiều đỏ: mỗi bản sao hỏng đúng một chỗ → đúng một lỗi, mở đầu bằng khoá của dòng hỏng.
  const sua = (khoa: string, f: (d: DiemSo) => DiemSo): DiemSo[] => SO_DIEM.map((d) => (d.khoa === khoa ? f(d) : d));
  const hong: [string, DiemSo[], string][] = [
    ["khoá trùng", [...SO_DIEM, { ...SO_DIEM.find((d) => d.khoa === "queue.call_back_after_days")!, so: "99" }], "queue.call_back_after_days"],
    ["số thứ tự trùng", sua("share.stale_warning_days", (d) => ({ ...d, so: "4" })), "share.stale_warning_days"],
    ["vai lạ", sua("price.change_confirm_pct", (d) => ({ ...d, aiDoi: ["boss" as never] })), "price.change_confirm_pct"],
    ["mặc định ngoài khoảng", sua("queue.price_negotiation_after_days", (d) => ({ ...d, macDinh: 15 })), "queue.price_negotiation_after_days"],
  ];
  for (const [ten, banSao, khoa] of hong) {
    const loi = kiemSo(banSao);
    assert.equal(loi.length, 1, `${ten}: ${JSON.stringify(loi)}`);
    assert.ok(loi[0]!.startsWith(khoa), `${ten}: ${loi[0]}`);
  }
});

test("không điểm nào lớp nguồn", () => {
  for (const d of SO_DIEM) assert.notEqual(d.lop, "source", d.khoa);
  const md = readFileSync(new URL("../../../../docs/architecture/so-diem-bien-thien.md", import.meta.url), "utf8");
  const doc = docSoTaiLieu(md);
  assert.ok(doc.length > 0);
  for (const d of doc) assert.notEqual(d.lop, "source", d.khoa);

  const banSao = SO_DIEM.map((d) => (d.khoa === "price.change_confirm_pct" ? { ...d, lop: "source" as const } : d));
  const loi = kiemSo(banSao);
  assert.equal(loi.length, 1, JSON.stringify(loi));
  assert.ok(loi[0]!.startsWith("price.change_confirm_pct") && loi[0]!.includes("source"), loi[0]);
});
