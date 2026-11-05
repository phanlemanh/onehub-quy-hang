/**
 * Đọc một địa chỉ Việt Nam gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá địa chỉ (hàng 75, ADR-0016 quyết định 5).
 * Tên phường cũ ra xã mới; phường cũ bị tách thì cần người chọn, không đoán; đọc không chắc phần nào thì nói phần ấy.
 * Thuần và tất định: chỉ dùng danh mục truyền vào, không gọi dịch vụ ngoài.
 */
import { dangSo, khoaDiaChi, tachSoNha } from "./chuan-hoa";
import { DANH_MUC_DON_VI_HANH_CHINH, type DanhMucDonViHanhChinh, type DonViCapTinh } from "./danh-muc";

export type PhanDiaChi = "stateOrProvince" | "wardName" | "streetName" | "streetNumber";

export type UngVienXa = { ma: string; ten: string; maTinh: string; tenTinh: string };

export type XaDaDoc = { ma: string; ten: string; tuTenCu?: string };

export type XaCanChon = {
  canNguoiChon: true;
  /** Chữ tên xã đã đọc. */
  chu: string;
  /** Tên phường cũ khi chữ đọc ra phường cũ. */
  tenCu?: string;
  ungVien: UngVienXa[];
};

export type KetQuaDiaChi = {
  /** Chữ người gõ, giữ nguyên (RESO `UnparsedAddress`). */
  unparsedAddress: string;
  stateOrProvince: { ma: string; ten: string } | null;
  wardName: XaDaDoc | XaCanChon | null;
  /** Tên đường như người gõ, đã gọn khoảng trắng (RESO `StreetName`). */
  streetName: string | null;
  /** Số nhà chuẩn, dãy số từ đường chính vào (RESO `StreetNumber`). */
  streetNumber: string | null;
  thieu: PhanDiaChi[];
  chuaCoTrongDanhMuc: { phan: "stateOrProvince" | "wardName"; chu: string }[];
  khoa: string | null;
  trangThai: "chuan" | "can-nguoi-chon" | "thieu";
};

const TIEN_TO_XA = /^(phường|phuong|p\.?|xã|xa|x\.|đặc khu|dac khu|thị trấn|thi tran|tt\.?)\s*(?=\S)/i;
const TIEN_TO_TINH = /^(tỉnh|tinh|thành phố|thanh pho|tp\.?)\s*(?=\S)/i;
const DANG_XA = /^(phuong|p|xa|x|dac khu|thi tran|tt) (.+)$/;
const DANG_HUYEN = /^(quan|q|huyen|h|thi xa|tx) (.+)$/;
const DANG_TINH_LA = /^(tinh|thanh pho|tp) (.+)$/;
const DUOI_QUOC_GIA = new Set(["viet nam", "vn"]);
const TU_KHOA_TACH = /^(phường|phuong|p\.|xã|q\.|quận|quan|huyện|huyen|tỉnh|tinh|tp\.?|tphcm|thành|thanh)/i;

function tenGocTinh(t: DonViCapTinh): string {
  return t.ten.replace(/^(Tỉnh|Thành phố)\s+/, "");
}

function biDanhTinh(t: DonViCapTinh): Set<string> {
  const goc = dangSo(tenGocTinh(t));
  return new Set([
    dangSo(t.ten),
    goc,
    `tp ${goc}`,
    `thanh pho ${goc}`,
    `tinh ${goc}`,
    ...t.tenGoiKhac.map((x) => dangSo(x)),
  ]);
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

/** Đọc một địa chỉ. `danhMuc` mặc định là danh mục của lõi. */
export function docDiaChi(chu: string, danhMuc: DanhMucDonViHanhChinh = DANH_MUC_DON_VI_HANH_CHINH): KetQuaDiaChi {
  const doan = tachDoan(chu);
  while (doan.length > 0 && DUOI_QUOC_GIA.has(dangSo(doan[doan.length - 1]!))) doan.pop();

  const chuaCo: KetQuaDiaChi["chuaCoTrongDanhMuc"] = [];
  const dung = new Array<boolean>(doan.length).fill(false);

  // 1. Tỉnh: đoạn cuối khớp nguyên một tên của danh mục.
  let tinh: DonViCapTinh | null = null;
  const cuoi = doan.length - 1;
  if (cuoi >= 0) {
    const s = dangSo(doan[cuoi]!);
    tinh = danhMuc.tinh.find((t) => biDanhTinh(t).has(s)) ?? null;
    if (tinh) dung[cuoi] = true;
  }

  // 2. Quận, huyện cũ.
  let huyenCu: string | null = null;
  doan.forEach((d, i) => {
    if (dung[i]) return;
    const h = chuanHuyen(d);
    if (h !== null && !DANG_XA.test(dangSo(d))) {
      huyenCu = h;
      dung[i] = true;
    }
  });

  // 3. Xã, phường: đoạn có tiền tố; không có thì đoạn (không phải đoạn đầu) trùng tên trong danh mục.
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
      const s = dangSo(doan[i]!);
      if (danhMuc.xa.some((x) => dangSo(x.ten) === s) || danhMuc.xaCu.some((x) => dangSo(x.ten) === s)) {
        viTriXa = i;
        chuXa = doan[i]!.trim();
        break;
      }
    }
  }
  if (viTriXa >= 0) dung[viTriXa] = true;

  // Thiếu tỉnh mà còn đoạn sau xã (hay đoạn cuối mang dạng «Tỉnh …»): đó là tên tỉnh danh mục không có.
  if (!tinh && cuoi >= 0 && !dung[cuoi] && (cuoi > viTriXa && viTriXa >= 0 || DANG_TINH_LA.test(dangSo(doan[cuoi]!)))) {
    chuaCo.push({ phan: "stateOrProvince", chu: doan[cuoi]!.replace(TIEN_TO_TINH, "").trim() });
    dung[cuoi] = true;
  }

  const wardName = chuXa === null ? null : docXa(chuXa, tinh, huyenCu, danhMuc);
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
    stateOrProvince: tinh ? { ma: tinh.ma, ten: tinh.ten } : null,
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
  dm: DanhMucDonViHanhChinh,
): XaDaDoc | XaCanChon | null {
  const s = dangSo(chuXa);
  const trongTinh = (maTinh: string) => tinh === null || maTinh === tinh.ma;
  const moi = dm.xa.filter((x) => dangSo(x.ten) === s && trongTinh(x.maTinh));
  const cu = dm.xaCu.filter(
    (x) => dangSo(x.ten) === s && trongTinh(x.maTinh) && (huyenCu === null || dangSo(x.huyenCu) === huyenCu),
  );
  const ungVien = (mas: readonly string[]): UngVienXa[] =>
    [...new Set(mas)].flatMap((ma) => {
      const x = dm.xa.find((v) => v.ma === ma);
      const t = x ? dm.tinh.find((v) => v.ma === x.maTinh) : undefined;
      return x && t ? [{ ma: x.ma, ten: x.ten, maTinh: t.ma, tenTinh: t.ten }] : [];
    });

  const tuMoi = (): XaDaDoc | XaCanChon =>
    tinh !== null && moi.length === 1
      ? { ma: moi[0]!.ma, ten: moi[0]!.ten }
      : { canNguoiChon: true, chu: chuXa, ungVien: ungVien(moi.map((x) => x.ma)) };
  const tuCu = (): XaDaDoc | XaCanChon => {
    const vao = [...new Set(cu.flatMap((x) => x.vao))];
    if (tinh !== null && cu.length === 1 && vao.length === 1) {
      const x = dm.xa.find((v) => v.ma === vao[0]);
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
