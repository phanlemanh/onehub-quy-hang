// Bảng hàng theo cách gọi riêng của sàn (hàng 45: E4, E5, E10). Năm dòng viết tay; đáp án viết trước, không dựng từ hàm
// đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";
import { moTaThayDoi } from "./cell-edit/lenh";
import { COT, chuCuaO, nhanCot, type DongBang } from "./cot";
import { locDong, luaChon } from "./loc";
import { nhomDong, type DongNhom } from "./nhom";

const TV: TuVung = {
  truong: { feeInclusion: "Phí CN" },
  giaTri: { feeInclusion: { included: "BP" }, withdrawnReason: { unreachable: "Mất liên lạc" } },
};

const dong = (id: string, phi: "included" | "excluded", them: Partial<DongBang> = {}): DongBang => ({
  id,
  buildingName: "Toà A",
  unitNumber: `A-${id}`,
  unitType: "2PN",
  livingArea: 68.5,
  floor: 12,
  directionFaces: "Đông Nam",
  standardStatus: "Active",
  listPrice: 3_200_000_000,
  feeInclusion: phi,
  furnished: null,
  legalStatus: null,
  financing: null,
  occupantType: null,
  confirmedAgeDays: 2,
  needsCallBack: false,
  completeness: 3,
  visibility: "Company",
  closePrice: null,
  closeDate: null,
  withdrawnReason: null,
  ...them,
});
const NAM = [dong("1", "included"), dong("2", "excluded"), dong("3", "included"), dong("4", "excluded"), dong("5", "included")];
const cot = (id: string) => COT.find((c) => c.id === id)!;

test("bảng hàng: chữ theo từ vựng của sàn", () => {
  assert.equal(nhanCot(cot("feeInclusion"), TV), "Phí CN");
  assert.equal(nhanCot(cot("listPrice"), TV), "Giá");
  // Bảng ba dòng viết trước: [dòng, cột, chữ].
  const bang: [DongBang, "feeInclusion" | "withdrawnReason", string][] = [
    [dong("a", "included"), "feeInclusion", "BP"],
    [dong("b", "excluded"), "feeInclusion", "Không bao phí"],
    [dong("c", "excluded", { standardStatus: "Withdrawn", withdrawnReason: "unreachable" }), "withdrawnReason", "Mất liên lạc"],
  ];
  for (const [d, id, chu] of bang) assert.equal(chuCuaO(d, id, TV), chu, `${d.id}/${id}`);
  // Hộp hỏi lại của ô sửa giá nói cùng chữ.
  const lenh = { type: "price_changed", payload: { listPrice: 3_000_000_000, feeInclusion: "included" } } as Parameters<typeof moTaThayDoi>[1];
  assert.match(moTaThayDoi(dong("d", "excluded"), lenh, undefined, TV), /Không bao phí → .*, BP$/);
});

test("bảng hàng: lọc và đếm theo giá trị chuẩn", () => {
  assert.deepEqual(luaChon(NAM, "feeInclusion", TV), [
    { value: "included", label: "BP" },
    { value: "excluded", label: "Không bao phí" },
  ]);
  const giu = locDong(NAM, { feeInclusion: "included" }).map((d) => d.id);
  assert.deepEqual(giu, ["1", "3", "5"]);
  const nhom = nhomDong(locDong(NAM, { feeInclusion: "included" }), "toa") as DongNhom[];
  assert.deepEqual(nhom.map((n) => [n.label, n.soCan]), [["Toà A", 3]]);
  // Đổi tên riêng không đổi id giữ lại, số căn, giá trị lựa chọn.
  const tv2: TuVung = { truong: {}, giaTri: { feeInclusion: { included: "Bao phí SC" } } };
  assert.deepEqual(luaChon(NAM, "feeInclusion", tv2).map((o) => o.value), ["included", "excluded"]);
  assert.deepEqual(locDong(NAM, { feeInclusion: "included" }).map((d) => d.id), giu);
  assert.equal(luaChon(NAM, "feeInclusion", tv2).find((o) => o.value === "included")!.label, "Bao phí SC");
});

test("bảng hàng: từ vựng rỗng là mặc định", () => {
  // Nhãn cột viết trước — đúng chữ trước vòng này, cộng năm cột loại hình của hàng 79.
  const NHAN = ["Toà", "Mã căn", "Loại hình", "Loại căn", "Diện tích", "Tầng", "Hướng", "Diện tích đất", "Số tầng", "Mặt tiền", "Lộ giới", "Trạng thái", "Giá", "Phí", "Nội thất", "Pháp lý", "Tài chính", "Tình trạng sử dụng", "Xác nhận", "Đầu chủ", "Mức đủ", "Ai thấy", "Giá chốt", "Ngày bán", "Lý do ngừng"];
  assert.deepEqual(COT.map((c) => nhanCot(c, TU_VUNG_RONG)), NHAN);
  const d = dong("e", "included", { standardStatus: "Withdrawn", withdrawnReason: "unreachable" });
  assert.deepEqual(
    (["feeInclusion", "withdrawnReason", "listPrice", "livingArea", "directionFaces"] as const).map((id) => chuCuaO(d, id, TU_VUNG_RONG)),
    ["Bao phí", "Không liên lạc được", "3,2 tỷ", "68,5 m²", "Đông Nam"],
  );
});

// Mọi trang của nhà Bảng hàng dựng bảng hay thẻ phải đọc cách gọi ở máy chủ và bọc provider (S4-r1 t1/t4: cách xem đã
// lưu `/inventory/views/<id>` từng mở bảng bằng chữ dựng sẵn).
test("bảng hàng: mọi trang đọc cách gọi của sàn", () => {
  const day = dirname(fileURLToPath(import.meta.url));
  const trang = ["page.tsx", join("views", "[id]", "page.tsx")];
  const coTuVung = (nguon: string) => {
    const bang = (nguon.match(/<(BangHang|BangCoHoSo|BangTheDienThoai)\b/g) ?? []).length;
    const boc = (nguon.match(/<TuVungProvider\b/g) ?? []).length;
    return bang > 0 && nguon.includes("docTuVung(") && boc >= 2;
  };
  for (const t of trang) assert.equal(coTuVung(readFileSync(join(day, t), "utf8")), true, `${t} thiếu docTuVung/TuVungProvider`);
  // Chiều đỏ: trang trước bản sửa (không provider) thì phép đo đỏ.
  const cu = readFileSync(join(day, trang[1]!), "utf8").replace(/<\/?TuVungProvider[^>]*>/g, "").replace(/docTuVung\(/g, "x(");
  assert.equal(coTuVung(cu), false);
});
