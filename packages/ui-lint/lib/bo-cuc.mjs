// Răng của hệ bố cục (hàng 91, ADR-0024): mỗi màn dưới `(app)` thuộc một nhóm đã khai `bo_cuc`, và khuôn của nhóm dựng
// `<BoCuc kieu="…">` đúng kiểu ấy. Màn của hàng đang chạy chưa chuyển mang ngoại lệ có hạn (`ngoai_le_han`), hạn là hàng
// sẽ chuyển nó: hàng ấy gộp rồi mà ngoại lệ còn thì đỏ «hạn đã tới»; mã không có trong lộ trình hay trỏ chính hàng nền
// thì đỏ «hạn lạ». Luật ESLint của bố cục bỏ qua vùng của màn còn ngoại lệ có hạn — đọc ở `vungMienHan`.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { khopGlob, nhomCuaTep } from "./ban-do.mjs";

export const MAN_TRONG_VO = "apps/web/src/app/(app)/**/page.tsx";
/** Hàng nền của hệ bố cục — không màn nào được hẹn chuyển «ở chính hàng nền». */
export const HANG_NEN = "he-bo-cuc";
export const LO_TRINH = "docs/plan/lo-trinh.json";
const DA_GOP = new Set(["signed-off", "machine-cleared"]);

/** Hàng của lộ trình theo slug: `{ ma, slug, daGop }` — đã gộp là hồ sơ của hàng đã ký (signed-off/machine-cleared). */
export function docLoTrinh(root) {
  const p = join(root, LO_TRINH);
  if (!existsSync(p)) return new Map();
  const hang = JSON.parse(readFileSync(p, "utf8")).hang ?? [];
  const ra = new Map();
  for (const h of hang) {
    if (!h.slug) continue;
    const hd = join(root, "_acceptance", h.slug, "contract.md");
    const st = existsSync(hd) ? /^status:\s*(\S+)/m.exec(readFileSync(hd, "utf8"))?.[1] : undefined;
    ra.set(h.slug, { ma: String(h.ma), slug: h.slug, daGop: DA_GOP.has(st) });
  }
  return ra;
}

/** Mọi dòng ngoại lệ có hạn của bản đồ, kèm nhóm khai nó. */
export function cacHan(bd) {
  return bd.nhom.filter((g) => !g.hong).flatMap((g) => (g.data.ngoai_le_han ?? []).map((x) => ({ ...x, nhom: g.data.nhom })));
}

/**
 * Kiểm bố cục trên cây. Trả `{ lech: [{ tep, nhom, dieu }], han: [{ tep, han, ma }] }` — `han` là ngoại lệ có hạn còn
 * hiệu lực, in ra để người thấy màn nào chờ hàng nào.
 */
export function kiemBoCuc(root, bd, loTrinh = docLoTrinh(root)) {
  const lech = [];
  const han = [];
  const theoTep = new Map();
  for (const x of cacHan(bd)) {
    const h = loTrinh.get(x.han);
    if (!existsSync(join(root, x.tep))) lech.push({ tep: x.tep, nhom: x.nhom, dieu: "ngoại lệ có hạn trỏ tệp không có" });
    else if (!h || x.han === HANG_NEN) lech.push({ tep: x.tep, nhom: x.nhom, dieu: `hạn lạ «${x.han}» — phải là slug một hàng khác hàng nền trong ${LO_TRINH}` });
    else if (h.daGop) lech.push({ tep: x.tep, nhom: x.nhom, dieu: `hạn đã tới — hàng ${h.ma} (${x.han}) đã gộp mà màn chưa chuyển sang bố cục` });
    else han.push({ tep: x.tep, han: x.han, ma: h.ma });
    theoTep.set(x.tep, x);
  }
  const doc = new Map();
  for (const tep of khopGlob(root, [MAN_TRONG_VO])) {
    if (theoTep.has(tep)) continue;
    for (const g of nhomCuaTep(bd, tep).filter((g) => g.donVi === "man")) {
      if (!g.data.bo_cuc) {
        lech.push({ tep, nhom: g.data.nhom, dieu: `nhóm chưa khai bo_cuc (design/patterns/${g.tep})` });
        continue;
      }
      if (!doc.has(g.khuonTep)) doc.set(g.khuonTep, readFileSync(join(root, g.khuonTep), "utf8"));
      const ma = doc.get(g.khuonTep);
      const kieu = [...ma.matchAll(/<BoCuc\b[^>]*?\bkieu="([a-z-]+)"/g)].map((m) => m[1]);
      if (!kieu.includes(g.data.bo_cuc))
        lech.push({ tep, nhom: g.data.nhom, dieu: `khuôn ${g.khuonTep} không dựng <BoCuc kieu="${g.data.bo_cuc}">${kieu.length ? ` (đang dựng ${kieu.join(", ")})` : ""}` });
    }
  }
  return { lech: lech.sort((a, b) => a.tep.localeCompare(b.tep)), han: han.sort((a, b) => a.tep.localeCompare(b.tep)) };
}

/**
 * Vùng luật ESLint của bố cục bỏ qua: nhánh tuyến của màn còn ngoại lệ có hạn — đoạn đầu sau `(app)/` (`inventory/`,
 * `units/`…), riêng `proto/<tên>/` lấy hai đoạn. Màn chuyển thì ngoại lệ bỏ, nhánh trở lại chịu luật.
 */
export function vungMienHan(bd) {
  const vung = new Set();
  for (const x of cacHan(bd)) {
    const m = /^(apps\/web\/src\/app\/\(app\)\/(?:proto\/[^/]+|[^/]+)\/)/.exec(x.tep);
    vung.add(m ? m[1] : `${dirname(x.tep)}/`);
  }
  return [...vung].sort();
}

/** Dòng in của một ngoại lệ có hạn còn hiệu lực — kiểm chuẩn và test cùng dùng. */
export const dongHan = (h) => `ngoại lệ có hạn: ${h.tep} → hàng ${h.ma} (${h.han})`;

export const trongVung = (vung, tep) => vung.some((v) => tep.startsWith(v));

/** Tệp bài quét bố cục đọc ngoài bản đồ và app: lộ trình và hợp đồng của các hàng nhận hạn — test chép đúng danh sách này. */
export function tepBoCucCan(root, bd) {
  const slug = [...new Set(cacHan(bd).map((x) => x.han))];
  return [LO_TRINH, ...slug.map((s) => `_acceptance/${s}/contract.md`)].filter((t) => existsSync(join(root, t)));
}
