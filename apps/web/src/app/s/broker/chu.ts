// Chữ của trang nhóm môi giới (hàng 44), theo bảng trạng thái của thiết kế. Link tắt và lỗi tạm dùng đúng câu của trang
// khách (hàng 35) để hai lối hiện của một link nói cùng một lời.
export { LINK_TAT, LOI_TAM } from "../[code]/trang";

export const CHU_MG = {
  dangTai: "Đang tải bộ căn…",
  taiExcel: "Tải Excel",
  taiAnh: "Tải ảnh",
  taiLoi: "Chưa tải được tệp — thử lại",
  cuonNgang: "Kéo ngang để xem đủ cột",
} as const;
