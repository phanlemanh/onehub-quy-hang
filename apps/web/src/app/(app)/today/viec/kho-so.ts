/**
 * Số việc dùng chung giữa thân Hôm nay, đầu màn và cột thứ hai (hồ sơ hom-nay-mot-danh-sach-viec): thân đọc xong thì ghi vào
 * đây, nên cột và đầu màn không đọc riêng và không thể lệch số với thân.
 */
import { useSyncExternalStore } from "react";

import { BO_NHOM_MAC_DINH, NHOM_VAI, type MaNhomVai } from "@quy-hang/core/today";

import type { MaNguon, RaGop } from "./gop-viec";

export type MucSo = { ma: string; nhan: string; so: number | null };
/** `coLoi`: có nguồn của vai người xem đọc hỏng. */
export type SoViec = { so: number; quaHan: number; coLoi: boolean; muc: readonly MucSo[] };

/** Dòng dưới tiêu đề. Chưa có việc mà có nguồn đọc hỏng thì để trống: không được nói «Không còn việc» (AC-9). */
export function moTaSoViec(s: SoViec | null): string | undefined {
  if (!s) return undefined;
  if (s.so) return `${s.so} việc${s.quaHan ? ` · ${s.quaHan} quá hạn` : ""}`;
  return s.coLoi ? undefined : "Không còn việc";
}

/** Bộ nhóm của người xem, cùng thứ tự với thân: của trưởng nhóm, bộ đầu chủ, rồi telesales, đầu khách. */
export function boNhomCua<T>(vai: readonly string[], boDauChu: readonly T[], tao: (ma: MaNhomVai, macDinh: string) => T): T[] {
  const cua = (truongNhom: boolean) => NHOM_VAI.filter((n) => vai.includes(n.vai) && (n.vai === "team_lead") === truongNhom).map((n) => tao(n.code, n.label));
  return [...cua(true), ...(vai.includes("listing_agent") ? boDauChu : []), ...cua(false)];
}

const NGUON_NHOM: Readonly<Record<string, MaNguon>> = { lead_overdue: "hang-doi", lead_unrouted: "hang-doi", lead_returned: "lead-cua-toi", buyer_reaction: "tin", buyer_changed: "tin", buyer_new_match: "tin", new_lead: "lead-giao" };

/** Số từng mục của cột thứ hai, lấy từ chính kết quả gộp; nhóm của nguồn đọc hỏng không có số. */
export function mucSoTuGop(bo: readonly { code: string; label: string; enabled: boolean; subject?: string }[], gop: Pick<RaGop<unknown>, "nhom" | "loi">): MucSo[] {
  // Nhóm sàn tự đặt mã không có trong bảng: nhóm lead thuộc nguồn lead giao, nhóm căn đọc từ máy nên không thuộc nguồn nào.
  const nguonCua = (n: { code: string; subject?: string }): MaNguon | undefined => NGUON_NHOM[n.code] ?? (n.subject === "lead" ? "lead-giao" : undefined);
  return bo
    .filter((n) => n.enabled)
    .map((n) => ({ ma: n.code, nhan: n.label, so: gop.loi.some((l) => l.nguon === nguonCua(n)) ? null : (gop.nhom.find((g) => g.ma === n.code)?.viec.length ?? 0) }));
}

let hien: SoViec | null = null;
const nghe = new Set<() => void>();

export function datSoViec(s: SoViec | null): void {
  hien = s;
  for (const f of nghe) f();
}

export const docSoViec = () => hien;

function theoDoi(f: () => void) {
  nghe.add(f);
  return () => nghe.delete(f);
}

export function useSoViec(): SoViec | null {
  return useSyncExternalStore(theoDoi, docSoViec, () => null);
}

export type MucCotViec = { label: string; href: string; so: number | null };

/** Mục của cột: «Tất cả việc», rồi nhóm của vai người xem. Chưa có số, hay tổng 0 mà có nguồn đọc hỏng, thì không số. */
export function mucCotHomNay(roles: readonly string[], soViec: SoViec | null): MucCotViec[] {
  const dau: MucCotViec = { label: "Tất cả việc", href: "/today", so: soViec && !(soViec.coLoi && soViec.so === 0) ? soViec.so : null };
  if (soViec) return [dau, ...soViec.muc.map((m) => ({ label: m.nhan, href: `/today?nhom=${m.ma}`, so: m.so }))];
  const dauChu = roles.includes("listing_agent") ? BO_NHOM_MAC_DINH.filter((n) => n.enabled).map((n) => ({ code: n.code, label: n.label })) : [];
  const vai = NHOM_VAI.filter((n) => roles.includes(n.vai));
  const truoc = vai.filter((n) => n.vai === "team_lead");
  const sau = vai.filter((n) => n.vai !== "team_lead");
  return [dau, ...[...truoc, ...dauChu, ...sau].map((n) => ({ label: n.label, href: `/today?nhom=${n.code}`, so: null }))];
}
