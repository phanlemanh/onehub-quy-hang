"use client";

// Trao bộ cuộn ảo cho danh sách — React Compiler không theo dõi được (như lưới Bảng hàng).
"use no memo";

/**
 * Bảng hàng dạng thẻ trên điện thoại (hàng 32): khe `dienThoai` của `KhungBangHang` dưới `md` — cùng địa chỉ `/inventory`
 * (Tham chiếu §1). Đọc kho trên máy như lưới máy tính; chỉ căn của bảng hàng chung (Đang bán, Đang giao dịch); lọc theo
 * nhu cầu khách; giữ lâu để chọn nhiều (thanh Gửi là hàng 34); chạm mở hồ sơ toàn màn theo URL như lưới (hàng 17) —
 * bảng thẻ ẩn chứ không gỡ, nên lùi về giữ lọc và vị trí cuộn.
 */
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckSquareIcon, EyeIcon, Share2Icon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { ChoTai } from "@/components/bo-cuc/cho-tai";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { useBoDongBo } from "@/lib/sync/react";
import { HoSoDienThoai } from "../../units/ho-so/bang-co-ho-so";
import { docCot, moHang } from "../../units/ho-so/ho-so";
import type { DongBang } from "../cot";
import { useDanhMuc } from "../danh-muc";
import { chiMuc, ghepDanhMuc } from "../ghep-danh-muc";
import { HangTheLoc, NganLoc } from "./ngan-loc";
import { chuThanhGui, duongGui } from "./thanh-gui";
import { DongNhomToa, TheCan } from "./the-can";
import { batDauChon, doiChon, giuChonHopLe, lenThe, locNhuCau, NHU_CAU_RONG, nhomTheoToa, phang, theLoc, type NhuCau } from "./the";

function useDanhSachTrenMay() {
  const { bd } = useBoDongBo();
  const dangKy = useCallback((f: () => void) => bd.dangKy(f), [bd]);
  const phienBan = useSyncExternalStore(dangKy, bd.phienBan, () => 0);
  const n = useMemo(() => {
    void phienBan;
    return bd.ngan();
  }, [bd, phienBan]);
  const { listings, queue, lastAttempt } = n;
  const hang = useMemo(() => {
    void listings;
    void queue;
    return bd.danhSach();
  }, [bd, listings, queue]);
  return { hang, daKeo: listings !== null, loiMang: lastAttempt === "mang", thuLai: () => void bd.thuNgay() };
}

/** Chọn nhiều căn trên bảng thẻ — thanh Gửi (hàng 34) đọc `chon` để dựng «n căn · Xem trước · Gửi». */
export function useChonCan(dong: readonly DongBang[]) {
  const [tho, setTho] = useState<ReadonlySet<string>>(new Set());
  const [dangChon, setDangChon] = useState(false);
  const chon = useMemo(() => giuChonHopLe(tho, dong), [tho, dong]);
  return {
    chon,
    dangChon,
    giuLau: (d: DongBang) => {
      if (dangChon) return setTho(doiChon(chon, d));
      const moi = batDauChon(d);
      if (!moi) return;
      setTho(moi);
      setDangChon(true);
    },
    tich: (d: DongBang) => setTho(doiChon(chon, d)),
    batDau: () => setDangChon(true),
    boChon: () => {
      setTho(new Set());
      setDangChon(false);
    },
  };
}

/** Vùng cuộn của vỏ (cột nội dung `overflow-y-auto`) — danh sách cuộn ảo theo nó. */
function vungCuon(el: HTMLElement | null): HTMLElement | null {
  for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if (o === "auto" || o === "scroll") return p;
  }
  return null;
}

function BangThe({ san, an }: { san: string; an: boolean }) {
  const { hang, daKeo, loiMang, thuLai } = useDanhSachTrenMay();
  const danhMuc = useDanhMuc(san);
  const idx = useMemo(() => chiMuc(danhMuc), [danhMuc]);
  const len = useMemo(() => hang.filter((l) => lenThe(l.standardStatus)).map((l) => ghepDanhMuc(l, idx)), [hang, idx]);
  const [nc, setNc] = useState<NhuCau>(NHU_CAU_RONG);
  const [locMo, setLocMo] = useState(false);
  const [lanMo, setLanMo] = useState(0);
  const moLoc = () => {
    setLanMo((n) => n + 1);
    setLocMo(true);
  };
  const daLoc = useMemo(() => locNhuCau(len, nc), [len, nc]);
  const dong = useMemo(() => phang(nhomTheoToa(daLoc)), [daLoc]);
  const chon = useChonCan(len);

  const goc = useRef<HTMLDivElement | null>(null);
  const [cuon, setCuon] = useState<HTMLElement | null>(null);
  const [le, setLe] = useState(0);
  useLayoutEffect(() => {
    const c = vungCuon(goc.current);
    setCuon(c);
    if (c && goc.current) setLe(goc.current.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop);
  }, [nc, daKeo, an]);

  const ao = useVirtualizer({
    count: dong.length,
    getScrollElement: () => cuon,
    estimateSize: (i) => (dong[i]?.kind === "nhom" ? 56 : 128),
    overscan: 6,
    scrollMargin: le,
    getItemKey: (i) => {
      const r = dong[i]!;
      return r.kind === "nhom" ? `nhom:${r.toa}` : r.d.id;
    },
  });

  // Lùi từ hồ sơ: trả vị trí cuộn đã giữ lúc chạm thẻ.
  const viTri = useRef<number | null>(null);
  // Lúc bảng ẩn, các thẻ đo ra cao 0: hiện lại thì đo lại rồi trả vị trí qua vài khung hình tới khi vùng cuộn đủ cao.
  useEffect(() => {
    const dich = viTri.current;
    if (an || !cuon || dich === null) return;
    viTri.current = null;
    ao.measure();
    let khung = 0;
    let id = 0;
    const thu = () => {
      cuon.scrollTop = dich;
      if (Math.abs(cuon.scrollTop - dich) > 2 && ++khung < 30) id = requestAnimationFrame(thu);
    };
    id = requestAnimationFrame(thu);
    return () => cancelAnimationFrame(id);
  }, [an, cuon, ao]);

  const moHoSo = useCallback(
    (d: DongBang) => {
      viTri.current = cuon?.scrollTop ?? null;
      const q = new URLSearchParams(window.location.search);
      window.history.pushState(null, "", `${window.location.pathname}?${moHang(q, d)}`);
    },
    [cuon],
  );

  if (!daKeo && loiMang)
    return (
      <TrangThai
        kind="error"
        title="Chưa tải được bảng hàng"
        description="Cần mạng cho lần tải đầu trên máy này."
        hanhDong={
          <Button type="button" variant="outline" size="sm" onClick={thuLai}>
            Thử lại
          </Button>
        }
      />
    );
  if (!daKeo) return <ChoTai kieu="dong-tin" />;
  if (!len.length)
    return (
      <TrangThai
        kind="empty"
        title="Chưa có căn nào trên bảng hàng chung"
        description="Căn lên đây khi đầu chủ bấm «Sẵn sàng bán»."
        hanhDong={<Button variant="outline" size="sm" render={<Link href="/today" />}>Về Hôm nay</Button>}
      />
    );

  return (
    <div ref={goc} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium tabular-nums" aria-live="polite">
          {chon.dangChon ? `${chon.chon.size} căn đã chọn` : `${daLoc.length} căn`}
        </p>
        <div className="flex items-center gap-2">
          {chon.dangChon ? (
            <Button type="button" variant="outline" size="sm" onClick={chon.boChon}>
              Bỏ chọn
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={moLoc}>
                <SlidersHorizontalIcon data-icon="inline-start" aria-hidden="true" />
                Lọc{theLoc(nc).length ? ` · ${theLoc(nc).length}` : ""}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={chon.batDau}>
                <CheckSquareIcon data-icon="inline-start" aria-hidden="true" />
                Chọn
              </Button>
            </>
          )}
        </div>
      </div>
      <HangTheLoc nc={nc} onDoi={setNc} />
      {daLoc.length ? (
        <div className="relative w-full" style={{ height: ao.getTotalSize() }}>
          {ao.getVirtualItems().map((v) => {
            const r = dong[v.index]!;
            return (
              <div key={v.key} data-index={v.index} ref={ao.measureElement} className="absolute top-0 left-0 w-full" style={{ transform: `translateY(${v.start - le}px)` }}>
                {r.kind === "nhom" ? (
                  <DongNhomToa toa={r.toa} so={r.so} />
                ) : (
                  <TheCan d={r.d} dangChon={chon.dangChon} daChon={chon.chon.has(r.d.id)} onMo={moHoSo} onTich={chon.tich} onGiuLau={chon.giuLau} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <TrangThai
          kind="empty"
          timKhongRa
          title="Không căn nào khớp nhu cầu"
          hanhDong={
            <Button type="button" variant="outline" size="sm" onClick={() => setNc(NHU_CAU_RONG)}>
              Xoá lọc
            </Button>
          }
        />
      )}
      <NganLoc key={lanMo} mo={locMo} onMo={setLocMo} dong={len} nc={nc} onAp={setNc} />
      {/* Thanh Gửi (hàng 34): thanh chọn của wishlist-1 dời xuống đáy và dính — căn theo thứ tự chọn sang màn Gửi. */}
      {chuThanhGui(chon.chon.size) ? (
        <div className="bg-background sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t py-3" role="region" aria-label="Gửi căn đã chọn">
          <span className="text-foreground text-sm font-medium tabular-nums">{chuThanhGui(chon.chon.size)}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={duongGui(chon.chon, true)} />}>
              <EyeIcon data-icon="inline-start" aria-hidden="true" />
              Xem trước
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href={duongGui(chon.chon)} />}>
              <Share2Icon data-icon="inline-start" aria-hidden="true" />
              Gửi
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Khe điện thoại của Bảng hàng: bảng thẻ, và hồ sơ toàn màn khi URL mở một căn (bảng thẻ ẩn, không gỡ). */
export function BangTheDienThoai({ nguoi, san }: { nguoi: string; san: string }) {
  const q = useSearchParams();
  const dangMo = docCot(new URLSearchParams(q.toString())) !== null;
  return (
    <>
      <div className={dangMo ? "hidden" : undefined}>
        <BangThe san={san} an={dangMo} />
      </div>
      <HoSoDienThoai nguoi={nguoi} san={san} bao={null} />
    </>
  );
}
