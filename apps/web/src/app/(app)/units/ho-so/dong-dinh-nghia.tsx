"use client";

// Dòng phụ dưới giá bao phí (hàng 49): đọc dấu định nghĩa của giá hiện hành từ máy chủ khi có mạng; mất mạng, đọc
// hỏng hay giá còn chờ gửi thì không có dòng — giá vẫn hiện như cũ. Thứ tự đọc ở `./doc-dau`, chữ dựng ở `./dinh-nghia`.
import { useEffect, useState, useSyncExternalStore } from "react";

import { goiFetch } from "@/lib/sync/goi-fetch";

import { docDau, taoBoDocDau, type VaoDong } from "./doc-dau";

export function DongDinhNghia({ v }: { v: VaoDong }) {
  const [bo] = useState(() => taoBoDocDau((id) => docDau(goiFetch, id)));
  useSyncExternalStore(bo.dangKy, bo.phienBan, () => 0);
  const { listingId, gia, phi, giaChoGui, keoLuc } = v;
  useEffect(() => {
    bo.vao({ listingId, gia, phi, giaChoGui, keoLuc });
  }, [bo, listingId, gia, phi, giaChoGui, keoLuc]);
  const chu = bo.chu(v);
  return chu ? (
    <p className="text-xs text-muted-foreground" data-dinh-nghia>
      {chu}
    </p>
  ) : null;
}
