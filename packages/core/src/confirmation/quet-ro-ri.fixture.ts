/**
 * Phép quét rò rỉ của sự kiện xác nhận — chỉ dùng trong bài kiểm. Nhận ba hàm dựng làm tham số, nên cùng một hàm chạy
 * trên mã thật và trên bản sao bị cấy lỗi: thước đỏ được trên chính đường dựng (Ngoài-7 của hàng 95).
 */
import type { CatalogData } from "../catalog/types";
import { timRoRi, type GiaTriMoi } from "../redaction/kiem-ro-ri";
import { LOP_TRUONG, type KhoaCanNoiBo } from "../redaction/lop-truong";
import { canMoi } from "../redaction/moi";
import type { KetQua, NguCanh } from "./dung";
import type { LoaiSuKien } from "./khuon";
import { danhMucMau, dauBaoSai, dauKhungToa, dauThuocTinhCan, nguCanhMau } from "./nen-thu.fixture";

/** Khoá ngoài lớp danh mục có giá trị đủ nhận ra trong căn mồi — ghim trước, thêm trường mới thì ca đỏ. */
export const KHOA_MOI: readonly KhoaCanNoiBo[] = [
  "standardStatus",
  "listPrice",
  "feeInclusion",
  "furnished",
  "legalStatus",
  "financing",
  "occupantType",
  "lastConfirmedAt",
  "companyName",
  "senderName",
  "photos",
  "closePrice",
  "closeDate",
  "withdrawnReason",
  "holderUserId",
  "holderName",
  "customFields",
  "ownerName",
  "ownerPhone",
  "floorPrice",
  "titleDeedPhoto",
  "contacts",
];

/** Mồi của mọi khoá căn mồi có lớp khác danh mục — chuỗi ≥ 4 ký tự, số ≥ 1.000.000, số điện thoại (như `giaTriMoi`). */
export function moiNgoaiDanhMuc(): GiaTriMoi[] {
  const can = canMoi();
  const ra: GiaTriMoi[] = [];
  const them = (truong: string, v: unknown) => {
    if (typeof v === "string" && v.length >= 4) ra.push({ truong, giaTri: v, kieu: "chu" });
    else if (typeof v === "number" && v >= 1_000_000) ra.push({ truong, giaTri: v, kieu: "so_tien" });
  };
  for (const k of Object.keys(LOP_TRUONG) as KhoaCanNoiBo[]) {
    if (LOP_TRUONG[k] === "catalog") continue;
    if (k === "ownerPhone") ra.push({ truong: k, giaTri: can.ownerPhone ?? "", kieu: "so_dien_thoai" });
    else if (k === "contacts")
      can.contacts.forEach((lh, i) => {
        them(`contacts[${i}].fullName`, lh.fullName);
        lh.phones.forEach((so, j) => ra.push({ truong: `contacts[${i}].phones[${j}]`, giaTri: so, kieu: "so_dien_thoai" }));
      });
    else if (k === "customFields") for (const [ten, v] of Object.entries(can.customFields)) them(`customFields.${ten}`, v);
    else if (k === "photos") for (const p of can.photos) them(`photos[${p.id}]`, p.id);
    else them(k, can[k]);
  }
  return ra;
}

type Dung = (dau: never, nc: NguCanh) => KetQua<unknown>;
export type BaHam = { dungKhungToa: Dung; dungThuocTinhCan: Dung; dungBaoSai: Dung };
export type PhatHien = { duong: "danh-muc" | "dau-vao"; loai: LoaiSuKien; truong: string };

/** Danh mục mẫu mang thêm mọi khoá mồi trên từng toà và từng căn. */
function danhMucCoMoi(): CatalogData {
  const can = canMoi();
  const moi = Object.fromEntries(KHOA_MOI.map((k) => [k, can[k]]));
  const dm = danhMucMau();
  for (const s of dm.subdivisions) {
    for (const b of s.buildings) {
      Object.assign(b, moi);
      for (const u of b.units) Object.assign(u, moi);
    }
  }
  return dm;
}

/** Danh sách rò của ba hàm dựng trên hai đường mồi; rỗng là sạch. */
export function quetRoRi(h: BaHam): PhatHien[] {
  const baLoai: readonly [LoaiSuKien, Dung, () => unknown][] = [
    ["building_frame", h.dungKhungToa, dauKhungToa],
    ["unit_attributes", h.dungThuocTinhCan, dauThuocTinhCan],
    ["correction", h.dungBaoSai, dauBaoSai],
  ];
  const ra: PhatHien[] = [];
  const moi = moiNgoaiDanhMuc();
  const coMoi = nguCanhMau({ danhMuc: danhMucCoMoi() });
  const can = canMoi();
  for (const [loai, dung, dau] of baLoai) {
    const kq = dung(dau() as never, coMoi);
    if (!kq.ok) ra.push({ duong: "danh-muc", loai, truong: "(không dựng được)" });
    else for (const r of timRoRi(JSON.stringify(kq.suKien), moi)) ra.push({ duong: "danh-muc", loai, truong: r.truong });
    for (const k of KHOA_MOI) {
      const vao = dung({ ...(dau() as object), [k]: can[k] } as never, nguCanhMau());
      if (vao.ok || !vao.loi.some((l) => l.truong === k)) ra.push({ duong: "dau-vao", loai, truong: k });
    }
  }
  return ra;
}

export type PhepCay = { ten: string; thay: readonly (readonly [neo: string, moi: string])[]; mongDoi: PhatHien };

/** Áp phép cấy lên mã nguồn; neo không còn thì ném, để phép cấy không lặng lẽ thành vô tác dụng. */
export function cay(nguon: string, phep: Pick<PhepCay, "ten" | "thay">): string {
  let ra = nguon;
  for (const [neo, moi] of phep.thay) {
    if (!ra.includes(neo)) throw new Error(`neo mất: ${phep.ten} — ${neo}`);
    ra = ra.replace(neo, moi);
  }
  return ra;
}

const TAT_LOC_KHOA_LA = ["const la = Object.keys(dau).filter((k) => !khai.includes(k));", "const la: string[] = []; void khai;"] as const;
const BO_LOC_XUAT = (loai: string, kieu: string) => [`thuTu("${loai}", suKien) as ${kieu}`, `suKien as unknown as ${kieu}`] as const;
const TRAI = (nguon: string, loai: string) => [`const suKien = { ...vo, eventType: "${loai}",`, `const suKien = { ...${nguon}, ...vo, eventType: "${loai}",`] as const;

/** Bảy lỗi rò viết trước: ba hàm dựng × hai đường, và một lần gán giá trị nội bộ vào trường của biểu mẫu. */
export const CAY: readonly PhepCay[] = [
  {
    ten: "khung toà: trải toà của danh mục",
    thay: [["const { loi, vo } = kiemChung(\"building_frame\", dau, nc);", "const { loi, vo, toa } = kiemChung(\"building_frame\", dau, nc);"], TRAI("toa", "building_frame"), BO_LOC_XUAT("building_frame", "KhungToa")],
    mongDoi: { duong: "danh-muc", loai: "building_frame", truong: "floorPrice" },
  },
  {
    ten: "thuộc tính căn: trải toà của danh mục",
    thay: [TRAI("toa", "unit_attributes"), BO_LOC_XUAT("unit_attributes", "ThuocTinhCan")],
    mongDoi: { duong: "danh-muc", loai: "unit_attributes", truong: "floorPrice" },
  },
  {
    ten: "báo sai: trải căn của danh mục",
    thay: [TRAI("can", "correction"), BO_LOC_XUAT("correction", "BaoSai")],
    mongDoi: { duong: "danh-muc", loai: "correction", truong: "floorPrice" },
  },
  {
    ten: "khung toà: trải đầu vào, tắt từ chối khoá lạ",
    thay: [TAT_LOC_KHOA_LA, TRAI("dau", "building_frame"), BO_LOC_XUAT("building_frame", "KhungToa")],
    mongDoi: { duong: "dau-vao", loai: "building_frame", truong: "floorPrice" },
  },
  {
    ten: "thuộc tính căn: trải đầu vào, tắt từ chối khoá lạ",
    thay: [TAT_LOC_KHOA_LA, TRAI("dau", "unit_attributes"), BO_LOC_XUAT("unit_attributes", "ThuocTinhCan")],
    mongDoi: { duong: "dau-vao", loai: "unit_attributes", truong: "floorPrice" },
  },
  {
    ten: "báo sai: trải đầu vào, tắt từ chối khoá lạ",
    thay: [TAT_LOC_KHOA_LA, TRAI("dau", "correction"), BO_LOC_XUAT("correction", "BaoSai")],
    mongDoi: { duong: "dau-vao", loai: "correction", truong: "floorPrice" },
  },
  {
    ten: "thuộc tính căn: gán ownerPhone của căn vào unitNumber",
    thay: [["upi: dau.upi, unitNumber, ...gt };", "upi: dau.upi, unitNumber: (toa?.units[0] as { ownerPhone?: string } | undefined)?.ownerPhone ?? unitNumber, ...gt };"]],
    mongDoi: { duong: "danh-muc", loai: "unit_attributes", truong: "ownerPhone" },
  },
];
