import assert from "node:assert/strict";
import { test } from "node:test";
import { COMPLETENESS_ITEMS } from "./completeness";
import { DANH_SACH_HOI, MA_DANH_SACH_HOI, type MucHoi } from "./danh-sach-hoi";

// Mã RESO của Hỏi-2: mục RESO có tập giá trị thì lựa chọn neo đúng tập ấy.
const RESO: Record<string, string[]> = {
  occupantType: ["Owner", "Tenant", "Vacant"],
  furnished: ["Furnished", "Partially", "Unfurnished"],
};

/** Chỗ danh sách hỏi lệch mức đủ: mục thừa, thiếu hay sai thứ tự gọi tên mục. */
function lechMucDu(ds: readonly MucHoi[]): string[] {
  const ma = ds.map((m) => m.ma);
  const sai: string[] = [...ma.filter((m) => !(COMPLETENESS_ITEMS as readonly string[]).includes(m)), ...COMPLETENESS_ITEMS.filter((m) => !ma.includes(m))];
  if (!sai.length && ma.join() !== COMPLETENESS_ITEMS.join()) sai.push("thứ tự");
  return sai;
}

test("danh sách hỏi: khớp mức đủ", () => {
  assert.deepEqual(MA_DANH_SACH_HOI, [...COMPLETENESS_ITEMS]);
  assert.deepEqual(lechMucDu(DANH_SACH_HOI), []);
  for (const m of DANH_SACH_HOI) {
    if (!("luaChon" in m)) continue;
    assert.ok(m.luaChon.length >= 2, `${m.ma}: cần ít nhất hai lựa chọn`);
    assert.equal(new Set(m.luaChon.map((l) => l.nhan)).size, m.luaChon.length, `${m.ma}: nhãn trùng`);
    const reso = m.luaChon.flatMap((l) => ("reso" in l ? [l.reso] : []));
    if (RESO[m.ma]) assert.deepEqual(reso.sort(), RESO[m.ma], `${m.ma}: mã RESO`);
    else assert.deepEqual(reso, [], `${m.ma}: RESO không có tập giá trị — không neo`);
  }
});

test("danh sách hỏi: đối chứng đỏ — mục thừa bị gọi tên", () => {
  const banSao: MucHoi[] = [...DANH_SACH_HOI, { ma: "parking" as "furnished", nhan: "Chỗ đỗ xe", luaChon: [{ nhan: "Có" }, { nhan: "Không" }] }];
  assert.deepEqual(lechMucDu(banSao), ["parking"]);
});
