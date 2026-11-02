// Cột thuộc tính của bố cục Hồ sơ (hàng 91, chủ kho 02/11): mặc định mở; gập còn nút mở lại; vỏ cấp trạng thái nhớ.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CotThuocTinh, NhoCotThuocTinhProvider } from "./cot-thuoc-tinh";

const NOI_DUNG = h("p", null, "thuộc tính căn");
const dungTrong = (mo: boolean) =>
  renderToStaticMarkup(h(NhoCotThuocTinhProvider, { mo, onDoi: () => {} }, h(CotThuocTinh, null, NOI_DUNG)));

describe("cột thuộc tính", () => {
  it("cột thuộc tính: mặc định mở, gập được", () => {
    // Ngoài vỏ (trang mẫu): cột tự giữ trạng thái, mặc định mở.
    const tuDo = renderToStaticMarkup(h(CotThuocTinh, null, NOI_DUNG));
    assert.match(tuDo, /data-cot-thuoc-tinh="mo"/);
    assert.match(tuDo, /thuộc tính căn/);
    assert.match(tuDo, /aria-label="Gập cột thuộc tính"/);
    assert.match(tuDo, /md:w-cot-thuoc-tinh/);
    // Vỏ nhớ «mở».
    const mo = dungTrong(true);
    assert.match(mo, /data-cot-thuoc-tinh="mo"/);
    assert.match(mo, /aria-expanded="true"/);
    assert.match(mo, /thuộc tính căn/);
    // Đối chứng: vỏ nhớ «gập» → không dựng nội dung, còn nút mở lại.
    const gap = dungTrong(false);
    assert.match(gap, /data-cot-thuoc-tinh="gap"/);
    assert.match(gap, /aria-expanded="false"/);
    assert.match(gap, /aria-label="Mở cột thuộc tính"/);
    assert.doesNotMatch(gap, /thuộc tính căn/);
  });
});
