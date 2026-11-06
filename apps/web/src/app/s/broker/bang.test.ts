// Trang nhóm môi giới (hàng 44): E1b (cách hiện theo người nhận, tiêu đề cột), E5 (Excel đọc ngược), E6 (ảnh trên canvas
// giả), E10c (chữ của từng trạng thái). Thân dựng bằng `thanTrangKhach` của lõi từ căn mồi — cùng hàm route công khai gọi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { canMoi, type CanNoiBo } from "@quy-hang/core/redaction";
import { thanTrangKhach } from "@quy-hang/core/sharing";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { docTep } from "@/lib/nhap/doc-tep";
import type { ThanTrang } from "../[code]/doc";
import Loading from "../[code]/loading";
import { TrangKhachCongKhai } from "../[code]/trang";
import { BangMoiGioi, laTrangMoiGioi } from "./bang";
import { CHU_MG, LINK_TAT, LOI_TAM } from "./chu";
import { moHinhTep, veMoiGioi, xlsxMoiGioi, type ButVe, type ToVe } from "./tep";

const HOM_NAY = "2026-11-06";
const MA = "AbCdEfGhIjKl";
const ba: CanNoiBo[] = [
  { ...canMoi(), unitNumber: "Z-03.01" },
  { ...canMoi(), unitNumber: "Z-01.01", standardStatus: "Pending" },
  { ...canMoi(), unitNumber: "Z-02.01", standardStatus: "Closed" },
];
const thanCua = (audience: "agents" | "client", muc: number | null = 40, an = false): ThanTrang => ({
  ...thanTrangKhach({ can: ba, audience, today: HOM_NAY, luuTrenLanGui: { mucChia: muc, feeInclusion: ["brokerageFee"] }, cauHinhMoiGioi: { anMucChia: an, feeInclusion: ["brokerageFee"] } }),
  listingIds: ba.map((_, i) => `L${i}`),
});

test("môi giới: link chọn cách hiện theo người nhận", () => {
  const BANG: [string, ThanTrang, boolean][] = [
    ["nhóm môi giới", thanCua("agents"), true],
    ["khách riêng", thanCua("client"), false],
  ];
  let dem = 0;
  for (const [ten, than, mong] of BANG) {
    assert.equal(laTrangMoiGioi(than), mong, `link nhóm môi giới chưa ra bảng — ${ten}`);
    dem++;
  }
  assert.equal(dem, 2);
  const html = renderToStaticMarkup(h(BangMoiGioi, { code: MA, than: thanCua("agents") }));
  const tieuDe = [...html.matchAll(/<th[^>]*>([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepEqual(tieuDe, thanCua("agents").cot!.map((c) => c.nhan), "tiêu đề cột lệch than.cot");
  assert.ok(html.includes("Mức chia: 40%"));
  assert.ok(html.includes("Bao phí: giá đã gồm phí môi giới"));
  // Dòng căn không còn bán thì mờ.
  assert.equal((html.match(/data-mo="true"/g) ?? []).length, 2);
});

test("môi giới: Excel đúng cột và dòng của bảng trang", async () => {
  const than = thanCua("agents");
  const m = moHinhTep(than);
  const doc = await docTep("bang.xlsx", xlsxMoiGioi(m));
  assert.ok(!("loi" in doc), "không đọc được tệp");
  const g = doc.grid.map((r) => r.map((o) => (o == null ? "" : String(o))));
  assert.deepEqual(g[0]![0], than.companyName);
  assert.deepEqual(g.slice(1, 3).map((r) => r[0]), ["Bao phí: giá đã gồm phí môi giới", "Mức chia: 40%"]);
  const iCot = g.findIndex((r) => r[0] === m.cot[0]);
  assert.deepEqual(g[iCot]!.slice(0, m.cot.length), than.cot!.map((c) => c.nhan), "cột Excel lệch bảng trang");
  const dong = g.slice(iCot + 1, iCot + 4).map((r) => [...r.slice(0, m.cot.length), ...Array(Math.max(0, m.cot.length - r.length)).fill("")].slice(0, m.cot.length));
  assert.deepEqual(dong, than.dong!.map((d) => d.map((o) => (o === "—" ? "—" : o))), "ô Excel lệch bảng trang");
  // Đối chứng: sàn ẩn mức chia → phần đầu không có dòng mức chia.
  const an = moHinhTep(thanCua("agents", 40, true));
  assert.ok(!an.dau.some((s) => s.startsWith("Mức chia")), "mức chia lọt vào tệp khi sàn ẩn");
});

test("môi giới: ảnh vẽ đúng cột và dòng", () => {
  const than = thanCua("agents");
  const ve: string[] = [];
  const but = (): ButVe => ({ font: "", fillStyle: "", textBaseline: "", measureText: (s) => ({ width: s.length * 7 }), fillText: (s) => void ve.push(s), fillRect: () => {}, scale: () => {} });
  const tao = (): ToVe => ({ width: 0, height: 0, getContext: () => but() });
  veMoiGioi(moHinhTep(than), tao);
  const m = moHinhTep(than);
  assert.deepEqual(ve.slice(0, m.dau.length), [than.companyName, "Bao phí: giá đã gồm phí môi giới", "Mức chia: 40%"]);
  const sau = ve.slice(m.dau.length);
  assert.deepEqual(sau.slice(0, m.cot.length), than.cot!.map((c) => c.nhan), "cột ảnh lệch bảng trang");
  assert.equal(sau.length, m.cot.length * (1 + than.dong!.length), "ảnh thiếu ô");
});

test("môi giới: chữ của từng trạng thái", () => {
  const html = (p: Parameters<typeof TrangKhachCongKhai>[0]) => renderToStaticMarkup(h(TrangKhachCongKhai, p));
  // [trạng thái, chữ mong đợi, html dựng]
  const BANG: [string, string, string][] = [
    ["đang tải", "Đang tải bộ căn…", renderToStaticMarkup(h(Loading))],
    ["có dữ liệu", "Tải Excel", renderToStaticMarkup(h(BangMoiGioi, { code: MA, than: thanCua("agents") }))],
    ["ẩn mức chia", "Bao phí", renderToStaticMarkup(h(BangMoiGioi, { code: MA, than: thanCua("agents", 40, true) }))],
    ["link tắt", "Link không còn mở", html({ code: MA, than: null })],
    ["lỗi tạm", "Chưa mở được", html({ code: MA, than: null, loiTam: true })],
    ["tải lỗi", "Chưa tải được tệp — thử lại", CHU_MG.taiLoi], // nút chỉ hiện câu này sau khi bấm lỗi — E10 nhìn nó trên màn
  ];
  let dem = 0;
  for (const [ten, chu, ra] of BANG) {
    assert.ok(ra.includes(chu), `thiếu chữ của trạng thái ${ten}`);
    dem++;
  }
  assert.equal(dem, 6);
  assert.ok(!BANG[2]![2].includes("Mức chia"), "mức chia hiện khi sàn ẩn");
  assert.ok(LINK_TAT.startsWith("Link không còn mở") && LOI_TAM.length > 0);
});
