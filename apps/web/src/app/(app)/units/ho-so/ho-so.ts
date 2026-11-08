/**
 * Lõi thuần của hồ sơ căn (hàng 17): đường của cột, tìm căn theo mã, thuộc tính tự điền, các lần rao và dòng lịch sử.
 * Đọc kho trên máy và danh mục đã giữ, không gọi mạng — kiểm bằng `node:test`.
 */
import type { CatalogData, CatalogSubdivisionData, CatalogUnitData } from "@quy-hang/core";
import { completeness, kiemMaCan, type ListingEvent, type StandardStatus } from "@quy-hang/core/listing";
import type { LanThu, ListingView } from "@/lib/sync/types";
import { nhanVai } from "@/lib/vai";
import { dinhDangGia, FEE_LABEL, STATUS_LABEL } from "../../inventory/cot";
import { nhanLoaiCan, thuocTinhHang, type ChiMucDanhMuc } from "../../inventory/ghep-danh-muc";
import { loaiDungCot, nhanLoaiHinh } from "../../inventory/loai-hinh";

const chuan = (s: string) => s.trim().toLowerCase();
const cungCan = (l: { buildingName: string | null; unitNumber: string | null }, toa: string, ma: string) =>
  l.buildingName !== null && l.unitNumber !== null && chuan(l.buildingName) === chuan(toa) && chuan(l.unitNumber) === chuan(ma);

// ——— Đường của cột ———

export type ChonCan = { ma: string; toa: string | null; lan: string | null };
/** Hồ sơ mở theo hàng — lối của hàng chưa có mã căn (ADR-0026): không có mã để đặt lên địa chỉ, chỉ còn mã hàng. */
export type ChonHang = { hang: string };
export type ChonCot = ChonCan | ChonHang;
const THAM_SO = ["unit", "toa", "lan", "hang"] as const;

/**
 * Cột đang mở theo URL: `?unit=<mã căn>&toa=<toà>&lan=<lần rao>`, hay `?hang=<mã hàng>` cho hàng chưa có mã căn; không có
 * cả hai thì không mở. Có `unit` thì theo căn.
 */
export function docCot(q: URLSearchParams): ChonCot | null {
  const ma = q.get("unit")?.trim();
  if (ma) return { ma, toa: q.get("toa")?.trim() || null, lan: q.get("lan")?.trim() || null };
  const hang = q.get("hang")?.trim();
  return hang ? { hang } : null;
}

export const laChonHang = (c: ChonCot): c is ChonHang => "hang" in c;

/** Bấm dòng: luôn kèm toà và lần rao — link chép không đổi nghĩa khi danh mục thêm toà trùng mã sau này. */
export function moCot(q: URLSearchParams, c: { ma: string; toa: string; lan: string }): string {
  const m = new URLSearchParams(q);
  m.delete("hang");
  m.set("unit", c.ma);
  m.set("toa", c.toa);
  m.set("lan", c.lan);
  return m.toString();
}

/**
 * Mở hồ sơ từ một dòng hàng: căn hộ có mã thì theo căn (`moCot`); chưa có mã, hay hàng không toà — lô, ngoài khu (hàng 79,
 * `theoHang`) — thì theo hàng (`?hang=`): «toà» của dòng ấy là chữ vị trí, không tra được theo toà + mã.
 */
export function moHang(q: URLSearchParams, h: { id: string; buildingName: string; unitNumber: string | null; theoHang?: boolean }): string {
  if (h.unitNumber && !h.theoHang) return moCot(q, { ma: h.unitNumber, toa: h.buildingName, lan: h.id });
  const m = new URLSearchParams(dongCot(q));
  m.set("hang", h.id);
  return m.toString();
}

/** Lối từ Hôm nay tới hồ sơ của hàng chưa có mã căn: cột hồ sơ của Bảng hàng (máy tính) hay toàn màn (điện thoại). */
export const duongHangChuaMa = (id: string) => `/inventory?${new URLSearchParams({ hang: id })}`;

/** Đóng cột: bỏ các tham số của cột, giữ nguyên mọi tham số khác. */
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
  // Hồ sơ theo toà + mã: hàng lô, hàng ngoài khu không vào phép tìm này (can-ngoai-khu; hồ sơ theo loại hình là hàng 79).
  const khop = ds.filter((l): l is ListingView & { buildingName: string } => l.buildingName !== null && l.unitNumber !== null && chuan(l.unitNumber) === chuan(ma));
  const theoToa = toa ? khop.filter((l) => chuan(l.buildingName) === chuan(toa)) : khop;
  const cacToa = [...new Map(theoToa.map((l) => [chuan(l.buildingName), l.buildingName])).values()].sort((a, b) => a.localeCompare(b, "vi"));
  if (cacToa.length === 0) return { kind: "khong" };
  if (cacToa.length > 1) return { kind: "nhieu", toa: cacToa };
  return { kind: "mot", toa: cacToa[0]!, hang: theoToa };
}

// ——— Tìm hàng theo mã hàng ———

export type KetQuaHang = { kind: "chua-ma"; hang: ListingView } | { kind: "khong-toa"; hang: ListingView } | { kind: "co-ma"; chon: ChonCan } | { kind: "khong" };

/**
 * Hàng của `?hang=` trên kho trên máy: hàng không toà (lô, ngoài khu — hàng 79) là hồ sơ theo hàng có mã của nó; căn hộ chưa
 * có mã thì hồ sơ của hàng; đã có mã thì hồ sơ theo căn như mọi hàng.
 */
export function timHang(ds: readonly ListingView[], id: string): KetQuaHang {
  const h = ds.find((l) => l.id === id);
  if (!h) return { kind: "khong" };
  if (!h.buildingName && (h.blockName || h.subdivisionName || h.offCompoundUnitId)) return { kind: "khong-toa", hang: h };
  return h.unitNumber ? { kind: "co-ma", chon: { ma: h.unitNumber, toa: h.buildingName, lan: h.id } } : { kind: "chua-ma", hang: h };
}

// ——— Gắn mã căn (ADR-0026) ———

/** Id cố định của ô mã căn — «Mã căn» trong «Còn thiếu» đưa con trỏ tới đây. */
export const ID_O_MA_CAN = "o-ma-can";
export const CHU_GO_MA_CAN = "Gõ mã căn";

export type LenhGanMa = { type: "unit_number_assigned"; payload: { unitNumber: string }; coSo: number };

/** Lệnh từ ô mã căn: cắt khoảng trắng hai đầu; rỗng → lời «Gõ mã căn»; hàng đã có mã → không dựng lệnh (mã đã khoá). */
export function dungLenhGanMa(hang: ListingView, chu: string): { lenh: LenhGanMa } | { loi: string | null } {
  if (hang.unitNumber) return { loi: null };
  const ma = chu.trim();
  if (!ma) return { loi: CHU_GO_MA_CAN };
  // Mã toàn dấu: lõi báo câu riêng tại ô — máy chủ cũng từ chối, nên không vào hàng đợi.
  const khongChuSo = kiemMaCan(ma);
  if (khongChuSo) return { loi: khongChuSo };
  return { lenh: { type: "unit_number_assigned", payload: { unitNumber: ma }, coSo: hang.version } };
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

/** Trường thuộc tính theo loại hình, đúng thứ tự hiện (hàng 79): nhãn · cột của bảng loại hình · định dạng. */
const TRUONG_LOAI_HINH: readonly [string, string, (v: number | string) => string][] = [
  ["Diện tích đất", "lotSizeArea", (v) => `${so.format(Number(v))} m²`],
  ["Diện tích sàn", "livingArea", (v) => `${so.format(Number(v))} m²`],
  ["Số tầng", "storiesTotal", (v) => String(v)],
  ["Mặt tiền", "frontageLength", (v) => `${so.format(Number(v))} m`],
  ["Lộ giới", "accessRoadWidth", (v) => `${so.format(Number(v))} m`],
  ["Phòng ngủ", "unitType", (v) => String(v)],
  ["Hướng", "directionFaces", (v) => String(v)],
];

/**
 * Thuộc tính của hàng không toà (lô, ngoài khu — hàng 79): Loại hình rồi đúng các trường loại hình ấy dùng theo bảng của lõi
 * (đất: Diện tích đất, Mặt tiền, Lộ giới — không Tầng, Trục, Toà). Trường dùng mà nguồn chưa có là «—». Không thấy loại
 * hình → «ngoài danh mục». Khoá, không sửa.
 */
export function thuocTinhKhongToa(idx: ChiMucDanhMuc, h: ListingView): ThuocTinh {
  const t = thuocTinhHang(idx, h);
  const sub = t.propertySubType;
  if (!sub) return { kind: "ngoai-danh-muc" };
  const gt: Record<string, number | string | null> = {
    lotSizeArea: t.lotSizeArea,
    livingArea: t.livingArea,
    storiesTotal: t.storiesTotal,
    frontageLength: t.frontageLength,
    accessRoadWidth: t.accessRoadWidth,
    unitType: t.unitType && t.unitType !== "Chưa rõ" ? t.unitType : null,
    directionFaces: t.directionFaces,
  };
  return {
    kind: "co",
    khu: h.subdivisionName ?? "",
    truong: [
      ["Loại hình", nhanLoaiHinh(sub)],
      ...TRUONG_LOAI_HINH.filter(([, cot]) => loaiDungCot(sub, cot)).map(([nhan, cot, f]): [string, string] => [nhan, gt[cot] === null || gt[cot] === undefined ? "—" : f(gt[cot]!)]),
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
  return ds
    .filter((l) => cungCan(l, toa, ma))
    .map((l) => lanRaoCua(l, lichSu))
    .sort((a, b) => (b.tu ?? "").localeCompare(a.tu ?? "") || Number(b.dangMo) - Number(a.dangMo));
}

/** Một lần rao trên máy — hàng chưa có mã căn có đúng một lần rao, chính nó. */
export function lanRaoCua(l: ListingView, lichSu: Record<string, readonly ListingEvent[]>): LanRao {
  const tu = lichSu[l.id]?.find((e) => e.type === "created")?.occurredAt ?? null;
  return { id: l.id, trangThai: STATUS_LABEL[l.standardStatus], dangMo: laDangMo(l.standardStatus), gia: dinhDangGia(l.listPrice), tu };
}

/** Lần rao đang xem: `lan` của URL nếu thuộc căn; vắng thì lần đang mở; không còn lần mở thì lần mới nhất. */
export function chonLanRao(ds: readonly LanRao[], lan: string | null): string | null {
  if (lan && ds.some((r) => r.id === lan)) return lan;
  return (ds.find((r) => r.dangMo) ?? ds[0])?.id ?? null;
}

export const NHAN_PHAN: Record<string, string> = { price: "Giá", furnished: "Nội thất", legalStatus: "Pháp lý", financing: "Tài chính", occupantType: "Tình trạng sử dụng", photos: "Ảnh thật" };

/** Phần của lần rao đang xem và mức đủ tính bằng luật lõi trên bản trên máy. */
export function phanLanRao(l: ListingView): { gia: string; phi: string | null; truong: [string, string][]; mucDu: { co: number; tren: number; thieu: string[] } } {
  // Mục ảnh (anh-khong-chan-ban) khi bản xem mang số ảnh thật; kho trên máy cũ chưa có số thì năm mục như trước.
  const md = completeness(l, l.photosCount === undefined ? undefined : { photosCount: l.photosCount });
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
