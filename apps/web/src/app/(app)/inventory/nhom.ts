/**
 * Nhóm dòng của Bảng hàng — cách của `data-grid-grouping-2` (hàng nhóm gập được, ghi số căn) đặt vào lưới qua dòng con
 * của TanStack. Mặc định Toà → Loại căn (Tham chiếu §9). Số căn của nhóm tính trên dòng đã lọc.
 */
import { CHUA_RO, type DongBang } from "./cot";

export type CachNhom = "toa-loai" | "toa" | "khong";
export const CACH_NHOM: { value: CachNhom; label: string }[] = [
  { value: "toa-loai", label: "Toà → Loại căn" },
  { value: "toa", label: "Toà" },
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

/** Dòng đã lọc và sắp → cây dòng của lưới. Thứ tự sắp giữ nguyên trong từng nhóm. */
export function nhomDong(dong: readonly DongBang[], cach: CachNhom): DongLuoi[] {
  let stt = 0;
  const can = (d: DongBang): DongCan => ({ kind: "can", id: d.id, stt: ++stt, dong: d });
  if (cach === "khong") return dong.map(can);
  return gom(dong, (d) => d.buildingName).map(([toa, trongToa]) => ({
    kind: "nhom",
    id: `nhom:${toa}`,
    label: toa,
    soCan: trongToa.length,
    subRows:
      cach === "toa"
        ? trongToa.map(can)
        : gom(trongToa, (d) => d.unitType).map(([loai, ds]) => ({
            kind: "nhom",
            id: `nhom:${toa}:${loai}`,
            label: loai,
            soCan: ds.length,
            subRows: ds.map(can),
          })),
  }));
}
