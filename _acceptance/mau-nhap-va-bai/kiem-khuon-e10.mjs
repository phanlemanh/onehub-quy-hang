// E10e của hàng 50 (mau-nhap-va-bai): rào bù cho E10 đạt có giới hạn mã 1 (giám sát trả L-39, luật 33 — báo oan kit#485,
// cùng lối hàng 103). Bước chấm khuôn của kit 2.37.0 bỏ qua ngoai_le không có khoá khoi, nên màn Mẫu nhập — đã khai ngoại lệ
// ở trang-tam (L-36) — bị báo «thuộc hai nhóm màn» và thoát 1. Bài này chạy cùng bước chấm và chỉ cho qua khi dòng lệch DUY
// NHẤT là đúng dòng báo oan ấy; mọi lệch hay lỗi bản đồ khác vẫn đỏ. Kit vá (bước chấm thoát 0) thì bài báo «bỏ mã 1 ở E10 và
// bài này» và thoát 0.
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";

export const DONG_BAO_OAN = "lệch: apps/web/src/app/(app)/settings/templates/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam";

/** Dòng làm bước chấm thoát 1: lệch mới và lỗi bản đồ (đúng điều kiện thoát của design-floor-khuon --kiem). */
export const dongDo = (ra) => ra.split("\n").filter((d) => d.startsWith("lệch:") || d.startsWith("sai:"));

/** 0 = qua, 1 = đỏ; kèm câu báo. */
export function xet(ma, ra) {
  if (ma === 0) return { ma: 0, bao: "bước chấm khuôn thoát 0 — kit đã vá hoặc lệch đã hết: bỏ mã 1 ở E10 và bài E10e" };
  if (ma !== 1) return { ma: 1, bao: `bước chấm khuôn thoát ${ma} — không chấm được` };
  const do_ = dongDo(ra);
  const la = do_.filter((d) => d !== DONG_BAO_OAN);
  if (la.length) return { ma: 1, bao: `lệch ngoài dòng báo oan:\n${la.join("\n")}` };
  if (do_.length !== 1) return { ma: 1, bao: "bước chấm thoát 1 mà không có dòng báo oan — không rõ vì sao đỏ" };
  return { ma: 0, bao: `chỉ có dòng báo oan đã khai: ${DONG_BAO_OAN}` };
}

// Đối chứng trên đầu vào viết sẵn — chạy mỗi lần, đỏ thì bài không tin được.
assert.equal(xet(1, `${DONG_BAO_OAN}\n3 tệp giao diện ngoài bản đồ`).ma, 0, "đối chứng: chỉ dòng báo oan phải qua");
assert.equal(xet(1, `${DONG_BAO_OAN}\nlệch: apps/web/x/page.tsx · khuôn Frame · nhóm gui`).ma, 1, "đối chứng: thêm một lệch phải đỏ");
assert.equal(xet(1, `${DONG_BAO_OAN}\nsai: design/patterns/cai-dat-san.md: thiếu khoá`).ma, 1, "đối chứng: lỗi bản đồ phải đỏ");
assert.equal(xet(1, "nợ cũ: a · thuộc hai nhóm màn: x, y").ma, 1, "đối chứng: thoát 1 không có dòng báo oan phải đỏ");
assert.equal(xet(2, "").ma, 1, "đối chứng: không chấm được phải đỏ");

if (import.meta.url === `file://${process.argv[1]}`) {
  const tim = spawnSync(process.execPath, ["packages/ui-lint/tim-kit.mjs"], { encoding: "utf8" });
  const kit = process.env.CLAUDE_PLUGIN_ROOT || tim.stdout.trim();
  const r = spawnSync(process.execPath, [`${kit}/scripts/design-floor-khuon.mjs`, "--kiem", "--root", "."], { encoding: "utf8" });
  const kq = xet(r.status, `${r.stdout}${r.stderr}`);
  console.log(`E10e: ${kq.bao}`);
  process.exit(kq.ma);
}
