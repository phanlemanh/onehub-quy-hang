import assert from "node:assert/strict";
import { test } from "node:test";
import { agreementErrors, mayFlow, type Agreement } from "./agreements";
import { CEILING, DATA_CLASSES } from "./data-classes";

const at = new Date("2026-11-01T00:00:00Z");

function agreement(overrides: Partial<Agreement> = {}): Agreement {
  return {
    id: "agr-1",
    companyId: "company-a",
    kind: "listing_channel",
    direction: "outbound",
    counterparty: "onehub-platform",
    dataClasses: ["catalog", "shareable_listing", "transaction", "behavior", "custom_field"],
    validFrom: new Date("2026-10-01T00:00:00Z"),
    validUntil: null,
    status: "active",
    approvedBy: "[Tên]",
    specialTerms: false,
    ...overrides,
  };
}

test("mọi lớp dữ liệu đều có trần", () => {
  for (const dc of DATA_CLASSES) assert.ok(CEILING[dc], dc);
});

test("lớp nguồn không bao giờ chảy, kể cả khi thoả thuận liệt kê nó", () => {
  const a = agreement({ dataClasses: ["source"], specialTerms: true });
  assert.equal(mayFlow(a, "source", { at }).ok, false);
  assert.equal(mayFlow({ ...a, direction: "inbound" }, "source", { at }).ok, false);
  assert.ok(agreementErrors(a).some((e) => e.includes("Nguồn")));
});

test("hàng chia sẻ được và danh mục chảy theo thoả thuận đang bật", () => {
  assert.deepEqual(mayFlow(agreement(), "shareable_listing", { at }), { ok: true });
  assert.deepEqual(mayFlow(agreement(), "catalog", { at }), { ok: true });
});

test("lớp không có trong thoả thuận thì không chảy", () => {
  const a = agreement({ dataClasses: ["catalog"] });
  assert.equal(mayFlow(a, "shareable_listing", { at }).ok, false);
});

test("thoả thuận tạm dừng, chưa tới ngày hay đã hết hạn thì dừng chảy", () => {
  assert.equal(mayFlow(agreement({ status: "paused" }), "catalog", { at }).ok, false);
  assert.equal(mayFlow(agreement({ validFrom: new Date("2026-12-01T00:00:00Z") }), "catalog", { at }).ok, false);
  assert.equal(mayFlow(agreement({ validUntil: new Date("2026-10-15T00:00:00Z") }), "catalog", { at }).ok, false);
});

test("giá chốt cần điều khoản riêng", () => {
  assert.equal(mayFlow(agreement(), "transaction", { at }).ok, false);
  assert.equal(mayFlow(agreement({ specialTerms: true }), "transaction", { at }).ok, true);
});

test("hành vi chỉ ra ngoài ở dạng tổng hợp", () => {
  assert.equal(mayFlow(agreement(), "behavior", { at }).ok, false);
  assert.equal(mayFlow(agreement(), "behavior", { at, aggregated: true }).ok, true);
});

test("trường riêng ra ngoài chỉ khi công ty bật từng trường", () => {
  assert.equal(mayFlow(agreement(), "custom_field", { at }).ok, false);
  assert.equal(mayFlow(agreement(), "custom_field", { at, fieldSharedByCompany: true }).ok, true);
});

test("nội bộ công ty không ra ngoài, và thoả thuận đi ra liệt kê nó là sai cấu trúc", () => {
  const a = agreement({ dataClasses: ["company_internal"] });
  assert.equal(mayFlow(a, "company_internal", { at }).ok, false);
  assert.ok(agreementErrors(a).length > 0);
});

test("kết nối vào công ty (danh mục từ Invest) chảy khi thoả thuận còn hiệu lực", () => {
  const a = agreement({ kind: "catalog_source", direction: "inbound", counterparty: "onehub-invest", dataClasses: ["catalog"] });
  assert.deepEqual(agreementErrors(a), []);
  assert.deepEqual(mayFlow(a, "catalog", { at }), { ok: true });
});

test("mayFlow: loại và chiều mong đợi", () => {
  const lead = agreement({ kind: "lead_source", direction: "inbound", dataClasses: ["catalog"] });
  const wrongKind = mayFlow(lead, "catalog", { at, kind: "catalog_source" });
  assert.equal(wrongKind.ok, false, "thoả thuận lead_source phải bị chặn: không đúng loại");
  assert.ok(!wrongKind.ok && wrongKind.reason.includes("không đúng loại"), "lý do phải nêu «không đúng loại»");

  const outbound = agreement({ kind: "catalog_source", direction: "outbound", dataClasses: ["catalog"] });
  const wrongDirection = mayFlow(outbound, "catalog", { at, direction: "inbound" });
  assert.equal(wrongDirection.ok, false, "thoả thuận outbound phải bị chặn: không đúng chiều");
  assert.ok(!wrongDirection.ok && wrongDirection.reason.includes("không đúng chiều"), "lý do phải nêu «không đúng chiều»");

  const inbound = agreement({
    kind: "catalog_source",
    direction: "inbound",
    counterparty: "onehub-invest",
    dataClasses: ["catalog"],
  });
  assert.deepEqual(mayFlow(inbound, "catalog", { at, kind: "catalog_source", direction: "inbound" }), { ok: true });
});

test("mayFlow: lời gọi cũ không truyền loại giữ nguyên hành vi", () => {
  const lead = agreement({ kind: "lead_source", direction: "inbound", dataClasses: ["catalog"] });
  assert.deepEqual(mayFlow(lead, "catalog", { at }), { ok: true });
});
