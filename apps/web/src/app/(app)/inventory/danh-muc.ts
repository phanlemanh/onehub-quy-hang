"use client";

/**
 * Danh mục cho Bảng hàng: tải `GET /api/v1/catalog` một lần mỗi lần mở trang, giữ bản cuối trên máy theo sàn để bảng vẫn
 * nhóm theo loại căn khi mất mạng. Danh mục là dữ liệu dùng chung, không có trường nguồn. Hàng 79: cùng nếp cho căn ngoài
 * khu của sàn (`GET /api/v1/off-compound-units` — mã, loại hình, địa chỉ đã gõ) để hàng ngoài khu ra loại hình khi mất mạng.
 */
import type { CatalogData } from "@quy-hang/core";
import { useEffect, useState } from "react";
import type { CanNgoaiKhuXem } from "./ghep-danh-muc";

const khoa = (san: string) => `qh:danh-muc:v1:${san}`;
export const khoaNgoaiKhu = (san: string) => `qh:can-ngoai-khu:v1:${san}`;

/** Kho chữ tối giản — `localStorage` trên trình duyệt, `Map` trong bài kiểm. */
export type KhoChu = { getItem(k: string): string | null; setItem(k: string, v: string): void };

function docBanGiu(san: string): CatalogData | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(khoa(san)) ?? "null") as CatalogData | null;
    return v && Array.isArray(v.subdivisions) ? v : null;
  } catch {
    return null;
  }
}

/** Bản giữ của căn ngoài khu: chỉ nhận dòng đủ ba khoá chữ; bản hỏng hay vắng → `null` (hàng ngoài khu «Chưa rõ»). */
export function docBanGiuNgoaiKhu(kho: KhoChu | null, san: string): CanNgoaiKhuXem[] | null {
  try {
    const v = JSON.parse(kho?.getItem(khoaNgoaiKhu(san)) ?? "null") as unknown;
    if (!Array.isArray(v)) return null;
    return v.filter((c): c is CanNgoaiKhuXem => !!c && typeof c.id === "string" && typeof c.propertySubType === "string" && typeof c.unparsedAddress === "string");
  } catch {
    return null;
  }
}

/** Lần đọc mới thành công thì thay bản giữ; đọc lỗi (`null`) thì giữ nguyên bản cũ — bảng đọc bản trả về. */
export function capNhatBanGiuNgoaiKhu(kho: KhoChu | null, san: string, moi: CanNgoaiKhuXem[] | null): CanNgoaiKhuXem[] | null {
  if (moi === null) return docBanGiuNgoaiKhu(kho, san);
  try {
    kho?.setItem(khoaNgoaiKhu(san), JSON.stringify(moi));
  } catch {
    // Không giữ được bản trên máy: lần mất mạng sau hàng ngoài khu ra «Chưa rõ».
  }
  return moi;
}

const khoTrinhDuyet = (): KhoChu | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

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

/** Căn ngoài khu của sàn cho Bảng hàng (hàng 79): bản giữ trên máy lúc dựng, thay bằng lần đọc mới khi được. */
export function useCanNgoaiKhu(san: string): CanNgoaiKhuXem[] | null {
  const [ds, setDs] = useState<CanNgoaiKhuXem[] | null>(() => docBanGiuNgoaiKhu(khoTrinhDuyet(), san));
  useEffect(() => {
    let huy = false;
    fetch("/api/v1/off-compound-units", { credentials: "same-origin" })
      .then(async (r) => (r.ok ? (((await r.json()) as { units?: CanNgoaiKhuXem[] }).units ?? null) : null))
      .catch(() => null)
      .then((moi) => {
        if (!huy) setDs(capNhatBanGiuNgoaiKhu(khoTrinhDuyet(), san, moi));
      });
    return () => {
      huy = true;
    };
  }, [san]);
  return ds;
}
