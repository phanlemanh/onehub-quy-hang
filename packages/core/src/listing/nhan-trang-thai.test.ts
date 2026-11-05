// Nhãn trạng thái riêng trên bản gập (hàng 46, E3b): `status_changed` mang khoá `label` (mã nhãn hay null), bản gập giữ
// `statusLabel`, mọi `status_changed` đặt lại nhãn; đổi nhãn tại chỗ là ngoại lệ duy nhất của bảng chuyển, kiểm ở lõi nhãn.
import assert from "node:assert/strict";
import { test } from "node:test";
import { kiemNhanSuKien, type NhanTrangThai } from "../statuses";
import { lucLenDangBan } from "../today/hang-doi";
import type { DuKienCan } from "../today/kieu";
import { validatePayload, type EventType, type ListingEvent } from "./events";
import { foldListing } from "./fold";
import { checkTransition } from "./status";

let lan = 0;
const e = (seq: number, type: EventType, payload: Record<string, unknown> = {}): ListingEvent => {
  assert.deepEqual(validatePayload(type, payload), [], `${type} ${JSON.stringify(payload)} phải qua khuôn`);
  return { seq, type, payload, actorUserId: "u1", actorRoles: ["listing_agent"], confirmedWithOwner: false, occurredAt: `2026-11-0${(lan++ % 5) + 1}T00:00:00.000Z` };
};

const NHAN: NhanTrangThai[] = [{ ma: "giu_cho", label: "Giữ chỗ", anchor: "Pending" }];

test("bản gập: nhãn trạng thái", () => {
  // Chuỗi viết trước: mỗi bước một assert, đếm bằng số bước.
  const BUOC: [Record<string, unknown>, string | null][] = [
    [{ to: "Active" }, null],
    [{ to: "Pending", label: "giu_cho" }, "giu_cho"],
    [{ to: "Pending", label: null }, null],
    [{ to: "Pending", label: "giu_cho" }, "giu_cho"],
    [{ to: "Active" }, null],
  ];
  const ds: ListingEvent[] = [e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "A-01" }), e(2, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" })];
  assert.equal(foldListing(ds).statusLabel, null, "bước 0: created");
  let dem = 0;
  BUOC.forEach(([p, mong], i) => {
    ds.push(e(ds.length + 1, "status_changed", p));
    assert.equal(foldListing(ds).statusLabel, mong, `bước ${i + 1}: ${JSON.stringify(p)}`);
    dem++;
  });
  assert.equal(dem, BUOC.length);

  // Khuôn của khoá label: mã hay null qua; chữ hiện và số bị từ chối.
  assert.deepEqual(validatePayload("status_changed", { to: "Pending", label: "giu_cho" }), []);
  assert.deepEqual(validatePayload("status_changed", { to: "Pending", label: null }), []);
  assert.match(JSON.stringify(validatePayload("status_changed", { to: "Pending", label: "Giữ chỗ" })), /label/);
  assert.match(JSON.stringify(validatePayload("status_changed", { to: "Pending", label: 7 })), /label/);

  // Bảng chuyển giữ nguyên; đổi nhãn tại chỗ là việc của kiemNhanSuKien.
  assert.equal(checkTransition("Pending", "Pending", {}).ok, false);
  assert.deepEqual(kiemNhanSuKien(NHAN, { standardStatus: "Pending", statusLabel: null }, { to: "Pending", label: "giu_cho" }), { ok: true, doiNhanTaiCho: true });
  const trung = kiemNhanSuKien(NHAN, { standardStatus: "Pending", statusLabel: "giu_cho" }, { to: "Pending", label: "giu_cho" });
  assert.equal(trung.ok, false);
});

test("bản gập: chuỗi không mang label có statusLabel null", () => {
  const ds = [e(1, "created", { buildingName: "[Toà mẫu]" }), e(2, "status_changed", { to: "Hold" }), e(3, "status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" })];
  assert.equal(foldListing(ds).statusLabel, null);
});

test("hôm nay: mốc lên Đang bán đọc lúc vào trạng thái, không đọc lần đổi nhãn", () => {
  const t1 = "2026-11-01T00:00:00.000Z";
  const t2 = "2026-11-04T00:00:00.000Z";
  const can = (lucVao: string | null | undefined): DuKienCan => ({
    standardStatus: "Active",
    listAgentKey: null,
    lastConfirmedAt: null,
    priceChangeTimestamp: null,
    lastPriceChange: null,
    // Lần đổi gần nhất là đổi nhãn tại chỗ trong Đang bán, lúc t2.
    lastStatusChange: { at: t2, byUserId: "u2", byRoles: ["team_lead"], from: "Active", to: "Active", toLabel: "dang_day" },
    ...(lucVao !== undefined && { lucVaoTrangThai: lucVao }),
    missing: [],
    propertySubType: null,
  });
  assert.equal(lucLenDangBan(can(t1)), t1, "có lúc vào trạng thái → đọc t1");
  // Đối chứng dương: dữ kiện đời trước (không có lucVaoTrangThai) vẫn đọc lần đổi gần nhất như cũ.
  assert.equal(lucLenDangBan(can(undefined)), t2);
  assert.equal(lucLenDangBan({ ...can(t1), standardStatus: "Pending" }), null);
});
