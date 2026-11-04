"use client";

import { useEffect, useState } from "react";

import { homNayVN, type TinDauKhach } from "./dau-khach";
import { DongTinDauKhach, type TrangThaiVung } from "./dong-tin";
import { KhungHomNayDauKhach } from "./khung";

async function doc(): Promise<TrangThaiVung> {
  const r = await fetch("/api/v1/today/buyer", { cache: "no-store" }).catch(() => null);
  if (!r?.ok) return { kieu: "loi" };
  return { kieu: "xong", ds: ((await r.json()) as { items: TinDauKhach[] }).items };
}

/** Vùng «Đầu khách» của Hôm nay (hàng 37): tin 7 ngày về link của chính mình; chạm tin mở Đã gửi hay luồng Gửi. */
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
  const moTa = tt.kieu === "xong" && tt.ds.length ? `${tt.ds.length} tin trong ${new Set(tt.ds.map((t) => t.day)).size} ngày.` : null;
  return (
    <KhungHomNayDauKhach moTa={moTa}>
      <DongTinDauKhach
        trang={tt}
        homNay={homNayVN(new Date())}
        onThuLai={() => {
          setTt({ kieu: "dang-tai" });
          setLan((n) => n + 1);
        }}
      />
    </KhungHomNayDauKhach>
  );
}
