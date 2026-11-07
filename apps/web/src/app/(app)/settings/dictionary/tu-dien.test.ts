// Màn Từ điển (hàng 70): sức khoẻ dữ liệu (E9), trang chặn người không quản trị và mục trong Cài đặt sàn (E5b).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { MUC_SAN } from "../cai-dat";
import { chuGiaTri, nhomTheoTruong, sucKhoeMan, type DongTuDien } from "./tu-dien-thuan";

const DAY = dirname(fileURLToPath(import.meta.url));
const d = (id: string, field: DongTuDien["field"], value: string, status: DongTuDien["status"], pickCount: number): DongTuDien => ({ id, field, raw: id, value, status, pickCount });

test("màn từ điển: sức khoẻ dữ liệu theo trường và cả sàn", () => {
  const rows = [
    d("a", "directionFaces", "Đông", "approved", 3),
    d("b", "directionFaces", "Tây", "proposed", 1),
    d("c", "directionFaces", "Nam", "rejected", 2),
    d("e", "feeInclusion", "included", "proposed", 4),
    d("f", "feeInclusion", "excluded", "approved", 1),
    d("g", "standardStatus", "Pending", "rejected", 1),
    d("h", "standardStatus", "Active", "approved", 5),
  ];
  const { tong, theoTruong } = sucKhoeMan(rows);
  assert.deepEqual(tong, { gap: 7, daNeo: 3, cho: 2, daBo: 2, lanChon: 17 });
  assert.deepEqual(theoTruong.map((t) => [t.field, t.s.daNeo, t.s.cho, t.s.daBo]), [["standardStatus", 1, 0, 1], ["feeInclusion", 1, 1, 0], ["directionFaces", 1, 1, 1]]);
  assert.deepEqual(sucKhoeMan([]).tong, { gap: 0, daNeo: 0, cho: 0, daBo: 0, lanChon: 0 });
  assert.deepEqual(nhomTheoTruong(rows).map((n) => n.rows.length), [2, 2, 3]);
  assert.deepEqual([chuGiaTri("standardStatus", "Pending"), chuGiaTri("feeInclusion", "excluded"), chuGiaTri("directionFaces", "Đông Nam")], ["Đang giao dịch", "Không bao phí", "Đông Nam"]);
});

test("màn từ điển: trang chặn mục sàn, mục có trong Cài đặt sàn", () => {
  const chanTruocApi = (nguon: string) => {
    const chan = nguon.indexOf("chanMucSan(");
    const api = nguon.indexOf("/api/v1/company/");
    return chan > 0 && api > chan;
  };
  assert.equal(chanTruocApi(readFileSync(join(DAY, "..", "users", "page.tsx"), "utf8")), true, "đối chứng: trang Người dùng");
  const trang = readFileSync(join(DAY, "page.tsx"), "utf8");
  assert.equal(chanTruocApi(trang), true, "settings/dictionary/page.tsx phải gọi chanMucSan trước khi đọc API");
  assert.equal(chanTruocApi(trang.replace(/chanMucSan\(/g, "boChan(")), false);
  assert.ok(MUC_SAN.some((m) => m.label === "Từ điển" && m.href === "/settings/dictionary"), "thiếu mục Từ điển trong nhóm Sàn");
});
