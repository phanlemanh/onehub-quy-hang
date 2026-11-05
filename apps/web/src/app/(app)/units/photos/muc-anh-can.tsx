"use client";

// Mục Ảnh của một căn trong hồ sơ (hàng 18): MucAnh nối API thật. Dựng lại nguồn khi đổi căn.
import { useMemo, useState } from "react";

import { useDocLaiKhiDaTai } from "./hang-cho-may";
import { MucAnh } from "./muc-anh";
import { nguonApi } from "./nguon-api";

export function MucAnhCan({ toa, ma }: { toa: string; ma: string }) {
  const nguon = useMemo(() => nguonApi(toa, ma), [toa, ma]);
  // Ảnh chụp trên điện thoại vừa lên máy chủ (hàng 41, AC-8): mục Ảnh đọc lại danh sách.
  const [lanTai, setLanTai] = useState(0);
  useDocLaiKhiDaTai(toa, ma, () => setLanTai((n) => n + 1));
  return <MucAnh key={`${toa}|${ma}`} nguon={nguon} toaMa={`${toa} ${ma}`} lanTai={lanTai} />;
}
