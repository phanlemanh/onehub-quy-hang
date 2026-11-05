import assert from "node:assert/strict";
import { test } from "node:test";
import { API_ERRORS } from "./errors";

test("API_ERRORS khớp bảng đổi tên", () => {
  // Ma trận viết trước — bảng «Mã lỗi» của bản thiết kế 2026-10-31-doi-ten-api-tieng-anh.
  const bang: Record<string, [string, number]> = {
    unauthenticated: ["unauthenticated", 401],
    notAMember: ["not-a-member", 403],
    noCompany: ["no-company", 403],
    adminRequired: ["admin-required", 403],
    selectCompany: ["select-company", 409],
    alreadyMember: ["already-member", 409],
    lastAdmin: ["last-admin", 409],
    zoneNameTaken: ["zone-name-taken", 409],
    invalidRole: ["invalid-role", 400],
    roleRequired: ["role-required", 400],
    invalidZone: ["invalid-zone", 400],
    zoneNameRequired: ["zone-name-required", 400],
    notFound: ["not-found", 404],
    // Hàng 8 (ADR-0008).
    versionConflict: ["version-conflict", 409],
    invalidTransition: ["invalid-transition", 400],
    missingRequirement: ["missing-requirement", 400],
    invalidPayload: ["invalid-payload", 400],
    // Hàng 11 (ADR-0010).
    listingAgentRequired: ["listing-agent-required", 403],
    ownerNotSet: ["owner-not-set", 404],
    // Hàng 24 (ADR-0012).
    leadRoleRequired: ["lead-role-required", 403],
    notDuplicateUnit: ["not-duplicate-unit", 400],
    alreadyDiscarded: ["already-discarded", 409],
    // Nhận danh mục Invest (ADR-0015).
    agreementInactive: ["agreement-inactive", 403],
    invalidFeed: ["invalid-feed", 422],
    // Hàng 25 (ADR-0017).
    invalidSettings: ["invalid-settings", 400],
    alreadyAccepted: ["already-accepted", 409],
    alreadyCalled: ["already-called", 409],
    alreadyClaimed: ["already-claimed", 409],
    onLeave: ["on-leave", 403],
    teamLeadRequired: ["team-lead-required", 403],
    alertReaderRequired: ["alert-reader-required", 403],
    leaveForbidden: ["leave-forbidden", 403],
    notAListingAgent: ["not-a-listing-agent", 400],
    leadNotAssignable: ["lead-not-assignable", 400],
    badJobSecret: ["bad-job-secret", 401],
    jobSecretMissing: ["job-secret-missing", 503],
    // Hàng 27 (ADR-0020).
    alreadyReturned: ["already-returned", 409],
    alreadyOnBoard: ["already-on-board", 409],
    notReturned: ["not-returned", 409],
    alreadyResubmitted: ["already-resubmitted", 409],
    // Hàng 85 (ADR-0021).
    leadHasListing: ["lead-has-listing", 409],
    leadNotListable: ["lead-not-listable", 409],
    ownerTypeRequired: ["owner-type-required", 400],
    // Hàng 18 (ADR-0014).
    photoNotImage: ["photo-not-image", 400],
    photoTooLarge: ["photo-too-large", 400],
    photoInternalNoSample: ["photo-internal-no-sample", 400],
    photoStorageMissing: ["photo-storage-missing", 503],
    // va-anh-ban-that.
    photoAlreadyConfirmed: ["photo-already-confirmed", 409],
    // Hàng 26 (ADR-0025).
    pushNotConfigured: ["push-not-configured", 503],
    // dien-ma-can-cho-hang (ADR-0026).
    unitNumberAlreadySet: ["unit-number-already-set", 422],
    unitAlreadyListed: ["unit-already-listed", 422],
    // lien-he-khach (hàng 86).
    buyerAgentRequired: ["buyer-agent-required", 403],
    phoneOwnedElsewhere: ["phone-owned-elsewhere", 409],
    prospectClosed: ["prospect-closed", 409],
    notABuyerAgent: ["not-a-buyer-agent", 400],
    buyerTypeRequired: ["buyer-type-required", 400],
    listingNotShareable: ["listing-not-shareable", 400],
    // va-doi-gia-can-da-ban.
    priceLockedClosed: ["price-locked-closed", 422],
    // nhap-excel-xem-truoc-ghi (hàng 65a).
    importRoleRequired: ["import-role-required", 403],
    importPlanInvalid: ["import-plan-invalid", 422],
    importBatchTooLarge: ["import-batch-too-large", 422],
    // phat-hang (hàng 43).
    exportRoleRequired: ["export-role-required", 403],
    reassignmentTooLarge: ["reassignment-too-large", 400],
    reassignmentUndone: ["reassignment-undone", 409],
  };
  assert.equal(Object.keys(API_ERRORS).length, 64);
  assert.deepEqual(Object.keys(API_ERRORS).sort(), Object.keys(bang).sort());
  for (const [k, e] of Object.entries(API_ERRORS)) {
    assert.deepEqual([e.code, e.status], bang[k], k);
    assert.match(e.code, /^[a-z]+(-[a-z]+)*$/, k);
  }
});
