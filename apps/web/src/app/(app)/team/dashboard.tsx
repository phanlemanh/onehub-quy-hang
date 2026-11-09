"use client";

// Đội (hồ sơ hom-nay-mot-danh-sach-viec; khối dashboard-6 của hàng 42 dời từ Hôm nay): dải ba ô số và bảng theo đầu chủ, bỏ
// biểu đồ. Việc giao lại ở Hôm nay. Hàng đợi và đầu chủ đọc qua API (`/api/v1/team/*`); hàng cũ theo người đếm trên căn của
// kho trên máy, chỉ căn toàn sàn.
import { AlertTriangleIcon, ClockAlertIcon, HistoryIcon, RotateCwIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ChoTai } from "@/components/bo-cuc";
import { CoverageDashboard } from "@/components/khoi/dashboard-6/coverage-dashboard";
import type { CrewMember, CrewStatus, MetricCard } from "@/components/khoi/dashboard-6/data";
import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { useDanhSachHang } from "@/lib/sync/react";

import { layDauChuCuaSan, layHangDoiTruongNhom, type DauChuCuaSan, type DongLeadTruongNhom } from "../today/nguon";
import { baO, CHU_CHUA_CO_CAN, CHU_PHAM_VI, dongTheoNguoi, hangCuTrenMay, ngayVN, trangThaiTruongNhom } from "./trang-thai";

const trangThaiTuoi = (phanTram: number): CrewStatus => (phanTram >= 80 ? "tuoi" : phanTram >= 60 ? "chu-y" : "cu");
const chuDau = (ten: string) => ten.replace(/[[\]]/g, "").trim().split(/\s+/).pop()?.slice(0, 2).toUpperCase() || "—";

function useNgoaiTuyen() {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener("online", f);
      window.addEventListener("offline", f);
      return () => {
        window.removeEventListener("online", f);
        window.removeEventListener("offline", f);
      };
    },
    () => !navigator.onLine,
    () => false,
  );
}

/** Giờ hiện tại, đi lại mỗi phút — «quá hạn bao lâu» và ngày đếm hàng cũ tính lại theo. */
function useBayGio() {
  const [bayGio, setBayGio] = useState(() => new Date().toISOString());
  useEffect(() => {
    const t = window.setInterval(() => setBayGio(new Date().toISOString()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return bayGio;
}

type Tai = { dang: boolean; loi: boolean; mang: boolean; hangDoi: DongLeadTruongNhom[] | null };

export default function BangDoi() {
  const dsHang = useDanhSachHang();
  const ngoaiTuyen = useNgoaiTuyen();
  const bayGio = useBayGio();

  // ——— Hàng đợi và đầu chủ qua API ———
  const [tai, setTai] = useState<Tai>({ dang: true, loi: false, mang: false, hangDoi: null });
  const [dauChu, setDauChu] = useState<DauChuCuaSan[]>([]);
  const doc = useCallback(async () => {
    const [hd, dc] = await Promise.all([layHangDoiTruongNhom(), layDauChuCuaSan()]);
    if (dc.ok) setDauChu(dc.items);
    // Lỗi đọc giữ lần đọc cuối: mất mạng thì số cũ còn hiện kèm dải.
    setTai((t) => (hd.ok ? { dang: false, loi: false, mang: false, hangDoi: hd.items } : { dang: false, loi: !hd.mang, mang: hd.mang, hangDoi: t.hangDoi }));
  }, []);
  useEffect(() => {
    let huy = false;
    void Promise.all([layHangDoiTruongNhom(), layDauChuCuaSan()]).then(([hd, dc]) => {
      if (huy) return;
      if (dc.ok) setDauChu(dc.items);
      setTai(hd.ok ? { dang: false, loi: false, mang: false, hangDoi: hd.items } : { dang: false, loi: !hd.mang, mang: hd.mang, hangDoi: null });
    });
    return () => {
      huy = true;
    };
  }, []);
  const thuLai = () => {
    setTai((t) => ({ ...t, dang: true }));
    void doc();
  };

  const tt = trangThaiTruongNhom({ dangTai: tai.dang, loiTai: tai.loi, matMang: ngoaiTuyen || tai.mang, hangDoi: tai.hangDoi, loiGiao: {} });

  // ——— Hàng cũ theo người, trên máy ———
  const homNay = ngayVN(bayGio);
  const hangCu = useMemo(() => hangCuTrenMay(dsHang, homNay), [dsHang, homNay]);
  const theoNguoi = dongTheoNguoi(hangCu.dong, dauChu);

  if (tt.trangThai === "dang-tai")
    return <ChoTai kieu="bang-dieu-khien" />;

  const so = tai.hangDoi ? baO(tai.hangDoi) : null;

  const metrics: MetricCard[] = [
    {
      id: "qua-han",
      label: "Lead quá hạn",
      value: so ? String(so.leadQuaHan) : "—",
      detail: "quá hạn nhận hay gọi",
      change: "Giao lại",
      variant: "destructive-light",
      icon: <ClockAlertIcon aria-hidden="true" />,
    },
    {
      id: "ngoai-le",
      label: "Ngoại lệ",
      value: so ? String(so.ngoaiLe) : "—",
      detail: "lead chưa chia được",
      change: "Chưa có người",
      variant: "warning-light",
      icon: <AlertTriangleIcon aria-hidden="true" />,
    },
    {
      id: "hang-cu",
      label: "Hàng cũ",
      value: String(hangCu.hangCu),
      detail: "căn cần gọi lại",
      change: "Toàn sàn",
      variant: "info-light",
      icon: <HistoryIcon aria-hidden="true" />,
    },
  ];
  const members: CrewMember[] = theoNguoi.map((d) => {
    const phanTram = Math.round(d.tiLeTuoi * 100);
    return {
      id: d.userId ?? "chua-co",
      name: d.ten,
      role: d.userId === null ? "Cần chia" : d.nghi ? "Đang nghỉ" : "Đầu chủ",
      initials: d.userId === null ? "—" : chuDau(d.ten),
      location: String(d.mo),
      coverage: phanTram,
      reliefHours: d.canGoiLai,
      notes: `${d.mo - d.canGoiLai}/${d.mo} căn`,
      status: trangThaiTuoi(phanTram),
    };
  });

  const loiTai = tt.trangThai === "loi";
  return (
    <div className="flex w-full min-w-0 flex-col gap-khung">
      {tt.trangThai === "mat-mang" ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={tt.chu} description="Số là lần đọc cuối — giao lại khi có mạng." />
          </FramePanel>
        </Frame>
      ) : null}
      {loiTai ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai
              kind="error"
              title={tt.chu}
              description={
                <span className="flex flex-col items-start gap-2">
                  <span>Bảng theo đầu chủ vẫn đọc từ máy.</span>
                  <Button size="sm" variant="outline" onClick={thuLai}>
                    <RotateCwIcon data-icon="inline-start" />
                    Thử lại
                  </Button>
                </span>
              }
            />
          </FramePanel>
        </Frame>
      ) : null}
      <CoverageDashboard
        metrics={metrics}
        members={members}
        coverage={{
          title: "Theo đầu chủ",
          description: "Căn đang mở, cần gọi lại và độ tươi",
          badge: `${members.length} đầu chủ`,
          member: "Đầu chủ",
          location: "Căn đang mở",
          coverage: "Tỉ lệ tươi",
          relief: "Cần gọi lại",
          status: "Trạng thái",
          empty: CHU_CHUA_CO_CAN,
          footnote: CHU_PHAM_VI,
        }}
      />
    </div>
  );
}
