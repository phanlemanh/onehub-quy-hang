// Kế hoạch hoàn tác lần nhập (hàng 66 nhap-hoan-tac, E3, E4). Dãy sự kiện dựng tay, mỗi sự kiện qua khuôn chặt của lõi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload, type EventType } from "./events";
import { keHoachDong, LY_DO_HOAN_TAC, type DongNhap, type SuKienNhap } from "./hoan-tac-nhap";

const LAN = "lan-nhap-1";
const NGUOI_NHAP = "u-nhap";
const NGUOI_KHAC = "u-khac";

const e = (seq: number, type: EventType, payload: Record<string, unknown>, o: { ai?: string; importId?: string | null } = {}): SuKienNhap => {
  assert.deepEqual(validatePayload(type, payload), [], `${type} ${JSON.stringify(payload)} phải qua khuôn`);
  return {
    seq,
    type,
    payload,
    actorUserId: o.ai ?? NGUOI_NHAP,
    actorRoles: ["listing_agent"],
    confirmedWithOwner: false,
    occurredAt: `2026-11-01T00:00:${String(seq).padStart(2, "0")}.000Z`,
    importId: o.importId ?? null,
  };
};

/** Hàng lần nhập tạo: tạo + giá, mang `import_id`. */
const daySauTao = (): SuKienNhap[] => [e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "A-01" }, { importId: LAN }), e(2, "price_changed", { listPrice: 3_200_000_000, feeInclusion: "included" }, { importId: LAN })];
/** Hàng có sẵn (giá 3 tỷ, phiên bản 2) mà lần nhập đổi giá. */
const daySauCapNhat = (): SuKienNhap[] => [
  e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "B-02" }),
  e(2, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" }),
  e(3, "price_changed", { listPrice: 3_200_000_000, feeInclusion: "included" }, { importId: LAN }),
];
const TAO: DongNhap = { rowNumber: 2, action: "create", listingId: "h-tao", versionBefore: null };
const CAP_NHAT: DongNhap = { rowNumber: 3, action: "update", listingId: "h-cap-nhat", versionBefore: 2 };

// Sự kiện sau lần nhập — viết tay, mỗi loại một payload hợp khuôn.
const SAU: [string, (seq: number, ai: string) => SuKienNhap[]][] = [
  ["details_changed", (s, ai) => [e(s, "details_changed", { furnished: "Cơ bản" }, { ai })]],
  ["price_changed", (s, ai) => [e(s, "price_changed", { listPrice: 3_100_000_000, feeInclusion: "excluded" }, { ai })]],
  ["status_changed→Closed", (s, ai) => [e(s, "status_changed", { to: "Active" }, { ai }), e(s + 1, "status_changed", { to: "Closed", closePrice: 3_100_000_000 }, { ai })]],
  ["owner_confirmed", (s, ai) => [e(s, "owner_confirmed", {}, { ai })]],
];

test("kế hoạch hoàn tác: đã sửa sau thì không gỡ", () => {
  let dem = 0;
  for (const [ten, dong, dayGoc] of [["tạo", TAO, daySauTao], ["cập nhật đổi giá", CAP_NHAT, daySauCapNhat]] as const) {
    for (const [loai, them] of SAU) {
      for (const [vai, ai] of [["người nhập", NGUOI_NHAP], ["người khác", NGUOI_KHAC]] as const) {
        const goc = dayGoc();
        const kq = keHoachDong(dong, [...goc, ...them(goc.length + 1, ai)], LAN);
        assert.equal(kq.ketCuc, "da-sua-sau", `${ten} × ${loai} × ${vai}`);
        assert.equal(kq.lyDo, "Đã có người sửa sau lần nhập", `${ten} × ${loai} × ${vai}: lý do`);
        dem++;
      }
    }
  }
  assert.equal(dem, 16, "ma trận 2 hành động × 4 loại × 2 người");
  // Đối chứng dương: không sự kiện sau.
  const go = keHoachDong(TAO, daySauTao(), LAN);
  assert.deepEqual([go.ketCuc, go.lenh, go.expectedVersion], ["go", { kind: "voided" }, 2], "tạo, chưa ai sửa → gỡ");
  const tra = keHoachDong(CAP_NHAT, daySauCapNhat(), LAN);
  assert.deepEqual([tra.ketCuc, tra.lenh, tra.expectedVersion], ["tra-gia", { kind: "price", listPrice: 3_000_000_000, feeInclusion: "excluded" }, 3], "cập nhật, chưa ai sửa → trả giá cũ");
});

test("kế hoạch hoàn tác: phần không hoàn tác được", () => {
  const boSung = keHoachDong({ rowNumber: 4, action: "supplement", listingId: null, versionBefore: null }, null, LAN);
  const chiNgay = keHoachDong(
    { rowNumber: 5, action: "update", listingId: "h-ngay", versionBefore: 2 },
    [e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "C-03" }), e(2, "price_changed", { listPrice: 2_000_000_000, feeInclusion: "excluded" }), e(3, "owner_confirmed", { confirmedAt: "2026-10-30" }, { importId: LAN })],
    LAN,
  );
  const chuaGia = keHoachDong(
    { rowNumber: 6, action: "update", listingId: "h-chua-gia", versionBefore: 1 },
    [e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "D-04" }), e(2, "price_changed", { listPrice: 2_500_000_000, feeInclusion: "included" }, { importId: LAN })],
    LAN,
  );
  const boQua = keHoachDong({ rowNumber: 7, action: "skip", listingId: null, versionBefore: null }, null, LAN);
  const bon = [boSung, chiNgay, chuaGia, boQua];
  assert.equal(chuaGia.ketCuc, "khong-tra-duoc", "dòng đổi giá cho căn chưa có giá: không trả được");
  assert.deepEqual(bon.map((k) => k.ketCuc), ["tin-bo-sung", "khong-doi", "khong-tra-duoc", "bo-qua"]);
  assert.equal(boSung.lyDo, "Tin bổ sung đã gửi — không thu lại");
  assert.equal(chiNgay.lyDo, "Độ tươi theo ngày trong file vẫn giữ");
  assert.equal(chuaGia.lyDo, "Trước lần nhập căn chưa có giá", "dòng đổi giá cho căn chưa có giá");
  const lietKe = bon.filter((k) => k.lyDo !== null);
  assert.deepEqual(lietKe.map((k) => k.rowNumber), [4, 5, 6], "danh sách liệt kê đúng ba dòng, không dòng bỏ qua");
  for (const k of bon) assert.equal(k.lenh, null, `dòng ${k.rowNumber}: không lệnh ghi`);
  assert.equal(Object.keys(LY_DO_HOAN_TAC).length, 4);
});
