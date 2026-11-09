import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { MyLeadView } from "@quy-hang/core/dedupe";
import type { TinDauKhach } from "@quy-hang/core/today";

import type { DongLeadTruongNhom } from "../nguon";
import { gopViec, tinConViec, type Nguon, type VaoGop } from "./gop-viec";

const BAY_GIO = "2026-11-09T10:00:00.000Z";
const gioTruoc = (phut: number) => new Date(Date.parse(BAY_GIO) - phut * 60_000).toISOString();
const ok = <T>(ds: T[] = []): Nguon<T> => ({ trang: "ok", ds });
const loi = <T>(): Nguon<T> => ({ trang: "loi", ds: [] });
const doi = (leadId: string, kind: DongLeadTruongNhom["kind"]): DongLeadTruongNhom => ({ leadId, kind, buildingName: "Toà A", unitNumber: null, agentUserId: null, dueAt: gioTruoc(30) });
const lead = (id: string, stage: MyLeadView["stage"]) => ({ id, stage, buildingName: "Toà B", unitNumber: "B-1" }) as MyLeadView;
const tin = (kind: TinDauKhach["kind"], at: string) =>
  (kind === "new_match"
    ? { kind, at, day: "2026-11-09", shares: [], listing: { id: "c1", name: "A-1" } }
    : { kind, at, day: "2026-11-09", share: { id: "s1", recipient: "[Tên]" }, listing: { id: "c1", name: "A-1" }, opens: 1, interested: [] }) as unknown as TinDauKhach;

const VAO = (b: Partial<VaoGop<string>>): VaoGop<string> => ({
  vai: [],
  bayGio: BAY_GIO,
  tv: null,
  dauChu: [],
  leadGiao: { trang: "ok" },
  hangDoi: ok(),
  leadCuaToi: ok(),
  tin: ok(),
  ...b,
});
const DU = ["team_lead", "listing_agent", "telesales", "buyer_agent"];

describe("gopViec", () => {
  it("gộp việc: năm nguồn, nhóm quá hạn trước", () => {
    const ra = gopViec(
      VAO({
        vai: DU,
        dauChu: [{ code: "new_lead", label: "Lead mới", viec: ["l1"], soQua: 1 }],
        hangDoi: ok([doi("a", "accept_overdue"), doi("b", "unrouted")]),
        leadCuaToi: ok([lead("t", "returned")]),
        tin: ok([tin("reaction", gioTruoc(60))]),
      }),
    );
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["lead_overdue", "lead_unrouted", "new_lead", "lead_returned", "buyer_reaction"]);
  });

  it("gộp việc: số đầu màn bằng số dòng", () => {
    const ra = gopViec(VAO({ vai: DU, dauChu: [{ code: "x", label: "X", viec: ["a", "b"], soQua: 1 }], hangDoi: ok([doi("a", "first_call_overdue")]) }));
    assert.equal(ra.so, 3);
    assert.equal(ra.so, ra.nhom.flatMap((g) => g.viec).length);
    assert.equal(ra.quaHan, 2);
  });

  it("gộp việc: bộ nhóm sàn có nhóm không hạn đứng trước giữ thứ tự", () => {
    const ra = gopViec(VAO({ vai: ["listing_agent"], dauChu: [{ code: "khong_han", label: "A", viec: ["1"], soQua: 0 }, { code: "new_lead", label: "B", viec: ["2"], soQua: 1 }] }));
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["khong_han", "new_lead"]);
  });

  it("gộp việc: chỉ lead bị trả lại thành việc của telesales", () => {
    const NAC = ["sent", "accepted", "called", "on_board", "returned", "resubmitted", "supplement", "discarded"] as const;
    for (const stage of NAC) {
      const ra = gopViec(VAO({ vai: ["telesales"], leadCuaToi: ok([lead("t", stage)]) }));
      assert.equal(ra.so, stage === "returned" ? 1 : 0, `nấc ${stage}`);
      assert.equal(ra.soLeadDaNhap, 1, "dòng Lead đã nhập vẫn đếm mọi lead");
    }
  });

  it("gộp việc: tin đầu khách tự hết sau 48 giờ", () => {
    assert.equal(tinConViec(gioTruoc(48 * 60 - 1), BAY_GIO), true, "47:59 còn là việc");
    assert.equal(tinConViec(gioTruoc(48 * 60 + 1), BAY_GIO), false, "48:01 thôi là việc");
    const ra = gopViec(VAO({ vai: ["buyer_agent"], tin: ok([tin("new_match", gioTruoc(47 * 60)), tin("changed", gioTruoc(49 * 60))]) }));
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["buyer_new_match"]);
  });

  it("gộp việc: nguồn lỗi không thành rỗng", () => {
    const ra = gopViec(VAO({ vai: ["team_lead", "listing_agent"], hangDoi: loi(), dauChu: [{ code: "x", label: "X", viec: ["a"], soQua: 0 }] }));
    assert.deepEqual(ra.loi, [{ nguon: "hang-doi", chu: "Chưa tải được lead quá hạn" }]);
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["x"], "nhóm khác giữ nguyên");
    assert.equal(ra.so, 1, "chỉ đếm phần đọc được");
  });

  it("gộp việc: nguồn ok và rỗng thì không báo lỗi", () => {
    const ra = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok() }));
    assert.deepEqual(ra.loi, []);
    assert.equal(ra.so, 0);
  });

  it("hai nguồn lỗi ra hai dòng báo", () => {
    const ra = gopViec(VAO({ vai: DU, hangDoi: loi(), tin: loi() }));
    assert.deepEqual(ra.loi.map((l) => l.nguon), ["hang-doi", "tin"]);
  });

  it("trưởng nhóm thuần không cần nguồn của vai khác", () => {
    const ra = gopViec(VAO({ vai: ["team_lead"], hangDoi: ok([doi("a", "unrouted")]), leadGiao: { trang: "loi" }, tin: loi(), leadCuaToi: loi() }));
    assert.deepEqual(ra.loi, []);
    assert.deepEqual(ra.nhom.map((g) => g.ma), ["lead_unrouted"]);
  });

  it("nhãn theo sổ từ vựng của sàn", () => {
    const tv = { truong: {}, giaTri: { nhomViec: { lead_overdue: "Lead trễ" } } } as never;
    const ra = gopViec(VAO({ vai: ["team_lead"], tv, hangDoi: ok([doi("a", "accept_overdue")]) }));
    assert.equal(ra.nhom[0]!.nhan, "Lead trễ");
  });

  it("đang tải khi nguồn của vai chưa về", () => {
    assert.equal(gopViec(VAO({ vai: ["buyer_agent"], tin: { trang: "dang", ds: [] } })).dangTai, true);
    assert.equal(gopViec(VAO({ vai: ["team_lead"], tin: { trang: "dang", ds: [] } })).dangTai, false);
  });
});
