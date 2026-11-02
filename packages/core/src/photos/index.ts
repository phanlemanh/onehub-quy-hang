/**
 * Ảnh căn ba ngăn (hàng 18, ADR-0014). Ảnh thuộc căn của sàn (toà + mã), không thuộc lần rao (luật 27). Hai ngăn có ảnh
 * của đội: «Gửi được» (lớp `shareable_listing`) và «Nội bộ» (lớp `source` — sổ, hợp đồng, giấy tờ; trần
 * `never_leaves_company`). Ngăn thứ ba «Tự có từ mã» đọc từ danh mục. Luật ẩn ở đây, không ở giao diện (bất biến 2, 4).
 * Nhập qua `@quy-hang/core/photos`.
 */
import { CEILING, type DataClass } from "../data-classes";

export const COMPARTMENTS = ["shareable", "internal"] as const;
export type Compartment = (typeof COMPARTMENTS)[number];

/** Lớp dữ liệu của từng ngăn — ngăn nội bộ là lớp nguồn. */
export const COMPARTMENT_CLASS: Readonly<Record<Compartment, DataClass>> = {
  shareable: "shareable_listing",
  internal: "source",
};

/** Nhãn trên màn (CONTEXT.md). */
export const NHAN_NGAN = { shareable: "Gửi được", catalog: "Tự có từ mã", internal: "Nội bộ" } as const;
export const CHU_NOI_BO_KHOA = "Chỉ người giữ căn và trưởng nhóm xem";
export const CHU_DANH_MUC_TRONG = "Danh mục chưa có mặt bằng, ảnh view cho căn này";
export const CHU_CAN_MANG = "Cần mạng để thêm ảnh";

/** Một ảnh như API trả (đã qua luật theo dòng). */
export type UnitPhoto = {
  id: string;
  buildingName: string;
  unitNumber: string;
  compartment: Compartment;
  displayOrder: number;
  isCover: boolean;
  isSample: boolean;
  /** Ngày chụp `YYYY-MM-DD`, đọc từ EXIF khi có. */
  takenAt: string | null;
  addedAt: string;
  contentType: string;
  width: number;
  height: number;
};

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const THUMB_EDGE = 480;
/**
 * Bản che của ảnh (hàng 19): cạnh dài tối đa và chất lượng webp khi lưu bản che ra ngăn Gửi được. Mặc định của sàn —
 * sàn chỉnh ở Cài đặt sàn khi có ô (Hỏi-2 của che-vung-anh, bậc tham số ADR-0018).
 */
export const BAN_CHE_CANH_DAI = 1600;
export const BAN_CHE_CHAT_LUONG = 0.82;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];

export type KiemTep = { ok: true; type: PhotoType } | { ok: false; lyDo: "Không phải ảnh" | "Ảnh quá 10 MB" };

/** Nhận loại ảnh từ byte đầu tệp — không tin đuôi tên hay loại trình duyệt khai. */
export function loaiTuByteDau(b: Uint8Array): PhotoType | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length >= 8 && png.every((x, i) => b[i] === x)) return "image/png";
  const ascii = (from: number, s: string) => [...s].every((c, i) => b[from + i] === c.charCodeAt(0));
  if (b.length >= 12 && ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  return null;
}

/** Kiểm một tệp trước khi ghi: loại theo byte đầu, cỡ ≤ 10 MB. Cùng hàm chạy ở trình duyệt và ở API. */
export function kiemTepAnh(byteDau: Uint8Array, kichThuoc: number): KiemTep {
  const type = loaiTuByteDau(byteDau);
  if (!type) return { ok: false, lyDo: "Không phải ảnh" };
  if (kichThuoc > MAX_PHOTO_BYTES) return { ok: false, lyDo: "Ảnh quá 10 MB" };
  return { ok: true, type };
}

/** Cỡ bản nhẹ: cạnh dài ≤ 480 px, giữ tỉ lệ; ảnh nhỏ hơn giữ nguyên. */
export function coBanNhe(w: number, h: number): { w: number; h: number } {
  const dai = Math.max(w, h);
  if (dai <= THUMB_EDGE) return { w, h };
  const k = THUMB_EDGE / dai;
  return { w: Math.round(w * k), h: Math.round(h * k) };
}

const hai = (n: number) => String(n).padStart(2, "0");
const ngayVN = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

/** Nhãn ảnh: «Ảnh mẫu», hoặc «Ảnh thật · <ngày chụp>», vắng ngày chụp thì ngày thêm (Hỏi-3). */
export function nhanAnh(p: Pick<UnitPhoto, "isSample" | "takenAt" | "addedAt">): string {
  if (p.isSample) return "Ảnh mẫu";
  if (p.takenAt) return `Ảnh thật · ${ngayVN(p.takenAt)}`;
  const d = new Date(p.addedAt);
  return `Ảnh thật · ${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Ảnh của một ngăn theo thứ tự hiện: ảnh bìa đầu (ngăn gửi được), rồi theo `displayOrder`. */
export function sapXep(anh: readonly UnitPhoto[], ngan: Compartment): UnitPhoto[] {
  const ds = anh.filter((p) => p.compartment === ngan).sort((a, b) => a.displayOrder - b.displayOrder);
  if (ngan !== "shareable") return ds;
  const bia = ds.find((p) => p.isCover) ?? ds[0];
  return bia ? [bia, ...ds.filter((p) => p !== bia)] : ds;
}

/** Id ảnh bìa của ngăn gửi được — ảnh đã chọn, chưa ai chọn thì ảnh đầu. */
export function anhBia(anh: readonly UnitPhoto[]): string | null {
  return sapXep(anh, "shareable")[0]?.id ?? null;
}

/**
 * Ảnh được ra ngoài sàn — hàm DUY NHẤT mọi cửa ra (trang khách, gửi ảnh + tin, phát hàng) dùng để chọn ảnh. Chỉ lấy
 * ảnh có lớp mà trần cho ra; lớp `source` không bao giờ ra, tuỳ chọn hay thoả thuận nào cũng vậy.
 */
export function anhRaNgoai(anh: readonly UnitPhoto[], tuyChon: { thoaThuan?: readonly DataClass[] } = {}): UnitPhoto[] {
  // Thoả thuận chỉ mở tới trần của lớp — không mở được lớp `source`, nên tuỳ chọn không đổi kết quả với ảnh nội bộ.
  void tuyChon;
  const raDuoc = anh.filter((p) => CEILING[COMPARTMENT_CLASS[p.compartment]] !== "never_leaves_company");
  return sapXep(raDuoc, "shareable");
}

/** Ảnh danh mục của một căn — khuôn danh mục hiện chưa có trường ảnh nên hôm nay luôn rỗng (hàng 10 đổi khuôn). */
export type AnhDanhMuc = { kind: "floor_plan" | "view"; url: string };
const khoaMa = (s: string) => s.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
/** Ảnh danh mục của đúng căn hỏi — dòng danh mục khác toà hay khác mã thì không trả gì. */
export function anhDanhMuc(
  dong: { buildingName: string; unitNumber: string; media?: readonly AnhDanhMuc[] } | null,
  can: { buildingName: string; unitNumber: string },
): AnhDanhMuc[] {
  if (!dong || dong.buildingName !== can.buildingName || khoaMa(dong.unitNumber) !== khoaMa(can.unitNumber)) return [];
  return dong.media ? [...dong.media] : [];
}

/**
 * Người xem thấy ngăn nội bộ của căn không — trưởng nhóm, hoặc đầu chủ giữ lần rao mới nhất của căn. Trùng luật
 * `app.can_see_unit_internal` của migration 012; bộ kiểm cách ly đo cả hai bằng `bang-xem-noi-bo.json`.
 */
export function canSeeUnitInternal(viewer: { userId: string; roles: readonly string[] }, unit: { holderUserId: string | null }): boolean {
  if (viewer.roles.includes("team_lead")) return true;
  return viewer.roles.includes("listing_agent") && unit.holderUserId !== null && unit.holderUserId === viewer.userId;
}

/** Năm quyền của một người trên ảnh một căn — cùng bảng ca với luật theo dòng của migration 012. */
export type QuyenAnh = { doc_noi_bo: boolean; doc_byte_noi_bo: boolean; them_noi_bo: boolean; them_gui_duoc: boolean; doc_gui_duoc: boolean };
export function quyenAnh(viewer: { userId: string; roles: readonly string[] }, unit: { holderUserId: string | null }): QuyenAnh {
  const noiBo = canSeeUnitInternal(viewer, unit);
  // Ngăn Gửi được: mọi thành viên sàn đọc (sàn khác đã chặn ở cơ sở dữ liệu); thêm, sửa chỉ người thấy nội bộ (Hỏi-4).
  return { doc_noi_bo: noiBo, doc_byte_noi_bo: noiBo, them_noi_bo: noiBo, them_gui_duoc: noiBo, doc_gui_duoc: viewer.roles.length > 0 };
}

/** Ngày chụp từ EXIF DateTimeOriginal của JPEG (`YYYY-MM-DD`), không có hay hỏng thì null. Mã thuần, không thư viện. */
export function docNgayChup(b: Uint8Array): string | null {
  if (loaiTuByteDau(b) !== "image/jpeg") return null;
  let i = 2;
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1]!;
    const len = (b[i + 2]! << 8) | b[i + 3]!;
    if (marker === 0xe1 && len >= 8) return ngayTuExif(b.subarray(i + 4, i + 2 + len));
    if (marker === 0xda) return null;
    i += 2 + len;
  }
  return null;
}

function ngayTuExif(seg: Uint8Array): string | null {
  const ascii = (o: number, n: number) => String.fromCharCode(...seg.subarray(o, o + n));
  if (seg.length < 14 || ascii(0, 6) !== "Exif\0\0") return null;
  const t = 6;
  const le = ascii(t, 2) === "II";
  if (!le && ascii(t, 2) !== "MM") return null;
  const u16 = (o: number) => (le ? seg[t + o]! | (seg[t + o + 1]! << 8) : (seg[t + o]! << 8) | seg[t + o + 1]!);
  const u32 = (o: number) => (le ? u16(o) + u16(o + 2) * 65536 : u16(o) * 65536 + u16(o + 2));
  const inRange = (o: number, n: number) => t + o + n <= seg.length;
  const tim = (ifd: number, tag: number): number | null => {
    if (!inRange(ifd, 2)) return null;
    const n = u16(ifd);
    for (let k = 0; k < n; k++) {
      const e = ifd + 2 + k * 12;
      if (!inRange(e, 12)) return null;
      if (u16(e) === tag) return u32(e + 8);
    }
    return null;
  };
  const exifIfd = tim(u32(4), 0x8769);
  if (exifIfd === null) return null;
  const o = tim(exifIfd, 0x9003);
  if (o === null || !inRange(o, 19)) return null;
  const m = /^(\d{4}):(\d{2}):(\d{2}) /.exec(String.fromCharCode(...seg.subarray(t + o, t + o + 19)));
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
