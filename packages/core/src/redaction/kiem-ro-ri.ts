/**
 * Bộ kiểm rò rỉ (hàng 31, Kiến trúc §8: «không trường nội bộ nào có trong trang, kể cả trong mã nguồn trang»). Quét
 * VĂN BẢN — JSON của bản ra, HTML của trang, tin soạn sẵn, dòng xuất file — tìm giá trị mồi, vì rò có thể nằm trong giá
 * trị ghép hay mã nguồn trang, nơi không còn khoá nào. Văn bản được đưa về từng dạng mã hoá trước khi so.
 */
import { normalizePhone } from "../access/owner-input";
import { CAU_HINH_TAT_CA, type banRaNgoai, type CauHinhRa } from "./ban-ra";
import { CUA_RA, NGUOI_NHAN } from "./cua-ra";
import type { CanNoiBo } from "./lop-truong";
import { giaTriMoi } from "./moi";

/** Một giá trị không được xuất hiện. Số điện thoại và số tiền so trên dãy chữ số. */
export type GiaTriMoi = { truong: string; giaTri: string | number; kieu: "chu" | "so_dien_thoai" | "so_tien" };

export const DANG_MA_HOA = [
  "nguyen_van",
  "html_thap_phan",
  "html_thap_luc_phan",
  "html_co_ten",
  "json_unicode",
  "url",
  "nfd",
  "nfc",
  "hoa_thuong",
  "ket_hop",
  "so_lien",
  "so_cach",
  "so_cham",
  "so_gach",
  "so_84",
  "so_cong_84",
  "so_tien_ngan",
] as const;
export type DangMaHoa = (typeof DANG_MA_HOA)[number];

export type RoRi = { truong: string; dang: DangMaHoa };

const TEN_THUC_THE: Readonly<Record<string, string>> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const giaiThapPhan = (s: string) => s.replace(/&#(\d+);?/g, (_, n: string) => String.fromCodePoint(Number(n)));
const giaiThapLucPhan = (s: string) => s.replace(/&#x([0-9a-f]+);?/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)));
const giaiCoTen = (s: string) => s.replace(/&([a-z]+);/gi, (m, n: string) => TEN_THUC_THE[n.toLowerCase()] ?? m);
const giaiJson = (s: string) =>
  s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16))).replace(/\\(["\\/])/g, "$1");
const giaiUrl = (s: string) =>
  s.replace(/(?:%[0-9A-Fa-f]{2})+/g, (m) => {
    try {
      return decodeURIComponent(m);
    } catch {
      return m;
    }
  });
const giaiHet = (s: string) => giaiCoTen(giaiThapLucPhan(giaiThapPhan(giaiJson(giaiUrl(s)))));

/** Các bản giải của văn bản, mỗi bản một dạng — dạng đầu tiên khớp là dạng được báo. */
function banGiai(vanBan: string): [DangMaHoa, string][] {
  return [
    ["nguyen_van", vanBan],
    ["html_thap_phan", giaiThapPhan(vanBan)],
    ["html_thap_luc_phan", giaiThapLucPhan(vanBan)],
    ["html_co_ten", giaiCoTen(vanBan)],
    ["json_unicode", giaiJson(vanBan)],
    ["url", giaiUrl(vanBan)],
  ];
}

const nfc = (s: string) => s.normalize("NFC");
const thuong = (s: string) => nfc(s).toLocaleLowerCase("vi");

function timChu(vanBan: string, kim: string): DangMaHoa | null {
  for (const [dang, t] of banGiai(vanBan)) if (t.includes(kim)) return dang;
  const tho = nfc(vanBan);
  if (tho.includes(nfc(kim))) return kim === nfc(kim) ? "nfd" : "nfc";
  if (thuong(vanBan).includes(thuong(kim))) return "hoa_thuong";
  if (thuong(giaiHet(vanBan)).includes(thuong(kim))) return "ket_hop";
  return null;
}

// Không đặt trần độ dài: dãy số khác đứng sát (giá viết nhóm ba) dính vào cùng một lần khớp; số được tìm trên dãy chữ số
// rồi xét dạng trên đúng đoạn chứa nó.
const DAY_SO_DIEN_THOAI = /\+?\d[\d\s.\-()]*\d/g;
const DAY_SO_TIEN = /\d[\d.,\s]*\d/g;

/** Đoạn của `c` chứa chữ số thứ `tu` tới `den` (theo dãy chữ số của `c`). */
function doanChuaSo(c: string, tu: number, den: number): string {
  const viTri = [...c].flatMap((ch, i) => (/\d/.test(ch) ? [i] : []));
  return c.slice(viTri[tu], viTri[den]! + 1);
}

function timSoDienThoai(vanBan: string, so: string): DangMaHoa | null {
  const dich = normalizePhone(so) ?? so.replace(/\D/g, "");
  const dich84 = `84${dich.slice(1)}`;
  for (const t of [vanBan, giaiHet(vanBan)]) {
    for (const m of t.matchAll(DAY_SO_DIEN_THOAI)) {
      const c = m[0];
      const d = c.replace(/\D/g, "");
      const i = d.indexOf(dich);
      if (i >= 0) {
        const doan = doanChuaSo(c, i, i + dich.length - 1);
        if (/[.]/.test(doan)) return "so_cham";
        if (/-/.test(doan)) return "so_gach";
        if (/\s/.test(doan)) return "so_cach";
        return "so_lien";
      }
      const j = d.indexOf(dich84);
      if (j >= 0) {
        // Dấu «+» ngay trước số 84 (bỏ khoảng trắng) là cách viết +84.
        return /\+\s*$/.test(c.slice(0, c.length - doanChuaSo(c, j, d.length - 1).length)) ? "so_cong_84" : "so_84";
      }
    }
  }
  return null;
}

function timSoTien(vanBan: string, so: number): DangMaHoa | null {
  const dich = String(so);
  for (const t of [vanBan, giaiHet(vanBan)]) {
    for (const [c] of t.matchAll(DAY_SO_TIEN)) {
      if (c.replace(/\D/g, "").includes(dich)) return /[.,\s]/.test(c) ? "so_tien_ngan" : "nguyen_van";
    }
  }
  return null;
}

/** Mọi mồi xuất hiện trong văn bản, mỗi mồi một lần, kèm dạng mã hoá đã bắt được nó. */
export function timRoRi(vanBan: string, moi: readonly GiaTriMoi[]): RoRi[] {
  const ra: RoRi[] = [];
  for (const m of moi) {
    const dang =
      m.kieu === "so_dien_thoai"
        ? timSoDienThoai(vanBan, String(m.giaTri))
        : m.kieu === "so_tien"
          ? timSoTien(vanBan, Number(m.giaTri))
          : timChu(vanBan, String(m.giaTri));
    if (dang) ra.push({ truong: m.truong, dang });
  }
  return ra;
}

const tenCauHinh = (c: CauHinhRa) =>
  `${c.showConfirmedAge ? "hien-tuoi" : "an-tuoi"}+${c.privateHidesUnitNumber ? "an-ma-can" : "hien-ma-can"}`;

/**
 * Chạy một hàm ra trên bản vào ở mọi cửa × người nhận × cấu hình (gồm cấu hình mở nhất), quét JSON của từng bản ra.
 * Trả thông điệp `<cửa>/<người nhận>/<cấu hình>: rò <trường> (<dạng>)` — mảng rỗng là không rò.
 */
export function kiemBanRa(ham: typeof banRaNgoai, can: CanNoiBo, today: string): string[] {
  const loi: string[] = [];
  for (const cua of CUA_RA) {
    for (const nguoiNhan of NGUOI_NHAN) {
      for (const cauHinh of CAU_HINH_TAT_CA) {
        const json = JSON.stringify(ham(can, { cua, nguoiNhan, cauHinh, today }));
        for (const r of timRoRi(json, giaTriMoi(can, nguoiNhan, cauHinh))) {
          loi.push(`${cua}/${nguoiNhan}/${tenCauHinh(cauHinh)}: rò ${r.truong} (${r.dang})`);
        }
      }
    }
  }
  return loi;
}
