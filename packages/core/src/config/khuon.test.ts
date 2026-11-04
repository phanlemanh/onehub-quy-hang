// Khuôn giá trị (hàng 81: AC-4). Ma trận sinh từ sổ: mỗi khoá giá trị đơn đủ các ca có nghĩa với kiểu của nó; ca từ
// chối đi cặp với ca nhận trên cùng khoá, lỗi mở đầu bằng đúng khoá.
import assert from "node:assert/strict";
import { test } from "node:test";
import { kiemGiaTri } from "./khuon";
import { SO_DIEM } from "./so";

test("kiemGiaTri: hai điểm và hai biên mọi khoá giá trị đơn", () => {
  const don = SO_DIEM.filter((d) => d.kieu.loai !== "map" && !d.khoa.includes("<"));
  assert.ok(don.length >= 20);
  let soCa = 0;
  for (const d of don) {
    const k = d.kieu;
    const nhan: unknown[] = [d.macDinh];
    const tuChoi: unknown[] = ["sai-kieu", { a: 1 }];
    if (k.loai === "int" || k.loai === "decimal") {
      const buoc = k.loai === "int" ? 1 : 0.01;
      nhan.push(k.min, k.max, k.loai === "int" ? Math.floor((k.min + k.max) / 2) : (k.min + k.max) / 2);
      tuChoi.push(Number((k.min - buoc).toFixed(2)), Number((k.max + buoc).toFixed(2)));
      if (k.loai === "int" && k.min < k.max) tuChoi.push(k.min + 0.5);
      if (k.loai === "int") tuChoi[0] = String(k.min);
    }
    if (k.loai === "enum") {
      nhan.push(...k.giaTri);
      tuChoi.push("khac");
    }
    if (k.loai === "set") {
      nhan.push([k.giaTri[0]]);
      tuChoi.push([], ["khac"], [k.giaTri[0], k.giaTri[0]]);
    }
    if (k.loai === "bool") {
      nhan.push(true, false);
      tuChoi.push("co");
    }
    if (d.coTheTrong) nhan.push(null);
    else tuChoi.push(null);
    // Ràng buộc chéo («không nhỏ hơn» khoá khác) xét với khoá kia ở biên dưới — để biên của chính khoá này đo được.
    const goc = d.khongNhoHon;
    const dangAp = goc ? { [goc]: (SO_DIEM.find((x) => x.khoa === goc)!.kieu as { min: number }).min } : {};
    for (const v of nhan) {
      const kq = kiemGiaTri(d.khoa, v, dangAp);
      assert.equal(kq.ok, true, `${d.khoa} phải nhận ${JSON.stringify(v)}: ${kq.ok ? "" : kq.loi}`);
      soCa++;
    }
    for (const v of tuChoi) {
      const kq = kiemGiaTri(d.khoa, v, dangAp);
      assert.equal(kq.ok, false, `${d.khoa} phải từ chối ${JSON.stringify(v)}`);
      if (!kq.ok) assert.ok(kq.loi.startsWith(d.khoa), kq.loi);
      soCa++;
    }
  }
  assert.ok(soCa > don.length * 4, `số ca ${soCa}`);
});

test("kiemGiaTri: khoá lạ, map, nhãn chở số, ràng buộc chéo", () => {
  const la = kiemGiaTri("demo.khong_co", 1);
  assert.equal(la.ok, false);
  if (!la.ok) assert.ok(la.loi.startsWith("demo.khong_co"), la.loi);

  const map = kiemGiaTri("queue.groups", []);
  assert.equal(map.ok, false);
  if (!map.ok) assert.ok(map.loi.startsWith("queue.groups") && map.loi.includes("có bảng riêng"), map.loi);

  const nhan = "labels.field.unitNumber";
  assert.equal(kiemGiaTri(nhan, "Mã căn").ok, true);
  assert.equal(kiemGiaTri(nhan, "x".repeat(40)).ok, true);
  for (const v of ["x".repeat(41), "gọi 0900 000 001", "a@b.vn", ""]) {
    const kq = kiemGiaTri(nhan, v);
    assert.equal(kq.ok, false, JSON.stringify(v));
    if (!kq.ok) assert.ok(kq.loi.startsWith(nhan), kq.loi);
  }

  const dangAp = { "lead_routing.accept_minutes": 15 };
  const ngan = kiemGiaTri("lead_routing.first_call_minutes", 10, dangAp);
  assert.equal(ngan.ok, false);
  if (!ngan.ok) assert.ok(ngan.loi.startsWith("lead_routing.first_call_minutes"), ngan.loi);
  assert.equal(kiemGiaTri("lead_routing.first_call_minutes", 15, dangAp).ok, true);
});
