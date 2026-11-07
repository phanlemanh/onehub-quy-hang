// Màn Mẫu (hàng mau-bang-hang-va-bai): E1b (danh sách và xếp cột), E3b (tab Mẫu bài), E4b (vai), E10c (chữ từng trạng
// thái, nhãn menu). Bảng ca viết trước; đếm bằng số dòng bảng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { bocBai, baiFacebook, baiZalo, xuatBang, type CotBangHang, type MauBang } from "@quy-hang/core/export";
import type { CanNoiBo } from "@quy-hang/core/redaction";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PERSONAL_SETTINGS_PATH } from "@quy-hang/core";
import { chanMucSan, MUC_SAN } from "../cai-dat";
import { BangMauBai } from "./vung-mau-bai";
import { BangMauBang } from "./vung-mau-bang";
import { CHU_MAU, doiCho, loiO, sauKhiLuuMau, thanPutBai, xemTruocBai } from "./mau-san";

const ID = (i: number) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
const hai: MauBang[] = [
  { id: ID(1), ten: "[Tên] gửi đội", cot: ["livingArea", "unitNumber", "listPrice"] },
  { id: ID(2), ten: "[Tên] gửi khách", cot: ["buildingName", "listPrice"] },
];
const xong = <T,>(giaTri: T) => ({ kieu: "xong" as const, giaTri });
const khong = () => {};

test("mẫu bảng: danh sách đúng tên và cột theo thứ tự", () => {
  const html = renderToStaticMarkup(h(BangMauBang, { tt: xong(hai), lamMoi: khong }));
  for (const m of hai) {
    assert.ok(html.includes(m.ten), `thiếu mẫu ${m.ten}`);
    const cot = m.cot.map((c) => ({ livingArea: "Diện tích", unitNumber: "Mã căn", listPrice: "Giá", buildingName: "Toà" })[c as string]!).join(" · ");
    assert.ok(html.includes(cot), `cột của «${m.ten}» lệch thứ tự: cần «${cot}»`);
  }
});

test("mẫu bảng: nút lên, xuống xếp cột", () => {
  const goc: CotBangHang[] = ["unitNumber", "listPrice", "livingArea"];
  const BANG: [string, CotBangHang[], CotBangHang[]][] = [
    ["lên đầu", doiCho(goc, 1, -1), ["listPrice", "unitNumber", "livingArea"]],
    ["xuống cuối", doiCho(goc, 1, 1), ["unitNumber", "livingArea", "listPrice"]],
    ["giữa · biên giữ nguyên", doiCho(goc, 0, -1), goc],
  ];
  let dem = 0;
  for (const [ca, ra, mong] of BANG) {
    assert.deepEqual(ra, mong, `xếp cột sai — ${ca}`);
    dem++;
  }
  assert.equal(dem, 3);
});

test("mẫu bài: về mặc định bỏ khoá, xem trước, biên 500", () => {
  const mau = { zalo: { dau: "D", cuoi: "C" }, facebook: { dau: "F", cuoi: "" } };
  assert.deepEqual(thanPutBai(mau, "facebook", null), { templates: { zalo: mau.zalo } }, "về mặc định còn để kênh rỗng");
  assert.deepEqual(thanPutBai(mau, "zalo", { dau: "D2", cuoi: "" }), { templates: { zalo: { dau: "D2", cuoi: "" }, facebook: mau.facebook } });
  const c = { buildingName: "[Tên] Toà A", unitNumber: "A-12.05", livingArea: 68.5, bedroomsTotal: 2, listPrice: 3_250_000_000, standardStatus: "Active", photos: [] };
  const bang = xuatBang([c, { ...c, unitNumber: "A-08.02", livingArea: 55, bedroomsTotal: 1, listPrice: 2_100_000_000 }] as unknown as CanNoiBo[], {
    mau: "xlsx",
    nguoiNhan: "nhom_moi_gioi",
    cot: ["unitNumber", "livingArea", "listPrice"],
    today: "2026-11-07",
    tenSan: "[Tên sàn]",
  });
  assert.equal(xemTruocBai("zalo", { dau: "D", cuoi: "C" }), bocBai(baiZalo(bang), { dau: "D", cuoi: "C" }));
  assert.equal(xemTruocBai("facebook", { dau: "D", cuoi: "C" }), baiFacebook(bang, "[Tên sàn]", { dau: "D", cuoi: "C" }));
  assert.ok(xemTruocBai("zalo", { dau: "D", cuoi: "C" }).startsWith("D\n"), "xem trước thiếu lời mở đầu");
  assert.equal(loiO("a".repeat(500)), null, "đối chứng: 500 ký tự đúng biên");
  assert.equal(loiO("a".repeat(501)), CHU_MAU.toiDa);
});

test("vai: chỉ Quản trị ở lại màn Mẫu", () => {
  const BANG: [string, string[], boolean][] = [
    ["Quản trị", ["company_admin"], true],
    ["Đầu chủ", ["listing_agent"], false],
    ["Đầu khách", ["buyer_agent"], false],
    ["Trưởng nhóm", ["team_lead"], false],
    ["Telesales", ["telesales"], false],
  ];
  let dem = 0;
  for (const [ten, vai, oLai] of BANG) {
    const den = chanMucSan(vai);
    assert.equal(den === null, oLai, `vai ${ten}`);
    if (!oLai) assert.ok(den!.startsWith(PERSONAL_SETTINGS_PATH), `vai ${ten} phải về Cá nhân`);
    dem++;
  }
  assert.equal(dem, 5);
});

test("màn Mẫu: chữ của từng trạng thái", () => {
  const bang = (tt: Parameters<typeof BangMauBang>[0]["tt"], baoDau: string | null = null) => renderToStaticMarkup(h(BangMauBang, { tt, lamMoi: khong, baoDau }));
  // [trạng thái, chữ mong đợi, html dựng]
  const BANG: [string, string, string][] = [
    ["đang tải", "Đang tải mẫu…", bang({ kieu: "dang-tai" })],
    ["trống", "Sàn chưa có mẫu bảng hàng — xuất đang theo góc nhìn đang mở.", bang(xong([]))],
    ["có mẫu", "[Tên] gửi đội", bang(xong(hai))],
    ["lỗi đọc", "Chưa đọc được mẫu — thử lại", renderToStaticMarkup(h(BangMauBai, { tt: { kieu: "loi" }, lamMoi: khong }))],
    ["từ chối", "Tên đã có trong sàn", sauKhiLuuMau({ status: 400, reason: "export.templates[1].ten: «[Tên] A» đã có trong sàn" }).cau],
    ["lỗi lưu", "Chưa lưu được — thử lại", bang(xong(hai), sauKhiLuuMau(null).cau)],
    ["đã lưu", "Đã lưu mẫu", bang(xong(hai), sauKhiLuuMau({ status: 200 }).cau)],
    ["không quyền", "chi-quan-tri=1", chanMucSan(["listing_agent"]) ?? ""],
  ];
  let dem = 0;
  for (const [ten, chu, ra] of BANG) {
    assert.ok(ra.includes(chu), `thiếu chữ của trạng thái ${ten}`);
    dem++;
  }
  assert.equal(dem, 8);
  const nhan = MUC_SAN.map((m) => m.label);
  assert.ok(nhan.includes("Mẫu") && !nhan.includes("Mẫu nhập"), `menu: ${nhan.join(", ")}`);
});
