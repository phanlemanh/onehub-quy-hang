// Phần thuần của mục chia lead trong Cài đặt sàn (hàng 48): sáu điểm của sổ, câu hiệu lực, kiểm ô trước khi lưu, gắn lý do
// máy chủ về đúng dòng, ba trạng thái đặc biệt, chữ nguồn của dòng. Màn chỉ dựng những gì các hàm này trả — bài kiểm gọi
// thẳng chúng. Luật giá trị là `kiemGiaTri` của lõi, cùng luật máy chủ dùng (hàng 82); không chép khoảng hay mặc định.
import { kiemGiaTri, SO_DIEM, timDiem, type DiemSo } from "@quy-hang/core/config";

/** Sáu điểm giá trị đơn mà sổ giao cho màn này, theo thứ tự dòng. */
export const KHOA_MAN = [
  "lead_routing.strategy",
  "lead_routing.accept_minutes",
  "lead_routing.first_call_minutes",
  "lead_routing.alert_to",
  "queue.call_back_after_days",
  "queue.price_negotiation_after_days",
] as const;
export type KhoaMan = (typeof KHOA_MAN)[number];

/** Hai đoạn trong cùng một khung. */
export const DOAN: readonly { tieuDe: string; khoa: readonly KhoaMan[] }[] = [
  { tieuDe: "Chia lead", khoa: KHOA_MAN.slice(0, 4) },
  { tieuDe: "Hàng đợi Hôm nay", khoa: KHOA_MAN.slice(4) },
];

/** Hai ngưỡng hàng đợi — khoá khi sàn có bộ nhóm Hôm nay riêng. */
export const KHOA_NGUONG: readonly KhoaMan[] = ["queue.call_back_after_days", "queue.price_negotiation_after_days"];

export type DongCauHinh = { key: string; value: unknown; source: "default" | "company"; updatedBy: string | null; updatedAt: string | null };
export type BanCauHinh = { items: DongCauHinh[]; errors: string[] };
export type BoNhomDangAp = { source: "default" | "company" };
export type GiaTriMan = Record<KhoaMan, unknown>;

export const laKhoaMan = (k: string): k is KhoaMan => (KHOA_MAN as readonly string[]).includes(k);

/** Dòng sổ của một khoá màn — có chắc vì sổ là nguồn của danh sách. */
export function diemMan(khoa: KhoaMan, so: readonly DiemSo[] = SO_DIEM): DiemSo {
  const d = timDiem(khoa, so);
  if (!d) throw new Error(`${khoa}: không có trong sổ điểm biến thiên`);
  return d;
}

/** Câu «áp cho ai» của một dòng — đọc từ `hieuLuc` của sổ, không viết riêng theo khoá. */
export function cauHieuLuc(d: DiemSo): string {
  switch (d.hieuLuc) {
    case "moi":
      return `Áp cho lead mới — lead đã chia giữ ${d.kieu.loai === "enum" ? "cách cũ" : "hạn cũ"}`;
    case "tinh_lai":
      return d.khoa.startsWith("queue.") ? "Áp ngay cho Hôm nay của mọi đầu chủ" : "Áp ngay";
    case "lan_sau":
      return "Áp từ lần sau";
  }
}

/** Giá trị đang áp của sáu điểm từ phản hồi của lối chung; khoá vắng lấy mặc định của sổ. */
export function giaTriTu(ban: BanCauHinh): GiaTriMan {
  return Object.fromEntries(KHOA_MAN.map((k) => [k, ban.items.find((x) => x.key === k)?.value ?? diemMan(k).macDinh])) as GiaTriMan;
}

/** Khoá màn mà một chuỗi lỗi nói tới — lỗi của lõi luôn mở đầu bằng khoá («<khoá>: …» hay «<khoá> không nhỏ hơn …»). */
export function ganLyDo(lyDo: string): KhoaMan | null {
  return KHOA_MAN.find((k) => lyDo.startsWith(`${k}:`) || lyDo.startsWith(`${k} `)) ?? null;
}

/** Câu cho người của một lỗi gắn vào dòng `khoa`. */
export function loiChoNguoi(khoa: KhoaMan, lyDo: string, giaTri: GiaTriMan): string {
  const d = diemMan(khoa);
  if (d.khongNhoHon && lyDo.includes(" không nhỏ hơn ") && laKhoaMan(d.khongNhoHon)) {
    const goc = diemMan(d.khongNhoHon);
    const donVi = goc.kieu.loai === "int" ? ` ${goc.kieu.donVi}` : "";
    return `Không nhỏ hơn ${goc.ten.toLocaleLowerCase("vi")} (${String(giaTri[d.khongNhoHon])}${donVi})`;
  }
  if (d.kieu.loai === "int") return `Số nguyên từ ${d.kieu.min} tới ${d.kieu.max} ${d.kieu.donVi}`;
  return "Chọn một trong danh sách";
}

export type KetQuaKiemBan = {
  /** Khoá có giá trị khác giá trị đang áp. */
  doi: KhoaMan[];
  /** Lỗi theo dòng. */
  loi: Partial<Record<KhoaMan, string>>;
  /** Thân PATCH: chỉ khoá đã đổi. */
  than: Partial<GiaTriMan>;
  guiDuoc: boolean;
};

/** Kiểm các ô trước khi lưu bằng `kiemGiaTri` của lõi, trên cấu hình đang áp ghép giá trị vừa gõ. */
export function kiemBan(dangAp: GiaTriMan, nhap: GiaTriMan): KetQuaKiemBan {
  const doi = KHOA_MAN.filter((k) => JSON.stringify(nhap[k]) !== JSON.stringify(dangAp[k]));
  const sau: Record<string, unknown> = { ...dangAp, ...nhap };
  const loi: Partial<Record<KhoaMan, string>> = {};
  for (const k of doi) {
    const kq = kiemGiaTri(k, nhap[k], sau);
    if (kq.ok) continue;
    const dong = ganLyDo(kq.loi) ?? k;
    loi[dong] ??= loiChoNguoi(dong, kq.loi, nhap);
  }
  const than = Object.fromEntries(doi.map((k) => [k, nhap[k]])) as Partial<GiaTriMan>;
  return { doi, loi, than, guiDuoc: doi.length > 0 && Object.keys(loi).length === 0 };
}

/** Câu báo sau khi lưu: có điểm hiệu lực «mới» thì nói lead mới, chỉ điểm áp ngay thì «Đã lưu». */
export function thongBaoLuu(doi: readonly KhoaMan[]): string {
  return doi.some((k) => diemMan(k).hieuLuc === "moi") ? "Đã lưu · áp cho lead mới từ bây giờ" : "Đã lưu";
}

export const BAO_BO_NHOM_RIENG = "Sàn đang dùng bộ nhóm Hôm nay riêng — ngưỡng đặt trong bộ ấy";

export type TrangThaiMan =
  | { kind: "loi-tai" }
  | { kind: "san-sang"; khoaKhoa: KhoaMan[]; baoBoNhom: string | null; baoDongHong: string | null };

/** Ba trạng thái đặc biệt: tải hỏng, sàn có bộ nhóm riêng (ngưỡng không áp), dòng của sàn hỏng đang chạy mặc định. */
export function trangThaiMan(cauHinh: BanCauHinh | null, boNhom: BoNhomDangAp | null): TrangThaiMan {
  if (!cauHinh) return { kind: "loi-tai" };
  const rieng = boNhom?.source === "company";
  const hong = KHOA_MAN.filter((k) => cauHinh.errors.some((e) => e.includes(k)));
  return {
    kind: "san-sang",
    khoaKhoa: rieng ? [...KHOA_NGUONG] : [],
    baoBoNhom: rieng ? BAO_BO_NHOM_RIENG : null,
    baoDongHong: hong.length
      ? `${hong.map((k) => diemMan(k).ten).join(", ")} đang chạy theo mặc định — giá trị đã lưu của sàn không hợp lệ. Lưu giá trị đúng để áp.`
      : null,
  };
}

const NGAY = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
const ddmm = (d: Date) => {
  const p = Object.fromEntries(NGAY.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}`;
};
export const DA_ROI_SAN = "Đã rời sàn";

/** Chữ nguồn của một dòng: «Mặc định», hay «Đã đổi · [Tên] · dd/mm» (người đổi lần cuối). */
export function chuNguon(dong: DongCauHinh | undefined, tenNguoi: ReadonlyMap<string, string> | null): string {
  if (!dong || dong.source !== "company") return "Mặc định";
  const ten = dong.updatedBy ? (tenNguoi?.get(dong.updatedBy)?.trim() || (tenNguoi ? DA_ROI_SAN : null)) : null;
  const ngay = dong.updatedAt ? ddmm(new Date(dong.updatedAt)) : null;
  return ["Đã đổi", ten, ngay].filter(Boolean).join(" · ");
}

/** Quét mã nguồn màn tìm chữ trái từ vựng (`CONTEXT.md`, cột «Không dùng»). */
export const CHU_CAM: readonly RegExp[] = [/Cảnh báo/, /Luật chia/];
export function quetChuCam(tep: string, noiDung: string): { tep: string; chu: string }[] {
  return CHU_CAM.flatMap((re) => {
    const m = noiDung.match(re);
    return m ? [{ tep, chu: m[0] }] : [];
  });
}
