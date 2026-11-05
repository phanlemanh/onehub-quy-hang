// Luật 55 (dang-nhap-mat-khau, E13): đăng xuất bốn kết cục viết trước; kho luôn xoá trước lời gọi máy chủ.
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { dangXuatTrenMay, type KetCucDangXuat } from "./dang-xuat-tren-may";

type Tra = "o-lai" | 200 | 500 | "mang";
function boGia(tra: Tra) {
  const thuTu: string[] = [];
  const deps = {
    dangXuat: async () => (thuTu.push("xoa-kho"), tra !== "o-lai"),
    than: async () => "{}",
    goi: (async () => {
      thuTu.push("may-chu");
      if (tra === "mang") throw new TypeError("Failed to fetch");
      return new Response(null, { status: tra as number });
    }) as typeof fetch,
    ve: () => void thuTu.push("ve"),
  };
  return { deps, thuTu };
}

const BANG: [ten: string, tra: Tra, ket: KetCucDangXuat, thuTu: string[]][] = [
  ["người ở lại", "o-lai", "o-lai", ["xoa-kho"]],
  ["máy chủ 200", 200, "xong", ["xoa-kho", "may-chu", "ve"]],
  ["máy chủ 500", 500, "loi", ["xoa-kho", "may-chu"]],
  ["lỗi mạng", "mang", "loi", ["xoa-kho", "may-chu"]],
];

describe("đăng xuất trên máy", () => {
  it("bốn kết cục viết trước", async () => {
    assert.equal(BANG.length, 4);
    for (const [ten, tra, ket, thuTu] of BANG) {
      const g = boGia(tra);
      assert.equal(await dangXuatTrenMay(g.deps), ket, ten);
      assert.deepEqual(g.thuTu, thuTu, `${ten}: thứ tự lời gọi`);
    }
  });

  it("thử lại sau lỗi thì xong, không hỏi xoá kho lần hai", async () => {
    const g = boGia(500);
    assert.equal(await dangXuatTrenMay(g.deps), "loi");
    g.deps.goi = (async () => (g.thuTu.push("may-chu"), new Response(null, { status: 200 }))) as typeof fetch;
    assert.equal(await dangXuatTrenMay({ ...g.deps, daXoa: true }), "xong");
    assert.deepEqual(g.thuTu, ["xoa-kho", "may-chu", "may-chu", "ve"]);
  });

  it("gọi máy chủ không gắn this vào deps (fetch thật ném «Illegal invocation»)", async () => {
    const g = boGia(200);
    const goc = g.deps.goi;
    g.deps.goi = function (this: unknown, ...a: Parameters<typeof fetch>) {
      if (this === g.deps) throw new TypeError("Illegal invocation");
      return goc(...a);
    } as typeof fetch;
    assert.equal(await dangXuatTrenMay(g.deps), "xong");
    assert.deepEqual(g.thuTu, ["xoa-kho", "may-chu", "ve"]);
  });
});
