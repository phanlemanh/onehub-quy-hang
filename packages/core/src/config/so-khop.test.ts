// Sổ khớp (hàng 81: AC-2): sổ tài liệu và sổ mã hai chiều. Chiều đỏ là cùng hàm soKhop trên chữ tài liệu hay sổ mã đã
// phá đúng một chỗ — mỗi ca ra đúng một lỗi, thông điệp ghim khoá và cột.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { SO_DIEM } from "./so";
import { docSoTaiLieu, soKhop } from "./so-khop";

const MD = readFileSync(new URL("../../../../docs/architecture/so-diem-bien-thien.md", import.meta.url), "utf8");

/** Dòng tài liệu của một khoá. */
const dongCua = (khoa: string) => {
  const d = MD.split("\n").find((x) => x.includes(`| \`${khoa}\` |`));
  assert.ok(d, `tài liệu có dòng ${khoa}`);
  return d;
};
/** Đổi ô thứ `cot` (đếm từ 0, sau ô đầu) của dòng khoá. */
const doiO = (khoa: string, cot: number, giaTri: string) => {
  const d = dongCua(khoa);
  const o = d.split("|");
  o[cot + 1] = ` ${giaTri} `;
  return MD.replace(d, o.join("|"));
};

test("sổ khớp: tài liệu và mã hai chiều", () => {
  const doc = docSoTaiLieu(MD);
  assert.ok(doc.length > 0);
  assert.equal(doc.length, SO_DIEM.length, "số dòng tài liệu = số dòng sổ mã");
  assert.deepEqual(soKhop(MD, SO_DIEM), []);

  const dongMau = dongCua("share.stale_warning_days");
  const ca: [string, string, typeof SO_DIEM, string, string][] = [
    ["(a) bỏ một dòng khỏi tài liệu", MD.replace(dongMau + "\n", ""), SO_DIEM, "share.stale_warning_days", "chỉ có ở mã"],
    ["(b) thêm dòng vào tài liệu", MD.replace(dongMau, `${dongMau}\n${dongMau.replace("| 6 |", "| 90 |").replace("share.stale_warning_days", "demo.extra")}`), SO_DIEM, "demo.extra", "chỉ có ở tài liệu"],
    ["(c) số thứ tự", doiO("share.stale_warning_days", 0, "60"), SO_DIEM, "share.stale_warning_days", "cột số thứ tự"],
    ["(d) kiểu", doiO("share.stale_warning_days", 3, "`decimal` ngày"), SO_DIEM, "share.stale_warning_days", "cột kiểu"],
    ["(e) lớp", doiO("share.stale_warning_days", 9, "shareable_listing"), SO_DIEM, "share.stale_warning_days", "cột lớp"],
    ["(f) tình trạng", doiO("share.stale_warning_days", 10, "Đề xuất"), SO_DIEM, "share.stale_warning_days", "cột tình trạng"],
    ["(g) hiệu lực", doiO("share.stale_warning_days", 8, "mới"), SO_DIEM, "share.stale_warning_days", "cột hiệu lực"],
    ["(h) ai đổi", doiO("share.stale_warning_days", 6, "Trưởng nhóm"), SO_DIEM, "share.stale_warning_days", "cột ai đổi"],
    ["(i) mặc định int", doiO("queue.call_back_after_days", 4, "15"), SO_DIEM, "queue.call_back_after_days", "cột mặc định"],
    ["(j) khoảng", doiO("queue.call_back_after_days", 5, "7–31"), SO_DIEM, "queue.call_back_after_days", "cột khoảng"],
  ];
  let so = 0;
  for (const [ten, md, soMa, khoa, cot] of ca) {
    const loi = soKhop(md, soMa);
    assert.equal(loi.length, 1, `${ten}: ${JSON.stringify(loi)}`);
    assert.ok(loi[0]!.startsWith(khoa) && loi[0]!.includes(cot), `${ten}: ${loi[0]}`);
    so++;
  }
  assert.equal(so, 10);
});
