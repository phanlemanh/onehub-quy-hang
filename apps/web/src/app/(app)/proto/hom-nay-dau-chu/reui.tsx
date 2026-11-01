"use client";

// Lối «ReUI» (hàng 22, ADR-0019): theo khối đích `data-grid-grouping-1` (vo-va-ia §2, «Roadmap by Stage») — danh sách việc
// không đầu cột, nhóm dưới dòng hàng đợi gập được kèm số; cột Việc · Lý do · Giá · Hạn · Hành động. Dựng bằng thành phần
// `data-grid` đã cài với cây `getSubRows` + `rowExpandingFeature` như Bảng hàng; khung hẹp chỉ giữ cột Việc, lý do và
// nút xuống dưới tên. Gỡ khi màn thật ra.
import { useTable, type ColumnDef, type ExpandedState, type Row } from "@tanstack/react-table";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Badge } from "@/components/reui/badge";
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from "@/components/reui/data-grid/data-grid";
import { DataGridTable, DataGridTableRowExpand } from "@/components/reui/data-grid/data-grid-table";
import { Frame, FramePanel } from "@/components/reui/frame";
import { BADGE_NHOM, HetViec, NutViec, tieuDe, useHangDoi, type HangDoi } from "./hang-doi";
import { DAU_CHU, type NhomId, type Viec } from "./mau";

type Feat = DataGridFeatures;
type DongLuoi = { kind: "nhom"; id: NhomId; ten: string; so: number; subRows: DongLuoi[] } | { kind: "viec"; id: string; v: Viec };
type DefCot = ColumnDef<Feat, DongLuoi>;

const getRowId = (d: DongLuoi) => d.id;
const getSubRows = (d: DongLuoi) => (d.kind === "nhom" ? d.subRows : undefined);

const I18N = { labels: { expandRow: "Mở nhóm", collapseRow: "Gập nhóm", empty: "Không còn việc" } };
const TABLE_LAYOUT = { rowBorder: true, headerBackground: false, width: "fixed" as const };
const TABLE_CLASS_NAMES = { edgeCell: "first:ps-3.5 last:pe-3.5" };

const HIEN_HET: Record<string, boolean> = {};
const CHI_VIEC: Record<string, boolean> = { lyDo: false, gia: false, han: false, hanhDong: false };
const MQ = "(min-width: 64rem)";
function useRong() {
  return useSyncExternalStore(
    (f) => {
      const m = window.matchMedia(MQ);
      m.addEventListener("change", f);
      return () => m.removeEventListener("change", f);
    },
    () => window.matchMedia(MQ).matches,
    () => true,
  );
}

function LyDo({ v }: { v: Viec }) {
  if (v.kind === "can") return <span className="text-muted-foreground text-sm">{v.lyDo}</span>;
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <Badge variant="info-light">{v.nac}</Badge>
      <span className="text-muted-foreground">nhập {v.gioNhap}</span>
    </span>
  );
}

function Han({ v }: { v: Viec }) {
  if (v.kind === "can") return <span className="text-muted-foreground text-sm">—</span>;
  return <span className={`text-sm ${v.quaHan ? "text-destructive" : "text-foreground"}`}>{v.han}</span>;
}

function ONhom({ row, d }: { row: Row<Feat, DongLuoi>; d: Extract<DongLuoi, { kind: "nhom" }> }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <DataGridTableRowExpand row={row} />
      <span className="truncate text-sm font-medium">{d.ten}</span>
      <Badge variant={BADGE_NHOM[d.id]}>{d.so}</Badge>
    </span>
  );
}

function taoCot(hd: HangDoi, rong: boolean): DefCot[] {
  return [
    {
      id: "viec",
      header: "Việc",
      size: rong ? 280 : 300,
      cell: ({ row }) => {
        const d = row.original;
        if (d.kind === "nhom") return <ONhom row={row} d={d} />;
        const v = d.v;
        return (
          <div className="flex min-w-0 flex-col gap-0.5 ps-9 whitespace-normal">
            <span className="text-foreground text-sm font-medium">{tieuDe(v)}</span>
            <span className="text-muted-foreground text-sm">{v.kind === "can" ? v.loai : v.nhuCau}</span>
            {!rong && (
              <div className="flex flex-col gap-2 pt-1">
                <LyDo v={v} />
                <span className="text-sm">{v.gia}</span>
                {v.kind === "lead" && <Han v={v} />}
                <NutViec v={v} hd={hd} />
              </div>
            )}
          </div>
        );
      },
    },
    { id: "lyDo", header: "Lý do", size: 230, cell: ({ row }) => (row.original.kind === "viec" ? <LyDo v={row.original.v} /> : null) },
    {
      id: "gia",
      header: "Giá",
      size: 190,
      cell: ({ row }) => (row.original.kind === "viec" ? <span className="text-sm whitespace-normal">{row.original.v.gia}</span> : null),
    },
    { id: "han", header: "Hạn", size: 170, cell: ({ row }) => (row.original.kind === "viec" ? <Han v={row.original.v} /> : null) },
    {
      id: "hanhDong",
      header: "Hành động",
      size: 330,
      cell: ({ row }) => (row.original.kind === "viec" ? <NutViec v={row.original.v} hd={hd} className="justify-end" /> : null),
    },
  ];
}

export function ReUI() {
  const hd = useHangDoi();
  const rong = useRong();
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const cay = useMemo<DongLuoi[]>(
    () => hd.nhom.map((n) => ({ kind: "nhom", id: n.id, ten: n.ten, so: n.viec.length, subRows: n.viec.map((v) => ({ kind: "viec", id: v.id, v })) })),
    [hd.nhom],
  );
  const columns = useMemo(() => taoCot(hd, rong), [hd, rong]);
  const columnVisibility = rong ? HIEN_HET : CHI_VIEC;
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: cay,
    getRowId,
    getSubRows,
    state: { expanded, columnVisibility },
    onExpandedChange: setExpanded,
    autoResetExpanded: false,
  });

  return (
    <section aria-label="Hôm nay" className="flex w-full max-w-7xl flex-col">
      <Frame stacked className="w-full">
        <FramePanel className="flex items-center justify-between gap-2 p-3.5!">
          <h2 className="text-foreground text-base font-medium">Hôm nay</h2>
          <span className="text-muted-foreground text-sm">
            {DAU_CHU} · {hd.tong} việc
          </span>
        </FramePanel>
        {hd.tong === 0 ? (
          <FramePanel>
            <HetViec />
          </FramePanel>
        ) : (
          <DataGrid table={table} recordCount={hd.tong} i18n={I18N} tableLayout={TABLE_LAYOUT} tableClassNames={TABLE_CLASS_NAMES}>
            <FramePanel className="p-0!">
              <DataGridContainer>
                <DataGridTable renderHeader={false} />
              </DataGridContainer>
            </FramePanel>
          </DataGrid>
        )}
      </Frame>
    </section>
  );
}
