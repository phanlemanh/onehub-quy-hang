// Kho ảnh chờ trên máy (hàng 41 chup-anh-dien-thoai, AC-4, AC-6): một cơ sở dữ liệu IndexedDB cho MỖI người,
// `quy-hang-anh-cho:<người>`, tách khỏi kho đồng bộ — ảnh không đi qua bộ đồng bộ. Người khác đăng nhập trên cùng máy mở kho
// của chính họ, không thấy ảnh chờ của ai. Đăng xuất chủ động và máy bị báo mất xoá kho này cùng kho đồng bộ
// (`lib/sync/kho-indexeddb.ts` › `xoaKhoCuaNguoi`, `lib/sync/react.tsx` › `dangXuat`). Kiểm bằng mắt ở eval nhìn (E12, E19).
import { tenKhoAnhCho } from "@/lib/sync/kho-indexeddb";
import type { BanGhiCho, KhoAnhCho } from "./hang-cho-anh";

const NGAN = "anh";

function cho<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((ok, loi) => {
    r.onsuccess = () => ok(r.result);
    r.onerror = () => loi(r.error);
  });
}

export function taoKhoAnhCho(userId: string): KhoAnhCho {
  let db: Promise<IDBDatabase> | null = null;
  const lay = () =>
    (db ??= new Promise<IDBDatabase>((ok, loi) => {
      const r = indexedDB.open(tenKhoAnhCho(userId), 1);
      r.onupgradeneeded = () => r.result.createObjectStore(NGAN, { keyPath: "id" });
      r.onsuccess = () => {
        // Đăng xuất ở tab khác xoá kho: đóng kết nối này để lệnh xoá không bị chặn.
        r.result.onversionchange = () => {
          r.result.close();
          db = null;
        };
        ok(r.result);
      };
      r.onerror = () => loi(r.error);
    }).catch((e: unknown) => {
      db = null;
      throw e;
    }));
  return {
    async tai() {
      return (await cho((await lay()).transaction(NGAN).objectStore(NGAN).getAll())) as BanGhiCho[];
    },
    async ghi(b) {
      await cho((await lay()).transaction(NGAN, "readwrite").objectStore(NGAN).put(b));
    },
    async xoa(id) {
      await cho((await lay()).transaction(NGAN, "readwrite").objectStore(NGAN).delete(id));
    },
  };
}
