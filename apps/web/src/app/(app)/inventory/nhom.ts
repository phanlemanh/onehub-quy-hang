/**
 * Nhóm dòng của Bảng hàng — cách của `data-grid-grouping-2` (hàng nhóm gập được, ghi số căn) đặt vào lưới qua dòng con
 * của TanStack. Mặc định Toà → Loại căn (Tham chiếu §9). Số căn của nhóm tính trên dòng đã lọc.
 */
import { CHUA_RO, type DongBang } from "./cot";
import { laKhongDung, laLoaiHinhBiet, nhanLoaiHinh } from "./loai-hinh";

export type CachNhom = "toa-loai" | "toa" | "loai-hinh" | "loai-hinh-toa" | "khong";
export const CACH_NHOM: { value: CachNhom; label: string }[] = [
  { value: "toa-loai", label: "Toà → Loại căn" },
  { value: "toa", label: "Toà" },
  // Hàng 79: nhóm theo loại hình; góc nhìn cũ không mang hai giá trị này nên đọc như cũ.
  { value: "loai-hinh", label: "Loại hình" },
  { value: "loai-hinh-toa", label: "Loại hình → Toà" },
  { value: "khong", label: "Không nhóm" },
];
export const NHOM_MAC_DINH: CachNhom = "toa-loai";

export type DongNhom = { kind: "nhom"; id: string; label: string; soCan: number; subRows: DongLuoi[] };
/** `stt` đếm liền qua các nhóm, như cột số dòng của Sheet. */
export type DongCan = { kind: "can"; id: string; stt: number; dong: DongBang };
export type DongLuoi = DongNhom | DongCan;

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

/** «Chưa rõ» luôn đứng cuối; còn lại theo chữ có số (1PN trước 2PN, Toà A trước Toà B). */
function soNhan(a: string, b: string) {
  if (a === CHUA_RO) return b === CHUA_RO ? 0 : 1;
  if (b === CHUA_RO) return -1;
  return collator.compare(a, b);
}

function gom(dong: readonly DongBang[], khoa: (d: DongBang) => string): [string, DongBang[]][] {
  const m = new Map<string, DongBang[]>();
  for (const d of dong) {
    const k = khoa(d) || CHUA_RO;
    const ds = m.get(k);
    if (ds) ds.push(d);
    else m.set(k, [d]);
  }
  return [...m].sort(([a], [b]) => soNhan(a, b));
}

/** Nhãn loại hình của dòng; chưa rõ → «Chưa rõ» (đứng cuối). */
const loaiHinhCua = (d: DongBang) => (laLoaiHinhBiet(d.propertySubType) ? nhanLoaiHinh(d.propertySubType) : CHUA_RO);
/** Cấp Loại căn: dòng không dùng phòng ngủ (đất) đọc nhãn loại hình thay «Chưa rõ» (hàng 79). */
const loaiCanCua = (d: DongBang) => d.unitType || (laKhongDung(d, "unitType") ? loaiHinhCua(d) : "");

/** Dòng đã lọc và sắp → cây dòng của lưới. Thứ tự sắp giữ nguyên trong từng nhóm. */
export function nhomDong(dong: readonly DongBang[], cach: CachNhom): DongLuoi[] {
  let stt = 0;
  const can = (d: DongBang): DongCan => ({ kind: "can", id: d.id, stt: ++stt, dong: d });
  if (cach === "khong") return dong.map(can);
  if (cach === "loai-hinh" || cach === "loai-hinh-toa") {
    return gom(dong, loaiHinhCua).map(([loai, trongLoai]) => ({
      kind: "nhom",
      id: `nhom-lh:${loai}`,
      label: loai,
      soCan: trongLoai.length,
      subRows:
        cach === "loai-hinh"
          ? trongLoai.map(can)
          : gom(trongLoai, (d) => d.buildingName).map(([toa, ds]) => ({ kind: "nhom", id: `nhom-lh:${loai}:${toa}`, label: toa, soCan: ds.length, subRows: ds.map(can) })),
    }));
  }
  return gom(dong, (d) => d.buildingName).map(([toa, trongToa]) => ({
    kind: "nhom",
    id: `nhom:${toa}`,
    label: toa,
    soCan: trongToa.length,
    subRows:
      cach === "toa"
        ? trongToa.map(can)
        : gom(trongToa, loaiCanCua).map(([loai, ds]) => ({
            kind: "nhom",
            id: `nhom:${toa}:${loai}`,
            label: loai,
            soCan: ds.length,
            subRows: ds.map(can),
          })),
  }));
}
