/**
 * Đường của trang Xuất bảng hàng (hàng 43, design §4, bất biến 4): dòng bảng hàng → `CanNoiBo` → `xuatBang` của lõi. Đây
 * là chỗ DUY NHẤT của hộp thoại đọc trường của `DongBang`; mọi tệp khác chỉ cầm `BanXuat` (đã qua luật ẩn). Bài kiểm rò
 * rỉ (`xuat.ro-ri.test.ts`) quét nguồn các tệp kia và chạy mồi qua đúng hàm này.
 *
 * Nhập tương đối và qua `@quy-hang/core` — không `@/…` — để bộ kiểm rò rỉ ở gốc kho chạy được tệp này.
 */
import type { TuVung } from "@quy-hang/core/labels";
import type { CanNoiBo, CauHinhRa, NguoiNhan } from "@quy-hang/core/redaction";
import { xuatBang, type BanXuat, type CotBangHang, type CotGocNhin, type MauXuat } from "@quy-hang/core/export";
import type { CotId, DongBang } from "../cot";

export type NguCanh = {
  /** `YYYY-MM-DD` theo ngày của máy người xuất. */
  today: string;
  tenSan: string;
  tenNguoiGui: string;
};

const NGAY_MS = 86_400_000;

/** «Studio» → 0, «2PN» → 2; «Chưa rõ» hay chữ lạ → null (như `nhanLoaiCan` của bảng hàng, chiều ngược). */
function soPhongNgu(loaiCan: string): number | null {
  if (loaiCan === "Studio") return 0;
  const m = /^(\d+)PN$/.exec(loaiCan);
  return m ? Number(m[1]) : null;
}

/** Bảng hàng giữ số ngày từ lần xác nhận; lõi tính lại tuổi từ ngày xác nhận — dựng ngày ấy từ `today`. */
function ngayXacNhan(soNgay: number | null, today: string): string | null {
  if (soNgay === null) return null;
  const goc = Date.parse(`${today.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(goc)) return null;
  return new Date(goc - soNgay * NGAY_MS).toISOString();
}

/**
 * Một dòng bảng hàng thành bản vào của luật ẩn. Chỉ chép các trường dòng có (dòng bảng hàng không chở lớp nguồn); trường
 * không có thì null hay rỗng. Giá chốt, ngày bán, lý do ngừng chép nguyên — luật ẩn của lõi quyết chúng không ra.
 */
export function dongSangCan(dong: DongBang, ngu: NguCanh): CanNoiBo {
  return {
    buildingName: dong.buildingName,
    livingArea: dong.livingArea,
    bedroomsTotal: soPhongNgu(dong.unitType),
    directionFaces: dong.directionFaces,
    propertyType: null,
    propertySubType: dong.propertySubType ?? null,
    unitNumber: dong.unitNumber,
    upi: null,
    stack: null,
    floor: dong.floor,
    // Danh mục trên máy chưa có số tầng của toà: khách riêng thấy «—» thay nấc tầng.
    buildingFloorsTotal: null,
    standardStatus: dong.standardStatus,
    listPrice: dong.listPrice,
    feeInclusion: dong.feeInclusion,
    furnished: dong.furnished,
    legalStatus: dong.legalStatus,
    financing: dong.financing,
    occupantType: dong.occupantType,
    lastConfirmedAt: ngayXacNhan(dong.confirmedAgeDays, ngu.today),
    companyName: ngu.tenSan,
    senderName: ngu.tenNguoiGui,
    photos: [],
    closePrice: dong.closePrice,
    closeDate: dong.closeDate,
    withdrawnReason: dong.withdrawnReason,
    version: 0,
    holderUserId: null,
    holderName: null,
    customFields: {},
    ownerName: null,
    ownerPhone: null,
    floorPrice: null,
    titleDeedPhoto: null,
    contacts: [],
  };
}

export type TuyChonTrang = NguCanh & {
  mau: MauXuat;
  nguoiNhan: NguoiNhan;
  /** Cột đang hiện của góc nhìn, theo thứ tự góc nhìn. */
  cot: readonly CotId[];
  cauHinh?: CauHinhRa;
  /** Cách gọi riêng của sàn (hàng 45, từ `GET /api/v1/company/labels`) — lõi cắt về phần ra ngoài. */
  tuVung?: TuVung;
};

/**
 * Cột của bảng hàng → cột của bảng cột lõi. «Đầu chủ» (hàng 105) là «Người giữ» của lõi (`holderName`, không ra ngoài) —
 * luật ẩn của lõi bỏ nó ở mọi người nhận; mọi cột khác cùng tên.
 */
export const cotLoi = (id: CotId): CotBangHang => (id === "dau-chu" ? "holderName" : id);

/** Tập căn (đã theo thứ tự góc nhìn) → bản xuất của lõi. Hộp thoại chỉ vẽ kết quả này. */
export function banXuatTuDong(dong: readonly DongBang[], tuy: TuyChonTrang): BanXuat {
  const cot: CotGocNhin[] = tuy.cot.map(cotLoi);
  return xuatBang(
    dong.map((d) => dongSangCan(d, tuy)),
    { mau: tuy.mau, nguoiNhan: tuy.nguoiNhan, cauHinh: tuy.cauHinh, cot, today: tuy.today, tenSan: tuy.tenSan, tuVung: tuy.tuVung },
  );
}
