"use client";

// Hồ sơ căn toàn màn: cùng `CotHoSo`, đường chọn toà và lần rao giữ ở `/units/<mã>`.
import { usePathname } from "next/navigation";

import { CotHoSo } from "./cot-ho-so";
import type { ChonCan } from "./ho-so";

export function HoSoToanMan({ nguoi, san, chon }: { nguoi: string; san: string; chon: ChonCan }) {
  const path = usePathname();
  const duong = (c: ChonCan) => {
    const m = new URLSearchParams();
    if (c.toa) m.set("toa", c.toa);
    if (c.lan) m.set("lan", c.lan);
    return `${path}?${m}`;
  };
  return <CotHoSo nguoi={nguoi} san={san} chon={chon} duong={duong} />;
}
