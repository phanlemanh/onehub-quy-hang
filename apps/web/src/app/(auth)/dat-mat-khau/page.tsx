import { Khung } from "../khung";
import { FormDatMatKhau } from "./form";

// Đặt mật khẩu mới (dang-nhap-mat-khau): người vừa đăng nhập bằng mật khẩu tạm đổi nó thành mật khẩu của mình; chưa có
// phiên tới khi lưu xong. Mã đổi ở bộ nhớ trang (lib/ma-doi.ts), không ở địa chỉ.
export default function DatMatKhau() {
  return (
    <Khung title="Đặt mật khẩu mới">
      <FormDatMatKhau />
    </Khung>
  );
}
