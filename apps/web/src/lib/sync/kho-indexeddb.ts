/**
 * Kho trên máy bằng IndexedDB (ADR-0006 việc 3): một cơ sở dữ liệu cho mỗi người, `quy-hang-sync:<người>`, một ngăn mỗi
 * sàn. Chỉ chạy trong trình duyệt; kiểm bằng mắt ở eval nhìn giao diện (E4b, E8b).
 */
import type { LocalStore } from "./kho";
import { nganTrong, type Ngan } from "./types";

const NGAN = "ngan";
export const tenCoSo = (userId: string) => `quy-hang-sync:${userId}`;

function mo(userId: string): Promise<IDBDatabase> {
  return new Promise((ok, loi) => {
    const r = indexedDB.open(tenCoSo(userId), 1);
    r.onupgradeneeded = () => r.result.createObjectStore(NGAN);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => loi(r.error);
  });
}

function cho<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, loi) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => loi(r.error);
  });
}

export function taoKhoIndexedDb(userId: string): LocalStore {
  let db: Promise<IDBDatabase> | null = null;
  const lay = () => (db ??= mo(userId));
  return {
    async read(companyId) {
      const v = await cho((await lay()).transaction(NGAN).objectStore(NGAN).get(companyId));
      return (v as Ngan | undefined) ?? nganTrong();
    },
    async write(companyId, ngan) {
      const tx = (await lay()).transaction(NGAN, "readwrite");
      await cho(tx.objectStore(NGAN).put(ngan, companyId));
    },
    async wipe() {
      if (db) (await db).close();
      db = null;
      await new Promise<void>((ok, loi) => {
        const r = indexedDB.deleteDatabase(tenCoSo(userId));
        r.onsuccess = () => ok();
        r.onblocked = () => ok();
        r.onerror = () => loi(r.error);
      });
    },
  };
}
