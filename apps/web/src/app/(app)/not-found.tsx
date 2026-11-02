import Link from "next/link";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// «Không thấy» cấp tuyến trong vỏ (ADR-0024 §4): bố cục Đọc, lối về Hôm nay.
export default function KhongThay() {
  return (
    <BoCuc
      kieu="doc"
      dauMan={null}
      trangThai="rong"
      rong={
        <TrangThai
          kind="empty"
          timKhongRa
          title="Không thấy trang này"
          description="Địa chỉ không còn, hoặc bạn không có quyền xem."
          hanhDong={
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/today" />}>
              Về Hôm nay
            </Button>
          }
        />
      }
    />
  );
}
