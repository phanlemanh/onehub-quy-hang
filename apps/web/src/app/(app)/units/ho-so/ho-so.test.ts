// Lõi thuần của hồ sơ căn (hàng 17) — E1, E2, E3, E4, E5, E7. Danh mục đọc thẳng từ gói mẫu của hàng 5, đường suy từ
// vị trí tệp này.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { ListingEvent } from "@quy-hang/core/listing";
import { banTrenMay } from "@/lib/sync/ap-tren-may";
import type { ListingView, PendingOp } from "@/lib/sync/types";
import { cacLanRao, chonLanRao, docCot, dongCot, dongLichSu, moCot, phanLanRao, thuocTinh, timCan, trangThaiLichSu } from "./ho-so";

const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../../../../../packages/db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as {
  danhMuc: CatalogData;
};
const dm = goi.danhMuc;
const khuMau = dm.subdivisions[0]!;
const toaA = khuMau.buildings.find((b) => b.buildingName === "Toà A")!;

const hang = (id: string, toa: string, ma: string | null, s: Partial<ListingView> = {}): ListingView => ({
  id,
  buildingName: toa,
  unitNumber: ma,
  standardStatus: "Active",
  listPrice: 3_250_000_000,
  feeInclusion: "included",
  furnished: "Cơ bản",
  legalStatus: "Sổ hồng",
  financing: null,
  occupantType: "Đang trống",
  closePrice: null,
  closeDate: null,
  withdrawnReason: null,
  lastConfirmedAt: null,
  version: 3,
  ...s,
});

const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>, ai: string, vai: string[], luc: string): ListingEvent => ({
  seq,
  type,
  payload,
  actorUserId: ai,
  actorRoles: vai,
  confirmedWithOwner: type === "owner_confirmed",
  occurredAt: luc,
});

// ——— E1 ———

test("đường của cột hồ sơ", () => {
  // Ma trận viết trước: mỗi ca (toà, mã, lần rao) → đọc ngược đúng.
  const CA: [string, string, string, string][] = [
    ["mã thường", "Toà A", "A-01.02", "l-1"],
    ["mã cần mã hoá", "Toà A", "A-12.03 & 4", "l-2"],
    ["toà có dấu cách", "Toà B phụ", "B-08.02", "l-3"],
  ];
  for (const [ten, toa, ma, lan] of CA) {
    const qs = moCot(new URLSearchParams(), { ma, toa, lan });
    assert.deepEqual(docCot(new URLSearchParams(qs)), { ma, toa, lan }, `${ten}: URL ${qs}`);
  }
  // Luôn kèm toà, kể cả mã chỉ có ở một toà.
  const qs = moCot(new URLSearchParams(), { ma: "A-01.02", toa: "Toà A", lan: "l-1" });
  assert.equal(new URLSearchParams(qs).get("toa"), "Toà A", `luôn kèm toà: mã A-01.02, URL đọc được ${qs}`);
  assert.deepEqual(docCot(new URLSearchParams("unit=A-01.02")), { ma: "A-01.02", toa: null, lan: null }, "chỉ unit không toa → toà null");
  assert.equal(docCot(new URLSearchParams("view=list")), null, "không có unit → null");
  // Đóng: bỏ ba tham số, giữ tham số khác nguyên thứ tự.
  const truoc = new URLSearchParams("view=list&unit=A-01.02&toa=To%C3%A0+A&lan=l-1&loc=x");
  assert.equal(dongCot(truoc), "view=list&loc=x");
});

// ——— E2 ———

test("thuộc tính căn tự điền", () => {
  const ba = toaA.units.slice(0, 3);
  for (const u of ba) {
    const t = thuocTinh(dm, "Toà A", u.unitNumber);
    assert.equal(t.kind, "co", u.unitNumber);
    if (t.kind !== "co") continue;
    const mong: [string, string][] = [
      ["Loại căn", u.bedroomsTotal === 0 ? "Studio" : `${u.bedroomsTotal}PN`],
      ["Diện tích", `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(u.livingArea!)} m²`],
      ["Tầng", String(u.floor)],
      ["Hướng", u.directionFaces!],
      ["Toà", "Toà A"],
      ["Khu", khuMau.subdivisionName],
      ["Loại hình", "Căn hộ"],
    ];
    for (let i = 0; i < 7; i++) assert.deepEqual(t.truong[i], mong[i], `${u.unitNumber} · ${mong[i]![0]}`);
  }
  // Hai toà trùng mã: mỗi toà ra đúng diện tích của mình.
  const goc = toaA.units[0]!;
  const ban = structuredClone(dm) as unknown as { subdivisions: { buildings: { buildingName: string; units: unknown[] }[] }[] };
  ban.subdivisions[0]!.buildings.find((b) => b.buildingName === "Toà B")!.units.push({ ...goc, upi: "urn:mau:trung", livingArea: 120 });
  const a = thuocTinh(ban as unknown as CatalogData, "Toà A", goc.unitNumber);
  const b = thuocTinh(ban as unknown as CatalogData, "Toà B", goc.unitNumber);
  const dt = (t: typeof a) => (t.kind === "co" ? t.truong[1]![1] : "ngoài");
  assert.notEqual(dt(a), dt(b), `trùng mã ${goc.unitNumber}: Toà A ${dt(a)} · Toà B ${dt(b)}`);
  assert.equal(dt(b), "120 m²", `Toà B phải ra 120 m², được ${dt(b)}`);
  // Ngoài danh mục.
  assert.deepEqual(thuocTinh(dm, "Toà A", "Z-00.00"), { kind: "ngoai-danh-muc" });
});

// ——— E3 ———

test("lần rao của căn", () => {
  const ma = toaA.units[1]!.unitNumber;
  const ds = [
    hang("mo", "Toà A", ma, { standardStatus: "Active" }),
    hang("cu", "Toà A", ma, { standardStatus: "Withdrawn", listPrice: 3_100_000_000 }),
    hang("toa-kia", "Toà B", ma),
    hang("d", "Toà A", "D-01", { standardStatus: "Withdrawn" }),
  ];
  const lichSu = {
    mo: [su(1, "created", { buildingName: "Toà A", unitNumber: ma }, "x", ["listing_agent"], "2026-10-02T03:20:00Z")],
    cu: [su(1, "created", { buildingName: "Toà A", unitNumber: ma }, "x", ["listing_agent"], "2026-03-14T03:20:00Z")],
  };
  const lan = cacLanRao(ds, "Toà A", ma, lichSu);
  assert.deepEqual(lan, [
    { id: "mo", trangThai: "Đang bán", dangMo: true, gia: "3,25 tỷ", tu: "2026-10-02T03:20:00Z" },
    { id: "cu", trangThai: "Ngừng hẳn", dangMo: false, gia: "3,1 tỷ", tu: "2026-03-14T03:20:00Z" },
  ]);
  assert.equal(chonLanRao(lan, null), "mo", "lan vắng → lần đang mở");
  assert.equal(chonLanRao(lan, "cu"), "cu", "chọn lần rao đã ngừng: id mong cu, đọc được " + chonLanRao(lan, "cu"));
  assert.equal(chonLanRao(cacLanRao(ds, "Toà A", "D-01", {}), null), "d", "căn không còn lần mở → lần mới nhất");
  assert.equal(chonLanRao(lan, "toa-kia"), "mo", "lan của căn khác → bỏ qua");
  // Thao tác đổi giá chờ gửi: phần lần rao đọc bản trên máy.
  const op: PendingOp = { opId: "o1", listingId: "mo", type: "price_changed", payload: { listPrice: 3_400_000_000, feeInclusion: "included" }, expectedVersion: 3, clientSeq: 1, createdAt: "2026-11-01T00:00:00Z" };
  const tren = banTrenMay(ds[0]!, [op]);
  const p = phanLanRao(tren);
  assert.equal(p.gia, "3,4 tỷ", `giá chờ gửi: mong 3,4 tỷ, đọc được ${p.gia}`);
  assert.deepEqual(p.mucDu, { co: 4, tren: 5, thieu: ["financing"] });
});

// ——— E4 ———

test("dòng lịch sử từ sự kiện", () => {
  const X = "u-x";
  const Y = "u-y";
  const ev = [
    su(1, "created", { buildingName: "Toà A", unitNumber: "A-01.02" }, X, ["listing_agent"], "2026-10-02T03:20:00Z"),
    su(2, "price_changed", { listPrice: 3_400_000_000, feeInclusion: "included" }, X, ["listing_agent"], "2026-10-02T03:21:00Z"),
    su(3, "status_changed", { to: "Active" }, X, ["listing_agent"], "2026-10-02T03:30:00Z"),
    su(4, "details_changed", { legalStatus: "Sổ hồng" }, X, ["listing_agent"], "2026-10-15T07:05:00Z"),
    su(5, "price_changed", { listPrice: 3_250_000_000, feeInclusion: "included" }, Y, ["team_lead"], "2026-10-28T02:12:00Z"),
    su(6, "owner_confirmed", {}, X, ["listing_agent"], "2026-10-31T09:40:00Z"),
  ];
  assert.deepEqual(dongLichSu(ev, X), [
    { viec: "Xác nhận với chủ nhà", chiTiet: null, nguoi: "Bạn", luc: "2026-10-31T09:40:00Z" },
    { viec: "Đổi giá", chiTiet: "3,4 tỷ → 3,25 tỷ", nguoi: "Trưởng nhóm", luc: "2026-10-28T02:12:00Z" },
    { viec: "Đổi phần lần rao", chiTiet: "Pháp lý: Sổ hồng", nguoi: "Bạn", luc: "2026-10-15T07:05:00Z" },
    { viec: "Đổi trạng thái", chiTiet: "Chưa đủ để rao → Đang bán", nguoi: "Bạn", luc: "2026-10-02T03:30:00Z" },
    { viec: "Đổi giá", chiTiet: "— → 3,4 tỷ", nguoi: "Bạn", luc: "2026-10-02T03:21:00Z" },
    { viec: "Tạo lần rao", chiTiet: null, nguoi: "Bạn", luc: "2026-10-02T03:20:00Z" },
  ]);
  // Hỏi-3: giao vai, không giao người — hai đầu chủ khác nhau cùng một nhãn.
  const z1 = dongLichSu([su(1, "created", {}, "u-z1", ["listing_agent"], "2026-10-01T00:00:00Z")], X)[0]!.nguoi;
  const z2 = dongLichSu([su(1, "created", {}, "u-z2", ["listing_agent"], "2026-10-01T00:00:00Z")], X)[0]!.nguoi;
  assert.equal(z1, "Đầu chủ");
  assert.equal(z1, z2);
});

// ——— E5 ———

test("lịch sử khi mất mạng", () => {
  const CA: [string, Parameters<typeof trangThaiLichSu>[0], string, string | null][] = [
    ["đã tải, kéo ok", { coBan: true, dangTai: false, lan: "ok" }, "da-tai", null],
    ["đã tải, mất mạng", { coBan: true, dangTai: false, lan: "mang" }, "tren-may", "đang xem bản trên máy"],
    ["chưa tải, mất mạng", { coBan: false, dangTai: false, lan: "mang" }, "can-mang", "Lịch sử cần mạng để tải lần đầu"],
    ["chưa tải, đang tải", { coBan: false, dangTai: true, lan: "ok" }, "dang-tai", null],
  ];
  for (const [ten, vao, kind, chu] of CA) {
    const r = trangThaiLichSu(vao);
    assert.equal(r.kind, kind, `${ten}: trạng thái`);
    assert.equal(r.chu, chu, `${ten}: chữ mong «${chu}»`);
  }
});

// ——— E7 ———

test("tìm căn theo mã", () => {
  const ds = [hang("a1", "Toà A", "A-01.02"), hang("t-a", "Toà A", "T-1"), hang("t-b", "Toà B", "T-1")];
  assert.deepEqual(timCan(ds, " a-01.02 ", null), { kind: "mot", toa: "Toà A", hang: [ds[0]] });
  assert.deepEqual(timCan(ds, "T-1", null), { kind: "nhieu", toa: ["Toà A", "Toà B"] }, "mã trùng hai toà: liệt Toà A, Toà B");
  assert.deepEqual(timCan(ds, "T-1", "Toà B"), { kind: "mot", toa: "Toà B", hang: [ds[2]] });
  assert.deepEqual(timCan(ds, "KHONG-CO", null), { kind: "khong" });
  // Hàng «Chỉ tôi» của người khác không có trên máy (API không trả) — mã của nó cũng là «không có».
  assert.deepEqual(timCan(ds.filter((l) => l.id !== "a1"), "A-01.02", null), { kind: "khong" });
});
