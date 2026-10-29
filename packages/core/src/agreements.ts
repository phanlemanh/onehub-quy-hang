import { CEILING, type DataClass } from "./data-classes";

/** Loại kết nối — cơ chế dựng một lần; mỗi thoả thuận là một lần bật (ADR-0017 §3). */
export const CONNECTION_KINDS = [
  "catalog_source",
  "listing_channel",
  "lead_source",
  "spreadsheet",
  "company_partnership",
  "company_api",
] as const;

export type ConnectionKind = (typeof CONNECTION_KINDS)[number];

/** `inbound`: dữ liệu vào công ty · `outbound`: dữ liệu rời công ty. */
export type Direction = "inbound" | "outbound";

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
  if (agreement.validUntil && agreement.validUntil <= agreement.validFrom) {
    errors.push("Ngày hết hiệu lực phải sau ngày bắt đầu.");
  }
  return errors;
}

/** Một lớp dữ liệu có được chảy theo thoả thuận này, vào lúc này không. */
export function mayFlow(agreement: Agreement, dataClass: DataClass, ctx: FlowContext): FlowDecision {
  // Trần đứng trước mọi thứ: thoả thuận sai cấu trúc cũng không mở được lớp «nguồn».
  if (dataClass === "source") return { ok: false, reason: "Lớp «Nguồn» không bao giờ rời công ty." };
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
