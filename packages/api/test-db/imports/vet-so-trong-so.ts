// Phép kiểm «số điện thoại không vào sổ chi phí AI» của bài ô lạ (bất biến 2), đọc dòng `row_to_json(ai_usage)` theo từng trường.
// Trường máy sinh có giá trị ngẫu nhiên hay đồng hồ, chuỗi số ngắn rơi vào đó là tình cờ. Mọi trường khác đều bị quét,
// kể cả cột thêm vào sổ sau này và dữ liệu lồng trong cột. So trên phần chữ số nên khoảng trắng, dấu chấm, gạch nối, đầu +84 đều trúng.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GIO_GHI = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:\d{2})?)$/;
// Ba cột cơ sở dữ liệu tự sinh (câu ghi sổ không truyền). Chỉ được bỏ qua khi đúng dạng.
export const TRUONG_MA: Record<string, RegExp> = { id: UUID, company_id: UUID, created_at: GIO_GHI };

export type VetSo = { truong: string; dang: "day-du" | "mot-phan" };

/** Các mảnh chữ và số trong dữ liệu lồng, kể cả khoá. Ở đây không có tên cột để dựa nên mã máy và giờ ghi nhận theo dạng. */
function manhLong(giaTri: unknown): (string | number)[] {
  if (Array.isArray(giaTri)) return giaTri.flatMap(manhLong);
  if (typeof giaTri === "object" && giaTri !== null) {
    return Object.entries(giaTri).flatMap(([khoa, con]) => [...manhLong(khoa), ...manhLong(con)]);
  }
  if (typeof giaTri === "string" && (UUID.test(giaTri) || GIO_GHI.test(giaTri))) return [];
  return typeof giaTri === "string" || typeof giaTri === "number" ? [giaTri] : [];
}

const chiChuSo = (manh: (string | number)[]) => manh.join(" ").replace(/\D/g, "");

/** Trả trường đầu tiên mang số mẫu, hoặc null khi dòng sạch. `nguoiGhi` là mã người đang đăng nhập. */
export function vetSoTrongSo(dongJson: string, soMau: string, nguoiGhi: string): VetSo | null {
  const chuSo = soMau.replace(/\D/g, "");
  const dai = chuSo.slice(1); // bỏ số 0 đầu: phủ cả 0900…, 84900…, +84 900…
  const ngan = [chuSo.slice(0, 4), chuSo.slice(-3)];
  for (const [truong, giaTri] of Object.entries(JSON.parse(dongJson) as Record<string, unknown>)) {
    if (typeof giaTri === "string" && TRUONG_MA[truong]?.test(giaTri)) continue;
    if (truong === "user_id" && giaTri === nguoiGhi) continue;
    const manh = typeof giaTri === "object" && giaTri !== null ? manhLong(giaTri) : [typeof giaTri === "number" ? giaTri : String(giaTri ?? "")];
    if (chiChuSo(manh).includes(dai)) return { truong, dang: "day-du" };
    // Trường số là số đo (tiền, thời lượng, token): đầu số hay đuôi trùng là chuyện thường, chỉ số đầy đủ mới là rò.
    const chiChu = chiChuSo(manh.filter((m) => typeof m !== "number"));
    if (ngan.some((m) => chiChu.includes(m))) return { truong, dang: "mot-phan" };
  }
  return null;
}
