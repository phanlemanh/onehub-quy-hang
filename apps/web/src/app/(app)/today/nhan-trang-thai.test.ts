// Hôm nay đầu chủ đọc nhãn trạng thái riêng của sàn (hàng 46, E7): dòng «Mới đổi» và mốc «Đang bán N ngày». Bộ nhãn dựng
// bằng `nhanTuBang` của lõi từ thân API viết trước; chuỗi mong đợi viết tay. Dữ liệu mẫu, không người thật; bayGio cố định
// 2026-11-01 10:00 giờ Việt Nam.
import assert from "node:assert/strict";
import { test } from "node:test";
import { nhanTuBang } from "@quy-hang/core/statuses";
import { BO_NHOM_MAC_DINH, type DuKienCan, type LanDoi, type Nhom } from "@quy-hang/core/today";
import { lyDo } from "./ly-do";

const BAY_GIO = "2026-11-01T03:00:00.000Z";
const TOI = "u-dau-chu-1";
const lui = (ngay: number) => new Date(Date.parse(BAY_GIO) - ngay * 86_400_000).toISOString();
const MOI_DOI = BO_NHOM_MAC_DINH.find((n) => n.code === "recent_change")!;

// Thân `GET /api/v1/company/labels` phần `statuses` (khuôn `code`), như máy chủ trả.
const THAN = {
  statuses: [
    { status: "Incomplete", default: "Chưa đủ để rao", labels: [] },
    { status: "Active", default: "Đang bán", labels: [] },
    { status: "Pending", default: "Đang giao dịch", labels: [{ code: "giu_cho", label: "Giữ chỗ", inUse: 1 }] },
    { status: "Closed", default: "Đã bán", labels: [] },
    { status: "Hold", default: "Tạm ngừng", labels: [] },
    { status: "Withdrawn", default: "Ngừng hẳn", labels: [] },
  ],
};
const NHAN = nhanTuBang(THAN);

const CAN: DuKienCan = {
  standardStatus: "Pending",
  listAgentKey: TOI,
  lastConfirmedAt: null,
  priceChangeTimestamp: null,
  lastPriceChange: null,
  lastStatusChange: null,
  missing: [],
  propertySubType: "Condominium",
};
const doi = (l: Omit<LanDoi, "byUserId" | "at" | "byRoles"> & Partial<LanDoi>): DuKienCan => ({
  ...CAN,
  lastStatusChange: { byRoles: ["team_lead"], byUserId: "u-khac", at: lui(0), ...l },
});

test("hôm nay: dòng lần đổi đọc nhãn", () => {
  assert.deepEqual(NHAN, [{ ma: "giu_cho", label: "Giữ chỗ", anchor: "Pending" }]);
  const MA_TRAN: [string, DuKienCan, string][] = [
    ["sang nhãn riêng", doi({ from: "Active", to: "Pending", toLabel: "giu_cho" }), "Đang bán → Giữ chỗ — Trưởng nhóm, hôm nay"],
    ["đổi nhãn tại chỗ", doi({ from: "Pending", fromLabel: null, to: "Pending", toLabel: "giu_cho", at: lui(1) }), "Đang giao dịch → Giữ chỗ — Trưởng nhóm, hôm qua"],
    [
      "gỡ nhãn có thay",
      doi({ from: "Pending", fromLabel: "giu_cho", to: "Pending", toLabel: null, byRoles: ["company_admin"] }),
      "Giữ chỗ → Đang giao dịch — Quản trị sàn, hôm nay",
    ],
    // Lần đổi không nhãn: đúng chuỗi trước hàng 46.
    ["không nhãn", doi({ from: "Active", to: "Pending" }), "Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay"],
  ];
  for (const [ten, can, mong] of MA_TRAN) assert.equal(lyDo(MOI_DOI, can, TOI, BAY_GIO, NHAN), mong, ten);
  // Sàn chưa đặt nhãn: chữ cũ từng byte.
  assert.equal(lyDo(MOI_DOI, doi({ from: "Active", to: "Pending" }), TOI, BAY_GIO), "Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay");
  // Mã nhãn không còn trong bộ → nhãn mặc định.
  assert.equal(lyDo(MOI_DOI, doi({ from: "Active", to: "Pending", toLabel: "da_go" }), TOI, BAY_GIO, NHAN), "Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay");

  // Mốc «Đang bán N ngày»: vào Đang bán lúc t1 (20 ngày trước), đổi nhãn tại chỗ lúc t2 (2 ngày trước) — tính từ t1.
  const DANG_BAN_LAU: Nhom = {
    code: "dang_ban_lau",
    label: "Đang bán lâu",
    subject: "listing",
    enabled: true,
    conditions: [{ kind: "days_since", anchor: "active_since", days: 14 }],
    actions: ["open_record"],
  };
  const can: DuKienCan = {
    ...CAN,
    standardStatus: "Active",
    lucVaoTrangThai: lui(20),
    lastStatusChange: { from: "Active", fromLabel: null, to: "Active", toLabel: "uu_tien", byRoles: ["team_lead"], byUserId: "u-khac", at: lui(2) },
  };
  assert.equal(lyDo(DANG_BAN_LAU, can, TOI, BAY_GIO, NHAN), "Đang bán 20 ngày");
});
