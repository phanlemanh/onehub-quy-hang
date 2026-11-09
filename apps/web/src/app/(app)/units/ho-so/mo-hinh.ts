/**
 * Mô hình thuần của hồ sơ căn (hồ sơ ho-so-dien-thoai-product-detail-5): phần «tính dữ liệu» của `HoSoCan` tách khỏi hook,
 * để hai thân — thân cột (máy tính, hàng 17) và thân điện thoại (`product-detail-5`) — dựng từ cùng một dữ liệu. Không gọi
 * mạng, không đọc `window`: bài kiểm gọi thẳng. Quyền đọc từ cờ của lõi (`lopPhuHoSo`, hàng 33) — không rẽ theo tên vai,
 * không tự lọc trường.
 */
import type { CatalogData } from "@quy-hang/core";
import { lopPhuHoSo, type CoHoSo } from "@quy-hang/core/access";
import { nhanViTri, type ListingEvent } from "@quy-hang/core/listing";
import type { LanThu, ListingView } from "@/lib/sync/types";
import { chiMuc, type CanNgoaiKhuXem } from "../../inventory/ghep-danh-muc";
import { khoCuaSo } from "../../today/mobile/kho";
import { dauCuaCan, hienNutSanSang, type Dich } from "../ready/san-sang";
import {
  cacLanRao,
  chonLanRao,
  coBaoSai,
  dongLichSu,
  lanRaoCua,
  NHAN_PHAN,
  phanLanRao,
  thuocTinh,
  thuocTinhKhongToa,
  timCan,
  trangThaiLichSu,
  type ChonCan,
  type DongLichSu,
  type LanRao,
  type ThuocTinh,
  type TrangThaiLichSu,
} from "./ho-so";

// ——— Chọn thân theo khổ ———

export type Than = "dien-thoai" | "cot";
/**
 * Chỗ mở hồ sơ: toàn màn `/units/<mã>`, trong Bảng hàng thẻ trên điện thoại, cột kéo chia cạnh Bảng hàng, cột phải của
 * Hôm nay. Hai chỗ sau chỉ có trên máy tính (bố cục của chúng không dựng dưới 768) nên luôn là thân cột.
 */
export type ChoHoSo = "toan-man" | "bang-the" | "canh-bang" | "cot-hom-nay";

/** Thân của hồ sơ theo khổ cửa sổ: dưới 768 (đúng hàm khổ của Hôm nay điện thoại) là thân điện thoại. */
export function chonThan(w: { innerWidth: number }, cho: ChoHoSo): Than {
  if (cho === "canh-bang" || cho === "cot-hom-nay") return "cot";
  return khoCuaSo(w) ? "dien-thoai" : "cot";
}

// ——— Nút chính dính đáy (thân điện thoại) ———

export const NHAN_GHI_CUOC_GOI = "Ghi cuộc gọi";
export const duongGhiCuocGoi = (id: string) => `/units/call?hang=${encodeURIComponent(id)}`;

export type NutChinh = { kind: "hoi-dau-chu" } | { kind: "ghi-cuoc-goi"; href: string } | null;

/**
 * Một nút chính theo cờ của lớp phủ: người không thấy nguồn hỏi đầu chủ (chỉ mở bảng chia sẻ — bất biến 3); người thấy
 * nguồn và vào được màn ghi cuộc gọi (cờ `ghiCuocGoi`) ghi cuộc gọi của căn; người thấy nguồn mà không vào được màn ấy
 * (trưởng nhóm không có vai Đầu chủ) không có nút chính — Hỏi-1 của va-nut-ghi-cuoc-goi-truong-nhom; căn chưa có mã không
 * có nút chính (chưa có gì để hỏi hay ép giá).
 */
export function nutChinh(o: { co: Pick<CoHoSo, "hoiDauChu" | "ghiCuocGoi">; chuaMa: boolean; canId: string }): NutChinh {
  if (o.chuaMa) return null;
  if (o.co.hoiDauChu) return { kind: "hoi-dau-chu" };
  return o.co.ghiCuocGoi ? { kind: "ghi-cuoc-goi", href: duongGhiCuocGoi(o.canId) } : null;
}

// ——— Thông số chính ———

const so = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const chuan = (s: string) => s.trim().toLowerCase();

/** Diện tích · Phòng ngủ · Hướng của căn từ danh mục đã giữ (RESO `LivingArea`, `BedroomsTotal`, `DirectionFaces`). */
export function thongSoChinh(dm: CatalogData | null, toa: string, ma: string): [string, string][] | null {
  for (const khu of dm?.subdivisions ?? [])
    for (const b of khu.buildings)
      if (chuan(b.buildingName) === chuan(toa))
        for (const u of b.units)
          if (chuan(u.unitNumber) === chuan(ma))
            return [
              ["Diện tích", u.livingArea === null ? "—" : `${so.format(u.livingArea)} m²`],
              ["Phòng ngủ", u.bedroomsTotal === null ? "—" : u.bedroomsTotal === 0 ? "Studio" : String(u.bedroomsTotal)],
              ["Hướng", u.directionFaces ?? "—"],
            ];
  return null;
}

// ——— Mô hình ———

const hai = (n: number) => String(n).padStart(2, "0");
/** «28/10 09:12» — giờ máy người xem. */
export const luc = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)} ${hai(d.getHours())}:${hai(d.getMinutes())}`;
};

export type VaoHoSo = {
  nguoi: string;
  vai: readonly string[];
  /** Danh sách hàng trên máy (bản đã gồm thao tác chờ gửi). */
  ds: readonly ListingView[];
  ngan: { listings: readonly unknown[] | null; history: Record<string, readonly ListingEvent[]>; lastAttempt: LanThu | null; lastPullAt: string | null };
  danhMuc: CatalogData | null;
  chon: ChonCan;
  /** Hồ sơ theo hàng (`?hang=`): hàng chưa có mã, hay `null` khi không thấy hàng; vắng là hồ sơ theo căn. */
  chuaMa?: ListingView | null;
  /** Hồ sơ theo hàng của hàng không toà — lô, ngoài khu (hàng 79): thuộc tính theo loại hình, không ô gắn mã. */
  khongToa?: ListingView | null;
  /** Căn ngoài khu của sàn giữ trên máy (hàng 79) — loại hình, địa chỉ của hàng ngoài khu. */
  ngoaiKhu?: readonly CanNgoaiKhuXem[] | null;
  /** Lần rao đã có lượt kéo lịch sử xong. */
  daKeo: Readonly<Record<string, true>>;
  /** Điều còn thiếu sau lần bấm «Sẵn sàng bán» gần nhất (hàng 23). */
  thieuCua: { id: string; dich: readonly Dich[] } | null;
  ngoaiTuyen: boolean;
  dongHref?: string;
  duong: (c: ChonCan) => string;
};

export type LanRaoDuong = LanRao & { href: string; thu: number };

export type HoSoCo = {
  kind: "co";
  ma: string;
  toa: string;
  chuaMa: ListingView | null;
  /** Hàng không toà đang xem (hàng 79) — ảnh, hỏi đầu chủ, báo sai thông tin căn khoá theo toà + mã nên không có. */
  khongToa: ListingView | null;
  can: ListingView;
  dangXem: LanRao;
  /** Mọi lần rao của căn, mới nhất trên, kèm đường chọn và số thứ tự «Lần n». */
  lan: LanRaoDuong[];
  co: CoHoSo;
  dauChu: string | null;
  tt: ThuocTinh | null;
  coBaoSai: boolean;
  thongSo: [string, string][] | null;
  /** Khu · toà · loại hình. */
  dauCot: string;
  xacNhan: string;
  gia: string;
  phi: string | null;
  mucDu: { co: number; tren: number; chu: string };
  truongLanRao: [string, string][];
  hienSanSang: boolean;
  lichSu: DongLichSu[];
  ttls: TrangThaiLichSu;
  /** Mất mạng: đang xem bản trên máy, kèm giờ đồng bộ gần nhất. */
  banTrenMay: string | null;
  moToanMan: string | null;
  dongHref: string | null;
  moHangKia: (id: string) => string | null;
};

export type MoHinhHoSo =
  | { kind: "cho-tai" }
  | { kind: "loi"; moTa: string }
  | { kind: "khong"; theoHang: boolean; ma: string; dongHref: string | null }
  | { kind: "nhieu"; ma: string; toa: { ten: string; href: string }[]; dongHref: string | null }
  | HoSoCo;

/** Ô của mục «Lần rao đang mở» mang «Chưa có» khi lần bấm «Sẵn sàng bán» gần nhất báo thiếu đúng điều ấy. */
function danhDauChuaCo(nhan: string, dich: readonly Dich[]): boolean {
  return (nhan === NHAN_PHAN.legalStatus && dich.includes("legalStatus")) || (nhan === NHAN_PHAN.occupantType && dich.includes("occupantType"));
}

/** Địa chỉ hồ sơ theo hàng: đường đóng cột (giữ các tham số khác của màn) cộng `hang=`; vắng đường đóng thì địa chỉ tương đối. */
export function duongTheoHang(dongHref: string | null, id: string): string {
  const [goc = "", q = ""] = (dongHref ?? "").split("?");
  const m = new URLSearchParams(q);
  m.set("hang", id);
  return `${goc}?${m}`;
}

export function moHinhHoSo(v: VaoHoSo): MoHinhHoSo {
  const { ds, ngan, chon, duong } = v;
  // Hàng không toà đi đường hồ sơ theo hàng như hàng chưa có mã; khác ở thuộc tính và ô gắn mã.
  const khongToa = v.khongToa ?? null;
  const chuaMa = khongToa ?? v.chuaMa;
  const dongHref = v.dongHref ?? null;

  // Kho trên máy chưa có hàng: lượt kéo đầu đang chạy thì khung chờ; lượt kéo hỏng thì lỗi kèm «Thử lại».
  if (ngan.listings === null) {
    if (ngan.lastAttempt !== null && ngan.lastAttempt !== "ok")
      return { kind: "loi", moTa: v.ngoaiTuyen || ngan.lastAttempt === "mang" ? "Cần mạng cho lần tải đầu trên máy này." : "Thử lại sau giây lát." };
    return { kind: "cho-tai" };
  }

  const theoHang = chuaMa !== undefined;
  const viTriHang = (h: ListingView) => h.buildingName ?? ((h.offCompoundUnitId && v.ngoaiKhu?.find((c) => c.id === h.offCompoundUnitId)?.unparsedAddress) || nhanViTri(h));
  const tim = chuaMa ? { kind: "mot" as const, toa: viTriHang(chuaMa), hang: [chuaMa] } : theoHang ? { kind: "khong" as const } : timCan(ds, chon.ma, chon.toa);
  if (tim.kind === "khong") return { kind: "khong", theoHang, ma: chon.ma, dongHref };
  if (tim.kind === "nhieu") return { kind: "nhieu", ma: chon.ma, toa: tim.toa.map((t) => ({ ten: t, href: duong({ ma: chon.ma, toa: t, lan: null }) })), dongHref };

  const toa = tim.toa;
  const lanRao = chuaMa ? [lanRaoCua(chuaMa, ngan.history)] : cacLanRao(ds, toa, chon.ma, ngan.history);
  const lanId = chonLanRao(lanRao, chon.lan);
  const can = ds.find((l) => l.id === lanId)!;
  const tt = khongToa ? thuocTinhKhongToa(chiMuc(v.danhMuc, v.ngoaiKhu), khongToa) : chuaMa ? null : thuocTinh(v.danhMuc, toa, chon.ma);
  const p = phanLanRao(can);
  const lichSuGoc = ngan.history[can.id] ?? [];
  const ttls = trangThaiLichSu({ coBan: lichSuGoc.length > 0, dangTai: !v.daKeo[can.id], lan: ngan.lastAttempt, ngoaiTuyen: v.ngoaiTuyen });
  const dangXem = lanRao.find((r) => r.id === can.id)!;
  const dichThieu = dauCuaCan(v.thieuCua, can.id);
  const dauChu = can.listAgentKey ?? null;
  const co = lopPhuHoSo({ userId: v.nguoi, roles: v.vai }, dauChu);
  const tuoi = can.freshness as { confirmed?: boolean; ageDays?: number } | undefined;
  const loaiHinh = tt?.kind === "co" ? tt.truong.find(([k]) => k === "Loại hình")?.[1] : null;
  const matMang = v.ngoaiTuyen || ngan.lastAttempt === "mang";

  return {
    kind: "co",
    ma: chon.ma,
    toa,
    chuaMa: khongToa ? null : (chuaMa ?? null),
    khongToa,
    can,
    dangXem,
    // Hàng không toà: «toà» là chữ vị trí, link theo toà + mã không tìm lại được — giữ đường mở theo hàng.
    lan: lanRao.map((r, i) => ({ ...r, href: khongToa ? duongTheoHang(dongHref, r.id) : duong({ ma: chon.ma, toa, lan: r.id }), thu: lanRao.length - i })),
    co,
    dauChu,
    tt,
    coBaoSai: tt !== null && !khongToa && coBaoSai(tt),
    thongSo: chuaMa ? null : thongSoChinh(v.danhMuc, toa, chon.ma),
    dauCot: [tt?.kind === "co" ? tt.khu : null, toa, loaiHinh === "—" ? null : loaiHinh].filter(Boolean).join(" · "),
    xacNhan: tuoi?.confirmed ? (tuoi.ageDays === 0 ? "Xác nhận hôm nay" : `Xác nhận ${tuoi.ageDays} ngày trước`) : "Chưa xác nhận với chủ nhà",
    gia: dichThieu.includes("gia") ? "Chưa có giá về tay" : p.gia,
    phi: p.phi,
    mucDu: {
      co: p.mucDu.co,
      tren: p.mucDu.tren,
      chu: `Mức đủ thông tin${p.mucDu.thieu.length ? ` · thiếu ${p.mucDu.thieu.map((k) => (k === "listPrice" ? "Giá" : (NHAN_PHAN[k] ?? k))).join(", ")}` : ""}`,
    },
    truongLanRao: p.truong.map(([k, gt]): [string, string] => (danhDauChuaCo(k, dichThieu) ? [k, "Chưa có · điền ở Bảng hàng"] : [k, gt])),
    // Cờ của lớp phủ (hàng 33): người không giữ căn không có «Sẵn sàng bán»; máy chủ vẫn xét quyền.
    hienSanSang: co.sanSang && dangXem.dangMo && hienNutSanSang(can.standardStatus, true),
    lichSu: dongLichSu(lichSuGoc, v.nguoi),
    ttls,
    banTrenMay: matMang ? `Đang xem bản trên máy${ngan.lastPullAt ? ` · đồng bộ ${luc(ngan.lastPullAt)}` : ""}` : null,
    moToanMan: dongHref && !chuaMa ? `/units/${encodeURIComponent(chon.ma)}?${new URLSearchParams({ toa, lan: can.id })}` : null,
    dongHref,
    // «Mở hàng kia» của lỗi trùng căn: hồ sơ theo căn của hàng đang mở ấy, nếu máy này thấy nó.
    moHangKia: (id: string) => {
      const h = ds.find((l) => l.id === id);
      return h?.unitNumber ? duong({ ma: h.unitNumber, toa: h.buildingName, lan: h.id }) : null;
    },
  };
}
