// Bản đồ hệ thiết kế (hàng 91, AC-10): skill quy-hang-ui có bảng mỗi tệp một dòng — lớp, việc, đường dẫn — và một khối
// máy đọc khai mẫu đường dẫn của hệ thiết kế. Kiểm chuẩn so cây với bảng: tệp khớp mẫu mà thiếu dòng, dòng trỏ tệp không
// có, dòng lặp, lớp ngoài danh sách đóng, hay docs/README.md không trỏ sang bảng thì đỏ.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { globRegex, khopGlob } from "./ban-do.mjs";

export const SKILL = ".agents/skills/quy-hang-ui/SKILL.md";
export const LOP = ["chỉ dẫn", "nền", "nhãn", "chọn khối", "khuôn", "bố cục", "kiểm", "cổng", "sổ", "đối chiếu"];
const KHOI = /<!-- <<<BAN-DO-HE-THIET-KE-MAU\n([\s\S]*?)\nBAN-DO-HE-THIET-KE-MAU>>> -->/;

/** Đọc khối mẫu và bảng của skill. Trả `{ mau, bo, dong: [{ lop, viec, tep }], loi }`. */
export function docBanDoHeThietKe(md) {
  const m = KHOI.exec(md);
  if (!m) return { mau: [], bo: [], dong: [], loi: [`${SKILL}: thiếu khối BAN-DO-HE-THIET-KE-MAU`] };
  const cac = m[1].split("\n").map((d) => d.trim()).filter(Boolean);
  const sau = md.slice(m.index + m[0].length);
  const bang = sau.split("\n## ")[0] ?? "";
  const dong = bang
    .split("\n")
    .filter((d) => d.startsWith("| ") && !d.startsWith("| Lớp") && !d.startsWith("| ---"))
    .map((d) => d.split(" | ").map((c) => c.replace(/^\| /, "").replace(/ \|$/, "").trim()))
    .map(([lop, viec, tep]) => ({ lop, viec, tep: (tep ?? "").replace(/^`|`$/g, "") }));
  return { mau: cac.filter((c) => !c.startsWith("!")), bo: cac.filter((c) => c.startsWith("!")).map((c) => c.slice(1)), dong, loi: [] };
}

/** Tệp của cây khớp mẫu (trừ mẫu bỏ), tương đối gốc kho, sắp. */
export function tepHeThietKe(root, mau, bo) {
  const co = mau.filter((g) => !g.includes("*") && existsSync(join(root, g)));
  const sao = khopGlob(root, mau.filter((g) => g.includes("*")));
  const boRe = bo.map(globRegex);
  return [...new Set([...co, ...sao])].filter((t) => !boRe.some((r) => r.test(t))).sort();
}

export function kiemBanDoHeThietKe(root) {
  const p = join(root, SKILL);
  if (!existsSync(p)) return { loi: [`${SKILL}: không có`], soTep: 0 };
  const bd = docBanDoHeThietKe(readFileSync(p, "utf8"));
  if (bd.loi.length) return { loi: bd.loi, soTep: 0 };
  const loi = [];
  const theoTep = new Map();
  for (const d of bd.dong) {
    if (!LOP.includes(d.lop)) loi.push(`bản đồ hệ thiết kế: «${d.tep}» lớp «${d.lop}» ngoài danh sách (${LOP.join(" · ")})`);
    if (!d.viec) loi.push(`bản đồ hệ thiết kế: «${d.tep}» thiếu việc`);
    if (theoTep.has(d.tep)) loi.push(`bản đồ hệ thiết kế: «${d.tep}» có hai dòng`);
    theoTep.set(d.tep, d);
    if (!existsSync(join(root, d.tep))) loi.push(`bản đồ hệ thiết kế: dòng trỏ tệp không có «${d.tep}»`);
  }
  const cay = tepHeThietKe(root, bd.mau, bd.bo);
  for (const t of cay) if (!theoTep.has(t)) loi.push(`bản đồ hệ thiết kế: tệp «${t}» thiếu dòng — thêm vào bảng ở ${SKILL}`);
  const readme = existsSync(join(root, "docs/README.md")) ? readFileSync(join(root, "docs/README.md"), "utf8") : "";
  if (!/quy-hang-ui\/SKILL\.md#bản-đồ-hệ-thiết-kế/.test(readme)) loi.push("bản đồ hệ thiết kế: docs/README.md chưa trỏ sang bảng «Bản đồ hệ thiết kế»");
  return { loi, soTep: cay.length, soDong: bd.dong.length };
}

/** Tệp bước kiểm này đọc trên một bản sao: mọi tệp bảng trỏ tới cộng docs/README.md — test chép đúng danh sách này. */
export function tepBanDoHeThietKe(root) {
  const bd = docBanDoHeThietKe(readFileSync(join(root, SKILL), "utf8"));
  return [...new Set([SKILL, "docs/README.md", ...bd.dong.map((d) => d.tep)])].filter((t) => existsSync(join(root, t)));
}
