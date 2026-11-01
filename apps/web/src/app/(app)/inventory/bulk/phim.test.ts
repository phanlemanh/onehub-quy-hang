// Ô gõ nhường Ctrl/Cmd+Z (hàng 16) — E5. Phần tử giả lập, không cần DOM.
import assert from "node:assert/strict";
import { test } from "node:test";
import { laOGo } from "./phim";

const O: [string, unknown, boolean][] = [
  ["input text", { tagName: "INPUT", type: "text" }, true],
  ["input search", { tagName: "INPUT", type: "search" }, true],
  ["input không khai type", { tagName: "INPUT" }, true],
  ["input checkbox", { tagName: "INPUT", type: "checkbox" }, false],
  ["textarea", { tagName: "TEXTAREA" }, true],
  ["contenteditable", { tagName: "DIV", isContentEditable: true }, true],
  ["td của lưới", { tagName: "TD", isContentEditable: false }, false],
  ["div", { tagName: "DIV" }, false],
  ["null", null, false],
];

for (const [ten, t, mong] of O) test(`E5 ${ten} → ${mong}`, () => assert.equal(laOGo(t), mong, `ô ${ten}`));

test("E5 đối chứng đỏ: hàm chỉ nhận INPUT thì ô textarea và contenteditable bị gọi tên", () => {
  const sai = (t: unknown) => !!t && (t as { tagName?: string }).tagName === "INPUT";
  const lech = O.filter(([, t, m]) => sai(t) !== m).map(([ten]) => ten);
  assert.ok(lech.includes("textarea") && lech.includes("contenteditable"), `ô lệch: ${lech.join(", ")}`);
});
