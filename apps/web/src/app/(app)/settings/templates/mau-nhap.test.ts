// Màn Mẫu nhập (hàng 50 mau-nhap-va-bai, E6b, E9b): bốn trạng thái của vùng dựng ra đúng chữ của bảng trạng thái, ô Quy đổi
// chỉ ở trường giá trị đóng, hộp sửa theo kết quả lưu, và trang chặn vai trước khi đọc API.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chanMucSan } from "../cai-dat";
import { CHU, coQuyDoi, sauKhiLuu, thanSua, type CotMauNhap, type TrangThaiMau } from "./mau-nhap";
import { BangMauNhap } from "./vung-mau-nhap";

const cot: CotMauNhap = { headerKey: "tinh trang", target: "standardStatus", valueMap: { "con hang": "Active" }, nguon: { kieu: "lan-nhap", importId: "i-1", at: "2026-11-05T01:00:00Z" } };
const ve = (tt: TrangThaiMau) => renderToStaticMarkup(h(BangMauNhap, { tt, lamMoi: () => {} }));

test("mẫu nhập: chữ bốn trạng thái của vùng", () => {
  const BANG: [string, TrangThaiMau, string][] = [
    ["đang tải", { kieu: "dang-tai" }, CHU.dangTai],
    ["trống", { kieu: "xong", ds: [] }, CHU.trong],
    ["lỗi", { kieu: "loi" }, CHU.loi],
    ["có dữ liệu", { kieu: "xong", ds: [cot] }, "tinh trang"],
  ];
  let dem = 0;
  for (const [ca, tt, chu] of BANG) {
    assert.ok(ve(tt).includes(chu), `chữ trạng thái ${ca}`);
    dem++;
  }
  assert.equal(dem, 4);
  assert.ok(!ve({ kieu: "xong", ds: [cot] }).includes(CHU.trong), "đối chứng: có dữ liệu thì không hiện chữ trống");
});

test("mẫu nhập: ô Quy đổi chỉ ở trường giá trị đóng", () => {
  const BANG: [string, boolean][] = [["standardStatus", true], ["directionFaces", true], ["listPrice", false], ["ownerPhone", false], ["keep_as_note", false]];
  for (const [t, mong] of BANG) assert.equal(coQuyDoi(t), mong, `quy đổi ở ${t}`);
  // Đổi đích sang trường không đóng thì quy đổi bị bỏ khỏi thân gửi.
  assert.equal(thanSua(cot, "listPrice", "a → b").valueMap, undefined, "quy đổi còn khi đích không đóng");
  assert.deepEqual(thanSua(cot, "standardStatus", "con hang → Active").valueMap, { "con hang": "Active" });
});

test("mẫu nhập: hộp sửa theo kết quả lưu", () => {
  const BANG: [string, Parameters<typeof sauKhiLuu>[0], { dong: boolean; loi?: string }][] = [
    ["lưu được", { status: 200 }, { dong: true }],
    ["bị từ chối", { status: 400, reason: "đích lạ" }, { dong: false, loi: "đích lạ" }],
    ["lỗi mạng", null, { dong: false, loi: CHU.luuLoiMang }],
  ];
  let dem = 0;
  for (const [ca, kq, mong] of BANG) {
    assert.deepEqual(sauKhiLuu(kq), mong, ca);
    dem++;
  }
  assert.equal(dem, 3);
});

test("mẫu nhập: trang chặn vai trước khi đọc API", () => {
  assert.ok(chanMucSan(["listing_agent"])?.includes("chi-quan-tri=1"), "vai không quản trị phải về Cá nhân");
  assert.equal(chanMucSan(["company_admin"]), null, "đối chứng: quản trị không bị chuyển");
  const nguon = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  const chan = nguon.indexOf("chanMucSan(me.activeCompany.roles)");
  const doc = nguon.indexOf("/api/v1/company/import-templates");
  assert.ok(chan > 0 && doc > chan, "trang mẫu không chặn vai");
});
