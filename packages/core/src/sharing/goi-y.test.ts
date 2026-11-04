// Luật «Gợi ý căn thay» và «vừa đổi» (hàng 36: AC-3, AC-4). Bảng viết trước.
import assert from "node:assert/strict";
import { test } from "node:test";
import { giaLucGui, goiYCanThay, vuaDoi, type CanSoSanh } from "./goi-y";

const goc: CanSoSanh = { id: "goc", buildingName: "Toà A", bedroomsTotal: 2, listPrice: 3_000_000_000, standardStatus: "Pending" };
const c = (id: string, buildingName: string, bedroomsTotal: number, listPrice: number, standardStatus: CanSoSanh["standardStatus"] = "Active"): CanSoSanh => ({ id, buildingName, bedroomsTotal, listPrice, standardStatus });

test("gợi ý căn thay: luật dựng sẵn", () => {
  const UNG_VIEN = [
    c("a-31", "Toà A", 2, 3_100_000_000),
    c("b-29", "Toà B", 2, 2_900_000_000),
    c("a-25", "Toà A", 2, 2_500_000_000), // ngoài ±15% (−16,7%)
    c("a-3pn", "Toà A", 3, 3_000_000_000),
    c("a-coc", "Toà A", 2, 3_000_000_000, "Pending"),
    c("a-trong", "Toà A", 2, 3_000_000_000),
    c("b-34", "Toà B", 2, 3_400_000_000),
    c("a-295", "Toà A", 2, 2_950_000_000),
  ];
  assert.equal(UNG_VIEN.length, 8, "số ứng viên viết trước");
  assert.deepEqual(goiYCanThay(goc, UNG_VIEN, new Set(["a-trong"])), ["a-295", "a-31", "b-29"]);
  assert.deepEqual(goiYCanThay(goc, [], new Set()), []);
  assert.deepEqual(goiYCanThay({ ...goc, listPrice: null }, UNG_VIEN, new Set()), [], "căn gốc thiếu giá");
});

test("vừa đổi: chỉ giá rao và trạng thái sau lúc gửi", () => {
  const BANG: [string, Parameters<typeof vuaDoi>[1], ReturnType<typeof vuaDoi>][] = [
    ["không sự kiện", [], null],
    ["đổi giá", [{ type: "price_changed", payload: { listPrice: 2_900_000_000 } }], { price: { from: 3_200_000_000, to: 2_900_000_000 } }],
    ["đổi trạng thái", [{ type: "status_changed", payload: { to: "Pending" } }], { status: { to: "Pending" } }],
    ["trạng thái thắng giá", [{ type: "price_changed", payload: { listPrice: 1 } }, { type: "status_changed", payload: { to: "Closed" } }], { status: { to: "Closed" } }],
    ["chi tiết đổi", [{ type: "details_changed", payload: { legalStatus: "pink_book" } }], null],
    ["giá về đúng giá gửi", [{ type: "price_changed", payload: { listPrice: 3_200_000_000 } }], null],
  ];
  assert.equal(BANG.length, 6, "số dòng bảng viết trước");
  for (const [ten, su, mong] of BANG) assert.deepEqual(vuaDoi(3_200_000_000, su), mong, ten);
});

test("giá lúc gửi: chỉ từ đổi giá trước lúc gửi — căn chưa có giá lúc gửi rồi được đặt giá thì «vừa đổi» trống → mới", () => {
  const dat = (listPrice: number) => ({ type: "price_changed", payload: { listPrice, feeInclusion: "included" } });
  assert.equal(giaLucGui([]), null, "chưa có đổi giá nào trước lúc gửi");
  assert.equal(giaLucGui([dat(3_000_000_000), { type: "details_changed", payload: {} }, dat(3_200_000_000)]), 3_200_000_000, "lần đổi giá cuối trước lúc gửi");
  assert.deepEqual(vuaDoi(giaLucGui([]), [dat(3_200_000_000)]), { price: { from: null, to: 3_200_000_000 } });
});
