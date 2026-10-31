/**
 * Trường của hồ sơ chủ nhà (Tham chiếu §6 «lớp trường», bất biến 2). Ba trường thuộc lớp `source` — trần
 * `never_leaves_company`. Ảnh sổ, trường nguồn thứ tư, chờ kho ảnh.
 */
import { CEILING, type DataClass } from "../data-classes";
import { SOURCE_KEYS } from "../listing";

export const OWNER_FIELDS = {
  ownerName: "source",
  ownerPhone: "source",
  floorPrice: "source",
} as const satisfies Readonly<Record<string, DataClass>>;

export type OwnerField = keyof typeof OWNER_FIELDS;

/** Lỗi của một bảng trường nguồn: mỗi trường phải lớp `source`, trần không rời công ty, nằm trong khoá nguồn của lõi hàng. */
export function checkOwnerFields(fields: Readonly<Record<string, DataClass>>): string[] {
  const loi: string[] = [];
  for (const [k, lop] of Object.entries(fields)) {
    if (lop !== "source") loi.push(`${k}: lớp ${lop}, cần source`);
    if (CEILING[lop] !== "never_leaves_company") loi.push(`${k}: trần ${CEILING[lop]}, cần never_leaves_company`);
    if (!(SOURCE_KEYS as readonly string[]).includes(k)) loi.push(`${k}: không có trong khoá nguồn của lõi hàng`);
  }
  return loi;
}
