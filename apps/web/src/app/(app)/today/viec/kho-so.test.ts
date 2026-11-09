import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { mucDangChon } from "../mo-nhom";
import { mucCotHomNay, type SoViec } from "./kho-so";

const TO_HOP: { ten: string; vai: string[]; co: string[]; khong: string[] }[] = [
  { ten: "telesales", vai: ["telesales"], co: ["lead_returned"], khong: ["lead_overdue", "new_lead", "buyer_reaction"] },
  { ten: "đầu chủ", vai: ["listing_agent"], co: ["new_lead", "missing_info"], khong: ["lead_overdue", "lead_returned", "buyer_reaction"] },
  { ten: "đầu khách", vai: ["buyer_agent"], co: ["buyer_reaction", "buyer_changed", "buyer_new_match"], khong: ["new_lead", "lead_overdue"] },
  { ten: "trưởng nhóm", vai: ["team_lead"], co: ["lead_overdue", "lead_unrouted"], khong: ["new_lead", "buyer_reaction"] },
  { ten: "hai vai", vai: ["team_lead", "listing_agent"], co: ["lead_overdue", "new_lead"], khong: ["buyer_reaction"] },
  { ten: "đủ vai", vai: ["team_lead", "listing_agent", "buyer_agent", "telesales"], co: ["lead_overdue", "new_lead", "buyer_reaction", "lead_returned"], khong: [] },
];

const ma = (href: string) => new URLSearchParams(href.split("?")[1] ?? "").get("nhom");

describe("cột thứ hai của Hôm nay", () => {
  for (const o of TO_HOP)
    it(`cột hai: nhóm theo vai, nhãn theo sàn, số theo nhóm, một mục sáng — ${o.ten}`, () => {
      const muc = mucCotHomNay(o.vai, null);
      const cac = muc.map((m) => ma(m.href));
      for (const c of o.co) assert.ok(cac.includes(c), `thiếu ${c}`);
      for (const c of o.khong) assert.equal(cac.includes(c), false, `thừa ${c}`);
    });

  const SO: SoViec = { so: 3, quaHan: 1, muc: [{ ma: "lead_overdue", nhan: "Lead trễ", so: 2 }, { ma: "new_lead", nhan: "Lead mới", so: 1 }, { ma: "buyer_reaction", nhan: "Khách phản ứng", so: null }] };

  it("nhãn theo sàn và số đúng từng mục; nguồn lỗi không có số", () => {
    const muc = mucCotHomNay(["team_lead"], SO);
    assert.deepEqual(muc.map((m) => [m.label, m.so]), [["Tất cả việc", 3], ["Lead trễ", 2], ["Lead mới", 1], ["Khách phản ứng", null]]);
  });

  it("đúng một mục sáng: không tham số, tham số đúng, mã lạ", () => {
    const muc = mucCotHomNay(["team_lead"], SO);
    assert.equal(mucDangChon(muc, "/today", ""), "/today");
    assert.equal(mucDangChon(muc, "/today", "nhom=lead_overdue"), "/today?nhom=lead_overdue");
    assert.equal(mucDangChon(muc, "/today", "nhom=la_lam"), "/today", "mã lạ về Tất cả việc");
  });

  it("sổ điểm biến thiên có dòng điều khoá của nhóm và mốc 48 giờ", () => {
    const so = readFileSync(path.resolve(import.meta.dirname, "../../../../../../../docs/architecture/so-diem-bien-thien.md"), "utf8");
    assert.match(so, /\| K33 \|[^\n]*Hôm nay[^\n]*48 giờ/, "thiếu dòng K33 về nhóm việc và mốc 48 giờ");
  });
});
