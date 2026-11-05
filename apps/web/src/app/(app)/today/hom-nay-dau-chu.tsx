"use client";

// Hôm nay của đầu chủ (hàng 22, làm lại ở hàng 92 theo quyết định 14A: khung solution-agents-2, ô hạn data-grid-base-5)
// bằng thành phần `data-grid` đã cài: danh sách việc không đầu cột, nhóm theo hàng đợi của bộ nhóm đang áp (dòng nhóm gập
// được kèm số), cột Việc · Vì sao hôm nay · Giá · Hành động — một nút việc chính mỗi dòng, việc còn lại trong ⋯.
// Căn đọc từ kho trên máy (bộ đồng bộ); lead và bộ nhóm đọc qua API, bộ nhóm đọc được thì lưu trên máy theo sàn.
import { NEED_LABELS, RETURN_REASON_LABEL, LEAD_STAGE_LABELS, type LeadState } from "@quy-hang/core/dedupe";
import { BO_NHOM_MAC_DINH, chiaNhom, nhomCuaLead, type BoNhom, type LeadAction, type Nhom } from "@quy-hang/core/today";
import { useTable, type ColumnDef, type ExpandedState, type Row } from "@tanstack/react-table";
import { RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ComponentProps } from "react";

import { ChoTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from "@/components/reui/data-grid/data-grid";
import { DataGridTable, DataGridTableRowExpand } from "@/components/reui/data-grid/data-grid-table";
import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { OHaiTang, OThaoTac, RONG_NUT_CHINH, type MucMenu } from "@/components/khoi/solution-agents-2";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useBoDongBo, useDanhSachHang, useSuaHang } from "@/lib/sync/react";
import { useDanhMuc } from "../inventory/danh-muc";
import { chiMuc } from "../inventory/ghep-danh-muc";
import { CotHoSo } from "../units/ho-so/cot-ho-so";
import { docCot, dongCot, duongHangChuaMa, moCot, type ChonCan } from "../units/ho-so/ho-so";
import { KhungHoSoCan } from "../units/ho-so/khung";
import { canHomNay, chuGiaPhi, chuGio, chuGioNgay, chuHan, chuLoai, lyDo, type CanHomNay } from "./ly-do";
import { docLeadThamSo, moNhom, timLead } from "./mo-lead";
import { docNhomThamSo, timNhom } from "./mo-nhom";
import { chuSo, moSo, telHref } from "./mo-so";
import { DanhSachDienThoai, type NhomThe, type TheDong } from "./mobile/danh-sach";
import { dungNhomThe, noiThe, noiViecCan, noiViecLead } from "./mobile/hanh-dong";
import { HetViec } from "./mobile/het-viec";
import { useDienThoai } from "./mobile/kho";
import { moSoChu } from "./mobile/mo-so-chu";
import { ghiLead, layBoNhom, layLeadGiao, type LeadGiao } from "./nguon";
import { mucHan, NHAN_VIEC, nutCuaViec, type MaViec, type MucHan, type ViecDong } from "./viec-dong";

type Feat = DataGridFeatures;
type Viec =
  | { kind: "can"; id: string; nhom: Nhom; can: CanHomNay; lyDo: string }
  | { kind: "lead"; id: string; nhom: Nhom; lead: LeadGiao };
type DongLuoi = { kind: "nhom"; id: string; nhom: Nhom; so: number; subRows: DongLuoi[] } | { kind: "viec"; id: string; v: Viec };
type DefCot = ColumnDef<Feat, DongLuoi>;

const getRowId = (d: DongLuoi) => d.id;
const getSubRows = (d: DongLuoi) => (d.kind === "nhom" ? d.subRows : undefined);

const I18N = { labels: { expandRow: "Mở nhóm", collapseRow: "Gập nhóm", empty: "Không còn việc" } };
const TABLE_LAYOUT = { rowBorder: true, headerBackground: false, width: "fixed" as const };
const TABLE_CLASS_NAMES = { edgeCell: "first:ps-3.5 last:pe-3.5" };
const HIEN_HET: Record<string, boolean> = {};
const CHI_VIEC: Record<string, boolean> = { lyDo: false, gia: false, han: false, hanhDong: false };

// Năm cột cần khoảng 1.040px; dưới 72rem (cột nội dung hẹp hơn thế khi trừ vỏ) dùng bố cục một cột.
const MQ = "(min-width: 72rem)";
/** Hàng đợi ngắn theo luật 18 — không chia trang; mọi dòng mở hiện cùng lúc. */
const KHONG_CHIA_TRANG = { pageIndex: 0, pageSize: 100_000 };
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

/** Giờ hiện tại, đi lại mỗi phút — «hôm qua», số ngày và hạn lead tính lại theo. */
function useBayGio() {
  const [bayGio, setBayGio] = useState(() => new Date().toISOString());
  useEffect(() => {
    const t = window.setInterval(() => setBayGio(new Date().toISOString()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return bayGio;
}

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;
const BADGE_NHOM: Record<string, BadgeVariant> = {
  new_lead: "info-light",
  price_adjustment: "warning-light",
  call_back: "destructive-light",
  missing_info: "invert-light",
  recent_change: "primary-light",
};
const badgeNhom = (n: Nhom): BadgeVariant => BADGE_NHOM[n.code] ?? (n.subject === "lead" ? "info-light" : "primary-light");

const tieuDe = (v: Viec) =>
  v.kind === "lead" ? `${v.lead.buildingName} · ${v.lead.unitNumber ?? "chỉ biết toà"}` : `${v.can.unitNumber ?? "Chưa có mã căn"} · ${v.can.buildingName}`;
const phuDe = (v: Viec) => (v.kind === "lead" ? (NEED_LABELS[v.lead.need as keyof typeof NEED_LABELS] ?? v.lead.need) : chuLoai(v.can));
const nhanNac = (stage: string) => LEAD_STAGE_LABELS[stage as LeadState] ?? stage;

/** Hành động của dòng: căn ghi qua bộ đồng bộ, lead gọi API; lỗi nói ở dòng, dòng giữ nguyên. */
type HanhDong = {
  bayGio: string;
  dangGhi: ReadonlySet<string>;
  loi: Readonly<Record<string, string>>;
  conGiuGia: (c: CanHomNay) => void;
  moHoSo: (c: CanHomNay) => void;
  lead: (l: LeadGiao, viec: LeadAction) => void;
  /** Số đã mở theo dòng lead (hàng mo-so-lead) — chỉ trong trạng thái của màn, không lưu trên máy. */
  so: Readonly<Record<string, string>>;
  moSo: (l: LeadGiao) => void;
};

/** Dòng trên của «Vì sao hôm nay»: lý do bằng chữ của căn, hay nấc lead và giờ nhập. */
function lyDoChu(v: Viec): string {
  if (v.kind === "can") return v.lyDo;
  return `${nhanNac(v.lead.stage)} · nhập ${chuGio(v.lead.createdAt)}`;
}

const chuGiaViec = (v: Viec) => (v.kind === "can" ? chuGiaPhi(v.can.listPrice, v.can.feeInclusion) : v.lead.priceText);

/** Hạn của dòng (chỉ lead có hạn): chữ và mốc màu — đã quá đỏ, còn dưới 15 phút vàng (hàng 92). */
function hanCua(v: Viec, bayGio: string): { chu: string; muc: MucHan } | null {
  if (v.kind === "can") return null;
  const iso = v.lead.stage === "sent" ? v.lead.acceptDueAt : v.lead.callDueAt;
  return { chu: chuHan(v.lead, bayGio).chu, muc: mucHan(iso, bayGio) };
}
const MAU_HAN: Record<MucHan, string> = { qua: "text-destructive", sap: "text-warning", thuong: "", khong: "" };

/** «Vì sao hôm nay» hai tầng: lý do chữ đậm, hạn dòng dưới tô theo mốc. */
function ViSao({ v, bayGio }: { v: Viec; bayGio: string }) {
  const h = hanCua(v, bayGio);
  return <OHaiTang tren={lyDoChu(v)} duoi={h?.chu} duoiClassName={h ? MAU_HAN[h.muc] : undefined} />;
}

const viecDong = (v: Viec): ViecDong => (v.kind === "can" ? { kind: "can", nhom: v.nhom } : { kind: "lead", nhom: v.nhom, stage: v.lead.stage });

/** Đúng một nút viền cùng bề rộng (việc đầu của nhóm), việc còn lại trong ⋯; Trả lại luôn hỏi lại (hàng 92). */
function NutViec({ v, hd }: { v: Viec; hd: HanhDong }) {
  const [hoiTraLai, setHoiTraLai] = useState(false);
  const ban = hd.dangGhi.has(v.id);
  const loi = hd.loi[v.id];
  const soMo = hd.so[v.id];
  const { chinh, phu } = nutCuaViec(viecDong(v));
  const nhan = (m: MaViec) =>
    m === "tra-lai" ? `Trả lại · ${RETURN_REASON_LABEL}` : m === "mo-so" && soMo ? `Gọi ${chuSo(soMo)}` : NHAN_VIEC[m];
  const lam = (m: MaViec): { onClick?: () => void; href?: string } => {
    // Đường nối chung với thẻ điện thoại (hanh-dong.ts); «Trả lại» hỏi lại trước, «Mở số» chỉ có ở máy tính.
    if (v.kind === "can") return noiViecCan(v.can, m, hd, duongHangChuaMa);
    if (m === "tra-lai") return { onClick: () => setHoiTraLai(true) };
    if (m === "mo-so") return soMo ? { href: telHref(soMo) } : { onClick: () => hd.moSo(v.lead) };
    return noiViecLead(v.lead, m, hd);
  };
  const nutChinh = chinh ? (
    (() => {
      const h = lam(chinh);
      return h.href ? (
        <Button size="sm" variant="outline" className={RONG_NUT_CHINH} nativeButton={false} render={<Link href={h.href} />}>
          {nhan(chinh)}
        </Button>
      ) : (
        <Button size="sm" variant="outline" className={RONG_NUT_CHINH} disabled={ban} onClick={h.onClick}>
          {nhan(chinh)}
        </Button>
      );
    })()
  ) : null;
  const menu: MucMenu[] = phu.map((m) => ({ khoa: m, nhan: nhan(m), disabled: ban, ...lam(m) }));
  return (
    <div className="flex flex-col items-end gap-1.5">
      <OThaoTac chinh={nutChinh} phu={menu} nhanMenu={`Việc khác của ${tieuDe(v)}`} />
      {loi ? <span className="text-destructive text-sm whitespace-normal">{loi}</span> : null}
      {v.kind === "lead" && (
        <AlertDialog open={hoiTraLai} onOpenChange={setHoiTraLai}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Trả lại lead này?</AlertDialogTitle>
              <AlertDialogDescription>Lý do: {RETURN_REASON_LABEL}. Lead về telesales để sửa số và gửi lại.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Giữ lại</AlertDialogCancel>
              <AlertDialogAction onClick={() => hd.lead(v.lead, "return")}>Trả lại</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function ONhom({ row, d }: { row: Row<Feat, DongLuoi>; d: Extract<DongLuoi, { kind: "nhom" }> }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <DataGridTableRowExpand row={row} />
      <span className="truncate text-sm font-medium">{d.nhom.label}</span>
      <Badge variant={badgeNhom(d.nhom)}>{d.so}</Badge>
    </span>
  );
}

function taoCot(hd: HanhDong, rong: boolean): DefCot[] {
  return [
    {
      id: "viec",
      header: "Việc",
      size: rong ? 240 : 300,
      cell: ({ row }) => {
        const d = row.original;
        if (d.kind === "nhom") return <ONhom row={row} d={d} />;
        const v = d.v;
        return (
          <div className="flex min-w-0 flex-col gap-0.5 ps-9 whitespace-normal">
            {v.kind === "can" && !v.can.unitNumber ? (
              // Hàng chưa có mã căn: dòng mở hồ sơ của hàng để gắn mã (ADR-0026).
              <Link href={duongHangChuaMa(v.can.id)} className="text-foreground text-sm font-medium underline-offset-2 hover:underline">
                {tieuDe(v)}
              </Link>
            ) : (
              <span className="text-foreground text-sm font-semibold">{tieuDe(v)}</span>
            )}
            <span className="text-muted-foreground text-xs">{phuDe(v)}</span>
            {!rong && (
              <div className="flex flex-col gap-2 pt-1">
                <ViSao v={v} bayGio={hd.bayGio} />
                <span className="text-sm">{chuGiaViec(v)}</span>
                <NutViec v={v} hd={hd} />
              </div>
            )}
          </div>
        );
      },
    },
    { id: "lyDo", header: "Vì sao hôm nay", size: 260, cell: ({ row }) => (row.original.kind === "viec" ? <ViSao v={row.original.v} bayGio={hd.bayGio} /> : null) },
    {
      id: "gia",
      header: "Giá",
      size: 160,
      cell: ({ row }) => (row.original.kind === "viec" ? <span className="text-sm whitespace-normal">{chuGiaViec(row.original.v)}</span> : null),
    },
    {
      id: "hanhDong",
      header: "Hành động",
      size: 210,
      cell: ({ row }) => (row.original.kind === "viec" ? <NutViec v={row.original.v} hd={hd} /> : null),
    },
  ];
}

/** Đang tải: đúng bố cục — thanh đầu, ba dòng nhóm, mỗi nhóm hai dòng việc. */
function DangTai() {
  // Chờ tải theo hình bố cục Tràn của /today (ADR-0024 §4) — không ghép khung xương tay.
  return (
    <FramePanel className="p-3.5!" aria-label="Đang tải Hôm nay">
      <ChoTai kieu="tran" />
    </FramePanel>
  );
}

type TaiBo = { kind: "dang" } | { kind: "ok"; bo: BoNhom } | { kind: "loi" };
type TaiLead = { kind: "dang" } | { kind: "ok"; ds: LeadGiao[] } | { kind: "loi" };

export function HomNayDauChu({ nguoi, san }: { nguoi: string; san: string }) {
  const { bd } = useBoDongBo();
  const dsHang = useDanhSachHang();
  const ngan = bd.ngan();
  const sua = useSuaHang();
  const danhMuc = useDanhMuc(san);
  const rong = useRong();
  const ngoaiTuyen = useNgoaiTuyen();
  const bayGio = useBayGio();

  // ——— Bộ nhóm và lead qua API ———
  const [taiBo, setTaiBo] = useState<TaiBo>({ kind: "dang" });
  const [taiLead, setTaiLead] = useState<TaiLead>({ kind: "dang" });
  const ap = useCallback(
    (bo: Awaited<ReturnType<typeof layBoNhom>>, leads: LeadGiao[] | null) => {
      if (bo) {
        setTaiBo({ kind: "ok", bo: bo.groups });
        void bd.luuBoNhom(bo);
      } else setTaiBo({ kind: "loi" });
      setTaiLead(leads ? { kind: "ok", ds: leads } : { kind: "loi" });
    },
    [bd],
  );
  useEffect(() => {
    let huy = false;
    void Promise.all([layBoNhom(), layLeadGiao()]).then(([bo, leads]) => {
      if (!huy) ap(bo, leads);
    });
    return () => {
      huy = true;
    };
  }, [ap]);
  const thuLai = () => {
    setTaiLead({ kind: "dang" });
    void Promise.all([layBoNhom(), layLeadGiao()]).then(([bo, leads]) => ap(bo, leads));
  };

  // Bộ đang áp: bộ vừa đọc; đọc lỗi thì bộ đã lưu trên máy; chưa từng lưu thì bộ mặc định kèm chữ báo.
  const daLuu = bd.boNhomDaLuu();
  const bo: BoNhom = taiBo.kind === "ok" ? taiBo.bo : (daLuu?.groups ?? BO_NHOM_MAC_DINH);
  const nguonBo = taiBo.kind === "ok" ? "moi" : daLuu ? "luu" : "mac-dinh";

  // ——— Hàng đợi ———
  const idx = useMemo(() => chiMuc(danhMuc), [danhMuc]);
  const cans = useMemo(() => dsHang.map((l) => canHomNay(l, idx)), [dsHang, idx]);
  const nhom = (() => {
    const theoCan = new Map(chiaNhom(bo, cans, nguoi, bayGio).map((g) => [g.nhom.code, g.cans]));
    const leads = taiLead.kind === "ok" ? taiLead.ds : [];
    return bo
      .filter((n) => n.enabled)
      .map((n) => {
        const viec: Viec[] =
          n.subject === "lead"
            ? leads.filter((l) => nhomCuaLead(bo, { stage: l.stage as LeadState })?.code === n.code).map((lead) => ({ kind: "lead", id: `lead:${lead.id}`, nhom: n, lead }))
            : (theoCan.get(n.code) ?? []).map((can) => ({ kind: "can", id: `can:${can.id}`, nhom: n, can, lyDo: lyDo(n, can, nguoi, bayGio) }));
        return { nhom: n, viec };
      })
      .filter((g) => g.viec.length > 0);
  })();
  const tong = nhom.reduce((s, g) => s + g.viec.length, 0);

  // ——— Hành động ———
  const [dangGhi, setDangGhi] = useState<ReadonlySet<string>>(new Set());
  const [loi, setLoi] = useState<Record<string, string>>({});
  const datLoi = (id: string, chu: string | null) =>
    setLoi((m) => {
      const con = { ...m };
      if (chu) con[id] = chu;
      else delete con[id];
      return con;
    });
  const ban = (id: string, co: boolean) =>
    setDangGhi((s) => {
      const moi = new Set(s);
      if (co) moi.add(id);
      else moi.delete(id);
      return moi;
    });

  const q = useSearchParams();
  const path = usePathname();
  const qs = q.toString();
  const chon = docCot(new URLSearchParams(qs));

  // Số đã mở theo dòng (hàng mo-so-lead): chỉ sống trong trạng thái màn — tải lại trang là ẩn, mở lại ghi thêm vết.
  const [soDaMo, setSoDaMo] = useState<Record<string, string>>({});

  const hd: HanhDong = {
    bayGio,
    dangGhi,
    loi,
    so: soDaMo,
    moSo: (l) => {
      const id = `lead:${l.id}`;
      ban(id, true);
      datLoi(id, null);
      void moSo(l.id)
        .then((kq) => {
          if (kq.ok) setSoDaMo((m) => ({ ...m, [id]: kq.so }));
          else datLoi(id, kq.loi);
        })
        .finally(() => ban(id, false));
    },
    conGiuGia: (c) => {
      const id = `can:${c.id}`;
      ban(id, true);
      datLoi(id, null);
      // Ghi trên máy trước như «Đã gọi» của Bảng hàng: căn rời nhóm ngay, mất mạng thì nằm ở hàng đợi trên máy.
      void sua(c.id, "owner_confirmed", {})
        .then((kq) => {
          if (!kq.ok) datLoi(id, kq.loi.kind === "kho" ? "Kho trên máy lỗi — chưa ghi được, thử lại." : "Chưa ghi được — mở hồ sơ để xem căn.");
        })
        .finally(() => ban(id, false));
    },
    moHoSo: (c) => {
      if (!c.unitNumber) return;
      // Chỉ đổi URL — không điều hướng của Next, mất mạng vẫn mở được hồ sơ từ kho trên máy (như Bảng hàng).
      window.history.replaceState(null, "", `${path}?${moCot(new URLSearchParams(qs), { ma: c.unitNumber, toa: c.buildingName, lan: c.id })}`);
    },
    lead: (l, viec) => {
      const id = `lead:${l.id}`;
      ban(id, true);
      datLoi(id, null);
      void ghiLead(l.id, viec)
        .then(async (kq) => {
          if (!kq.ok) return datLoi(id, kq.loi);
          // Đổi ngay trên màn, rồi đọc lại danh sách để nấc và hạn đúng máy chủ.
          setTaiLead((t) =>
            t.kind !== "ok"
              ? t
              : { kind: "ok", ds: viec === "accept" ? t.ds.map((x) => (x.id === l.id ? { ...x, stage: "accepted" } : x)) : t.ds.filter((x) => x.id !== l.id) },
          );
          const moi = await layLeadGiao();
          if (moi) setTaiLead({ kind: "ok", ds: moi });
        })
        .finally(() => ban(id, false));
    },
  };

  const [expanded, setExpanded] = useState<ExpandedState>(true);

  // ——— Mở đúng lead từ thông báo (hàng 26): /today?lead=<id> ———
  const leadMo = docLeadThamSo(qs);
  const dangTaiLead = ngan.listings === null || taiBo.kind === "dang" || taiLead.kind === "dang";
  const ketQuaMo = leadMo && !dangTaiLead && taiLead.kind === "ok" ? timLead(nhom, leadMo) : null;
  const dongMo = ketQuaMo && "dong" in ketQuaMo ? ketQuaMo.dong : null;
  const nhomMo = ketQuaMo && "nhom" in ketQuaMo ? ketQuaMo.nhom : null;
  // Mở nhóm ngay lúc dựng (một lần cho mỗi lead), rồi cuộn sau khi lưới đã vẽ dòng.
  const [daMo, setDaMo] = useState<string | null>(null);
  if (dongMo && nhomMo && daMo !== dongMo) {
    setDaMo(dongMo);
    setExpanded((e) => moNhom(e === true ? true : (e as Record<string, boolean>), nhomMo));
  }
  useEffect(() => {
    if (!dongMo) return;
    const id = window.requestAnimationFrame(() =>
      document.querySelector(`[data-row-id="${CSS.escape(dongMo)}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }),
    );
    return () => window.cancelAnimationFrame(id);
  }, [dongMo]);

  // ——— Mở đúng nhóm từ cột thứ hai (va-he-bo-cuc): /today?nhom=<mã> — cùng đường với lead; có lead thì lead thắng ———
  const nhomThamSo = docNhomThamSo(qs);
  // Lưới còn đang tải thì chưa có kết quả: không báo nhầm «không có việc» lúc lưới còn rỗng.
  const ketQuaNhom = nhomThamSo ? timNhom({ bo, dangHien: dangTaiLead ? null : nhom, ma: nhomThamSo }) : null;
  const dongNhom = ketQuaNhom && "dong" in ketQuaNhom ? ketQuaNhom.dong : null;
  const [daMoNhom, setDaMoNhom] = useState<string | null>(null);
  if (ketQuaNhom && "dong" in ketQuaNhom && daMoNhom !== ketQuaNhom.dong) {
    setDaMoNhom(ketQuaNhom.dong);
    setExpanded((e) => moNhom(e === true ? true : (e as Record<string, boolean>), ketQuaNhom.nhom));
  }
  useEffect(() => {
    if (!dongNhom) return;
    const id = window.requestAnimationFrame(() =>
      document.querySelector(`[data-row-id="${CSS.escape(dongNhom)}"]`)?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      }),
    );
    return () => window.cancelAnimationFrame(id);
  }, [dongNhom]);
  const chonDong = dongMo ?? dongNhom;
  const rowSelection: Record<string, true> = chonDong ? { [chonDong]: true } : {};
  const cay: DongLuoi[] = nhom.map((g) => ({
    kind: "nhom",
    id: `nhom:${g.nhom.code}`,
    nhom: g.nhom,
    so: g.viec.length,
    subRows: g.viec.map((v) => ({ kind: "viec", id: v.id, v })),
  }));
  // Đủ năm cột khi khung rộng và cột hồ sơ đóng; cột hồ sơ mở thì lưới hẹp lại — dồn về một cột như khung hẹp.
  const namCot = rong && !chon;
  const columns = taoCot(hd, namCot);
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: cay,
    getRowId,
    getSubRows,
    state: { expanded, columnVisibility: namCot ? HIEN_HET : CHI_VIEC, pagination: KHONG_CHIA_TRANG, rowSelection },
    enableRowSelection: true,
    onExpandedChange: setExpanded,
    autoResetExpanded: false,
  });

  const duong = (c: ChonCan) => {
    const m = new URLSearchParams(dongCot(new URLSearchParams(qs)));
    m.set("unit", c.ma);
    if (c.toa) m.set("toa", c.toa);
    if (c.lan) m.set("lan", c.lan);
    return `${path}?${m}`;
  };
  const dong = dongCot(new URLSearchParams(qs));
  const hoSo = chon ? (
    <KhungHoSoCan cot>
      <CotHoSo nguoi={nguoi} san={san} chon={chon} dongHref={dong ? `${path}?${dong}` : path} duong={duong} />
    </KhungHoSoCan>
  ) : null;

  const dangTai = ngan.listings === null || taiBo.kind === "dang" || taiLead.kind === "dang";

  // ——— Điện thoại (hàng 39): thẻ hai tầng thay lưới, cùng nhóm và cùng bộ việc ———
  const dienThoai = useDienThoai();
  const theCua = (v: Viec): TheDong => {
    const h = hanCua(v, bayGio);
    const noi = noiThe(v, hd, { duongChuaMa: duongHangChuaMa, diToi: (href) => window.location.assign(href) });
    return {
      id: v.id,
      tren: tieuDe(v),
      duoi: [lyDoChu(v), chuGiaViec(v)].filter(Boolean).join(" · "),
      han: h && h.muc !== "khong" ? h : null,
      dong: viecDong(v),
      coSo: v.kind === "lead" || v.can.listAgentKey === nguoi,
      ban: dangGhi.has(v.id),
      loi: loi[v.id],
      lam: noi.lam,
      ghiKetQua: noi.ghiKetQua,
      soCu: soDaMo[v.id] ?? null,
      moSo: () => (v.kind === "lead" ? moSo(v.lead.id) : moSoChu(v.can.id)),
      daMo: (so) => setSoDaMo((m) => ({ ...m, [v.id]: so })),
    };
  };
  const nhomThe: NhomThe[] = dungNhomThe(nhom, theCua, badgeNhom);

  const than = dienThoai ? (
    <FramePanel className="p-0!">
      <DanhSachDienThoai trangThai={dangTai ? "dang" : "co"} nhom={nhomThe} coMang={!ngoaiTuyen} onThuLai={thuLai} trong={taiLead.kind === "loi" ? null : <HetViec />} />
    </FramePanel>
  ) : dangTai ? (
    <DangTai />
  ) : tong === 0 ? (
    taiLead.kind === "loi" ? null : (
      <FramePanel>
        <HetViec />
      </FramePanel>
    )
  ) : (
    <DataGrid table={table} recordCount={tong} i18n={I18N} tableLayout={TABLE_LAYOUT} tableClassNames={TABLE_CLASS_NAMES}>
      <FramePanel className="p-0!">
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
      </FramePanel>
    </DataGrid>
  );

  return (
    <section aria-label="Hôm nay của đầu chủ" className="flex w-full min-w-0 flex-col">
      <Frame stacked className="w-full min-w-0">
        <FramePanel className="flex items-center justify-between gap-2 p-3.5!">
          <h2 className="text-foreground text-base font-medium">Hôm nay</h2>
          {!dangTai && <span className="text-muted-foreground text-sm">{tong} việc</span>}
        </FramePanel>
        {!dangTai && nguonBo === "luu" && daLuu ? (
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={`Hàng đợi chia theo bộ nhóm lưu lúc ${chuGioNgay(daLuu.savedAt)}`} description="Chưa tải được bộ nhóm mới của sàn." />
          </FramePanel>
        ) : null}
        {!dangTai && nguonBo === "mac-dinh" ? (
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title="Đang dùng bộ mặc định — chưa tải được bộ nhóm của sàn" />
          </FramePanel>
        ) : null}
        {!dangTai && taiLead.kind === "loi" ? (
          <FramePanel className="p-0!">
            <TrangThai
              kind="error"
              title={ngoaiTuyen ? "Mất mạng — lead mới cần mạng" : "Chưa tải được lead giao cho bạn"}
              description={
                <span className="flex flex-col items-start gap-2">
                  <span>Các nhóm căn vẫn đọc từ máy.</span>
                  <Button size="sm" variant="outline" onClick={thuLai}>
                    <RotateCwIcon data-icon="inline-start" />
                    Thử lại
                  </Button>
                </span>
              }
            />
          </FramePanel>
        ) : null}
        {ketQuaMo && "khongCon" in ketQuaMo ? (
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={ketQuaMo.khongCon} />
          </FramePanel>
        ) : null}
        {ketQuaNhom && "bao" in ketQuaNhom ? (
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={ketQuaNhom.bao} />
          </FramePanel>
        ) : null}
        {hoSo && rong ? (
          <ResizablePanelGroup orientation="horizontal" id="hom-nay-co-ho-so">
            <ResizablePanel id="hom-nay" minSize="40%">
              {than}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="ho-so" defaultSize="38%" minSize="28%">
              {hoSo}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          (hoSo ?? than)
        )}
      </Frame>
    </section>
  );
}
