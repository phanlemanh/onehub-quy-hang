/**
 * Lõi bộ đọc địa chỉ (hàng 75; danh mục cả nước ở hàng danh-muc-xa-day-du). Tệp này KHÔNG xuất qua `index.ts`: hai công
 * tắc của `LuatDoc` chỉ để bộ kiểm dựng lại hành vi cũ khi phá thử. Bên gọi dùng `docDiaChi` ở `doc-dia-chi.ts`.
 */
import { boDau, dangSo, khoaDiaChi, tachSoNha } from "./chuan-hoa";
import type { DanhMucDonViHanhChinh, DonViCapTinh, DonViCapTinhCu, DonViCapXa, DonViCapXaCu } from "./danh-muc";
import type { KetQuaDiaChi, PhanDiaChi, UngVienXa, XaCanChon, XaDaDoc } from "./doc-dia-chi";

export type LuatDoc = {
  /** Đã biết tỉnh thì đoạn không có tiền tố chỉ so với xã của tỉnh ấy (AC-6). */
  trongTinh: boolean;
  /** Nhận huyện cũ dạng «Thành phố <tên>», «TP <tên>» khi khớp huyện cũ của tỉnh (AC-9). */
  nhanHuyenTP: boolean;
  /**
   * Cách so tên xã khi người gõ có chữ â ă ê ô ơ ư đ (hàng doc-xa-thieu-mot-phan-dau). Vắng = `tuong-thich`.
   * - `tuong-thich`: chữ người gõ có mũ/móc/đ phải trùng; chữ để gốc nhận cả chữ mang mũ/móc/đ cùng gốc; sau khi lọc
   *   tỉnh, tên trùng nguyên văn (dạng giữ chữ) thắng.
   * - `giu`: chỉ tên trùng nguyên văn dạng giữ chữ (hành vi hàng danh-muc-xa-day-du) — chỉ để bộ kiểm phá thử.
   * - `lui-bo-dau`: trong tỉnh, tên trùng nguyên văn nếu có, không thì so bỏ dấu (lối khớp nhầm giữa tỉnh) — chỉ để phá thử.
   * - `tuong-thich-tron`: tương thích mà không ưu tiên nguyên văn — chỉ để phá thử.
   */
  soDau?: SoDau;
};

export type SoDau = "giu" | "tuong-thich" | "lui-bo-dau" | "tuong-thich-tron";

const TIEN_TO_XA = /^(phường|phuong|p\.?|xã|xa|x\.|đặc khu|dac khu|thị trấn|thi tran|tt\.?)\s*(?=\S)/i;
const TIEN_TO_TINH = /^(tỉnh|tinh|thành phố|thanh pho|tp\.?)\s*(?=\S)/i;
const DANG_XA = /^(phuong|p|xa|x|dac khu|thi tran|tt) (.+)$/;
const DANG_HUYEN = /^(quan|q|huyen|h|thi xa|tx) (.+)$/;
const DANG_HUYEN_TP = /^(thanh pho|tp) (.+)$/;
const DANG_TINH_LA = /^(tinh|thanh pho|tp) (.+)$/;
const DUOI_QUOC_GIA = new Set(["viet nam", "vn"]);
const TU_KHOA_TACH = /^(phường|phuong|p\.|xã|q\.|quận|quan|huyện|huyen|tỉnh|tinh|tp\.?|tphcm|thành|thanh)/i;

/** Bỏ dấu thanh (sắc, huyền, hỏi, ngã, nặng), giữ chữ â ă ê ô ơ ư đ; chữ thường, gọn như `dangSo`. */
function dangGiuChu(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̣̀́̃̉]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/]+/gu, " ")
    .replace(/\s*\/\s*/g, "/")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Chữ người gõ (dạng giữ chữ) tương thích với tên danh mục (dạng giữ chữ): cùng số chữ; từng chữ trùng, hoặc chữ người
 * gõ để gốc (a, o, u, e, d…) và chữ danh mục cùng gốc. Chữ người gõ có mũ/móc/đ mà danh mục khác chữ → không tương thích.
 */
function tuongThich(go: string, dm: string): boolean {
  const a = [...go];
  const b = [...dm];
  if (a.length !== b.length) return false;
  return a.every((ch, i) => ch === b[i] || (boDau(ch) === ch && boDau(b[i]!) === ch));
}

/** Chữ người gõ có chữ â ă ê ô ơ ư đ không — có thì so giữ chữ, không thì so bỏ dấu. */
function coChuDau(s: string): boolean {
  const g = dangGiuChu(s);
  return boDau(g) !== g;
}

function tenGoc(ten: string): string {
  return ten.replace(/^(Tỉnh|Thành phố)\s+/, "");
}

function biDanhTinh(t: DonViCapTinh): Set<string> {
  const goc = dangSo(tenGoc(t.ten));
  return new Set([dangSo(t.ten), goc, `tp ${goc}`, `thanh pho ${goc}`, `tinh ${goc}`, ...t.tenGoiKhac.map((x) => dangSo(x))]);
}

function biDanhTinhCu(t: DonViCapTinhCu): Set<string> {
  const goc = dangSo(tenGoc(t.ten));
  return new Set([dangSo(t.ten), goc, `tp ${goc}`, `thanh pho ${goc}`, `tinh ${goc}`]);
}

type ChiMuc = {
  tinh: Map<string, DonViCapTinh>;
  tinhCu: Map<string, DonViCapTinhCu>;
  /** Khoá bỏ dấu → xã; khoá giữ chữ → xã. */
  xaBo: Map<string, DonViCapXa[]>;
  xaGiu: Map<string, DonViCapXa[]>;
  cuBo: Map<string, DonViCapXaCu[]>;
  cuGiu: Map<string, DonViCapXaCu[]>;
  xaTheoMa: Map<string, DonViCapXa>;
  tinhTheoMa: Map<string, DonViCapTinh>;
  /** Mã tỉnh mới → huyện cũ dạng thành phố (dạng so). */
  huyenTP: Map<string, Set<string>>;
};

const CHI_MUC = new WeakMap<DanhMucDonViHanhChinh, ChiMuc>();

function them<T>(m: Map<string, T[]>, k: string, v: T): void {
  const a = m.get(k);
  if (a) a.push(v);
  else m.set(k, [v]);
}

/** Lập chỉ mục tên một lần cho mỗi danh mục (13 nghìn tên). */
function chiMuc(dm: DanhMucDonViHanhChinh): ChiMuc {
  const co = CHI_MUC.get(dm);
  if (co) return co;
  const c: ChiMuc = {
    tinh: new Map(),
    tinhCu: new Map(),
    xaBo: new Map(),
    xaGiu: new Map(),
    cuBo: new Map(),
    cuGiu: new Map(),
    xaTheoMa: new Map(dm.xa.map((x) => [x.ma, x])),
    tinhTheoMa: new Map(dm.tinh.map((t) => [t.ma, t])),
    huyenTP: new Map(),
  };
  for (const t of dm.tinh) for (const b of biDanhTinh(t)) if (!c.tinh.has(b)) c.tinh.set(b, t);
  for (const t of dm.tinhCu ?? []) for (const b of biDanhTinhCu(t)) if (!c.tinh.has(b) && !c.tinhCu.has(b)) c.tinhCu.set(b, t);
  for (const x of dm.xa) {
    them(c.xaBo, dangSo(x.ten), x);
    them(c.xaGiu, dangGiuChu(x.ten), x);
  }
  for (const x of dm.xaCu) {
    them(c.cuBo, dangSo(x.ten), x);
    them(c.cuGiu, dangGiuChu(x.ten), x);
    const h = dangSo(x.huyenCu);
    if (DANG_HUYEN_TP.test(h) && h.startsWith("thanh pho ")) {
      if (!c.huyenTP.has(x.maTinh)) c.huyenTP.set(x.maTinh, new Set());
      c.huyenTP.get(x.maTinh)!.add(h);
    }
  }
  CHI_MUC.set(dm, c);
  return c;
}

type TenTim = { moi: DonViCapXa[]; cu: DonViCapXaCu[]; giu: string | null };

/**
 * Xã mới, xã cũ có tên khớp chữ người gõ. Người gõ không có chữ mũ/móc/đ → so bỏ dấu (mọi cách so như nhau). Có →
 * theo `soDau`; `giu` của kết quả là dạng giữ chữ người gõ để `docXa` ưu tiên tên trùng nguyên văn sau khi lọc tỉnh.
 */
function timTen(c: ChiMuc, chu: string, soDau: SoDau): TenTim {
  const bo = dangSo(chu);
  if (!coChuDau(chu)) return { moi: c.xaBo.get(bo) ?? [], cu: c.cuBo.get(bo) ?? [], giu: null };
  const k = dangGiuChu(chu);
  if (soDau === "giu") return { moi: c.xaGiu.get(k) ?? [], cu: c.cuGiu.get(k) ?? [], giu: null };
  // Lối lui: mọi tên cùng dạng bỏ dấu; `docXa` lọc tỉnh rồi giữ tên trùng nguyên văn nếu có, không thì lấy hết.
  if (soDau === "lui-bo-dau") return { moi: c.xaBo.get(bo) ?? [], cu: c.cuBo.get(bo) ?? [], giu: k };
  return {
    moi: (c.xaBo.get(bo) ?? []).filter((x) => tuongThich(k, dangGiuChu(x.ten))),
    cu: (c.cuBo.get(bo) ?? []).filter((x) => tuongThich(k, dangGiuChu(x.ten))),
    giu: soDau === "tuong-thich-tron" ? null : k,
  };
}

/** Có ứng viên trùng nguyên văn dạng giữ chữ thì chỉ giữ các ứng viên ấy. */
function nguyenVanThang<T extends { ten: string }>(ds: T[], giu: string | null): T[] {
  if (giu === null) return ds;
  const trung = ds.filter((x) => dangGiuChu(x.ten) === giu);
  return trung.length > 0 ? trung : ds;
}

function chuanHuyen(s: string): string | null {
  const m = DANG_HUYEN.exec(dangSo(s));
  if (!m) return null;
  const loai = m[1] === "q" ? "quan" : m[1] === "h" ? "huyen" : m[1] === "tx" ? "thi xa" : m[1]!;
  return `${loai} ${m[2]}`;
}

/** Chuỗi không dấu phẩy: chèn chỗ tách trước các từ khoá phường, quận, tỉnh để đọc như có dấu phẩy. */
function tachDoan(chu: string): string[] {
  if (chu.includes(",")) return chu.split(",").map((s) => s.trim()).filter(Boolean);
  const tu = chu.trim().split(/\s+/);
  const doan: string[][] = [[]];
  tu.forEach((t, i) => {
    if (i > 0 && TU_KHOA_TACH.test(t) && doan[doan.length - 1]!.length > 0) doan.push([]);
    doan[doan.length - 1]!.push(t);
  });
  return doan.map((d) => d.join(" ")).filter(Boolean);
}

export function docDiaChiVoi(chu: string, danhMuc: DanhMucDonViHanhChinh, luat: LuatDoc): KetQuaDiaChi {
  const c = chiMuc(danhMuc);
  const soDau: SoDau = luat.soDau ?? "tuong-thich";
  const doan = tachDoan(chu);
  while (doan.length > 0 && DUOI_QUOC_GIA.has(dangSo(doan[doan.length - 1]!))) doan.pop();

  const chuaCo: KetQuaDiaChi["chuaCoTrongDanhMuc"] = [];
  const dung = new Array<boolean>(doan.length).fill(false);

  // 1. Tỉnh: đoạn cuối khớp nguyên một tên tỉnh mới; không thì một tên tỉnh cũ vào đúng một tỉnh mới.
  let tinh: DonViCapTinh | null = null;
  let tinhTuTenCu: string | undefined;
  const cuoi = doan.length - 1;
  if (cuoi >= 0) {
    const s = dangSo(doan[cuoi]!);
    tinh = c.tinh.get(s) ?? null;
    if (tinh) dung[cuoi] = true;
    else {
      const cu = c.tinhCu.get(s);
      if (cu) {
        dung[cuoi] = true;
        const moi = cu.vao.length === 1 ? c.tinhTheoMa.get(cu.vao[0]!) : undefined;
        if (moi) {
          tinh = moi;
          tinhTuTenCu = cu.ten;
        }
      }
    }
  }

  // 2. Quận, huyện, thị xã cũ; thành phố cũ khi khớp huyện cũ của tỉnh đã đọc.
  let huyenCu: string | null = null;
  doan.forEach((d, i) => {
    if (dung[i]) return;
    const s = dangSo(d);
    if (DANG_XA.test(s)) return;
    const h = chuanHuyen(d);
    if (h !== null) {
      huyenCu = h;
      dung[i] = true;
      return;
    }
    const mtp = luat.nhanHuyenTP && tinh ? DANG_HUYEN_TP.exec(s) : null;
    if (mtp && tinh) {
      const ten = `thanh pho ${mtp[2]}`;
      if (c.huyenTP.get(tinh.ma)?.has(ten)) {
        huyenCu = ten;
        dung[i] = true;
      }
    }
  });

  // 3. Xã, phường: đoạn có tiền tố; không có thì đoạn (không phải đoạn đầu) trùng tên trong danh mục.
  const trongTinh = (maTinh: string) => tinh === null || maTinh === tinh.ma;
  let viTriXa = -1;
  let chuXa: string | null = null;
  for (let i = doan.length - 1; i >= 0; i--) {
    if (dung[i]) continue;
    if (DANG_XA.test(dangSo(doan[i]!))) {
      viTriXa = i;
      chuXa = doan[i]!.replace(TIEN_TO_XA, "").trim();
      break;
    }
  }
  if (viTriXa < 0) {
    for (let i = doan.length - 1; i > 0; i--) {
      if (dung[i]) continue;
      const { moi, cu } = timTen(c, doan[i]!, soDau);
      const loc = (maTinh: string) => !luat.trongTinh || trongTinh(maTinh);
      if (moi.some((x) => loc(x.maTinh)) || cu.some((x) => loc(x.maTinh))) {
        viTriXa = i;
        chuXa = doan[i]!.trim();
        break;
      }
    }
  }
  if (viTriXa >= 0) dung[viTriXa] = true;

  // Thiếu tỉnh mà còn đoạn sau xã (hay đoạn cuối mang dạng «Tỉnh …»): đó là tên tỉnh danh mục không có.
  if (!tinh && cuoi >= 0 && !dung[cuoi] && ((cuoi > viTriXa && viTriXa >= 0) || DANG_TINH_LA.test(dangSo(doan[cuoi]!)))) {
    chuaCo.push({ phan: "stateOrProvince", chu: doan[cuoi]!.replace(TIEN_TO_TINH, "").trim() });
    dung[cuoi] = true;
  }

  const wardName = chuXa === null ? null : docXa(chuXa, tinh, huyenCu, c, soDau);
  if (chuXa !== null && wardName === null) chuaCo.push({ phan: "wardName", chu: chuXa });

  // 4. Số nhà và đường: các đoạn còn lại đứng trước xã (hay mọi đoạn còn lại khi không có xã).
  const phanDuong = doan.filter((_, i) => !dung[i] && (viTriXa < 0 || i < viTriXa)).join(" ");
  const tach = tachSoNha(phanDuong);
  const streetName = tach.streetName === "" ? null : tach.streetName;

  const thieu: PhanDiaChi[] = [];
  if (!tinh) thieu.push("stateOrProvince");
  if (wardName === null) thieu.push("wardName");
  if (streetName === null) thieu.push("streetName");
  if (tach.streetNumber === null) thieu.push("streetNumber");

  const canChon = wardName !== null && "canNguoiChon" in wardName;
  const trangThai: KetQuaDiaChi["trangThai"] = thieu.length > 0 ? "thieu" : canChon ? "can-nguoi-chon" : "chuan";
  const khoa =
    trangThai === "chuan" && tinh && wardName && !canChon && streetName && tach.streetNumber
      ? khoaDiaChi(tinh.ma, (wardName as XaDaDoc).ma, streetName, tach.streetNumber)
      : null;

  return {
    unparsedAddress: chu,
    stateOrProvince: tinh ? { ma: tinh.ma, ten: tinh.ten, ...(tinhTuTenCu ? { tuTenCu: tinhTuTenCu } : {}) } : null,
    wardName,
    streetName,
    streetNumber: tach.streetNumber,
    thieu,
    chuaCoTrongDanhMuc: chuaCo,
    khoa,
    trangThai,
  };
}

function docXa(
  chuXa: string,
  tinh: DonViCapTinh | null,
  huyenCu: string | null,
  c: ChiMuc,
  soDau: SoDau,
): XaDaDoc | XaCanChon | null {
  const trongTinh = (maTinh: string) => tinh === null || maTinh === tinh.ma;
  const ten = timTen(c, chuXa, soDau);
  const moi = nguyenVanThang(
    ten.moi.filter((x) => trongTinh(x.maTinh)),
    ten.giu,
  );
  const cu = nguyenVanThang(
    ten.cu.filter((x) => trongTinh(x.maTinh) && (huyenCu === null || dangSo(x.huyenCu) === huyenCu)),
    ten.giu,
  );
  const ungVien = (mas: readonly string[]): UngVienXa[] =>
    [...new Set(mas)].flatMap((ma) => {
      const x = c.xaTheoMa.get(ma);
      const t = x ? c.tinhTheoMa.get(x.maTinh) : undefined;
      return x && t ? [{ ma: x.ma, ten: x.ten, maTinh: t.ma, tenTinh: t.ten }] : [];
    });

  const tuMoi = (): XaDaDoc | XaCanChon =>
    tinh !== null && moi.length === 1
      ? { ma: moi[0]!.ma, ten: moi[0]!.ten }
      : { canNguoiChon: true, chu: chuXa, ungVien: ungVien(moi.map((x) => x.ma)) };
  const tuCu = (): XaDaDoc | XaCanChon => {
    const vao = [...new Set(cu.flatMap((x) => x.vao))];
    if (tinh !== null && cu.length === 1 && vao.length === 1) {
      const x = c.xaTheoMa.get(vao[0]!);
      if (x) return { ma: x.ma, ten: x.ten, tuTenCu: cu[0]!.ten };
    }
    return { canNguoiChon: true, chu: chuXa, tenCu: cu[0]!.ten, ungVien: ungVien(vao) };
  };

  if (huyenCu !== null) {
    if (cu.length > 0) return tuCu();
    if (moi.length > 0) return tuMoi();
    return null;
  }
  if (moi.length > 0) return tuMoi();
  if (cu.length > 0) return tuCu();
  return null;
}
