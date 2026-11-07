// Tên trường tiếng Anh của mẫu (hàng mau-api-ten-truong-tieng-anh): E4 (ghi chặt — tên cũ, khoá lạ, mẫu lẫn bị từ chối, lý
// do nêu tên đúng), E5 (đọc khoan dung hai dạng), E6b (xuất và tin Gửi từ dạng cũ bằng dạng mới). Dạng cũ là đầu ra thật của
// bộ ghi trước vòng (`mau-cu.fixture.json`, chụp ở main 9f7df527), không viết tay theo khuôn bên đọc.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { canMoi } from "../redaction";
import { soanTin } from "../sharing/tin";
import { banRaNgoai, CAU_HINH_MAC_DINH } from "../redaction";
import { xuatBang } from "./index";
import { docMauBai, docMauBang, kiemMauBai, kiemMauBang, type CotBangHang, type MauBai, type MauBang } from "./index";

const FX = JSON.parse(readFileSync(new URL("./mau-cu.fixture.json", import.meta.url), "utf8")) as {
  than: { "export.templates": { id: string; ten: string; cot: string[] }[]; "share.post_templates": Record<string, { dau: string; cuoi: string }> };
  luu: { "export.templates": unknown; "share.post_templates": unknown };
};
const ID = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
const DUNG = { id: ID(1), name: "[Tên] A", columns: ["listPrice"] };

/** Dạng mới mong đợi khi đọc bản lưu cũ: chính thân cũ, đổi tên trường, tên đã cắt khoảng trắng. */
const MONG_BANG: MauBang[] = FX.than["export.templates"].map((m) => ({ id: m.id, name: m.ten.trim(), columns: m.cot as CotBangHang[] }));
const MONG_BAI: MauBai = Object.fromEntries(Object.entries(FX.than["share.post_templates"]).map(([k, l]) => [k, { opening: l.dau, closing: l.cuoi }]));

test("ghi chặt: tên cũ, khoá lạ, mẫu lẫn bị từ chối, lý do nêu tên đúng", () => {
  // [ca, thân, khoá sai trong lý do, tên đúng (null = khoá lạ không có tên thay)]
  const BANG: [string, () => { ok: true } | { ok: false; lyDo: string }, string, string | null][] = [
    ["ten", () => kiemMauBang([DUNG, { id: ID(2), ten: "B", columns: ["listPrice"] }]), "«ten»", "«name»"],
    ["cot", () => kiemMauBang([DUNG, { id: ID(2), name: "B", cot: ["listPrice"] }]), "«cot»", "«columns»"],
    ["dau", () => kiemMauBai({ zalo: { opening: "a", closing: "" }, facebook: { dau: "a", closing: "" } }), "«dau»", "«opening»"],
    ["cuoi", () => kiemMauBai({ zalo: { opening: "a", cuoi: "" } }), "«cuoi»", "«closing»"],
    ["khoá lạ", () => kiemMauBang([DUNG, { id: ID(2), name: "B", columns: ["listPrice"], mau: 1 }]), "«mau»", null],
    ["mẫu lẫn", () => kiemMauBang([DUNG, { id: ID(2), name: "B", ten: "B", columns: ["listPrice"] }]), "«ten»", "«name»"],
  ];
  let dem = 0;
  for (const [ca, chay, khoa, dung] of BANG) {
    const kq = chay();
    assert.equal(kq.ok, false, `ca «${ca}» lẽ ra bị từ chối`);
    if (!kq.ok) {
      assert.ok(kq.lyDo.includes(khoa), `ca «${ca}»: lý do «${kq.lyDo}» không nêu ${khoa}`);
      if (dung) assert.ok(kq.lyDo.includes(dung), `ca «${ca}»: lý do «${kq.lyDo}» không nêu tên đúng ${dung}`);
      assert.match(kq.lyDo, /^(export\.templates\[1\]|share\.post_templates\.(zalo|facebook))/, `ca «${ca}»: lý do phải mở đầu bằng khoá`);
    }
    dem++;
  }
  assert.equal(dem, 6);
  // Đối chứng dương: cùng thân, chỉ tên mới.
  assert.equal(kiemMauBang([DUNG, { id: ID(2), name: "B", columns: ["listPrice"] }]).ok, true);
  assert.equal(kiemMauBai({ zalo: { opening: "a", closing: "" }, facebook: { opening: "a", closing: "" } }).ok, true);
});

test("đọc hai dạng: bản lưu cũ thật đọc ra tên mới, không lỗi", () => {
  const bang = docMauBang(FX.luu["export.templates"]);
  assert.deepEqual(bang, { ds: MONG_BANG, loi: [] }, "mẫu dạng cũ bị bỏ hay đọc sai");
  const bai = docMauBai(FX.luu["share.post_templates"]);
  assert.deepEqual(bai, { mau: MONG_BAI, loi: [] }, "mẫu bài dạng cũ bị bỏ hay đọc sai");
  // Lẫn: tên mới thắng.
  const lan = docMauBang([{ id: ID(1), name: "Mới", ten: "Cũ", columns: ["listPrice"], cot: ["livingArea"] }]);
  assert.deepEqual(lan.ds, [{ id: ID(1), name: "Mới", columns: ["listPrice"] }]);
  const lanBai = docMauBai({ zalo: { opening: "Mới", dau: "Cũ", closing: "", cuoi: "C" } });
  assert.deepEqual(lanBai.mau, { zalo: { opening: "Mới", closing: "" } });
  // Sai khuôn dạng cũ vẫn bị bỏ, lỗi nêu khoá mới.
  const sai = docMauBang([{ id: ID(1), ten: "  ", cot: ["listPrice"] }]);
  assert.deepEqual(sai.ds, []);
  assert.ok(sai.loi.some((l) => l.startsWith("export.templates[0].name")), `lỗi: ${sai.loi.join(" | ")}`);
});

test("xuất và tin Gửi từ dạng cũ bằng từ dạng mới", () => {
  const cu = docMauBai(FX.luu["share.post_templates"]).mau;
  const tuy = { nguoiNhan: "nhom_moi_gioi" as const, cot: MONG_BANG[0]!.columns, today: "2026-11-07", tenSan: "[Tên sàn]" };
  let dem = 0;
  for (const mau of ["post_zalo", "post_facebook"] as const) {
    const a = xuatBang([canMoi()], { ...tuy, mau, mauBai: cu });
    const b = xuatBang([canMoi()], { ...tuy, mau, mauBai: MONG_BAI });
    assert.equal(a.bai, b.bai, `${mau}: bài từ dạng cũ lệch`);
    assert.ok(a.bai!.includes(MONG_BAI[mau === "post_zalo" ? "zalo" : "facebook"]!.opening), `${mau}: thiếu lời mở đầu`);
    dem++;
  }
  const ban = [banRaNgoai(canMoi(), { cua: "gui_link", nguoiNhan: "nhom_moi_gioi", cauHinh: CAU_HINH_MAC_DINH, today: "2026-11-07" })];
  const tinCu = soanTin({ ban, nguoiNhan: "nhom_moi_gioi", mauZalo: cu.zalo });
  assert.equal(tinCu, soanTin({ ban, nguoiNhan: "nhom_moi_gioi", mauZalo: MONG_BAI.zalo }));
  assert.ok(tinCu.includes(MONG_BAI.zalo!.opening) && tinCu.includes(MONG_BAI.zalo!.closing), "tin Gửi thiếu lời của mẫu");
  dem++;
  assert.equal(dem, 3);
});
