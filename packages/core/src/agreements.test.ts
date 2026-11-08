import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
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

// Hàng 68 (ADR-0011 qđ 2): cửa ra AI là một thoả thuận — chiều ra, bên kia Anthropic, chỉ catalog và shareable_listing.
test("ai_processing: chỉ catalog và shareable_listing ra Anthropic", async () => {
  const { CONNECTION_KINDS } = await import("./agreements");
  assert.ok((CONNECTION_KINDS as readonly string[]).includes("ai_processing"), "CONNECTION_KINDS chứa ai_processing");
  const ai = agreement({ kind: "ai_processing" as Agreement["kind"], counterparty: "anthropic", dataClasses: ["catalog", "shareable_listing"] });
  const ctx = { at, kind: "ai_processing" as Agreement["kind"], direction: "outbound" as const };
  assert.deepEqual(agreementErrors(ai), [], "thoả thuận AI hợp lệ");
  assert.deepEqual(mayFlow(ai, "catalog", ctx), { ok: true }, "catalog ra AI");
  assert.deepEqual(mayFlow(ai, "shareable_listing", ctx), { ok: true }, "shareable_listing ra AI");
  // Ma trận viết tay năm lớp còn lại — không lớp nào ra AI.
  for (const dc of ["source", "company_internal", "custom_field", "transaction", "behavior"] as const)
    assert.equal(mayFlow(ai, dc, ctx).ok, false, `lớp ${dc} không ra AI`);
  assert.equal(mayFlow({ ...ai, dataClasses: ["catalog", "source"] }, "source", ctx).ok, false, "source không ra AI kể cả khi liệt kê");
  assert.ok(agreementErrors({ ...ai, dataClasses: ["catalog", "source"] }).length > 0, "thêm source là thoả thuận sai");
  assert.equal(mayFlow({ ...ai, status: "paused" }, "catalog", ctx).ok, false, "tạm ngừng thì không ra");
});

// Hàng 95 (ADR-0017 §6 sửa đổi 03/11 của Invest): loại «Xác nhận danh mục» chỉ chiều ra, chỉ lớp danh mục, không điều
// khoản riêng — trần theo loại đứng trước bước điều khoản riêng.
const xacNhan = (overrides: Partial<Agreement> = {}): Agreement =>
  agreement({ kind: "catalog_confirmation", counterparty: "onehub-invest", dataClasses: ["catalog"], ...overrides });

test("xác nhận danh mục: trần theo loại, bảy lớp", () => {
  // Thoả thuận lệch liệt đủ bảy lớp (như một hàng lệch trong cơ sở dữ liệu): chỉ danh mục chảy.
  const lech = (specialTerms: boolean) => xacNhan({ dataClasses: [...DATA_CLASSES], specialTerms });
  const ctx = { at, aggregated: true, fieldSharedByCompany: true };
  let dem = 0;
  for (const specialTerms of [false, true]) {
    for (const dc of DATA_CLASSES) {
      const kq = mayFlow(lech(specialTerms), dc, ctx);
      if (dc === "catalog") assert.deepEqual(kq, { ok: true }, `catalog chảy (specialTerms ${specialTerms})`);
      else {
        assert.equal(kq.ok, false, `${dc} không chảy (specialTerms ${specialTerms})`);
        const tu = dc === "source" ? "Nguồn" : "Xác nhận danh mục";
        assert.ok(!kq.ok && kq.reason.includes(tu), `${dc}: lý do nêu «${tu}», được «${!kq.ok && kq.reason}»`);
      }
      dem++;
    }
  }
  assert.equal(dem, DATA_CLASSES.length * 2);
  assert.equal(dem, 14);
});

test("xác nhận danh mục: lỗi cấu trúc", () => {
  assert.deepEqual(agreementErrors(xacNhan()), [], "đối chứng dương: chiều ra, chỉ danh mục, không điều khoản riêng");
  const maTran: Agreement[] = [
    ...DATA_CLASSES.filter((dc) => dc !== "catalog").map((dc) => xacNhan({ dataClasses: ["catalog", dc] })),
    xacNhan({ direction: "inbound" }),
    xacNhan({ specialTerms: true }),
  ];
  let dem = 0;
  for (const a of maTran) {
    const loi = agreementErrors(a);
    assert.ok(
      loi.some((e) => e.includes("Xác nhận danh mục")),
      `${a.direction} ${a.dataClasses.join(",")} specialTerms ${a.specialTerms}: thiếu lỗi «Xác nhận danh mục» (${JSON.stringify(loi)})`,
    );
    dem++;
  }
  assert.equal(dem, DATA_CLASSES.length - 1 + 2);
  assert.equal(dem, 8);
});

test("sáu loại cũ và ai_processing giữ hành vi", async () => {
  const { CONNECTION_KINDS } = await import("./agreements");
  let dem = 0;
  for (const kind of CONNECTION_KINDS) {
    if (kind === "catalog_confirmation") continue;
    const a = agreement({ kind, dataClasses: ["catalog", "transaction"], specialTerms: true });
    assert.deepEqual(mayFlow(a, "transaction", { at }), { ok: true }, `${kind}: giá chốt theo điều khoản riêng vẫn chảy`);
    dem++;
  }
  assert.equal(dem, CONNECTION_KINDS.length - 1);
});

/** Các loại trong check `kind in (…)` của `agreements_kind_check` ở một đoạn SQL migration. */
function rutLoai(sql: string): string[] {
  const m = sql.match(/add constraint agreements_kind_check\s+check \(kind in \(([^)]*)\)\)/);
  return m?.[1] ? [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1] ?? "") : [];
}

/** Loại có ở một bên mà vắng ở bên kia, mỗi loại một dòng. */
function lechLoai(sqlLoai: readonly string[], loiLoai: readonly string[]): string[] {
  return [
    ...loiLoai.filter((k) => !sqlLoai.includes(k)).map((k) => `thiếu ở cơ sở dữ liệu: ${k}`),
    ...sqlLoai.filter((k) => !loiLoai.includes(k)).map((k) => `thừa ở cơ sở dữ liệu: ${k}`),
  ];
}

test("danh sách loại của ràng buộc cơ sở dữ liệu trùng CONNECTION_KINDS", async () => {
  const { CONNECTION_KINDS } = await import("./agreements");
  const thuMuc = fileURLToPath(new URL("../../db/migrations/", import.meta.url));
  const tep = readdirSync(thuMuc).find((f) => f.startsWith("040_"));
  assert.ok(tep, "có migration 040");
  const loai = rutLoai(readFileSync(thuMuc + tep, "utf8"));
  assert.equal(loai.length, CONNECTION_KINDS.length);
  assert.equal(loai.length, 8);
  CONNECTION_KINDS.forEach((k, i) => assert.equal(loai[i], k, `phần tử ${i}`));
  assert.deepEqual(lechLoai(loai, CONNECTION_KINDS), []);
  // Đối chứng âm cùng hàm so: SQL thử thiếu catalog_confirmation.
  const thieu = rutLoai("add constraint agreements_kind_check\n  check (kind in ('catalog_source', 'ai_processing'))");
  assert.ok(lechLoai(thieu, CONNECTION_KINDS).includes("thiếu ở cơ sở dữ liệu: catalog_confirmation"));
});
