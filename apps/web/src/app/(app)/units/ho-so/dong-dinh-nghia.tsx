"use client";

// Dòng phụ dưới giá bao phí (hàng 49): đọc dấu định nghĩa của giá hiện hành từ máy chủ khi có mạng; mất mạng hay đọc
// hỏng thì không có dòng — giá vẫn hiện như cũ. Chữ dựng ở `./dinh-nghia`.
import { useEffect, useState } from "react";

import type { DauPhi } from "@quy-hang/core/pricing";

import { dongDinhNghia } from "./dinh-nghia";

export function DongDinhNghia({ listingId, gia, phi }: { listingId: string; gia: number | null; phi: string | null }) {
  const [dau, setDau] = useState<{ khoa: string; dau: DauPhi | null } | null>(null);
  const khoa = `${listingId}:${gia ?? ""}:${phi ?? ""}`;
  useEffect(() => {
    if (phi !== "included" || gia === null) return;
    let huy = false;
    fetch(`/api/v1/listings/${encodeURIComponent(listingId)}/fee-basis`, { credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<DauPhi | null>) : null))
      .then((d) => {
        if (!huy) setDau({ khoa, dau: d });
      })
      .catch(() => {});
    return () => {
      huy = true;
    };
  }, [khoa, listingId, gia, phi]);
  const chu = phi === "included" && dau?.khoa === khoa ? dongDinhNghia(gia, dau.dau) : null;
  return chu ? (
    <p className="text-xs text-muted-foreground" data-dinh-nghia>
      {chu}
    </p>
  ) : null;
}
