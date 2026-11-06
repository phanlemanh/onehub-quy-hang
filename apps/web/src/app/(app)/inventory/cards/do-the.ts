// Đo chiều cao một dòng của bảng thẻ cho bộ cuộn ảo (va-bang-hang-cuon-so-lon).
//
// Khe điện thoại của Bảng hàng luôn được gắn, kể cả trên máy tính nơi nó bị ẩn bằng CSS. Dòng ẩn đo ra cao 0; bộ cuộn ảo
// coi mọi dòng cao 0 là nằm trong khung nhìn, dựng thêm dòng, đo tiếp ra 0 — với sàn 5.000 căn vòng đo → báo đổi → dựng
// lại vượt giới hạn cập nhật lồng của React (#185) và màn sập. Dòng không có hình chiếu nào (một tổ tiên `display: none`)
// thì trả chiều cao ước lượng, như thể chưa đo — bộ cuộn giữ khung nhìn như lúc đầu và đo thật khi khe hiện ra.

/** Phần tối thiểu của một phần tử mà phép đo cần — để bài kiểm dựng được phần tử giả. */
export interface PhanTuDo {
  getClientRects(): { length: number };
  getBoundingClientRect(): { height: number };
}

/** Chiều cao dùng cho bộ cuộn ảo: chiều cao thật khi dòng đang hiển thị, ước lượng khi dòng (hay khe chứa nó) bị ẩn. */
export function doCaoThe(el: PhanTuDo, uocLuong: number): number {
  if (el.getClientRects().length === 0) return uocLuong;
  return el.getBoundingClientRect().height;
}

/** Chiều cao ước lượng của một dòng: dòng nhóm toà thấp, thẻ căn cao. */
export function uocLuongDong(kind: "nhom" | "can" | undefined): number {
  return kind === "nhom" ? 56 : 128;
}
