"use client";

// Hồ sơ căn (hàng 17) — chuyển thể `solution-crm-4` thành cột (Cổng Phạm vi, Hỏi-2): giá + mức đủ đầu cột, thuộc tính căn,
// lần rao, dòng thời gian lịch sử. Đọc kho trên máy và danh mục đã giữ; lịch sử kéo ở nền và giữ trên máy (hàng 13).
import { Maximize2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type MouseEvent } from "react";

import { Badge } from "@/components/reui/badge";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoDongBo, useDanhSachHang } from "@/lib/sync/react";
import type { ListingView } from "@/lib/sync/types";
import { useDanhMuc } from "../../inventory/danh-muc";
import { MucAnhCan } from "../photos/muc-anh-can";
import { dauCuaCan, hienNutSanSang, type Dich } from "../ready/san-sang";
import { NEO_MUC_ANH, NutSanSang } from "../ready/nut-san-sang";
import { NutBaoSai } from "./nut-bao-sai";
import {
  cacLanRao,
  chonLanRao,
  coBaoSai,
  dongLichSu,
  laChonHang,
  lanRaoCua,
  NHAN_PHAN,
  phanLanRao,
  thuocTinh,
  timCan,
  timHang,
  trangThaiLichSu,
  type ChonCan,
  type ChonCot,
} from "./ho-so";
import { OMaCan } from "./o-ma-can";

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const hai = (n: number) => String(n).padStart(2, "0");
/** «28/10 09:12» — giờ máy người xem. */
const luc = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
};
/** «02/10/2026». */
const ngay = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()}`;
};

function CapGiaTri({ ds }: { ds: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Muc({ tieuDe, phai, id, children }: { tieuDe: string; phai?: React.ReactNode; id?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 p-4" aria-label={tieuDe} id={id}>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className={TIEU_MUC}>{tieuDe}</h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

/** Trình duyệt báo ngoại tuyến — lượt kéo chưa chạy thì `lastAttempt` chưa biết mất mạng. */
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

/**
 * Đổi căn, lần rao, toà hay đóng cột chỉ đổi tham số URL — không điều hướng của Next (nó gọi máy chủ dựng lại trang, mất
 * mạng thì ra trang lỗi của trình duyệt). `useSearchParams` theo kịp `history.replaceState`.
 */
const doiUrl = (href: string) => (e: MouseEvent) => {
  e.preventDefault();
  window.history.replaceState(null, "", href);
};

/** Ô của mục «Lần rao đang mở» mang «Chưa có» khi lần bấm «Sẵn sàng bán» gần nhất báo thiếu đúng điều ấy. */
function danhDauChuaCo(nhan: string, dich: readonly Dich[]): boolean {
  return (nhan === NHAN_PHAN.legalStatus && dich.includes("legalStatus")) || (nhan === NHAN_PHAN.occupantType && dich.includes("occupantType"));
}

export type HoSoProps = {
  nguoi: string;
  san: string;
  /** Theo căn (`?unit=`), hay theo hàng (`?hang=`) cho hàng chưa có mã căn (ADR-0026). */
  chon: ChonCot;
  /** Đường đóng cột (về Bảng hàng); toàn màn không có. */
  dongHref?: string;
  /** Dựng đường cho một lần chọn khác: chọn toà khi mã trùng, chọn lần rao. */
  duong: (c: ChonCan) => string;
};

/**
 * Hồ sơ theo căn hay theo hàng. Hàng của `?hang=` đã có mã (vừa gắn, hay mở link cũ) thì là hồ sơ theo căn; máy chủ đã
 * nhận mã (không còn lệnh chờ gửi của hàng) thì địa chỉ sang `?unit=` để link chép mở đúng căn.
 */
export function CotHoSo(props: HoSoProps) {
  const { bd } = useBoDongBo();
  const ds = useDanhSachHang();
  const { chon, duong } = props;
  const theoHang = laChonHang(chon) ? timHang(ds, chon.hang) : null;
  const choGui = theoHang?.kind === "co-ma" && bd.ngan().queue.some((o) => o.listingId === theoHang.chon.lan);
  const sang = theoHang?.kind === "co-ma" && !choGui ? duong(theoHang.chon) : null;
  useEffect(() => {
    if (sang) window.history.replaceState(null, "", sang);
  }, [sang]);
  if (!laChonHang(chon)) return <HoSoCan {...props} chon={chon} />;
  if (theoHang?.kind === "co-ma") return <HoSoCan {...props} chon={theoHang.chon} />;
  return <HoSoCan {...props} chon={{ ma: "", toa: null, lan: chon.hang }} chuaMa={theoHang?.kind === "chua-ma" ? theoHang.hang : null} />;
}

function HoSoCan({ nguoi, san, chon, dongHref, duong, chuaMa }: Omit<HoSoProps, "chon"> & { chon: ChonCan; chuaMa?: ListingView | null }) {
  const { bd } = useBoDongBo();
  const ds = useDanhSachHang();
  const ngan = bd.ngan();
  const ngoaiTuyen = useNgoaiTuyen();
  const danhMuc = useDanhMuc(san);
  const theoHang = chuaMa !== undefined;
  const tim = useMemo(() => (chuaMa ? { kind: "mot" as const, toa: chuaMa.buildingName, hang: [chuaMa] } : theoHang ? { kind: "khong" as const } : timCan(ds, chon.ma, chon.toa)), [ds, chon.ma, chon.toa, chuaMa, theoHang]);
  const toa = tim.kind === "mot" ? tim.toa : null;
  const lan = useMemo(
    () => (chuaMa ? [lanRaoCua(chuaMa, ngan.history)] : toa ? cacLanRao(ds, toa, chon.ma, ngan.history) : []),
    [ds, toa, chon.ma, ngan.history, chuaMa],
  );
  const lanId = chonLanRao(lan, chon.lan);
  const ids = lan.map((r) => r.id).join(",");

  // Kéo lịch sử mọi lần rao của căn ở nền (thường một, hai lần): lần rao xếp theo lúc tạo, lịch sử của lần đang xem.
  // Lần rao đã có lượt kéo xong (thành hay không): chưa có thì phần lịch sử đang tải.
  const [daKeo, setDaKeo] = useState<Record<string, true>>({});
  // Điều còn thiếu sau lần bấm «Sẵn sàng bán» gần nhất (hàng 23) — đánh dấu «Chưa có» đúng ô.
  // Kết quả «Sẵn sàng bán» gắn với lần rao đã bấm: đổi lần rao thì không mang dấu «Chưa có» sang (va-san-sang-ban).
  const [thieuCua, setThieuCua] = useState<{ id: string; dich: readonly Dich[] } | null>(null);
  const baoThieu = useCallback((id: string, dich: readonly Dich[]) => setThieuCua({ id, dich }), []);
  useEffect(() => {
    let huy = false;
    for (const id of ids ? ids.split(",") : []) {
      void bd.taiLichSu(id).finally(() => {
        if (!huy) setDaKeo((m) => ({ ...m, [id]: true }));
      });
    }
    return () => {
      huy = true;
    };
  }, [bd, ids]);

  if (ngan.listings === null) {
    return (
      <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Đang tải hồ sơ căn">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-32" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  const nutDong = dongHref ? (
    <Button variant="ghost" size="icon-sm" aria-label="Đóng hồ sơ" nativeButton={false} render={<a href={dongHref} onClick={doiUrl(dongHref)} />}>
      <X />
    </Button>
  ) : null;

  if (tim.kind === "khong") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">{nutDong}</div>
        {theoHang ? (
          <TrangThai kind="notice" title="Không có hàng này trong Bảng hàng" description="Hàng này không có trong hàng bạn thấy trên máy này." />
        ) : (
          <TrangThai kind="notice" title="Không có căn này trong Bảng hàng" description={`Mã «${chon.ma}» không có trong hàng bạn thấy trên máy này.`} />
        )}
      </div>
    );
  }
  if (tim.kind === "nhieu") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">{nutDong}</div>
        <TrangThai
          kind="notice"
          title="Nhiều căn"
          description={
            <span className="flex flex-col gap-2">
              Mã «{chon.ma}» có ở {tim.toa.length} toà — chọn toà:
              <span className="flex flex-wrap gap-2">
                {tim.toa.map((t) => (
                  <Button key={t} variant="outline" size="sm" nativeButton={false} render={<a href={duong({ ma: chon.ma, toa: t, lan: null })} onClick={doiUrl(duong({ ma: chon.ma, toa: t, lan: null }))} />}>
                    {t}
                  </Button>
                ))}
              </span>
            </span>
          }
        />
      </div>
    );
  }

  const can = ds.find((l) => l.id === lanId)!;
  const tt = chuaMa ? null : thuocTinh(danhMuc, tim.toa, chon.ma);
  const p = phanLanRao(can);
  const lichSu = ngan.history[can.id] ?? [];
  const ttls = trangThaiLichSu({ coBan: lichSu.length > 0, dangTai: !daKeo[can.id], lan: ngan.lastAttempt, ngoaiTuyen });
  const dong = dongLichSu(lichSu, nguoi);
  const dangXem = lan.find((r) => r.id === can.id)!;
  const dichThieu = dauCuaCan(thieuCua, can.id);
  const tuoi = can.freshness as { confirmed?: boolean; ageDays?: number } | undefined;
  const loaiHinh = tt?.kind === "co" ? tt.truong.find(([k]) => k === "Loại hình")?.[1] : null;
  const dauCot = [tt?.kind === "co" ? tt.khu : null, tim.toa, loaiHinh === "—" ? null : loaiHinh].filter(Boolean).join(" · ");
  // «Mở hàng kia» của lỗi trùng căn: hồ sơ theo căn của hàng đang mở ấy, nếu máy này thấy nó.
  const moHangKia = (id: string) => {
    const h = ds.find((l) => l.id === id);
    return h?.unitNumber ? duong({ ma: h.unitNumber, toa: h.buildingName, lan: h.id }) : null;
  };

  return (
    <div className="flex flex-col" data-slot="ho-so-can">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{dauCot}</span>
            <div className="flex items-center gap-2">
              {chuaMa ? <h2 className="text-lg font-semibold text-muted-foreground">Chưa có mã căn</h2> : <h2 className="text-lg font-semibold">{chon.ma}</h2>}
              <Badge variant={dangXem.dangMo ? "success-light" : "outline"}>{dangXem.trangThai}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {dongHref && !chuaMa ? (
              <Button variant="ghost" size="icon-sm" aria-label="Mở toàn màn" nativeButton={false} render={<Link href={`/units/${encodeURIComponent(chon.ma)}?${new URLSearchParams({ toa: tim.toa, lan: can.id })}`} />}>
                <Maximize2 />
              </Button>
            ) : null}
            {nutDong}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {tuoi?.confirmed ? (tuoi.ageDays === 0 ? "Xác nhận hôm nay" : `Xác nhận ${tuoi.ageDays} ngày trước`) : "Chưa xác nhận với chủ nhà"}
        </span>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 p-4" aria-label="Giá và mức đủ">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{dichThieu.includes("gia") ? "Chưa có giá về tay" : p.gia}</span>
          {p.phi ? <Badge variant="outline">{p.phi}</Badge> : null}
        </div>
        <Progress value={(p.mucDu.co / p.mucDu.tren) * 100} aria-label="Mức đủ thông tin" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Mức đủ thông tin
            {p.mucDu.thieu.length ? ` · thiếu ${p.mucDu.thieu.map((k) => (k === "listPrice" ? "Giá" : (NHAN_PHAN[k] ?? k))).join(", ")}` : ""}
          </span>
          <span>
            {p.mucDu.co}/{p.mucDu.tren}
          </span>
        </div>
      </div>
      <Separator />
      <Muc tieuDe="Ảnh" id={NEO_MUC_ANH}>
        {chuaMa ? <p className="text-sm text-muted-foreground">Ảnh gắn theo toà và mã căn — gắn mã căn rồi tải ảnh.</p> : <MucAnhCan toa={tim.toa} ma={chon.ma} />}
      </Muc>
      <Separator />
      <Muc tieuDe="Thuộc tính căn" phai={tt && coBaoSai(tt) && tt.kind === "co" ? <NutBaoSai ma={chon.ma} toa={tim.toa} khu={tt.khu} truong={tt.truong} /> : null}>
        {chuaMa ? (
          <>
            <OMaCan key={chuaMa.id} hang={chuaMa} danhMuc={danhMuc} moHangKia={moHangKia} />
            <CapGiaTri ds={[["Toà", tim.toa]]} />
          </>
        ) : tt?.kind === "co" ? (
          <CapGiaTri ds={tt.truong} />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có trong danh mục</p>
        )}
      </Muc>
      <Separator />
      <Muc tieuDe={dangXem.dangMo ? "Lần rao đang mở" : "Lần rao đang xem"}>
        {/* Mọi hàng thấy trên máy là hàng người xem sửa được (hàng 8, 12); máy chủ vẫn xét quyền. */}
        {dangXem.dangMo && hienNutSanSang(can.standardStatus, true) ? <NutSanSang key={can.id} hang={can} toa={tim.toa} ma={chon.ma} onThieu={baoThieu} /> : null}
        <CapGiaTri ds={p.truong.map(([k, v]): [string, string] => (danhDauChuaCo(k, dichThieu) ? [k, "Chưa có · điền ở Bảng hàng"] : [k, v]))} />
      </Muc>
      <Separator />
      <Muc tieuDe="Các lần rao">
        <ul className="flex flex-col gap-1 text-sm">
          {lan.map((r, i) => (
            <li key={r.id}>
              <a
                href={duong({ ma: chon.ma, toa: tim.toa, lan: r.id })}
                onClick={doiUrl(duong({ ma: chon.ma, toa: tim.toa, lan: r.id }))}
                aria-current={r.id === can.id ? "true" : undefined}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent aria-[current=true]:bg-accent"
              >
                <span className="flex items-center gap-2">
                  Lần {lan.length - i}
                  <Badge variant={r.dangMo ? "success-light" : "outline"}>{r.trangThai}</Badge>
                </span>
                <span className="text-muted-foreground">
                  {r.gia} · {r.tu ? ngay(r.tu) : "…"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Muc>
      <Separator />
      <Muc tieuDe="Lịch sử" phai={ttls.kind === "tren-may" ? <span className="text-xs text-muted-foreground">{ttls.chu}</span> : null}>
        {ttls.kind === "can-mang" ? (
          <p className="text-sm text-muted-foreground">{ttls.chu}</p>
        ) : ttls.kind === "khong-tai-duoc" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {ttls.chu}
            <Button variant="outline" size="sm" onClick={() => void bd.taiLichSu(can.id)}>
              Thử lại
            </Button>
          </div>
        ) : ttls.kind === "dang-tai" ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Đang tải lịch sử">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          <Timeline defaultValue={dong.length}>
            {dong.map((d, i) => (
              <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
                <TimelineHeader>
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
                  <TimelineTitle className="text-sm">
                    {d.viec}
                    {d.chiTiet ? <span className="font-normal text-muted-foreground"> · {d.chiTiet}</span> : null}
                  </TimelineTitle>
                  <TimelineIndicator className="size-2.5 group-data-[orientation=vertical]/timeline:-left-5" />
                </TimelineHeader>
                <TimelineContent>
                  <TimelineDate className="mb-0 text-xs">
                    {d.nguoi} · {luc(d.luc)}
                  </TimelineDate>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Muc>
    </div>
  );
}
