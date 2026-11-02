"use client";

// Chế độ cuộc gọi ép giá (hàng 29): đầu căn, kết quả gọi bằng phím (H · G · B · K), lịch sử trả giá và giá đáy nội bộ, rồi
// danh sách hỏi, tính giá, so giá toà của hàng 28. Hồ sơ đọc và ghi qua bộ đồng bộ trên máy (KH-cg-tren-may); giá đáy đọc
// thẳng đường chủ nhà, không lưu trên máy (KH-cg-khong-nguon).
import { soGiaToa, vietGia, type CanSo, type FeeInclusion } from "@quy-hang/core/pricing";
import type { EventType, ListingEvent } from "@quy-hang/core/listing";
import type { ListingView, NeedsReview } from "@/lib/sync/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";

import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { Timeline, TimelineContent, TimelineDate, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator, TimelineTitle } from "@/components/reui/timeline";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { useBoDongBo, useCanXem, useDanhSachHang, useHoSoHang, useSuaHang } from "@/lib/sync/react";
import { moTaLoi } from "../../../inventory/cell-edit/lenh";
import { useDanhMuc } from "../../../inventory/danh-muc";
import { nhanLoaiCan } from "../../../inventory/ghep-danh-muc";
import { chuGioNgay } from "../../../today/ly-do";
import { phongNguTheo } from "../cuoc-goi";
import { dungGhiGia, hieuLa, NHAN_PHI, type LenhGia } from "../gia";
import { DanhSachHoi, SoGia, TinhGia, type GiaNhom } from "../khoi";
import { doiMayTinh, mayTinhDau, type DoiMayTinh } from "../may-tinh";
import { dongMucDu } from "../muc-du";
import { xuLyPhim, type ChoTro } from "../phim";
import { dauMan } from "./dau-man";
import { docGiaDay, khoiGiaDay, type GiaDay } from "./gia-day";
import { dungHaGia } from "./ha-gia";
import { BA_LOI, homNay, KET_QUA, lenhBan, loiMo, xuLyPhimKetQua, type KetQua, type LoiBan } from "./ket-qua";
import { lichSuTraGia } from "./lich-su";

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
/** Câu «Đã ghi» của lần hạ giá — một chỗ cho phím Enter, nút Ghi và hộp hỏi lại. */
const nhanHa = (l: LenhGia) => `Hạ giá ${vietGia(l.listPrice)} · ${NHAN_PHI[l.feeInclusion]}`;
/** Vì sao máy chủ không nhận lần ghi của căn — cùng chữ với bảng «Cần xem». */
const VI_SAO: Record<NeedsReview["kind"], string> = { "da-ban": "căn đã bán", "da-coc": "căn đã cọc", "dung-nhau": "người khác vừa sửa căn này", "tu-choi": "máy chủ không nhận" };
const NHAN_KQ: Record<KetQua, string> = { "ha-gia": "Hạ giá", "giu-gia": "Còn · giữ giá", ban: "Đã cọc / bán…", "khong-nghe": "Không nghe máy" };

const khongDangKy = () => () => {};

export function EpGia({ hangId, san }: { hangId: string; san: string }) {
  const { bd } = useBoDongBo();
  const hoSo = useHoSoHang(hangId);
  const ds = useDanhSachHang();
  // Kho trên máy chỉ có ở trình duyệt: lượt dựng trên máy chủ và lượt hydrat đầu cùng hiện «Đang tải» để khỏi lệch.
  const oMay = useSyncExternalStore(khongDangKy, () => true, () => false);
  if (!oMay || !hoSo) {
    // Kho chưa nạp lần đầu thì chờ; đã nạp mà không có hồ sơ thì báo.
    if (!oMay || bd.ngan().listings === null) return <FramePanel className="text-muted-foreground text-sm">Đang tải hồ sơ…</FramePanel>;
    return (
      <FramePanel className="flex flex-col items-start gap-2">
        <TrangThai kind="notice" title="Không thấy căn này trong kho của bạn" />
        <Button size="sm" nativeButton={false} render={<Link href="/today" />}>
          Về Hôm nay
        </Button>
      </FramePanel>
    );
  }
  return <ManEpGia key={hangId} hangId={hangId} san={san} ds={ds} lichSu={bd.ngan().history[hangId] ?? null} />;
}

function ManEpGia({ hangId, san, ds, lichSu }: { hangId: string; san: string; ds: ListingView[]; lichSu: ListingEvent[] | null }) {
  const router = useRouter();
  const sua = useSuaHang();
  const dm = useDanhMuc(san);
  const can = ds.find((l) => l.id === hangId)!;
  const cuGia = { listPrice: can.listPrice, feeInclusion: (can.feeInclusion as FeeInclusion | null) ?? null };
  const dau = dauMan(can, lichSu, new Date());
  const ls = lichSuTraGia(lichSu);

  // ——— Giá đáy: đọc một lần, không lưu ———
  const [giaDay, setGiaDay] = useState<GiaDay | null>(null);
  useEffect(() => {
    let huy = false;
    void docGiaDay(goiFetch, hangId).then((g) => !huy && setGiaDay(g));
    return () => {
      huy = true;
    };
  }, [hangId]);
  const khoiDay = giaDay ? khoiGiaDay(giaDay, cuGia) : null;

  // ——— Kết quả gọi ———
  const [chon, setChon] = useState<KetQua | null>(null);
  const [loi, setLoi] = useState<LoiBan | null>(null);
  const [chuHa, setChuHa] = useState("");
  const [phiHa, setPhiHa] = useState<FeeInclusion | null>(cuGia.feeInclusion);
  const [hoiLaiHa, setHoiLaiHa] = useState<{ lenh: LenhGia; cuMoi: string; phanTram: string | null } | null>(null);
  const [giaChot, setGiaChot] = useState("");
  const [ngayBan, setNgayBan] = useState(homNay());
  const [baoLoi, setBaoLoi] = useState<string | null>(null);
  const [daGhi, setDaGhi] = useState<string | null>(null);
  // Lần ghi của căn này máy chủ không nhận (hàng 13, 61): màn nói vì sao thay câu «Đã ghi», lối xử ở bảng «Cần xem».
  const { moCanXem } = useBoDongBo();
  const canXem = useCanXem().find((r) => r.listingId === hangId) ?? null;
  const oHa = useRef<HTMLInputElement>(null);
  const khoiKq = useRef<HTMLDivElement>(null);
  const oChot = useRef<HTMLInputElement>(null);
  const danhSach = useRef<HTMLDivElement>(null);
  const oGia = useRef<HTMLInputElement>(null);

  const ghi = async (type: EventType, payload: Record<string, unknown>, nhan: string) => {
    const kq = await sua(hangId, type, payload);
    if (!kq.ok) return setBaoLoi(moTaLoi(kq.loi));
    setBaoLoi(null);
    setHoiLaiHa(null);
    setDaGhi(nhan);
  };
  const chonKq = (kq: KetQua | null) => {
    setBaoLoi(null);
    setHoiLaiHa(null);
    setDaGhi(null);
    setChon(kq);
    if (kq === "khong-nghe") return router.push("/today");
    if (kq === "ha-gia") {
      setChuHa(can.listPrice === null ? "" : vietGia(can.listPrice));
      requestAnimationFrame(() => (oHa.current?.focus(), oHa.current?.select()));
    }
  };
  const ghiHa = () => {
    const kq = dungHaGia(cuGia, chuHa, phiHa);
    if (kq.kind === "chua-hieu") return setBaoLoi(kq.loi);
    if (kq.kind === "chon-phi") return setBaoLoi("Chọn Bao phí (Alt+1) hay Không bao phí (Alt+2)");
    if (kq.kind === "hoi-lai") return setHoiLaiHa({ lenh: kq.lenh, cuMoi: kq.cuMoi, phanTram: kq.phanTram });
    void ghi("price_changed", kq.lenh, nhanHa(kq.lenh));
  };
  const ghiBan = () => {
    if (!loi) return setBaoLoi("Chọn một lối: 1 Đã cọc · 2 Sàn mình bán · 3 Chủ bán nơi khác");
    const kq = lenhBan(can.standardStatus, loi, { giaChot, ngay: ngayBan });
    if (!kq.ok) return setBaoLoi(kq.loi);
    void ghi("status_changed", kq.payload, BA_LOI.find((l) => l.ma === loi)!.nhan);
  };
  const chonLoi = (l: LoiBan) => {
    setLoi(l);
    setBaoLoi(null);
    if (l === "san-ban") requestAnimationFrame(() => oChot.current?.focus());
  };
  const onKeyHa = (e: KeyboardEvent<HTMLInputElement>) => {
    const so = e.code?.startsWith("Digit") ? e.code.slice(5) : e.key;
    if (e.altKey && (so === "1" || so === "2")) {
      e.preventDefault();
      return setPhiHa(so === "1" ? "included" : "excluded");
    }
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (hoiLaiHa) void ghi("price_changed", hoiLaiHa.lenh, nhanHa(hoiLaiHa.lenh));
      else ghiHa();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (hoiLaiHa) setHoiLaiHa(null);
      else chonKq(null);
    }
  };

  // ——— Danh sách hỏi: như hàng 28, ghi thẳng vào hồ sơ đang gọi ———
  const [dung, setDung] = useState(1);
  const [loiNhom, setLoiNhom] = useState<Record<string, string | null>>({});
  const [gia, setGia] = useState<GiaNhom & { lenh: LenhGia | null }>(() => {
    const chu = can.listPrice === null ? "" : vietGia(can.listPrice);
    return { chu, phi: cuGia.feeInclusion, hieuLa: hieuLa(chu, cuGia.feeInclusion), loi: null, hoiLai: null, lenh: null };
  });
  const ghiHoi = async (nhom: string, type: EventType, payload: Record<string, unknown>) => {
    const kq = await sua(hangId, type, payload);
    setLoiNhom((m) => ({ ...m, [nhom]: kq.ok ? null : moTaLoi(kq.loi) }));
  };
  const enterGia = () => {
    const kq = dungGhiGia(cuGia, gia.chu, gia.phi);
    if (kq.kind === "chua-hieu") return setGia((s) => ({ ...s, loi: kq.loi }));
    if (kq.kind === "chon-phi") return setGia((s) => ({ ...s, loi: "Chọn Bao phí (Alt+1) hay Không bao phí (Alt+2)" }));
    if (kq.kind === "hoi-lai") return setGia((s) => ({ ...s, hoiLai: { cuMoi: kq.cuMoi, phanTram: kq.phanTram }, lenh: kq.lenh }));
    void ghiHoi("price", "price_changed", kq.lenh);
  };
  const traLoiHoiLai = (dongY: boolean) => {
    if (dongY && gia.lenh) void ghiHoi("price", "price_changed", gia.lenh);
    setGia((s) => ({ ...s, hoiLai: null, lenh: null }));
  };
  const giaTri: Record<string, string | null> = {
    price: can.listPrice !== null && can.feeInclusion ? String(can.listPrice) : null,
    furnished: can.furnished,
    legalStatus: can.legalStatus,
    financing: can.financing,
    occupantType: can.occupantType,
  };

  // ——— Máy tính và so giá ———
  const [mayTinh, setMayTinh] = useState(() => mayTinhDau(can.listPrice, cuGia.feeInclusion));
  const phongNgu = useMemo(() => phongNguTheo(dm), [dm]);
  const pnCan = phongNgu(can.buildingName, can.unitNumber);
  const soGia = soGiaToa({
    can: { id: can.id, buildingName: can.buildingName, unitNumber: can.unitNumber, bedroomsTotal: pnCan, listPrice: can.listPrice, feeInclusion: cuGia.feeInclusion },
    cacCan: ds.map(
      (l): CanSo => ({ id: l.id, buildingName: l.buildingName, unitNumber: l.unitNumber, bedroomsTotal: phongNgu(l.buildingName, l.unitNumber), standardStatus: l.standardStatus, listPrice: l.listPrice, feeInclusion: (l.feeInclusion as FeeInclusion | null) ?? null, lastConfirmedAt: l.lastConfirmedAt }),
    ),
  });

  // ——— Phím: kết quả gọi trước, rồi danh sách hỏi ———
  const xuLy = useEffectEvent((e: globalThis.KeyboardEvent) => {
    const dang = document.activeElement;
    const laO = dang instanceof HTMLInputElement || dang instanceof HTMLTextAreaElement;
    const trongDs = !dang || dang === document.body || (danhSach.current?.contains(dang) ?? false);
    const cho: ChoTro = laO ? ((dang as HTMLElement).dataset.o === "gia" ? "o-gia" : "o-chu") : "khong";
    // Con trỏ ở một lựa chọn của khối kết quả (sau khi bấm chuột): phím của khối kết quả vẫn chạy, Enter ghi chứ không bấm lại
    // nút (bấm lại là bỏ chọn).
    const trongKq = !laO && dang instanceof HTMLElement && !!dang.closest('[data-slot="toggle-group-item"]') && (khoiKq.current?.contains(dang) ?? false);
    // Con trỏ ở nút khác ngoài danh sách: chỉ Ctrl+Enter, phím khác đi theo trình duyệt.
    if (!laO && !trongDs && !trongKq && !((e.ctrlKey || e.metaKey) && e.key === "Enter")) return;
    const k = xuLyPhimKetQua(e, cho, chon);
    if (k) {
      e.preventDefault();
      if (k.kind === "chon") chonKq(k.kq);
      else if (k.kind === "bo") chonKq(null);
      else if (k.kind === "loi-ban") chonLoi(k.loi);
      else router.push("/today");
      return;
    }
    if (cho === "khong" && e.key === "Enter" && !e.ctrlKey && !e.metaKey && (chon === "giu-gia" || chon === "ban")) {
      e.preventDefault();
      return chon === "giu-gia" ? void ghi("owner_confirmed", {}, NHAN_KQ["giu-gia"]) : ghiBan();
    }
    if (trongKq && e.key === "Enter" && !e.ctrlKey && !e.metaKey && chon === "ha-gia") {
      e.preventDefault();
      return hoiLaiHa ? void ghi("price_changed", hoiLaiHa.lenh, nhanHa(hoiLaiHa.lenh)) : ghiHa();
    }
    if (chon === "ban" || trongKq) return;
    const l = xuLyPhim(e, cho, dung);
    if (!l || l.kind === "da-goi" || l.kind === "xong") return;
    e.preventDefault();
    if (l.kind === "nhom") {
      setDung(l.toi);
      requestAnimationFrame(() => (l.toi === 0 ? (oGia.current?.focus(), oGia.current?.select()) : danhSach.current?.focus()));
    } else if (l.kind === "chon") void ghiHoi(l.ma, "details_changed", { [l.ma]: l.giaTri });
    else if (l.kind === "xoa" && l.ma !== "price" && giaTri[l.ma] !== null) void ghiHoi(l.ma, "details_changed", { [l.ma]: null });
    else if (l.kind === "phi") setGia((s) => ({ ...s, phi: l.phi, hieuLa: hieuLa(s.chu, l.phi), hoiLai: null, lenh: null }));
    else if (l.kind === "roi-o") danhSach.current?.focus();
  });
  useEffect(() => {
    const f = (e: globalThis.KeyboardEvent) => xuLy(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <FramePanel className="flex flex-col gap-2" aria-label="Căn đang gọi">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning-light">Nên gọi điều chỉnh giá</Badge>
          <Badge variant={can.standardStatus === "Active" ? "success-light" : "outline"}>{dau.nac}</Badge>
        </div>
        <h1 className="text-lg font-semibold">
          {dau.tieuDe} · {dau.gia}
        </h1>
        <p className="text-muted-foreground text-sm">{dau.phu}</p>
      </FramePanel>

      <FramePanel ref={khoiKq} className="flex flex-col gap-3" aria-label="Kết quả cuộc gọi">
        <h2 className={TIEU_MUC}>Kết quả cuộc gọi</h2>
        <ToggleGroup variant="outline" className="flex-wrap" value={chon ? [chon] : []} onValueChange={(v: string[]) => chonKq((v[v.length - 1] as KetQua | undefined) ?? null)}>
          {KET_QUA.map((k) => (
            <ToggleGroupItem key={k.ma} value={k.ma}>
              <Kbd>{k.phim}</Kbd> {k.nhan}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {chon === "ha-gia" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input ref={oHa} value={chuHa} onChange={(e) => (setChuHa(e.target.value), setHoiLaiHa(null), setBaoLoi(null))} onKeyDown={onKeyHa} aria-label="Giá mới" data-o="gia-moi" className="w-40" />
              <ToggleGroup variant="outline" size="sm" value={phiHa ? [phiHa] : []} onValueChange={(v: string[]) => v.length && setPhiHa(v[v.length - 1] as FeeInclusion)}>
                {(["included", "excluded"] as const).map((f, i) => (
                  <ToggleGroupItem key={f} value={f} tabIndex={-1}>
                    <Kbd>Alt+{i + 1}</Kbd> {NHAN_PHI[f][0]!.toUpperCase() + NHAN_PHI[f].slice(1)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            {(() => {
              const kq = dungHaGia(cuGia, chuHa, phiHa);
              return kq.kind === "ghi" || kq.kind === "hoi-lai" ? <p className="text-muted-foreground text-sm">{kq.hieuLa} · Enter ghi</p> : null;
            })()}
            {hoiLaiHa ? (
              <div className="flex flex-wrap items-center gap-2 text-sm" role="alertdialog" aria-label="Hỏi lại giá">
                <span>
                  Đổi {hoiLaiHa.cuMoi}
                  {hoiLaiHa.phanTram ? ` (${hoiLaiHa.phanTram})` : ""}?
                </span>
                <Button size="sm" onClick={() => void ghi("price_changed", hoiLaiHa.lenh, nhanHa(hoiLaiHa.lenh))}>
                  Ghi <Kbd>Enter</Kbd>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setHoiLaiHa(null)}>
                  Huỷ <Kbd>Esc</Kbd>
                </Button>
              </div>
            ) : null}
          </div>
        )}
        {chon === "giu-gia" && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Ghi «Còn · giữ giá» — tính là vừa xác nhận với chủ nhà.</span>
            <Button size="sm" onClick={() => void ghi("owner_confirmed", {}, NHAN_KQ["giu-gia"])}>
              Ghi <Kbd>Enter</Kbd>
            </Button>
          </div>
        )}
        {chon === "ban" && (
          <div className="flex flex-col gap-2">
            <ToggleGroup variant="outline" size="sm" className="flex-wrap" value={loi ? [loi] : []} onValueChange={(v: string[]) => v.length && chonLoi(v[v.length - 1] as LoiBan)}>
              {BA_LOI.map((l, i) => {
                const mo = loiMo(can.standardStatus, l.ma);
                return (
                  <ToggleGroupItem key={l.ma} value={l.ma} disabled={!mo.mo} title={mo.mo ? undefined : mo.lyDo}>
                    <Kbd>{i + 1}</Kbd> {l.nhan}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {loi === "san-ban" && (
              <div className="flex flex-wrap items-center gap-2">
                <Input ref={oChot} value={giaChot} onChange={(e) => setGiaChot(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), ghiBan())} aria-label="Giá chốt" placeholder="Giá chốt, vd 2,75 tỷ" className="w-44" data-o="gia-chot" />
                <Input type="date" value={ngayBan} onChange={(e) => setNgayBan(e.target.value)} aria-label="Ngày bán" className="w-44" data-o="ngay-ban" />
              </div>
            )}
            <Button size="sm" className="self-start" onClick={ghiBan}>
              Ghi <Kbd>Enter</Kbd>
            </Button>
          </div>
        )}
        {baoLoi ? <p className="text-destructive text-sm">{baoLoi}</p> : null}
        {canXem ? (
          <div className="flex flex-col items-start gap-2">
            <TrangThai
              kind="error"
              title={`Lần ghi chưa lên máy chủ: ${canXem.kind === "tu-choi" && canXem.reason ? canXem.reason : VI_SAO[canXem.kind]}`}
              description="Thao tác của bạn đang chờ ở «Cần xem» — chọn giữ hay bỏ ở đó."
            />
            <Button size="sm" variant="outline" onClick={() => moCanXem(true)}>
              Mở Cần xem
            </Button>
          </div>
        ) : daGhi ? (
          <div className="flex flex-col items-start gap-2">
            <TrangThai kind="notice" title={`Đã ghi: ${daGhi}`} />
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/today" />}>
              Về Hôm nay <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd>
            </Button>
          </div>
        ) : null}
        <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
          <Kbd>H</Kbd> <Kbd>G</Kbd> <Kbd>B</Kbd> <Kbd>K</Kbd> chọn · <Kbd>Esc</Kbd> bỏ · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> về Hôm nay
        </p>
      </FramePanel>

      <FramePanel className="flex flex-col gap-4" aria-label="Lịch sử trả giá">
        <h2 className={TIEU_MUC}>Lịch sử trả giá</h2>
        {ls.kind === "dang-tai" ? (
          <p className="text-muted-foreground text-sm">Đang tải lịch sử…</p>
        ) : (
          <Timeline defaultValue={ls.dong.length}>
            {ls.dong.map((d, i) => (
              <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
                <TimelineHeader>
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
                  <TimelineTitle className="text-sm">
                    {d.viec}
                    {d.phi || d.xacNhan ? (
                      <span className="font-normal text-muted-foreground">
                        {d.phi ? ` · ${d.phi}` : ""}
                        {d.xacNhan ? " · đã xác nhận với chủ" : ""}
                      </span>
                    ) : null}
                  </TimelineTitle>
                  <TimelineIndicator className="group-data-[orientation=vertical]/timeline:-left-5 size-2.5" />
                </TimelineHeader>
                <TimelineContent>
                  <TimelineDate className="mb-0 text-xs">
                    {d.ai} · {chuGioNgay(d.luc)}
                  </TimelineDate>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
        {khoiDay && khoiDay.kind === "chu" ? (
          <div className="flex flex-col gap-1" aria-label="Giá đáy">
            <span className={TIEU_MUC}>Giá đáy chủ từng nói · nội bộ</span>
            <span className="text-lg font-semibold">{khoiDay.chinh}</span>
            {khoiDay.phu ? <span className="text-muted-foreground text-sm">{khoiDay.phu}</span> : null}
          </div>
        ) : null}
      </FramePanel>

      <DanhSachHoi
        ref={danhSach}
        oGia={oGia}
        mucDu={dongMucDu(can)}
        chuaHoSo={false}
        dung={dung}
        giaTri={giaTri}
        loiNhom={loiNhom}
        gia={gia}
        onDung={(i) => setDung(i)}
        onChon={(ma, v) => void ghiHoi(ma, "details_changed", { [ma]: v })}
        onGia={(chu) => setGia((s) => ({ ...s, chu, hieuLa: hieuLa(chu, s.phi), loi: null, hoiLai: null, lenh: null }))}
        onPhi={(phi) => setGia((s) => ({ ...s, phi, hieuLa: hieuLa(s.chu, phi), hoiLai: null, lenh: null }))}
        onHoiLai={traLoiHoiLai}
        onKeyGia={(e) => {
          if (e.key !== "Enter" || e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          if (gia.hoiLai) traLoiHoiLai(true);
          else enterGia();
        }}
      />
      <TinhGia s={mayTinh} onDoi={(d: DoiMayTinh) => setMayTinh((s) => doiMayTinh(s, d))} />
      <SoGia kq={soGia} loaiCan={pnCan === null ? null : nhanLoaiCan(pnCan)} />
    </div>
  );
}
