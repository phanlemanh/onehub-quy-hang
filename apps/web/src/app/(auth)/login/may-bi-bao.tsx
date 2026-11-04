"use client";

// Máy bị báo mất (hàng 38, AC-7): vỏ chuyển tới đây kèm mã người bị báo; xoá kho của người ấy trên máy (kể cả thay đổi
// chưa gửi) và huỷ đăng ký thông báo, rồi báo một dòng. Hàng 93 làm lại màn đăng nhập phải giữ khối này (luật 42).
import { useEffect, useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { xoaMayBiBao } from "@/lib/sync/may-bi-bao";

// Tiêu đề của khối báo (ReUI Alert) chỉ một dòng: câu của AC-7 tách thành tiêu đề và lời mô tả để không bị cắt trên điện thoại.
export const LOI_BI_BAO = { title: "Máy này đã bị báo mất", description: "Dữ liệu Quỹ hàng trên máy đã xoá" } as const;

export function KhoiMayBiBao({ userId }: { userId: string }) {
  const [xong, setXong] = useState(false);
  useEffect(() => {
    let huy = false;
    void xoaMayBiBao(userId)
      .catch(() => {})
      .then(() => {
        if (!huy) setXong(true);
      });
    return () => {
      huy = true;
    };
  }, [userId]);
  return (
    <TrangThai kind="notice" title={xong ? LOI_BI_BAO.title : "Đang xoá dữ liệu Quỹ hàng trên máy…"} description={xong ? LOI_BI_BAO.description : undefined} />
  );
}
