"use client";

// Máy bị báo mất (hàng 38, AC-7): vỏ chuyển tới đây kèm mã người bị báo; xoá kho của người ấy trên máy (kể cả thay đổi
// chưa gửi) và huỷ đăng ký thông báo, rồi báo một dòng. Hàng 93 làm lại màn đăng nhập phải giữ khối này (luật 42).
import { useEffect, useState } from "react";

import { TrangThai } from "@/components/trang-thai";
import { xoaMayBiBao } from "@/lib/sync/may-bi-bao";

export const LOI_BI_BAO = "Máy này đã bị báo mất — dữ liệu Quỹ hàng trên máy đã xoá";

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
  return <TrangThai kind="notice" title={xong ? LOI_BI_BAO : "Đang xoá dữ liệu Quỹ hàng trên máy này…"} />;
}
