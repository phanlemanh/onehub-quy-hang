"use client";

import { useSyncExternalStore } from "react";

import { TrangThai } from "@/components/trang-thai";

// Ngoại tuyến (ADR-0024 §4): đang xem bản đã tải mà mất mạng thì một dải báo ở đầu màn, nội dung giữ nguyên. Đọc trạng
// thái mạng của trình duyệt; trang mẫu sống truyền `ngoaiTuyen` để dựng trạng thái này không cần ngắt mạng.
function theoDoi(bao: () => void) {
  window.addEventListener("online", bao);
  window.addEventListener("offline", bao);
  return () => {
    window.removeEventListener("online", bao);
    window.removeEventListener("offline", bao);
  };
}

export function DaiNgoaiTuyen({ ngoaiTuyen }: { ngoaiTuyen?: boolean }) {
  const matMang = useSyncExternalStore(
    theoDoi,
    () => !navigator.onLine,
    () => false,
  );
  if (!(ngoaiTuyen ?? matMang)) return null;
  return (
    <TrangThai
      kind="notice"
      title="Đang xem bản đã tải — mất mạng"
      description="Thay đổi được giữ trên máy và gửi đi khi có mạng lại."
    />
  );
}
