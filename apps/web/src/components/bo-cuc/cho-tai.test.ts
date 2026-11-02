// AC-5 (hàng 91): chờ tải theo hình của bố cục — mỗi kiểu một hình, không một spinner chung.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ChoTai } from "./cho-tai";
import { BO_CUC, type KieuBoCuc } from "./ma-tran";

// Hình viết trước của từng kiểu (data-cho-tai).
const HINH: Record<KieuBoCuc, string> = {
  tran: "luoi",
  "danh-sach-chi-tiet": "luoi-chi-tiet",
  doc: "nhan-o",
  "ho-so": "ho-so",
  "bang-dieu-khien": "bang",
  "luong-nhieu-buoc": "luong",
  "dong-tin": "dong-tin",
};

describe("chờ tải", () => {
  it("chờ tải theo bố cục", () => {
    let dem = 0;
    for (const kieu of BO_CUC) {
      const html = renderToStaticMarkup(h(ChoTai, { kieu }));
      assert.match(html, /role="status" aria-busy="true"/, kieu);
      assert.match(html, new RegExp(`data-cho-tai="${HINH[kieu]}"`), `${kieu}: thiếu hình ${HINH[kieu]}`);
      dem++;
    }
    assert.equal(dem, 7);
    assert.equal(new Set(Object.values(HINH)).size, 7, "hai kiểu chung một hình");
    const tran = renderToStaticMarkup(h(ChoTai, { kieu: "tran" }));
    assert.ok((tran.match(/data-slot="skeleton"/g) ?? []).length >= 20, "lưới Tràn quá ít dòng");
  });
});
