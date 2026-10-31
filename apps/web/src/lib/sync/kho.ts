/**
 * Kho trên máy: mỗi người một kho, mỗi sàn một ngăn (hàng 13). Đăng xuất xoá cả kho của người đó (luật 32, Kiến trúc §8).
 */
import { nganTrong, type Ngan } from "./types";

export interface LocalStore {
  read(companyId: string): Promise<Ngan>;
  write(companyId: string, ngan: Ngan): Promise<void>;
  /** Xoá sạch kho của người này trên máy — mọi ngăn. */
  wipe(): Promise<void>;
}

/**
 * Kho trong bộ nhớ cho kiểm thử. `may` là «cả máy»: nhiều người dùng chung một `may`, mỗi khoá `<người>|<sàn>`, để kiểm
 * xoá đúng người.
 */
export function taoKhoBoNho(userId: string, may: Map<string, unknown>): LocalStore {
  const khoa = (companyId: string) => `${userId}|${companyId}`;
  return {
    async read(companyId) {
      const v = may.get(khoa(companyId));
      return v ? (structuredClone(v) as Ngan) : nganTrong();
    },
    async write(companyId, ngan) {
      may.set(khoa(companyId), structuredClone(ngan));
    },
    async wipe() {
      for (const k of [...may.keys()]) if (k.startsWith(`${userId}|`)) may.delete(k);
    },
  };
}
