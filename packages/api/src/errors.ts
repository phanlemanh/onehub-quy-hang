/**
 * Mã lỗi của API — một chỗ duy nhất (ADR-0007). Thân lỗi luôn là `{ "error": <code> }` với đúng mã HTTP ở đây; màn đọc
 * kiểu `ApiErrorCode` để tra câu báo tiếng Việt, không in mã ra chữ.
 */
export const API_ERRORS = {
  unauthenticated: { code: "unauthenticated", status: 401 },
  notAMember: { code: "not-a-member", status: 403 },
  noCompany: { code: "no-company", status: 403 },
  adminRequired: { code: "admin-required", status: 403 },
  selectCompany: { code: "select-company", status: 409 },
  alreadyMember: { code: "already-member", status: 409 },
  lastAdmin: { code: "last-admin", status: 409 },
  zoneNameTaken: { code: "zone-name-taken", status: 409 },
  invalidRole: { code: "invalid-role", status: 400 },
  roleRequired: { code: "role-required", status: 400 },
  invalidZone: { code: "invalid-zone", status: 400 },
  zoneNameRequired: { code: "zone-name-required", status: 400 },
  notFound: { code: "not-found", status: 404 },
  // Hàng và sự kiện (ADR-0008).
  versionConflict: { code: "version-conflict", status: 409 },
  invalidTransition: { code: "invalid-transition", status: 400 },
  missingRequirement: { code: "missing-requirement", status: 400 },
  invalidPayload: { code: "invalid-payload", status: 400 },
  // Lớp trường nguồn (ADR-0010).
  listingAgentRequired: { code: "listing-agent-required", status: 403 },
  ownerNotSet: { code: "owner-not-set", status: 404 },
  // Ô nhận lead (ADR-0012).
  leadRoleRequired: { code: "lead-role-required", status: 403 },
  notDuplicateUnit: { code: "not-duplicate-unit", status: 400 },
  alreadyDiscarded: { code: "already-discarded", status: 409 },
  // Cửa nhận danh mục (ADR-0015).
  agreementInactive: { code: "agreement-inactive", status: 403 },
  invalidFeed: { code: "invalid-feed", status: 422 },
  // Chia lead và hạn (ADR-0017).
  invalidSettings: { code: "invalid-settings", status: 400 },
  alreadyAccepted: { code: "already-accepted", status: 409 },
  alreadyCalled: { code: "already-called", status: 409 },
  alreadyClaimed: { code: "already-claimed", status: 409 },
  onLeave: { code: "on-leave", status: 403 },
  teamLeadRequired: { code: "team-lead-required", status: 403 },
  alertReaderRequired: { code: "alert-reader-required", status: 403 },
  leaveForbidden: { code: "leave-forbidden", status: 403 },
  notAListingAgent: { code: "not-a-listing-agent", status: 400 },
  leadNotAssignable: { code: "lead-not-assignable", status: 400 },
  badJobSecret: { code: "bad-job-secret", status: 401 },
  jobSecretMissing: { code: "job-secret-missing", status: 503 },
  // Lead bốn nấc (ADR-0020).
  alreadyReturned: { code: "already-returned", status: 409 },
  alreadyOnBoard: { code: "already-on-board", status: 409 },
  notReturned: { code: "not-returned", status: 409 },
  alreadyResubmitted: { code: "already-resubmitted", status: 409 },
  // Liên hệ (ADR-0021).
  leadHasListing: { code: "lead-has-listing", status: 409 },
  leadNotListable: { code: "lead-not-listable", status: 409 },
  ownerTypeRequired: { code: "owner-type-required", status: 400 },
} as const;

export type ApiErrorKey = keyof typeof API_ERRORS;
export type ApiErrorCode = (typeof API_ERRORS)[ApiErrorKey]["code"];
export type ApiErrorEntry = (typeof API_ERRORS)[ApiErrorKey];

/** Mã giới hạn xin mã đăng nhập — do better-auth trả (thân `{ code, message }`, 429), không qua thân lỗi chung ở trên. */
export const OTP_RATE_LIMITED = "too-many-code-requests";
