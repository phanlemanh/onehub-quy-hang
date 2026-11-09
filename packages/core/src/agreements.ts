import { CEILING, type DataClass } from "./data-classes";

/** Loại kết nối — cơ chế dựng một lần; mỗi thoả thuận là một lần bật (ADR-0017 §3). */
export const CONNECTION_KINDS = [
  "catalog_source",
  "listing_channel",
  "lead_source",
  "spreadsheet",
  "company_partnership",
  "company_api",
  // Xử lý bằng AI (ADR-0011 qđ 2, hàng 68): chiều ra, bên kia `anthropic`, chỉ `catalog` và `shareable_listing`.
  "ai_processing",
  // Xác nhận danh mục (hàng 95, ADR-0017 §6 sửa đổi 03/11 của Invest): chiều ra, chỉ lớp danh mục, máy thu Invest kéo về.
  "catalog_confirmation",
] as const;

export type ConnectionKind = (typeof CONNECTION_KINDS)[number];

/** Nhãn trên màn của loại «Xác nhận danh mục» — tới khi CONTEXT.md có mục riêng. */
export const KIND_LABEL_CATALOG_CONFIRMATION = "Xác nhận danh mục";

/**
 * Trần theo loại kết nối (hàng 95): loại khai ở đây chỉ được đúng một chiều và một tập lớp, không điều khoản riêng —
 * hẹp hơn trần của lớp. Kiểm lúc ký (`agreementErrors`) và lúc chảy (`mayFlow`, trước bước điều khoản riêng); ràng
 * buộc `agreements_xac_nhan_chi_danh_muc` (migration 040) chặn lần nữa ở cơ sở dữ liệu.
 */
export const KIND_LIMITS: Readonly<
  Partial<Record<ConnectionKind, { label: string; direction: Direction; dataClasses: readonly DataClass[]; specialTerms: false }>>
> = {
  catalog_confirmation: { label: KIND_LABEL_CATALOG_CONFIRMATION, direction: "outbound", dataClasses: ["catalog"], specialTerms: false },
};

/** `inbound`: dữ liệu vào công ty · `outbound`: dữ liệu rời công ty. */
export type Direction = "inbound" | "outbound";

/**
 * Loại kết nối được cấp token máy (hàng 96, ADR-0015 sửa đổi 09/11): máy của bên kia gọi API bằng token gắn một thoả
 * thuận. `catalog_source` chiều vào là Invest đẩy danh mục; `catalog_confirmation` chiều ra là máy thu Invest kéo xác nhận
 * (hàng 97). Loại và chiều khác không có máy bên kia gọi vào nên không cấp.
 */
export const MACHINE_TOKEN_KINDS: readonly { kind: ConnectionKind; direction: Direction }[] = [
  { kind: "catalog_source", direction: "inbound" },
  { kind: "catalog_confirmation", direction: "outbound" },
];

/** Số token còn sống tối đa mỗi thoả thuận: đủ để cấp cái mới, đổi bên kia, rồi thu hồi cái cũ không mất lần đẩy nào. */
export const MACHINE_TOKEN_LIMIT = 2;

/** Thoả thuận loại và chiều này có được cấp token máy không. */
export function machineTokenAllowed(kind: ConnectionKind, direction: Direction): boolean {
  return MACHINE_TOKEN_KINDS.some((m) => m.kind === kind && m.direction === direction);
}

export type AgreementStatus = "active" | "paused" | "ended";

export interface Agreement {
  id: string;
  companyId: string;
  kind: ConnectionKind;
  direction: Direction;
  /** Bên kia: một công ty khác, hoặc một hệ thống như `onehub-invest`, `onehub-platform`. */
  counterparty: string;
  dataClasses: readonly DataClass[];
  validFrom: Date;
  validUntil: Date | null;
  status: AgreementStatus;
  approvedBy: string;
  /** Có điều khoản riêng cho lớp `transaction` (giá chốt). */
  specialTerms: boolean;
}

export type FlowDecision = { ok: true } | { ok: false; reason: string };

export interface FlowContext {
  at: Date;
  /** Dữ liệu đi ra đã ở dạng tổng hợp (cho lớp `behavior`). */
  aggregated?: boolean;
  /** Công ty đã bật riêng trường này cho ra ngoài (cho lớp `custom_field`). */
  fieldSharedByCompany?: boolean;
  /** Loại kết nối bên gọi mong đợi; có mặt thì thoả thuận phải đúng loại này. */
  kind?: ConnectionKind;
  /** Chiều bên gọi mong đợi; có mặt thì thoả thuận phải đúng chiều này. */
  direction?: Direction;
}

/**
 * Lỗi cấu trúc của một thoả thuận — kiểm lúc tạo, trước khi lưu.
 * Thoả thuận đi ra không được liệt kê lớp có trần chặn cứng; như vậy lỗi lộ ra lúc ký, không phải lúc chảy.
 */
export function agreementErrors(agreement: Agreement): string[] {
  const errors: string[] = [];
  if (agreement.dataClasses.length === 0) errors.push("Thoả thuận phải có ít nhất một lớp dữ liệu.");
  if (agreement.dataClasses.includes("source")) {
    errors.push("Lớp «Nguồn» (chủ nhà, số điện thoại, giá đáy, ảnh sổ) không bao giờ rời công ty.");
  }
  if (agreement.direction === "outbound" && agreement.dataClasses.includes("company_internal")) {
    errors.push("Lớp «Nội bộ công ty» chỉ ở trong công ty.");
  }
  const gioiHan = KIND_LIMITS[agreement.kind];
  if (gioiHan) {
    const ten = `Thoả thuận «${gioiHan.label}»`;
    if (agreement.direction !== gioiHan.direction) errors.push(`${ten} chỉ đi chiều ${gioiHan.direction === "outbound" ? "ra" : "vào"}.`);
    for (const dc of agreement.dataClasses) {
      if (!gioiHan.dataClasses.includes(dc)) errors.push(`${ten} không mang được lớp «${dc}» — chỉ lớp danh mục.`);
    }
    if (agreement.specialTerms) errors.push(`${ten} không có điều khoản riêng.`);
  }
  if (agreement.validUntil && agreement.validUntil <= agreement.validFrom) {
    errors.push("Ngày hết hiệu lực phải sau ngày bắt đầu.");
  }
  return errors;
}

/** Một lớp dữ liệu có được chảy theo thoả thuận này, vào lúc này không. */
export function mayFlow(agreement: Agreement, dataClass: DataClass, ctx: FlowContext): FlowDecision {
  // Trần đứng trước mọi thứ: thoả thuận sai cấu trúc cũng không mở được lớp «nguồn».
  if (dataClass === "source") return { ok: false, reason: "Lớp «Nguồn» không bao giờ rời công ty." };
  // Trần theo loại: lớp ngoài tập của loại không chảy, kể cả khi hàng lệch liệt nó và có điều khoản riêng.
  const gioiHan = KIND_LIMITS[agreement.kind];
  if (gioiHan && !gioiHan.dataClasses.includes(dataClass)) {
    return { ok: false, reason: `Thoả thuận «${gioiHan.label}» chỉ mở lớp danh mục.` };
  }
  // Bên gọi nêu loại và chiều mong đợi: thoả thuận của loại khác không mở được luồng này.
  if (ctx.kind !== undefined && ctx.kind !== agreement.kind) {
    return { ok: false, reason: "Thoả thuận không đúng loại kết nối." };
  }
  if (ctx.direction !== undefined && ctx.direction !== agreement.direction) {
    return { ok: false, reason: "Thoả thuận không đúng chiều." };
  }
  if (agreement.status !== "active") return { ok: false, reason: `Thoả thuận đang ${agreement.status}.` };
  if (ctx.at < agreement.validFrom) return { ok: false, reason: "Thoả thuận chưa đến ngày hiệu lực." };
  if (agreement.validUntil && ctx.at >= agreement.validUntil) return { ok: false, reason: "Thoả thuận đã hết hiệu lực." };
  if (!agreement.dataClasses.includes(dataClass)) return { ok: false, reason: "Lớp này không nằm trong thoả thuận." };

  // Dữ liệu vào công ty chỉ cần thoả thuận còn hiệu lực; khuôn ở packages/connect lo phần còn lại.
  if (agreement.direction === "inbound") return { ok: true };

  switch (CEILING[dataClass]) {
    case "external":
    case "by_agreement":
      return { ok: true };
    case "company_only":
      return { ok: false, reason: "Lớp này chỉ ở trong công ty." };
    case "by_company_toggle":
      return ctx.fieldSharedByCompany
        ? { ok: true }
        : { ok: false, reason: "Công ty chưa bật trường riêng này cho ra ngoài." };
    case "by_agreement_with_terms":
      return agreement.specialTerms
        ? { ok: true }
        : { ok: false, reason: "Giá chốt chỉ ra ngoài theo thoả thuận có điều khoản riêng." };
    case "aggregate_only":
      return ctx.aggregated ? { ok: true } : { ok: false, reason: "Hành vi chỉ ra ngoài ở dạng tổng hợp." };
    case "never_leaves_company":
      return { ok: false, reason: "Lớp này không bao giờ rời công ty." };
  }
}
