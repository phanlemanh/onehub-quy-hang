"use client";

// Lối «Trong kho» (hàng 42, ADR-0019): bố cục «Bảng điều khiển» (ADR-0024) với khối đã có trong kho — ba ô số bằng
// stats-7 (`components/khoi/stats-7`), hàng đợi lead quá hạn và bảng theo đầu chủ bằng thành phần `data-grid` đã cài, mỗi
// vùng một Frame. Gỡ khi màn thật ra.
import { useTable, type ColumnDef } from "@tanstack/react-table";
import { AlertTriangleIcon, ClockAlertIcon, HistoryIcon } from "lucide-react";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import type { CardData } from "@/components/khoi/stats-7/data";
import { Stats } from "@/components/khoi/stats-7/stats";
import { Badge } from "@/components/reui/badge";
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from "@/components/reui/data-grid/data-grid";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Progress } from "@/components/ui/progress";
import { GiaoLai, useTruongNhom, type TruongNhom } from "./chung";
import { BADGE_LOAI, CHU_PHAM_VI, CHUA_CO_NGUOI, chuQuaHan, NHAN_LOAI, tenDauChu, type DongHangDoi } from "./mau";

type Feat = DataGridFeatures;
type DongNguoi = { id: string; ten: string; nghi: boolean; canMo: number; canGoiLai: number; tuoi: number };

const TABLE_LAYOUT = { rowBorder: true, headerBackground: true, width: "fixed" as const };
const TABLE_CLASS_NAMES = { edgeCell: "first:ps-3.5 last:pe-3.5" };
const KHONG_CHIA_TRANG = { pageIndex: 0, pageSize: 100 };

function oSo(tn: TruongNhom): CardData[] {
  return [
    {
      title: "Lead quá hạn",
      subtitle: "Đã về người, quá hạn nhận hay gọi",
      value: String(tn.so.leadQuaHan),
      valueColor: "text-destructive",
      badge: { color: "destructive-light", icon: <ClockAlertIcon aria-hidden="true" />, text: "Cần giao lại" },
      subtext: <span className="text-muted-foreground">Lâu nhất xếp trước</span>,
    },
    {
      title: "Ngoại lệ",
      subtitle: "Lead chưa chia được",
      value: String(tn.so.ngoaiLe),
      valueColor: "text-warning",
      badge: { color: "warning-light", icon: <AlertTriangleIcon aria-hidden="true" />, text: "Chưa có người" },
      subtext: <span className="text-muted-foreground">Chọn đầu chủ để chia</span>,
    },
    {
      title: "Hàng cũ",
      subtitle: "Căn cần gọi lại",
      value: String(tn.so.hangCu),
      valueColor: "text-info",
      badge: { color: "info-light", icon: <HistoryIcon aria-hidden="true" />, text: "Theo người" },
      subtext: <span className="text-muted-foreground">{CHU_PHAM_VI}</span>,
    },
  ];
}

function cotHangDoi(tn: TruongNhom): ColumnDef<Feat, DongHangDoi>[] {
  return [
    {
      id: "can",
      header: "Toà · căn",
      size: 200,
      cell: ({ row }) => (
        <span className="text-foreground text-sm font-medium">
          {row.original.toa} · {row.original.can ?? "chỉ biết toà"}
        </span>
      ),
    },
    { id: "loai", header: "Loại", size: 150, cell: ({ row }) => <Badge variant={BADGE_LOAI[row.original.loai]}>{NHAN_LOAI[row.original.loai]}</Badge> },
    { id: "dauChu", header: "Đầu chủ", size: 160, cell: ({ row }) => <span className="text-sm">{tenDauChu(tn.dauChu, row.original.dauChu)}</span> },
    { id: "quaHan", header: "Quá hạn", size: 130, cell: ({ row }) => <span className="text-destructive text-sm tabular-nums">{chuQuaHan(row.original.phut)}</span> },
    { id: "hanhDong", header: "", size: 110, cell: ({ row }) => <div className="flex justify-end"><GiaoLai dong={row.original} tn={tn} /></div> },
  ];
}

const COT_NGUOI: ColumnDef<Feat, DongNguoi>[] = [
  {
    id: "ten",
    header: "Đầu chủ",
    size: 200,
    cell: ({ row }) => (
      <span className="flex items-center gap-2 text-sm font-medium">
        {row.original.ten}
        {row.original.nghi && <Badge variant="warning-light">Đang nghỉ</Badge>}
      </span>
    ),
  },
  { id: "canMo", header: "Căn đang mở", size: 130, cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.canMo}</span> },
  { id: "canGoiLai", header: "Cần gọi lại", size: 130, cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.canGoiLai}</span> },
  {
    id: "tuoi",
    header: "Tỉ lệ tươi",
    size: 200,
    cell: ({ row }) => (
      <Progress value={row.original.tuoi} aria-label={`Tỉ lệ tươi ${row.original.tuoi}%`} className="items-center gap-2">
        <span className="text-sm tabular-nums">{row.original.tuoi}%</span>
      </Progress>
    ),
  },
];

export function TrongKho() {
  const tn = useTruongNhom();
  const nguoi: DongNguoi[] = [
    ...tn.dauChu.map((d) => ({ id: d.id, ten: d.ten, nghi: d.nghi, canMo: d.canMo, canGoiLai: d.canGoiLai, tuoi: d.tuoi })),
    { id: "chua-co", ten: "Chưa có người giữ", nghi: false, ...CHUA_CO_NGUOI },
  ];
  const bangDoi = useTable({
    features: dataGridFeatures,
    columns: cotHangDoi(tn),
    data: tn.hangDoi,
    getRowId: (d) => d.id,
    state: { pagination: KHONG_CHIA_TRANG },
  });
  const bangNguoi = useTable({ features: dataGridFeatures, columns: COT_NGUOI, data: nguoi, getRowId: (d) => d.id, state: { pagination: KHONG_CHIA_TRANG } });

  return (
    <BoCuc kieu="bang-dieu-khien" dauMan={<DauMan duongDan={[{ nhan: "Hôm nay", href: "/today" }, { nhan: "Trưởng nhóm" }]} tieuDe="Hôm nay" moTa="Lead quá hạn và hàng cũ của nhóm" />}>
      <Stats cards={oSo(tn)} />
      <Frame>
        <FrameHeader>
          <FrameTitle>Lead quá hạn và ngoại lệ</FrameTitle>
          <FrameDescription>{tn.hangDoi.length} lead cần giao lại</FrameDescription>
        </FrameHeader>
        <DataGrid table={bangDoi} recordCount={tn.hangDoi.length} i18n={{ labels: { empty: "Không lead nào quá hạn" } }} tableLayout={TABLE_LAYOUT} tableClassNames={TABLE_CLASS_NAMES}>
          <FramePanel className="p-0!">
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
          </FramePanel>
        </DataGrid>
      </Frame>
      <Frame>
        <FrameHeader>
          <FrameTitle>Theo đầu chủ</FrameTitle>
          <FrameDescription>Căn đang mở, cần gọi lại và độ tươi</FrameDescription>
        </FrameHeader>
        <DataGrid table={bangNguoi} recordCount={nguoi.length} tableLayout={TABLE_LAYOUT} tableClassNames={TABLE_CLASS_NAMES}>
          <FramePanel className="p-0!">
            <DataGridContainer>
              <DataGridTable />
            </DataGridContainer>
          </FramePanel>
        </DataGrid>
        <FrameFooter className="text-muted-foreground text-xs">{CHU_PHAM_VI}</FrameFooter>
      </Frame>
    </BoCuc>
  );
}
