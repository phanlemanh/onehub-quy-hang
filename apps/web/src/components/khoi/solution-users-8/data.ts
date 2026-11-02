// Phần của chuyển thể solution-users-8: dữ liệu Người dùng do API trả (`/api/v1/company/members`, `/company/zones`) thay dữ
// liệu demo của khối. Một người mang nhiều vai và nhiều vùng; không có ghế, khách hay lời mời chờ.
export type Vung = { id: string; name: string };
export type ThanhVien = { userId: string; email: string; roles: string[]; zones: Vung[] };

/** Vai quản trị — sàn phải còn ít nhất một người mang vai này (API trả lastAdmin khi bỏ người cuối). */
export const VAI_QUAN_TRI = "company_admin";

/** Hai chữ đầu của phần trước @ — Quỹ hàng không giữ tên hay ảnh của người dùng. */
export const initialsOf = (email: string) => {
  const ten = email.split("@")[0] ?? "";
  const phan = ten.split(/[._-]+/).filter(Boolean);
  const chu = phan.length > 1 ? `${phan[0]?.[0] ?? ""}${phan[1]?.[0] ?? ""}` : ten.slice(0, 2);
  return chu.toUpperCase() || "?";
};

export const khop = (query: string, ...fields: string[]) => fields.some((field) => field.toLowerCase().includes(query));
