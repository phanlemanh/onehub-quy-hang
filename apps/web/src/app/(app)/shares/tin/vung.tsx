"use client";

import { useEffect, useState } from "react";

import { homNayVN, type TinDauKhach } from "./dau-khach";
import { DongTinDauKhach, type TrangThaiVung } from "./dong-tin";

async function doc(): Promise<TrangThaiVung> {
  const r = await fetch("/api/v1/today/buyer", { cache: "no-store" }).catch(() => null);
  if (!r?.ok) return { kieu: "loi" };
  return { kieu: "xong", ds: ((await r.json()) as { items: TinDauKhach[] }).items };
}

/** Tin của khách ở Đã gửi (hàng 37, dời từ Hôm nay): tin 7 ngày về link của chính mình; chạm tin mở Đã gửi hay luồng Gửi. */
export default function VungDauKhach() {
  const [tt, setTt] = useState<TrangThaiVung>({ kieu: "dang-tai" });
  const [lan, setLan] = useState(0);
  useEffect(() => {
    let huy = false;
    void doc().then((v) => !huy && setTt(v));
    return () => {
      huy = true;
    };
  }, [lan]);
  return (
    <DongTinDauKhach
      trang={tt}
      homNay={homNayVN(new Date())}
      onThuLai={() => {
        setTt({ kieu: "dang-tai" });
        setLan((n) => n + 1);
      }}
    />
  );
}
