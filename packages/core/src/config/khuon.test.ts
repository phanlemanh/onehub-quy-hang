// Khuôn giá trị (hàng 81: AC-4). Ma trận sinh từ sổ: mỗi khoá giá trị đơn đủ các ca có nghĩa với kiểu của nó; ca từ
// chối đi cặp với ca nhận trên cùng khoá, lỗi mở đầu bằng đúng khoá.
import assert from "node:assert/strict";
import { test } from "node:test";
import { kiemGiaTri } from "./khuon";
import { SO_DIEM } from "./so";

/** Danh sách viết trước mọi khoá giá trị đơn của sổ (không `map`), kể cả họ khoá — ma trận phải phủ đúng tập này. */
const KHOA_DON = [
  "lead_routing.accept_minutes",
  "lead_routing.first_call_minutes",
  "lead_routing.strategy",
  "lead_routing.alert_to",
  "queue.call_back_after_days",
  "queue.price_negotiation_after_days",
  "share.stale_warning_days",
  "price.change_confirm_pct",
  "fee.inclusion",
  "fee.brokerage_pct",
  "fee.personal_income_tax_pct",
  "fee.registration_fee_pct",
  "customer_page.show_confirmed_age",
  "customer_page.private_hides_unit_number",
  "customer_page.off_compound_address",
  "broker_page.commission_split_pct",
  "broker_page.hide_commission_split",
  "customer_page.interest_button",
  "labels.field.<trường chuẩn>",
  "values.auto_accept_after_choices",
  "custom_fields.<id>.share_with_partners",
  "ai.monthly_budget_usd",
  "listing.ready_min_real_photos",
];

/** Khoá cụ thể để gọi: họ khoá thay đoạn `<…>` bằng một tên mẫu. */
const khoaGoi = (khoa: string) => khoa.replace(/<[^>]+>/g, "mau_1");

test("kiemGiaTri: hai điểm và hai biên mọi khoá giá trị đơn", () => {
  const don = SO_DIEM.filter((d) => d.kieu.loai !== "map");
  assert.deepEqual(
    don.map((d) => d.khoa),
    KHOA_DON,
    "ma trận phủ đúng danh sách viết trước",
  );
  const daDo = new Set<string>();
  let soCa = 0;
  for (const d of don) {
    const k = d.kieu;
    const goi = khoaGoi(d.khoa);
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
    if (k.loai === "text") {
      nhan.push("x".repeat(k.toiDa));
      tuChoi.push("x".repeat(k.toiDa + 1), "");
      tuChoi[0] = 123; // sai kiểu của chữ là một số
    }
    if (k.loai === "bool") {
      nhan.push(true, false);
      tuChoi.push("co");
    }
    if (d.coTheTrong) nhan.push(null);
    else tuChoi.push(null);
    // Ràng buộc chéo («không nhỏ hơn» khoá khác) xét với khoá kia ở biên dưới — để biên của chính khoá này đo được.
    // Chiều ngược: khoá được khoá khác trỏ tới xét với khoá kia ở biên trên.
    const goc = d.khongNhoHon;
    const bien = (khoa: string, b: "min" | "max") => (SO_DIEM.find((x) => x.khoa === khoa)!.kieu as { min: number; max: number })[b];
    const dangAp: Record<string, number> = goc ? { [goc]: bien(goc, "min") } : {};
    for (const phu of SO_DIEM.filter((x) => x.khongNhoHon === d.khoa)) dangAp[phu.khoa] = bien(phu.khoa, "max");
    for (const v of nhan) {
      const kq = kiemGiaTri(goi, v, dangAp);
      assert.equal(kq.ok, true, `${goi} phải nhận ${JSON.stringify(v)}: ${kq.ok ? "" : kq.loi}`);
      daDo.add(d.khoa);
      soCa++;
    }
    for (const v of tuChoi) {
      const kq = kiemGiaTri(goi, v, dangAp);
      assert.equal(kq.ok, false, `${goi} phải từ chối ${JSON.stringify(v)}`);
      if (!kq.ok) assert.ok(kq.loi.startsWith(goi), kq.loi);
      soCa++;
    }
  }
  assert.deepEqual([...daDo], KHOA_DON, "mỗi khoá có ca nhận");
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
