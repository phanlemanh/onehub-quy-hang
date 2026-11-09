import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import type { DongLeadTruongNhom } from "../nguon";
import type { TinDauKhach } from "@quy-hang/core/today";
import type { MyLeadView } from "@quy-hang/core/dedupe";

import { mucDangChon } from "../mo-nhom";
import { gopViec, type MaNguon, type VaoGop } from "./gop-viec";
import { boNhomCua, moTaSoViec, mucCotHomNay, mucSoTuGop, type SoViec } from "./kho-so";

const TL = ["lead_overdue", "lead_unrouted"];
const DC = ["new_lead", "viec_rieng"];
const TIN = ["buyer_reaction", "buyer_changed", "buyer_new_match"];
/** `du`: mục đầy đủ viết trước khi đã có số; `co`, `khong`: phần soi khi chưa có số (bộ đầu chủ mặc định). */
const TO_HOP: { ten: string; vai: string[]; du: string[]; co: string[]; khong: string[] }[] = [
  { ten: "telesales", vai: ["telesales"], du: ["lead_returned"], co: ["lead_returned"], khong: ["lead_overdue", "new_lead", "buyer_reaction"] },
  { ten: "đầu chủ", vai: ["listing_agent"], du: DC, co: ["new_lead", "missing_info"], khong: ["lead_overdue", "lead_returned", "buyer_reaction"] },
  { ten: "đầu khách", vai: ["buyer_agent"], du: TIN, co: TIN, khong: ["new_lead", "lead_overdue"] },
  { ten: "trưởng nhóm", vai: ["team_lead"], du: TL, co: TL, khong: ["new_lead", "buyer_reaction"] },
  { ten: "hai vai", vai: ["team_lead", "listing_agent"], du: [...TL, ...DC], co: ["lead_overdue", "new_lead"], khong: ["buyer_reaction"] },
  { ten: "đủ vai", vai: ["team_lead", "listing_agent", "buyer_agent", "telesales"], du: [...TL, ...DC, "lead_returned", ...TIN], co: ["lead_overdue", "new_lead", "buyer_reaction", "lead_returned"], khong: [] },
];

const ma = (href: string) => new URLSearchParams(href.split("?")[1] ?? "").get("nhom");

const BAY_GIO = "2026-11-09T10:00:00.000Z";
const AT = "2026-11-09T09:00:00.000Z";
const doi = (id: string, kind: DongLeadTruongNhom["kind"]) => ({ leadId: id, kind, buildingName: "Toà A", unitNumber: null, agentUserId: null, dueAt: AT }) as DongLeadTruongNhom;
const tin = (kind: TinDauKhach["kind"]) => ({ kind, at: AT, day: "2026-11-09", share: { id: "s", recipient: "[Tên]" }, shares: [], listing: { id: "c", name: "A-1" } }) as unknown as TinDauKhach;
/** Mỗi nguồn có việc; số dòng của từng nhóm khác nhau để bắt nhầm nhóm. */
const VAO = (vai: string[], b: Partial<VaoGop<string>> = {}): VaoGop<string> => ({
  vai,
  bayGio: BAY_GIO,
  tv: null,
  dauChu: [{ code: "new_lead", label: "Lead mới", viec: ["l1", "l2"], soQua: 1 }, { code: "viec_rieng", label: "Việc riêng", viec: ["c1"], soQua: 0 }],
  leadGiao: { trang: "ok" },
  dauChuSan: { trang: "ok" },
  hangDoi: { trang: "ok", ds: [doi("a", "accept_overdue"), doi("b", "first_call_overdue"), doi("c", "first_call_overdue"), doi("d", "unrouted")] },
  leadCuaToi: { trang: "ok", ds: [{ id: "t", stage: "returned" } as MyLeadView] },
  tin: { trang: "ok", ds: [tin("reaction"), tin("reaction"), tin("changed"), tin("new_match")] },
  ...b,
});
const BO_SAN = [{ code: "new_lead", label: "Lead mới", enabled: true }, { code: "viec_rieng", label: "Việc riêng", enabled: true }, { code: "da_tat", label: "Đã tắt", enabled: false }];
const tao = (ten: Record<string, string> = {}) => (code: string, macDinh: string) => ({ code, label: ten[code] ?? macDinh, enabled: true });
/** Chuỗi thật: gộp, ghi số theo bộ nhóm của vai, rồi cột thứ hai đọc. */
function cotCua(v: VaoGop<string>, ten: Record<string, string> = {}) {
  const gop = gopViec(v);
  return mucCotHomNay(v.vai, { so: gop.so, quaHan: gop.quaHan, coLoi: gop.loi.length > 0, muc: mucSoTuGop(boNhomCua(v.vai, BO_SAN, tao(ten)), gop) });
}
const SO_DUNG: Record<string, number> = { lead_overdue: 3, lead_unrouted: 1, new_lead: 2, viec_rieng: 1, lead_returned: 1, buyer_reaction: 2, buyer_changed: 1, buyer_new_match: 1 };

describe("cột thứ hai của Hôm nay", () => {
  for (const o of TO_HOP)
    it(`cột hai: nhóm theo vai, nhãn theo sàn, số theo nhóm, một mục sáng — ${o.ten}`, () => {
      const chua = mucCotHomNay(o.vai, null).map((m) => ma(m.href));
      for (const c of o.co) assert.ok(chua.includes(c), `chưa có số: thiếu ${c}`);
      for (const c of o.khong) assert.equal(chua.includes(c), false, `chưa có số: thừa ${c}`);

      const muc = cotCua(VAO(o.vai), { [o.du[0]!]: "Tên của sàn" });
      assert.deepEqual(muc.slice(1).map((m) => ma(m.href)), o.du, "có số: đúng và đủ nhóm của vai");
      assert.deepEqual(muc.slice(1).map((m) => m.so), o.du.map((c) => SO_DUNG[c]), "có số: số theo từng nhóm");
      if (TL.includes(o.du[0]!) || o.du[0] === "lead_returned" || TIN.includes(o.du[0]!)) assert.equal(muc[1]!.label, "Tên của sàn", "nhãn theo sàn");
      assert.equal(muc[0]!.so, o.du.reduce((s, c) => s + SO_DUNG[c]!, 0), "«Tất cả việc» bằng tổng các nhóm");
      assert.ok(muc.some((m) => m.href === mucDangChon(muc, "/today", `nhom=${o.du[0]}`)), "một mục sáng");
      assert.equal(mucDangChon(muc, "/today", "nhom=la_lam"), "/today");
    });

  it("cột hai: nguồn lỗi thì nhóm của nguồn đó không có số, nhóm khác giữ số", () => {
    const vai = ["team_lead", "listing_agent"];
    const muc = cotCua(VAO(vai, { hangDoi: { trang: "loi", ds: [] } }));
    assert.deepEqual(muc.slice(1).map((m) => [ma(m.href), m.so]), [["lead_overdue", null], ["lead_unrouted", null], ["new_lead", 2], ["viec_rieng", 1]]);
  });

  it("đầu màn: nguồn lỗi không báo «Không còn việc», hết việc thật mới báo", () => {
    const moTa = (v: VaoGop<string>) => {
      const g = gopViec(v);
      return moTaSoViec({ so: g.so, quaHan: g.quaHan, coLoi: g.loi.length > 0, muc: [] });
    };
    const RONG = { dauChu: [], hangDoi: { trang: "ok", ds: [] }, leadCuaToi: { trang: "ok", ds: [] }, tin: { trang: "ok", ds: [] } } as const;
    assert.equal(moTa(VAO(["telesales"], { ...RONG, leadCuaToi: { trang: "loi", ds: [] } })), undefined);
    assert.equal(moTa(VAO(["buyer_agent"], { ...RONG, tin: { trang: "loi", ds: [] } })), undefined);
    assert.equal(moTa(VAO(["telesales"], RONG)), "Không còn việc", "đối chứng: nguồn đọc được và rỗng");
    assert.equal(moTa(VAO(["team_lead"], { ...RONG, tin: { trang: "loi", ds: [] } })), "Không còn việc", "nguồn lỗi của vai khác không tính");
    assert.equal(moTa(VAO(["team_lead"])), "4 việc · 3 quá hạn");
    assert.equal(moTaSoViec(null), undefined);
  });

  const SO: SoViec = { so: 3, quaHan: 1, coLoi: true, muc: [{ ma: "lead_overdue", nhan: "Lead trễ", so: 2 }, { ma: "new_lead", nhan: "Lead mới", so: 1 }, { ma: "buyer_reaction", nhan: "Khách phản ứng", so: null }] };

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

  it("cột không có số khi chưa đọc được", () => {
    const so = (s: Partial<SoViec>) => mucCotHomNay([], { so: 0, quaHan: 0, coLoi: false, muc: [], ...s })[0]!.so;
    assert.equal(so({ coLoi: true, so: 0 }), null);
    assert.equal(so({ coLoi: true, so: 15 }), 15);
    assert.equal(so({ coLoi: false, so: 0 }), 0);
    const bo = [
      { code: "lead_tu_dat", label: "Lead riêng", enabled: true, subject: "lead" },
      { code: "can_tu_dat", label: "Căn riêng", enabled: true, subject: "listing" },
      { code: "lead_overdue", label: "Quá hạn", enabled: true, subject: "lead" },
    ];
    const moc = (loi: MaNguon[]) => mucSoTuGop(bo, { loi: loi.map((nguon) => ({ nguon, chu: "" })), nhom: [{ ma: "can_tu_dat", nhan: "", thuoc: "dau-chu", viec: ["a", "b"], soQua: 0 }] });
    assert.equal(moc(["lead-giao"])[0]!.so, null, "nhóm lead sàn tự đặt mã");
    assert.equal(moc(["lead-giao"])[1]!.so, 2, "nhóm căn giữ số thật");
    assert.equal(moc(["hang-doi"])[2]!.so, null, "nhóm của vai");
  });

  it("sổ điểm biến thiên có dòng điều khoá của nhóm và mốc 48 giờ", () => {
    const so = readFileSync(path.resolve(import.meta.dirname, "../../../../../../../docs/architecture/so-diem-bien-thien.md"), "utf8");
    assert.match(so, /\| K33 \|[^\n]*Hôm nay[^\n]*48 giờ/, "thiếu dòng K33 về nhóm việc và mốc 48 giờ");
  });
});
