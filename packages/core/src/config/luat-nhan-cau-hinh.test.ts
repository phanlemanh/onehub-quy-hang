// Luật nhận cấu hình làm tham số (hàng 81: AC-6, AC-7, AC-8). Cấu hình dựng bằng giaiCauHinh từ dòng sàn, không dựng
// tay; biên lấy từ sổ, không viết số tay.
import assert from "node:assert/strict";
import { test } from "node:test";
import { freshness } from "../listing/freshness";
import { canHoiLai } from "../pricing/hoi-lai";
import { applyLeadRoutingPatch, DEFAULT_LEAD_ROUTING, dueAlerts, readLeadRoutingSettings, unroutedDue } from "../routing";
import { QUEUE_DAY_RANGES, QUEUE_DEFAULT_DAYS } from "../today/mac-dinh";
import { giaiCauHinh, khoangCua, macDinhSo } from "./giai";

const cauHinh = (key: string, value: unknown) => {
  const kq = giaiCauHinh([{ key, value }]);
  assert.deepEqual(kq.loi, [], `${key}=${String(value)}`);
  return kq.cauHinh;
};
const ngayTruoc = (n: number) => new Date(Date.UTC(2026, 10, 30) - n * 86_400_000).toISOString().slice(0, 10);

test("freshness nhận cấu hình: mặc định, giá trị khác, hai biên", () => {
  const homNay = "2026-11-30";
  const goi = (tuoi: number, c?: ReturnType<typeof cauHinh>) => {
    const f = freshness(ngayTruoc(tuoi), homNay, c);
    assert.equal(f.confirmed, true);
    return f.confirmed && f.needsCallBack;
  };
  assert.equal(goi(13), false);
  assert.equal(goi(14), true);
  const { min, max } = khoangCua("queue.call_back_after_days");
  assert.deepEqual([min, max], [7, 30]);
  for (const n of [min, 20, max]) {
    const c = cauHinh("queue.call_back_after_days", n);
    assert.equal(goi(n - 1, c), false, `${n}: ngày ${n - 1}`);
    assert.equal(goi(n, c), true, `${n}: ngày ${n}`);
  }
});

test("canHoiLai nhận cấu hình: mặc định, giá trị khác, hai biên", () => {
  const cu = { listPrice: 1_000_000_000, feeInclusion: "included" as const };
  const len = (pt: number) => ({ listPrice: 1_000_000_000 + pt * 10_000_000, feeInclusion: "included" as const });
  assert.equal(canHoiLai(cu, len(20)).hoi, false);
  assert.equal(canHoiLai(cu, len(21)).hoi, true);
  const { min, max } = khoangCua("price.change_confirm_pct");
  assert.deepEqual([min, max], [5, 50]);
  const cacMuc = [min, Math.floor((min + max) / 2), max];
  for (const n of cacMuc) {
    const c = cauHinh("price.change_confirm_pct", n);
    assert.equal(canHoiLai(cu, len(n), c).hoi, false, `${n}%: đúng mức`);
    assert.equal(canHoiLai(cu, len(n + 1), c).hoi, true, `${n}%: quá mức`);
  }
  for (const c of [undefined, ...cacMuc.map((n) => cauHinh("price.change_confirm_pct", n))])
    assert.equal(canHoiLai(cu, { listPrice: 1_000_000_000, feeInclusion: "excluded" }, c).hoi, true, "đổi điều kiện phí luôn hỏi");
});

test("chia lead và hàng đợi lấy số, khoảng từ sổ", () => {
  const md = readLeadRoutingSettings([]);
  assert.equal(md.acceptMinutes, 15);
  assert.equal(md.firstCallMinutes, 30);
  const bien = readLeadRoutingSettings([
    { key: "lead_routing.accept_minutes", value: 1 },
    { key: "lead_routing.first_call_minutes", value: 1440 },
  ]);
  assert.equal(bien.acceptMinutes, 1);
  assert.equal(bien.firstCallMinutes, 1440);
  for (const [truong, khoa] of [
    ["acceptMinutes", "lead_routing.accept_minutes"],
    ["firstCallMinutes", "lead_routing.first_call_minutes"],
  ] as const) {
    for (const v of [0, 1441]) {
      const kq = applyLeadRoutingPatch(DEFAULT_LEAD_ROUTING, { [truong]: v });
      assert.equal(kq.ok, false, `${truong}=${v}`);
      if (!kq.ok) assert.ok(kq.error.includes(khoa), kq.error);
    }
  }
  assert.equal(QUEUE_DEFAULT_DAYS.priceAdjustment, macDinhSo("queue.price_negotiation_after_days"));
  assert.equal(QUEUE_DEFAULT_DAYS.callBack, macDinhSo("queue.call_back_after_days"));
  assert.deepEqual(QUEUE_DAY_RANGES.price_adjustment, khoangCua("queue.price_negotiation_after_days"));
  assert.deepEqual(QUEUE_DAY_RANGES.call_back, khoangCua("queue.call_back_after_days"));
});

test("hạn lead đọc từ cấu hình ở hai biên", () => {
  const c = readLeadRoutingSettings([
    { key: "lead_routing.accept_minutes", value: 1 },
    { key: "lead_routing.first_call_minutes", value: 1440 },
  ]);
  const tu = "2026-11-04T00:00:00.000Z";
  const luc = (giay: number) => new Date(Date.parse(tu) + giay * 1000);
  // Kho chung tự nhận là cách chia báo «chưa chia được» theo hạn nhận; các cách khác báo ngay.
  const lead = { strategy: "open_pool" as const, createdAt: tu, acceptMinutes: c.acceptMinutes };
  assert.equal(unroutedDue(lead, luc(59)), false);
  assert.equal(unroutedDue(lead, luc(60)), true);
  const fact = { leadId: "l1", deadlineFrom: tu, acceptMinutes: c.acceptMinutes, firstCallMinutes: c.firstCallMinutes, acceptedAt: tu, firstCalledAt: null, raised: [] };
  assert.equal(dueAlerts(fact, luc(1439 * 60)).includes("first_call_overdue"), false);
  assert.equal(dueAlerts(fact, luc(1440 * 60)).includes("first_call_overdue"), true);
});
