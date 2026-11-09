"use client";

import { useEffect, useState } from "react";

import { useKhiCoMangLai } from "../../today/viec/mang";
import { docTinDauKhach, homNayVN } from "./dau-khach";
import { DongTinDauKhach, type TrangThaiVung } from "./dong-tin";

async function doc(): Promise<TrangThaiVung> {
  const ds = await docTinDauKhach();
  return ds ? { kieu: "xong", ds } : { kieu: "loi" };
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
  const docLai = () => {
    setTt({ kieu: "dang-tai" });
    setLan((n) => n + 1);
  };
  useKhiCoMangLai(() => {
    if (tt.kieu === "loi") docLai();
  });
  return (
    <DongTinDauKhach
      trang={tt}
      homNay={homNayVN(new Date())}
      onThuLai={docLai}
    />
  );
}
