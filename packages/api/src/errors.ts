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
  // Ảnh căn ba ngăn (ADR-0014).
  photoNotImage: { code: "photo-not-image", status: 400 },
  photoTooLarge: { code: "photo-too-large", status: 400 },
  photoInternalNoSample: { code: "photo-internal-no-sample", status: 400 },
  photoStorageMissing: { code: "photo-storage-missing", status: 503 },
  photoAlreadyConfirmed: { code: "photo-already-confirmed", status: 409 },
  // Thông báo lead (ADR-0025).
  pushNotConfigured: { code: "push-not-configured", status: 503 },
  // Gắn mã căn (ADR-0026).
  unitNumberAlreadySet: { code: "unit-number-already-set", status: 422 },
  unitAlreadyListed: { code: "unit-already-listed", status: 422 },
  // Liên hệ khách (hàng 86, ADR-0021 sửa đổi 03/11).
  buyerAgentRequired: { code: "buyer-agent-required", status: 403 },
  phoneOwnedElsewhere: { code: "phone-owned-elsewhere", status: 409 },
  prospectClosed: { code: "prospect-closed", status: 409 },
  notABuyerAgent: { code: "not-a-buyer-agent", status: 400 },
  buyerTypeRequired: { code: "buyer-type-required", status: 400 },
  listingNotShareable: { code: "listing-not-shareable", status: 400 },
  // Căn Đã bán không đổi giá (va-doi-gia-can-da-ban).
  priceLockedClosed: { code: "price-locked-closed", status: 422 },
  // Lần nhập file bảng hàng (hàng 65a, ADR-0011).
  importRoleRequired: { code: "import-role-required", status: 403 },
  importPlanInvalid: { code: "import-plan-invalid", status: 422 },
  importBatchTooLarge: { code: "import-batch-too-large", status: 422 },
  /** Hoàn tác lần nhập đứt giữa chừng (hàng 66): phần đã làm giữ nguyên, gọi lại làm tiếp. */
  importUndoIncomplete: { code: "import-undo-incomplete", status: 503 },
  // Xuất bảng hàng (hàng 43): chỉ đầu chủ, trưởng nhóm.
  exportRoleRequired: { code: "export-role-required", status: 403 },
  // Mật khẩu do sàn cấp (hàng dang-nhap-mat-khau) — hợp đồng viết mã bằng gạch dưới, kho giữ gạch nối. Email lạ và mật khẩu sai chung
  // một mã; các mã riêng chỉ trả khi mật khẩu đúng.
  invalidEmailOrPassword: { code: "invalid-email-or-password", status: 401 },
  passwordRateLimited: { code: "password-rate-limited", status: 429 },
  passwordDisabled: { code: "password-disabled", status: 403 },
  tempPasswordExpired: { code: "temp-password-expired", status: 403 },
  changeTokenInvalid: { code: "change-token-invalid", status: 403 },
  invalidCurrentPassword: { code: "invalid-current-password", status: 403 },
  userInOtherCompany: { code: "user-in-other-company", status: 409 },
  passwordTooShort: { code: "password-too-short", status: 400 },
  passwordTooLong: { code: "password-too-long", status: 400 },
  passwordCommon: { code: "password-common", status: 400 },
  passwordGuessable: { code: "password-guessable", status: 400 },
} as const;

export type ApiErrorKey = keyof typeof API_ERRORS;
export type ApiErrorCode = (typeof API_ERRORS)[ApiErrorKey]["code"];
export type ApiErrorEntry = (typeof API_ERRORS)[ApiErrorKey];

/** Mã giới hạn xin mã đăng nhập — do better-auth trả (thân `{ code, message }`, 429), không qua thân lỗi chung ở trên. */
export const OTP_RATE_LIMITED = "too-many-code-requests";
