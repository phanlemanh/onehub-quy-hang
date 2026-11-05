// E7a (hàng 105, AC-7): cột «Đầu chủ» của Bảng hàng — chữ ô theo `listAgentKey` đối với danh bạ đầu chủ của sàn. Ma trận ba
// ca viết trước bằng tay (Hỏi-3: người giữ đã rời sàn hiện «Đã rời sàn», khác «—» của căn chưa gán); chiều đỏ: đổi
// `listAgentKey` của dòng thì ô đổi theo.
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { ListingView } from "@/lib/sync/types";
import { CACH_XEM_MAC_DINH } from "./goc-nhin";
import { COT, COT_AN_MAC_DINH, chuCuaO, chuDauChu, DA_ROI_SAN, type DanhBaDauChu } from "./cot";
import { ghepDanhMuc } from "./ghep-danh-muc";

// Danh bạ của sàn mẫu: hai đầu chủ còn trong sàn. Mã người và tên là mồi, không dữ liệu thật.
// `moi: true`: danh bạ vừa đọc từ máy chủ trong phiên (hàng 48).
const TEN = new Map([
  ["u-dau-chu-1", "[Tên] Đầu chủ một"],
  ["u-dau-chu-2", "[Tên] Đầu chủ hai"],
]);
const DANH_BA: DanhBaDauChu = { ten: TEN, moi: true };

function hang(listAgentKey: string | null): ListingView {
  return {
    id: "l-0001",
    buildingName: "A",
    unitNumber: "A-01.01",
    standardStatus: "Active",
    listPrice: 3_250_000_000,
    feeInclusion: "included",
    furnished: null,
    legalStatus: null,
    financing: null,
    occupantType: null,
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
    listAgentKey,
  } as unknown as ListingView;
}

const oCua = (key: string | null, danhBa: DanhBaDauChu = DANH_BA) => chuCuaO(ghepDanhMuc(hang(key), new Map(), danhBa), "dau-chu");

describe("cột Đầu chủ", () => {
  it("cột Đầu chủ: tên theo listAgentKey, chưa gán là —", () => {
    // Ma trận viết trước: (người giữ) → chữ ô.
    const MA_TRAN: [string | null, string][] = [
      ["u-dau-chu-1", "[Tên] Đầu chủ một"],
      [null, "—"],
      ["u-da-nghi", "Đã rời sàn"],
    ];
    assert.deepEqual(
      MA_TRAN.map(([k]) => oCua(k)),
      MA_TRAN.map(([, chu]) => chu),
    );
    assert.equal(DA_ROI_SAN, "Đã rời sàn");

    // Cột có trong danh sách cột ẩn được, mặc định hiện (Hỏi-1).
    const cot = COT.find((c) => c.id === "dau-chu");
    assert.deepEqual(cot && { id: cot.id, label: cot.label }, { id: "dau-chu", label: "Đầu chủ" });
    assert.ok(!COT_AN_MAC_DINH.includes("dau-chu"), "cột Đầu chủ phải hiện mặc định");
    assert.ok(CACH_XEM_MAC_DINH.cot.includes("dau-chu"), "cách xem mặc định thiếu cột Đầu chủ");

    // Chiều đỏ cùng ca: đổi listAgentKey của dòng (một lần gán qua API, kéo về) thì ô đổi theo.
    assert.equal(oCua("u-dau-chu-2"), "[Tên] Đầu chủ hai");
    assert.notEqual(oCua("u-dau-chu-2"), oCua("u-dau-chu-1"));
    assert.notEqual(oCua("u-da-nghi"), oCua(null), "người đã rời sàn không được lẫn với căn chưa gán");
  });

  it("cột Đầu chủ: chưa có danh bạ trên máy thì không kết luận «Đã rời sàn»", () => {
    assert.equal(chuDauChu("u-da-nghi", null), "…");
    assert.equal(chuDauChu(null, null), "—");
    assert.equal(chuDauChu("u-dau-chu-1", { ten: new Map([["u-dau-chu-1", " "]]), moi: true }), "Chưa đặt tên");
    // Dòng dựng ngoài Bảng hàng (không trao danh bạ) không có cột ấy.
    assert.ok(!("dau-chu" in ghepDanhMuc(hang("u-dau-chu-1"), new Map())));
  });

  it("cột Đầu chủ: bản danh bạ giữ trên máy không kết luận Đã rời sàn", () => {
    // Ngoài-9 hàng 105 (hàng 48, E9). Ma trận viết trước: (danh bạ, người giữ) → chữ ô.
    const CU: DanhBaDauChu = { ten: TEN, moi: false };
    const MA_TRAN: [string, DanhBaDauChu, string, string][] = [
      ["bản giữ trên máy, người lạ", CU, "u-moi-vao", "…"],
      ["danh bạ máy chủ, người lạ", DANH_BA, "u-moi-vao", "Đã rời sàn"],
      ["bản giữ trên máy, người có tên", CU, "u-dau-chu-1", "[Tên] Đầu chủ một"],
      ["danh bạ máy chủ, người có tên", DANH_BA, "u-dau-chu-1", "[Tên] Đầu chủ một"],
      ["chưa có danh bạ", null, "u-moi-vao", "…"],
    ];
    assert.deepEqual(
      MA_TRAN.map(([, d, k]) => chuDauChu(k, d)),
      MA_TRAN.map(([, , , chu]) => chu),
    );
    // Chiều đỏ cùng ca: hàm cũ (không xét `moi`) cho ca đầu ra «Đã rời sàn».
    const chuCu = (k: string, d: DanhBaDauChu) => (d === null ? "…" : (d.ten.get(k) ?? DA_ROI_SAN));
    assert.equal(chuCu("u-moi-vao", CU), DA_ROI_SAN);
    assert.notEqual(chuDauChu("u-moi-vao", CU), chuCu("u-moi-vao", CU), "bản giữ trên máy kết luận người đã rời sàn");
  });
});
