// AC-3 (hàng 91): đầu màn chia nút một chính · tối đa hai phụ · còn lại vào «…», và đường dẫn luôn có.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DauMan, type DuongDan } from "./dau-man";
import { chiaNut, NUT_PHU_TOI_DA } from "./ma-tran";

// Ma trận viết trước: số nút → [có chính, số phụ, số trong «…»].
const CHIA: [number, boolean, number, number][] = [
  [0, false, 0, 0],
  [1, true, 0, 0],
  [2, true, 1, 0],
  [3, true, 2, 0],
  [4, true, 2, 1],
  [5, true, 2, 2],
];

describe("đầu màn", () => {
  it("đầu màn: chia nút", () => {
    assert.equal(NUT_PHU_TOI_DA, 2, `trần nút phụ là ${NUT_PHU_TOI_DA}, phải là 2`);
    assert.equal(CHIA.length, 6);
    for (const [n, coChinh, phu, them] of CHIA) {
      const nut = Array.from({ length: n }, (_, i) => `n${i}`);
      const c = chiaNut(nut);
      assert.equal(c.chinh, coChinh ? "n0" : null, `${n} nút: nút chính`);
      assert.equal(c.phu.length, phu, `${n} nút: ${c.phu.length} nút phụ, phải ${phu}`);
      assert.equal(c.them.length, them, `${n} nút: ${c.them.length} trong «…», phải ${them}`);
    }
  });

  it("đầu màn: luôn có đường dẫn", () => {
    const tang: DuongDan[] = [{ nhan: "Nhà", href: "/" }, { nhan: "Mục", href: "/muc" }, { nhan: "Con", href: "/muc/con" }, { nhan: "Lá" }];
    for (const so of [2, 3, 4]) {
      const duong = tang.slice(tang.length - so) as [DuongDan, DuongDan, ...DuongDan[]];
      const html = renderToStaticMarkup(h(DauMan, { duongDan: duong, tieuDe: "Lá" }));
      assert.match(html, /<nav aria-label="breadcrumb"/, `${so} tầng: thiếu nav breadcrumb`);
      const muc = html.match(/data-slot="breadcrumb-item"[^>]*/g) ?? [];
      assert.equal(muc.length, so, `${so} tầng: ${muc.length} mục`);
      const cha = muc.filter((m) => m.includes('data-tang="cha"'));
      assert.equal(cha.length, 1);
      assert.ok(!cha[0]?.includes("max-md:hidden"), "mục cha phải hiện ở điện thoại");
      assert.equal(muc.filter((m) => !m.includes("max-md:hidden")).length, 1, `${so} tầng: chỉ mục cha hiện ở điện thoại`);
      const lienKetCha = /data-tang="cha"><a [^>]*href="([^"]+)"/.exec(html)?.[1];
      assert.equal(lienKetCha, duong[duong.length - 2]?.href, `${so} tầng: mục cha không phải lối về`);
    }
    // @ts-expect-error đường dẫn ít nhất hai tầng (nhà › màn)
    h(DauMan, { duongDan: [{ nhan: "Nhà" }] });
    // @ts-expect-error đường dẫn không được rỗng
    h(DauMan, { duongDan: [] });
  });
});
