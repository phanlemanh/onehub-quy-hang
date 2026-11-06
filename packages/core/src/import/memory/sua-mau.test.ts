// Sổ sửa mẫu (hàng 50 mau-nhap-va-bai, E1b, E5): bảng ca viết trước phủ trục «nguồn của một khoá», mốc của lần nhập là
// lúc mở; luật kiểm bản sửa theo bảng — mỗi dòng một assert, đếm bằng số dòng bảng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { gopMau, type CotMau } from "./mau";
import { apSuaMau, kiemSuaMau, type DongSuaMau } from "./sua-mau";

const nhap = (k: string, target: string, at: string, importId = `i-${at}`): CotMau => ({ headerKey: k, target: target as CotMau["target"], importId, at });
const sua = (k: string, target: string, at: string, id = `s-${at}`): DongSuaMau => ({ id, headerKey: k, action: "set", target: target as CotMau["target"], editedBy: "u-qt", at });
const xoa = (k: string, at: string, id = `x-${at}`): DongSuaMau => ({ id, headerKey: k, action: "delete", editedBy: "u-qt", at });
const T = (n: number) => `2026-11-05T0${n}:00:00.000Z`;

test("sửa mẫu: không dòng sổ nào thì bằng gopMau", () => {
  const dx = [nhap("gia", "listPrice", T(1)), nhap("gia", "floorPrice", T(2)), nhap("toa", "buildingName", T(1))];
  assert.deepEqual(apSuaMau(dx, []), [...gopMau(dx).values()].sort((a, b) => a.headerKey.localeCompare(b.headerKey)));
});

test("sửa mẫu: bảng nguồn của một khoá", () => {
  // [ca, cột dẫn xuất, dòng sổ, đích mong đợi của khoá «gia» (null = vắng), thông điệp]
  const BANG: [string, CotMau[], DongSuaMau[], string | null, string][] = [
    ["chỉ lần nhập", [nhap("gia", "listPrice", T(1))], [], "listPrice", "chỉ lần nhập phải giữ đích của lần nhập"],
    ["sửa mới hơn", [nhap("gia", "listPrice", T(1))], [sua("gia", "floorPrice", T(2))], "floorPrice", "bản sửa mới hơn phải thắng"],
    ["xoá mới hơn", [nhap("gia", "listPrice", T(1))], [xoa("gia", T(2))], null, "khoá đã xoá còn trong mẫu"],
    ["lần nhập mở sau lần sửa", [nhap("gia", "unitNumber", T(3))], [sua("gia", "floorPrice", T(2))], "unitNumber", "lần nhập mở sau lần sửa phải thắng"],
    ["lần nhập mở sau lần xoá", [nhap("gia", "unitNumber", T(3))], [xoa("gia", T(2))], "unitNumber", "lần nhập mới hơn lần xoá phải dạy lại khoá"],
    ["lần nhập mở TRƯỚC lần sửa, ghi sau", [nhap("gia", "listPrice", T(1))], [sua("gia", "floorPrice", T(2))], "floorPrice", "lần nhập dở từ trước đè bản sửa"],
    ["lần nhập mở TRƯỚC lần xoá, ghi sau", [nhap("gia", "listPrice", T(1))], [xoa("gia", T(2))], null, "lần nhập dở từ trước dạy lại khoá đã xoá"],
    ["hai lần sửa", [], [sua("gia", "floorPrice", T(2)), sua("gia", "listPrice", T(3))], "listPrice", "lần sửa sau phải thắng"],
    ["cùng mốc", [nhap("gia", "listPrice", T(2))], [sua("gia", "floorPrice", T(2))], "floorPrice", "cùng mốc thì bản sửa phải thắng"],
  ];
  let dem = 0;
  for (const [, dx, sx, mong, thongDiep] of BANG) {
    const kq = apSuaMau(dx, sx).find((c) => c.headerKey === "gia");
    assert.equal(kq?.target ?? null, mong, thongDiep);
    dem++;
  }
  assert.equal(dem, BANG.length);
});

test("sửa mẫu: bản sửa mang nguồn sửa, khoá khác không đổi", () => {
  const kq = apSuaMau([nhap("gia", "listPrice", T(1)), nhap("toa", "buildingName", T(1), "i-a")], [sua("gia", "floorPrice", T(2), "s-1")]);
  assert.deepEqual(kq.find((c) => c.headerKey === "gia")?.sua, { id: "s-1", editedBy: "u-qt" });
  assert.deepEqual(kq.find((c) => c.headerKey === "toa"), nhap("toa", "buildingName", T(1), "i-a"));
});

test("sửa mẫu: luật kiểm bản sửa", () => {
  // [ca, bản sửa, hợp lệ, thông điệp ghim]
  const BANG: [string, Parameters<typeof kiemSuaMau>[0], boolean, string][] = [
    ["đích lạ", { target: "khong-co" }, false, "đích lạ phải bị từ chối"],
    ["quy đổi ở trường thường", { target: "listPrice", valueMap: { a: "b" } }, false, "quy đổi ở trường không đóng phải 400"],
    ["quy đổi ở trường lớp nguồn", { target: "ownerPhone", valueMap: { a: "b" } }, false, "quy đổi ở trường lớp nguồn phải 400"],
    ["phép không hợp với đích", { target: "listPrice", transform: { name: "date", params: { order: "dmy" } } }, false, "phép không hợp với đích phải 400"],
    ["quy đổi mang số điện thoại", { target: "standardStatus", valueMap: { "0900 000 011": "Active" } }, false, "quy đổi mang số điện thoại phải 400"],
    ["quy đổi ở Trạng thái", { target: "standardStatus", valueMap: { "con hang": "Active" } }, true, "đối chứng: quy đổi ở Trạng thái phải hợp lệ"],
    ["đổi đích kèm phép đúng", { target: "listPrice", transform: { name: "price", params: { unit: "ty" } } }, true, "đối chứng: phép đúng phải hợp lệ"],
    ["ghi chú", { target: "keep_as_note" }, true, "đối chứng: giữ làm ghi chú phải hợp lệ"],
  ];
  let dem = 0;
  for (const [, b, hopLe, thongDiep] of BANG) {
    const loi = kiemSuaMau(b);
    assert.equal(loi.length === 0, hopLe, `${thongDiep} — ${loi.join("; ")}`);
    if (!hopLe) assert.ok(loi[0]!.length > 0);
    dem++;
  }
  assert.equal(dem, BANG.length);
});
