"use client";

import { useTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ContactIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { ChoTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from "@/components/reui/data-grid/data-grid";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { CHU, NHAN_LOAI, type DongLienHe } from "./lien-he";

// chuyển thể solution-crm-3 (ReUI Pro, chủ kho 05/11 chọn lối «Lai» ở trang ba lối hàng 103): lưới liên hệ trong Frame —
// ô người (chữ đầu + tên + dòng phụ), ô người giữ, cột đếm; bỏ Filters, chọn hàng loạt, Log Email, Add Contact (lọc loại và
// Lead ở cột thứ hai). Dưới md bảng thành danh sách thẻ một cột.

export type TrangThaiDs =
  | { kieu: "dang-tai" }
  | { kieu: "loi" }
  | { kieu: "nguoi-khac-giu"; holderName: string | null }
  | { kieu: "xong"; ds: DongLienHe[]; con: boolean };

const LOAI = ["Seller", "Landlord", "Buyer", "Tenant"] as const;
const TAT_CA = "tat-ca";
// width auto: bảng co theo cột kéo chia, cột Người co giãn — đủ bốn cột khi hồ sơ mở 38% ở 1440 (hàng khung-ho-so-lien-he).
const TABLE_LAYOUT = { headerSticky: true, dense: true, rowBorder: true, headerBackground: false, width: "auto" as const };

/** Chữ đầu của hai từ chữ cuối tên («[Tên] Chủ A» → «CA», bỏ từ số); không tên thì «?». */
export function chuDau(ten: string | null): string {
  const tu = (ten ?? "").replace(/[[\]]/g, "").trim().split(/\s+/).filter((t) => /^\p{L}/u.test(t));
  if (!tu.length) return "?";
  return tu
    .slice(-2)
    .map((t) => t[0]!.toLocaleUpperCase("vi"))
    .join("");
}

const tenCua = (d: DongLienHe) => d.name ?? "[Chưa có tên]";
const loaiCua = (d: DongLienHe) => d.contactTypes.map((t) => NHAN_LOAI[t] ?? t).join(" · ");

function ONguoi({ d, onChon }: { d: DongLienHe; onChon: (id: string) => void }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback>{chuDau(d.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <Button variant="link" size="sm" className="text-foreground h-auto min-w-0 truncate p-0 font-medium" onClick={(e) => (e.stopPropagation(), onChon(d.id))}>
            {tenCua(d)}
          </Button>
          {d.status === "lead" ? <Badge variant="warning-light">{CHU.lead}</Badge> : null}
        </div>
        <div className="text-muted-foreground line-clamp-1 text-xs">{loaiCua(d) || "—"}</div>
      </div>
    </div>
  );
}

function ONguoiGiu({ ten }: { ten: string | null }) {
  if (!ten) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-6 shrink-0">
        <AvatarFallback className="text-xs">{chuDau(ten)}</AvatarFallback>
      </Avatar>
      <span className="text-foreground min-w-0 truncate text-sm">{ten}</span>
    </div>
  );
}

export function taoCot(onChon: (id: string) => void): ColumnDef<DataGridFeatures, DongLienHe>[] {
  return [
    {
      id: "ten",
      accessorFn: tenCua,
      header: ({ column }) => <DataGridColumnHeader column={column} title="Tên" />,
      cell: ({ row }) => <ONguoi d={row.original} onChon={onChon} />,
      size: 220,
    },
    {
      id: "nguoiGiu",
      accessorFn: (d) => d.holderName ?? "",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Người giữ" />,
      cell: ({ row }) => <ONguoiGiu ten={row.original.holderName} />,
      size: 180,
    },
    {
      id: "coHoi",
      accessorKey: "openOpportunities",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Cơ hội mở" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.openOpportunities}</span>,
      size: 100,
    },
    {
      id: "can",
      accessorKey: "listingCount",
      header: ({ column }) => <DataGridColumnHeader column={column} title="Căn" />,
      cell: ({ row }) => <span className="tabular-nums">{row.original.listingCount}</span>,
      size: 70,
    },
  ];
}

/** Lưới trên máy tính; sắp xếp chỉ mở khi đã tải hết, để thứ tự không lừa người xem khi còn trang chưa tải. */
function LuoiLienHe({ ds, con, chon, onChon }: { ds: DongLienHe[]; con: boolean; chon: string | null; onChon: (id: string) => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features: dataGridFeatures,
    columns: taoCot(onChon),
    data: ds,
    getRowId: (d) => d.id,
    // Dòng đang mở hồ sơ mang dấu chọn của lưới (data-state="selected"), như Bảng hàng.
    enableRowSelection: chon !== null,
    state: { sorting: con ? [] : sorting, rowSelection: chon ? { [chon]: true } : {}, pagination: { pageIndex: 0, pageSize: Math.max(ds.length, 1) } },
    enableSorting: !con,
    onSortingChange: setSorting,
  });
  return (
    <DataGrid table={table} recordCount={ds.length} onRowClick={(d) => onChon(d.id)} tableLayout={TABLE_LAYOUT}>
      {/* Lưới lấp phần còn lại của khung, vùng cuộn bên trong: tên cột dính đầu, ô tìm đứng yên (như Bảng hàng). */}
      <DataGridContainer className="min-h-0 flex-1 [&>div:first-child]:h-full">
        <DataGridScrollArea className="h-full">
          <DataGridTable />
        </DataGridScrollArea>
      </DataGridContainer>
    </DataGrid>
  );
}

/** Danh sách thẻ một cột dưới md. */
function TheLienHe({ ds, onChon }: { ds: DongLienHe[]; onChon: (id: string) => void }) {
  return (
    <ItemGroup className="gap-2 p-3">
      {ds.map((d) => (
        <Item key={d.id} variant="outline" size="sm" onClick={() => onChon(d.id)} className="cursor-pointer">
          <ItemMedia>
            <Avatar className="size-8">
              <AvatarFallback>{chuDau(d.name)}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="min-w-0">
              <Button variant="link" size="sm" className="text-foreground h-auto min-w-0 truncate p-0 font-medium" onClick={(e) => (e.stopPropagation(), onChon(d.id))}>
                {tenCua(d)}
              </Button>
              {d.status === "lead" ? <Badge variant="warning-light">{CHU.lead}</Badge> : null}
            </ItemTitle>
            <ItemDescription className="line-clamp-2">
              {[loaiCua(d), d.holderName, `${d.openOpportunities} cơ hội · ${d.listingCount} căn`].filter(Boolean).join(" · ")}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

/** Thân danh sách: ô tìm (và chọn loại trên điện thoại), lưới; trống · không khớp · người khác giữ · lỗi đi qua `TrangThai`. */
export function DanhSachLienHe({
  tt,
  q,
  loai,
  chon,
  onQ,
  onLoai,
  onChon,
  onThem,
  onThuLai,
}: {
  tt: TrangThaiDs;
  q: string;
  loai: string;
  chon: string | null;
  onQ: (q: string) => void;
  onLoai: (l: string) => void;
  onChon: (id: string) => void;
  onThem: () => void;
  onThuLai: () => void;
}) {
  let than;
  if (tt.kieu === "dang-tai") than = <ChoTai kieu="danh-sach-chi-tiet" />;
  else if (tt.kieu === "loi")
    than = (
      <TrangThai
        kind="error"
        title={CHU.loi}
        hanhDong={
          <Button size="sm" variant="outline" onClick={onThuLai}>
            {CHU.thuLai}
          </Button>
        }
      />
    );
  else if (tt.kieu === "nguoi-khac-giu") than = <TrangThai kind="notice" title={CHU.nguoiKhacGiu(tt.holderName)} />;
  else if (!tt.ds.length)
    than = q || loai ? <TrangThai kind="empty" icon={SearchIcon} title={CHU.khongKhop(q || NHAN_LOAI[loai] || loai)} /> : <TrangThai kind="empty" icon={ContactIcon} title={CHU.trong} description={CHU.trongMoTa} />;
  else
    than = (
      <>
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <LuoiLienHe ds={tt.ds} con={tt.con} chon={chon} onChon={onChon} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
          <TheLienHe ds={tt.ds} onChon={onChon} />
        </div>
        {tt.con ? (
          <div className="flex justify-center p-3">
            <Button size="sm" variant="outline" onClick={onThem}>
              {CHU.xemThem}
            </Button>
          </div>
        ) : null}
      </>
    );
  const dem = tt.kieu === "xong" ? `${tt.ds.length}${tt.con ? "+" : ""} liên hệ` : null;
  return (
    <Frame spacing="sm" className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <FrameTitle>{CHU.tieuDe}</FrameTitle>
          {dem ? <FrameDescription className="text-xs">{dem}</FrameDescription> : null}
        </div>
      </FrameHeader>
      <FramePanel className="flex min-h-0 flex-1 flex-col p-0 shadow-none">
        <div className="flex flex-wrap items-center gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-2.5 left-2 size-4" aria-hidden="true" />
            <Input className="pl-8" placeholder={CHU.timGoi} value={q} onChange={(e) => onQ(e.target.value)} aria-label={CHU.timGoi} />
          </div>
          <div className="md:hidden">
            <Select value={loai || TAT_CA} onValueChange={(v) => onLoai(v && v !== TAT_CA ? String(v) : "")}>
              <SelectTrigger aria-label="Loại">
                <SelectValue>{(v: string) => (v === TAT_CA ? "Mọi loại" : (NHAN_LOAI[v] ?? v))}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value={TAT_CA}>Mọi loại</SelectItem>
                {LOAI.map((l) => (
                  <SelectItem key={l} value={l}>
                    {NHAN_LOAI[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        {than}
      </FramePanel>
    </Frame>
  );
}
