"use client";

import { useEffect } from "react";

import { taoBaoMo } from "./su-kien";

/** Báo một lượt mở khi trang đã chạy ở trình duyệt (AC-4) — không vẽ gì. */
export function BaoMo({ code }: { code: string }) {
  useEffect(() => {
    let kho: Storage | null = null;
    try {
      kho = window.localStorage;
    } catch {
      kho = null;
    }
    void taoBaoMo({ goi: (u, i) => fetch(u, i), kho, code })();
  }, [code]);
  return null;
}
