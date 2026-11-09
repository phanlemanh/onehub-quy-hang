/** Trạng thái mạng của trình duyệt, dùng chung cho các màn tự đọc lại khi có mạng (hồ sơ hom-nay-chiu-loi-tung-phan). */
import { useEffect, useEffectEvent, useSyncExternalStore } from "react";

export function useNgoaiTuyen() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

/** Gọi `lam` mỗi khi trình duyệt báo có mạng trở lại; `lam` luôn thấy trạng thái mới nhất của màn. */
export function useKhiCoMangLai(lam: () => void) {
  const goi = useEffectEvent(lam);
  useEffect(() => {
    const khiCo = () => goi();
    window.addEventListener("online", khiCo);
    return () => window.removeEventListener("online", khiCo);
  }, []);
}
