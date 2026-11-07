/**
 * Phần thuần của Hôm nay đầu chủ (hàng 22): dựng dữ kiện căn cho bộ máy hàng đợi của lõi từ bản trên máy và danh mục, nói
 * lý do căn vào nhóm bằng chữ, đọc giá kèm điều kiện phí, đọc hạn của lead. Không React, không mạng — kiểm bằng `node:test`.
 * «Ngày», «hôm nay», «hôm qua» theo lịch Việt Nam (UTC+7 cố định) như lõi, không theo múi giờ của máy.
 */
import { completeness, isStandardStatus, nhanViTri } from "@quy-hang/core/listing";
import { nhanCuaCan, type NhanTrangThai } from "@quy-hang/core/statuses";
import { lucLenDangBan, type Condition, type DuKienCan, type LanDoi, type Nhom } from "@quy-hang/core/today";
import type { ListingView } from "@/lib/sync/types";
import { nhanVai } from "@/lib/vai";
import { FEE_LABEL } from "../inventory/cot";
import { ghepDanhMuc, type ChiMucDanhMuc } from "../inventory/ghep-danh-muc";
import { NHAN_PHAN } from "../units/ho-so/ho-so";

const VN_MS = 7 * 60 * 60 * 1000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const ngayVn = (iso: string) => Math.floor((Date.parse(iso) + VN_MS) / NGAY_MS);

/** Một căn của Hôm nay: bản trên máy kèm dữ kiện cho bộ máy hàng đợi và vài thuộc tính danh mục để hiện. */
export type CanHomNay = DuKienCan & { id: string; buildingName: string; unitNumber: string | null; unitType: string; livingArea: number | null; listPrice: number | null; feeInclusion: string | null };

/** Khoá `lucVaoTrangThai` của bản xem hàng (hàng 46) — kho trên máy từ trước hàng 46 chưa có. */
const vaoTrangThai = (l: ListingView): string | null | undefined => (l as ListingView & { lucVaoTrangThai?: string | null }).lucVaoTrangThai;

/** Bản trên máy → dữ kiện căn: loại hình qua ghép danh mục của Bảng hàng, mục thiếu tính lại trên máy (gồm thao tác chờ). */
export function canHomNay(l: ListingView, idx: ChiMucDanhMuc): CanHomNay {
  const d = ghepDanhMuc(l, idx);
  return {
    id: l.id,
    buildingName: nhanViTri(l),
    unitNumber: l.unitNumber,
    unitType: d.unitType,
    livingArea: d.livingArea,
    listPrice: l.listPrice,
    feeInclusion: l.feeInclusion,
    standardStatus: l.standardStatus,
    listAgentKey: l.listAgentKey ?? null,
    lastConfirmedAt: l.lastConfirmedAt,
    priceChangeTimestamp: l.priceChangeTimestamp ?? null,
    lastPriceChange: l.lastPriceChange ?? null,
    lastStatusChange: l.lastStatusChange ?? null,
    // Lúc vào trạng thái hiện tại (hàng 46) khi bản xem hàng mang nó; vắng thì lõi đọc lần đổi gần nhất như cũ.
    ...(vaoTrangThai(l) !== undefined && { lucVaoTrangThai: vaoTrangThai(l) }),
    // «Thiếu thông tin» đọc năm mục mô tả; ảnh là nhóm riêng «Bổ sung ảnh» qua photosCount (anh-khong-chan-ban).
    missing: completeness(l).missing,
    ...(l.photosCount !== undefined && { photosCount: l.photosCount }),
    propertySubType: d.propertySubType ?? null,
  };
}

// ——— Chữ ———

const SO_TY = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const SO_NGUYEN = new Intl.NumberFormat("vi-VN");
const TY = 1_000_000_000;

/** «2,95 tỷ» · «950 triệu». */
export function chuGia(dong: number): string {
  return dong >= TY ? `${SO_TY.format(dong / TY)} tỷ` : `${SO_NGUYEN.format(Math.round(dong / 1_000_000))} triệu`;
}

/** «3,10 → 2,95 tỷ» — cùng đơn vị thì nói đơn vị một lần. */
function chuDoiGia(from: unknown, to: unknown): string {
  if (typeof from !== "number" || typeof to !== "number") return `Giá ${typeof to === "number" ? `→ ${chuGia(to)}` : "đổi"}`;
  if (from >= TY && to >= TY) return `${SO_TY.format(from / TY)} → ${SO_TY.format(to / TY)} tỷ`;
  return `${chuGia(from)} → ${chuGia(to)}`;
}

/** Chữ một nấc của lần đổi: nhãn riêng của sàn khi lần đổi mang mã còn sống neo đúng nấc (hàng 46), không thì nhãn mặc định. */
const chuNac = (v: unknown, label: string | null | undefined, nhan: readonly NhanTrangThai[] | undefined) =>
  isStandardStatus(v) ? nhanCuaCan(nhan, v, label) : "—";

/** Vai nói thay người đổi: vai cao nhất người ấy giữ lúc đổi. */
const THU_TU_VAI = ["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"];
function chuVai(roles: readonly string[]): string {
  const ma = THU_TU_VAI.find((v) => roles.includes(v)) ?? roles[0];
  return ma ? nhanVai(ma) : "Người khác";
}

/** «hôm nay» · «hôm qua» · «29/10» theo lịch Việt Nam. */
export function chuNgay(at: string, bayGio: string): string {
  const lech = ngayVn(bayGio) - ngayVn(at);
  if (lech <= 0) return "hôm nay";
  if (lech === 1) return "hôm qua";
  const d = new Date(Date.parse(at) + VN_MS);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Lần đổi của người khác: «3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua» · «Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay».
 * `nhan`: bộ nhãn trạng thái của sàn (hàng 46) — «Đang bán → Giữ chỗ», đổi nhãn tại chỗ «Đang giao dịch → Giữ chỗ».
 */
export function chuLanDoi(l: LanDoi, loai: "gia" | "nac", bayGio: string, nhan?: readonly NhanTrangThai[]): string {
  const cai = loai === "gia" ? chuDoiGia(l.from, l.to) : `${chuNac(l.from, l.fromLabel, nhan)} → ${chuNac(l.to, l.toLabel, nhan)}`;
  return `${cai} — ${chuVai(l.byRoles)}, ${chuNgay(l.at, bayGio)}`;
}

// Mốc lên Đang bán đọc lõi (`lucLenDangBan`, hàng 46): đổi nhãn tại chỗ trong Đang bán không đặt lại số ngày.
function moc(c: DuKienCan, anchor: Extract<Condition, { kind: "days_since" }>["anchor"]): string | null {
  const gia = c.priceChangeTimestamp ?? lucLenDangBan(c);
  if (anchor === "price") return gia;
  if (anchor === "confirmed") return c.lastConfirmedAt;
  if (anchor === "active_since") return lucLenDangBan(c);
  const ds = [gia, c.lastConfirmedAt].filter((x): x is string => !!x);
  return ds.length ? ds.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b)) : null;
}

function chuQuaNgay(d: Extract<Condition, { kind: "days_since" }>, c: DuKienCan, bayGio: string): string {
  const m = moc(c, d.anchor);
  if (d.anchor === "confirmed") return m ? `Chưa xác nhận ${ngayVn(bayGio) - ngayVn(m)} ngày` : "Chưa từng xác nhận";
  if (d.anchor === "active_since") return m ? `Đang bán ${ngayVn(bayGio) - ngayVn(m)} ngày` : "Chưa rõ lúc lên Đang bán";
  return m ? `Giá giữ ${ngayVn(bayGio) - ngayVn(m)} ngày` : "Chưa từng xác nhận giá";
}

/** Thứ tự nói lý do: điều kiện nói được nhiều nhất về việc cần làm đứng trước. */
const UU_TIEN: Condition["kind"][] = ["missing_info", "changed_by_other", "days_since", "property_sub_type_in", "status_in"];

/**
 * Lý do căn ở nhóm `nhom`, bằng chữ: «Chưa xác nhận 16 ngày», «Chưa từng xác nhận», «Giá giữ 12 ngày», «Thiếu: pháp lý,
 * tài chính», «3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua». Nhóm không có điều kiện nói được thì là tên nhóm. `nhan`: bộ nhãn
 * trạng thái của sàn (hàng 46) cho dòng lần đổi trạng thái.
 */
export function lyDo(nhom: Nhom, can: DuKienCan, nguoi: string, bayGio: string, nhan?: readonly NhanTrangThai[]): string {
  const dk = [...nhom.conditions].sort((a, b) => UU_TIEN.indexOf(a.kind) - UU_TIEN.indexOf(b.kind));
  for (const d of dk) {
    if (d.kind === "missing_info" && can.missing.length) return `Thiếu: ${can.missing.map((m) => (NHAN_PHAN[m] ?? m).toLowerCase()).join(", ")}`;
    if (d.kind === "changed_by_other") {
      const doi = [
        can.lastPriceChange && { l: can.lastPriceChange, loai: "gia" as const },
        can.lastStatusChange && { l: can.lastStatusChange, loai: "nac" as const },
      ]
        .filter((x): x is { l: LanDoi; loai: "gia" | "nac" } => !!x && x.l.byUserId !== nguoi)
        .sort((a, b) => Date.parse(b.l.at) - Date.parse(a.l.at));
      if (doi[0]) return chuLanDoi(doi[0].l, doi[0].loai, bayGio, nhan);
    }
    if (d.kind === "days_since") return chuQuaNgay(d, can, bayGio);
    if (d.kind === "property_sub_type_in" || d.kind === "status_in") return nhom.label;
  }
  return nhom.label;
}

/** «3,25 tỷ · Bao phí» — giá luôn đi cùng điều kiện phí (luật 7). */
export function chuGiaPhi(listPrice: number | null, feeInclusion: string | null): string {
  if (listPrice === null) return "Chưa có giá";
  return `${chuGia(listPrice)} · ${feeInclusion ? (FEE_LABEL[feeInclusion] ?? feeInclusion) : "Chưa rõ phí"}`;
}

/** «2PN · 68,5 m²» · «Chưa rõ». */
export function chuLoai(c: Pick<CanHomNay, "unitType" | "livingArea">): string {
  return c.livingArea === null ? c.unitType : `${c.unitType} · ${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(c.livingArea)} m²`;
}

/** Hạn của lead: chưa nhận thì hạn nhận, đã nhận thì hạn gọi — «Hạn nhận còn 8 phút» · «Quá hạn gọi 5 phút». */
export function chuHan(l: { stage: string; acceptDueAt: string; callDueAt: string }, bayGio: string): { chu: string; qua: boolean } {
  const nhan = l.stage === "sent";
  const han = Date.parse(nhan ? l.acceptDueAt : l.callDueAt);
  const phut = Math.round((han - Date.parse(bayGio)) / 60_000);
  const viec = nhan ? "nhận" : "gọi";
  const doDai = (p: number) => (p >= 60 ? `${Math.floor(p / 60)} giờ${p % 60 ? ` ${p % 60} phút` : ""}` : `${p} phút`);
  return phut >= 0 ? { chu: `Hạn ${viec} còn ${doDai(phut)}`, qua: false } : { chu: `Quá hạn ${viec} ${doDai(-phut)}`, qua: true };
}

/** Lý do 409 của Nhận · Đã gọi · Trả lại bằng chữ (mã lỗi của API). */
const LY_DO_409: Record<string, string> = {
  "already-accepted": "Lead đã được nhận rồi.",
  "already-called": "Lead đã ghi gọi rồi.",
  "already-returned": "Lead đã trả lại rồi.",
  "already-on-board": "Lead đã lên bảng, không trả lại được.",
  "already-discarded": "Lead đã bị bỏ.",
  "already-resubmitted": "Telesales đã gửi lại lead này với số mới.",
  "select-company": "Chọn sàn trước khi ghi.",
};
export const chuLoiLead = (ma: string | null) => (ma && LY_DO_409[ma]) ?? "Lead đã đổi nấc — tải lại để xem.";

/** «09:12» theo giờ Việt Nam. */
export function chuGio(at: string): string {
  const d = new Date(Date.parse(at) + VN_MS);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** «09:12 01/11» theo giờ Việt Nam. */
export function chuGioNgay(at: string): string {
  const d = new Date(Date.parse(at) + VN_MS);
  return `${chuGio(at)} ${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
