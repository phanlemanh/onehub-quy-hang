// Giải cấu hình của sàn (hàng 81: AC-5): mặc định, ghi đè, dòng hỏng, khoá lạ, đối tượng có bảng riêng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_SAN_MAC_DINH, giaiCauHinh } from "./giai";
import { SO_DIEM } from "./so";

const DON = SO_DIEM.filter((d) => d.kieu.loai !== "map" && !d.khoa.includes("<"));

test("giaiCauHinh: mặc định, ghi đè, dòng hỏng, khoá lạ, map", () => {
  const rong = giaiCauHinh([]);
  assert.deepEqual(rong.loi, []);
  for (const d of DON) assert.deepEqual(rong.cauHinh[d.khoa], d.macDinh, d.khoa);
  assert.deepEqual(rong.cauHinh, CAU_HINH_SAN_MAC_DINH);

  const doi = giaiCauHinh([{ key: "queue.call_back_after_days", value: 20 }]);
  assert.deepEqual(doi.loi, []);
  assert.equal(doi.cauHinh["queue.call_back_after_days"], 20);
  for (const d of DON) if (d.khoa !== "queue.call_back_after_days") assert.deepEqual(doi.cauHinh[d.khoa], d.macDinh, d.khoa);

  const hong = giaiCauHinh([{ key: "queue.call_back_after_days", value: 99 }]);
  assert.equal(hong.cauHinh["queue.call_back_after_days"], 14);
  assert.equal(hong.loi.length, 1);
  assert.ok(hong.loi[0]!.startsWith("queue.call_back_after_days"), hong.loi[0]);

  const la = giaiCauHinh([{ key: "demo.la", value: 1 }]);
  assert.equal(la.loi.length, 1);
  assert.ok(la.loi[0]!.startsWith("demo.la"), la.loi[0]);

  const map = giaiCauHinh([{ key: "queue.groups", value: [] }]);
  assert.deepEqual(map.loi, []);
  assert.equal("queue.groups" in map.cauHinh, false);

  // Ràng buộc chéo xét trên giá trị đã giải của sàn, không trên mặc định.
  const cheo = giaiCauHinh([
    { key: "lead_routing.first_call_minutes", value: 20 },
    { key: "lead_routing.accept_minutes", value: 25 },
  ]);
  assert.equal(cheo.cauHinh["lead_routing.accept_minutes"], 25);
  assert.equal(cheo.cauHinh["lead_routing.first_call_minutes"], 30);
  assert.equal(cheo.loi.length, 1);
  assert.ok(cheo.loi[0]!.startsWith("lead_routing.first_call_minutes"), cheo.loi[0]);
});
