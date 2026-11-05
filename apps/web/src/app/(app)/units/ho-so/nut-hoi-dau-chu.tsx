"use client";

// Nút «Hỏi đầu chủ» dính đáy hồ sơ căn của người không thấy nguồn (hàng 33). Tên đầu chủ đọc lúc mở hồ sơ; chạm chỉ mở
// bảng chia sẻ của máy hay chép tin — không gửi gì thay người (bất biến 3).
import { tinHoiDauChu } from "@quy-hang/core/access";
import { MessageCircleQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { CHU_DA_CHEP, docTenDauChu, moHoi, nutHoi } from "./hoi-dau-chu";

const KHUNG_BAO = "hoi-dau-chu";

/** `lon`: nút chính dính đáy của thân điện thoại — vùng chạm 44 px (AC-5 hồ sơ ho-so-dien-thoai-product-detail-5). */
export function NutHoiDauChu({ listingId, dauChu, ma, toa, lon = false }: { listingId: string; dauChu: string | null; ma: string; toa: string; lon?: boolean }) {
  const [ten, setTen] = useState<{ id: string; ten: string | null } | null>(null);
  useEffect(() => {
    if (dauChu === null) return;
    let huy = false;
    void docTenDauChu(listingId).then((t) => {
      if (!huy) setTen({ id: listingId, ten: t });
    });
    return () => {
      huy = true;
    };
  }, [listingId, dauChu]);
  const nut = nutHoi(dauChu, ten?.id === listingId ? ten.ten : null);

  const cham = () => {
    void moHoi(tinHoiDauChu({ unitNumber: ma, buildingName: toa }, window.location.origin), navigator).then((kq) => {
      if (kq === "da-chep") toast.success(CHU_DA_CHEP, { toasterId: KHUNG_BAO });
      else if (kq === "loi") toast.error("Máy này không mở được bảng chia sẻ", { toasterId: KHUNG_BAO });
    });
  };

  return (
    <div className="sticky bottom-0 z-10 flex flex-col border-t bg-background p-4" data-slot="hoi-dau-chu">
      <Button className={lon ? "h-11 w-full" : "w-full"} size={lon ? "lg" : "default"} disabled={nut.tat} onClick={cham}>
        {nut.tat ? null : <MessageCircleQuestion />}
        {nut.chu}
      </Button>
      <Toaster id={KHUNG_BAO} position="bottom-center" />
    </div>
  );
}
