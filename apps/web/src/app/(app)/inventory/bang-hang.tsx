"use client";

// Trao bảng sống cho lưới — React Compiler không theo dõi được (như khối gốc).
"use no memo";

/**
 * Bảng hàng trên máy tính (hàng 14) — chuyển thể `data-grid-view.tsx` của khối data-grid-editing-6 (ADR-0004, khối đích ở
 * `docs/design/vo-va-ia.md` §2): giữ lưới cuộn ảo, hàng lọc theo cột, chọn ô và chép; sửa trên ô ba cột Giá, Phí, Trạng
 * thái qua `cell-edit/` (hàng 15); tích căn rồi đổi trạng thái, đánh dấu đã gọi hàng loạt qua `bulk/` (hàng 16); bỏ dán, kéo điền. Thêm nhóm Toà → Loại căn theo cách của `data-grid-grouping-2` và góc nhìn đã
 * lưu. Dữ liệu từ kho trên máy (hàng 13): lọc, nhóm, sắp không gọi mạng.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { FileSpreadsheetIcon, FileUpIcon, FilterIcon, LayoutListIcon } from "lucide-react";
import { navigationFor } from "@quy-hang/core";

import { ChoTai } from "@/components/bo-cuc/cho-tai";
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
import { Toggle } from "@/components/ui/toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBoDongBo } from "@/lib/sync/react";
import type { TuVung } from "@quy-hang/core/labels";
import { COT, chuCuaO, mauTrangThai, nhanCot, tatCaCot, type Cot, type CotId, type DongBang } from "./cot";
import { cotTruongRieng, giuCotRieng, laCotRieng } from "./truong-rieng";
import { useTuVung } from "./tu-vung";
import { useDanhBaDauChu } from "./danh-ba";
import { useCanNgoaiKhu, useDanhMuc } from "./danh-muc";
import { chiMuc, ghepDanhMuc } from "./ghep-danh-muc";
import { cotHienTuBoCot, type BoCot } from "./loai-hinh";
import { CACH_XEM_MAC_DINH, daDoi, luuDe, type CachXem, type GocNhin } from "./goc-nhin";
import { khoTrinhDuyet, useDatPhamVi, useGocNhinCuaToi, useMoLuuGocNhin } from "./goc-nhin-react";
import { HangLocContext, HeaderStack, NutXoaLoc, OLoc } from "./hang-loc";
import { locDong, locSai, luaChon, sapDong, tinhBoCot, soOLocDangChay, type BoLocCot } from "./loc";
import { nhomDong, type CachNhom, type DongLuoi } from "./nhom";
import { ChonCot, ChonNhom, HopGocNhin, MenuGocNhin, type CheDoHop } from "./thanh-cong-cu";
import { COT_SUA, useSuaTrenO } from "./cell-edit/tren-o";
import { OTich, OTichHet, TichProvider, useSuaHangLoat } from "./bulk/thanh";
import { HopThoaiXuat, type MoXuat } from "./phat-hang/hop-thoai";
import { moHopVoiMau } from "./mau-xuat-san";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { tapCanXuat } from "./phat-hang/tap-can";

// Dán, xoá, kéo điền nhiều ô là hàng sau (hàng 16 chỉ tích căn): lưới gửi lô ghi thì bỏ qua — chỉ trình sửa trên ô ghi.
const BO_QUA_GHI_LOAT = () => undefined;

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

/** Ngày theo máy người xuất (YYYY-MM-DD) — gọi lúc bấm, không lúc dựng. */
const homNay = () => new Date().toLocaleDateString("sv-SE");

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
  const tv = useTuVung();
  const chu = chuCuaO(d, cot.id, tv);
  // Nhãn riêng của sàn mang màu của trạng thái neo (hàng 46): màu theo trạng thái chuẩn, chữ theo nhãn của căn.
  if (cot.id === "standardStatus") return <Badge variant={mauTrangThai(d)}>{chu}</Badge>;
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

function taoCot(cotNhanNhom: CotId, tv: TuVung, viTri: string): DefCot[] {
  return [
    {
      id: "row",
      // Ô tích của sửa hàng loạt (hàng 16) đứng cạnh số dòng.
      header: () => <HeaderStack title={<OTichHet />} filter={<NutXoaLoc />} />,
      cell: ({ row }) =>
        row.original.kind === "can" ? (
          <span className="flex items-center gap-1.5">
            <OTich id={row.original.dong.id} />
            <span data-slot="row-number" className="text-muted-foreground text-xs tabular-nums">
              {row.original.stt}
            </span>
          </span>
        ) : null,
      size: 72,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enableCellSelection: false,
      meta: { headerTitle: "Dòng" },
    },
    ...tatCaCot(tv).map<DefCot>((cot) => {
      // Cột vị trí (Hỏi-1 hàng 79): «Vị trí» khi dòng đã lọc có loại hình khác căn hộ; còn lại tên của sàn hay «Toà».
      const tieuDe = cot.id === "buildingName" && viTri !== "Toà" ? viTri : nhanCot(cot, tv);
      return {
      id: cot.id,
      accessorFn: (d: DongLuoi) => (d.kind === "can" ? d.dong[cot.id] : null),
      header: ({ column }) => (
        <HeaderStack
          title={
            <div className={`flex min-w-0 ${cot.kind === "so" ? "-me-2 flex-1 justify-end" : ""}`}>
              <DataGridColumnHeader column={column} title={tieuDe} />
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
        headerTitle: tieuDe,
        // Chép ra đúng chữ đang hiện. Ba cột Giá, Phí, Trạng thái mở trình sửa trên ô (hàng 15) qua onCellEditRequest.
        cellEdit: {
          editable: COT_SUA.has(cot.id) || laCotRieng(cot.id) ? (d: DongLuoi) => d.kind === "can" : false,
          format: (_v: unknown, d: DongLuoi) => (d.kind === "can" ? chuCuaO(d.dong, cot.id, tv) : d.label),
        },
      },
    };
    }),
  ];
}

// Kho trên máy chỉ có ở trình duyệt: lượt dựng trên máy chủ và lượt hydrat đầu cùng thấy «chưa kéo» (khung đang tải) để
// khỏi lệch hydration — dữ liệu trên máy hiện ngay lượt dựng sau (va-bang-hang-hydration, nếp của units/call/push/ep-gia.tsx).
const khongDangKy = () => () => {};
const RONG: never[] = [];

function useDanhSachTrenMay() {
  const { bd } = useBoDongBo();
  const oMay = useSyncExternalStore(khongDangKy, () => true, () => false);
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
    () =>
      oMay
        ? { hang, daKeo: listings !== null, loiMang: lastAttempt === "mang", thuLai: () => void bd.thuNgay() }
        : { hang: RONG, daKeo: false, loiMang: false, thuLai: () => void bd.thuNgay() },
    [oMay, bd, hang, listings, lastAttempt],
  );
}

/** Chờ lượt kéo đầu: khung chờ hình lưới của bố cục (chỗ duy nhất dựng Skeleton), trong khung của bảng. */
function DangTai() {
  return (
    <div className="p-4">
      <ChoTai kieu="tran" />
    </div>
  );
}

function visibilityTu(cot: CotId[], tv?: TuVung | null): ColumnVisibilityState {
  return Object.fromEntries(tatCaCot(tv).filter((c) => !cot.includes(c.id)).map((c) => [c.id, false]));
}

/** `dangMo` / `onMoCan` (hàng 17): hồ sơ căn đang mở ở cột phải — dòng của nó được đánh dấu; bấm dòng căn thì mở hồ sơ. */
export function BangHang({
  nguoi,
  san,
  gocNhinId,
  dangMo = null,
  onMoCan,
  vai = [],
  tenSan = "",
}: {
  nguoi: string;
  san: string;
  gocNhinId?: string;
  dangMo?: string | null;
  onMoCan?: (d: DongBang) => void;
  /** Vai ở sàn đang làm — nút «Xuất bảng hàng» theo `navigationFor(vai).actions` (hàng 43). */
  vai?: readonly string[];
  /** Tên sàn — dòng đầu bài Facebook của Xuất bảng hàng. */
  tenSan?: string;
}) {
  useDatPhamVi(nguoi, san);
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const { hang, daKeo, loiMang, thuLai } = useDanhSachTrenMay();
  const suaTrenO = useSuaTrenO();
  const danhMuc = useDanhMuc(san);
  const ngoaiKhu = useCanNgoaiKhu(san);
  const { ds: gocNhins } = useGocNhinCuaToi();
  const gocNhin: GocNhin | undefined = gocNhinId ? gocNhins.find((g) => g.id === gocNhinId) : undefined;

  const [loc, setLoc] = useState<BoLocCot>({});
  const [locMo, setLocMo] = useState(false);
  const tv = useTuVung();
  // Cột trường riêng còn sống của sàn (hàng 47) hiện mặc định sau các cột chuẩn.
  const [cot, setCot] = useState<CotId[]>(() => [...CACH_XEM_MAC_DINH.cot, ...cotTruongRieng(tv.truongRieng).map((c) => c.id)]);
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
      // Bộ trường chưa tải thì giữ nguyên cột và lọc custom của góc nhìn; đã tải thì bỏ trường đã bỏ (hàng 47).
      apCachXem(giuCotRieng(gocNhin, tv.truongRieng));
    }
  }, [gocNhin, apCachXem, tv.truongRieng]);

  const moLuu = useCallback(() => setHop({ loai: "moi" }), []);
  useMoLuuGocNhin(moLuu);

  const idx = useMemo(() => chiMuc(danhMuc, ngoaiKhu), [danhMuc, ngoaiKhu]);
  // Cột «Đầu chủ» (hàng 105): người giữ của hàng đối với danh bạ đầu chủ của sàn; lượt kéo đổi người giữ thì ô đổi theo.
  const nguoiGiu = useMemo(() => hang.map((l) => l.listAgentKey), [hang]);
  // Hàng 48 (Ngoài-10 của 105): đọc danh bạ hỏng thì báo kèm «Thử lại», không nuốt lỗi.
  const { danhBa, loi: loiDanhBa, thuLai: docLaiDanhBa } = useDanhBaDauChu(san, nguoiGiu);
  const dong = useMemo(() => hang.map((l) => ghepDanhMuc(l, idx, danhBa)), [hang, idx, danhBa]);
  const daLoc = useMemo(() => sapDong(locDong(dong, loc), sap, tv), [dong, loc, sap, tv]);
  const loat = useSuaHangLoat(dong, daLoc);
  const cay = useMemo(() => nhomDong(daLoc, nhom, tv), [daLoc, nhom, tv]);
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
    () => ({ open: locMo, values: loc, invalid: sai, options: (id: CotId) => luaChon(dong, id, tv), setValue: datLoc, clearAll: xoaLoc }),
    [locMo, loc, sai, dong, datLoc, xoaLoc, tv],
  );

  // Hàng 79: cột hiện = cột người bật trừ cột mà không loại hình nào trong dòng đã lọc dùng; cột Loại hình chỉ khi sàn có
  // hàng khác căn hộ. `cot` giữ lựa chọn của người — cột bị loại hình ẩn hiện lại khi lọc đổi.
  // Lọc ra rỗng: bộ cột giữ như lần gần nhất còn dòng, để cột và ô đang gõ ở nguyên (tinhBoCot).
  const [giuBoCot, setGiuBoCot] = useState<BoCot | null>(null);
  const { boCot, giu } = useMemo(() => tinhBoCot(giuBoCot, dong, daLoc, loc), [giuBoCot, dong, daLoc, loc]);
  if (JSON.stringify(giu) !== JSON.stringify(giuBoCot)) setGiuBoCot(giu);
  const cotHien = useMemo(() => cotHienTuBoCot(cot, boCot, dong), [cot, boCot, dong]);
  const viTri = boCot.viTri;
  const cotNhanNhom: CotId = cotHien.includes("buildingName") ? "buildingName" : (cotHien[0] ?? "unitNumber");
  const columns = useMemo(() => taoCot(cotNhanNhom, tv, viTri), [cotNhanNhom, tv, viTri]);
  const columnVisibility = useMemo(() => visibilityTu(cotHien, tv), [cotHien, tv]);

  const onSortingChange = useCallback(
    (u: Updater<SortingState>) => {
      setSap(u);
      cuonLenDau();
    },
    [cuonLenDau],
  );
  const onColumnVisibilityChange = useCallback((u: Updater<ColumnVisibilityState>) => {
    setCot((cu) => {
      const v = typeof u === "function" ? u(visibilityTu(cu.filter((id) => cotHien.includes(id)), tv)) : u;
      // Cột đang bị loại hình ẩn giữ đúng lựa chọn cũ của người — bật tắt cột khác không làm mất nó.
      return tatCaCot(tv).map((c) => c.id).filter((id) => (cotHien.includes(id) ? v[id] !== false : cu.includes(id)));
    });
  }, [tv, cotHien]);

  const dongDangMo = useMemo<Record<string, true>>(() => (dangMo ? { [dangMo]: true } : {}), [dangMo]);
  const tableOptions = useMemo(
    () => ({
      features: dataGridFeatures,
      columns,
      data: cay,
      getRowId,
      getSubRows,
      // Hàng 17: chọn dòng chỉ để đánh dấu hồ sơ đang mở — không có ô tích.
      enableRowSelection: dangMo !== null,
      state: { rowSelection: dongDangMo, sorting: sap, columnVisibility, expanded, columnPinning: { start: ["row", "buildingName", "unitNumber"].filter((id) => id === "row" || cotHien.includes(id as CotId)), end: [] } },
      onSortingChange,
      onColumnVisibilityChange,
      onExpandedChange: setExpanded,
      // Bảng tự lọc và sắp trên mọi dòng trước khi cuộn ảo cắt cửa sổ — TanStack chỉ vẽ thứ được đưa.
      manualSorting: true,
      manualFiltering: true,
      manualPagination: true,
      autoResetExpanded: false,
    }),
    [columns, cay, sap, columnVisibility, expanded, cotHien, onSortingChange, onColumnVisibilityChange, dangMo, dongDangMo],
  );
  const table = useTable(tableOptions, selectGridState);

  const virtualizerOptions = useMemo(
    () => ({ observeElementRect, observeElementOffset, scrollToFn: elementScroll, useFlushSync: false, getItemKey: (_i: number, r: Row<Feat, DongLuoi>) => r.id }),
    [],
  );

  const cachXem: CachXem = { loc, cot, sap, nhom };

  // Xuất bảng hàng (hàng 43): căn đang tích trong các căn đang hiện, không thì mọi căn đang hiện — theo thứ tự góc nhìn.
  const coXuat = navigationFor(vai).actions.includes("export");
  const tapXuat = useMemo(() => tapCanXuat(daLoc, loat.ctx.tich), [daLoc, loat.ctx.tich]);
  const [moXuat, setMoXuat] = useState<MoXuat | null>(null);
  const moHopXuat = useCallback(() => {
    if (tapXuat.tat) return;
    // Mẫu của sàn (hàng mau-bang-hang-va-bai) đọc một lần lúc mở hộp; đọc lỗi thì hộp vẫn mở, theo góc nhìn.
    const coDinh = { dong: tapXuat.dong, cot: cotHien, today: homNay(), tenSan, tenNguoiGui: "", tuVung: tv };
    void moHopVoiMau(coDinh, (duong) => goiFetch("GET", duong)).then(setMoXuat);
  }, [tapXuat, cotHien, tenSan, setMoXuat, tv]);
  // Menu Tạo trỏ `/exports/new` → `/inventory?phat-hang=1`: mở hộp thoại một lần với cách xem đang có.
  const q = useSearchParams();
  const daMoTuMenu = useRef(false);
  useEffect(() => {
    if (daMoTuMenu.current || !coXuat || !daKeo || q.get("phat-hang") !== "1") return;
    daMoTuMenu.current = true;
    moHopXuat();
    const m = new URLSearchParams(q.toString());
    m.delete("phat-hang");
    window.history.replaceState(null, "", `${window.location.pathname}${m.size ? `?${m}` : ""}`);
  }, [q, coXuat, daKeo, moHopXuat]);
  const doi = gocNhin ? daDoi(cachXem, gocNhin) : false;
  const soLoc = soOLocDangChay(loc);

  const footer =
    daLoc.length > 0 ? (
      <DataGridTableFootRow>
        <DataGridTableFootRowCell colSpan={cotHien.length + 1}>
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
      {loat.thanh}
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
        {coXuat ? (
          <div className="hidden items-center gap-1.5 md:flex">
            {tapXuat.tat ? <span className="text-muted-foreground text-xs">{tapXuat.loi}</span> : null}
            <Button type="button" variant="outline" size="sm" disabled={tapXuat.tat} onClick={moHopXuat}>
              <FileUpIcon data-icon="inline-start" aria-hidden="true" />
              Xuất bảng hàng
            </Button>
          </div>
        ) : null}
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
        {loiDanhBa ? (
          <div className="px-4 py-2">
            <TrangThai
              kind="error"
              title="Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên"
              hanhDong={
                <Button variant="outline" size="sm" onClick={docLaiDanhBa}>
                  Thử lại
                </Button>
              }
            />
          </div>
        ) : null}
        {/* Lưới lấp phần còn lại của khung Bảng hàng (bố cục giữ chiều cao, hàng 105): vùng cuộn cao bằng khung, trang không cuộn. */}
        <DataGridContainer className="min-h-0 flex-1 [&>div:first-child]:h-full">
          <DataGridScrollArea className="h-full">
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
        <TichProvider value={loat.ctx}>
        <DataGrid
          table={table}
          recordCount={daLoc.length}
          onRowClick={onMoCan ? (d: DongLuoi) => d.kind === "can" && onMoCan(d.dong) : undefined}
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
          onCellEditRequest={(r) => (r.row.kind === "can" ? suaTrenO.moTrinhSua(r.row.dong, r.columnId as CotId, r.initialText) : undefined)}
          onCellsChange={BO_QUA_GHI_LOAT}
        >
          <FramePanel ref={frameRef} className="flex min-h-0 flex-1 flex-col p-0" onKeyDown={suaTrenO.onKeyDown}>
            {than}
          </FramePanel>
        </DataGrid>
        {suaTrenO.trinhSua}
        {loat.hop}
        {moXuat ? <HopThoaiXuat mo={moXuat} onDong={() => setMoXuat(null)} /> : null}
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
        </TichProvider>
      </HangLocContext.Provider>
    </TooltipProvider>
  );
}

