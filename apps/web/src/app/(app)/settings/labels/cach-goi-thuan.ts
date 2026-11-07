// Phần thuần của màn Cách gọi (hàng 45): ô của màn ↔ thân `PUT /api/v1/company/labels`, lỗi từng ô. Kiểm chữ bằng đúng
// hàm lõi máy chủ dùng (`kiemNhanTruong`, `kiemNhanGiaTri`), để màn khoá «Lưu» đúng khi máy chủ sẽ từ chối.
import { kiemNhanGiaTri, kiemNhanTruong, type BoNhan } from "@quy-hang/core/labels";

/** Một dòng tên trường như `GET /api/v1/company/labels` trả. */
export type DongTruong = { field: string; label: string; default: string; custom: boolean };
/** Một dòng giá trị riêng như API trả: `value` là giá trị chuẩn (neo). */
export type DongGiaTri = { field: string; value: string; label: string; default: string; custom: boolean };
export type BoNhanMan = { fields: DongTruong[]; values: DongGiaTri[] };

/** Khoá ô của màn: `f:<trường>` cho tên trường, `v:<trường>:<giá trị chuẩn>` cho giá trị riêng. */
export const oTruong = (field: string) => `f:${field}`;
export const oGiaTri = (field: string, value: string) => `v:${field}:${value}`;

/** Chữ ban đầu của các ô: tên riêng đã lưu; chưa đặt thì rỗng (chữ mặc định hiện làm gợi ý). */
export function oBanDau(bo: BoNhanMan): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of bo.fields) o[oTruong(f.field)] = f.custom ? f.label : "";
  for (const v of bo.values) o[oGiaTri(v.field, v.value)] = v.custom ? v.label : "";
  return o;
}

/** Lỗi của một ô; ô rỗng hay chỉ khoảng trắng = dùng mặc định, không lỗi. */
export function loiCuaO(khoa: string, chu: string): string | null {
  if (chu.trim() === "") return null;
  const [loai, field, value] = khoa.split(":");
  const kq = loai === "f" ? kiemNhanTruong(field, chu) : kiemNhanGiaTri(field, value, chu);
  if (kq.ok) return null;
  // Câu lỗi lõi mở đầu bằng khoá máy — màn chỉ hiện phần sau dấu hai chấm.
  return kq.loi.slice(kq.loi.indexOf(":") + 1).trim().replace(/^./, (c) => c.toUpperCase());
}

/** Thân lưu: chỉ ô có chữ khác tên mặc định; ô rỗng hay gõ đúng tên mặc định không gửi — trường ấy về mặc định. */
export function thanLuu(bo: BoNhanMan, o: Readonly<Record<string, string>>): BoNhan {
  return {
    fields: bo.fields.flatMap((f) => {
      const chu = (o[oTruong(f.field)] ?? "").trim();
      return chu && chu !== f.default ? [{ field: f.field, label: chu }] : [];
    }),
    values: bo.values.flatMap((v) => {
      const chu = (o[oGiaTri(v.field, v.value)] ?? "").trim();
      return chu && chu !== v.default ? [{ field: v.field, value: v.value, label: chu }] : [];
    }),
  };
}

/** Nút «Trả về mặc định» của một ô: ô về rỗng (không phải về chữ mặc định) — lượt Lưu kế bỏ trường ấy khỏi thân. */
export const traVeMacDinh = (o: Readonly<Record<string, string>>, khoa: string): Record<string, string> => ({ ...o, [khoa]: "" });

/** Lưu được khi không ô nào lỗi. */
export const coTheLuu = (o: Readonly<Record<string, string>>) => Object.entries(o).every(([k, chu]) => loiCuaO(k, chu) === null);

/** Tên nhóm giá trị trên màn: nhãn mặc định của trường chứa nó. */
export function tenTruong(bo: BoNhanMan, field: string): string {
  return bo.fields.find((f) => f.field === field)?.default ?? field;
}
