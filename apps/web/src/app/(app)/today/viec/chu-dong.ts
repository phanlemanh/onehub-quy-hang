/**
 * Chữ của một dòng việc thuộc vai khác đầu chủ — bốn ô như dòng của đầu chủ. Thuần; đồng hồ và cách đọc tên người do màn
 * truyền vào. Chỉ dựng từ lối đọc đang có: không số khách, không trường lớp `source`.
 */
import { NEED_LABELS } from "@quy-hang/core/dedupe";
import { MOC_VIEC_DAU_KHACH_GIO } from "@quy-hang/core/today";

import { chuQuaHan } from "../../team/trang-thai";
import { chuTin, hrefTin, NHAN_TIN } from "../../shares/tin/dau-khach";
import type { DongVai } from "./gop-viec";

export type ChuDong = {
  tieuDe: string;
  phu: string;
  lyDo: string;
  han: { chu: string; muc: "qua" | "thuong" } | null;
  chiTiet: string;
  nut: string;
  href: string | null;
};

const LY_DO_DOI = { unrouted: "Toà chưa có đầu chủ phụ trách", accept_overdue: "Chưa nhận", first_call_overdue: "Đã nhận, chưa gọi" } as const;
const NUT_TIN = { reaction: "Xem phản ứng", changed: "Xem link", new_match: "Gửi căn" } as const;

const ngayNgan = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit" });

function conGio(at: string, bayGio: string): number {
  return Math.max(1, Math.ceil((Date.parse(at) + MOC_VIEC_DAU_KHACH_GIO * 3_600_000 - Date.parse(bayGio)) / 3_600_000));
}

export function chuDong(d: DongVai, bayGio: string, tenNguoi: (id: string | null) => string): ChuDong {
  if (d.kind === "doi") {
    const quaHan = d.dong.kind === "unrouted" ? null : `Quá hạn ${d.dong.kind === "accept_overdue" ? "nhận" : "gọi"} ${chuQuaHan(d.dong.dueAt, bayGio)}`;
    return {
      tieuDe: `${d.dong.buildingName} · ${d.dong.unitNumber ?? "chỉ biết toà"}`,
      phu: "Lead",
      lyDo: LY_DO_DOI[d.dong.kind],
      han: quaHan ? { chu: quaHan, muc: "qua" } : null,
      chiTiet: d.dong.agentUserId ? `Đang ở ${tenNguoi(d.dong.agentUserId)}` : "Chưa có người",
      nut: "Giao lại",
      href: null,
    };
  }
  if (d.kind === "tra-lai")
    return {
      tieuDe: `${d.lead.buildingName} · ${d.lead.unitNumber ?? "chỉ biết toà"}`,
      phu: NEED_LABELS[d.lead.need] ?? "Lead",
      lyDo: d.lead.returnReason ?? "Bị trả lại",
      han: null,
      chiTiet: `Nhập ${ngayNgan.format(new Date(d.lead.createdAt))}`,
      nut: "Sửa số",
      href: null,
    };
  const chu = chuTin(d.tin);
  return {
    tieuDe: chu.tieuDe,
    phu: NHAN_TIN[d.tin.kind],
    lyDo: chu.chiTiet,
    han: { chu: `Còn ${conGio(d.tin.at, bayGio)} giờ`, muc: "thuong" },
    chiTiet: chu.phu,
    nut: NUT_TIN[d.tin.kind],
    href: hrefTin(d.tin),
  };
}
