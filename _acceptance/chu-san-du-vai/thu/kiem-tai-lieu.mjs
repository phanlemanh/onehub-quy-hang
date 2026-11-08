// AC-7 của hàng chu-san-du-vai: không migration mới so nhánh chính; Tham chiếu và hai ADR nói đúng điều đang đúng.
// Phép xét là hàm thuần; đối chứng đỏ chạy cùng hàm trên bản sao tài liệu cũ và diff giả có migration.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const doc = (t) => readFileSync(join(GOC, t), "utf8");
const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });

const VE = {
  mig: "không có migration mới so nhánh chính",
  tc: "Tham chiếu không còn ‹chưa dựng› cho Quản trị sàn",
  tc12: "Tham chiếu §12 có dòng dựng hàng chu-san-du-vai",
  a10: "ADR-0010 có mục sửa đổi cách B",
  a11: "ADR-0011 có mục sửa đổi cách B",
};
const coSuaDoi = (s) => /## Sửa đổi 08\/11 — cách B, hàng `chu-san-du-vai`/.test(s);

/** Trả danh sách vế HỎNG. */
export function xet({ thamChieu, adr10, adr11, tepDoi }) {
  const h = [];
  if (tepDoi.some((t) => /^packages\/db\/migrations\//.test(t))) h.push(VE.mig);
  const dong = thamChieu.split("\n").filter((d) => /^\| Quản trị sàn \|/.test(d) || d.includes("hàng `chu-san-du-vai`"));
  if (dong.length < 2 || dong.some((d) => /chưa dựng/i.test(d))) h.push(VE.tc);
  if (!thamChieu.split("\n").some((d) => d.startsWith("| 08/11 |") && d.includes("`chu-san-du-vai`") && d.includes("Vai kéo theo vai"))) h.push(VE.tc12);
  if (!coSuaDoi(adr10)) h.push(VE.a10);
  if (!coSuaDoi(adr11)) h.push(VE.a11);
  return h;
}

const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

const base = git("merge-base", "HEAD", "origin/main").trim();
const that = {
  thamChieu: doc("docs/product/tham-chieu.md"),
  adr10: doc("docs/adr/0010-lop-truong-nguon.md"),
  adr11: doc("docs/adr/0011-nhap-du-lieu-tac-tu.md"),
  tepDoi: git("diff", "--name-only", base, "HEAD").split("\n").filter(Boolean),
};
const hong = xet(that);
for (const ve of Object.values(VE)) dat(!hong.includes(ve), ve);

// Đối chứng đỏ: mỗi bản sao phá một vế, phải hỏng đúng vế ấy.
const MA_TRAN = [
  ["diff có tệp migration", { ...that, tepDoi: [...that.tepDoi, "packages/db/migrations/999_gia.sql"] }, VE.mig],
  ["Tham chiếu còn chữ cũ", { ...that, thamChieu: that.thamChieu.replace("**Đổi hướng 06/11, dựng 08/11**", "**Đổi hướng 06/11, chưa dựng**") }, VE.tc],
  ["Tham chiếu thiếu dòng §12", { ...that, thamChieu: that.thamChieu.split("\n").filter((d) => !(d.startsWith("| 08/11 |") && d.includes("Vai kéo theo vai"))).join("\n") }, VE.tc12],
  ["ADR-0010 thiếu mục", { ...that, adr10: that.adr10.replace("## Sửa đổi 08/11", "## Ghi chú") }, VE.a10],
  ["ADR-0011 thiếu mục", { ...that, adr11: that.adr11.replace("## Sửa đổi 08/11", "## Ghi chú") }, VE.a11],
];
for (const [ten, banSao, ve] of MA_TRAN) {
  const hh = xet(banSao);
  dat(hh.length === 1 && hh[0] === ve, `đối chứng đỏ «${ten}» → hỏng đúng vế «${ve}»${hh.length === 1 && hh[0] === ve ? "" : ` (hỏng: ${hh.join("; ") || "không vế nào"})`}`);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
