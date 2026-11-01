"use client";

// Mục Ảnh của một căn trong hồ sơ (hàng 18): MucAnh nối API thật. Dựng lại nguồn khi đổi căn.
import { useMemo } from "react";

import { MucAnh } from "./muc-anh";
import { nguonApi } from "./nguon-api";

export function MucAnhCan({ toa, ma }: { toa: string; ma: string }) {
  const nguon = useMemo(() => nguonApi(toa, ma), [toa, ma]);
  return <MucAnh key={`${toa}|${ma}`} nguon={nguon} toaMa={`${toa} ${ma}`} />;
}
