// E4 (hàng 43, AC-4, Hỏi-4) — bài theo kênh trên ba căn mẫu: Zalo một dòng một căn; Facebook dòng đầu tên sàn rồi ba
// khối cách một dòng trống; không biểu tượng cảm xúc, không * hay _ bao chữ; giá như bảng hàng. Chiều đỏ: bản sao chèn
// biểu tượng vào bài, chạy qua CÙNG máy kiểm. (Phần «chép vào bộ nhớ tạm đúng một lần» là của hộp thoại — Task 4.)
import assert from "node:assert/strict";
import { test } from "node:test";
import { canMoi, type CanNoiBo } from "../redaction";
import { xuatBang, type CotGocNhin } from ".";

const TODAY = "2026-11-04";
const TEN_SAN = "[Tên sàn] Mẫu";
const COT: readonly CotGocNhin[] = ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "listPrice", "feeInclusion"];
const ba = (): CanNoiBo[] => [
  { ...canMoi(), buildingName: "[Mẫu] Toà A", unitNumber: "A-12.05", bedroomsTotal: 2, listPrice: 4_250_000_000, feeInclusion: "excluded" },
  { ...canMoi(), buildingName: "[Mẫu] Toà A", unitNumber: "A-08.01", bedroomsTotal: 0, livingArea: 35, listPrice: 1_950_000_000, feeInclusion: "included" },
  { ...canMoi(), buildingName: "[Mẫu] Toà B", unitNumber: "B-15.10", bedroomsTotal: 3, listPrice: 950_000_000, directionFaces: null },
];

const BIEU_TUONG = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/u;
/** Lỗi khuôn chung của mọi bài: ký tự biểu tượng, dấu * hay _ bao chữ. */
function kiemKyTu(bai: string): string[] {
  const loi: string[] = [];
  for (const ch of bai) if (BIEU_TUONG.test(ch)) loi.push(`ký tự lạ U+${ch.codePointAt(0)!.toString(16).toUpperCase()}`);
  if (/\*[^*\n]+\*/.test(bai)) loi.push("dấu * bao chữ");
  if (/(^|\s)_[^_\n]+_(\s|$)/.test(bai)) loi.push("dấu _ bao chữ");
  return loi;
}

function kiemZalo(bai: string): string[] {
  const loi = kiemKyTu(bai);
  const dong = bai.split("\n");
  if (dong.length !== 3) loi.push(`${dong.length} dòng ≠ 3`);
  if (dong.some((d) => d.trim() === "")) loi.push("có dòng trống");
  return loi;
}

function kiemFacebook(bai: string): string[] {
  const loi = kiemKyTu(bai);
  const khoi = bai.split("\n\n");
  if (khoi[0] !== TEN_SAN) loi.push(`dòng đầu «${khoi[0]}»`);
  if (khoi.length !== 4) loi.push(`${khoi.length - 1} khối ≠ 3`);
  if (/\n{3,}/.test(bai)) loi.push("hơn một dòng trống giữa khối");
  return loi;
}

test("E4 bài Zalo — đúng ba dòng, một căn một dòng, giá như bảng hàng", () => {
  const b = xuatBang(ba(), { mau: "post_zalo", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: TEN_SAN });
  assert.deepEqual(kiemZalo(b.bai!), []);
  assert.deepEqual(b.bai!.split("\n"), [
    "[Mẫu] Toà A · A-12.05 · 2PN · 74,5 m² · Tầng 12 · Hướng Đông Nam · 4,25 tỷ · Không bao phí",
    "[Mẫu] Toà A · A-08.01 · Studio · 35 m² · Tầng 12 · Hướng Đông Nam · 1,95 tỷ · Bao phí",
    "[Mẫu] Toà B · B-15.10 · 3PN · 74,5 m² · Tầng 12 · 950 triệu · Không bao phí",
  ]);
});

test("E4 bài Facebook — dòng đầu tên sàn, ba khối cách một dòng trống", () => {
  const b = xuatBang(ba(), { mau: "post_facebook", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: TEN_SAN });
  assert.deepEqual(kiemFacebook(b.bai!), []);
  const khoi = b.bai!.split("\n\n");
  assert.equal(khoi[1], "[Mẫu] Toà A\nA-12.05\n2PN\n74,5 m²\nTầng 12\nHướng Đông Nam\n4,25 tỷ\nKhông bao phí");
  assert.ok(khoi[3]!.includes("950 triệu"));
});

test("E4 bài bỏ biểu tượng có sẵn trong chữ của căn; mẫu tệp không có bài", () => {
  const can = [{ ...ba()[0]!, buildingName: "[Mẫu] Toà A \u{1F3E0}" }];
  for (const mau of ["post_zalo", "post_facebook"] as const) {
    const b = xuatBang(can, { mau, nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: `${TEN_SAN} ✨` });
    assert.deepEqual(kiemKyTu(b.bai!), [], mau);
  }
  for (const mau of ["xlsx", "png", "pdf"] as const) {
    assert.equal(xuatBang(ba(), { mau, nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: TEN_SAN }).bai, undefined);
  }
});

test("E4 chiều đỏ — bản sao chèn biểu tượng vào bài thì máy kiểm nêu ký tự lạ", () => {
  const b = xuatBang(ba(), { mau: "post_zalo", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: TEN_SAN });
  const chen = b.bai!.split("\n").map((d) => `\u{1F3E0} ${d}`).join("\n");
  assert.deepEqual(kiemZalo(chen), ["ký tự lạ U+1F3E0", "ký tự lạ U+1F3E0", "ký tự lạ U+1F3E0"]);
});
