// Gợi ý giá trị chuẩn và từ điển của sàn (hàng 70: E1, E4 phần lõi, E9, E10 phần lõi).
import assert from "node:assert/strict";
import { test } from "node:test";
import { cachGoDaDuyet, goiYGiaTri, kiemCachGo, sucKhoeTuDien, type DongCachGo, type TruongTuDien } from "./goi-y";
import { normalizeValue } from "./normalize";

/** Chặn mọi lối mạng trong ca: gọi mạng là ca đỏ («không gọi dịch vụ ngoài»). */
function khongMang<T>(fn: () => T): T {
  const g = globalThis as Record<string, unknown>;
  const cu = g.fetch;
  g.fetch = () => {
    throw new Error("gợi ý gọi mạng");
  };
  try {
    return fn();
  } finally {
    g.fetch = cu;
  }
}

test("gợi ý giá trị chuẩn", () => {
  const BANG: [TruongTuDien, string, string | null, string | null][] = [
    // [trường, chữ, khớp, gợi ý đầu]
    ["directionFaces", "dong nam", "Đông Nam", null],
    ["directionFaces", "ĐN", "Đông Nam", null],
    ["directionFaces", "Đ-N", "Đông Nam", null],
    ["feeInclusion", "bp", "included", null],
    ["feeInclusion", "KBP", "excluded", null],
    ["standardStatus", "Đang gd", "Pending", null],
    ["standardStatus", "GD", "Pending", null],
    ["directionFaces", "dong nm", null, "Đông Nam"],
    ["feeInclusion", "khong bao phi", "excluded", null],
    ["feeInclusion", "khong bao phii", null, "excluded"],
    ["standardStatus", "dang giao dich", "Pending", null],
    ["standardStatus", "dang giao dch", null, "Pending"],
    ["directionFaces", "xyz", null, null],
    ["standardStatus", "12345", null, null],
    ["standardStatus", "Gọi 0900 000 001", null, null],
    ["feeInclusion", "[Tên]@vidu.vn", null, null],
    ["directionFaces", "CCCD 012345678901", null, null],
  ];
  let dem = 0;
  khongMang(() => {
    for (const [f, raw, khop, dau] of BANG) {
      const kq = goiYGiaTri(f, raw);
      assert.equal(kq.khop, khop, `${f} «${raw}»: khớp`);
      assert.equal(kq.goiY[0] ?? null, dau, `${f} «${raw}»: gợi ý đầu ${JSON.stringify(kq.goiY)}`);
      assert.ok(kq.goiY.length <= 3, `${f} «${raw}»: quá ba gợi ý`);
      dem++;
    }
  });
  assert.equal(dem, BANG.length);
  // Từ điển của sàn khớp trước.
  assert.equal(goiYGiaTri("directionFaces", "huong DN", [{ field: "directionFaces", raw: "huong dn", value: "Đông Nam" }]).khop, "Đông Nam");
  assert.equal(goiYGiaTri("directionFaces", "huong DN").khop, null, "đối chứng: không có từ điển sàn thì không khớp");
});

test("đề xuất chưa duyệt không đổi chuẩn hoá", () => {
  const rows: DongCachGo[] = [{ field: "directionFaces", raw: "dong nm", value: "Đông Nam", status: "proposed", pickCount: 1 }];
  const chuan = (r: DongCachGo[]) => normalizeValue("directionFaces", "dong nm", { today: "2026-11-07", companyAliases: cachGoDaDuyet(r) }).mark;
  assert.equal(chuan(rows), "needs_person", "đề xuất chưa duyệt đã đổi chuẩn hoá");
  assert.equal(chuan([{ ...rows[0]!, status: "rejected" }]), "needs_person");
  assert.equal(chuan([{ ...rows[0]!, status: "approved" }]), "keep", "đã duyệt phải chuẩn hoá thẳng");
});

test("kiểm đề xuất cách gõ", () => {
  assert.deepEqual(kiemCachGo("directionFaces", " Dong  NM ", "Đông Nam"), { ok: true, cachGo: { field: "directionFaces", raw: "Dong  NM", rawFold: "dong nm", value: "Đông Nam" } });
  const BANG: [unknown, unknown, unknown, RegExp][] = [
    ["ownerPhone", "x", "y", /không có từ điển/],
    ["directionFaces", "Gọi 0900 000 001", "Đông", /số điện thoại/],
    ["directionFaces", "[Tên]@vidu.vn", "Đông", /email/],
    ["directionFaces", "012345678901", "Đông", /số giấy tờ/],
    ["directionFaces", "x".repeat(41), "Đông", /dài hơn 40/],
    ["directionFaces", "dong nm", "Đông Nam Bộ", /không phải giá trị chuẩn/],
    ["feeInclusion", "bao phi", "excluded", /sàn không đổi nghĩa/],
    ["directionFaces", "dong nam", "Tây Bắc", /sàn không đổi nghĩa/],
  ];
  let dem = 0;
  for (const [f, raw, v, re] of BANG) {
    const kq = kiemCachGo(f, raw, v);
    assert.ok(!kq.ok && re.test(kq.loi), `${String(f)} «${String(raw)}»: ${kq.ok ? "lọt" : kq.loi}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
});

test("sức khoẻ từ điển", () => {
  const rows: DongCachGo[] = [
    { field: "directionFaces", raw: "a", value: "Đông", status: "approved", pickCount: 3 },
    { field: "directionFaces", raw: "b", value: "Tây", status: "proposed", pickCount: 1 },
    { field: "directionFaces", raw: "c", value: "Nam", status: "rejected", pickCount: 2 },
    { field: "feeInclusion", raw: "d", value: "included", status: "proposed", pickCount: 4 },
    { field: "feeInclusion", raw: "e", value: "excluded", status: "approved", pickCount: 1 },
    { field: "standardStatus", raw: "f", value: "Pending", status: "rejected", pickCount: 1 },
    { field: "standardStatus", raw: "g", value: "Active", status: "approved", pickCount: 5 },
  ];
  assert.deepEqual(sucKhoeTuDien(rows), {
    standardStatus: { gap: 2, daNeo: 1, cho: 0, daBo: 1, lanChon: 6 },
    feeInclusion: { gap: 2, daNeo: 1, cho: 1, daBo: 0, lanChon: 5 },
    directionFaces: { gap: 3, daNeo: 1, cho: 1, daBo: 1, lanChon: 6 },
  });
  const rong = { gap: 0, daNeo: 0, cho: 0, daBo: 0, lanChon: 0 };
  assert.deepEqual(sucKhoeTuDien([]), { standardStatus: rong, feeInclusion: rong, directionFaces: rong });
});
