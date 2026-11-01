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
  };
  assert.equal(Object.keys(API_ERRORS).length, 34);
  assert.deepEqual(Object.keys(API_ERRORS).sort(), Object.keys(bang).sort());
  for (const [k, e] of Object.entries(API_ERRORS)) {
    assert.deepEqual([e.code, e.status], bang[k], k);
    assert.match(e.code, /^[a-z]+(-[a-z]+)*$/, k);
  }
});
