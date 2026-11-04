// Hàng va-tieu-de-goi: tiêu đề thanh trên của vỏ điện thoại. Màn ghi cuộc gọi không phải một căn (AC-1); trang một căn và
// mọi đường khác giữ tiêu đề như trước (AC-2). Ma trận viết trước, mỗi phần tử một assert.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { type Home, HOME_LABEL } from "@quy-hang/core";

import { titleOf } from "./tieu-de";

const DUONG_CUOC_GOI = ["/units/call", "/units/call/", "/units/call/dial"];

describe("tiêu đề vỏ điện thoại", () => {
  it("tiêu đề: chế độ cuộc gọi là «Ghi cuộc gọi»", () => {
    for (const d of DUONG_CUOC_GOI) assert.equal(titleOf(d, "today"), "Ghi cuộc gọi", `đường ${d}`);
  });

  it("tiêu đề: không đường nào dưới /units/call cho «Căn call»", () => {
    for (const d of [...DUONG_CUOC_GOI, "/units/call/xyz"]) {
      const t = titleOf(d, "today");
      assert.ok(!t.startsWith("Căn "), `đường ${d} cho «${t}» — vẫn coi «call» là mã căn`);
    }
  });

  it("tiêu đề: trang một căn là «Căn <mã>»", () => {
    const MA: [string, string][] = [
      ["/units/A-04.06", "Căn A-04.06"],
      ["/units/B-15.05", "Căn B-15.05"],
      ["/units/A%2004", "Căn A 04"],
    ];
    for (const [d, t] of MA) assert.equal(titleOf(d, "inventory"), t, `đường ${d}`);
  });

  it("tiêu đề: mã phần trăm hỏng không ném lỗi", () => {
    assert.equal(titleOf("/units/%E0", "inventory"), "Căn %E0");
  });

  it("tiêu đề: đường khác giữ như trước", () => {
    const TRANG: [string, string][] = [
      ["/me", "Tôi"],
      ["/leads/new", "Lead"],
      ["/imports/new", "Nhập Excel"],
      ["/exports/new", "Xuất bảng hàng"],
      ["/viewings", "Lịch xem"],
    ];
    for (const [d, t] of TRANG) assert.equal(titleOf(d, "today"), t, `đường ${d}`);

    const NHA: [Home, string][] = [
      ["today", HOME_LABEL.today],
      ["inventory", HOME_LABEL.inventory],
      ["shares", "Gửi"],
      ["team", HOME_LABEL.team],
      ["settings", HOME_LABEL.settings],
    ];
    assert.equal(NHA.length, Object.keys(HOME_LABEL).length, "bảng nhà thiếu nhà của lõi");
    for (const [h, t] of NHA) assert.equal(titleOf("/x", h), t, `nhà ${h}`);

    assert.equal(titleOf("/x", null), "Quỹ hàng", "không nhà");
    assert.equal(titleOf("/units", null), "Quỹ hàng", "/units trần");
  });
});
