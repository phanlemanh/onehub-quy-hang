"use client";

/**
 * Danh bạ đầu chủ của sàn cho cột «Đầu chủ» của Bảng hàng (hàng 105): `GET /api/v1/team/listing-agents` — tên hiển thị
 * của các đầu chủ, không email, không số. Đọc một lần khi mở bảng, và đọc lại khi bảng gặp một người giữ chưa có trong
 * danh bạ (vừa gán cho người mới vào sàn) — mỗi bộ người lạ một lần. Không đọc được (mất mạng, vai không được đọc) thì
 * `null`: ô hiện mã ngắn, không kết luận «Đã rời sàn».
 */
import { useEffect, useMemo, useState } from "react";

import type { DanhBaDauChu } from "./cot";

type DauChu = { userId: string; displayName: string };

export function useDanhBaDauChu(khoa: readonly (string | null | undefined)[]): DanhBaDauChu {
  const [danhBa, setDanhBa] = useState<Map<string, string> | null>(null);
  const [khongDoc, setKhongDoc] = useState(false);
  // Người giữ chưa có trong danh bạ đang có (cả khi danh bạ chưa có): đổi thì đọc lại.
  const la = useMemo(() => [...new Set(khoa.filter((k): k is string => !!k && !danhBa?.has(k)))].sort().join(","), [khoa, danhBa]);
  const coDanhBa = danhBa !== null;
  useEffect(() => {
    if (khongDoc || (coDanhBa && !la)) return;
    let huy = false;
    fetch("/api/v1/team/listing-agents", { credentials: "same-origin" })
      .then(async (r) => {
        if (huy) return;
        // Vai không được đọc danh bạ: thôi đọc trong phiên này.
        if (r.status === 401 || r.status === 403) return setKhongDoc(true);
        if (!r.ok) return;
        const b = (await r.json()) as { items?: DauChu[] };
        if (!huy && Array.isArray(b.items)) setDanhBa(new Map(b.items.map((d) => [d.userId, d.displayName])));
      })
      .catch(() => {
        // Mất mạng: giữ danh bạ đang có.
      });
    return () => {
      huy = true;
    };
  }, [la, khongDoc, coDanhBa]);
  return danhBa;
}
