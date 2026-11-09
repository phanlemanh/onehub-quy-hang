// Phần thuần của màn Cách gọi (hàng 45): ô của màn ↔ thân `PUT /api/v1/company/labels`, lỗi từng ô. Kiểm chữ bằng đúng
// hàm lõi máy chủ dùng (`kiemNhanTruong`, `kiemNhanGiaTri`), để màn khoá «Lưu» đúng khi máy chủ sẽ từ chối.
import { cauTrungTen, kiemNhanGiaTri, kiemNhanTruong, laTruongDong, trungTenGiaTri, type BoNhan } from "@quy-hang/core/labels";

/** Một dòng tên trường như `GET /api/v1/company/labels` trả. */
export type DongTruong = { field: string; label: string; default: string; custom: boolean };
/** Một dòng giá trị riêng như API trả: `value` là giá trị chuẩn (neo). */
export type DongGiaTri = { field: string; value: string; label: string; default: string; custom: boolean };
export type BoNhanMan = { fields: DongTruong[]; values: DongGiaTri[] };

/** Khoá ô của màn: `f:<trường>` cho tên trường, `v:<trường>:<giá trị chuẩn>` cho giá trị riêng. */
export const oTruong = (field: string) => `f:${field}`;
export const oGiaTri = (field: string, value: string) => `v:${field}:${value}`;
/** Thuộc tính `id` của ô: giá trị RESO có thể mang dấu cách («Single Family Residence»), `id` thì không. */
export const idO = (khoa: string) => khoa.replace(/\s+/g, "_");

/** Chữ ban đầu của các ô: tên riêng đã lưu; chưa đặt thì rỗng (chữ mặc định hiện làm gợi ý). */
export function oBanDau(bo: BoNhanMan): Record<string, string> {
  const o: Record<string, string> = {};
  for (const f of bo.fields) o[oTruong(f.field)] = f.custom ? f.label : "";
  for (const v of bo.values) o[oGiaTri(v.field, v.value)] = v.custom ? v.label : "";
  return o;
}

/**
 * Lỗi của một ô; ô rỗng hay chỉ khoảng trắng = dùng mặc định, không lỗi. Ô giá trị còn so trùng tên với các ô cùng tập
 * bằng đúng hàm lõi máy chủ dùng (`trungTenGiaTri`) — tính cả lúc mở màn từ tên đã lưu.
 */
export function loiCuaO(bo: BoNhanMan, o: Readonly<Record<string, string>>, khoa: string): string | null {
  const chu = o[khoa] ?? "";
  if (chu.trim() === "") return null;
  const [loai, field, value] = khoa.split(":");
  const kq = loai === "f" ? kiemNhanTruong(field, chu) : kiemNhanGiaTri(field, value, chu);
  // Câu lỗi lõi mở đầu bằng khoá máy — màn chỉ hiện phần sau dấu hai chấm.
  if (!kq.ok) return kq.loi.slice(kq.loi.indexOf(":") + 1).trim().replace(/^./, (c) => c.toUpperCase());
  if (loai !== "v" || !laTruongDong(field)) return null;
  const tenRieng: Record<string, string> = {};
  for (const v of bo.values) if (v.field === field) tenRieng[v.value] = (o[oGiaTri(field, v.value)] ?? "").trim();
  const anhEm = trungTenGiaTri(field, tenRieng)[value!];
  return anhEm ? cauTrungTen(field, anhEm) : null;
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
export const coTheLuu = (bo: BoNhanMan, o: Readonly<Record<string, string>>) => Object.keys(o).every((k) => loiCuaO(bo, o, k) === null);

/** Tên nhóm giá trị trên màn: nhãn mặc định của trường chứa nó. */
export function tenTruong(bo: BoNhanMan, field: string): string {
  return bo.fields.find((f) => f.field === field)?.default ?? field;
}
