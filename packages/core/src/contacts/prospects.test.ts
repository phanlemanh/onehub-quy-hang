// Nhu cầu khách ở lõi (hàng 86: AC-1, AC-10). Khách là liên hệ Buyer / Tenant; nhu cầu khách theo RESO Prospecting.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PROSPECT_EVENT_TYPES,
  PROSPECT_VIEW_KEYS,
  prospectView,
  typesForProspectNeed,
  validateProspectInput,
  type ContactType,
  type ProspectNeed,
  type ProspectRecord,
} from ".";

test("nhu cầu khách: loại giao dịch ra loại liên hệ", () => {
  const BANG: [ProspectNeed, ContactType[]][] = [
    ["purchase", ["Buyer"]],
    ["lease", ["Tenant"]],
    ["purchase_or_lease", ["Buyer", "Tenant"]],
  ];
  let so = 0;
  for (const [need, loai] of BANG) {
    assert.deepEqual(typesForProspectNeed(need), loai, need);
    so++;
  }
  assert.equal(so, 3);
});

test("nhu cầu khách: khuôn nhập", () => {
  const DUNG = {
    displayName: "[Tên]",
    phone: "0900 000 011",
    need: "purchase",
    criteria: { SubdivisionName: ["[Khu]"], BuildingName: ["Toà A"], BedroomsTotalMin: 2, LivingAreaMin: 55.5, ListPriceMax: 3_000_000_000, LeaseAmountMax: 15_000_000, Note: "gần trường" },
  };
  // [tên dòng, thân, path lỗi mong đợi — null là hợp lệ]
  const BANG: [string, unknown, string | null][] = [
    ["thân đúng đủ khoá", DUNG, null],
    ["khoá lạ ở gốc", { ...DUNG, ownerName: "x" }, "ownerName"],
    ["khoá lạ trong tiêu chí", { ...DUNG, criteria: { ...DUNG.criteria, PropertyType: "Condo" } }, "criteria.PropertyType"],
    ["số sai khuôn", { ...DUNG, phone: "12345" }, "phone"],
    ["loại giao dịch ngoài thực đơn", { ...DUNG, need: "sale" }, "need"],
    ["BedroomsTotalMin âm", { ...DUNG, criteria: { BedroomsTotalMin: -1 } }, "criteria.BedroomsTotalMin"],
    ["ListPriceMax không phải số", { ...DUNG, criteria: { ListPriceMax: "3 tỷ" } }, "criteria.ListPriceMax"],
    ["tên rỗng", { ...DUNG, displayName: "  " }, "displayName"],
  ];
  let so = 0;
  for (const [ten, than, loi] of BANG) {
    const r = validateProspectInput(than);
    if (loi === null) {
      assert.ok(r.ok, `${ten}: ${JSON.stringify(r)}`);
      if (r.ok) assert.equal(r.value.phone, "0900000011", ten);
    } else {
      assert.ok(!r.ok, `${ten}: khuôn nhận thân sai`);
      if (!r.ok) assert.deepEqual(r.errors.map((e) => e.path), [loi], ten);
    }
    so++;
  }
  assert.equal(so, BANG.length);
  assert.equal(so, 8);
});

test("nhu cầu khách: tên loại sự kiện", () => {
  assert.deepEqual([...PROSPECT_EVENT_TYPES], ["inquiry_received", "phone_added", "reassigned", "closed"]);
});

test("nhu cầu khách: bản xem không số", () => {
  const MA_LIEN_HE = "11111111-2222-3333-4444-555555555555";
  const rec: ProspectRecord = {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    displayName: "[Tên]",
    need: "purchase_or_lease",
    criteria: { BedroomsTotalMin: 2 },
    ownerMemberUserId: "u-dau-khach",
    closedAt: null,
    createdAt: "2026-11-03T00:00:00.000Z",
    contactId: MA_LIEN_HE,
    phoneEnc: "0900000011",
    phoneHash: "dauvet-bi-mat",
  };
  // Đối chứng dương: bản ghi gốc mang đủ ba giá trị.
  const goc = JSON.stringify(rec);
  for (const x of [MA_LIEN_HE, "0900000011", "dauvet-bi-mat"]) assert.ok(goc.includes(x), `đối chứng: ${x}`);
  const v = prospectView(rec);
  assert.deepEqual(Object.keys(v), ["id", "displayName", "need", "contactTypes", "criteria", "ownerMemberUserId", "closedAt", "createdAt"]);
  assert.deepEqual(Object.keys(v), [...PROSPECT_VIEW_KEYS], "khoá thừa hay thiếu trong bản xem");
  const json = JSON.stringify(v);
  for (const x of [MA_LIEN_HE, "0900000011", "dauvet-bi-mat"]) assert.ok(!json.includes(x), `bản xem lộ ${x}`);
  assert.deepEqual(v.contactTypes, ["Buyer", "Tenant"]);
});
