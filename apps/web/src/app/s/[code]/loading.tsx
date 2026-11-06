// Đang tải trang khách hay trang nhóm môi giới (hàng 44, ST-moigioi-loading): trang đọc sống, không lưu đệm.
import { TrangThai } from "@/components/trang-thai";
import { CHU_MG } from "../broker/chu";
import { KhungTrangKhach } from "./khung";

export default function Loading() {
  return (
    <KhungTrangKhach>
      <TrangThai kind="loading" title={CHU_MG.dangTai} />
    </KhungTrangKhach>
  );
}
