// Liên hệ ở lõi (hàng 85: AC-1, AC-10). Loại theo RESO ContactType; trạng thái Lead/Liên hệ theo KW Command.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  CONTACT_VIEW_KEYS,
  contactStatus,
  contactView,
  isOwnerContact,
  PHONE_LABELS,
  typesForNeed,
  validateContactPatch,
  type ContactRecord,
  type ContactType,
} from ".";

test("liên hệ: thực đơn loại theo RESO", () => {
  assert.deepEqual([...CONTACT_TYPES], ["Seller", "Landlord", "Buyer", "Tenant"]);
  assert.deepEqual(CONTACT_TYPE_LABELS, { Seller: "Chủ bán", Landlord: "Chủ cho thuê", Buyer: "Người mua", Tenant: "Người thuê" });
  assert.deepEqual([...PHONE_LABELS], ["Home", "Mobile", "Work", "Other"]);
});

test("liên hệ: loại theo nhu cầu", () => {
  const BANG: [Parameters<typeof typesForNeed>[0], ContactType[]][] = [
    ["sale", ["Seller"]],
    ["lease", ["Landlord"]],
    ["sale_or_lease", ["Seller", "Landlord"]],
  ];
  let so = 0;
  for (const [need, mong] of BANG) {
    assert.deepEqual(typesForNeed(need), mong, need);
    so++;
  }
  assert.equal(so, 3);
});

test("liên hệ: lớp nguồn", () => {
  // Mọi tập con không rỗng của bốn loại: có Seller hay Landlord → lớp nguồn.
  const BANG: [string, boolean][] = [
    ["Seller", true], ["Landlord", true], ["Buyer", false], ["Tenant", false],
    ["Seller+Landlord", true], ["Seller+Buyer", true], ["Seller+Tenant", true], ["Landlord+Buyer", true],
    ["Landlord+Tenant", true], ["Buyer+Tenant", false], ["Seller+Landlord+Buyer", true], ["Seller+Landlord+Tenant", true],
    ["Seller+Buyer+Tenant", true], ["Landlord+Buyer+Tenant", true], ["Seller+Landlord+Buyer+Tenant", true],
  ];
  let so = 0;
  for (const [ten, mong] of BANG) {
    assert.equal(isOwnerContact(ten.split("+") as ContactType[]), mong, `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 15);
});

test("liên hệ: Lead hay Liên hệ", () => {
  const BANG: [string, { hasListing: boolean; anyFirstCall: boolean }, "lead" | "contact"][] = [
    ["chưa gọi, chưa có hàng", { hasListing: false, anyFirstCall: false }, "lead"],
    ["có mốc gọi trên một lead", { hasListing: false, anyFirstCall: true }, "contact"],
    ["có hàng gắn", { hasListing: true, anyFirstCall: false }, "contact"],
    ["lead có mốc gọi nhưng đã trả lại", { hasListing: false, anyFirstCall: true }, "contact"],
  ];
  let so = 0;
  for (const [ten, f, mong] of BANG) {
    assert.equal(contactStatus(f), mong, `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 4);
});

const BAN: ContactRecord = {
  id: "c-1",
  fullName: "[Tên]",
  contactTypes: ["Seller"],
  ownerMemberUserId: "u-1",
  phoneCount: 2,
  hasListing: true,
  anyFirstCall: false,
  createdAt: "2026-11-01T00:00:00.000Z",
  phoneEnc: Buffer.from([1, 2]),
  phoneHash: Buffer.from([3]),
};

test("liên hệ: bản xem không số", () => {
  assert.deepEqual(contactView(BAN, false), { visible: false });
  const v = contactView(BAN, true);
  assert.deepEqual(Object.keys(v), [...CONTACT_VIEW_KEYS]);
  assert.deepEqual(Object.keys(v), ["id", "fullName", "contactTypes", "ownerMemberUserId", "phoneCount", "status", "createdAt"]);
  assert.ok(!("phoneEnc" in v) && !("phoneHash" in v) && !("ownerPhone" in v));
  assert.equal((v as { status: string }).status, "contact");
});

test("liên hệ: khuôn sửa loại", () => {
  assert.deepEqual(validateContactPatch({ contactTypes: ["Buyer", "Seller", "Seller"] }), { ok: true, value: { contactTypes: ["Seller", "Buyer"] } });
  for (const [ten, than] of [
    ["khoá lạ", { contactTypes: ["Seller"], x: 1 }],
    ["loại ngoài thực đơn", { contactTypes: ["Lead"] }],
    ["mảng rỗng", { contactTypes: [] }],
    ["không phải mảng", { contactTypes: "Seller" }],
  ] as const) {
    assert.equal(validateContactPatch(than).ok, false, ten);
  }
});

const GOC = join(import.meta.dirname, "../../../..");
test("liên hệ: tài liệu khớp lõi", () => {
  const tc = readFileSync(join(GOC, "docs/product/tham-chieu.md"), "utf8");
  const muc = tc.split(/^## /m).find((m) => m.startsWith("") && /Tri thức ngành và RESO/.test(m.split("\n")[0]!));
  assert.ok(muc, "Tham chiếu thiếu mục «Tri thức ngành và RESO»");
  for (const t of ["Contacts", "ContactType", "ContactListings", "Liên hệ", "Loại liên hệ", "Lead", "Chủ nhà"]) assert.ok(muc!.includes(t), `mục RESO thiếu «${t}»`);
  const ctx = readFileSync(join(GOC, "CONTEXT.md"), "utf8");
  for (const t of ["| Liên hệ |", "| Loại liên hệ |", "| Người giữ |"]) assert.ok(ctx.includes(t), `CONTEXT.md thiếu ${t}`);
  const lead = ctx.split("\n").find((l) => l.startsWith("| Lead |"))!;
  assert.ok(!lead.includes("hàng ở nấc đầu") && lead.includes("hai chiều") && lead.includes("cơ hội"), "dòng Lead chưa viết lại theo Hỏi-5");
  for (const nhan of Object.values(CONTACT_TYPE_LABELS)) assert.ok(ctx.includes(nhan), `CONTEXT.md thiếu nhãn «${nhan}»`);
  const adr = readdirSync(join(GOC, "docs/adr")).find((f) => f.startsWith("0021-"));
  assert.ok(adr, "thiếu ADR-0021");
  const a = readFileSync(join(GOC, "docs/adr", adr), "utf8");
  assert.ok(/hàng 47/.test(a) && /ADR-0018/.test(a) && /quyết định 8/.test(a), "ADR-0021 thiếu mục chờ hàng 47");
});
