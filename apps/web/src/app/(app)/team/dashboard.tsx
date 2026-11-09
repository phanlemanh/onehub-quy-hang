"use client";

// Đội (hồ sơ hom-nay-mot-danh-sach-viec; khối dashboard-6 của hàng 42 dời từ Hôm nay): dải ba ô số và bảng theo đầu chủ, bỏ
// biểu đồ. Việc giao lại ở Hôm nay. Hàng đợi và đầu chủ đọc qua API (`/api/v1/team/*`); hàng cũ theo người đếm trên căn của
// kho trên máy, chỉ căn toàn sàn.
import { AlertTriangleIcon, ClockAlertIcon, HistoryIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ChoTai } from "@/components/bo-cuc";
import { CoverageDashboard } from "@/components/khoi/dashboard-6/coverage-dashboard";
import type { CrewMember, CrewStatus, MetricCard } from "@/components/khoi/dashboard-6/data";
import { Frame, FramePanel } from "@/components/reui/frame";
import { BaoLoiVung, TrangThai } from "@/components/trang-thai";
import { useDanhSachHang } from "@/lib/sync/react";

import { layDauChuCuaSan, layHangDoiTruongNhom, type DauChuCuaSan, type DongLeadTruongNhom } from "../today/nguon";
import { docKetQuaCoThuLai } from "../today/viec/doc-nguon";
import { useKhiCoMangLai, useNgoaiTuyen } from "../today/viec/mang";
import { baO, baoLoiDoi, CHU_CHUA_CO_CAN, CHU_PHAM_VI, dongTheoNguoi, hangCuTrenMay, kyHieuDauChu, moTaMatMang, ngayVN, trangThaiTruongNhom } from "./trang-thai";

const trangThaiTuoi = (phanTram: number): CrewStatus => (phanTram >= 80 ? "tuoi" : phanTram >= 60 ? "chu-y" : "cu");

/** Giờ hiện tại, đi lại mỗi phút — «quá hạn bao lâu» và ngày đếm hàng cũ tính lại theo. */
function useBayGio() {
  const [bayGio, setBayGio] = useState(() => new Date().toISOString());
  useEffect(() => {
    const t = window.setInterval(() => setBayGio(new Date().toISOString()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return bayGio;
}

type Tai = { dang: boolean; loiHangDoi: boolean; loiDauChu: boolean; hangDoi: DongLeadTruongNhom[] | null; dauChu: DauChuCuaSan[] };

const docCaHai = () => Promise.all([docKetQuaCoThuLai(() => layHangDoiTruongNhom()), docKetQuaCoThuLai(() => layDauChuCuaSan())]);

/** Áp một lượt đọc: nguồn hỏng giữ lần đọc cuối. */
const apLanDoc = (t: Tai, [hd, dc]: Awaited<ReturnType<typeof docCaHai>>): Tai => ({ dang: false, loiHangDoi: hd === null, loiDauChu: dc === null, hangDoi: hd ?? t.hangDoi, dauChu: dc ?? t.dauChu });

export default function BangDoi() {
  const dsHang = useDanhSachHang();
  const ngoaiTuyen = useNgoaiTuyen();
  const bayGio = useBayGio();

  // ——— Hàng đợi và đầu chủ qua API ———
  const [tai, setTai] = useState<Tai>({ dang: true, loiHangDoi: false, loiDauChu: false, hangDoi: null, dauChu: [] });
  useEffect(() => {
    let huy = false;
    void docCaHai().then((kq) => {
      if (!huy) setTai((t) => apLanDoc(t, kq));
    });
    return () => {
      huy = true;
    };
  }, []);
  // Đang đọc lại thì không còn câu lỗi; đã có số thì giữ số, không dựng lại khung chờ.
  const docLai = () => {
    setTai((t) => ({ ...t, dang: t.hangDoi === null, loiHangDoi: false, loiDauChu: false }));
    void docCaHai().then((kq) => setTai((t) => apLanDoc(t, kq)));
  };
  // Có mạng lại luôn đọc: màn đang có số từ trước lúc mất mạng thì không có cờ lỗi nào mà số đã cũ.
  useKhiCoMangLai(docLai);

  // Mất mạng chỉ theo trình duyệt: lời gọi không tới mà trình duyệt còn báo có mạng là lỗi đọc, có «Thử lại».
  const tt = trangThaiTruongNhom({ dangTai: tai.dang, loiTai: tai.loiHangDoi, matMang: ngoaiTuyen, hangDoi: tai.hangDoi, loiGiao: {} });
  const cauLoi = ngoaiTuyen ? null : baoLoiDoi({ hangDoi: tai.loiHangDoi, dauChu: tai.loiDauChu });

  // ——— Hàng cũ theo người, trên máy ———
  const homNay = ngayVN(bayGio);
  const hangCu = useMemo(() => hangCuTrenMay(dsHang, homNay), [dsHang, homNay]);
  const theoNguoi = dongTheoNguoi(hangCu.dong, tai.dauChu);

  if (tt.trangThai === "dang-tai")
    return <ChoTai kieu="bang-dieu-khien" />;

  const so = tai.hangDoi ? baO(tai.hangDoi) : null;

  const metrics: MetricCard[] = [
    {
      id: "qua-han",
      label: "Lead quá hạn",
      value: so ? String(so.leadQuaHan) : "—",
      detail: "quá hạn nhận hay gọi",
      change: ngoaiTuyen ? "Chờ có mạng" : "Giao lại",
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
      initials: d.userId === null ? "—" : kyHieuDauChu(d.ten),
      location: String(d.mo),
      coverage: phanTram,
      reliefHours: d.canGoiLai,
      notes: `${d.mo - d.canGoiLai}/${d.mo} căn`,
      status: trangThaiTuoi(phanTram),
    };
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-khung">
      {tt.trangThai === "mat-mang" ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={tt.chu} description={moTaMatMang(tai.hangDoi)} />
          </FramePanel>
        </Frame>
      ) : null}
      {cauLoi ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <BaoLoiVung title={cauLoi} description={tai.loiHangDoi ? "Bảng theo đầu chủ vẫn đọc từ máy." : "Số căn trong bảng vẫn đúng."} onThuLai={docLai} />
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
