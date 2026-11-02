// Mở đúng lead từ thông báo (hàng 26, AC-6): `/today?lead=<id>` — Hôm nay mở nhóm chứa lead, chọn dòng `lead:<id>`, cuộn
// tới; lead không còn trong danh sách của người ấy (đã chuyển, đã trả) thì báo một dòng. Mô-đun thuần, không đọc DOM.

/** Mã lead là uuid — tham số sai khuôn bị bỏ qua, không thành chuỗi chọn dòng. */
const MA_LEAD = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const KHONG_CON_LEAD = "Lead này không còn ở Hôm nay của bạn";

/** Mã lead từ chuỗi tham số của URL; vắng, rỗng hay sai khuôn → null. */
export function docLeadThamSo(qs: string | URLSearchParams): string | null {
  const v = (typeof qs === "string" ? new URLSearchParams(qs) : qs).get("lead")?.trim();
  return v && MA_LEAD.test(v) ? v.toLowerCase() : null;
}

type NhomViec = { nhom: { code: string }; viec: readonly { id: string }[] };

/** Nhóm và dòng của lead trong hàng đợi đang hiện; không có → chữ «không còn». */
export function timLead(ds: readonly NhomViec[], leadId: string): { nhom: string; dong: string } | { khongCon: string } {
  const dong = `lead:${leadId}`;
  const g = ds.find((x) => x.viec.some((v) => v.id === dong));
  return g ? { nhom: g.nhom.code, dong } : { khongCon: KHONG_CON_LEAD };
}

/** Trạng thái gập của lưới sau khi mở nhóm của lead: «mở hết» giữ nguyên, nhóm đang gập thì mở. */
export function moNhom(expanded: true | Record<string, boolean>, nhom: string): true | Record<string, boolean> {
  return expanded === true ? true : { ...expanded, [`nhom:${nhom}`]: true };
}
