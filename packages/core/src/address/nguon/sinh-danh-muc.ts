/**
 * Bộ sinh danh mục cấp xã (hàng danh-muc-xa-day-du). Đọc hai tệp nguồn của Cục Thống kê đã chép vào kho và sinh ba bảng
 * JSON trong `../du-lieu/`. Bảng sắp theo mã, mỗi phần tử một dòng, nên cùng tệp nguồn luôn ra cùng byte — bộ kiểm chạy lại
 * bộ sinh và đòi trùng bảng đã commit.
 *
 * Chạy lại sau khi thay tệp nguồn: `node --import tsx packages/core/src/address/nguon/sinh-danh-muc.ts --write`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { docSheet, docXmlDanhMucXa } from "./doc-tep";

/** Thư mục nguồn, suy từ vị trí tệp này. */
export const THU_MUC_NGUON = path.dirname(fileURLToPath(import.meta.url));
export const THU_MUC_DU_LIEU = path.join(THU_MUC_NGUON, "..", "du-lieu");
export const TEP_XA = "danh-muc-xa-06-11-2026.xml";
export const TEP_CHUYEN_DOI = "bang-chuyen-doi-moi-cu.xlsx";
/** Tên sheet đúng như trong tệp — có dấu cách cuối. */
export const SHEET_CHUYEN_DOI = "Tổng hợp_không merge ";

export type LoaiXa = "Phường" | "Xã" | "Đặc khu";
export type LoaiXaCu = "Phường" | "Xã" | "Thị trấn";

export type DongXa = { ma: string; maTinh: string; ten: string; loai: LoaiXa };
export type DongXaCu = {
  ma: string;
  ten: string;
  /** null khi nguồn không ghi loại trước tên (bảng sửa «khong-loai»). */
  loai: LoaiXaCu | null;
  huyenCu: string;
  maHuyenCu: string;
  maTinhCu: string;
  /** Tỉnh mới chứa các xã nhận nó. */
  maTinh: string;
  vao: string[];
  /** Cách nhập vào từng xã của `vao`, cùng thứ tự. */
  cach: ("toan-bo" | "mot-phan")[];
};
export type DongTinhCu = { ma: string; ten: string; vao: string[] };

/**
 * Bảng sửa lỗi đã biết của tệp bảng chuyển đổi (đo 06/11/2026). Mỗi dòng một lý do; bộ sinh đếm số lần dùng từng dòng và
 * bộ kiểm đòi mỗi dòng được dùng ít nhất một lần — dòng không còn dùng là nguồn đã sửa, phải gỡ.
 */
export const SUA_NGUON = [
  { id: "chu-to-hop", lyDo: "Chữ tiếng Việt ghi dạng tổ hợp (dấu tách khỏi chữ, NFD) ở 40 tên xã cũ Khánh Hòa, Bình Định — đưa về dạng dựng sẵn (NFC)." },
  { id: "khoang-trang", lyDo: "Tên, ghi chú, nhãn dính khoảng trắng thừa, dấu xuống dòng (\\r\\n) — cắt và gộp." },
  { id: "dem-so-0-ma-moi", lyDo: "Mã xã mới lưu dạng số nên mất số 0 đầu (Cao Bằng, Tuyên Quang) — đệm cho đủ năm chữ số." },
  { id: "khong-ma-cu", lyDo: "Dòng không có mã xã cũ (huyện đảo thành đặc khu, bãi bồi) — không phải xã cũ, bỏ khỏi bảng xã cũ." },
  { id: "nhan-tinh-cu-19742", lyDo: "Đặc khu Cồn Cỏ (19742): nhãn tỉnh cũ ghi «Quảng Trị (44)», đúng là «Tỉnh Quảng Trị (45)»." },
  { id: "nhan-tinh-cu-27691", lyDo: "Phường 4, Tân An (mã cũ 27691): nhãn tỉnh cũ ghi «Tỉnh Tiền Giang (82)», đúng là «Tỉnh Long An (80)» (huyện cũ Thành phố Tân An 794)." },
  { id: "nhan-tinh-cu-30781", lyDo: "Xã Tiên Hải (mã cũ 30781, huyện cũ Thành phố Hà Tiên 900): nhãn tỉnh cũ ghi «Tỉnh An Giang (89)», đúng là «Tỉnh Kiên Giang (91)» như sáu xã khác của Hà Tiên." },
  { id: "loai-viet-sai", lyDo: "Loại xã cũ viết sai chính tả («Thi trấn») — đọc là «Thị trấn»." },
  { id: "khong-loai", lyDo: "Tên xã cũ không ghi loại («Xuân Quang 3», «Xuân Phước») — giữ tên, loại để trống, không đoán." },
  { id: "hoa-loai-huyen", lyDo: "Loại huyện cũ viết hoa giữa chừng («Thị Xã», «Thành Phố») — đưa về «Thị xã», «Thành phố»." },
] as const;
export type MaSua = (typeof SUA_NGUON)[number]["id"];

const gon = (s: string) => s.normalize("NFC").replace(/[\s\u200b\u00a0]+/g, " ").trim();

function nhan(s: string): { ten: string; ma: string } | null {
  const m = /^(.*?)\s*\((\d+)\)$/.exec(gon(s));
  return m ? { ten: m[1]!, ma: m[2]! } : null;
}

/** Ghi bảng: mỗi phần tử một dòng JSON, sắp sẵn. */
export function ghiBang(dong: readonly unknown[]): string {
  return `[\n${dong.map((d) => JSON.stringify(d)).join(",\n")}\n]\n`;
}

/** Bảng xã mới từ XML của dịch vụ. */
export function sinhBangXa(xml: string): DongXa[] {
  return docXmlDanhMucXa(xml)
    .map((d) => {
      const loai = gon(d.loai) as LoaiXa;
      if (!["Phường", "Xã", "Đặc khu"].includes(loai)) throw new Error(`loại xã lạ: ${d.ma} ${d.loai}`);
      const ten = gon(d.ten);
      const goc = ten.startsWith(`${loai} `) ? ten.slice(loai.length + 1) : ten;
      return { ma: gon(d.ma), maTinh: gon(d.maTinh), ten: goc, loai };
    })
    .sort((a, b) => a.ma.localeCompare(b.ma));
}

/** Tên tỉnh mới (đầy đủ) theo mã, từ XML dịch vụ — dùng cho đối chiếu hàng 75. */
export function tinhTheoXml(xml: string): Map<string, string> {
  return new Map(docXmlDanhMucXa(xml).map((d) => [gon(d.maTinh), gon(d.tenTinh)]));
}

export type KetQuaChuyenDoi = {
  xaCu: DongXaCu[];
  tinhCu: DongTinhCu[];
  /** Số lần dùng từng dòng sửa. */
  dung: Record<MaSua, number>;
  /** Số dòng dữ liệu đã đọc (bỏ hai dòng tiêu đề và dòng nhóm tỉnh). */
  soDong: number;
};

/**
 * Bảng xã cũ và tỉnh cũ từ sheet «không merge». `sua` mặc định là bảng sửa thật — bộ kiểm truyền tập rỗng để thấy lỗi
 * nguồn lộ ra (phá thử).
 */
export function sinhBangChuyenDoi(
  xlsx: Buffer,
  xa: readonly DongXa[],
  sua: ReadonlySet<MaSua> = new Set(SUA_NGUON.map((s) => s.id)),
): KetQuaChuyenDoi {
  const dung = Object.fromEntries(SUA_NGUON.map((s) => [s.id, 0])) as Record<MaSua, number>;
  const dungSua = (id: MaSua) => {
    dung[id]++;
    return true;
  };
  const co = (id: MaSua) => sua.has(id);
  const tinhCuaXa = new Map(xa.map((x) => [x.ma, x.maTinh]));

  const sach = (s0: string) => {
    let s = s0;
    if (co("chu-to-hop") && s.normalize("NFC") !== s && dungSua("chu-to-hop")) s = s.normalize("NFC");
    const g = co("khoang-trang") ? gon(s) : s;
    if (g !== s) dungSua("khoang-trang");
    return g;
  };

  const dong = docSheet(xlsx, SHEET_CHUYEN_DOI)
    .slice(2)
    .filter((r) => (r[2] ?? "").trim() !== "" || (r[4] ?? "").trim() !== "");

  const gom = new Map<string, DongXaCu>();
  const tinhCu = new Map<string, { ten: string; vao: Set<string> }>();
  for (const r of dong) {
    let maMoi = sach(r[2] ?? "");
    if (/^\d{1,4}$/.test(maMoi) && co("dem-so-0-ma-moi") && dungSua("dem-so-0-ma-moi")) maMoi = maMoi.padStart(5, "0");
    const maCu = sach(r[4] ?? "");
    let nhanTinhCu = sach(r[7] ?? "");
    if (maMoi === "19742" && nhanTinhCu === "Quảng Trị (44)" && co("nhan-tinh-cu-19742") && dungSua("nhan-tinh-cu-19742")) {
      nhanTinhCu = "Tỉnh Quảng Trị (45)";
    }
    if (maCu === "27691" && nhanTinhCu === "Tỉnh Tiền Giang (82)" && co("nhan-tinh-cu-27691") && dungSua("nhan-tinh-cu-27691")) {
      nhanTinhCu = "Tỉnh Long An (80)";
    }
    if (maCu === "30781" && nhanTinhCu === "Tỉnh An Giang (89)" && co("nhan-tinh-cu-30781") && dungSua("nhan-tinh-cu-30781")) {
      nhanTinhCu = "Tỉnh Kiên Giang (91)";
    }
    const tc = nhan(nhanTinhCu);
    const maTinh = tinhCuaXa.get(maMoi) ?? "";
    if (tc) {
      const k = `${tc.ma}|${tc.ten}`;
      if (!tinhCu.has(k)) tinhCu.set(k, { ten: tc.ten, vao: new Set() });
      if (maTinh) tinhCu.get(k)!.vao.add(maTinh);
    }
    if (maCu === "") {
      if (co("khong-ma-cu")) {
        dungSua("khong-ma-cu");
        continue;
      }
    }

    let tenCu = sach(r[3] ?? "");
    let loai: LoaiXaCu | null = null;
    const ml = /^(phường|xã|thị trấn|thi trấn)\s+(.+)$/i.exec(tenCu);
    if (ml) {
      const l = ml[1]!.toLowerCase();
      if (l === "thi trấn") {
        if (co("loai-viet-sai") && dungSua("loai-viet-sai")) loai = "Thị trấn";
      } else loai = l === "phường" ? "Phường" : l === "xã" ? "Xã" : "Thị trấn";
      if (loai !== null) tenCu = ml[2]!;
    } else if (co("khong-loai")) dungSua("khong-loai");

    const nh = nhan(sach(r[6] ?? ""));
    let huyen = nh?.ten ?? "";
    const mh = /^(thị xã|thành phố)\s+(.+)$/i.exec(huyen);
    if (mh && co("hoa-loai-huyen")) {
      const chuan = (mh[1]!.toLowerCase() === "thị xã" ? "Thị xã " : "Thành phố ") + mh[2]!;
      if (chuan !== huyen && dungSua("hoa-loai-huyen")) huyen = chuan;
    }
    const cachChu = sach(r[5] ?? "").toLowerCase();
    const cach: "toan-bo" | "mot-phan" = /một\s+phần|phần còn lại/.test(cachChu) ? "mot-phan" : "toan-bo";

    const cu = gom.get(maCu);
    if (cu) {
      if (!cu.vao.includes(maMoi)) {
        cu.vao.push(maMoi);
        cu.cach.push(cach);
      }
    } else {
      gom.set(maCu, {
        ma: maCu,
        ten: tenCu,
        loai,
        huyenCu: huyen,
        maHuyenCu: nh?.ma ?? "",
        maTinhCu: tc?.ma ?? "",
        maTinh,
        vao: [maMoi],
        cach: [cach],
      });
    }
  }
  for (const c of gom.values()) {
    const thu = c.vao.map((m, i) => [m, c.cach[i]!] as const).sort((a, b) => a[0].localeCompare(b[0]));
    c.vao = thu.map((t) => t[0]);
    c.cach = thu.map((t) => t[1]);
  }
  return {
    xaCu: [...gom.values()].sort((a, b) => a.ma.localeCompare(b.ma)),
    tinhCu: [...tinhCu.entries()]
      .map(([k, v]) => ({ ma: k.split("|")[0]!, ten: v.ten, vao: [...v.vao].sort() }))
      .sort((a, b) => a.ma.localeCompare(b.ma) || a.ten.localeCompare(b.ten)),
    dung,
    soDong: dong.length,
  };
}

/** Sinh cả ba bảng từ tệp nguồn trong kho; trả chuỗi JSON của từng bảng. */
export function sinhTuTep(thuMuc = THU_MUC_NGUON): { xa: string; xaCu: string; tinhCu: string; ketQua: KetQuaChuyenDoi } {
  const xa = sinhBangXa(readFileSync(path.join(thuMuc, TEP_XA), "utf8"));
  const ketQua = sinhBangChuyenDoi(readFileSync(path.join(thuMuc, TEP_CHUYEN_DOI)), xa);
  return { xa: ghiBang(xa), xaCu: ghiBang(ketQua.xaCu), tinhCu: ghiBang(ketQua.tinhCu), ketQua };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = sinhTuTep();
  if (process.argv.includes("--write")) {
    writeFileSync(path.join(THU_MUC_DU_LIEU, "xa.json"), r.xa);
    writeFileSync(path.join(THU_MUC_DU_LIEU, "xa-cu.json"), r.xaCu);
    writeFileSync(path.join(THU_MUC_DU_LIEU, "tinh-cu.json"), r.tinhCu);
  }
  console.log(`sinh-danh-muc: ${r.ketQua.soDong} dòng · xã cũ ${r.ketQua.xaCu.length} · tỉnh cũ ${r.ketQua.tinhCu.length} · sửa ${JSON.stringify(r.ketQua.dung)}`);
}
