"use client";

import { useEffect, useMemo, useState } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { docLanTuThamSo, taiChiTiet, taoTatLink, type LanGuiTom, type TrangThaiChiTiet, type TrangThaiTat } from "./da-gui";
import { DanhSachDaGui, NganChiTiet, type TrangThaiMan } from "./danh-sach";

const goi = (u: string, i: RequestInit) => fetch(u, i);

async function docDanhSach(): Promise<TrangThaiMan> {
  const r = await fetch("/api/v1/shares", { cache: "no-store" }).catch(() => null);
  if (!r) return { kieu: "loi" };
  if (r.status === 403) return { kieu: "khong-vai" };
  if (!r.ok) return { kieu: "loi" };
  return { kieu: "xong", ds: (await r.json()) as LanGuiTom[] };
}

/** Đã gửi (hàng 36): tải danh sách, chạm thẻ mở ngăn chi tiết, tắt link qua hộp xác nhận; `?lan=<id>` mở thẳng một link (hàng 37). */
export function ManDaGui() {
  const [tt, setTt] = useState<TrangThaiMan>({ kieu: "dang-tai" });
  const [lan, setLan] = useState(0);
  const [chon, setChon] = useState<string | null>(null);
  const [ct, setCt] = useState<TrangThaiChiTiet>({ kieu: "dang-tai" });
  const [lanCt, setLanCt] = useState(0);
  const [tat, setTat] = useState<TrangThaiTat>("mo");

  useEffect(() => {
    let huy = false;
    void docDanhSach().then((v) => !huy && setTt(v));
    return () => {
      huy = true;
    };
  }, [lan]);
  const taiLai = () => {
    setTt({ kieu: "dang-tai" });
    setLan((n) => n + 1);
  };

  useEffect(() => {
    const id = docLanTuThamSo(new URLSearchParams(window.location.search).get("lan"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc ?lan= một lần lúc vào màn: địa chỉ chỉ có ở máy khách
    if (id) setChon(id);
  }, []);

  useEffect(() => {
    if (!chon) return;
    let huy = false;
    void taiChiTiet(goi, chon).then((v) => !huy && setCt(v));
    return () => {
      huy = true;
    };
  }, [chon, lan, lanCt]);
  const mo = (id: string) => {
    setCt({ kieu: "dang-tai" });
    setTat("mo");
    setChon(id);
  };
  const thuLaiCt = () => {
    setCt({ kieu: "dang-tai" });
    setLanCt((n) => n + 1);
  };

  // Hộp xác nhận nằm ở ChiTietLanGui (AlertDialog): tới đây là người đã bấm «Tắt link» trong hộp.
  const bamTat = useMemo(() => (chon ? taoTatLink({ goi, xacNhan: () => true, id: chon, doi: setTat }) : undefined), [chon]);
  const tatRoiTai = async () => {
    await bamTat?.();
    setLan((n) => n + 1);
  };

  return (
    <>
      <DanhSachDaGui tt={tt} onMo={mo} onThuLai={taiLai} />
      <NganNoi mo={chon !== null} onMo={(m) => !m && setChon(null)} tieuDe={ct.kieu === "xong" ? ct.ct.recipient : "Link đã gửi"}>
        <NganChiTiet tt={ct} tat={tat} onTat={() => void tatRoiTai()} onThuLai={thuLaiCt} />
      </NganNoi>
    </>
  );
}
