// Đọc danh sách căn ngoài khu lỗi (va-loi-doc-can-ngoai-khu, Ngoài-7 của hàng 79) — E1–E5. Hai câu báo đọc nguyên văn từ hợp đồng
// của hồ sơ, không so với hằng trong mã. Bảng ca viết trước, assert số ca chạy bằng số phần tử.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { ListingView } from "@/lib/sync/types";
import { CHUA_RO } from "./cot";
import { canBaoNgoaiKhu, capNhatBanGiuNgoaiKhu, cauBaoLoiDoc, docBanGiuNgoaiKhu, docCanNgoaiKhu, khoaNgoaiKhu, type KhoChu } from "./danh-muc";
import { chiMuc, ghepDanhMuc, type CanNgoaiKhuXem } from "./ghep-danh-muc";

const HOP_DONG = readFileSync(fileURLToPath(new URL("../../../../../../_acceptance/va-loi-doc-can-ngoai-khu/contract.md", import.meta.url)), "utf8");
const cauCua = (ac: string) => {
  const m = new RegExp(`\\*\\*${ac}\\*\\*[\\s\\S]*?«(Chưa đọc được[^»]+)»`).exec(HOP_DONG);
  assert.ok(m, `hợp đồng thiếu câu báo của ${ac}`);
  return m[1]!;
};
const CAU_NGOAI_KHU = cauCua("AC-1");
const CAU_CHUNG = cauCua("AC-5");
const CAU_DANH_BA = "Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên";

const NK: CanNgoaiKhuXem[] = [
  { id: "nk-1", propertySubType: "Townhouse", unparsedAddress: "12 Đường Mẫu, Phường Mẫu, Hà Nội" },
  { id: "nk-2", propertySubType: "Unimproved Land", unparsedAddress: "34 Đường Thử, Phường Thử, Hà Nội" },
];
const hang = (id: string, offCompoundUnitId: string | null): ListingView =>
  ({ id, offCompoundUnitId, buildingName: offCompoundUnitId ? null : "Toà A", subdivisionName: null, blockName: null, unitNumber: "A-01", standardStatus: "Active", listPrice: 1 }) as unknown as ListingView;
const HANG_NK = [hang("h-can-ho", null), hang("h-nk-1", "nk-1"), hang("h-nk-2", "nk-2")];
const HANG_CAN_HO = [hang("h-can-ho", null)];

const tra = (status: number, than: unknown) => (async () => new Response(typeof than === "string" ? than : JSON.stringify(than), { status })) as unknown as typeof fetch;
const khoTu = (ban: Record<string, string> = {}): KhoChu => {
  const m = new Map(Object.entries(ban));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};
const SAN = "san-1";

test("đọc lỗi: mười ca đều ra loi và không ném", async () => {
  const CA: [string, typeof fetch][] = [
    ["fetch ném lỗi", (async () => { throw new TypeError("failed"); }) as unknown as typeof fetch],
    ["401", tra(401, { error: "x" })],
    ["404", tra(404, { error: "x" })],
    ["500", tra(500, { error: "x" })],
    ["503", tra(503, "")],
    ["200 thân HTML", tra(200, "<!doctype html><html></html>")],
    ["200 không có units", tra(200, { khong: "phai" })],
    ["200 units không phải mảng", tra(200, { units: "x" })],
    ["200 units có phần tử null", tra(200, { units: [NK[0], null] })],
    ["200 phần tử thiếu unparsedAddress", tra(200, { units: [{ id: "a", propertySubType: "Townhouse" }] })],
  ];
  let chay = 0;
  for (const [ten, goi] of CA) {
    assert.deepEqual(await docCanNgoaiKhu(goi), { kind: "loi" }, ten);
    chay++;
  }
  assert.equal(chay, 10);
});

test("đọc lỗi: đối chứng hai chiều cùng dữ liệu", async () => {
  assert.deepEqual(await docCanNgoaiKhu(tra(200, { units: NK })), { kind: "xong", ds: NK });
  // Bản nuốt lỗi như lối cũ: 500 ra `null`, khác `loi`.
  const nuotLoi = async (goi: typeof fetch) => {
    const r = await goi("/x");
    return r.ok ? { kind: "xong" } : null;
  };
  assert.notDeepEqual(await nuotLoi(tra(500, {})), { kind: "loi" }, "đối chứng: bản nuốt lỗi không báo loi");
  assert.deepEqual(await docCanNgoaiKhu(tra(500, {})), { kind: "loi" }, "lỗi đọc căn ngoài khu bị nuốt");
});

test("chữ báo: đúng câu của hợp đồng", () => {
  assert.equal(cauBaoLoiDoc(false, true), CAU_NGOAI_KHU);
});

test("đọc được thì ghép đúng", () => {
  const kho = khoTu();
  assert.equal(canBaoNgoaiKhu(true, null, HANG_NK), true, "trước khi đọc được phải báo");
  const truoc = ghepDanhMuc(HANG_NK[1]!, chiMuc(null, null));
  assert.equal(truoc.propertySubType, null, "đối chứng: chưa đọc được thì không có loại hình");
  assert.equal(truoc.unitType, CHUA_RO, "đối chứng: chưa đọc được thì «Chưa rõ»");

  const ds = capNhatBanGiuNgoaiKhu(kho, SAN, NK);
  const idx = chiMuc(null, ds);
  const a = ghepDanhMuc(HANG_NK[1]!, idx);
  const b = ghepDanhMuc(HANG_NK[2]!, idx);
  assert.equal(a.propertySubType, "Townhouse");
  assert.equal(a.buildingName, "12 Đường Mẫu, Phường Mẫu, Hà Nội");
  assert.equal(b.propertySubType, "Unimproved Land");
  assert.equal(b.buildingName, "34 Đường Thử, Phường Thử, Hà Nội");
  assert.deepEqual(docBanGiuNgoaiKhu(kho, SAN), NK, "bản giữ phải được ghi");
  assert.equal(canBaoNgoaiKhu(false, ds, HANG_NK), false, "đọc được rồi thì thôi báo");
});

test("bản giữ: năm ca", () => {
  const CA: [string, Record<string, string>, boolean][] = [
    ["vắng", {}, true],
    ["chuỗi hỏng", { [khoaNgoaiKhu(SAN)]: '[{"id":"nk-1","prop' }, true],
    ["rỗng", { [khoaNgoaiKhu(SAN)]: "[]" }, false],
    ["thiếu một căn", { [khoaNgoaiKhu(SAN)]: JSON.stringify([NK[0]]) }, false],
    ["đủ", { [khoaNgoaiKhu(SAN)]: JSON.stringify(NK) }, false],
  ];
  let chay = 0;
  for (const [ten, ban, bao] of CA) {
    const ds = capNhatBanGiuNgoaiKhu(khoTu(ban), SAN, null);
    assert.equal(canBaoNgoaiKhu(true, ds, HANG_NK), bao, ten);
    assert.equal(cauBaoLoiDoc(false, canBaoNgoaiKhu(true, ds, HANG_NK)), bao ? CAU_NGOAI_KHU : null, `${ten}: câu báo`);
    if (ten === "đủ") {
      const d = ghepDanhMuc(HANG_NK[1]!, chiMuc(null, ds));
      assert.equal(d.propertySubType, "Townhouse", "đủ: loại hình theo bản giữ");
      assert.equal(d.buildingName, "12 Đường Mẫu, Phường Mẫu, Hà Nội", "đủ: địa chỉ theo bản giữ");
    }
    chay++;
  }
  assert.equal(chay, 5);
});

test("không có hàng ngoài khu: không báo", () => {
  const CA: [string, ListingView[]][] = [
    ["chỉ căn hộ", HANG_CAN_HO],
    ["bảng rỗng", []],
  ];
  let chay = 0;
  for (const [ten, h] of CA) {
    assert.equal(canBaoNgoaiKhu(true, null, h), false, ten);
    assert.equal(cauBaoLoiDoc(false, canBaoNgoaiKhu(true, null, h)), null, ten);
    chay++;
  }
  assert.equal(chay, 2);
  const them = [...HANG_CAN_HO, hang("h-nk-1", "nk-1")];
  assert.equal(cauBaoLoiDoc(false, canBaoNgoaiKhu(true, null, them)), CAU_NGOAI_KHU, "đối chứng: thêm một hàng ngoài khu thì báo");
});

test("một vùng một báo: bốn tổ hợp", () => {
  const CA: [boolean, boolean, string | null][] = [
    [true, true, CAU_CHUNG],
    [true, false, CAU_DANH_BA],
    [false, true, CAU_NGOAI_KHU],
    [false, false, null],
  ];
  let chay = 0;
  for (const [danhBa, ngoaiKhu, cau] of CA) {
    assert.equal(cauBaoLoiDoc(danhBa, ngoaiKhu), cau, `danh bạ ${danhBa} × ngoài khu ${ngoaiKhu}`);
    chay++;
  }
  assert.equal(chay, 4);
});
