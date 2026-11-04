"use client";

import { HeartIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { NHAN_QUAN_TAM, taoQuanTam, type TrangThaiQuanTam } from "./su-kien";

/**
 * Kho máy của nút «Quan tâm» (Ngoài-1/5 hàng 35): trình duyệt chặn lưu trữ thì chỉ ĐỌC `window.localStorage` đã ném
 * SecurityError — bọc lại, trả null, nút vẫn chạy với mã máy tạm.
 */
export function khoMay(w: { localStorage: Storage } | undefined = typeof window === "undefined" ? undefined : window): Storage | null {
  try {
    return w?.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Nút «Quan tâm» của một căn (AC-5): một chạm, khoá sau khi ghi; lỗi mạng thì «thử lại». */
export function NutQuanTam({ code, listingId, lon = false }: { code: string; listingId: string; lon?: boolean }) {
  const [tt, setTt] = useState<TrangThaiQuanTam>("chua");
  const bam = useMemo(
    () => taoQuanTam({ goi: (u, i) => fetch(u, i), kho: khoMay(), code, listingId, doi: setTt }),
    [code, listingId],
  );
  return (
    <Button type="button" variant={lon ? "default" : "outline"} size={lon ? "lg" : "default"} className="mt-auto w-full" disabled={tt === "da" || tt === "dang"} onClick={bam}>
      <HeartIcon data-icon="inline-start" aria-hidden="true" className={tt === "da" ? "fill-current" : undefined} />
      {NHAN_QUAN_TAM[tt]}
    </Button>
  );
}
