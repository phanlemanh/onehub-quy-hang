"use client";

/**
 * Danh mục cho Bảng hàng: tải `GET /api/v1/catalog` một lần mỗi lần mở trang, giữ bản cuối trên máy theo sàn để bảng vẫn
 * nhóm theo loại căn khi mất mạng. Danh mục là dữ liệu dùng chung, không có trường nguồn. Hàng 79: cùng nếp cho căn ngoài
 * khu của sàn (`GET /api/v1/off-compound-units` — mã, loại hình, địa chỉ đã gõ) để hàng ngoài khu ra loại hình khi mất mạng.
 */
import type { CatalogData } from "@quy-hang/core";
import { useCallback, useEffect, useState } from "react";
import type { CanNgoaiKhuXem } from "./ghep-danh-muc";

const khoa = (san: string) => `qh:danh-muc:v1:${san}`;
export const khoaNgoaiKhu = (san: string) => `qh:can-ngoai-khu:v1:${san}`;

/** Kho chữ tối giản — `localStorage` trên trình duyệt, `Map` trong bài kiểm. */
export type KhoChu = { getItem(k: string): string | null; setItem(k: string, v: string): void };

const laCanNgoaiKhu = (c: unknown): c is CanNgoaiKhuXem => {
  const v = c as Partial<CanNgoaiKhuXem> | null;
  return !!v && typeof v.id === "string" && typeof v.propertySubType === "string" && typeof v.unparsedAddress === "string";
};

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
    return v.filter(laCanNgoaiKhu);
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

export type KetQuaDocNgoaiKhu = { kind: "xong"; ds: CanNgoaiKhuXem[] } | { kind: "loi" };

/** Một lần đọc căn ngoài khu — phần thuần, bài kiểm trao `fetch` giả. Mất mạng, 4xx, 5xx, thân sai khuôn đều là `loi`. */
export async function docCanNgoaiKhu(goi: typeof fetch): Promise<KetQuaDocNgoaiKhu> {
  try {
    const r = await goi("/api/v1/off-compound-units", { credentials: "same-origin" });
    if (!r.ok) return { kind: "loi" };
    const units = ((await r.json()) as { units?: unknown } | null)?.units;
    return Array.isArray(units) && units.every(laCanNgoaiKhu) ? { kind: "xong", ds: units } : { kind: "loi" };
  } catch {
    return { kind: "loi" };
  }
}

/** Báo khi lần đọc lỗi, máy không có bản giữ đọc được (`ds` null) và bảng có hàng ngoài khu — sàn không có thì lỗi không ảnh hưởng gì. */
export function canBaoNgoaiKhu(loi: boolean, ds: readonly CanNgoaiKhuXem[] | null, hang: readonly { offCompoundUnitId?: string | null }[]): boolean {
  return loi && ds === null && hang.some((l) => !!l.offCompoundUnitId);
}

/** Câu báo lỗi đọc của Bảng hàng: một vùng một báo (ADR-0024 sửa đổi 09/11) — danh bạ và căn ngoài khu cùng lỗi thì một câu chung. */
export function cauBaoLoiDoc(danhBaLoi: boolean, ngoaiKhuLoi: boolean): string | null {
  if (danhBaLoi && ngoaiKhuLoi) return "Chưa đọc được danh bạ thành viên và danh sách căn ngoài khu — cột Đầu chủ và các căn ngoài khu có thể thiếu thông tin";
  if (danhBaLoi) return "Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên";
  if (ngoaiKhuLoi) return "Chưa đọc được danh sách căn ngoài khu — loại hình và địa chỉ của các căn này có thể thiếu";
  return null;
}

export type CanNgoaiKhuBangHang = { ds: CanNgoaiKhuXem[] | null; loi: boolean; thuLai: () => void };

/** Căn ngoài khu của sàn (hàng 79): bản giữ trên máy lúc dựng, thay bằng lần đọc mới khi được; đọc hỏng thì báo `loi`, chỉ đọc lại khi người bấm. */
export function useCanNgoaiKhu(san: string): CanNgoaiKhuBangHang {
  const [ds, setDs] = useState<CanNgoaiKhuXem[] | null>(() => docBanGiuNgoaiKhu(khoTrinhDuyet(), san));
  const [loi, setLoi] = useState(false);
  // Lượt đọc: tăng khi người bấm «Thử lại» — đổi thì đọc lại một lần.
  const [luot, setLuot] = useState(0);
  useEffect(() => {
    let huy = false;
    void docCanNgoaiKhu(fetch).then((kq) => {
      if (huy) return;
      setLoi(kq.kind === "loi");
      setDs(capNhatBanGiuNgoaiKhu(khoTrinhDuyet(), san, kq.kind === "xong" ? kq.ds : null));
    });
    return () => {
      huy = true;
    };
  }, [san, luot]);
  const thuLai = useCallback(() => setLuot((n) => n + 1), []);
  return { ds, loi, thuLai };
}
