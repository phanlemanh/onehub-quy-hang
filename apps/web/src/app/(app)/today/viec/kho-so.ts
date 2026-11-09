/**
 * Số việc dùng chung giữa thân Hôm nay, đầu màn và cột thứ hai (hồ sơ hom-nay-mot-danh-sach-viec): thân đọc xong thì ghi vào
 * đây, nên cột và đầu màn không đọc riêng và không thể lệch số với thân.
 */
import { useSyncExternalStore } from "react";

import { BO_NHOM_MAC_DINH, NHOM_VAI } from "@quy-hang/core/today";

export type MucSo = { ma: string; nhan: string; so: number | null };
export type SoViec = { so: number; quaHan: number; muc: readonly MucSo[] };

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

/** Mục của cột: «Tất cả việc», rồi nhóm của vai người xem. Chưa có số thì nhãn mặc định, không số. */
export function mucCotHomNay(roles: readonly string[], soViec: SoViec | null): MucCotViec[] {
  const dau: MucCotViec = { label: "Tất cả việc", href: "/today", so: soViec?.so ?? null };
  if (soViec) return [dau, ...soViec.muc.map((m) => ({ label: m.nhan, href: `/today?nhom=${m.ma}`, so: m.so }))];
  const dauChu = roles.includes("listing_agent") ? BO_NHOM_MAC_DINH.filter((n) => n.enabled).map((n) => ({ code: n.code, label: n.label })) : [];
  const vai = NHOM_VAI.filter((n) => roles.includes(n.vai));
  const truoc = vai.filter((n) => n.vai === "team_lead");
  const sau = vai.filter((n) => n.vai !== "team_lead");
  return [dau, ...[...truoc, ...dauChu, ...sau].map((n) => ({ label: n.label, href: `/today?nhom=${n.code}`, so: null }))];
}
