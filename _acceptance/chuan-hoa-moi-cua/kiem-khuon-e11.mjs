// E11b của hàng 70 (chuan-hoa-moi-cua), chép từ E14b hàng 47: rào bù cho E11 đạt có giới hạn mã 1 (luật 33, giám sát nhận B-0511-7 — báo oan
// kit#485). Bước chấm khuôn của kit 2.37.0 bỏ qua ngoai_le không có khoá khoi, nên trang Từ điển — đã khai ngoại lệ ở
// design/patterns/trang-tam.md — bị báo «thuộc hai nhóm màn» và thoát 1. Bài này chạy cùng bước chấm và chỉ cho qua khi
// MỌI dòng đỏ là dòng báo oan: tệp có trong ngoai_le của trang-tam (kèm ly_do) và dòng chỉ nêu nhóm trang-tam; dòng của
// trang Từ điển phải có mặt. Mọi lệch khác hay lỗi bản đồ («sai:») vẫn đỏ. Kit vá (bước chấm thoát 0) thì bài nhắc bỏ
// mã 1 ở E14 và bài này, vẫn thoát 0.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

export const TEP_NAY = "apps/web/src/app/(app)/settings/dictionary/page.tsx";

/** Tệp khai ngoại lệ có lý do trong trang-tam.md. */
export function ngoaiLe(md) {
  const dong = md.split("\n").find((d) => d.startsWith("ngoai_le:")) ?? "";
  return new Set([...dong.matchAll(/tep: "([^"]+)", ly_do: "[^"]+"/g)].map((m) => m[1]));
}

/** Dòng làm bước chấm thoát 1: lệch mới và lỗi bản đồ. */
export const dongDo = (ra) => ra.split("\n").filter((d) => d.startsWith("lệch:") || d.startsWith("sai:"));

/** Dòng báo oan kit#485: tệp đã khai ngoại lệ, dòng chỉ chạm nhóm trang-tam. */
function baoOan(d, le) {
  const m = d.match(/^lệch: (.+?) · (?:thuộc hai nhóm màn: [a-z-]+, trang-tam|khuôn Placeholder · nhóm trang-tam)$/);
  return Boolean(m && le.has(m[1]));
}

/** 0 = qua, 1 = đỏ; kèm câu báo. */
export function xet(ma, ra, le) {
  if (ma === 0) return { ma: 0, bao: "bước chấm khuôn thoát 0 — kit đã vá hoặc lệch đã hết: bỏ mã 1 ở E11 và bài E11b" };
  if (ma !== 1) return { ma: 1, bao: `bước chấm khuôn thoát ${ma} — không chấm được` };
  const do_ = dongDo(ra);
  const la = do_.filter((d) => !baoOan(d, le));
  if (la.length) return { ma: 1, bao: `lệch ngoài dòng báo oan:\n${la.join("\n")}` };
  if (!do_.some((d) => d.startsWith(`lệch: ${TEP_NAY} `))) return { ma: 1, bao: "bước chấm thoát 1 mà không có dòng báo oan của trang Từ điển — không rõ vì sao đỏ" };
  return { ma: 0, bao: `chỉ có dòng báo oan đã khai (${do_.length}): ${do_.join(" | ")}` };
}

// Đối chứng trên đầu vào viết sẵn — chạy mỗi lần, đỏ thì bài không tin được.
const LE = new Set([TEP_NAY, "apps/web/src/app/(app)/contacts/page.tsx"]);
const NAY = `lệch: ${TEP_NAY} · thuộc hai nhóm màn: cai-dat-san, trang-tam`;
assert.equal(xet(1, `${NAY}\nnợ cũ: a · thuộc hai nhóm màn: x, trang-tam\n20 tệp giao diện ngoài bản đồ`, LE).ma, 0, "đối chứng: chỉ dòng báo oan phải qua");
assert.equal(xet(1, `${NAY}\nlệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam`, LE).ma, 0, "đối chứng: báo oan của trang khác đã khai cũng qua");
assert.equal(xet(1, `${NAY}\nlệch: apps/web/x/page.tsx · khuôn Frame · nhóm gui`, LE).ma, 1, "đối chứng: thêm một lệch phải đỏ");
assert.equal(xet(1, `${NAY}\nlệch: apps/web/y/page.tsx · thuộc hai nhóm màn: gui, trang-tam`, LE).ma, 1, "đối chứng: tệp chưa khai ngoại lệ phải đỏ");
assert.equal(xet(1, `${NAY}\nsai: design/patterns/cai-dat-san.md: thiếu khoá`, LE).ma, 1, "đối chứng: lỗi bản đồ phải đỏ");
assert.equal(xet(1, "nợ cũ: a · thuộc hai nhóm màn: x, y", LE).ma, 1, "đối chứng: thoát 1 không có dòng của trang Từ điển phải đỏ");
assert.equal(xet(2, "", LE).ma, 1, "đối chứng: không chấm được phải đỏ");
assert.equal(ngoaiLe('ngoai_le: [{ tep: "a/page.tsx", ly_do: "x" }, { tep: "b/page.tsx", ly_do: "y" }]').size, 2, "đối chứng: đọc ngoai_le");

const kit = spawnSync("node", ["packages/ui-lint/tim-kit.mjs"], { encoding: "utf8" }).stdout.trim();
if (!kit) {
  console.error("không tìm thấy kit nghiệm thu");
  process.exit(1);
}
const r = spawnSync("node", [`${kit}/scripts/design-floor-khuon.mjs`, "--kiem", "--root", "."], { encoding: "utf8" });
process.stdout.write(r.stdout ?? "");
process.stderr.write(r.stderr ?? "");
const kq = xet(r.status ?? 2, r.stdout ?? "", ngoaiLe(readFileSync("design/patterns/trang-tam.md", "utf8")));
console.log(`E11b: ${kq.bao}`);
process.exit(kq.ma);
