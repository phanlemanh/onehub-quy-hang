"use client";

// Trao bảng sống cho lưới — React Compiler không theo dõi được (như khối gốc).
"use no memo";

/**
 * Bảng hàng trên máy tính (hàng 14) — chuyển thể `data-grid-view.tsx` của khối data-grid-editing-6 (ADR-0004, khối đích ở
 * `docs/design/vo-va-ia.md` §2): giữ lưới cuộn ảo, hàng lọc theo cột, chọn ô và chép; bỏ sửa ô, dán, kéo điền, hoàn tác,
 * đổi trạng thái hàng loạt (hàng 15, 16). Thêm nhóm Toà → Loại căn theo cách của `data-grid-grouping-2` và góc nhìn đã
 * lưu. Dữ liệu từ kho trên máy (hàng 13): lọc, nhóm, sắp không gọi mạng.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type ExpandedState,
  type Row,
  type SortingState,
  type TableState,
  type Updater,
} from "@tanstack/react-table";
import { elementScroll, observeElementOffset, observeElementRect } from "@tanstack/react-virtual";
import { FileSpreadsheetIcon, FilterIcon, LayoutListIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from "@/components/reui/data-grid/data-grid";
import { DataGridCellSelection } from "@/components/reui/data-grid/data-grid-cell-selection";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area";
import { DataGridTableFootRow, DataGridTableFootRowCell, DataGridTableRowExpand } from "@/components/reui/data-grid/data-grid-table";
import { DataGridTableVirtual } from "@/components/reui/data-grid/data-grid-table-virtual";
import { FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBoDongBo } from "@/lib/sync/react";
import { COT, STATUS_LABEL, chuCuaO, type Cot, type CotId, type DongBang } from "./cot";
import { useDanhMuc } from "./danh-muc";
import { chiMuc, ghepDanhMuc } from "./ghep-danh-muc";
import { CACH_XEM_MAC_DINH, daDoi, luuDe, type CachXem, type GocNhin } from "./goc-nhin";
import { khoTrinhDuyet, useDatPhamVi, useGocNhinCuaToi, useMoLuuGocNhin } from "./goc-nhin-react";
import { HangLocContext, HeaderStack, NutXoaLoc, OLoc } from "./hang-loc";
import { locDong, locSai, luaChon, sapDong, soOLocDangChay, type BoLocCot } from "./loc";
import { nhomDong, type CachNhom, type DongLuoi } from "./nhom";
import { ChonCot, ChonNhom, HopGocNhin, MenuGocNhin, type CheDoHop } from "./thanh-cong-cu";

const ROW_HEIGHT = { px: 37, className: "[&>td]:h-9.25" };

const TABLE_LAYOUT = {
  headerSticky: true,
  dense: true,
  cellSelection: true,
  cellBorder: true,
  columnsResizable: true,
  columnsPinnable: true,
} as const;

// Chỉ vẽ cột đang thấy (17 cột, màn 1366 thấy ~9): mỗi khung cuộn dựng ít ô hơn — máy đo E11.
const COT_AO = { enabled: true } as const;

const TABLE_CLASS_NAMES = {
  edgeCell: "first:ps-4 last:pe-4",
  base: "[&_tfoot_td]:bg-card [&_tfoot_td]:sticky [&_tfoot_td]:bottom-0 [&_tfoot_td]:z-30 [&_tfoot_td]:border-b",
  bodyRow: `${ROW_HEIGHT.className} [&:has(>[data-cell-selected])_[data-slot=row-number]]:text-foreground [&:has(>[data-cell-focused])_[data-slot=row-number]]:text-foreground`,
};

const I18N = {
  labels: {
    sortAscending: "Tăng dần",
    sortDescending: "Giảm dần",
    pinColumnStart: "Ghim bên trái",
    pinColumnEnd: "Ghim bên phải",
    moveColumnStart: "Dời sang trái",
    moveColumnEnd: "Dời sang phải",
    columnsMenu: "Cột",
    unpinColumn: (t: string) => `Bỏ ghim cột ${t}`,
    toggleColumns: "Ẩn hiện cột",
    expandRow: "Mở nhóm",
    collapseRow: "Gập nhóm",
    selectRow: "Chọn dòng",
    selectAll: "Chọn hết",
    loading: "Đang tải…",
    empty: "Không có hàng",
  },
};

const STATUS_BADGE: Record<DongBang["standardStatus"], "success-light" | "info-light" | "primary-light" | "warning-light" | "destructive-light"> = {
  Incomplete: "warning-light",
  Active: "success-light",
  Pending: "info-light",
  Closed: "primary-light",
  Hold: "warning-light",
  Withdrawn: "destructive-light",
};

type Feat = DataGridFeatures;
type DefCot = ColumnDef<Feat, DongLuoi>;

const getRowId = (d: DongLuoi) => d.id;
const getSubRows = (d: DongLuoi) => (d.kind === "nhom" ? d.subRows : undefined);

function selectGridState(state: TableState<Feat>) {
  const { cellSelection, ...rest } = state;
  void cellSelection;
  return rest;
}

function OCan({ d, cot }: { d: DongBang; cot: Cot }) {
  if (cot.id === "standardStatus") return <Badge variant={STATUS_BADGE[d.standardStatus]}>{STATUS_LABEL[d.standardStatus]}</Badge>;
  const chu = chuCuaO(d, cot.id);
  const trong = chu === "—";
  return (
    <span className={`flex min-w-0 items-center gap-1.5 text-sm ${cot.kind === "so" ? "justify-end tabular-nums" : ""} ${trong ? "text-muted-foreground" : ""}`}>
      <span className="truncate">{chu}</span>
      {cot.id === "confirmedAgeDays" && d.needsCallBack ? <Badge variant="warning-light">Cần gọi lại</Badge> : null}
    </span>
  );
}

function ONhom({ row, label, soCan }: { row: Row<Feat, DongLuoi>; label: string; soCan: number }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <DataGridTableRowExpand row={row} />
      <span className="truncate text-sm font-medium">{label}</span>
      <span className="text-muted-foreground text-xs tabular-nums">{soCan} căn</span>
    </span>
  );
}

function taoCot(cotNhanNhom: CotId): DefCot[] {
  return [
    {
      id: "row",
      header: () => <HeaderStack title={null} filter={<NutXoaLoc />} />,
      cell: ({ row }) =>
        row.original.kind === "can" ? (
          <span data-slot="row-number" className="text-muted-foreground block text-center text-xs tabular-nums">
            {row.original.stt}
          </span>
        ) : null,
      size: 48,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enableCellSelection: false,
      meta: { headerTitle: "Dòng" },
    },
    ...COT.map<DefCot>((cot) => ({
      id: cot.id,
      accessorFn: (d: DongLuoi) => (d.kind === "can" ? d.dong[cot.id] : null),
      header: ({ column }) => (
        <HeaderStack
          title={
            <div className={`flex min-w-0 ${cot.kind === "so" ? "-me-2 flex-1 justify-end" : ""}`}>
              <DataGridColumnHeader column={column} title={cot.label} />
            </div>
          }
          filter={<OLoc cot={cot} />}
        />
      ),
      cell: ({ row }) => {
        const d = row.original;
        if (d.kind === "nhom") return cot.id === cotNhanNhom ? <ONhom row={row} label={d.label} soCan={d.soCan} /> : null;
        return <OCan d={d.dong} cot={cot} />;
      },
      size: cot.id === cotNhanNhom ? Math.max(cot.size, 170) : cot.size,
      minSize: 80,
      meta: {
        headerTitle: cot.label,
        // Chỉ đọc ở hàng này: chép ra đúng chữ đang hiện, không ô nào ghi được.
        cellEdit: { editable: false, format: (_v: unknown, d: DongLuoi) => (d.kind === "can" ? chuCuaO(d.dong, cot.id) : d.label) },
      },
    })),
  ];
}

function useDanhSachTrenMay() {
  const { bd } = useBoDongBo();
  const dangKy = useCallback((f: () => void) => bd.dangKy(f), [bd]);
  const phienBan = useSyncExternalStore(dangKy, bd.phienBan, () => 0);
  const n = useMemo(() => {
    void phienBan;
    return bd.ngan();
  }, [bd, phienBan]);
  // Kho báo đổi cả khi chỉ trạng thái gửi đổi: dựng lại 5.000 dòng chỉ khi danh sách hay hàng chờ thật sự đổi (máy đo E11).
  const { listings, queue, lastAttempt } = n;
  const hang = useMemo(() => {
    void listings;
    void queue;
    return bd.danhSach();
  }, [bd, listings, queue]);
  return useMemo(
    () => ({ hang, daKeo: listings !== null, loiMang: lastAttempt === "mang", thuLai: () => void bd.thuNgay() }),
    [bd, hang, listings, lastAttempt],
  );
}

function DangTai() {
  return (
    <div className="flex flex-col gap-2 p-4" aria-busy="true" aria-label="Đang tải bảng hàng">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="ms-auto h-8 w-20" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-7 w-full" />
      ))}
    </div>
  );
}

function visibilityTu(cot: CotId[]): ColumnVisibilityState {
  return Object.fromEntries(COT.filter((c) => !cot.includes(c.id)).map((c) => [c.id, false]));
}

export function BangHang({ nguoi, san, gocNhinId }: { nguoi: string; san: string; gocNhinId?: string }) {
  useDatPhamVi(nguoi, san);
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const { hang, daKeo, loiMang, thuLai } = useDanhSachTrenMay();
  const danhMuc = useDanhMuc(san);
  const { ds: gocNhins } = useGocNhinCuaToi();
  const gocNhin: GocNhin | undefined = gocNhinId ? gocNhins.find((g) => g.id === gocNhinId) : undefined;

  const [loc, setLoc] = useState<BoLocCot>({});
  const [locMo, setLocMo] = useState(false);
  const [cot, setCot] = useState<CotId[]>(CACH_XEM_MAC_DINH.cot);
  const [sap, setSap] = useState<SortingState>([]);
  const [nhom, setNhom] = useState<CachNhom>(CACH_XEM_MAC_DINH.nhom);
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [hop, setHop] = useState<CheDoHop | null>(null);

  const apCachXem = useCallback((cx: CachXem) => {
    setLoc(cx.loc);
    setCot(cx.cot);
    setSap(cx.sap);
    setNhom(cx.nhom);
    setExpanded(true);
    setLocMo(Object.values(cx.loc).some(Boolean));
  }, []);

  // Mở một góc nhìn đã lưu: áp một lần khi nó có trên máy.
  const daAp = useRef<string | null>(null);
  useEffect(() => {
    if (gocNhin && daAp.current !== gocNhin.id) {
      daAp.current = gocNhin.id;
      apCachXem(gocNhin);
    }
  }, [gocNhin, apCachXem]);

  const moLuu = useCallback(() => setHop({ loai: "moi" }), []);
  useMoLuuGocNhin(moLuu);

  const idx = useMemo(() => chiMuc(danhMuc), [danhMuc]);
  const dong = useMemo(() => hang.map((l) => ghepDanhMuc(l, idx)), [hang, idx]);
  const daLoc = useMemo(() => sapDong(locDong(dong, loc), sap), [dong, loc, sap]);
  const cay = useMemo(() => nhomDong(daLoc, nhom), [daLoc, nhom]);
  const sai = useMemo(() => locSai(loc), [loc]);

  const cuonLenDau = useCallback(() => {
    const vp = frameRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
    if (vp instanceof HTMLElement) vp.scrollTop = 0;
  }, []);

  const datLoc = useCallback(
    (id: CotId, v: string) => {
      setLoc((l) => ({ ...l, [id]: v }));
      cuonLenDau();
    },
    [cuonLenDau],
  );
  const xoaLoc = useCallback(() => {
    setLoc({});
    cuonLenDau();
  }, [cuonLenDau]);

  const hangLoc = useMemo(
    () => ({ open: locMo, values: loc, invalid: sai, options: (id: CotId) => luaChon(dong, id), setValue: datLoc, clearAll: xoaLoc }),
    [locMo, loc, sai, dong, datLoc, xoaLoc],
  );

  const cotNhanNhom: CotId = cot.includes("buildingName") ? "buildingName" : (cot[0] ?? "unitNumber");
  const columns = useMemo(() => taoCot(cotNhanNhom), [cotNhanNhom]);
  const columnVisibility = useMemo(() => visibilityTu(cot), [cot]);

  const onSortingChange = useCallback(
    (u: Updater<SortingState>) => {
      setSap(u);
      cuonLenDau();
    },
    [cuonLenDau],
  );
  const onColumnVisibilityChange = useCallback((u: Updater<ColumnVisibilityState>) => {
    setCot((cu) => {
      const v = typeof u === "function" ? u(visibilityTu(cu)) : u;
      return COT.map((c) => c.id).filter((id) => v[id] !== false);
    });
  }, []);

  const tableOptions = useMemo(
    () => ({
      features: dataGridFeatures,
      columns,
      data: cay,
      getRowId,
      getSubRows,
      state: { sorting: sap, columnVisibility, expanded, columnPinning: { start: ["row", "buildingName", "unitNumber"].filter((id) => id === "row" || cot.includes(id as CotId)), end: [] } },
      onSortingChange,
      onColumnVisibilityChange,
      onExpandedChange: setExpanded,
      // Bảng tự lọc và sắp trên mọi dòng trước khi cuộn ảo cắt cửa sổ — TanStack chỉ vẽ thứ được đưa.
      manualSorting: true,
      manualFiltering: true,
      manualPagination: true,
      autoResetExpanded: false,
    }),
    [columns, cay, sap, columnVisibility, expanded, cot, onSortingChange, onColumnVisibilityChange],
  );
  const table = useTable(tableOptions, selectGridState);

  const virtualizerOptions = useMemo(
    () => ({ observeElementRect, observeElementOffset, scrollToFn: elementScroll, useFlushSync: false, getItemKey: (_i: number, r: Row<Feat, DongLuoi>) => r.id }),
    [],
  );

  const cachXem: CachXem = { loc, cot, sap, nhom };
  const doi = gocNhin ? daDoi(cachXem, gocNhin) : false;
  const soLoc = soOLocDangChay(loc);

  const footer =
    daLoc.length > 0 ? (
      <DataGridTableFootRow>
        <DataGridTableFootRowCell colSpan={cot.length + 1}>
          <span className="text-muted-foreground text-xs tabular-nums">
            <span className="text-foreground text-sm font-medium">{daLoc.length}</span> / {dong.length} căn
          </span>
        </DataGridTableFootRowCell>
      </DataGridTableFootRow>
    ) : null;

  const thanhCongCu = (
    <div className="flex flex-wrap items-center gap-2 px-(--frame-panel-header-px) py-(--frame-panel-header-py)">
      <MenuGocNhin
        ds={gocNhins}
        dangMo={gocNhin}
        daDoi={doi}
        onMo={(g) => router.push(`/inventory/views/${encodeURIComponent(g.id)}`)}
        onLuuMoi={() => setHop({ loai: "moi" })}
        onLuuDe={() => gocNhin && luuDe(khoTrinhDuyet, nguoi, san, gocNhin.id, cachXem, new Date().toISOString())}
        onDoiTen={() => gocNhin && setHop({ loai: "doi-ten", gocNhin })}
        onXoa={() => gocNhin && setHop({ loai: "xoa", gocNhin })}
      />
      {gocNhin && doi ? <Badge variant="warning-light">Đã đổi</Badge> : null}
      <span className="text-muted-foreground text-xs tabular-nums">
        <span className="text-foreground text-sm font-medium">{daLoc.length}</span> / {dong.length} căn
      </span>
      <div className="ms-auto flex flex-wrap items-center gap-1.5">
        <ChonNhom value={nhom} onChange={setNhom} />
        <Toggle variant="outline" pressed={locMo} onPressedChange={setLocMo}>
          <FilterIcon aria-hidden="true" />
          Lọc
          {soLoc > 0 ? (
            <Badge variant="primary-light" className="tabular-nums">
              {soLoc}
              <span className="sr-only">ô đang lọc</span>
            </Badge>
          ) : null}
        </Toggle>
        <ChonCot value={cot} onChange={setCot} />
      </div>
    </div>
  );

  let than: React.ReactNode;
  if (gocNhinId && !gocNhin && daKeo) {
    than = (
      <div className="p-4">
        <TrangThai
          kind="notice"
          title="Góc nhìn này không có trên máy này"
          description={
            <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/inventory")}>
              Về Bảng hàng
            </Button>
          }
        />
      </div>
    );
  } else if (!daKeo && loiMang) {
    than = (
      <div className="p-4">
        <TrangThai
          kind="error"
          title="Chưa tải được bảng hàng"
          description={
            <Button variant="outline" size="sm" className="mt-2" onClick={thuLai}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  } else if (!daKeo) {
    than = <DangTai />;
  } else if (dong.length === 0) {
    than = (
      <TrangThai
        kind="empty"
        icon={LayoutListIcon}
        title="Sàn chưa có hàng nào"
        description={
          <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/imports/new")}>
            <FileSpreadsheetIcon data-icon="inline-start" aria-hidden="true" />
            Nhập Excel
          </Button>
        }
      />
    );
  } else {
    than = (
      <>
        {thanhCongCu}
        <Separator />
        <DataGridContainer>
          <DataGridScrollArea className="h-[calc(100svh-13rem)] min-h-96">
            <DataGridTableVirtual estimateSize={ROW_HEIGHT.px} overscan={3} virtualizerOptions={virtualizerOptions} columnVirtualizerOptions={COT_AO} footerContent={footer} />
          </DataGridScrollArea>
          <DataGridCellSelection />
        </DataGridContainer>
      </>
    );
  }

  return (
    <TooltipProvider delay={200}>
      <HangLocContext.Provider value={hangLoc}>
        <DataGrid
          table={table}
          recordCount={daLoc.length}
          i18n={I18N}
          emptyMessage={
            <TrangThai
              kind="empty"
              icon={FilterIcon}
              title="Không căn nào khớp bộ lọc"
              description={
                <Button variant="outline" size="sm" className="mt-2" onClick={xoaLoc}>
                  Xoá lọc
                </Button>
              }
            />
          }
          tableLayout={TABLE_LAYOUT}
          tableClassNames={TABLE_CLASS_NAMES}
        >
          <FramePanel ref={frameRef} className="p-0">
            {than}
          </FramePanel>
        </DataGrid>
        {hop ? (
          <HopGocNhin
            cheDo={hop}
            nguoi={nguoi}
            san={san}
            cachXem={cachXem}
            onDong={() => setHop(null)}
            onDaLuu={(g) => router.push(`/inventory/views/${encodeURIComponent(g.id)}`)}
            onDaXoa={() => router.push("/inventory")}
          />
        ) : null}
      </HangLocContext.Provider>
    </TooltipProvider>
  );
}

