import assert from "node:assert/strict";
import { test } from "node:test";
import { completeness } from "./completeness";
import { confirmsWithOwner, NGAY_KHONG_CO_THAT, NGAY_SAI_DANG, validatePayload, type EventType, type ListingEvent } from "./events";
import { foldListing, stepListing } from "./fold";
import { freshness } from "./freshness";
import { NGAY_CO_THAT, NGAY_KHONG_CO_THAT_CA, NGAY_SAI_DANG_CA } from "./ngay-ca.fixture";

/** Dựng dãy sự kiện như API dựng: cờ xác nhận theo luật mặc định, trừ khi lệnh tắt. */
function day(buoc: [EventType, Record<string, unknown>, string, boolean?][]): ListingEvent[] {
  return buoc.map(([type, payload, occurredAt, requested], i) => ({
    seq: i + 1,
    type,
    payload,
    actorUserId: "u-1",
    actorRoles: ["listing_agent"],
    confirmedWithOwner: confirmsWithOwner(type, requested),
    occurredAt,
  }));
}
const TAO: [EventType, Record<string, unknown>, string] = ["created", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, "2026-10-01T09:00:00.000Z"];
const HOM_NAY = "2026-10-20";

test("độ tươi trên bộ ca kiểm", () => {
  // [tên ca, dãy sau khi tạo, ngày xác nhận mong (null = chưa xác nhận), tuổi mong]
  const CA: [string, [EventType, Record<string, unknown>, string, boolean?][], string | null, number | null][] = [
    ["chỉ tạo hàng", [], null, null],
    ["đổi giá", [["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }, "2026-10-05T10:00:00.000Z"]], "2026-10-05T10:00:00.000Z", 15],
    ["đổi trạng thái", [["status_changed", { to: "Hold" }, "2026-10-12T08:00:00.000Z"]], "2026-10-12T08:00:00.000Z", 8],
    ["Còn / giữ giá", [["owner_confirmed", {}, "2026-10-19T23:59:00.000Z"]], "2026-10-19T23:59:00.000Z", 1],
    ["đổi giá có tắt cờ", [["price_changed", { listPrice: 3_400_000_000, feeInclusion: "included" }, "2026-10-06T10:00:00.000Z", false]], null, null],
    ["đổi trường lần rao", [["details_changed", { furnished: "full" }, "2026-10-07T10:00:00.000Z"]], null, null],
    [
      "nhiều xác nhận lấy gần nhất",
      [
        ["owner_confirmed", {}, "2026-10-02T10:00:00.000Z"],
        ["price_changed", { listPrice: 3_300_000_000, feeInclusion: "excluded" }, "2026-10-10T10:00:00.000Z"],
        ["details_changed", { legalStatus: "pink_book" }, "2026-10-15T10:00:00.000Z"],
      ],
      "2026-10-10T10:00:00.000Z",
      10,
    ],
  ];
  for (const [ten, sau, ngayMong, tuoiMong] of CA) {
    const f = freshness(foldListing(day([TAO, ...sau])).lastConfirmedAt, HOM_NAY);
    const thay = f.confirmed ? [f.lastConfirmedAt, f.ageDays] : [null, null];
    assert.deepEqual(thay, [ngayMong, tuoiMong], `${ten}: mong ${ngayMong}/${tuoiMong}, thấy ${thay.join("/")}`);
  }
  const cu = freshness("2026-10-06T00:00:00.000Z", HOM_NAY);
  assert.equal(cu.confirmed && cu.needsCallBack, true, "14 ngày chưa xác nhận là cần gọi lại");
});

test("mức đủ trên bộ ca kiểm", () => {
  const GIA = { listPrice: 3_500_000_000, feeInclusion: "excluded" };
  const CA: [string, [EventType, Record<string, unknown>, string][], number, string[]][] = [
    ["không mục nào", [], 0, ["price", "furnished", "legalStatus", "financing", "occupantType"]],
    ["chỉ giá", [["price_changed", GIA, "2026-10-02T00:00:00.000Z"]], 1, ["furnished", "legalStatus", "financing", "occupantType"]],
    ["chỉ nội thất", [["details_changed", { furnished: "full" }, "2026-10-02T00:00:00.000Z"]], 1, ["price", "legalStatus", "financing", "occupantType"]],
    ["chỉ pháp lý", [["details_changed", { legalStatus: "pink_book" }, "2026-10-02T00:00:00.000Z"]], 1, ["price", "furnished", "financing", "occupantType"]],
    ["chỉ tài chính", [["details_changed", { financing: "mortgaged" }, "2026-10-02T00:00:00.000Z"]], 1, ["price", "furnished", "legalStatus", "occupantType"]],
    ["chỉ tình trạng sử dụng", [["details_changed", { occupantType: "vacant" }, "2026-10-02T00:00:00.000Z"]], 1, ["price", "furnished", "legalStatus", "financing"]],
    [
      "đủ năm",
      [
        ["price_changed", GIA, "2026-10-02T00:00:00.000Z"],
        ["details_changed", { furnished: "full", legalStatus: "pink_book", financing: "none", occupantType: "vacant" }, "2026-10-03T00:00:00.000Z"],
      ],
      5,
      [],
    ],
    [
      "xoá trắng một mục thì tính lại là thiếu",
      [
        ["details_changed", { furnished: "full", legalStatus: "pink_book" }, "2026-10-02T00:00:00.000Z"],
        ["details_changed", { furnished: null }, "2026-10-03T00:00:00.000Z"],
      ],
      1,
      ["price", "furnished", "financing", "occupantType"],
    ],
  ];
  for (const [ten, sau, filled, missing] of CA) {
    const c = completeness(foldListing(day([TAO, ...sau])));
    assert.deepEqual([c.filled, c.total, c.missing], [filled, 5, missing], ten);
  }
  assert.deepEqual(completeness({ listPrice: 3_000_000_000, feeInclusion: null, furnished: null, legalStatus: null, financing: null, occupantType: null }).missing[0], "price", "giá thiếu điều kiện phí tính là thiếu giá");
});

test("gấp: đã bán giữ giá chốt và ngày bán", () => {
  const s = foldListing(
    day([
      TAO,
      ["status_changed", { to: "Withdrawn", withdrawnReason: "unreachable" }, "2026-10-04T00:00:00.000Z"],
    ]),
  );
  assert.equal(s.standardStatus, "Withdrawn");
  const b = foldListing(day([TAO, ["status_changed", { to: "Closed", closePrice: 3_200_000_000 }, "2026-10-09T15:00:00.000Z"]]));
  assert.deepEqual([b.standardStatus, b.closePrice, b.closeDate, b.version], ["Closed", 3_200_000_000, "2026-10-09", 2]);
});

test("payload theo khuôn chặt: khoá lạ và khoá lớp source bị từ chối", () => {
  // Viết trước — không lấy từ mã đang kiểm: bốn khoá lớp source của bất biến 2.
  const KHOA_CHU_NHA = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto"];
  let so = 0;
  const LANH: Record<EventType, Record<string, unknown>> = {
    created: { buildingName: "[Toà mẫu]", unitNumber: "A-1" },
    details_changed: { furnished: "full" },
    price_changed: { listPrice: 1_000_000_000, feeInclusion: "included" },
    status_changed: { to: "Hold" },
    owner_confirmed: {},
    unit_number_assigned: { unitNumber: "A-12.05" },
  };
  for (const [type, p] of Object.entries(LANH)) {
    assert.deepEqual(validatePayload(type, p), [], `đối chứng: ${type} lành phải qua`);
    const laDau = validatePayload(type, { ...p, khoaLa: 1 });
    assert.ok(laDau.some((e) => e.path === "khoaLa"), `${type}: khoá lạ cấp đầu phải bị bắt`);
    const laLong = validatePayload(type, { ...p, khoi: { khoaLa: 1 } });
    assert.ok(laLong.some((e) => e.path === "khoi.khoaLa"), `${type}: khoá lạ lồng phải bị bắt`);
    for (const k of KHOA_CHU_NHA) {
      const dau = validatePayload(type, { ...p, [k]: "x" }).find((e) => e.path === k);
      assert.equal(dau?.reason, "thông tin chủ nhà không vào hàng", `${type}: khoá ${k} cấp đầu`);
      so++;
      const vaoTruong = Object.keys(p)[0] ?? "khoi";
      assert.ok(
        validatePayload(type, { ...p, [vaoTruong]: { [k]: "x" } }).some((e) => e.path === `${vaoTruong}.${k}`),
        `${type}: khoá ${k} lồng trong ${vaoTruong}`,
      );
      so++;
    }
  }
  assert.equal(so, 6 * KHOA_CHU_NHA.length * 2, "số lần thử phải bằng ma trận viết trước");
  assert.deepEqual(validatePayload("deleted", {}).map((e) => e.path), ["type"], "loại sự kiện lạ");
});

test("stepListing gấp từng bước bằng foldListing", () => {
  const sk = (seq: number, type: EventType, payload: Record<string, unknown>, ngay: string): ListingEvent => ({
    seq, type, payload, actorUserId: "u-x", actorRoles: ["listing_agent"], confirmedWithOwner: type !== "created" && type !== "details_changed", occurredAt: `2026-10-${ngay}T08:00:00.000Z`,
  });
  // Dãy viết tay đi qua mọi loại sự kiện, kết ở Đã bán.
  const ds: ListingEvent[] = [
    sk(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, "01"),
    sk(2, "price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }, "02"),
    sk(3, "details_changed", { legalStatus: "pink_book", occupantType: "vacant" }, "03"),
    sk(4, "status_changed", { to: "Active" }, "04"),
    sk(5, "owner_confirmed", {}, "05"),
    sk(6, "status_changed", { to: "Closed", closePrice: 3_400_000_000 }, "06"),
  ];
  // Kết quả mong đợi viết tay cho từng bước (không sinh từ hàm đang kiểm): giá, phí, pháp lý, người ở, trạng thái, giá chốt,
  // ngày bán, lần xác nhận, phiên bản.
  const MONG: [number | null, string | null, string | null, string | null, string, number | null, string | null, string | null, number][] = [
    [3_500_000_000, "excluded", null, null, "Incomplete", null, null, "2026-10-02T08:00:00.000Z", 2],
    [3_500_000_000, "excluded", "pink_book", "vacant", "Incomplete", null, null, "2026-10-02T08:00:00.000Z", 3],
    [3_500_000_000, "excluded", "pink_book", "vacant", "Active", null, null, "2026-10-04T08:00:00.000Z", 4],
    [3_500_000_000, "excluded", "pink_book", "vacant", "Active", null, null, "2026-10-05T08:00:00.000Z", 5],
    [3_500_000_000, "excluded", "pink_book", "vacant", "Closed", 3_400_000_000, "2026-10-06", "2026-10-06T08:00:00.000Z", 6],
  ];
  let s = foldListing(ds.slice(0, 1));
  let so = 0;
  for (let k = 1; k < ds.length; k++) {
    const chup = structuredClone(s);
    const sau = stepListing(s, ds[k]!);
    assert.deepEqual(s, chup, `bước ${k + 1}: đầu vào bị đổi`);
    const t = sau;
    assert.deepEqual(
      [t.listPrice, t.feeInclusion, t.legalStatus, t.occupantType, t.standardStatus, t.closePrice, t.closeDate, t.lastConfirmedAt, t.version],
      MONG[k - 1],
      `bước ${k + 1} (${ds[k]!.type})`,
    );
    s = sau;
    so++;
  }
  // foldListing là chuỗi các bước: cùng dãy cho cùng kết quả cuối.
  assert.deepEqual(foldListing(ds), s);
  assert.equal(so, 5);
});

// Hàng 57: ngày bán không có thật bị từ chối ở kiểm payload, không xuống tới cơ sở dữ liệu.
const CHOT = (closeDate: unknown) => ({ to: "Closed", closePrice: 3_200_000_000, closeDate });

test("ngày không có thật: một lỗi ở closeDate", () => {
  assert.deepEqual(validatePayload("status_changed", { to: "Closed", closePrice: 3_200_000_000 }), [], "đối chứng: không có ngày bán thì qua");
  let so = 0;
  for (const d of NGAY_KHONG_CO_THAT_CA) {
    assert.deepEqual(validatePayload("status_changed", CHOT(d)), [{ path: "closeDate", reason: NGAY_KHONG_CO_THAT }], `ngày ${d} phải bị từ chối`);
    so++;
  }
  assert.equal(so, NGAY_KHONG_CO_THAT_CA.length, "số lần thử phải bằng ma trận viết trước");
});

test("sai dạng ngày: lỗi dạng ở closeDate", () => {
  let so = 0;
  for (const d of NGAY_SAI_DANG_CA) {
    assert.deepEqual(validatePayload("status_changed", CHOT(d)), [{ path: "closeDate", reason: NGAY_SAI_DANG }], `giá trị ${JSON.stringify(d)}`);
    so++;
  }
  assert.equal(so, NGAY_SAI_DANG_CA.length, "số lần thử phải bằng ma trận viết trước");
});

test("ngày có thật: không lỗi", () => {
  let so = 0;
  for (const d of NGAY_CO_THAT) {
    assert.deepEqual(validatePayload("status_changed", CHOT(d)), [], `ngày ${d} phải qua`);
    so++;
  }
  assert.equal(so, NGAY_CO_THAT.length, "số lần thử phải bằng ma trận viết trước");
});
