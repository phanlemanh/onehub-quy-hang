"use client";

/**
 * Danh mục cho Bảng hàng: tải `GET /api/v1/catalog` một lần mỗi lần mở trang, giữ bản cuối trên máy theo sàn để bảng vẫn
 * nhóm theo loại căn khi mất mạng. Danh mục là dữ liệu dùng chung, không có trường nguồn.
 */
import type { CatalogData } from "@quy-hang/core";
import { useEffect, useState } from "react";

const khoa = (san: string) => `qh:danh-muc:v1:${san}`;

function docBanGiu(san: string): CatalogData | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(khoa(san)) ?? "null") as CatalogData | null;
    return v && Array.isArray(v.subdivisions) ? v : null;
  } catch {
    return null;
  }
}

export function useDanhMuc(san: string): CatalogData | null {
  // Bản giữ trên máy đọc lúc dựng — máy chủ không có nó, và lúc ấy bảng còn đang tải nên không lệch lúc hydrate.
  const [dm, setDm] = useState<CatalogData | null>(() => (typeof window === "undefined" ? null : docBanGiu(san)));
  useEffect(() => {
    let huy = false;
    fetch("/api/v1/catalog", { credentials: "same-origin" })
      .then(async (r) => (r.ok ? ((await r.json()) as CatalogData) : null))
      .then((moi) => {
        if (huy || !moi) return;
        setDm(moi);
        try {
          window.localStorage.setItem(khoa(san), JSON.stringify(moi));
        } catch {
          // Không giữ được bản trên máy: lần mất mạng sau loại căn ra «Chưa rõ».
        }
      })
      .catch(() => {
        // Mất mạng: dùng bản đã giữ.
      });
    return () => {
      huy = true;
    };
  }, [san]);
  return dm;
}
