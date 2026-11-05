// Mã đổi của lần đăng nhập bằng mật khẩu tạm (dang-nhap-mat-khau): chỉ sống trong bộ nhớ của trang — không vào địa chỉ,
// lịch sử hay kho trình duyệt. Tải lại trang là mất; người đăng nhập lại bằng mật khẩu tạm để lấy mã mới.
let ma: string | null = null;

export const datMaDoi = (m: string) => void (ma = m);
export const layMaDoi = (): string | null => ma;
export const xoaMaDoi = () => void (ma = null);
