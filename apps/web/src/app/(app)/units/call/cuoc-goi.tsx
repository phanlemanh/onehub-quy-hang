"use client";

// Chế độ cuộc gọi khai thác (hàng 28): giữ lead, hồ sơ căn của lead, phím và lời ghi; bốn khối trình bày ở `khoi.tsx`.
// Lead đọc thẳng API; hồ sơ căn đọc và ghi qua bộ đồng bộ trên máy — mỗi lựa chọn một sự kiện, mất mạng vẫn ghi (KH-cg-tren-may).
import type { CatalogData } from "@quy-hang/core";
import { DANH_SACH_HOI, type EventType } from "@quy-hang/core/listing";
import { soGiaToa, type CanSo, type FeeInclusion } from "@quy-hang/core/pricing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { useBoDongBo, useDanhSachHang, useSuaHang } from "@/lib/sync/react";
import { moTaLoi } from "../../inventory/cell-edit/lenh";
import { useDanhMuc } from "../../inventory/danh-muc";
import { nhanLoaiCan } from "../../inventory/ghep-danh-muc";
import { thuocTinh as thuocTinhDanhMuc } from "../ho-so/ho-so";
import { dungGhiGia, goiYGia, hieuLa, type LenhGia } from "./gia";
import { daCoMocGoiDau, taoMocGoiDau } from "./goi-dau";
import { taoHoSoLead } from "./ho-so-lead";
import { BaCot, DangTai, DanhSachHoi, SoGia, TheLead, TinhGia, type GiaNhom, type ThuocTinhLead } from "./khoi";
import { doiMayTinh, mayTinhDau, type DoiMayTinh } from "./may-tinh";
import { dongMucDu } from "./muc-du";
import { docLeadCuocGoi, KHONG_THAY_LEAD, LOI_TAI_LEAD, type LeadCuocGoi } from "./nguon";
import { xuLyPhim, type ChoTro } from "./phim";

const chuan = (s: string) => s.trim().toLowerCase();
const GIA = DANH_SACH_HOI.findIndex((m) => m.ma === "price");

/** Số phòng ngủ theo danh mục, khoá toà + mã căn; ngoài danh mục là `null`. */
function phongNguTheo(dm: CatalogData | null) {
  const m = new Map<string, number | null>();
  for (const k of dm?.subdivisions ?? []) for (const b of k.buildings) for (const u of b.units) m.set(`${chuan(b.buildingName)}\u0000${chuan(u.unitNumber)}`, u.bedroomsTotal);
  return (toa: string, ma: string | null) => (ma ? (m.get(`${chuan(toa)}\u0000${chuan(ma)}`) ?? null) : null);
}

export function CuocGoi({ leadId, san }: { leadId: string | null; san: string }) {
  const [tai, setTai] = useState<{ kind: "dang" } | { kind: "co"; lead: LeadCuocGoi } | { kind: "vang" } | { kind: "loi" }>(leadId ? { kind: "dang" } : { kind: "vang" });
  const [lan, setLan] = useState(0);
  useEffect(() => {
    if (!leadId) return;
    let huy = false;
    void docLeadCuocGoi(goiFetch, leadId).then((kq) => !huy && setTai(kq));
    return () => {
      huy = true;
    };
  }, [leadId, lan]);

  if (tai.kind === "dang") return <DangTai />;
  if (tai.kind === "vang")
    return (
      <div className="flex flex-col items-start gap-2 p-4">
        <TrangThai kind="notice" title={KHONG_THAY_LEAD} />
        <Button size="sm" nativeButton={false} render={<Link href="/today" />}>
          Về Hôm nay
        </Button>
      </div>
    );
  if (tai.kind === "loi")
    return (
      <div className="flex flex-col items-start gap-2 p-4">
        <TrangThai kind="error" title={LOI_TAI_LEAD} />
        <Button size="sm" variant="outline" onClick={() => (setTai({ kind: "dang" }), setLan((n) => n + 1))}>
          Thử lại
        </Button>
      </div>
    );
  return <ManCuocGoi key={tai.lead.id} lead={tai.lead} san={san} />;
}

function ManCuocGoi({ lead: leadDau, san }: { lead: LeadCuocGoi; san: string }) {
  const router = useRouter();
  const { bd } = useBoDongBo();
  const sua = useSuaHang();
  const ds = useDanhSachHang();
  const dm = useDanhMuc(san);
  const [lead, setLead] = useState(leadDau);
  const moc = useMemo(() => taoMocGoiDau(goiFetch, leadDau.id, daCoMocGoiDau(leadDau.stage)), [leadDau]);
  const hoSo = useMemo(() => taoHoSoLead(goiFetch, leadDau.id, leadDau.listingId), [leadDau]);
  const [listingId, setListingId] = useState(leadDau.listingId);
  const [dung, setDung] = useState(GIA);
  const [loiNhom, setLoiNhom] = useState<Record<string, string | null>>({});
  const [loiThe, setLoiThe] = useState<string | null>(null);
  const [dangGoi, setDangGoi] = useState(false);
  const danhSach = useRef<HTMLDivElement>(null);
  const oGia = useRef<HTMLInputElement>(null);

  const can = listingId ? (ds.find((l) => l.id === listingId) ?? null) : null;
  const mucDu = dongMucDu(can);

  // ——— Mốc gọi đầu ———
  const ghiMoc = useCallback(async () => {
    setDangGoi(true);
    const kq = await moc.ghiNeuChua();
    setDangGoi(false);
    if (!kq.ok) return setLoiThe(kq.loi);
    setLoiThe(null);
    if (kq.daGhi) setLead((l) => ({ ...l, stage: "called" }));
  }, [moc]);

  // ——— Ghi một câu trả lời: hồ sơ (tạo một lần) → sự kiện trên máy → mốc gọi đầu ———
  const ghi = useCallback(
    async (nhom: string, type: EventType, payload: Record<string, unknown>): Promise<boolean> => {
      const hs = await hoSo.lay();
      if (!hs.ok) {
        setLoiNhom((m) => ({ ...m, [nhom]: hs.loi }));
        return false;
      }
      setListingId(hs.id);
      // Hồ sơ vừa tạo chưa có trên máy: kéo về rồi mới ghi được.
      for (let i = 0; i < 2 && !bd.danhSach().some((l) => l.id === hs.id); i++) await bd.thuNgay();
      const kq = await sua(hs.id, type, payload);
      if (!kq.ok) {
        setLoiNhom((m) => ({ ...m, [nhom]: kq.loi.kind === "not-found" ? "Hồ sơ căn chưa về máy — thử lại khi có mạng." : moTaLoi(kq.loi) }));
        return false;
      }
      setLoiNhom((m) => ({ ...m, [nhom]: null }));
      void ghiMoc();
      return true;
    },
    [bd, hoSo, sua, ghiMoc],
  );

  // ——— Nhóm Giá và phí ———
  const cuGia = { listPrice: can?.listPrice ?? null, feeInclusion: (can?.feeInclusion as FeeInclusion | null) ?? null };
  const [gia, setGia] = useState<GiaNhom & { lenh: LenhGia | null }>(() => {
    const g = goiYGia(null, leadDau);
    return { chu: g.chu, phi: g.phi, hieuLa: hieuLa(g.chu, g.phi), loi: null, hoiLai: null, lenh: null };
  });
  // Hồ sơ có giá thì ô gợi giá của hồ sơ — một lần khi hồ sơ về máy.
  const daGoiYHoSo = useRef(false);
  useEffect(() => {
    if (daGoiYHoSo.current || !can || can.listPrice === null) return;
    daGoiYHoSo.current = true;
    const g = goiYGia({ listPrice: can.listPrice, feeInclusion: can.feeInclusion as FeeInclusion | null }, leadDau);
    setGia((s) => ({ ...s, chu: g.chu, phi: g.phi, hieuLa: hieuLa(g.chu, g.phi) }));
  }, [can, leadDau]);

  const doiChuGia = (chu: string) => setGia((s) => ({ ...s, chu, hieuLa: hieuLa(chu, s.phi), loi: null, hoiLai: null, lenh: null }));
  const doiPhi = (phi: FeeInclusion) => setGia((s) => ({ ...s, phi, hieuLa: hieuLa(s.chu, phi), hoiLai: null, lenh: null }));
  const ghiGia = async (lenh: LenhGia) => {
    if (await ghi("price", "price_changed", lenh)) setGia((s) => ({ ...s, hoiLai: null, lenh: null }));
  };
  const enterGia = () => {
    const kq = dungGhiGia(cuGia, gia.chu, gia.phi);
    if (kq.kind === "chua-hieu") return setGia((s) => ({ ...s, loi: kq.loi }));
    if (kq.kind === "chon-phi") return setGia((s) => ({ ...s, loi: "Chọn Bao phí (Alt+1) hay Không bao phí (Alt+2)" }));
    if (kq.kind === "hoi-lai") return setGia((s) => ({ ...s, hoiLai: { cuMoi: kq.cuMoi, phanTram: kq.phanTram }, lenh: kq.lenh }));
    void ghiGia(kq.lenh);
  };
  const traLoiHoiLai = (dongY: boolean) => {
    if (dongY && gia.lenh) void ghiGia(gia.lenh);
    else setGia((s) => ({ ...s, hoiLai: null, lenh: null }));
  };
  const onKeyGia = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    if (gia.hoiLai) traLoiHoiLai(true);
    else enterGia();
  };

  // ——— Máy tính: mở với giá của hồ sơ hay của lead, không ghi gì ———
  const [mayTinh, setMayTinh] = useState(() => mayTinhDau(leadDau.listPrice, leadDau.feeInclusion));
  const doiMay = (d: DoiMayTinh) => setMayTinh((s) => doiMayTinh(s, d));

  // ——— Phím ———
  const veDanhSach = () => danhSach.current?.focus();
  // Vào ô giá thì chọn sẵn cả chữ: gõ là thay giá gợi ý.
  const vaoOGia = () => {
    oGia.current?.focus();
    oGia.current?.select();
  };
  const doiNhom = (i: number) => {
    setDung(i);
    // Vào nhóm giá thì con trỏ ở ô giá; nhóm khác thì về danh sách để phím số chọn.
    requestAnimationFrame(() => (i === GIA ? vaoOGia() : danhSach.current?.focus()));
  };
  const giaTri: Record<string, string | null> = {
    price: can && can.listPrice !== null && can.feeInclusion ? String(can.listPrice) : null,
    furnished: can?.furnished ?? null,
    legalStatus: can?.legalStatus ?? null,
    financing: can?.financing ?? null,
    occupantType: can?.occupantType ?? null,
  };

  const xuLy = useEffectEvent((e: globalThis.KeyboardEvent) => {
    const dang = document.activeElement;
    const trongDs = !dang || dang === document.body || (danhSach.current?.contains(dang) ?? false);
    const laO = dang instanceof HTMLInputElement || dang instanceof HTMLTextAreaElement;
    const cho: ChoTro = laO ? ((dang as HTMLElement).dataset.o === "gia" ? "o-gia" : "o-chu") : "khong";
    // Con trỏ ở nút ngoài danh sách: Tab đi theo trình duyệt.
    if (!laO && !trongDs && e.key === "Tab") return;
    // Nhóm giá đang đứng mà con trỏ ở danh sách: Enter vào ô giá.
    if (cho === "khong" && dung === GIA && e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      return vaoOGia();
    }
    if (gia.hoiLai && cho === "o-gia" && e.key === "Escape") {
      e.preventDefault();
      return traLoiHoiLai(false);
    }
    const lenh = xuLyPhim(e, cho, dung);
    if (!lenh) return;
    e.preventDefault();
    if (lenh.kind === "nhom") doiNhom(lenh.toi);
    else if (lenh.kind === "chon") void ghi(lenh.ma, "details_changed", { [lenh.ma]: lenh.giaTri });
    else if (lenh.kind === "xoa" && lenh.ma !== "price" && giaTri[lenh.ma] !== null) void ghi(lenh.ma, "details_changed", { [lenh.ma]: null });
    else if (lenh.kind === "phi") doiPhi(lenh.phi);
    else if (lenh.kind === "roi-o") veDanhSach();
    else if (lenh.kind === "da-goi") void ghiMoc();
    else if (lenh.kind === "xong") router.push("/today");
  });
  useEffect(() => {
    const f = (e: globalThis.KeyboardEvent) => xuLy(e);
    window.addEventListener("keydown", f);
    // Mở màn: con trỏ ở danh sách hỏi để phím chạy ngay.
    requestAnimationFrame(() => danhSach.current?.focus());
    return () => window.removeEventListener("keydown", f);
  }, []);

  // ——— So giá toà: căn trên máy kèm số phòng ngủ của danh mục ———
  const phongNgu = useMemo(() => phongNguTheo(dm), [dm]);
  const phongNguLead = phongNgu(lead.buildingName, lead.unitNumber);
  const soGia = soGiaToa({
    can: { id: listingId, buildingName: lead.buildingName, unitNumber: lead.unitNumber, bedroomsTotal: phongNguLead, ...(can?.listPrice != null && can.feeInclusion ? { listPrice: can.listPrice, feeInclusion: can.feeInclusion as FeeInclusion } : { listPrice: lead.listPrice, feeInclusion: lead.feeInclusion }) },
    cacCan: ds.map(
      (l): CanSo => ({
        id: l.id,
        buildingName: l.buildingName,
        unitNumber: l.unitNumber,
        bedroomsTotal: phongNgu(l.buildingName, l.unitNumber),
        standardStatus: l.standardStatus,
        listPrice: l.listPrice,
        feeInclusion: (l.feeInclusion as FeeInclusion | null) ?? null,
        lastConfirmedAt: l.lastConfirmedAt,
      }),
    ),
  });

  const tt: ThuocTinhLead = !lead.unitNumber ? { kind: "chi-toa" } : ((t) => (t.kind === "co" ? { kind: "co", truong: t.truong.filter(([k]) => ["Loại căn", "Diện tích", "Tầng", "Hướng"].includes(k)) } : t))(thuocTinhDanhMuc(dm, lead.buildingName, lead.unitNumber));

  return (
    <BaCot
      the={<TheLead lead={lead} thuocTinh={tt} onDaGoi={() => void ghiMoc()} dangGhi={dangGoi} loi={loiThe} />}
      hoi={
        <DanhSachHoi
          ref={danhSach}
          oGia={oGia}
          mucDu={mucDu}
          chuaHoSo={!listingId}
          dung={dung}
          giaTri={giaTri}
          loiNhom={loiNhom}
          gia={gia}
          onDung={(i) => setDung(i)}
          onChon={(ma, v) => void ghi(ma, "details_changed", { [ma]: v })}
          onGia={doiChuGia}
          onPhi={doiPhi}
          onHoiLai={traLoiHoiLai}
          onKeyGia={onKeyGia}
        />
      }
      gia={
        <>
          <TinhGia s={mayTinh} onDoi={doiMay} />
          <SoGia kq={soGia} loaiCan={phongNguLead === null ? null : nhanLoaiCan(phongNguLead)} />
        </>
      }
    />
  );
}
