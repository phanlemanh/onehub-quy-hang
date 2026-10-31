"use client";

/**
 * Lớp React mỏng trên bộ đồng bộ (hàng 13): một bộ đồng bộ cho người và sàn đang làm, kho IndexedDB, thử lại khi quay lại
 * trang hay trình duyệt báo có mạng. Màn Bảng hàng và Hồ sơ căn (hàng 14, 32, 33) đọc qua các hook ở đây.
 */
import type { EventType } from "@quy-hang/core/listing";
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { BoLoc } from "./doc";
import { taoBoDongBo, type BoDongBo } from "./dong-bo";
import { goiFetch } from "./goi-fetch";
import { taoKhoIndexedDb } from "./kho-indexeddb";
import { canHoiKhiDangXuat } from "./trang-thai";

type Ctx = {
  bd: BoDongBo;
  /** Đăng xuất: còn thay đổi chờ thì hỏi; đồng ý (hay không có gì chờ) thì xoá sạch kho trên máy. Trả `false` khi người ở lại. */
  dangXuat(): Promise<boolean>;
  hoi: { n: number; tra: (ok: boolean) => void } | null;
  canXemMo: boolean;
  moCanXem(v: boolean): void;
};

const BoDongBoCtx = createContext<Ctx | null>(null);

export function BoDongBoProvider({ userId, companyId, companyIds, roles, children }: { userId: string; companyId: string; companyIds: string[]; roles: string[]; children: ReactNode }) {
  const kho = useMemo(() => taoKhoIndexedDb(userId), [userId]);
  const vai = roles.join(",");
  const bd = useMemo(() => taoBoDongBo({ goi: goiFetch, kho, me: { userId, roles: vai ? vai.split(",") : [] }, companyId }), [kho, userId, companyId, vai]);
  const [hoi, setHoi] = useState<Ctx["hoi"]>(null);
  const [canXemMo, moCanXem] = useState(false);

  useEffect(() => {
    void bd.khoiDong();
    const quay = () => {
      if (document.visibilityState === "visible") bd.quayLaiTrang();
    };
    document.addEventListener("visibilitychange", quay);
    window.addEventListener("focus", quay);
    window.addEventListener("online", quay);
    return () => {
      document.removeEventListener("visibilitychange", quay);
      window.removeEventListener("focus", quay);
      window.removeEventListener("online", quay);
      bd.dung();
    };
  }, [bd]);

  const dangXuat = async () => {
    const ngan = await Promise.all(companyIds.map((id) => kho.read(id)));
    const { hoi: canHoi, n } = canHoiKhiDangXuat(ngan);
    if (canHoi) {
      const ok = await new Promise<boolean>((tra) => setHoi({ n, tra }));
      setHoi(null);
      if (!ok) return false;
    }
    bd.dung();
    await kho.wipe();
    return true;
  };

  return <BoDongBoCtx.Provider value={{ bd, dangXuat, hoi, canXemMo, moCanXem }}>{children}</BoDongBoCtx.Provider>;
}

export function useBoDongBo(): Ctx {
  const c = useContext(BoDongBoCtx);
  if (!c) throw new Error("useBoDongBo cần BoDongBoProvider");
  return c;
}

/** Đổi mỗi khi kho hay trạng thái gửi đổi — dùng làm khoá cho các hook đọc. */
function usePhienBan(bd: BoDongBo) {
  const dem = useRef(0);
  return useSyncExternalStore(
    (f) =>
      bd.dangKy(() => {
        dem.current++;
        f();
      }),
    () => dem.current,
    () => 0,
  );
}

export function useChiBao() {
  const { bd } = useBoDongBo();
  usePhienBan(bd);
  return bd.chiBao();
}

export function useCanXem() {
  const { bd } = useBoDongBo();
  usePhienBan(bd);
  return bd.canXem();
}

export function useDanhSachHang(loc: BoLoc = {}) {
  const { bd } = useBoDongBo();
  usePhienBan(bd);
  return bd.danhSach(loc);
}

export function useHoSoHang(id: string | null) {
  const { bd } = useBoDongBo();
  usePhienBan(bd);
  // Mở hồ sơ đọc ngay từ bản đệm; lịch sử kéo ở nền để lần sau có sẵn.
  useEffect(() => {
    if (id) bd.hoSo(id);
  }, [bd, id]);
  if (!id) return null;
  const can = bd.danhSach().find((l) => l.id === id);
  return can ? { can, lichSu: bd.ngan().history[id] ?? [] } : null;
}

export function useSuaHang() {
  const { bd } = useBoDongBo();
  return (listingId: string, type: EventType, payload: Record<string, unknown>) => bd.sua(listingId, type, payload);
}
