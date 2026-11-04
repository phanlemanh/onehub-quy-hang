"use client";

import { useEffect, useMemo, useState } from "react";

import { NganNoi } from "@/components/bo-cuc";
import { taoTatLink, type LanGuiChiTiet, type LanGuiTom, type TrangThaiTat } from "./da-gui";
import { ChiTietLanGui, DanhSachDaGui, type TrangThaiMan } from "./danh-sach";

const goi = (u: string, i: RequestInit) => fetch(u, i);

async function docDanhSach(): Promise<TrangThaiMan> {
  const r = await fetch("/api/v1/shares", { cache: "no-store" }).catch(() => null);
  if (!r) return { kieu: "loi" };
  if (r.status === 403) return { kieu: "khong-vai" };
  if (!r.ok) return { kieu: "loi" };
  return { kieu: "xong", ds: (await r.json()) as LanGuiTom[] };
}

/** Đã gửi (hàng 36): tải danh sách, chạm thẻ mở ngăn chi tiết, tắt link qua hộp xác nhận. */
export function ManDaGui() {
  const [tt, setTt] = useState<TrangThaiMan>({ kieu: "dang-tai" });
  const [lan, setLan] = useState(0);
  const [chon, setChon] = useState<string | null>(null);
  const [ct, setCt] = useState<LanGuiChiTiet | null>(null);
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
    if (!chon) return;
    let huy = false;
    void fetch(`/api/v1/shares/${chon}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => !huy && setCt(v as LanGuiChiTiet | null))
      .catch(() => !huy && setCt(null));
    return () => {
      huy = true;
    };
  }, [chon, lan]);
  const mo = (id: string) => {
    setCt(null);
    setTat("mo");
    setChon(id);
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
      <NganNoi mo={chon !== null} onMo={(m) => !m && setChon(null)} tieuDe={ct?.recipient ?? "Link đã gửi"}>
        {ct ? <ChiTietLanGui l={ct} tat={tat} onTat={() => void tatRoiTai()} /> : null}
      </NganNoi>
    </>
  );
}
