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
    r.onsuccess = () => {
      // Tab khác xoá kho (đăng xuất): đóng kết nối này để lệnh xoá không bị chặn.
      r.result.onversionchange = () => r.result.close();
      ok(r.result);
    };
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
  // Mở hỏng thì lần sau mở lại, không giữ mãi lời hứa đã hỏng (hàng 61: kho hồi thì bộ đồng bộ tự về bình thường).
  const lay = () =>
    (db ??= mo(userId).catch((e: unknown) => {
      db = null;
      throw e;
    }));
  return {
    async read(companyId) {
      const v = await cho((await lay()).transaction(NGAN).objectStore(NGAN).get(companyId));
      // Ngăn ghi từ bản cũ thiếu khoá mới (vd `queueSet`, hàng 22): phủ lên ngăn trống để mọi khoá có giá trị.
      return v ? { ...nganTrong(), ...(v as Ngan) } : nganTrong();
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
        // Bị chặn (tab khác còn mở) thì chờ tới khi tab ấy đóng kết nối — không báo xong khi kho chưa xoá.
        r.onsuccess = () => ok();
        r.onerror = () => loi(r.error);
      });
    },
  };
}

/**
 * Kho ảnh chờ của một người (hàng 41 chup-anh-dien-thoai): ảnh chụp lúc mất mạng chờ ở đây, tách khỏi kho đồng bộ — ảnh
 * không đi qua bộ đồng bộ. Tên đặt ở đây để mọi chỗ xoá kho của người xoá luôn kho này (AC-6).
 */
export const tenKhoAnhCho = (userId: string) => `quy-hang-anh-cho:${userId}`;

function xoaCoSo(ten: string): Promise<void> {
  return new Promise((ok, loi) => {
    const r = indexedDB.deleteDatabase(ten);
    r.onsuccess = () => ok();
    r.onerror = () => loi(r.error);
  });
}

/**
 * Xoá kho trên máy của một người mà không cần mở nó — dùng ở màn ngoài vỏ (chọn sàn, chưa có sàn) và khi máy bị báo mất.
 * Xoá cùng lúc kho đồng bộ và kho ảnh chờ của người ấy (hàng 41, AC-6); kho của người khác không bị đụng.
 */
export async function xoaKhoCuaNguoi(userId: string, xoa: (ten: string) => Promise<void> = xoaCoSo): Promise<void> {
  await Promise.all([xoa(tenCoSo(userId)), xoa(tenKhoAnhCho(userId))]);
}
