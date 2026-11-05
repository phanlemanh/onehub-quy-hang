// Bảng trích danh mục đơn vị hành chính cho bộ mẫu thấp tầng (hàng 73): một tỉnh, bốn phường mới, mười phường cũ của
// Quận 1 cũ kèm phường mới nhận chúng (địa giới hai cấp từ 1/7/2025). Dữ liệu công, không phải địa chỉ của ai. Danh mục
// đầy đủ (34 tỉnh, 3.321 xã, mã đơn vị) là việc của hàng 75; hàng ấy đối chiếu bảng này với danh mục của nó.

export const DON_VI_HANH_CHINH = {
  nguon:
    "Nghị quyết 1685/NQ-UBTVQH15 ngày 16/6/2025 của Ủy ban Thường vụ Quốc hội về sắp xếp đơn vị hành chính cấp xã của " +
    "Thành phố Hồ Chí Minh — đọc qua trang Wikipedia tiếng Việt «Quận 1», chưa đọc văn bản gốc",
  ngay: "2026-11-05",
  tinh: [
    {
      ten: "Thành phố Hồ Chí Minh",
      phuongMoi: ["Sài Gòn", "Tân Định", "Bến Thành", "Cầu Ông Lãnh"],
      // `vao`: các phường mới nhận phường cũ (toàn bộ hay một phần). Hai phường mới trở lên = phường cũ bị tách.
      phuongCu: [
        { ten: "Bến Nghé", quan: "Quận 1", vao: ["Sài Gòn"] },
        { ten: "Đa Kao", quan: "Quận 1", vao: ["Sài Gòn", "Tân Định"] },
        { ten: "Nguyễn Thái Bình", quan: "Quận 1", vao: ["Bến Thành", "Sài Gòn"] },
        { ten: "Tân Định", quan: "Quận 1", vao: ["Tân Định"] },
        { ten: "Bến Thành", quan: "Quận 1", vao: ["Bến Thành"] },
        { ten: "Phạm Ngũ Lão", quan: "Quận 1", vao: ["Bến Thành"] },
        { ten: "Cầu Ông Lãnh", quan: "Quận 1", vao: ["Bến Thành", "Cầu Ông Lãnh"] },
        { ten: "Cầu Kho", quan: "Quận 1", vao: ["Cầu Ông Lãnh"] },
        { ten: "Cô Giang", quan: "Quận 1", vao: ["Cầu Ông Lãnh"] },
        { ten: "Nguyễn Cư Trinh", quan: "Quận 1", vao: ["Cầu Ông Lãnh"] },
      ],
    },
  ],
};

/** Bỏ dấu tiếng Việt (đ → d), giữ hoa thường. */
export const boDau = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
