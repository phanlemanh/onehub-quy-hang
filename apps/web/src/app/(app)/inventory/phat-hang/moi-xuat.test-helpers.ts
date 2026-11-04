// Bộ kiểm rò rỉ dùng chung của Xuất bảng hàng (hàng 43, E7): mồi đi qua đường của trang (dòng bảng hàng → `dongSangCan` →
// `xuatBang`), quét mọi đầu ra bằng `timRoRi`. Hai tệp kiểm nhập tệp này: `inventory/phat-hang/xuat.ro-ri.test.ts` và
// `exports/new/xuat.ro-ri.test.ts`. Nhập tương đối — bộ kiểm rò rỉ chạy ở gốc kho, không có bí danh `@/`.
import { inflateRawSync } from "node:zlib";
import { MA_MAU_XUAT, ghiXlsx, type BanXuat } from "@quy-hang/core/export";
import { CAU_HINH_TAT_CA, NGUOI_NHAN, giaTriMoi, timRoRi, type CanNoiBo, type CauHinhRa, type NguoiNhan } from "@quy-hang/core/redaction";
import { COT, type CotId, type DongBang } from "../cot";
import { banXuatTuDong, type TuyChonTrang } from "./chuyen-dong";
import { chuDeVe } from "./ve-anh";

export const TODAY = "2026-11-04";
/** Mọi cột của bảng hàng, theo thứ tự bảng — góc nhìn mở nhất. */
export const MOI_COT: readonly CotId[] = COT.map((c) => c.id);

/**
 * Dòng bảng hàng mồi dựng từ `canMoi()`: mọi trường dòng có lấy giá trị mồi; thêm các khoá nội bộ của căn mồi (chủ nhà,
 * giá đáy, người giữ, liên hệ, trường riêng…) như thể một dòng chở lạ chúng — `dongSangCan` không được chép.
 */
export function dongMoi(c: CanNoiBo): DongBang {
  const d = {
    id: "moi-dong-0001",
    buildingName: c.buildingName,
    unitNumber: c.unitNumber,
    unitType: "2PN",
    livingArea: c.livingArea,
    floor: c.floor,
    directionFaces: c.directionFaces,
    standardStatus: c.standardStatus,
    listPrice: c.listPrice,
    feeInclusion: c.feeInclusion,
    furnished: c.furnished,
    legalStatus: c.legalStatus,
    financing: c.financing,
    occupantType: c.occupantType,
    confirmedAgeDays: 11,
    needsCallBack: false,
    completeness: 4,
    visibility: "Company" as const,
    closePrice: c.closePrice,
    closeDate: c.closeDate,
    withdrawnReason: c.withdrawnReason,
    propertySubType: c.propertySubType,
    // Khoá lạ của dòng:
    ownerName: c.ownerName,
    ownerPhone: c.ownerPhone,
    floorPrice: c.floorPrice,
    titleDeedPhoto: c.titleDeedPhoto,
    contacts: c.contacts,
    holderName: c.holderName,
    holderUserId: c.holderUserId,
    customFields: c.customFields,
  };
  return d;
}

/** Chữ của mọi mục trong zip (.xlsx): lưu không nén đọc thẳng, nén deflate giải bằng `inflateRaw`. */
export function chuTrongZip(zip: Uint8Array): string {
  const v = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const dec = new TextDecoder();
  const ra: string[] = [];
  let i = 0;
  while (i + 30 <= zip.length && v.getUint32(i, true) === 0x04034b50) {
    const cachNen = v.getUint16(i + 8, true);
    const coNen = v.getUint32(i + 18, true);
    const dai = 30 + v.getUint16(i + 26, true) + v.getUint16(i + 28, true);
    const du = zip.subarray(i + dai, i + dai + coNen);
    ra.push(dec.decode(cachNen === 8 ? inflateRawSync(du) : du));
    i += dai + coNen;
  }
  if (ra.length === 0) throw new Error("không đọc được mục nào trong zip");
  return ra.join("\n");
}

/** Mọi văn bản ra ngoài của một bản xuất: bài, từng ô, nhãn bỏ, chữ đưa bộ vẽ, chữ trong .xlsx, JSON của bản. */
export function vanBanRa(ban: BanXuat): { ten: string; vanBan: string }[] {
  return [
    { ten: "bài", vanBan: ban.bai ?? "" },
    ...ban.dong.flatMap((d, r) => d.map((o, c) => ({ ten: `ô ${r + 1}:${ban.cot[c] ?? c}`, vanBan: o }))),
    { ten: "Cột không ra ngoài", vanBan: ban.boQua.join(", ") },
    { ten: "chữ vẽ ảnh/PDF", vanBan: chuDeVe(ban).join("\n") },
    { ten: "xlsx", vanBan: chuTrongZip(ghiXlsx(ban)) },
    { ten: "bản xuất", vanBan: JSON.stringify(ban) },
  ];
}

export type HamTrang = (dong: readonly DongBang[], tuy: TuyChonTrang) => BanXuat;

const tenCauHinh = (c: CauHinhRa) => `${c.showConfirmedAge ? "hien-tuoi" : "an-tuoi"}+${c.privateHidesUnitNumber ? "an-ma-can" : "hien-ma-can"}`;

/** 5 mẫu × 2 người nhận × 4 cấu hình qua đường của trang; trả `<mẫu>/<người nhận>/<cấu hình>: rò <trường> ở <chỗ>`. */
export function kiemDuongTrang(can: CanNoiBo, ham: HamTrang = banXuatTuDong): string[] {
  const loi: string[] = [];
  const dong = [dongMoi(can)];
  for (const mau of MA_MAU_XUAT) {
    for (const nguoiNhan of NGUOI_NHAN as readonly NguoiNhan[]) {
      for (const cauHinh of CAU_HINH_TAT_CA) {
        const ban = ham(dong, { mau, nguoiNhan, cauHinh, cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn] Mồi", tenNguoiGui: "[Tên] Người gửi" });
        const moi = giaTriMoi(can, nguoiNhan, cauHinh);
        for (const { ten, vanBan } of vanBanRa(ban)) {
          for (const r of timRoRi(vanBan, moi)) loi.push(`${mau}/${nguoiNhan}/${tenCauHinh(cauHinh)}: rò ${r.truong} ở ${ten}`);
        }
      }
    }
  }
  return [...new Set(loi)];
}

/** Khoá nội bộ của căn — chỉ `chuyen-dong.ts` được nhắc tới trong mã của hộp thoại. */
export const KHOA_NOI_BO = [
  "ownerName",
  "ownerPhone",
  "floorPrice",
  "titleDeedPhoto",
  "contacts",
  "holderName",
  "holderUserId",
  "withdrawnReason",
  "closePrice",
  "customFields",
] as const;

/** Quét nguồn: tệp nào (ngoài `chuyen-dong.ts`) nhắc khoá nội bộ → `<tệp>: đọc <khoá>`. */
export function quetNguon(tep: readonly { ten: string; nguon: string }[]): string[] {
  const re = new RegExp(`\\b(${KHOA_NOI_BO.join("|")})\\b`, "g");
  return tep
    .filter((t) => !t.ten.endsWith("chuyen-dong.ts"))
    .flatMap((t) => [...new Set([...t.nguon.matchAll(re)].map((m) => m[1]))].map((k) => `${t.ten}: đọc ${k}`));
}
