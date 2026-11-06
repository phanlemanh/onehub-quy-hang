// E12b/E13b của hàng 68 (nhap-tac-tu-ke-hoach): rào bù cho E12, E13 đạt có giới hạn mã 1 (giám sát trả G-0511-9 theo lối
// L-0511-4 của hàng Liên hệ, luật 33 — báo oan kit#485). Bước chấm khuôn của kit 2.37.0 không xét ngoai_le của trang-tam,
// nên trang «Xử lý bằng AI» mới — trong ngoai_le của trang-tam như settings/users — bị báo «thuộc hai nhóm màn» và thoát 1.
// Bài này chạy cùng bước chấm và chỉ cho qua khi dòng lệch DUY NHẤT là đúng dòng báo oan ấy; mọi lệch hay lỗi bản đồ khác
// vẫn đỏ. Kit vá (bước chấm thoát 0) thì bài báo «bỏ mã 1 ở E12, E13 và bài này» và thoát 0.
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

export const DONG_BAO_OAN = "lệch: apps/web/src/app/(app)/settings/ai/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam";

/** Dòng làm bước chấm thoát 1: lệch mới và lỗi bản đồ (đúng điều kiện thoát của design-floor-khuon --kiem). */
export const dongDo = (ra) => ra.split("\n").filter((d) => d.startsWith("lệch:") || d.startsWith("sai:"));

/** 0 = qua, 1 = đỏ; kèm câu báo. */
export function xet(ma, ra) {
  if (ma === 0) return { ma: 0, bao: "bước chấm khuôn thoát 0 — kit đã vá hoặc lệch đã hết: bỏ mã 1 ở E12, E13 và bài E12b/E13b" };
  if (ma !== 1) return { ma: 1, bao: `bước chấm khuôn thoát ${ma} — không chấm được` };
  const do_ = dongDo(ra);
  const la = do_.filter((d) => d !== DONG_BAO_OAN);
  if (la.length) return { ma: 1, bao: `lệch ngoài dòng báo oan:\n${la.join("\n")}` };
  if (do_.length !== 1) return { ma: 1, bao: "bước chấm thoát 1 mà không có dòng báo oan — không rõ vì sao đỏ" };
  return { ma: 0, bao: `chỉ có dòng báo oan đã khai: ${DONG_BAO_OAN}` };
}

// Năm đối chứng trên đầu vào viết sẵn — chạy mỗi lần, đỏ thì bài không tin được.
assert.equal(xet(1, `${DONG_BAO_OAN}\n6 tệp giao diện ngoài bản đồ`).ma, 0, "đối chứng: chỉ dòng báo oan phải qua");
assert.equal(xet(1, `${DONG_BAO_OAN}\nlệch: apps/web/src/app/(app)/imports/new/man-nhap.tsx · khuôn Frame · nhóm nhap-excel`).ma, 1, "đối chứng: thêm một lệch phải đỏ");
assert.equal(xet(1, `${DONG_BAO_OAN}\nsai: design/patterns/cai-dat-san.md: thiếu khoá`).ma, 1, "đối chứng: lỗi bản đồ phải đỏ");
assert.equal(xet(1, "nợ cũ: a · thuộc hai nhóm màn: x, y").ma, 1, "đối chứng: thoát 1 không có dòng báo oan phải đỏ");
assert.equal(xet(2, "").ma, 1, "đối chứng: không chấm được phải đỏ");

const kit = spawnSync("node", ["packages/ui-lint/tim-kit.mjs"], { encoding: "utf8" }).stdout.trim();
if (!kit) {
  console.error("không tìm thấy kit nghiệm thu");
  process.exit(1);
}
const r = spawnSync("node", [`${kit}/scripts/design-floor-khuon.mjs`, "--kiem", "--root", "."], { encoding: "utf8" });
process.stdout.write(r.stdout ?? "");
process.stderr.write(r.stderr ?? "");
const kq = xet(r.status ?? 2, r.stdout ?? "");
console.log(`E12b/E13b: ${kq.bao}`);
process.exit(kq.ma);
