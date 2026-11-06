// Trạng thái riêng (hàng 46, hồ sơ trang-thai-rieng) — E2, E6b, E10b và hai hàm ghi/đọc của API (Task 2 của kế hoạch).
// Dữ liệu thử: «[Tên]», 0900 000 0xx; mã nhãn trong ca: giu_cho («Giữ chỗ», neo Pending).
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingEvent } from "../listing/events";
import { foldListing, type ListingState } from "../listing/fold";
import { STANDARD_STATUSES, type StandardStatus } from "../listing/status";
import { mucDuCaoNhat } from "../metrics/hang";
import { nhomCuaCan } from "../today/hang-doi";
import type { DuKienCan, LanDoi } from "../today/kieu";
import { BO_NHOM_MAC_DINH } from "../today/mac-dinh";
import {
  bangTrangThai,
  boNhanTrangThai,
  doiNhanTrangThai,
  dongNhanTrangThai,
  KHOA_TRANG_THAI,
  kiemNhanTrangThai,
  maNhanMoi,
  NHAN_TRANG_THAI_MAC_DINH,
  nhanTuBang,
  type KetQuaKiemBo,
  type NhanGui,
  type NhanTrangThai,
} from "./index";

const GIU_CHO: NhanTrangThai = { ma: "giu_cho", label: "Giữ chỗ", anchor: "Pending" };
/** Đúng 40 ký tự, chỉ chữ (không chạm luật số điện thoại, email, giấy tờ). */
const CHU_40 = `Giữ chỗ${"a".repeat(33)}`;

type DongKiem = { ten: string; gui: NhanGui[]; mong: { ok: true; nhan: NhanTrangThai[] } | { ok: false; loi: RegExp } };

/** Bảng viết trước của E2: mười hai dòng, mỗi phần tử của AC-2 ít nhất một dòng. */
const BANG: DongKiem[] = [
  { ten: "{Giữ chỗ, Pending} → ok", gui: [{ label: "Giữ chỗ", anchor: "Pending" }], mong: { ok: true, nhan: [GIU_CHO] } },
  {
    ten: "{Giữ chỗ, thiếu neo} → lỗi mở đầu labels.status",
    gui: [{ label: "Giữ chỗ" } as unknown as NhanGui],
    mong: { ok: false, loi: /^labels\.status\..*thiếu trạng thái chuẩn/ },
  },
  {
    ten: "{Giữ chỗ, neo Reserved} → lỗi nêu sáu trạng thái chuẩn",
    gui: [{ label: "Giữ chỗ", anchor: "Reserved" }],
    mong: { ok: false, loi: /^labels\.status\..*Reserved.*Incomplete, Active, Pending, Closed, Hold, Withdrawn/ },
  },
  {
    ten: "bốn nhãn cùng neo Pending → lỗi nêu trần 3",
    gui: ["Giữ chỗ", "Đặt cọc", "Chờ ký", "Chờ công chứng"].map((label) => ({ label, anchor: "Pending" })),
    mong: { ok: false, loi: /^labels\.status\.Pending: tối đa 3 nhãn/ },
  },
  {
    ten: "{Đang bán, Hold} → lỗi trùng nhãn mặc định",
    gui: [{ label: "Đang bán", anchor: "Hold" }],
    mong: { ok: false, loi: /^labels\.status\..*trùng tên trạng thái «Đang bán»/ },
  },
  {
    ten: "{giữ  chỗ, Hold} cạnh {Giữ chỗ, Pending} → lỗi trùng (bỏ hoa thường, dấu cách thừa)",
    gui: [
      { label: "Giữ chỗ", anchor: "Pending" },
      { label: "giữ  chỗ", anchor: "Hold" },
    ],
    mong: { ok: false, loi: /^labels\.status\..*trùng tên nhãn/ },
  },
  {
    ten: "{Gọi 0900 000 001, Pending} → lỗi nêu số điện thoại",
    gui: [{ label: "Gọi 0900 000 001", anchor: "Pending" }],
    mong: { ok: false, loi: /^labels\.status\..*số điện thoại/ },
  },
  {
    ten: "{Liên hệ [Tên]@vidu.vn, Pending} → lỗi nêu email",
    gui: [{ label: "Liên hệ [Tên]@vidu.vn", anchor: "Pending" }],
    mong: { ok: false, loi: /^labels\.status\..*email/ },
  },
  { ten: "nhãn 41 ký tự → lỗi", gui: [{ label: `${CHU_40}a`, anchor: "Pending" }], mong: { ok: false, loi: /^labels\.status\..*dài hơn 40/ } },
  {
    ten: "nhãn đúng 40 ký tự → ok",
    gui: [{ label: CHU_40, anchor: "Pending" }],
    mong: { ok: true, nhan: [{ ma: maNhanMoi(CHU_40, []), label: CHU_40, anchor: "Pending" }] },
  },
  {
    ten: "nhãn 40 ký tự kèm hai khoảng trắng mỗi đầu → ok, label lưu đã bỏ khoảng trắng",
    gui: [{ label: `  ${CHU_40}  `, anchor: "Pending" }],
    mong: { ok: true, nhan: [{ ma: maNhanMoi(CHU_40, []), label: CHU_40, anchor: "Pending" }] },
  },
  {
    ten: "ba nhãn neo ba trạng thái khác nhau → ok",
    gui: [
      { label: "Giữ chỗ", anchor: "Pending" },
      { label: "Mở bán lại", anchor: "Active" },
      { label: "Chờ chủ về", anchor: "Hold" },
    ],
    mong: {
      ok: true,
      nhan: [GIU_CHO, { ma: "mo_ban_lai", label: "Mở bán lại", anchor: "Active" }, { ma: "cho_chu_ve", label: "Chờ chủ về", anchor: "Hold" }],
    },
  },
];

const khop = (kq: KetQuaKiemBo, mong: DongKiem["mong"]) =>
  mong.ok ? kq.ok && JSON.stringify(kq.nhan) === JSON.stringify(mong.nhan) : !kq.ok && mong.loi.test(kq.loi);

test("trạng thái riêng: kiểm bộ nhãn", () => {
  assert.equal(BANG.length, 12);
  assert.equal(CHU_40.length, 40);
  for (const d of BANG) {
    const kq = kiemNhanTrangThai(d.gui, []);
    assert.ok(khop(kq, d.mong), `${d.ten} — được ${JSON.stringify(kq)}`);
  }

  assert.equal(maNhanMoi("Giữ chỗ", []), "giu_cho");
  assert.equal(maNhanMoi("Giữ chỗ", ["giu_cho"]), "giu_cho_2");

  // «giữ chỗ» → «Giữ chỗ» cùng mã là đổi tên, không tạo mã mới.
  const daCo: NhanTrangThai[] = [{ ma: "giu_cho", label: "giữ chỗ", anchor: "Pending" }];
  assert.deepEqual(kiemNhanTrangThai([{ code: "giu_cho", label: "Giữ chỗ", anchor: "Pending" }], daCo), { ok: true, nhan: [GIU_CHO] });
});

/** Bản hàng viết trước: gấp từ sự kiện của lõi, cộng mã nhãn của căn (cột `status_label`). */
const banHang = (to: StandardStatus, statusLabel: string | null): ListingState & { statusLabel: string | null } => {
  const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>): ListingEvent => ({
    seq,
    type,
    payload,
    actorUserId: "dau-chu-1",
    actorRoles: ["listing_agent"],
    confirmedWithOwner: type !== "created",
    occurredAt: `2026-11-0${seq}T02:00:00.000Z`,
  });
  return { ...foldListing([su(1, "created", { buildingName: "Toà A", unitNumber: "A-0101" }), su(2, "status_changed", { to, ...(statusLabel ? { label: statusLabel } : {}) })]), statusLabel };
};

test("trạng thái riêng: đếm theo chuẩn", () => {
  const ds = [banHang("Pending", "giu_cho"), banHang("Pending", "giu_cho"), banHang("Pending", null), banHang("Active", null)];
  const { theoTrangThai } = mucDuCaoNhat(ds) as Extract<ReturnType<typeof mucDuCaoNhat>, { kieu: "ti-le" }>;
  const khoa = Object.keys(theoTrangThai);
  assert.deepEqual(
    khoa.filter((k) => !(STANDARD_STATUSES as readonly string[]).includes(k)),
    [],
    `mọi khoá đếm là trạng thái chuẩn — không có khoá thứ bảy: ${khoa.join(", ")}`,
  );
  assert.deepEqual([...khoa].sort((a, b) => STANDARD_STATUSES.indexOf(a as StandardStatus) - STANDARD_STATUSES.indexOf(b as StandardStatus)), ["Active", "Pending"]);
  assert.equal(theoTrangThai.Pending?.mau, 3);
  assert.equal(theoTrangThai.Active?.mau, 1);

  // Hàng đợi Hôm nay dựng từ bộ mặc định: căn Pending/giu_cho vào cùng nhóm với căn Pending/null.
  const BAY_GIO = "2026-11-06T03:00:00.000Z";
  const can = (statusLabel: string | null, o: Partial<DuKienCan>): DuKienCan & { statusLabel: string | null } => {
    const lan: LanDoi & { toLabel: string | null } = { at: "2026-10-01T02:00:00.000Z", byUserId: "dau-chu-1", byRoles: ["listing_agent"], from: "Active", to: "Pending", toLabel: statusLabel };
    return { standardStatus: "Pending", listAgentKey: "dau-chu-1", lastConfirmedAt: "2026-10-01T02:00:00.000Z", priceChangeTimestamp: null, lastPriceChange: null, lastStatusChange: lan, missing: [], propertySubType: null, statusLabel, ...o };
  };
  const canhBao: [string, Partial<DuKienCan>][] = [
    ["xác nhận cũ", {}],
    ["thiếu thông tin", { lastConfirmedAt: BAY_GIO, missing: ["listPrice"] }],
  ];
  for (const [ten, o] of canhBao) {
    const coNhan = nhomCuaCan(BO_NHOM_MAC_DINH, can("giu_cho", o), "dau-chu-1", BAY_GIO);
    const khongNhan = nhomCuaCan(BO_NHOM_MAC_DINH, can(null, o), "dau-chu-1", BAY_GIO);
    assert.ok(khongNhan, `${ten}: căn Pending/null có nhóm`);
    assert.equal(coNhan?.code, khongNhan.code, `${ten}: căn Pending/giu_cho cùng nhóm với căn Pending/null`);
  }
});

test("trạng thái riêng: sàn chưa đặt", () => {
  assert.deepEqual(boNhanTrangThai([]), []);
  const hong: { key: string; value: unknown }[] = [
    { key: "labels.field.feeInclusion", value: "Phí" },
    { key: "queue.groups", value: [] },
    { key: "labels.status.Giu Cho", value: { label: "Giữ chỗ", anchor: "Pending" } },
    { key: "labels.status.so", value: 7 },
    { key: "labels.status.neo_la", value: { label: "Giữ chỗ", anchor: "Reserved" } },
    { key: "labels.status.da_go", value: null },
    { key: "labels.status.rong", value: { label: "  ", anchor: "Pending" } },
    null as unknown as { key: string; value: unknown },
  ];
  assert.doesNotThrow(() => boNhanTrangThai(hong));
  assert.deepEqual(boNhanTrangThai(hong), [], "mọi dòng hỏng bị bỏ qua");
  assert.deepEqual(boNhanTrangThai([...hong, { key: "labels.status.giu_cho", value: { label: "Giữ chỗ", anchor: "Pending" } }]), [GIU_CHO], "đối chứng dương");
});

test("trạng thái riêng: dòng sẽ ghi và chỉ khoá đổi", () => {
  const bo: NhanTrangThai[] = [GIU_CHO, { ma: "cho_chu_ve", label: "Chờ chủ về", anchor: "Hold" }];
  const dong = dongNhanTrangThai(bo);
  assert.deepEqual(dong, [
    { key: "labels.status.giu_cho", value: { label: "Giữ chỗ", anchor: "Pending" } },
    { key: "labels.status.cho_chu_ve", value: { label: "Chờ chủ về", anchor: "Hold" } },
  ]);
  assert.deepEqual(boNhanTrangThai(dong), [GIU_CHO, bo[1]].sort((a, b) => STANDARD_STATUSES.indexOf(a!.anchor) - STANDARD_STATUSES.indexOf(b!.anchor)), "ghi rồi đọc lại ra đúng bộ");

  // jsonb trả khoá theo thứ tự của nó: cùng giá trị khác thứ tự khoá vẫn là «không đổi».
  const daLuu = [
    { key: "labels.status.giu_cho", value: { anchor: "Pending", label: "Giữ chỗ" } },
    { key: "labels.status.cho_chu_ve", value: { label: "Chờ chủ về", anchor: "Hold" } },
    { key: "labels.status.da_go", value: null },
    { key: "labels.field.feeInclusion", value: "Phí" },
  ];
  assert.deepEqual(doiNhanTrangThai(daLuu, bo), [], "gửi lại cùng bộ → không dòng nào");
  assert.deepEqual(doiNhanTrangThai(daLuu, [GIU_CHO]), [{ key: "labels.status.cho_chu_ve", value: null }], "gỡ mã sống → một dòng null");
  assert.deepEqual(
    doiNhanTrangThai(daLuu, [{ ...GIU_CHO, label: "Giữ chỗ 7 ngày" }, bo[1]!]),
    [{ key: "labels.status.giu_cho", value: { label: "Giữ chỗ 7 ngày", anchor: "Pending" } }],
    "đổi chữ cùng mã → một dòng, giữ khoá",
  );
  assert.deepEqual(
    doiNhanTrangThai(daLuu, [...bo, { ma: "da_go", label: "Đặt cọc", anchor: "Pending" }]),
    [{ key: "labels.status.da_go", value: { label: "Đặt cọc", anchor: "Pending" } }],
    "mã đã gỡ (null) dùng lại → một dòng; mã đã gỡ vắng trong bộ mới không ghi null lần nữa",
  );
  assert.ok(doiNhanTrangThai(daLuu, []).every((d) => d.key.startsWith(KHOA_TRANG_THAI)), "không đụng dòng ngoài họ labels.status.*");
});

test("trạng thái riêng: thân bảng trạng thái", () => {
  const rong = bangTrangThai([], {});
  assert.deepEqual(
    rong.statuses.map((s) => [s.status, s.default, s.labels]),
    STANDARD_STATUSES.map((s) => [s, NHAN_TRANG_THAI_MAC_DINH[s], []]),
    "sáu dòng theo thứ tự chuẩn, sàn chưa đặt nhãn",
  );
  const bo: NhanTrangThai[] = [GIU_CHO, { ma: "dat_coc", label: "Đặt cọc", anchor: "Pending" }, { ma: "cho_chu_ve", label: "Chờ chủ về", anchor: "Hold" }];
  const than = bangTrangThai(bo, { giu_cho: 2 });
  assert.deepEqual(than.statuses.map((s) => s.status), [...STANDARD_STATUSES]);
  assert.deepEqual(than.statuses.find((s) => s.status === "Pending")?.labels, [
    { code: "giu_cho", label: "Giữ chỗ", inUse: 2 },
    { code: "dat_coc", label: "Đặt cọc", inUse: 0 },
  ]);
  assert.deepEqual(than.statuses.find((s) => s.status === "Hold")?.labels, [{ code: "cho_chu_ve", label: "Chờ chủ về", inUse: 0 }]);
  assert.deepEqual(nhanTuBang(than), bo, "nhanTuBang đọc ngược đúng bộ nhãn");
});
