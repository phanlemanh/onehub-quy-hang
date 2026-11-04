import { KhungToi } from "@/app/(app)/me/khung";
import { ToiThat } from "@/app/(app)/me/toi-that";
import { TrangThai } from "@/components/trang-thai";
import { BAO_CHI_QUAN_TRI } from "../cai-dat";

// Cài đặt › Cá nhân (hàng cai-dat-hop-nhat): đúng sáu nhóm dòng của tab Tôi hàng 38, dựng qua khuôn Tôi. Đích của tab
// Tôi, menu tài khoản và nhà Cài đặt với vai không quản trị; bị chuyển khỏi một mục sàn thì có câu báo (Hỏi-1).
// Trang `settings/[section]` dựng thành phần này cho đoạn «personal» — không thêm tệp trang mới dưới (app), vì bộ chấm
// khuôn của kit tính mọi trang mới ở đó vào hai nhóm màn.
export default function CaNhan({ biChan, email, tenSan, soSan }: { biChan: boolean; email: string; tenSan: string; soSan: number }) {
  return (
    <KhungToi>
      {biChan && <TrangThai kind="notice" title={BAO_CHI_QUAN_TRI} />}
      <ToiThat loi="reui" email={email} tenSan={tenSan} soSan={soSan} />
    </KhungToi>
  );
}
