"use client";

// Máy bị báo mất (hàng 38, AC-7): vỏ chuyển tới đây kèm mã người bị báo; xoá kho của người ấy trên máy (kể cả thay đổi
// chưa gửi) và huỷ đăng ký thông báo, rồi báo một dòng. Hàng 93 làm lại màn đăng nhập phải giữ khối này (luật 42).
// Xoá hỏng thì báo «chưa xoá được» và cho thử lại, không báo đã xoá (hàng 93, nguồn Ngoài-1 của tab-toi, hàng 43).
import { useCallback, useEffect, useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { xoaMayBiBao } from "@/lib/sync/may-bi-bao";

// Tiêu đề của khối báo (ReUI Alert) chỉ một dòng: câu của AC-7 tách thành tiêu đề và lời mô tả để không bị cắt trên điện thoại.
export const LOI_BI_BAO = { title: "Máy này đã bị báo mất", description: "Dữ liệu Quỹ hàng trên máy đã xoá" } as const;
export const LOI_CHUA_XOA = { title: "Máy này đã bị báo mất", description: "Chưa xoá được dữ liệu Quỹ hàng trên máy — thử lại" } as const;

export type KetQuaXoa = "xong" | "loi";

/** Một lần xoá: lỗi của kho trên máy thành «loi», không nuốt thành «xong». */
export async function chayXoa(userId: string, xoa: (userId: string) => Promise<void> = xoaMayBiBao): Promise<KetQuaXoa> {
  try {
    await xoa(userId);
    return "xong";
  } catch {
    return "loi";
  }
}

export function KhoiMayBiBao({ userId }: { userId: string }) {
  const [ketQua, setKetQua] = useState<KetQuaXoa | null>(null);
  const [lan, setLan] = useState(0);
  const thuLai = useCallback(() => {
    setKetQua(null);
    setLan((n) => n + 1);
  }, []);
  useEffect(() => {
    let huy = false;
    void chayXoa(userId).then((kq) => {
      if (!huy) setKetQua(kq);
    });
    return () => {
      huy = true;
    };
  }, [userId, lan]);
  if (ketQua === "loi")
    return (
      <TrangThai
        kind="error"
        title={LOI_CHUA_XOA.title}
        description={LOI_CHUA_XOA.description}
        hanhDong={
          <Button size="sm" variant="outline" onClick={thuLai}>
            Thử lại
          </Button>
        }
      />
    );
  return (
    <TrangThai
      kind="notice"
      title={ketQua === "xong" ? LOI_BI_BAO.title : "Đang xoá dữ liệu Quỹ hàng trên máy…"}
      description={ketQua === "xong" ? LOI_BI_BAO.description : undefined}
    />
  );
}
