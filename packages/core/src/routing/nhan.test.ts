// Nhãn mặc định của thực đơn chia lead (hàng 48, E8): hai bảng viết trước theo CONTEXT.md, khoá của bảng nhãn bằng đúng
// thực đơn của lõi. Chiều đỏ cùng ca: bảng thiếu một khoá thì hàm so nêu đúng khoá thiếu.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ALERT_AUDIENCES, ROUTING_STRATEGIES } from "./index";
import { ALERT_AUDIENCE_NHAN, ROUTING_STRATEGY_NHAN } from "./nhan";

/** Khoá thực đơn không có nhãn, và khoá nhãn không thuộc thực đơn. */
function lechKhoa(thucDon: readonly string[], bang: Readonly<Record<string, unknown>>): string[] {
  const thieu = thucDon.filter((k) => !(k in bang)).map((k) => `thiếu nhãn: ${k}`);
  const la = Object.keys(bang).filter((k) => !thucDon.includes(k)).map((k) => `nhãn lạ: ${k}`);
  return [...thieu, ...la];
}

test("nhãn cách chia và người đọc lời báo", () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(ROUTING_STRATEGY_NHAN).map(([k, v]) => [k, v.nhan])),
    {
      zone_round_robin: "Theo vùng, lần lượt",
      company_round_robin: "Lần lượt toàn sàn",
      zone_least_open: "Theo vùng, ít lead đang mở",
      open_pool: "Kho chung",
      manual: "Trưởng nhóm chia tay",
    },
  );
  assert.deepEqual({ ...ALERT_AUDIENCE_NHAN }, { team_lead: "Trưởng nhóm", team_lead_and_admin: "Trưởng nhóm và quản trị sàn" });
  assert.deepEqual(lechKhoa(ROUTING_STRATEGIES, ROUTING_STRATEGY_NHAN), []);
  assert.deepEqual(lechKhoa(ALERT_AUDIENCES, ALERT_AUDIENCE_NHAN), []);
  for (const [k, v] of Object.entries(ROUTING_STRATEGY_NHAN)) assert.ok(v.giaiThich.trim().length > 0, `${k}: thiếu câu giải thích`);

  // Chiều đỏ: bỏ một khoá khỏi bản sao thì phép so gọi tên khoá ấy.
  const thieu = Object.fromEntries(Object.entries(ROUTING_STRATEGY_NHAN).filter(([k]) => k !== "open_pool"));
  assert.deepEqual(lechKhoa(ROUTING_STRATEGIES, thieu), ["thiếu nhãn: open_pool"]);
  assert.deepEqual(lechKhoa(ALERT_AUDIENCES, { ...ALERT_AUDIENCE_NHAN, all: "Mọi người" }), ["nhãn lạ: all"]);
});
