// Màn Mẫu báo mẫu hỏng (hàng man-mau-bao-mau-hong): E1 (tab Mẫu bảng hàng), E2 (tab Mẫu bài), E3 (lời cho người, ma trận
// mọi dạng lỗi lõi phát ra), E4 (không chỗ hỏng thì không báo), E5b (trang giữ errors của đáp). Dòng lỗi là đầu ra THẬT
// của docMauBang/docMauBai trên dữ liệu hỏng viết trước — không chép tay chuỗi lỗi.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { docMauBai, docMauBang } from "@quy-hang/core/export";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CHU_MAU, loiMauHong, trangThaiTuDap, type TrangThaiMauSan } from "./mau-san";
import { BangMauBai } from "./vung-mau-bai";
import { BangMauBang } from "./vung-mau-bang";
import type { MauBai, MauBang } from "@quy-hang/core/export";

const ID = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
const M = (i: number, name: string, columns: unknown) => ({ id: ID(i), name, columns });
const khong = () => {};
const xong = <T,>(giaTri: T, baoHong: string[]): TrangThaiMauSan<T> => ({ kieu: "xong", giaTri, baoHong });
const KHOA_KY_THUAT = /export\.templates|share\.post_templates|\[\d+\]|holderName|closePrice|unitNumber|listPrice|\bname\b|\bcolumns\b|\bopening\b|\bclosing\b|\bid\b|uuid/;

/** Bảng dữ liệu hỏng của mẫu bảng hàng: [ca, giá trị lưu, câu phải chứa]. */
const BANG_HONG: [string, unknown, string][] = [
  ["cột bị bỏ", [M(1, "[Tên] A", ["listPrice", "holderName"])], "Người giữ"],
  ["tên trùng", [M(1, "[Tên] A", ["listPrice"]), M(2, " [tên] a ", ["listPrice"])], "trùng"],
  ["không phải đối tượng", [M(1, "[Tên] A", ["listPrice"]), 7], "không đọc được"],
  ["cả khoá không phải danh sách", { a: 1 }, "Toàn bộ mẫu bảng hàng"],
  ["quá 20 mẫu", Array.from({ length: 21 }, (_, i) => M(i + 1, `M${i}`, ["listPrice"])), "hơn 20"],
];
const BAI_HONG: [string, unknown, string][] = [
  ["kênh lạ", { tiktok: { opening: "a", closing: "" }, zalo: { opening: "Z", closing: "" } }, "một kênh không dùng được"],
  ["zalo 501 ký tự", { zalo: { opening: "a".repeat(501), closing: "" } }, "Zalo"],
  ["facebook thiếu closing", { facebook: { opening: "a" } }, "Facebook"],
  ["cả khoá là mảng", [1], "Toàn bộ mẫu bài"],
];

test("tab Mẫu bảng hàng báo chỗ hỏng", () => {
  let dem = 0;
  for (const [ca, v, chua] of BANG_HONG) {
    const { ds, loi } = docMauBang(v);
    assert.ok(loi.length > 0, `ca «${ca}»: dữ liệu không hỏng — ca không đo gì`);
    const cau = loiMauHong(loi);
    const html = renderToStaticMarkup(h(BangMauBang, { tt: xong(ds, cau), lamMoi: khong }));
    assert.ok(html.includes(CHU_MAU.hongTieuDe(loi.length)), `ca «${ca}»: tab không báo chỗ hỏng`);
    assert.ok(html.includes(CHU_MAU.hongLuuKe), `ca «${ca}»: thiếu câu lần lưu kế`);
    for (const c of cau) assert.ok(html.includes(c.replace(/«|»/g, (x) => x)), `ca «${ca}»: thiếu câu «${c}»`);
    assert.ok(cau.some((c) => c.includes(chua)), `ca «${ca}»: không câu nào chứa «${chua}»: ${cau.join(" | ")}`);
    dem++;
  }
  assert.equal(dem, 5);
});

test("tab Mẫu bài báo chỗ hỏng", () => {
  let dem = 0;
  for (const [ca, v, chua] of BAI_HONG) {
    const { mau, loi } = docMauBai(v);
    assert.ok(loi.length > 0, `ca «${ca}»: dữ liệu không hỏng — ca không đo gì`);
    const cau = loiMauHong(loi);
    const html = renderToStaticMarkup(h(BangMauBai, { tt: xong(mau, cau), lamMoi: khong }));
    assert.ok(html.includes(CHU_MAU.hongTieuDe(loi.length)) && html.includes(CHU_MAU.hongLuuKe), `ca «${ca}»: tab Mẫu bài không báo chỗ hỏng`);
    assert.ok(cau.some((c) => c.includes(chua)), `ca «${ca}»: không câu nào chứa «${chua}»: ${cau.join(" | ")}`);
    dem++;
  }
  assert.equal(dem, 4);
});

test("lời cho người: mọi dạng lỗi lõi phát ra, không khoá kỹ thuật", () => {
  // Mỗi chỗ bộ đọc của lõi phát lỗi (loi.push hay mảng loi trả thẳng) có ít nhất một nhóm ca; số nhóm bằng số chỗ phát
  // đếm trong mã nguồn lõi — thêm nhánh mà quên nhóm ca là đỏ.
  const NHOM: [string, () => string[]][] = [
    ["bảng: cả khoá không phải danh sách", () => docMauBang("x").loi],
    ["bảng: phần tử không đọc được", () => docMauBang([7]).loi],
    ["bảng: bỏ cột không ra ngoài", () => docMauBang([M(1, "A", ["listPrice", "holderName", "closePrice", "zzz"])]).loi],
    [
      "bảng: bỏ mẫu (mọi lý do của khuôn)",
      () =>
        docMauBang([
          { id: "x", name: "A", columns: ["listPrice"] },
          M(2, "  ", ["listPrice"]),
          M(3, "a".repeat(61), ["listPrice"]),
          M(4, "B", ["listPrice"]),
          M(5, " b ", ["listPrice"]),
          M(6, "C", ["holderName"]),
        ]).loi,
    ],
    ["bảng: quá 20 mẫu", () => docMauBang(Array.from({ length: 21 }, (_, i) => M(i + 1, `M${i}`, ["listPrice"]))).loi],
    ["bài: cả khoá sai khuôn", () => docMauBai([1]).loi],
    [
      "bài: bỏ kênh (mọi lý do)",
      () => docMauBai({ tiktok: { opening: "a", closing: "" }, zalo: 5, facebook: { opening: 1, closing: "a".repeat(501) } }).loi.concat(docMauBai({ zalo: { opening: "a".repeat(501), closing: "" } }).loi),
    ],
  ];
  const nguon = readFileSync(new URL("../../../../../../../packages/core/src/export/mau-san.ts", import.meta.url), "utf8");
  const choPhat = (nguon.match(/loi\.push\(|loi: \[`/g) ?? []).length;
  assert.equal(NHOM.length, choPhat, `lõi có ${choPhat} chỗ phát lỗi, bảng có ${NHOM.length} nhóm — thêm nhóm cho nhánh mới`);
  let tong = 0;
  for (const [nhom, sinh] of NHOM) {
    const loi = sinh();
    assert.ok(loi.length > 0, `nhóm «${nhom}» không sinh lỗi nào`);
    const cau = loiMauHong(loi);
    assert.equal(cau.length, loi.length, `nhóm «${nhom}»: số câu khác số dòng lỗi`);
    cau.forEach((c, i) => {
      assert.notEqual(c, CHU_MAU.hongChung, `nhóm «${nhom}»: dòng «${loi[i]}» rơi về câu chung`);
      assert.ok(!KHOA_KY_THUAT.test(c), `nhóm «${nhom}»: câu «${c}» còn khoá kỹ thuật`);
    });
    tong += cau.length;
  }
  assert.ok(tong >= NHOM.length);
  // Đối chứng: cột nêu bằng nhãn; dòng lạ khuôn ra đúng câu chung.
  assert.ok(loiMauHong(docMauBang([M(1, "A", ["listPrice", "holderName"])]).loi)[0]!.includes("Người giữ"));
  assert.deepEqual(loiMauHong(["xyz", 7]), [CHU_MAU.hongChung, CHU_MAU.hongChung]);
});

test("không chỗ hỏng thì không báo", () => {
  const ds: MauBang[] = [{ id: ID(1), name: "[Tên] A", columns: ["listPrice"] }];
  const bai: MauBai = { zalo: { opening: "Chào", closing: "" } };
  const tieuDe = CHU_MAU.hongTieuDe(1).replace(/\d+/, "");
  const dung = (baoHong: string[] | undefined) => [
    renderToStaticMarkup(h(BangMauBang, { tt: { kieu: "xong", giaTri: ds, baoHong }, lamMoi: khong })),
    renderToStaticMarkup(h(BangMauBai, { tt: { kieu: "xong", giaTri: bai, baoHong }, lamMoi: khong })),
  ];
  for (const baoHong of [[], undefined] as (string[] | undefined)[]) {
    for (const html of dung(baoHong)) {
      assert.ok(!html.includes(CHU_MAU.hongLuuKe) && !html.includes(tieuDe), "báo hỏng khi không có chỗ hỏng");
      assert.ok(!html.includes('role="status"'), "có khối role=status khi không có chỗ hỏng");
    }
  }
  // Đối chứng dương: cùng tab, baoHong khác rỗng thì khối báo và role=status hiện.
  for (const html of dung(["Mẫu thứ 2 đã lưu không đọc được."])) {
    assert.ok(html.includes(CHU_MAU.hongTieuDe(1)) && html.includes(CHU_MAU.hongLuuKe) && html.includes('role="status"'), "đối chứng: khối báo không hiện");
  }
});

test("lời cho người: mỗi lý do bỏ mẫu, bỏ lời của khuôn lõi có câu riêng", () => {
  // Lý do của loiMotMau, loiMotKenh ở lõi (mỗi `return \`${k}…` một lý do). Bảng ghi trước: lý do đến được qua bộ đọc
  // khoan dung thì sinh bằng docMauBang/docMauBai; lý do bộ đọc lọc trước khi kiểm (cột lạ, cột nội bộ, cột trùng, quá
  // 15 cột) dựng đúng khuôn dòng lõi phát. Số dòng bảng bằng số `return \`${k}` trong hai hàm — thêm lý do mà quên dòng là đỏ.
  const BANG: [string, () => string[]][] = [
    ["mẫu không phải đối tượng", () => [`export.templates[0]: phải là đối tượng { id, name, columns } — bỏ mẫu`]],
    ["mã sai", () => docMauBang([{ id: "x", name: "A", columns: ["listPrice"] }]).loi],
    ["tên trống", () => docMauBang([M(1, " ", ["listPrice"])]).loi],
    ["tên dài", () => docMauBang([M(1, "a".repeat(61), ["listPrice"])]).loi],
    ["tên trùng", () => docMauBang([M(1, "A", ["listPrice"]), M(2, "a", ["listPrice"])]).loi],
    ["không cột", () => docMauBang([M(1, "A", [])]).loi],
    ["quá 15 cột", () => [`export.templates[0].columns: tối đa 15 cột — bỏ mẫu`]],
    ["cột lạ", () => [`export.templates[0].columns: cột lạ "zzz" — bỏ mẫu`]],
    ["cột nội bộ", () => [`export.templates[0].columns: holderName là cột nội bộ, không ra ngoài — bỏ mẫu`]],
    ["cột trùng", () => [`export.templates[0].columns: cột listPrice trùng — bỏ mẫu`]],
    ["kênh lạ", () => docMauBai({ tiktok: { opening: "a", closing: "" } }).loi],
    ["kênh không phải đối tượng", () => docMauBai({ zalo: 5 }).loi],
    ["lời không phải chữ", () => docMauBai({ zalo: { opening: 1, closing: "" } }).loi],
    ["lời dài", () => docMauBai({ facebook: { opening: "", closing: "a".repeat(501) } }).loi],
  ];
  const nguon = readFileSync(new URL("../../../../../../../packages/core/src/export/mau-san.ts", import.meta.url), "utf8");
  const hai = ["loiMotMau", "loiMotKenh"].map((ten) => {
    const dau = nguon.indexOf(`function ${ten}(`);
    return nguon.slice(dau, nguon.indexOf("\n}\n", dau));
  });
  const soLyDo = hai.reduce((n, than) => n + (than.match(/return `\$\{k\}/g) ?? []).length, 0);
  assert.equal(BANG.length, soLyDo, `lõi có ${soLyDo} lý do, bảng có ${BANG.length} dòng — thêm dòng cho lý do mới`);
  for (const [ca, sinh] of BANG) {
    const loi = sinh();
    assert.equal(loi.length, 1, `ca «${ca}»: cần đúng một dòng lỗi, có ${JSON.stringify(loi)}`);
    const [c] = loiMauHong(loi);
    assert.notEqual(c, CHU_MAU.hongChung, `ca «${ca}»: dòng «${loi[0]}» rơi về câu chung`);
    assert.ok(!KHOA_KY_THUAT.test(c!), `ca «${ca}»: câu «${c}» còn khoá kỹ thuật`);
  }
});

test("trang giữ errors của đáp", () => {
  const { loi } = docMauBang([M(1, "A", ["listPrice", "holderName"])]);
  const tt = trangThaiTuDap<MauBang[]>({ ok: true, body: { templates: [], errors: loi } });
  assert.deepEqual(tt, { kieu: "xong", giaTri: [], baoHong: loiMauHong(loi) }, "trang vứt errors");
  assert.deepEqual(trangThaiTuDap({ ok: false, body: null }), { kieu: "loi" });
  assert.deepEqual(trangThaiTuDap(null), { kieu: "loi" });
  const trang = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  assert.equal((trang.match(/trangThaiTuDap</g) ?? []).length, 2, "page.tsx phải dựng cả hai tab bằng trangThaiTuDap");
});
