// Hàng đợi Hôm nay của đầu chủ (hồ sơ hom-nay-dau-chu, E1–E4 phần lõi). Mỗi ma trận viết trước, đếm bằng assert số.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BO_NHOM_MAC_DINH, boMacDinh, chiaNhom, docBoNhom, dungVoiCan, kiemBoNhom, nhomCuaCan, nhomCuaLead, type BoNhom, type Condition, type DuKienCan } from "./index";

const TOI = "u-toi";
const KHAC = "u-khac";
const BAY_GIO = "2026-11-02T03:00:00Z"; // 10:00 ngày 02/11 giờ VN
const ngayTruoc = (n: number, gio = "03:00:00") => new Date(Date.parse(`2026-11-02T${gio}Z`) - n * 864e5).toISOString();

/** Căn Đang bán mình giữ, vừa xác nhận, vừa đổi giá, đủ tin, không ai khác đổi — không vào nhóm nào. */
const can = (sua: Partial<DuKienCan> = {}): DuKienCan => ({
  standardStatus: "Active",
  listAgentKey: TOI,
  lastConfirmedAt: ngayTruoc(1),
  priceChangeTimestamp: ngayTruoc(1),
  lastPriceChange: { at: ngayTruoc(1), byUserId: TOI, byRoles: ["listing_agent"], from: 3_200_000_000, to: 3_100_000_000 },
  lastStatusChange: { at: ngayTruoc(30), byUserId: TOI, byRoles: ["listing_agent"], from: "Incomplete", to: "Active" },
  missing: [],
  propertySubType: "Condominium",
  ...sua,
});
const ma = (bo: BoNhom, c: DuKienCan, bayGio = BAY_GIO) => nhomCuaCan(bo, c, TOI, bayGio)?.code ?? null;

/** Bốn công tắc của bộ mặc định trên một căn Đang bán. */
function canTheo(epGia: boolean, goiLai: boolean, thieuTin: boolean, moiDoi: boolean): DuKienCan {
  // ép giá: giá và xác nhận cùng ≥ 10 ngày; gọi lại: xác nhận ≥ 14 ngày, giá đổi gần đây; mới đổi: người khác đổi trạng
  // thái sáng nay (không chạm mốc giá, nên bốn công tắc độc lập).
  const xacNhan = goiLai ? ngayTruoc(16) : epGia ? ngayTruoc(11) : ngayTruoc(1);
  const gia = epGia ? ngayTruoc(12) : ngayTruoc(2);
  return can({
    lastConfirmedAt: xacNhan,
    priceChangeTimestamp: gia,
    lastPriceChange: { at: gia, byUserId: TOI, byRoles: ["listing_agent"], from: 3_200_000_000, to: 3_100_000_000 },
    lastStatusChange: moiDoi
      ? { at: ngayTruoc(0, "02:00:00"), byUserId: KHAC, byRoles: ["team_lead"], from: "Hold", to: "Active" }
      : { at: ngayTruoc(30), byUserId: TOI, byRoles: ["listing_agent"], from: "Incomplete", to: "Active" },
    missing: thieuTin ? ["legalStatus"] : [],
  });
}

describe("bộ mặc định: sáu nhóm đúng thứ tự", () => {
  it("mã, nhãn, ngưỡng", () => {
    assert.equal(BO_NHOM_MAC_DINH.length, 6);
    assert.deepEqual(BO_NHOM_MAC_DINH.map((n) => n.code), ["new_lead", "price_adjustment", "call_back", "missing_info", "add_photos", "recent_change"]);
    assert.equal(BO_NHOM_MAC_DINH[1]!.label, "Nên gọi điều chỉnh giá");
    assert.deepEqual(BO_NHOM_MAC_DINH[1]!.conditions[1], { kind: "days_since", anchor: "price_or_confirmed", days: 10 });
    assert.deepEqual(BO_NHOM_MAC_DINH[2]!.conditions[0], { kind: "days_since", anchor: "confirmed", days: 14 });
    assert.deepEqual(kiemBoNhom(BO_NHOM_MAC_DINH), []);
  });
});

describe("bộ mặc định: mỗi căn đúng một nhóm", () => {
  const ca: [boolean, boolean, boolean, boolean][] = [];
  for (let i = 0; i < 16; i++) ca.push([!!(i & 8), !!(i & 4), !!(i & 2), !!(i & 1)]);
  it("ma trận 16 tổ hợp", () => assert.equal(ca.length, 16));
  for (const [e, g, t, m] of ca) {
    const mong = e ? "price_adjustment" : g ? "call_back" : t ? "missing_info" : m ? "recent_change" : null;
    it(`ép=${e} gọi=${g} thiếu=${t} đổi=${m} → ${mong}`, () => {
      const c = canTheo(e, g, t, m);
      assert.equal(ma(BO_NHOM_MAC_DINH, c), mong);
      // Đúng một nhóm: đếm số nhóm bật mà mọi điều kiện đúng không vượt quá thứ tự thắng — nhóm trả về là nhóm đầu tiên.
      const khop = BO_NHOM_MAC_DINH.filter((n) => n.subject === "listing" && n.conditions.every((d) => dungVoiCan(d, c, TOI, BAY_GIO)));
      assert.equal(khop[0]?.code ?? null, mong);
    });
  }
  it("chiều đỏ: đảo thứ tự gọi lại trước ép giá thì căn (ép giá + gọi lại) đổi nhóm", () => {
    const dao = [BO_NHOM_MAC_DINH[0]!, BO_NHOM_MAC_DINH[2]!, BO_NHOM_MAC_DINH[1]!, BO_NHOM_MAC_DINH[3]!, BO_NHOM_MAC_DINH[4]!];
    assert.equal(ma(dao, canTheo(true, true, false, false)), "call_back");
    assert.equal(ma(BO_NHOM_MAC_DINH, canTheo(true, true, false, false)), "price_adjustment");
  });
});

describe("bộ mặc định: căn không vào nhóm", () => {
  const bat = canTheo(true, true, true, true);
  const ca: [string, Partial<DuKienCan>][] = [
    ["người khác giữ", { listAgentKey: KHAC }],
    ["chưa ai giữ", { listAgentKey: null }],
    ["Đã bán", { standardStatus: "Closed" }],
    ["Ngừng bán", { standardStatus: "Withdrawn" }],
  ];
  it("ma trận 4", () => assert.equal(ca.length, 4));
  for (const [ten, sua] of ca) it(ten, () => assert.equal(ma(BO_NHOM_MAC_DINH, { ...bat, ...sua }), null));
});

describe("bộ mặc định: luật mốc điều chỉnh giá", () => {
  // Hỏi-1: mốc = lần muộn hơn giữa đổi giá và xác nhận.
  const ca: [string, DuKienCan, string | null][] = [
    ["xác nhận sau mốc giá, còn trong ngưỡng → rời nhóm", can({ priceChangeTimestamp: ngayTruoc(20), lastConfirmedAt: ngayTruoc(3) }), null],
    ["xác nhận sau mốc giá, qua ngưỡng → vào lại (đợt hai)", can({ priceChangeTimestamp: ngayTruoc(30), lastConfirmedAt: ngayTruoc(11) }), "price_adjustment"],
    ["xác nhận trước mốc giá, giá đổi gần → không", can({ priceChangeTimestamp: ngayTruoc(3), lastConfirmedAt: ngayTruoc(9) }), null],
    ["xác nhận trước mốc giá, cả hai qua ngưỡng → vào", can({ priceChangeTimestamp: ngayTruoc(11), lastConfirmedAt: ngayTruoc(12) }), "price_adjustment"],
  ];
  it("ma trận 4", () => assert.equal(ca.length, 4));
  for (const [ten, c, mong] of ca) it(ten, () => assert.equal(ma(BO_NHOM_MAC_DINH, c), mong));
});

describe("bộ mặc định: mốc giá lùi về lúc lên Đang bán", () => {
  const lenBan = (n: number) =>
    can({ priceChangeTimestamp: null, lastPriceChange: null, lastConfirmedAt: null, lastStatusChange: { at: ngayTruoc(n), byUserId: TOI, byRoles: [], from: "Incomplete", to: "Active" } });
  it("lên Đang bán 11 ngày, chưa đổi giá → price_adjustment", () => assert.equal(ma(BO_NHOM_MAC_DINH, lenBan(11)), "price_adjustment"));
  it("lên Đang bán 3 ngày, chưa xác nhận → call_back (không vào điều chỉnh giá)", () => assert.equal(ma(BO_NHOM_MAC_DINH, lenBan(3)), "call_back"));
});

describe("bộ mặc định: khoá ngưỡng cũ", () => {
  const goc = (v: Record<string, unknown>) => Object.entries(v).map(([key, value]) => ({ key, value }));
  it("21 và 12 đổi ngưỡng; 6, 31, 15 bị bỏ", () => {
    const a = docBoNhom(goc({ "queue.call_back_after_days": 21, "queue.price_negotiation_after_days": 12 }));
    assert.deepEqual(a.bo[2]!.conditions[0], { kind: "days_since", anchor: "confirmed", days: 21 });
    assert.deepEqual(a.bo[1]!.conditions[1], { kind: "days_since", anchor: "price_or_confirmed", days: 12 });
    for (const [g, e] of [[6, 15], [31, 6]] as const) {
      const b = docBoNhom(goc({ "queue.call_back_after_days": g, "queue.price_negotiation_after_days": e }));
      assert.equal((b.bo[2]!.conditions[0] as { days: number }).days, 14);
      assert.equal((b.bo[1]!.conditions[1] as { days: number }).days, 10);
    }
  });
  it("có queue.groups thì khoá cũ hết tác dụng", () => {
    const bo = boMacDinh({ priceAdjustment: 8, callBack: 14 });
    const a = docBoNhom(goc({ "queue.price_negotiation_after_days": 12, "queue.groups": bo }));
    assert.equal(a.nguon, "san");
    assert.equal((a.bo[1]!.conditions[1] as { days: number }).days, 8);
  });
});

describe("điều kiện: ma trận từ vựng đóng", () => {
  const ca: [string, Condition, DuKienCan, boolean][] = [
    ["status_in đúng", { kind: "status_in", in: ["Active"] }, can(), true],
    ["status_in sai", { kind: "status_in", in: ["Pending"] }, can(), false],
    ["days_since price đúng", { kind: "days_since", anchor: "price", days: 5 }, can({ priceChangeTimestamp: ngayTruoc(6) }), true],
    ["days_since price sai", { kind: "days_since", anchor: "price", days: 5 }, can({ priceChangeTimestamp: ngayTruoc(4) }), false],
    ["days_since confirmed đúng", { kind: "days_since", anchor: "confirmed", days: 5 }, can({ lastConfirmedAt: ngayTruoc(5) }), true],
    ["days_since confirmed sai", { kind: "days_since", anchor: "confirmed", days: 5 }, can({ lastConfirmedAt: ngayTruoc(4) }), false],
    ["days_since active_since đúng", { kind: "days_since", anchor: "active_since", days: 20 }, can(), true],
    ["days_since active_since sai", { kind: "days_since", anchor: "active_since", days: 40 }, can(), false],
    ["days_since price_or_confirmed đúng", { kind: "days_since", anchor: "price_or_confirmed", days: 5 }, can({ priceChangeTimestamp: ngayTruoc(9), lastConfirmedAt: ngayTruoc(6) }), true],
    ["days_since price_or_confirmed sai", { kind: "days_since", anchor: "price_or_confirmed", days: 5 }, can({ priceChangeTimestamp: ngayTruoc(9), lastConfirmedAt: ngayTruoc(2) }), false],
    ["missing_info đúng", { kind: "missing_info" }, can({ missing: ["financing"] }), true],
    ["missing_info sai", { kind: "missing_info" }, can(), false],
    ["changed_by_other yesterday đúng", { kind: "changed_by_other", since: "yesterday" }, can({ lastPriceChange: { at: ngayTruoc(1), byUserId: KHAC, byRoles: [], from: 1, to: 2 } }), true],
    ["changed_by_other yesterday sai", { kind: "changed_by_other", since: "yesterday" }, can({ lastPriceChange: { at: ngayTruoc(3), byUserId: KHAC, byRoles: [], from: 1, to: 2 } }), false],
    ["changed_by_other today đúng", { kind: "changed_by_other", since: "today" }, can({ lastStatusChange: { at: ngayTruoc(0, "02:00:00"), byUserId: KHAC, byRoles: [], from: "Active", to: "Pending" } }), true],
    ["changed_by_other today sai", { kind: "changed_by_other", since: "today" }, can({ lastPriceChange: { at: ngayTruoc(1), byUserId: KHAC, byRoles: [], from: 1, to: 2 } }), false],
    ["property_sub_type_in đúng", { kind: "property_sub_type_in", in: ["Condominium"] }, can(), true],
    ["property_sub_type_in sai", { kind: "property_sub_type_in", in: ["Townhouse"] }, can(), false],
    ["lead_stage_in trên căn luôn sai", { kind: "lead_stage_in", in: ["sent"] }, can(), false],
    ["days_since mốc chưa có → đúng", { kind: "days_since", anchor: "confirmed", days: 30 }, can({ lastConfirmedAt: null }), true],
  ];
  it("ma trận 20", () => assert.equal(ca.length, 20));
  for (const [ten, d, c, mong] of ca) it(ten, () => assert.equal(dungVoiCan(d, c, TOI, BAY_GIO), mong));
});

describe("điều kiện: ranh giới ngày", () => {
  const d: Condition = { kind: "days_since", anchor: "confirmed", days: 14 };
  it("đúng 14 ngày → đúng; 13 → sai", () => {
    assert.equal(dungVoiCan(d, can({ lastConfirmedAt: ngayTruoc(14) }), TOI, BAY_GIO), true);
    assert.equal(dungVoiCan(d, can({ lastConfirmedAt: ngayTruoc(13) }), TOI, BAY_GIO), false);
  });
});

describe("điều kiện: hôm qua giờ Việt Nam", () => {
  const d: Condition = { kind: "changed_by_other", since: "yesterday" };
  const doiLuc = (at: string) => can({ lastPriceChange: { at, byUserId: KHAC, byRoles: [], from: 1, to: 2 } });
  const ca: [string, string, boolean][] = [
    ["2026-11-02T03:00:00Z", "2026-10-31T17:00:00Z", true],
    ["2026-11-02T03:00:00Z", "2026-10-31T16:59:59Z", false],
    ["2026-11-01T18:00:00Z", "2026-10-31T17:00:00Z", true],
    ["2026-11-01T18:00:00Z", "2026-10-31T16:59:59Z", false],
  ];
  it("ma trận 4", () => assert.equal(ca.length, 4));
  for (const [bayGio, at, mong] of ca) it(`${bayGio} · ${at} → ${mong}`, () => assert.equal(dungVoiCan(d, doiLuc(at), TOI, bayGio), mong));
});

describe("điều kiện: đổi giá và đổi trạng thái xét riêng", () => {
  const d: Condition = { kind: "changed_by_other", since: "yesterday" };
  it("người khác đổi giá hôm qua, mình đổi trạng thái hôm nay → đúng", () =>
    assert.equal(
      dungVoiCan(
        d,
        can({
          lastPriceChange: { at: ngayTruoc(1), byUserId: KHAC, byRoles: ["team_lead"], from: 1, to: 2 },
          lastStatusChange: { at: ngayTruoc(0, "02:00:00"), byUserId: TOI, byRoles: [], from: "Active", to: "Pending" },
        }),
        TOI,
        BAY_GIO,
      ),
      true,
    ));
  it("mình đổi giá → sai", () => assert.equal(dungVoiCan(d, can({ lastPriceChange: { at: ngayTruoc(0, "01:00:00"), byUserId: TOI, byRoles: [], from: 1, to: 2 } }), TOI, BAY_GIO), false));
});

describe("điều kiện: căn ngoài danh mục", () => {
  it("property_sub_type_in với căn ngoài danh mục → sai", () =>
    assert.equal(dungVoiCan({ kind: "property_sub_type_in", in: ["Condominium"] }, can({ propertySubType: null }), TOI, BAY_GIO), false));
});

describe("bộ của sàn: ghi đè trọn bộ", () => {
  const bo: BoNhom = [
    { code: "townhouse_stale", label: "Nhà phố lâu chưa gọi", subject: "listing", enabled: true, conditions: [{ kind: "property_sub_type_in", in: ["Townhouse"] }, { kind: "days_since", anchor: "confirmed", days: 7 }], actions: ["owner_confirmed", "open_record"] },
    BO_NHOM_MAC_DINH[0]!,
    { ...BO_NHOM_MAC_DINH[1]!, conditions: [{ kind: "status_in", in: ["Active"] }, { kind: "days_since", anchor: "price_or_confirmed", days: 7 }] },
    BO_NHOM_MAC_DINH.find((n) => n.code === "recent_change")!,
    { ...BO_NHOM_MAC_DINH[2]!, label: "Gọi xác nhận" },
    { ...BO_NHOM_MAC_DINH[3]!, enabled: false },
  ];
  const ca: [string, DuKienCan, string | null][] = [
    ["chỉ thiếu tin → null (nhóm tắt)", can({ missing: ["financing"] }), null],
    ["gọi lại + mới đổi, giá vừa đổi → recent_change đứng trước", can({ lastConfirmedAt: ngayTruoc(16), priceChangeTimestamp: ngayTruoc(0, "01:00:00"), lastPriceChange: { at: ngayTruoc(0, "01:00:00"), byUserId: KHAC, byRoles: [], from: 1, to: 2 } }), "recent_change"],
    ["nhà phố 8 ngày chưa xác nhận → nhóm nhà phố", can({ propertySubType: "Townhouse", lastConfirmedAt: ngayTruoc(8), priceChangeTimestamp: ngayTruoc(2) }), "townhouse_stale"],
    ["căn hộ 8 ngày chưa xác nhận, giá mới → null", can({ lastConfirmedAt: ngayTruoc(8), priceChangeTimestamp: ngayTruoc(2) }), null],
    ["giá giữ 8 ngày, xác nhận 8 ngày → điều chỉnh giá ngưỡng 7", can({ lastConfirmedAt: ngayTruoc(8), priceChangeTimestamp: ngayTruoc(8) }), "price_adjustment"],
    ["16 ngày chưa xác nhận, giá mới → call_back tên mới", can({ lastConfirmedAt: ngayTruoc(16), priceChangeTimestamp: ngayTruoc(2) }), "call_back"],
  ];
  it("ma trận 6", () => assert.equal(ca.length, 6));
  for (const [ten, c, mong] of ca) it(ten, () => assert.equal(ma(bo, c), mong));
  it("danh sách nhóm theo tên và thứ tự mới, nhóm tắt không có", () => {
    assert.deepEqual(kiemBoNhom(bo), []);
    assert.deepEqual(chiaNhom(bo, [], TOI, BAY_GIO).map((x) => x.nhom.label), ["Nhà phố lâu chưa gọi", "Nên gọi điều chỉnh giá", "Mới đổi", "Gọi xác nhận"]);
  });
  it("chiều đỏ: trộn với bộ mặc định thì căn chỉ thiếu tin vào missing_info", () => assert.equal(ma([...bo, { ...BO_NHOM_MAC_DINH[3]!, code: "missing_info_2" }], can({ missing: ["financing"] })), "missing_info_2"));
});

describe("bộ của sàn: hỏng thì về mặc định", () => {
  const sua = (f: (b: BoNhom) => unknown): unknown => f(structuredClone(BO_NHOM_MAC_DINH) as BoNhom);
  const ca: [string, unknown, string][] = [
    ["key lạ", sua((b) => ((b[1] as Record<string, unknown>).mau = "đỏ", b)), "key lạ"],
    ["kind ngoài từ vựng", sua((b) => ((b[3]!.conditions as unknown[]) = [{ kind: "expression" }], b)), "kind"],
    ["days ngoài khoảng (6)", sua((b) => (((b[1]!.conditions[1] as { days: number }).days = 6), b)), "days"],
    ["days ngoài khoảng (15)", sua((b) => (((b[1]!.conditions[1] as { days: number }).days = 15), b)), "days"],
    ["action ngoài thực đơn", sua((b) => ((b[2]!.actions as unknown[]) = ["auto_dial"], b)), "actions"],
    ["loại hình ngoài tập mã", sua((b) => (b[3]!.conditions.push({ kind: "property_sub_type_in", in: ["Nhà phố"] }), b)), "property_sub_type_in"],
    ["label 41 ký tự", sua((b) => ((b[2]!.label = "x".repeat(41)), b)), "label"],
    ["label chứa số", sua((b) => ((b[2]!.label = "Gọi 0900 000 001"), b)), "label"],
    ["code trùng", sua((b) => ((b[3]!.code = "call_back"), b)), "code"],
    ["không nhóm lead", sua((b) => b.slice(1)), "lead"],
    ["nhóm căn + lead_stage_in", sua((b) => (b[3]!.conditions.push({ kind: "lead_stage_in", in: ["sent"] }), b)), "subject"],
    ["nhóm căn + action accept", sua((b) => ((b[2]!.actions as unknown[]) = ["accept"], b)), "subject"],
    ["nhóm lead + missing_info", sua((b) => (b[0]!.conditions.push({ kind: "missing_info" }), b)), "subject"],
    ["status_in chỉ Closed", sua((b) => ((b[3]!.conditions as unknown[]) = [{ kind: "status_in", in: ["Closed"] }], b)), "status_in"],
  ];
  it("ma trận 14", () => assert.equal(ca.length, 14));
  for (const [ten, bo, chu] of ca)
    it(ten, () => {
      const kq = docBoNhom([{ key: "queue.groups", value: bo }]);
      assert.equal(kq.nguon, "mac-dinh");
      assert.deepEqual(kq.bo, BO_NHOM_MAC_DINH);
      assert.ok(kq.loi.length > 0 && kq.loi.some((l) => l.includes(chu)), kq.loi.join(" | "));
    });
  it("đối chứng dương: bộ hợp lệ → san, không lỗi", () => {
    const kq = docBoNhom([{ key: "queue.groups", value: structuredClone(BO_NHOM_MAC_DINH) }]);
    assert.equal(kq.nguon, "san");
    assert.deepEqual(kq.loi, []);
  });
  it("bộ hỏng: bộ mặc định mang ngưỡng của khoá cũ", () => {
    const kq = docBoNhom([{ key: "queue.price_negotiation_after_days", value: 12 }, { key: "queue.groups", value: [] }]);
    assert.equal((kq.bo[1]!.conditions[1] as { days: number }).days, 12);
  });
});

describe("nhóm lead", () => {
  it("Đã gửi, Đã nhận vào new_lead; Đã gọi, trả lại, bỏ thì không", () => {
    assert.equal(nhomCuaLead(BO_NHOM_MAC_DINH, { stage: "sent" })?.code, "new_lead");
    assert.equal(nhomCuaLead(BO_NHOM_MAC_DINH, { stage: "accepted" })?.code, "new_lead");
    for (const stage of ["called", "returned", "discarded", "on_board"] as const) assert.equal(nhomCuaLead(BO_NHOM_MAC_DINH, { stage }), null);
  });
});

describe("Bổ sung ảnh (anh-khong-chan-ban, E6)", () => {
  it("nhóm mặc định add_photos", () => {
    const n = BO_NHOM_MAC_DINH.find((x) => x.code === "add_photos")!;
    assert.equal(n.label, "Bổ sung ảnh");
    assert.equal(n.subject, "listing");
    assert.deepEqual(n.conditions, [{ kind: "missing_photo" }]);
    assert.deepEqual(n.actions, ["open_record"]);
  });
  it("ma trận trạng thái × số ảnh, viết trước", () => {
    // [trạng thái, số ảnh, mong] — căn không khớp nhóm đứng trước (vừa xác nhận, vừa đổi giá, đủ năm mục).
    const BANG: [DuKienCan["standardStatus"], number, string | null][] = [
      ["Incomplete", 0, "add_photos"], ["Incomplete", 1, null],
      ["Active", 0, "add_photos"], ["Active", 1, null],
      ["Pending", 0, "add_photos"], ["Pending", 1, null],
      ["Hold", 0, "add_photos"], ["Hold", 1, null],
      ["Closed", 0, null], ["Closed", 1, null],
      ["Withdrawn", 0, null], ["Withdrawn", 1, null],
    ];
    for (const [tt, anh, mong] of BANG) assert.equal(ma(BO_NHOM_MAC_DINH, can({ standardStatus: tt, photosCount: anh })), mong, `${tt}, ${anh} ảnh: cần ${mong}`);
  });
  it("chỉ thiếu ảnh thì không vào Thiếu thông tin; vắng số ảnh không tính là 0", () => {
    assert.equal(ma(BO_NHOM_MAC_DINH, can({ photosCount: 0, missing: [] })), "add_photos");
    assert.equal(ma(BO_NHOM_MAC_DINH, can({ photosCount: 0, missing: ["legalStatus"] })), "missing_info", "thiếu tin đứng trước");
    assert.equal(ma(BO_NHOM_MAC_DINH, can()), null, "bản trên máy đời trước, không số ảnh");
    assert.equal(ma(BO_NHOM_MAC_DINH, can({ photosCount: 0, listAgentKey: KHAC })), null, "căn người khác giữ");
  });
  it("bộ kiểm chấp nhận missing_photo, từ chối khoá lạ; bộ sàn đã lưu giữ nguyên", () => {
    const bo = BO_NHOM_MAC_DINH.map((n) => ({ ...n }));
    assert.deepEqual(kiemBoNhom(bo), []);
    const la = BO_NHOM_MAC_DINH.map((n) => (n.code === "add_photos" ? { ...n, conditions: [{ kind: "missing_photo", x: 1 }] } : n));
    assert.ok(kiemBoNhom(la).some((l) => /add_photos|x/.test(l)), "khoá lạ trên missing_photo phải bị từ chối");
    const cu = BO_NHOM_MAC_DINH.filter((n) => n.code !== "add_photos");
    assert.deepEqual(docBoNhom([{ key: "queue.groups", value: cu }]).bo.map((n) => n.code), cu.map((n) => n.code), "bộ đã lưu không bị thêm nhóm");
  });
});
