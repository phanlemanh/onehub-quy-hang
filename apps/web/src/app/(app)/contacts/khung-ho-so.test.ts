// Khung hồ sơ liên hệ (hàng khung-ho-so-lien-he): E1 (cùng khung cột phụ với hồ sơ căn, ba trạng thái), E2 (nút Đóng,
// Esc), E3 (đủ bốn cột), E4 (dòng tô, lưới cao hết khung), E5 (khung hồ sơ căn không đổi so với main), E7 (trang đầu
// máy chủ, chờ chỉ khi gõ), E7b (không hỏi lại lượt đầu). Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement as h, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KhungHoSo } from "@/components/khoi/solution-crm-4/ho-so";
import { KhungHoSoCan } from "../units/ho-so/khung";
import { DanhSachLienHe, taoCot } from "./danh-sach";
import { escDong, HoSoNguoi, type TrangThaiHoSo } from "./ho-so";
import { canDocLan, CHU, henDoc, trangDauLienHe, type DongLienHe, type HoSo } from "./lien-he";

const HS: HoSo = {
  contact: { id: "c1", name: "[Tên] Một", contactTypes: ["Seller"], status: "contact", holderName: "[Tên] Giữ" },
  phones: [{ phoneId: "p1", label: null, isPrimary: true, tail: "011" }],
  opportunities: [],
  listings: [],
  timeline: [],
};
const BA: [string, TrangThaiHoSo][] = [
  ["đang tải", { kieu: "dang-tai" }],
  ["lỗi", { kieu: "loi" }],
  ["xong", { kieu: "xong", hs: HS }],
];
const khong = () => {};
/** Đúng cách vung.tsx dựng cột phụ: HoSoNguoi trong KhungHoSo cotPhu. */
const cotPhu = (tt: TrangThaiHoSo) =>
  renderToStaticMarkup(h(KhungHoSo, { cotPhu: true, nhan: CHU.hoSo, children: h(HoSoNguoi, { tt, daMo: {}, onHienSo: khong, onThuLai: khong, onDong: khong }) }));
/** Thẻ mở gốc (thẻ, lớp, data-slot) của một chuỗi HTML. */
const goc = (html: string) => /^<div[^>]*>/.exec(html)![0];
const theMoPanel = (html: string) => /<div[^>]*data-slot="cot-ho-so"[^>]*>/.exec(html)?.[0] ?? null;

test("cột phụ liên hệ: cùng khung cột phụ với hồ sơ căn, ba trạng thái", () => {
  const vung = readFileSync(new URL("./vung.tsx", import.meta.url), "utf8");
  assert.match(vung, /cotPhu=\{\s*<KhungHoSo cotPhu nhan=\{CHU\.hoSo\}>\s*<HoSoNguoi/, "vung.tsx không dựng cột phụ bằng KhungHoSo cotPhu bọc HoSoNguoi");
  const mau = renderToStaticMarkup(h(KhungHoSo, { cotPhu: true, nhan: CHU.hoSo, children: h("p") }));
  let dem = 0;
  for (const [ca, tt] of BA) {
    const html = cotPhu(tt);
    assert.equal(goc(html), goc(mau), `${ca}: nút gốc khác khung cột phụ chung`);
    assert.equal(theMoPanel(html), theMoPanel(mau), `${ca}: thân cuộn khác khung cột phụ chung`);
    assert.equal((html.match(/data-slot="frame"/g) ?? []).length, 1, `${ca}: không đúng một khung`);
    dem++;
  }
  assert.equal(dem, 3);
  // Đối chứng: hồ sơ căn cạnh Bảng hàng cùng nút gốc.
  const can = renderToStaticMarkup(h(KhungHoSoCan, { cotPhu: true, children: h("p") }));
  assert.equal(goc(can), goc(mau), "khung hồ sơ căn khác khung cột phụ chung");
});

test("đóng hồ sơ: nút Đóng ở đầu hồ sơ và luật Esc", () => {
  assert.ok(cotPhu({ kieu: "xong", hs: HS }).includes(`aria-label="${CHU.dongHoSo}"`), "thiếu nút Đóng hồ sơ");
  const the = (tagName: string, trong: string | null = null) => ({ tagName, closest: (s: string) => (trong && s.includes(trong) ? {} : null) });
  const BANG: [string, Parameters<typeof escDong>[0], boolean, boolean][] = [
    ["Esc khi hồ sơ mở", { key: "Escape", defaultPrevented: false, target: the("BODY") }, true, true],
    ["hồ sơ đóng", { key: "Escape", defaultPrevented: false, target: the("BODY") }, false, false],
    ["đã có chỗ dùng phím", { key: "Escape", defaultPrevented: true, target: the("BODY") }, true, false],
    ["đích là ô nhập", { key: "Escape", defaultPrevented: false, target: the("INPUT") }, true, false],
    ["đích là vùng soạn", { key: "Escape", defaultPrevented: false, target: the("TEXTAREA") }, true, false],
    ["đích trong menu, listbox, hộp", { key: "Escape", defaultPrevented: false, target: the("DIV", 'role="menu"') }, true, false],
    ["phím khác", { key: "Enter", defaultPrevented: false, target: the("BODY") }, true, false],
  ];
  for (const [ca, e, mo, mong] of BANG) assert.equal(escDong(e, mo), mong, `Esc — ${ca}`);
  assert.equal(BANG.length, 7);
});

test("bảng: đủ bốn cột, vừa phần còn lại khi hồ sơ mở 38% ở 1440", () => {
  const cot = taoCot(khong);
  assert.deepEqual(cot.map((c) => c.id), ["ten", "nguoiGiu", "coHoi", "can"], "cột của lưới lệch (cột Loại phải bỏ)");
  // Bản kiểm 06/11: ở 1440 với cột hồ sơ 38%, phần bảng còn 693 px; trừ lề khung 32 px.
  const tong = cot.reduce((n, c) => n + (c.size ?? 150), 0);
  assert.ok(tong <= 693 - 32, `tổng bề rộng cột ${tong} > 661`);
});

test("dòng đang mở được tô, lưới cao hết khung", () => {
  const ds: DongLienHe[] = [1, 2, 3].map((i) => ({ id: `c${i}`, name: `[Tên] ${i}`, contactTypes: ["Buyer"], status: "contact", holderName: null, phoneCount: 1, openOpportunities: 0, listingCount: 0 }));
  const dung = (chon: string | null) =>
    renderToStaticMarkup(h(DanhSachLienHe, { tt: { kieu: "xong", ds, con: false }, q: "", loai: "", chon, onQ: khong, onLoai: khong, onChon: khong, onThem: khong, onThuLai: khong }));
  const co = dung("c2");
  const dong = [...co.matchAll(/<tr[^>]*data-row-id="([^"]+)"[^>]*>/g)];
  assert.deepEqual(dong.filter((m) => m[0].includes('data-state="selected"')).map((m) => m[1]), ["c2"], "dòng đang mở không tô");
  assert.ok(!dung(null).includes('data-state="selected"'), "tô dòng khi không mở hồ sơ");
  const lopKhung = new Set((/<div class="([^"]*)"[^>]*data-slot="frame"/.exec(co)?.[1] ?? "").split(/\s+/));
  for (const l of ["flex", "flex-col", "h-full", "min-h-0"]) assert.ok(lopKhung.has(l), `khung bảng không cao hết vùng: thiếu ${l}`);
  assert.match(co, /<thead[^>]*class="[^"]*sticky/, "tên cột không dính đầu");
});

test("khung hồ sơ căn không đổi so với main trước vòng", () => {
  // Chụp ở main 9f7df527…ad043a93 từ units/ho-so/khung.tsx cũ (Frame dense + FramePanel tự dựng), cùng thân <p>x</p>.
  const goc = readFileSync(new URL("../units/ho-so/khung-cot-phu.goc.html", import.meta.url), "utf8").trimEnd();
  assert.equal(renderToStaticMarkup(h(KhungHoSoCan, { cotPhu: true, children: h("p", null, "x") as ReactNode })), goc, "khung hồ sơ căn đổi");
});

test("trang đầu máy chủ và chờ chỉ khi gõ", async () => {
  const BANG: [Record<string, string>, string][] = [
    [{}, "/api/v1/contacts"],
    [{ type: "Buyer" }, "/api/v1/contacts?type=Buyer"],
    [{ status: "lead" }, "/api/v1/contacts?status=lead"],
    [{ type: "Seller", status: "lead" }, "/api/v1/contacts?type=Seller&status=lead"],
  ];
  for (const [loc, duong] of BANG) {
    const goi: string[] = [];
    const kq = await trangDauLienHe(loc, async (u) => (goi.push(u), new Response(JSON.stringify({ items: [], nextCursor: null }), { status: 200 })));
    assert.deepEqual(goi, [duong], `đường đọc lệch bộ lọc ${JSON.stringify(loc)}`);
    assert.deepEqual(kq, { items: [], nextCursor: null });
  }
  assert.equal(await trangDauLienHe({}, async () => new Response("", { status: 500 })), null);
  const trang = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  assert.match(trang, /trangDauLienHe\(loc, goi\)/);
  assert.match(trang, /<VungLienHe dau=\{dau\} \/>/, "page.tsx không trao trang đầu cho vùng");
  assert.deepEqual([henDoc("mo-man"), henDoc("doi-loc"), henDoc("go-tim")], [0, 0, 250]);
});

test("không hỏi lại lượt đầu khi trang máy chủ cùng bộ lọc", () => {
  const BANG: [string | null, string, boolean, boolean][] = [
    ["k", "k", true, false],
    ["k", "k2", true, true],
    [null, "k", true, true],
    ["k", "k", false, true],
  ];
  for (const [dau, hien, lanDau, mong] of BANG) assert.equal(canDocLan(dau, hien, lanDau), mong, `canDocLan(${dau}, ${hien}, ${lanDau})`);
  const vung = readFileSync(new URL("./vung.tsx", import.meta.url), "utf8");
  assert.match(vung, /canDocLan\(dau\?\.khoa \?\? null, khoaLuot, lanDau\)/, "vùng không dùng canDocLan ở lượt đọc");
  assert.match(vung, /henDoc\(lyDo\)/, "vùng không dùng henDoc cho khoảng chờ");
});
