// Cột sửa được trên ô (hàng 15) — E15. Ma trận viết tay: đúng ba cột mở, mười sáu cột khoá.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { COT, type CotId } from "../cot";
import { COT_SUA } from "./cot-sua";

const MO: CotId[] = ["listPrice", "feeInclusion", "standardStatus"];
const KHOA: CotId[] = ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "completeness", "visibility", "closePrice", "closeDate", "withdrawnReason"];

const lech = (tap: ReadonlySet<CotId>) => [...MO.filter((c) => !tap.has(c)), ...KHOA.filter((c) => tap.has(c))];

test("đúng ba cột mở, mười sáu cột khoá", () => {
  assert.deepEqual([...COT_SUA].sort(), [...MO].sort());
  assert.equal(MO.length + KHOA.length, COT.length, "ma trận phủ mọi cột của bảng");
  assert.deepEqual(lech(COT_SUA), []);
});

test("đối chứng đỏ: tập có thêm Diện tích bị gọi tên", () => {
  assert.deepEqual(lech(new Set<CotId>([...MO, "livingArea"])), ["livingArea"]);
});

test("Bảng hàng bật sửa ô qua COT_SUA", () => {
  const bang = readFileSync(fileURLToPath(new URL("../bang-hang.tsx", import.meta.url)), "utf8");
  assert.match(bang, /editable: COT_SUA\.has\(cot\.id\)/);
});
