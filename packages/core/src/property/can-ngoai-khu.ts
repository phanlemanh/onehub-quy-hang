/**
 * Căn ngoài khu (hàng can-ngoai-khu, ADR-0016 quyết định 3–5): nhà mặt đường, nhà trong hẻm, đất lẻ — không danh mục, định
 * danh bằng địa chỉ chuẩn của lõi. Căn là bản ghi của sàn; cùng khoá địa chỉ trong một sàn là một căn. Hàm thuần: đọc thân
 * lệnh tạo căn ra bản ghi căn, hay lý do từ chối nêu phần thiếu — không đoán (quyết định 5).
 */
import { docDiaChi, type PhanDiaChi } from "../address";
import { SOURCE_KEYS } from "../listing/events";

/** Loại hình tạo được ngoài khu — giá trị RESO nguyên văn, giữ cứng (Hỏi-3 Cổng Phạm vi 07/11: nghĩa chuẩn để so giữa sàn). */
export const LOAI_HINH_NGOAI_KHU = ["Townhouse", "Single Family Residence", "Unimproved Land"] as const;
export type LoaiHinhNgoaiKhu = (typeof LOAI_HINH_NGOAI_KHU)[number];

/** Bản ghi căn ngoài khu trước khi vào bảng: mã tỉnh, mã xã của danh mục; `addressKey` `null` khi chưa có số nhà (Hỏi-2). */
export type CanNgoaiKhuMoi = {
  propertySubType: LoaiHinhNgoaiKhu;
  stateOrProvinceCode: string;
  wardCode: string;
  streetName: string;
  streetNumber: string | null;
  unparsedAddress: string;
  addressKey: string | null;
};

export type LoiCan = { path: string; reason: string };
export type KetQuaCanNgoaiKhu = { ok: true; can: CanNgoaiKhuMoi } | { ok: false; loi: LoiCan[] };

const TEN_PHAN: Record<PhanDiaChi, string> = { stateOrProvince: "tỉnh, thành", wardName: "xã, phường", streetName: "tên đường", streetNumber: "số nhà" };
const KHOA_THAN = ["address", "propertySubType"] as const;

/** Đọc thân `{ address, propertySubType }` (khuôn chặt: khoá lạ và khoá nguồn bị từ chối). */
export function docCanNgoaiKhu(than: unknown): KetQuaCanNgoaiKhu {
  if (!than || typeof than !== "object" || Array.isArray(than)) return { ok: false, loi: [{ path: "body", reason: "cần một đối tượng" }] };
  const o = than as Record<string, unknown>;
  const loi: LoiCan[] = [];
  for (const k of Object.keys(o)) {
    if ((KHOA_THAN as readonly string[]).includes(k)) continue;
    loi.push({ path: k, reason: (SOURCE_KEYS as readonly string[]).includes(k) ? "thông tin chủ nhà không vào căn" : "khoá lạ" });
  }
  if (!LOAI_HINH_NGOAI_KHU.includes(o.propertySubType as LoaiHinhNgoaiKhu))
    loi.push({ path: "propertySubType", reason: `căn ngoài khu cần một trong: ${LOAI_HINH_NGOAI_KHU.join(", ")}` });
  const chu = o.address;
  if (typeof chu !== "string" || chu.trim().length === 0 || chu.length > 300) loi.push({ path: "address", reason: "cần chữ địa chỉ, 1–300 ký tự" });
  if (loi.length) return { ok: false, loi };

  const d = docDiaChi(chu as string);
  const xa = d.wardName;
  if (xa && "canNguoiChon" in xa) {
    return { ok: false, loi: [{ path: "address", reason: `cần chọn xã, phường cho «${xa.chu}»: ${xa.ungVien.map((u) => `${u.ten} (${u.tenTinh})`).join(", ")}` }] };
  }
  if (d.chuaCoTrongDanhMuc.length) {
    return { ok: false, loi: [{ path: "address", reason: `chưa có trong danh mục: ${d.chuaCoTrongDanhMuc.map((c) => `${TEN_PHAN[c.phan]} «${c.chu}»`).join(", ")}` }] };
  }
  // Thiếu số nhà vẫn tạo được căn, không khoá (Hỏi-2); thiếu phần khác thì nói thiếu phần nào.
  const thieu = d.thieu.filter((p) => p !== "streetNumber");
  if (thieu.length || !d.stateOrProvince || !xa || !d.streetName) {
    return { ok: false, loi: [{ path: "address", reason: `thiếu ${(thieu.length ? thieu : (["stateOrProvince", "wardName", "streetName"] as PhanDiaChi[])).map((p) => TEN_PHAN[p]).join(", ")}` }] };
  }
  return {
    ok: true,
    can: {
      propertySubType: o.propertySubType as LoaiHinhNgoaiKhu,
      stateOrProvinceCode: d.stateOrProvince.ma,
      wardCode: xa.ma,
      streetName: d.streetName,
      streetNumber: d.streetNumber,
      unparsedAddress: d.unparsedAddress,
      addressKey: d.trangThai === "chuan" ? d.khoa : null,
    },
  };
}
