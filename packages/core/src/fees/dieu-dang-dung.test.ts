// Điều đang đúng về thuế phí đã ghi (hàng 49, AC-10, E10) — đường tệp suy từ vị trí bài, không gốc cứng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const docTep = (tuongDoi: string) => readFileSync(new URL(`../../../../${tuongDoi}`, import.meta.url), "utf8");

/** Lỗi nêu mục khi Tham chiếu hay sổ điểm thiếu điều của hàng 49; rỗng khi đủ. */
export function kiemDieuDangDung(thamChieu: string, soDiem: string): string[] {
  const loi: string[] = [];
  const muc12 = thamChieu.slice(thamChieu.indexOf("## 12. Sổ quyết định"), thamChieu.indexOf("## 13."));
  if (!muc12.split("\n").some((l) => l.startsWith("| 06/11 |") && l.includes("Thuế phí") && l.includes("listing_price_fee_basis"))) loi.push("§12: thiếu dòng 06/11 Thuế phí");
  const muc10 = thamChieu.slice(thamChieu.indexOf("## 10."), thamChieu.indexOf("## 11."));
  if (!muc10.split("\n").some((l) => l.startsWith("| Cài đặt sàn |") && l.includes("Thuế phí (hàng 49)"))) loi.push("§10: dòng Cài đặt sàn chưa ghi Thuế phí (hàng 49)");
  for (const so of ["10", "11"]) {
    const dong = soDiem.split("\n").find((l) => l.startsWith(`| ${so} |`));
    if (!dong?.includes("kiểm văn bản 06/11")) loi.push(`sổ điểm #${so}: chưa ghi kiểm văn bản 06/11`);
  }
  return loi;
}

test("thuế phí: điều đang đúng đã ghi", () => {
  const thamChieu = docTep("docs/product/tham-chieu.md");
  const soDiem = docTep("docs/architecture/so-diem-bien-thien.md");
  assert.deepEqual(kiemDieuDangDung(thamChieu, soDiem), []);
  // Chiều đỏ trên bản sao: xoá dòng 06/11 thì hàm nêu §12; bỏ chữ kiểm ở #10 thì nêu #10.
  const boDong = thamChieu.split("\n").filter((l) => !(l.startsWith("| 06/11 |") && l.includes("Thuế phí"))).join("\n");
  assert.match(kiemDieuDangDung(boDong, soDiem).join(), /§12/);
  assert.match(kiemDieuDangDung(thamChieu, soDiem.replace("2 — kiểm văn bản 06/11", "2")).join(), /#10/);
});
