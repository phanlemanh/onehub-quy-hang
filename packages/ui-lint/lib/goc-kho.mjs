// Gốc kho và bản đồ khuôn cho luật ESLint: tìm gốc từ tệp đang lint, đọc bản đồ một lần mỗi tiến trình, đọc lại khi một
// tệp bản đồ đổi (khoá gồm thời điểm sửa của từng tệp).
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { docBanDo, THU_MUC_BAN_DO } from "./ban-do.mjs";

const banDoTheoGoc = new Map();

export function timGoc(tep) {
  let d = dirname(resolve(tep));
  for (;;) {
    if (existsSync(join(d, THU_MUC_BAN_DO))) return d;
    const tren = dirname(d);
    if (tren === d) return null;
    d = tren;
  }
}

export function banDo(goc) {
  const dir = join(goc, THU_MUC_BAN_DO);
  const khoa = `${goc}|${readdirSync(dir).map((f) => `${f}:${statSync(join(dir, f)).mtimeMs}`).join(",")}`;
  if (!banDoTheoGoc.has(khoa)) banDoTheoGoc.set(khoa, docBanDo(goc));
  return banDoTheoGoc.get(khoa);
}

/** Đường tương đối gốc kho, dấu «/». */
export const tuongDoi = (goc, tep) => relative(goc, resolve(tep)).split("\\").join("/");
