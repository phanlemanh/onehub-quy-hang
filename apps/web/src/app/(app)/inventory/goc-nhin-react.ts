"use client";

/**
 * Lớp React mỏng trên kho góc nhìn: bảng và cột thứ hai của vỏ đọc chung một nguồn. Trang Bảng hàng đặt người và sàn
 * đang làm (đọc ở máy chủ); cột thứ hai chỉ hiện ở nhà Bảng hàng nên luôn có phạm vi khi cần.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { docGocNhin, type GocNhin, type KhoChu } from "./goc-nhin";

type PhamVi = { nguoi: string; san: string };

const SU_KIEN = "qh:goc-nhin";
/** «+ Lưu góc nhìn» ở cột thứ hai bảo bảng mở hộp đặt tên. */
export const SU_KIEN_MO_LUU = "qh:mo-luu-goc-nhin";

let phamVi: PhamVi | null = null;
let banDem: { khoa: string; ds: GocNhin[] } | null = null;
const RONG: GocNhin[] = [];

/** `localStorage` có thể ném (cửa sổ riêng tư, bị chặn): khi đó góc nhìn sống trong bộ nhớ tới khi tải lại. */
const boNho = new Map<string, string>();
export const khoTrinhDuyet: KhoChu = {
  getItem(k) {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return boNho.get(k) ?? null;
    }
  },
  setItem(k, v) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      boNho.set(k, v);
    }
    banDem = null;
    window.dispatchEvent(new Event(SU_KIEN));
  },
};

function dangKy(f: () => void) {
  const doi = () => {
    banDem = null;
    f();
  };
  window.addEventListener(SU_KIEN, doi);
  window.addEventListener("storage", doi);
  return () => {
    window.removeEventListener(SU_KIEN, doi);
    window.removeEventListener("storage", doi);
  };
}

function chup(): GocNhin[] {
  if (!phamVi) return RONG;
  const khoa = `${phamVi.nguoi}:${phamVi.san}`;
  if (banDem?.khoa !== khoa) banDem = { khoa, ds: docGocNhin(khoTrinhDuyet, phamVi.nguoi, phamVi.san) };
  return banDem.ds;
}

/** Trang Bảng hàng gọi khi mở: từ đây cột thứ hai biết góc nhìn của ai. */
export function useDatPhamVi(nguoi: string, san: string) {
  useEffect(() => {
    phamVi = { nguoi, san };
    banDem = null;
    window.dispatchEvent(new Event(SU_KIEN));
  }, [nguoi, san]);
}

export function useGocNhinCuaToi(): { ds: GocNhin[]; phamVi: PhamVi | null } {
  const ds = useSyncExternalStore(dangKy, chup, () => RONG);
  return { ds, phamVi };
}

export function useMoLuuGocNhin(mo: () => void) {
  const nghe = useCallback(() => mo(), [mo]);
  useEffect(() => {
    window.addEventListener(SU_KIEN_MO_LUU, nghe);
    return () => window.removeEventListener(SU_KIEN_MO_LUU, nghe);
  }, [nghe]);
}
