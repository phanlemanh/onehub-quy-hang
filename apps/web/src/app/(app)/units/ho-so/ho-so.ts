/**
 * Lõi thuần của hồ sơ căn (hàng 17): đường của cột, tìm căn theo mã, thuộc tính tự điền, các lần rao và dòng lịch sử.
 * Đọc kho trên máy và danh mục đã giữ, không gọi mạng — kiểm bằng `node:test`.
 */
import type { CatalogData, CatalogSubdivisionData, CatalogUnitData } from "@quy-hang/core";
import { completeness, type ListingEvent, type StandardStatus } from "@quy-hang/core/listing";
import type { LanThu, ListingView } from "@/lib/sync/types";
import { nhanVai } from "@/lib/vai";
import { dinhDangGia, FEE_LABEL, STATUS_LABEL } from "../../inventory/cot";
import { nhanLoaiCan } from "../../inventory/ghep-danh-muc";

const chuan = (s: string) => s.trim().toLowerCase();
const cungCan = (l: { buildingName: string; unitNumber: string | null }, toa: string, ma: string) =>
  l.unitNumber !== null && chuan(l.buildingName) === chuan(toa) && chuan(l.unitNumber) === chuan(ma);

// ——— Đường của cột ———

export type ChonCan = { ma: string; toa: string | null; lan: string | null };
const THAM_SO = ["unit", "toa", "lan"] as const;

/** Cột đang mở theo URL: `?unit=<mã căn>&toa=<toà>&lan=<lần rao>`; không có `unit` thì không mở. */
export function docCot(q: URLSearchParams): ChonCan | null {
  const ma = q.get("unit")?.trim();
  if (!ma) return null;
  return { ma, toa: q.get("toa")?.trim() || null, lan: q.get("lan")?.trim() || null };
}

/** Bấm dòng: luôn kèm toà và lần rao — link chép không đổi nghĩa khi danh mục thêm toà trùng mã sau này. */
export function moCot(q: URLSearchParams, c: { ma: string; toa: string; lan: string }): string {
  const m = new URLSearchParams(q);
  m.set("unit", c.ma);
  m.set("toa", c.toa);
  m.set("lan", c.lan);
  return m.toString();
}

/** Đóng cột: bỏ ba tham số của cột, giữ nguyên mọi tham số khác. */
export function dongCot(q: URLSearchParams): string {
  const m = new URLSearchParams(q);
  for (const k of THAM_SO) m.delete(k);
  return m.toString();
}

// ——— Tìm căn theo mã ———

export type KetQuaTim = { kind: "mot"; toa: string; hang: ListingView[] } | { kind: "nhieu"; toa: string[] } | { kind: "khong" };

/**
 * Căn của mã trên kho trên máy (hàng «Chỉ tôi» của người khác không có trên máy — API không trả). Mã có ở hai toà mà
 * không chỉ toà thì liệt toà để chọn, không chọn hộ (hàng 63).
 */
export function timCan(ds: readonly ListingView[], ma: string, toa: string | null): KetQuaTim {
  const khop = ds.filter((l) => l.unitNumber !== null && chuan(l.unitNumber) === chuan(ma));
  const theoToa = toa ? khop.filter((l) => chuan(l.buildingName) === chuan(toa)) : khop;
  const cacToa = [...new Map(theoToa.map((l) => [chuan(l.buildingName), l.buildingName])).values()].sort((a, b) => a.localeCompare(b, "vi"));
  if (cacToa.length === 0) return { kind: "khong" };
  if (cacToa.length > 1) return { kind: "nhieu", toa: cacToa };
  return { kind: "mot", toa: cacToa[0]!, hang: theoToa };
}

// ——— Thuộc tính căn ———

/** Loại hình RESO → nhãn của Tham chiếu §4 (căn hộ, nhà phố, biệt thự, đất). */
export const LOAI_HINH: Record<string, string> = {
  Condominium: "Căn hộ",
  Townhouse: "Nhà phố",
  "Single Family Residence": "Biệt thự",
  "Unimproved Land": "Đất",
};

export type ThuocTinh = { kind: "co"; khu: string; truong: [string, string][] } | { kind: "ngoai-danh-muc" };
export const coBaoSai = (t: ThuocTinh) => t.kind === "co";

const so = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

/** Thuộc tính tự điền từ danh mục, khoá theo toà + mã căn (hai toà trùng mã không lẫn nhau). Khoá, không sửa. */
export function thuocTinh(dm: CatalogData | null, toa: string, ma: string): ThuocTinh {
  let gap: { khu: CatalogSubdivisionData; u: CatalogUnitData; toa: string } | null = null;
  for (const khu of dm?.subdivisions ?? [])
    for (const b of khu.buildings)
      if (chuan(b.buildingName) === chuan(toa)) for (const u of b.units) if (chuan(u.unitNumber) === chuan(ma)) gap = { khu, u, toa: b.buildingName };
  if (!gap) return { kind: "ngoai-danh-muc" };
  const { khu, u } = gap;
  return {
    kind: "co",
    khu: khu.subdivisionName,
    truong: [
      ["Loại căn", nhanLoaiCan(u.bedroomsTotal)],
      ["Diện tích", u.livingArea === null ? "—" : `${so.format(u.livingArea)} m²`],
      ["Tầng", u.floor === null ? "—" : String(u.floor)],
      ["Hướng", u.directionFaces ?? "—"],
      ["Toà", gap.toa],
      ["Khu", khu.subdivisionName],
      // Danh mục máy khách đọc (`GET /api/v1/catalog`) có thể chưa mang loại hình — khi vắng thì «—», không đoán.
      ["Loại hình", u.propertySubType ? (LOAI_HINH[u.propertySubType] ?? u.propertySubType) : "—"],
    ],
  };
}

// ——— Lần rao ———

const DANG_MO: readonly StandardStatus[] = ["Incomplete", "Active", "Pending", "Hold"];
export const laDangMo = (s: StandardStatus) => DANG_MO.includes(s);

export type LanRao = { id: string; trangThai: string; dangMo: boolean; gia: string; tu: string | null };

/**
 * Mọi lần rao của căn trên máy (bản trên máy — đã gồm thao tác chờ gửi), mới nhất trên theo lúc tạo trong lịch sử đã
 * tải; lần rao chưa tải lịch sử xếp sau, lần đang mở trước lần đã ngừng.
 */
export function cacLanRao(ds: readonly ListingView[], toa: string, ma: string, lichSu: Record<string, readonly ListingEvent[]>): LanRao[] {
  const tao = (id: string) => lichSu[id]?.find((e) => e.type === "created")?.occurredAt ?? null;
  return ds
    .filter((l) => cungCan(l, toa, ma))
    .map((l) => ({ id: l.id, trangThai: STATUS_LABEL[l.standardStatus], dangMo: laDangMo(l.standardStatus), gia: dinhDangGia(l.listPrice), tu: tao(l.id) }))
    .sort((a, b) => (b.tu ?? "").localeCompare(a.tu ?? "") || Number(b.dangMo) - Number(a.dangMo));
}

/** Lần rao đang xem: `lan` của URL nếu thuộc căn; vắng thì lần đang mở; không còn lần mở thì lần mới nhất. */
export function chonLanRao(ds: readonly LanRao[], lan: string | null): string | null {
  if (lan && ds.some((r) => r.id === lan)) return lan;
  return (ds.find((r) => r.dangMo) ?? ds[0])?.id ?? null;
}

export const NHAN_PHAN: Record<string, string> = { price: "Giá", furnished: "Nội thất", legalStatus: "Pháp lý", financing: "Tài chính", occupantType: "Tình trạng sử dụng" };

/** Phần của lần rao đang xem và mức đủ tính bằng luật lõi trên bản trên máy. */
export function phanLanRao(l: ListingView): { gia: string; phi: string | null; truong: [string, string][]; mucDu: { co: number; tren: number; thieu: string[] } } {
  const md = completeness(l);
  return {
    gia: dinhDangGia(l.listPrice),
    phi: l.feeInclusion ? (FEE_LABEL[l.feeInclusion] ?? l.feeInclusion) : null,
    truong: (["furnished", "legalStatus", "financing", "occupantType"] as const).map((k) => [NHAN_PHAN[k]!, l[k] ?? "—"]),
    mucDu: { co: md.filled, tren: md.total, thieu: md.missing },
  };
}

// ——— Lịch sử ———

export type DongLichSu = { viec: string; chiTiet: string | null; nguoi: string; luc: string };

/** Người làm: «Bạn» khi là người đang xem, còn lại tên vai (Hỏi-3 — giao vai, không giao người). */
export function nguoiLam(e: Pick<ListingEvent, "actorUserId" | "actorRoles">, toi: string): string {
  if (e.actorUserId === toi) return "Bạn";
  const vai = e.actorRoles[0];
  return vai ? nhanVai(vai) : "Người trong sàn";
}

const giaCo = (p: Record<string, unknown>) => (typeof p.listPrice === "number" ? dinhDangGia(p.listPrice) : "—");

/** Dòng lịch sử từ sự kiện của một lần rao, mới nhất trên; giá và trạng thái nêu từ gì sang gì. */
export function dongLichSu(events: readonly ListingEvent[], toi: string): DongLichSu[] {
  const ds = [...events].sort((a, b) => a.seq - b.seq);
  let gia = "—";
  let trangThai: StandardStatus = "Incomplete";
  const out: DongLichSu[] = [];
  for (const e of ds) {
    const p = e.payload;
    const nguoi = nguoiLam(e, toi);
    if (e.type === "created") out.push({ viec: "Tạo lần rao", chiTiet: null, nguoi, luc: e.occurredAt });
    else if (e.type === "price_changed") {
      const moi = giaCo(p);
      out.push({ viec: "Đổi giá", chiTiet: `${gia} → ${moi}`, nguoi, luc: e.occurredAt });
      gia = moi;
    } else if (e.type === "status_changed") {
      const toi_ = p.to as StandardStatus;
      out.push({ viec: "Đổi trạng thái", chiTiet: `${STATUS_LABEL[trangThai]} → ${STATUS_LABEL[toi_] ?? String(p.to)}`, nguoi, luc: e.occurredAt });
      trangThai = toi_;
    } else if (e.type === "details_changed") {
      const chiTiet = Object.entries(p)
        .map(([k, v]) => `${NHAN_PHAN[k] ?? k}: ${v === null ? "xoá" : String(v)}`)
        .join("; ");
      out.push({ viec: "Đổi phần lần rao", chiTiet, nguoi, luc: e.occurredAt });
    } else out.push({ viec: "Xác nhận với chủ nhà", chiTiet: null, nguoi, luc: e.occurredAt });
  }
  return out.reverse();
}

export type TrangThaiLichSu = { kind: "da-tai" | "tren-may" | "can-mang" | "dang-tai" | "khong-tai-duoc"; chu: string | null };

/**
 * Phần lịch sử theo bản đã tải và mạng. Lần rao luôn có sự kiện tạo, nên lịch sử rỗng nghĩa là chưa tải — không phải
 * «không có sự kiện». Mất mạng = lượt kéo cuối gặp mất mạng hoặc trình duyệt báo ngoại tuyến. Lượt kéo đã xong mà vẫn
 * rỗng khi có mạng (máy chủ lỗi, hết phiên) thì nói không tải được — không quay chờ mãi.
 */
export function trangThaiLichSu(o: { coBan: boolean; dangTai: boolean; lan: LanThu | null; ngoaiTuyen?: boolean }): TrangThaiLichSu {
  const mang = o.lan === "mang" || o.ngoaiTuyen === true;
  if (o.coBan) return mang ? { kind: "tren-may", chu: "đang xem bản trên máy" } : { kind: "da-tai", chu: null };
  if (mang) return { kind: "can-mang", chu: "Lịch sử cần mạng để tải lần đầu" };
  if (o.dangTai) return { kind: "dang-tai", chu: null };
  return { kind: "khong-tai-duoc", chu: "Không tải được lịch sử" };
}
