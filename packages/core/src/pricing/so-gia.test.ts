import assert from "node:assert/strict";
import { test } from "node:test";
import { soGiaToa, SO_GIA_NAC, type CanDangGoi, type CanSo, type SoGiaToa } from "./so-gia";

const can = (id: string, p: Partial<CanSo>): CanSo => ({
  id,
  buildingName: "Toà A",
  unitNumber: `A-${id}`,
  bedroomsTotal: 2,
  standardStatus: "Active",
  listPrice: 3_000_000_000,
  feeInclusion: "included",
  lastConfirmedAt: "2026-11-01T03:00:00.000Z",
  ...p,
});

// Ma trận viết trước (AC-5, Hỏi-4): mười căn, đúng hai căn được so.
const MUOI_CAN: [string, CanSo, boolean][] = [
  ["cùng toà 2PN Đang bán bao phí", can("c1", {}), true],
  ["cùng toà 2PN Đang giao dịch không bao phí", can("c2", { standardStatus: "Pending", listPrice: 2_900_000_000, feeInclusion: "excluded" }), true],
  ["cùng toà 1PN Đang bán", can("c3", { bedroomsTotal: 1, listPrice: 2_000_000_000 }), false],
  ["toà khác 2PN", can("c4", { buildingName: "Toà B" }), false],
  ["cùng toà 2PN Đã bán", can("c5", { standardStatus: "Closed" }), false],
  ["cùng toà 2PN Chưa đủ để rao", can("c6", { standardStatus: "Incomplete" }), false],
  ["cùng toà 2PN Tạm ngừng", can("c7", { standardStatus: "Hold" }), false],
  ["cùng toà 2PN chưa có giá", can("c8", { listPrice: null, feeInclusion: null }), false],
  ["cùng toà 2PN thiếu điều kiện phí", can("c9", { feeInclusion: null }), false],
  ["chính căn đang gọi", can("H0", { unitNumber: "A-10.01" }), false],
];
const CAC_CAN = MUOI_CAN.map(([, c]) => c);
const DANG_GOI: CanDangGoi = { id: "H0", buildingName: "toà  a", unitNumber: "A-10.01", bedroomsTotal: 2, listPrice: 3_000_000_000, feeInclusion: "included" };

test("so giá: nấc đem so là Đang bán và Đang giao dịch", () => assert.deepEqual([...SO_GIA_NAC], ["Active", "Pending"]));

test("so giá: ma trận chọn căn", () => {
  assert.equal(MUOI_CAN.length, 10);
  const kq = soGiaToa({ can: DANG_GOI, cacCan: CAC_CAN });
  const mong = MUOI_CAN.filter(([, , vao]) => vao).map(([, c]) => c.id);
  assert.equal(mong.length, 2);
  assert.deepEqual(new Set(kq.dong.map((d) => d.id)), new Set(mong));
  assert.equal(kq.caToa, false);
  // Lead chỉ biết toà: so cả toà — thêm căn 1PN, vẫn trừ hồ sơ của lead.
  const caToa = soGiaToa({ can: { ...DANG_GOI, unitNumber: null, bedroomsTotal: null }, cacCan: CAC_CAN });
  assert.deepEqual(new Set(caToa.dong.map((d) => d.id)), new Set(["c1", "c2", "c3"]));
  assert.equal(caToa.caToa, true);
});

/** Chỗ kết quả lệch bảng viết tay: c2 không bao phí 2,9 tỷ về tay cao hơn c1 bao phí 3 tỷ (về tay 2,895 tỷ). */
function lechDai(kq: SoGiaToa): string[] {
  const sai: string[] = [];
  if (kq.dong.map((d) => d.id).join() !== "c2,c1") sai.push("c1 bao phí đứng trên c2");
  if (JSON.stringify(kq.dai) !== JSON.stringify({ thap: 2_895_000_000, giua: 2_897_500_000, cao: 2_900_000_000 })) sai.push("dải không phải về tay");
  if (JSON.stringify(kq.viTri) !== JSON.stringify({ veTay: 2_895_000_000, lechPhanTram: -0.1 })) sai.push("vị trí căn đang gọi");
  return sai;
}

test("so giá: dải về tay", () => {
  assert.deepEqual(lechDai(soGiaToa({ can: DANG_GOI, cacCan: CAC_CAN })), []);
  // Căn đang gọi chưa có giá: dải vẫn có, không vị trí.
  assert.equal(soGiaToa({ can: { ...DANG_GOI, listPrice: null, feeInclusion: null }, cacCan: CAC_CAN }).viTri, null);
  // Toà không căn hợp: không dải.
  const trong = soGiaToa({ can: { ...DANG_GOI, buildingName: "Toà C" }, cacCan: CAC_CAN });
  assert.deepEqual([trong.dai, trong.dong, trong.viTri], [null, [], null]);
});

test("so giá: đối chứng đỏ — so trên giá thay vì về tay bị gọi tên", () => {
  const theoGia = (): SoGiaToa => {
    const kq = soGiaToa({ can: DANG_GOI, cacCan: CAC_CAN });
    const dong = kq.dong.map((d) => ({ ...d, veTay: d.listPrice })).sort((a, b) => b.veTay - a.veTay);
    const ve = dong.map((d) => d.veTay);
    return { ...kq, dong, dai: { thap: Math.min(...ve), giua: Math.floor((ve[0]! + ve[1]!) / 2), cao: Math.max(...ve) } };
  };
  const sai = lechDai(theoGia());
  assert.ok(sai.includes("c1 bao phí đứng trên c2"), sai.join());
  assert.ok(sai.includes("dải không phải về tay"), sai.join());
});

test("so giá: không đề xuất", () => {
  const kq = soGiaToa({ can: DANG_GOI, cacCan: CAC_CAN });
  assert.deepEqual(Object.keys(kq).sort(), ["caToa", "dai", "dong", "viTri"]);
  assert.deepEqual(Object.keys(kq.dong[0]!).sort(), ["feeInclusion", "id", "lastConfirmedAt", "listPrice", "standardStatus", "unitNumber", "veTay"]);
});
