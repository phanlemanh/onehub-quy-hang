"use client";

/**
 * Danh bạ thành viên của sàn cho cột «Đầu chủ» của Bảng hàng (hàng 105): `GET /api/v1/company/member-names` — mọi vai
 * của sàn đọc được, chỉ mã và tên. Đọc khi mở bảng và khi bảng gặp một người giữ chưa có trong danh bạ (vừa gán cho người
 * mới vào sàn) — mỗi bộ người lạ một lần. Giữ bản cuối trên máy theo sàn (như danh mục) để mất mạng vẫn hiện tên; chưa có
 * bản nào thì `null`.
 */
import { useEffect, useMemo, useState } from "react";

import type { DanhBaDauChu } from "./cot";

type ThanhVien = { id: string; name: string };
const khoa = (san: string) => `qh:danh-ba:v1:${san}`;

function docBanGiu(san: string): Map<string, string> | null {
  try {
    const v = JSON.parse(window.localStorage.getItem(khoa(san)) ?? "null") as ThanhVien[] | null;
    return Array.isArray(v) ? new Map(v.map((t) => [t.id, t.name])) : null;
  } catch {
    return null;
  }
}

export function useDanhBaDauChu(san: string, nguoiGiu: readonly (string | null | undefined)[]): DanhBaDauChu {
  // Bản giữ trên máy đọc lúc dựng — máy chủ không có nó, và lúc ấy bảng còn đang tải nên không lệch lúc hydrate.
  const [danhBa, setDanhBa] = useState<Map<string, string> | null>(() => (typeof window === "undefined" ? null : docBanGiu(san)));
  const [daDoc, setDaDoc] = useState(false);
  // Người giữ chưa có trong danh bạ đang có: đổi thì đọc lại.
  const la = useMemo(() => [...new Set(nguoiGiu.filter((k): k is string => !!k && !danhBa?.has(k)))].sort().join(","), [nguoiGiu, danhBa]);
  useEffect(() => {
    if (daDoc && !la) return;
    let huy = false;
    fetch("/api/v1/company/member-names", { credentials: "same-origin" })
      .then(async (r) => {
        if (huy || !r.ok) return;
        const ds = (await r.json()) as ThanhVien[];
        if (huy || !Array.isArray(ds)) return;
        setDanhBa(new Map(ds.map((t) => [t.id, t.name])));
        setDaDoc(true);
        try {
          window.localStorage.setItem(khoa(san), JSON.stringify(ds));
        } catch {
          // Không giữ được bản trên máy: lần mất mạng sau ô chờ danh bạ.
        }
      })
      .catch(() => {
        // Mất mạng: dùng bản đã giữ.
      });
    return () => {
      huy = true;
    };
  }, [san, la, daDoc]);
  return danhBa;
}
