// E13 của hàng 49 (thue-phi), chép nếp hàng 48 (luat-chia-lead): rào bù cho E11 đạt có giới hạn mã 1 — cùng nếp hàng 34 (chủ kho chốt 04/11, luật đợt 33, 45).
// Bước chấm khuôn của kit 2.37.0 không xét ngoai_le, nên mục Thuế phí mới của Cài đặt sàn — thuộc nhóm cai-dat-san và nằm trong ngoai_le của
// trang-tam — bị báo «thuộc hai nhóm màn» và thoát 1. Bài này chạy cùng bước chấm và chỉ cho qua khi dòng lệch DUY NHẤT
// là đúng dòng báo oan ấy; mọi lệch hay lỗi bản đồ khác vẫn đỏ. Kit vá (bước chấm thoát 0) thì bài báo «bỏ mã 1 ở E11
// và bài này» và thoát 0. Gỡ cả E13 lẫn mã 1 của E11 khi kit vá (kit#480).
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

export const DONG_BAO_OAN = "lệch: apps/web/src/app/(app)/settings/fees/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam";

/** Dòng làm bước chấm thoát 1: lệch mới và lỗi bản đồ (đúng điều kiện thoát của design-floor-khuon --kiem). */
export const dongDo = (ra) => ra.split("\n").filter((d) => d.startsWith("lệch:") || d.startsWith("sai:"));

/** 0 = qua, 1 = đỏ; kèm câu báo. */
export function xet(ma, ra) {
  if (ma === 0) return { ma: 0, bao: "bước chấm khuôn thoát 0 — kit đã vá hoặc lệch đã hết: bỏ mã 1 ở E11 và bài E13" };
  if (ma !== 1) return { ma: 1, bao: `bước chấm khuôn thoát ${ma} — không chấm được` };
  const do_ = dongDo(ra);
  const la = do_.filter((d) => d !== DONG_BAO_OAN);
  if (la.length) return { ma: 1, bao: `lệch ngoài dòng báo oan:\n${la.join("\n")}` };
  if (do_.length !== 1) return { ma: 1, bao: "bước chấm thoát 1 mà không có dòng báo oan — không rõ vì sao đỏ" };
  return { ma: 0, bao: `chỉ có dòng báo oan đã khai: ${DONG_BAO_OAN}` };
}

// Đối chứng trên đầu vào viết sẵn — chạy mỗi lần, đỏ thì bài không tin được.
assert.equal(xet(1, `${DONG_BAO_OAN}\n10 tệp giao diện ngoài bản đồ`).ma, 0, "đối chứng: chỉ dòng báo oan phải qua");
assert.equal(xet(1, `${DONG_BAO_OAN}\nlệch: apps/web/x/page.tsx · khuôn Frame · nhóm cai-dat-san`).ma, 1, "đối chứng: thêm một lệch phải đỏ");
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
console.log(`E13: ${kq.bao}`);
process.exit(kq.ma);
