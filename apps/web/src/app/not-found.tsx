import Link from "next/link";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// «Không thấy» ngoài vỏ: bố cục Đọc trên nền trống (ADR-0024 §4).
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
          description="Địa chỉ không còn, hoặc đã gõ sai."
          hanhDong={
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/" />}>
              Về trang đầu
            </Button>
          }
        />
      }
    />
  );
}
