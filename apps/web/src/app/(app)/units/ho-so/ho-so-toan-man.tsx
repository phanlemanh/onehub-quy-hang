"use client";

// Hồ sơ căn toàn màn: cùng `CotHoSo`, đường chọn toà và lần rao giữ ở `/units/<mã>`.
import { usePathname, useSearchParams } from "next/navigation";

import { CotHoSo } from "./cot-ho-so";
import type { ChonCan } from "./ho-so";

export function HoSoToanMan({ nguoi, san, chon }: { nguoi: string; san: string; chon: ChonCan }) {
  const path = usePathname();
  // Toà và lần rao đổi trong trang bằng `history.replaceState` — đọc từ URL, không từ lần dựng trên máy chủ.
  const q = useSearchParams();
  const dangChon: ChonCan = { ma: chon.ma, toa: q.get("toa") ?? chon.toa, lan: q.get("lan") ?? chon.lan };
  const duong = (c: ChonCan) => {
    const m = new URLSearchParams();
    if (c.toa) m.set("toa", c.toa);
    if (c.lan) m.set("lan", c.lan);
    return `${path}?${m}`;
  };
  return <CotHoSo nguoi={nguoi} san={san} chon={dangChon} duong={duong} cho="toan-man" />;
}
