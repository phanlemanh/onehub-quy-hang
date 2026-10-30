// Test hai chiều của ngưỡng và kết luận — cùng một bộ số lành, rồi đẩy từng thước qua ngưỡng.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { danhGia, hieuChuanHopLe, ketLuan, thuocCuon } from "./nguong.mjs";
import { mainSach } from "./main-sach.mjs";

const LANH = {
  cuon: { p95: 20, ti_le_cham: 0, toi_cuoi: true },
  go: { p95: 30, gia_tri_dung: true },
  dan: { ms: 400, o_mau_dung: true },
};
const pha = (k, v) => ({ ...LANH, [k]: { ...LANH[k], ...v } });

describe("danhGia", () => {
  it("đối chứng dương: bộ số lành → đạt", () => assert.deepEqual(danhGia(LANH).truot, []));
  for (const [ten, k, v] of [
    ["p95 cuộn 40 ms", "cuon", { p95: 40 }],
    ["khung chậm 2%", "cuon", { ti_le_cham: 0.02 }],
    ["không cuộn tới dòng 5.000 (khung đều mà nội dung đứng yên)", "cuon", { toi_cuoi: false }],
    ["gõ 80 ms", "go", { p95: 80 }],
    ["gõ sai giá trị", "go", { gia_tri_dung: false }],
    ["dán 1.500 ms", "dan", { ms: 1500 }],
    ["ô mẫu sai", "dan", { o_mau_dung: false }],
  ]) {
    it(`phá: ${ten} → trượt đúng thước «${k}»`, () => {
      const r = danhGia(pha(k, v));
      assert.equal(r.dat, false);
      assert.deepEqual(r.truot, [k]);
      assert.match(r.chi_tiet.join(" "), new RegExp(`^${k}:|; ${k}:|${k}:`));
    });
  }
  it("thiếu số đo (NaN) → trượt, không đạt lặng", () => assert.equal(danhGia({ cuon: { p95: Number.NaN, ti_le_cham: 0, toi_cuoi: true }, go: LANH.go, dan: LANH.dan }).dat, false));
});

describe("thuocCuon", () => {
  it("khung đều 16 ms → p95 16, không khung chậm; một khung 80 ms trong 10 → 10% chậm", () => {
    const deu = Array.from({ length: 11 }, (_, i) => i * 16);
    assert.deepEqual(thuocCuon(deu), { so_khung: 10, p95: 16, ti_le_cham: 0 });
    const giat = [0, 16, 32, 112, 128, 144, 160, 176, 192, 208, 224];
    assert.equal(thuocCuon(giat).ti_le_cham, 0.1);
  });
});

describe("hieuChuanHopLe", () => {
  it("máy rảnh → hợp lệ; trang rỗng 25 ms hay bài đo 1,5× → loại kèm lý do", () => {
    assert.equal(hieuChuanHopLe({ rongP95: 16.7, benchMs: 100, mocBenchMs: 100 }).hop_le, true);
    assert.match(hieuChuanHopLe({ rongP95: 25, benchMs: 100, mocBenchMs: 100 }).ly_do[0], /trang rỗng/);
    assert.match(hieuChuanHopLe({ rongP95: 16, benchMs: 150, mocBenchMs: 100 }).ly_do[0], /bài đo JS/);
  });
});

describe("ketLuan", () => {
  const cham = { dat: false, truot: ["cuon", "go", "dan"] };
  const chamPhim = { dat: false, truot: ["go"] };
  it("ReUI đạt, hai đối chứng đỏ trượt → ok, chọn reui", () => {
    assert.deepEqual(ketLuan({ reui: { dat: true }, glide: null, cham, chamPhim }), { ok: true, chon: "reui", loi: [] });
  });
  it("ReUI trượt mà chưa đo Glide → không ok, gọi tên", () => {
    assert.match(ketLuan({ reui: { dat: false }, glide: null, cham, chamPhim }).loi.join(), /chưa đo Glide/);
  });
  it("ReUI trượt, Glide đạt → ok, chọn glide", () => {
    assert.equal(ketLuan({ reui: { dat: false }, glide: { dat: true }, cham, chamPhim }).chon, "glide");
  });
  it("đối chứng đỏ không trượt → không ok, gọi tên chế độ", () => {
    assert.match(ketLuan({ reui: { dat: true }, glide: null, cham: { dat: true, truot: [] }, chamPhim }).loi.join(), /cham=1/);
    assert.match(ketLuan({ reui: { dat: true }, glide: null, cham, chamPhim: { truot: [] } }).loi.join(), /cham=phim/);
  });
});

describe("mainSach", () => {
  it("diff chỉ hồ sơ và docs → sạch; có trang thử hay lock → trượt gọi tên tệp", () => {
    assert.deepEqual(mainSach(["_acceptance/bai-thu-luoi-5000-dong/contract.md", "docs/adr/0004-luoi-bang-hang.md"]), []);
    assert.deepEqual(mainSach(["apps/web/src/app/spikes/luoi/page.tsx", "package-lock.json", "docs/x.md"]), [
      "apps/web/src/app/spikes/luoi/page.tsx",
      "package-lock.json",
    ]);
  });
});
