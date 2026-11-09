import Image from "next/image";

// Dấu hiệu OneHub (hàng logo-onehub): hình sáu lục giác không chữ, tệp chép nguyên từ OneHub CRM, giống nhau ở sáng và tối.
// Để ở /icons/ vì người chưa đăng nhập phải tải được (proxy.ts); mã màu nằm trong tệp ảnh, không vào mã giao diện.
// Ảnh trang trí, chữ thay thế rỗng: chỗ gọi đã có tên sản phẩm hay tên nhà.
const TEP_DAU_HIEU = "/icons/onehub-mark.svg";

export function DauHieuOneHub({ canh }: { canh: number }) {
  return <Image src={TEP_DAU_HIEU} alt="" width={canh} height={canh} className="shrink-0" />;
}
