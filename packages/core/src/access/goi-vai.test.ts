// Ma trận viết trước của luật «vai kéo theo vai» (hàng chu-san-du-vai, AC-1): năm vai × bật, tắt × đã có, chưa có vai kéo theo.
import assert from "node:assert/strict";
import { test } from "node:test";

import { ROLES } from "../navigation";
import bang from "./goi-vai.json" with { type: "json" };
import { doiVaiKhiTich, DU_NAM_VAI, kiemBangVai, VAI_KEO_THEO } from "./goi-vai";

const TAT_CA = [...ROLES];
const tap = (a: readonly string[]) => [...a].sort();
const giong = (thuc: readonly string[], mong: readonly string[], ten: string) => assert.deepEqual(tap(thuc), tap(mong), ten);

test("bảng kéo theo đúng điều chủ kho chốt (cách B 06/11, Hỏi-1)", () => {
  giong(VAI_KEO_THEO.company_admin ?? [], ["telesales", "listing_agent", "buyer_agent", "team_lead"], "Quản trị sàn");
  giong(VAI_KEO_THEO.team_lead ?? [], ["listing_agent", "buyer_agent"], "Trưởng nhóm");
  giong(DU_NAM_VAI, TAT_CA, "đủ năm vai");
});

// Ma trận viết trước, toàn phần: năm vai × ba trạng thái (chưa có gì · đã có một phần · đã có đủ). [vai bật, vai đang có, kết quả mong].
const CK = ["team_lead", "listing_agent", "buyer_agent", "telesales"];
const BAT: [string, string[], string[]][] = [
  ["company_admin", [], TAT_CA],
  ["company_admin", ["team_lead", "listing_agent"], TAT_CA],
  ["company_admin", CK, TAT_CA],
  ["team_lead", [], ["team_lead", "listing_agent", "buyer_agent"]],
  ["team_lead", ["listing_agent", "telesales"], ["telesales", "team_lead", "listing_agent", "buyer_agent"]],
  ["team_lead", ["listing_agent", "buyer_agent"], ["team_lead", "listing_agent", "buyer_agent"]],
  ["telesales", [], ["telesales"]],
  ["telesales", ["buyer_agent"], ["buyer_agent", "telesales"]],
  ["telesales", ["telesales"], ["telesales"]],
  ["listing_agent", [], ["listing_agent"]],
  ["listing_agent", ["telesales"], ["telesales", "listing_agent"]],
  ["listing_agent", ["listing_agent"], ["listing_agent"]],
  ["buyer_agent", [], ["buyer_agent"]],
  ["buyer_agent", ["telesales"], ["telesales", "buyer_agent"]],
  ["buyer_agent", ["buyer_agent"], ["buyer_agent"]],
];
test("ma trận bật đủ năm vai × ba trạng thái", () => {
  assert.equal(BAT.length, ROLES.length * 3);
  for (const vai of ROLES) assert.equal(BAT.filter(([v]) => v === vai).length, 3, `vai ${vai} thiếu trạng thái`);
});
for (const [vai, co, mong] of BAT) {
  test(`bật ${vai} khi đang có [${co.join(", ")}]`, () => {
    const kq = doiVaiKhiTich(co, vai, true);
    giong(kq, mong, "tập vai sau khi bật");
    assert.equal(new Set(kq).size, kq.length, "có vai trùng");
  });
}

// Tắt một vai chỉ bớt đúng vai ấy: năm vai × đã có đủ năm vai, chỉ có vai ấy, chưa có vai ấy.
for (const vai of TAT_CA) {
  test(`tắt ${vai} chỉ bớt đúng vai ấy`, () => {
    giong(doiVaiKhiTich(TAT_CA, vai, false), TAT_CA.filter((v) => v !== vai), "từ đủ năm vai");
    giong(doiVaiKhiTich([vai], vai, false), [], "từ người chỉ có vai ấy");
    giong(doiVaiKhiTich(TAT_CA.filter((v) => v !== vai), vai, false), TAT_CA.filter((v) => v !== vai), "đang không có vai ấy");
  });
}

test("không kéo lại vai đã gỡ: tắt rồi bật vai khác không kéo vai đã gỡ của vai trên", () => {
  const go = doiVaiKhiTich(TAT_CA, "telesales", false);
  giong(doiVaiKhiTich(go, "buyer_agent", false), ["listing_agent", "team_lead", "company_admin"], "gỡ tiếp một vai");
  giong(doiVaiKhiTich(go, "buyer_agent", true), go, "bật lại vai đã có không kéo Telesales về");
});

test("kéo theo một lần, không dây chuyền ngoài bảng: bảng phải khai đủ", () => {
  // Quản trị sàn có Trưởng nhóm trong gói, và tự khai đủ vai của Trưởng nhóm — không dựa vào lan.
  for (const v of VAI_KEO_THEO.team_lead ?? []) assert.ok(VAI_KEO_THEO.company_admin?.includes(v), `Quản trị sàn thiếu ${v}`);
});

test("bảng hợp lệ — bảng thật", () => assert.deepEqual(kiemBangVai(bang), []));
test("bảng hợp lệ — đối chứng đỏ: mã vai lạ nêu đúng mã", () => {
  assert.deepEqual(kiemBangVai({ company_admin: ["telesales", "vai_la"] }), ["mã vai lạ: vai_la"]);
});
test("bảng hợp lệ — đối chứng đỏ: vai trên lạ, kéo theo chính mình", () => {
  assert.deepEqual(kiemBangVai({ quan_ly: ["telesales"] }), ["mã vai lạ: quan_ly"]);
  assert.deepEqual(kiemBangVai({ team_lead: ["team_lead"] }), ["vai kéo theo chính nó: team_lead"]);
});
