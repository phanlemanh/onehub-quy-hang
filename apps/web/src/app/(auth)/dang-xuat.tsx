"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CHUA_DANG_XUAT, dangXuatTrenMay } from "@/components/shell/dang-xuat-tren-may";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { thanDangXuat } from "@/lib/push/dang-ky";
import { xoaKhoCuaNguoi } from "@/lib/sync/kho-indexeddb";

// Đăng xuất ở màn chọn sàn và màn chưa có sàn: ngoài vỏ nên không có bộ đồng bộ, vẫn xoá kho trên máy của người này
// (luật 32). Máy chủ lỗi hay mất mạng thì ở lại và báo kèm «Thử lại» (luật 55).
export function DangXuat({ userId }: { userId: string }) {
  const router = useRouter();
  const [loi, setLoi] = useState(false);
  const chay = async () => {
    const kq = await dangXuatTrenMay({
      dangXuat: async () => (await xoaKhoCuaNguoi(userId), true),
      daXoa: loi,
      than: thanDangXuat,
      goi: fetch,
      ve: () => {
        router.replace("/login");
        router.refresh();
      },
    });
    setLoi(kq === "loi");
  };
  if (loi) {
    return (
      <TrangThai
        kind="error"
        title={CHUA_DANG_XUAT}
        hanhDong={
          <Button size="sm" variant="outline" onClick={() => void chay()}>
            Thử lại
          </Button>
        }
      />
    );
  }
  return (
    <Button variant="outline" onClick={() => void chay()}>
      Đăng xuất
    </Button>
  );
}
