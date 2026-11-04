/**
 * Lớp phủ quyền của hồ sơ căn (hàng 33, Tham chiếu «Quyền là lớp phủ trên cùng một màn»): một màn cho mọi vai, màn đọc
 * bốn cờ ở đây chứ không rẽ theo tên vai. Người thấy nguồn (đầu chủ giữ căn, trưởng nhóm) thấy như trước; người không thấy
 * vắng hẳn ngăn Nội bộ (Hỏi-4: không thẻ, không ổ khoá) và có nút «Hỏi đầu chủ». Căn chưa ai giữ: người có vai Đầu chủ vẫn
 * bấm «Sẵn sàng bán» để nhận căn như trước hàng này.
 */
import { canSeeSource, type Viewer } from "./can-see-source";

export type CoHoSo = { noiBo: boolean; sanSang: boolean; suaAnh: boolean; hoiDauChu: boolean };

export function lopPhuHoSo(viewer: Viewer, listingAgentUserId: string | null): CoHoSo {
  if (canSeeSource(viewer, listingAgentUserId)) return { noiBo: true, sanSang: true, suaAnh: true, hoiDauChu: false };
  const nhanCan = listingAgentUserId === null && viewer.roles.includes("listing_agent");
  return { noiBo: false, sanSang: nhanCan, suaAnh: false, hoiDauChu: true };
}

/**
 * Tin soạn sẵn cho nút «Hỏi đầu chủ» (Hỏi-1: mở bảng chia sẻ của máy, người tự chọn ứng dụng và người nhận — bất biến 3).
 * Chỉ đọc mã căn và toà: hàng truyền vào có mang khoá nguồn cũng không lọt vào tin.
 */
export function tinHoiDauChu(can: { unitNumber: string; buildingName: string }, goc: string): { text: string; url: string } {
  const url = new URL("/inventory", goc);
  url.searchParams.set("unit", can.unitNumber);
  url.searchParams.set("toa", can.buildingName);
  return { text: `Hỏi về căn ${can.unitNumber} · ${can.buildingName}`, url: url.toString() };
}
