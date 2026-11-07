// Màn Mẫu với tên trường tiếng Anh (hàng mau-api-ten-truong-tieng-anh): E7b (thân PUT và câu lỗi cho người theo tên mới),
// E7c (màn dựng như nhau dù mẫu đọc từ dạng lưu cũ hay mới). Dạng cũ là đầu ra thật của bộ ghi trước vòng
// (`packages/core/src/export/mau-cu.fixture.json`).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { docMauBai, docMauBang, type CotBangHang, type MauBai, type MauBang } from "@quy-hang/core/export";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lyDoChoNguoi, thanPutBai, thanPutBang } from "./mau-san";
import { BangMauBai } from "./vung-mau-bai";
import { BangMauBang } from "./vung-mau-bang";

const FX = JSON.parse(readFileSync(new URL("../../../../../../../packages/core/src/export/mau-cu.fixture.json", import.meta.url), "utf8")) as {
  than: { "export.templates": { id: string; ten: string; cot: string[] }[]; "share.post_templates": Record<string, { dau: string; cuoi: string }> };
  luu: { "export.templates": unknown; "share.post_templates": unknown };
};
const MOI_BANG: MauBang[] = FX.than["export.templates"].map((m) => ({ id: m.id, name: m.ten.trim(), columns: m.cot as CotBangHang[] }));
const MOI_BAI: MauBai = Object.fromEntries(Object.entries(FX.than["share.post_templates"]).map(([k, l]) => [k, { opening: l.dau, closing: l.cuoi }]));
const xong = <T,>(giaTri: T) => ({ kieu: "xong" as const, giaTri });
const sx = (o: object) => Object.keys(o).sort();

test("thân PUT theo tên mới", () => {
  const bang = thanPutBang(MOI_BANG, { ...MOI_BANG[0]!, name: "[Tên] sửa" });
  for (const m of bang.templates) assert.deepEqual(sx(m), ["columns", "id", "name"], `thân còn khoá cũ: ${JSON.stringify(m)}`);
  const bai = thanPutBai(MOI_BAI, "zalo", { opening: "Mới", closing: "" });
  for (const l of Object.values(bai.templates)) assert.deepEqual(sx(l!), ["closing", "opening"], `thân còn khoá cũ: ${JSON.stringify(l)}`);
});

test("câu lỗi cho người theo tên mới", () => {
  const BANG: [string, string][] = [
    ["export.templates[0].name: «[Tên] A» đã có trong sàn", "Tên đã có trong sàn"],
    ["share.post_templates.zalo.opening: tối đa 500 ký tự", "Tối đa 500 ký tự"],
  ];
  for (const [lyDo, mong] of BANG) assert.equal(lyDoChoNguoi(lyDo), mong, `câu cho người lệch: ${lyDo}`);
  assert.equal(BANG.length, 2);
});

test("màn Mẫu dựng như nhau từ dạng lưu cũ và mới", () => {
  const cuBang = docMauBang(FX.luu["export.templates"]).ds;
  const cuBai = docMauBai(FX.luu["share.post_templates"]).mau;
  const htmlCu = renderToStaticMarkup(h(BangMauBang, { tt: xong(cuBang), lamMoi: () => {} }));
  const htmlMoi = renderToStaticMarkup(h(BangMauBang, { tt: xong(MOI_BANG), lamMoi: () => {} }));
  assert.equal(htmlCu, htmlMoi, "màn Mẫu mất tên mẫu dạng cũ");
  for (const m of MOI_BANG) assert.ok(htmlCu.includes(m.name), `thiếu tên mẫu «${m.name}»`);
  const baiCu = renderToStaticMarkup(h(BangMauBai, { tt: xong(cuBai), lamMoi: () => {} }));
  const baiMoi = renderToStaticMarkup(h(BangMauBai, { tt: xong(MOI_BAI), lamMoi: () => {} }));
  assert.equal(baiCu, baiMoi, "tab Mẫu bài lệch giữa dạng cũ và mới");
  assert.ok(baiCu.includes(MOI_BAI.zalo!.opening) && baiCu.includes(MOI_BAI.zalo!.closing), "tab Mẫu bài thiếu lời của mẫu");
});
