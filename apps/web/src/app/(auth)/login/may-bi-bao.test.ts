// Khối máy bị báo mất trên màn đăng nhập (hàng 93, nguồn Ngoài-1 của tab-toi, hàng 43) — E14: xoá hỏng thì báo «chưa xoá
// được» và cho thử lại, không báo đã xoá.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { chayXoa, LOI_BI_BAO, LOI_CHUA_XOA } from "./may-bi-bao";

const NGUON = readFileSync(new URL("./may-bi-bao.tsx", import.meta.url), "utf8");

test("máy bị báo: xoá lành ra «xong», xoá hỏng ra «loi»", async () => {
  const goi: string[] = [];
  assert.equal(await chayXoa("u1", async (u) => void goi.push(u)), "xong");
  assert.equal(
    await chayXoa("u1", async () => {
      throw new DOMException("kho trên máy hỏng", "UnknownError");
    }),
    "loi",
  );
  assert.deepEqual(goi, ["u1"]);
});

test("máy bị báo: thử lại sau lần hỏng thì xoá lại và ra «xong»", async () => {
  let lan = 0;
  const xoa = async () => {
    lan += 1;
    if (lan === 1) throw new Error("hỏng lần đầu");
  };
  assert.equal(await chayXoa("u1", xoa), "loi");
  assert.equal(await chayXoa("u1", xoa), "xong");
  assert.equal(lan, 2);
});

/** Nguồn khối: lỗi bị nuốt thành «đã xoá» thì trả lý do, lành thì rỗng. */
function nuotLoi(nguon: string): string[] {
  const ly: string[] = [];
  if (/\.catch\(\(\) => \{\}\)/.test(nguon)) ly.push("nuốt lỗi bằng .catch(() => {})");
  if (!/ketQua === "loi"[\s\S]{0,200}LOI_CHUA_XOA/.test(nguon)) ly.push("không dựng LOI_CHUA_XOA khi hỏng");
  if (!/onClick=\{thuLai\}[\s\S]{0,40}Thử lại/.test(nguon)) ly.push("thiếu nút Thử lại");
  return ly;
}

test("máy bị báo: chữ và nhánh của khối", () => {
  assert.equal(LOI_CHUA_XOA.description, "Chưa xoá được dữ liệu Quỹ hàng trên máy — thử lại");
  assert.notEqual(LOI_CHUA_XOA.description, LOI_BI_BAO.description);
  assert.deepEqual(nuotLoi(NGUON), []);
  // Đối chứng: bản cũ (nuốt lỗi rồi báo đã xoá) thì thước nêu đúng lý do.
  const banCu = 'void xoaMayBiBao(userId).catch(() => {}).then(() => setXong(true)); <TrangThai title={LOI_BI_BAO.title} />';
  assert.deepEqual(nuotLoi(banCu), ["nuốt lỗi bằng .catch(() => {})", "không dựng LOI_CHUA_XOA khi hỏng", "thiếu nút Thử lại"]);
});
