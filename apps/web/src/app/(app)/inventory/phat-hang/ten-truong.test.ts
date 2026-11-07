// Hộp Xuất và màn Gửi với mẫu lưu dạng cũ (hàng mau-api-ten-truong-tieng-anh): E6 (xuất theo mẫu, bài Zalo, tin Gửi), E6c
// (ô «Cột theo» dựng như nhau). Máy chủ giả trả đúng bản lưu cũ thật (`mau-cu.fixture.json`) — bộ đọc của trang phải đọc
// được nó.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { baiZalo, bocBai, docMauBang, type CotBangHang, type MauBang } from "@quy-hang/core/export";
import { banRaNgoai, canMoi } from "@quy-hang/core/redaction";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mauZaloTu, tinMacDinh } from "../../shares/new/gui";
import { moHopVoiMau } from "../mau-xuat-san";
import { banXuatTuDong } from "./chuyen-dong";
import { CotTheo, tuyChonXuat } from "./hop-thoai";
import { dongMoi, MOI_COT, TODAY } from "./moi-xuat.test-helpers";

const FX = JSON.parse(readFileSync(new URL("../../../../../../../packages/core/src/export/mau-cu.fixture.json", import.meta.url), "utf8")) as {
  than: { "export.templates": { id: string; ten: string; cot: string[] }[]; "share.post_templates": Record<string, { dau: string; cuoi: string }> };
  luu: { "export.templates": unknown; "share.post_templates": unknown };
};
const MOI_BANG: MauBang[] = FX.than["export.templates"].map((m) => ({ id: m.id, name: m.ten.trim(), columns: m.cot as CotBangHang[] }));
const MOI_BAI = Object.fromEntries(Object.entries(FX.than["share.post_templates"]).map(([k, l]) => [k, { opening: l.dau, closing: l.cuoi }]));
const coDinh = { dong: [dongMoi(canMoi())], cot: MOI_COT, today: TODAY, tenSan: "[Tên sàn]", tenNguoiGui: "" };
const mayChu = (bang: unknown, bai: unknown) => async (duong: string) => ({ status: 200, body: { templates: duong.endsWith("export") ? bang : bai } });
const NHAN: Record<string, string> = { unitNumber: "Mã căn", listPrice: "Giá", livingArea: "Diện tích", unitType: "Loại căn" };

test("xuất và tin Gửi từ mẫu lưu dạng cũ", async () => {
  const cu = await moHopVoiMau(coDinh, mayChu(FX.luu["export.templates"], FX.luu["share.post_templates"]));
  const moi = await moHopVoiMau(coDinh, mayChu(MOI_BANG, MOI_BAI));
  const id = MOI_BANG[0]!.id;
  const xuat = (m: typeof cu, mau: "xlsx" | "post_zalo") => banXuatTuDong(m.dong, { ...tuyChonXuat(m, m.mauSan, id), mau, nguoiNhan: "nhom_moi_gioi" });
  assert.deepEqual(xuat(cu, "xlsx").cot, MOI_BANG[0]!.columns.map((c) => NHAN[c]), "mẫu dạng cũ không ra cột");
  const bai = xuat(cu, "post_zalo");
  assert.equal(bai.bai, bocBai(baiZalo(bai), MOI_BAI.zalo), "bài Zalo không mang lời của mẫu dạng cũ");
  assert.equal(bai.bai, xuat(moi, "post_zalo").bai, "bài Zalo lệch giữa dạng cũ và mới");
  const ban = [banRaNgoai(canMoi(), { cua: "gui_link", nguoiNhan: "nhom_moi_gioi", today: TODAY })];
  const tinCu = tinMacDinh({ ban, nguoiNhan: "nhom_moi_gioi", tenKhach: null, mauZalo: mauZaloTu({ templates: FX.luu["share.post_templates"] }) });
  const tinMoi = tinMacDinh({ ban, nguoiNhan: "nhom_moi_gioi", tenKhach: null, mauZalo: mauZaloTu({ templates: MOI_BAI }) });
  assert.equal(tinCu, tinMoi, "tin Gửi lệch giữa dạng cũ và mới");
  assert.ok(tinCu.includes(MOI_BAI.zalo!.opening) && tinCu.includes(MOI_BAI.zalo!.closing), "tin Gửi thiếu lời của mẫu");
});

test("ô «Cột theo» dựng như nhau từ dạng lưu cũ và mới", () => {
  const cu = { mauBang: docMauBang(FX.luu["export.templates"]).ds, mauBai: {} };
  const moi = { mauBang: MOI_BANG, mauBai: {} };
  const htmlCu = renderToStaticMarkup(h(CotTheo, { mauSan: cu, chon: null, onChon: () => {} }));
  assert.equal(htmlCu, renderToStaticMarkup(h(CotTheo, { mauSan: moi, chon: null, onChon: () => {} })), "màn đổi theo dạng lưu");
  assert.deepEqual(cu.mauBang.map((m) => m.name), MOI_BANG.map((m) => m.name), "tên mẫu dạng cũ trống hay sai thứ tự");
});
