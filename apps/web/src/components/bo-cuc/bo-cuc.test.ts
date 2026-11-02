// AC-2 (hàng 91): bảy kiểu, ma trận vùng, bố cục không dựng Frame, số lấy từ token, bảng bóc tách mỗi ô một nhãn.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BoCuc } from "./bo-cuc";
import { BO_CUC, coVung, type KieuBoCuc, VUNG } from "./ma-tran";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..");

// Ma trận viết trước: vùng nào thuộc kiểu nào (ADR-0024 §3; Hồ sơ có Cột thuộc tính gập được — chủ kho 02/11).
const MA_TRAN: Record<KieuBoCuc, Record<(typeof VUNG)[number], boolean>> = {
  tran: { "dau-man": true, than: true, "cot-phu": false },
  "danh-sach-chi-tiet": { "dau-man": true, than: true, "cot-phu": true },
  doc: { "dau-man": true, than: true, "cot-phu": false },
  "ho-so": { "dau-man": true, than: true, "cot-phu": true },
  "bang-dieu-khien": { "dau-man": true, than: true, "cot-phu": false },
  "luong-nhieu-buoc": { "dau-man": true, than: true, "cot-phu": true },
  "dong-tin": { "dau-man": true, than: true, "cot-phu": false },
};

function dung(kieu: KieuBoCuc, thanLa = h("div", null, "thân")) {
  return renderToStaticMarkup(
    h(BoCuc, { kieu, dauMan: h("header", { "data-vung": "dau-man" }, "đầu"), cotPhu: h("i", null, "phụ") }, thanLa),
  );
}

/** Token bố cục mà globals.css phải khai. */
export const TOKEN_BO_CUC = ["--spacing-trang", "--spacing-khung", "--container-doc", "--breakpoint-vua", "--spacing-cot-thuoc-tinh"] as const;

export function tokenThieu(css: string, token: readonly string[] = TOKEN_BO_CUC): string[] {
  return token.filter((t) => !new RegExp(`${t}\\s*:`).test(css));
}

export const NHAN_HOP_LE = new Set(["khối", "c-*", "thành phần", "ghép", "ghép, chờ"]);

/** Nhãn của từng dòng bảng bóc tách (cột thứ ba), đã gỡ `**` và `\`. */
export function nhanBocTach(md: string): { o: string; nhan: string }[] {
  const bang = md.split("## Bảng bóc tách")[1]?.split("\n## ")[0] ?? "";
  return bang
    .split("\n")
    .filter((d) => d.startsWith("| ") && !d.startsWith("| Bố cục") && !d.startsWith("| ---"))
    .map((d) => d.split(" | "))
    .map((c) => ({ o: `${c[0]?.replace(/^\| /, "")} · ${c[1]}`, nhan: (c[2] ?? "").replace(/\*\*/g, "").replace(/\\/g, "").trim() }));
}

describe("bố cục", () => {
  it("bố cục: bảy kiểu", () => {
    assert.equal(BO_CUC.length, 7);
    assert.deepEqual([...BO_CUC], ["tran", "danh-sach-chi-tiet", "doc", "ho-so", "bang-dieu-khien", "luong-nhieu-buoc", "dong-tin"]);
  });

  it("bố cục: ma trận vùng", () => {
    let o = 0;
    for (const kieu of BO_CUC) {
      const html = dung(kieu);
      for (const vung of VUNG) {
        o++;
        assert.equal(coVung(kieu, vung), MA_TRAN[kieu][vung], `${kieu} · ${vung}: ma trận`);
        // Danh sách – chi tiết đặt cột phụ trong ngăn nổi (portal, chỉ dựng ở trình duyệt khi mở) — vùng đo ở E6.
        if (kieu === "danh-sach-chi-tiet" && vung === "cot-phu") continue;
        assert.equal(html.includes(`data-vung="${vung}"`), MA_TRAN[kieu][vung], `${kieu} · ${vung}: HTML`);
      }
    }
    assert.equal(o, 21);
    assert.deepEqual(BO_CUC.filter((k) => coVung(k, "cot-phu")), ["danh-sach-chi-tiet", "ho-so", "luong-nhieu-buoc"]);
  });

  it("bố cục: không dựng Frame", () => {
    for (const kieu of BO_CUC) assert.ok(!dung(kieu).includes('data-slot="frame"'), `${kieu}: bố cục dựng Frame`);
  });

  it("bố cục: số lấy từ token", () => {
    for (const kieu of BO_CUC) {
      const goc = /<div data-bo-cuc-goc="[^"]+"[^>]*class="([^"]*)"/.exec(dung(kieu))?.[1] ?? "";
      assert.match(goc, /\bp-trang\b/, kieu);
      assert.match(goc, /\bgap-khung\b/, kieu);
      assert.ok(!/(^|\s)px-/.test(goc), `${kieu}: px- ở gốc`);
      const maxW = goc.split(/\s+/).filter((c) => c.startsWith("max-w-"));
      // Hồ sơ có Cột thuộc tính thì dùng hết bề rộng; chỉ Dòng tin giữ bề rộng đọc.
      assert.deepEqual(maxW, kieu === "dong-tin" ? ["max-w-(--container-doc)"] : [], `${kieu}: max-w ở gốc`);
    }
    // Đối chứng: Hồ sơ không truyền cột phụ thì thân căn giữa ở bề rộng đọc như hồ sơ căn đang chạy.
    const motCot = renderToStaticMarkup(h(BoCuc, { kieu: "ho-so", dauMan: h("header", null, "đầu") }, h("div", null, "thân")));
    assert.match(/<div data-bo-cuc-goc="ho-so"[^>]*class="([^"]*)"/.exec(motCot)?.[1] ?? "", /max-w-\(--container-doc\)/);
    const css = readFileSync(join(ROOT, "apps/web/src/app/globals.css"), "utf8");
    assert.deepEqual(tokenThieu(css), []);
    assert.deepEqual(tokenThieu(css.replace("--container-doc:", "--container-khac:")), ["--container-doc"]);
  });

  it("bóc tách: mỗi ô một nhãn", () => {
    const dong = nhanBocTach(readFileSync(join(ROOT, "_acceptance/he-bo-cuc/discovery/boc-tach.md"), "utf8"));
    assert.ok(dong.length >= 15, `bảng bóc tách chỉ có ${dong.length} dòng`);
    for (const d of dong) assert.ok(NHAN_HOP_LE.has(d.nhan), `ô ${d.o}: nhãn «${d.nhan}» ngoài danh sách`);
    assert.ok(!dong.some((d) => d.nhan === "vẽ tay"));
    const pha = nhanBocTach("## Bảng bóc tách\n\n| Bố cục | Ô | Nhãn |\n| --- | --- | --- |\n| Tràn | lưới | vẽ tay | x | y |\n");
    assert.equal(pha[0]?.nhan, "vẽ tay");
    assert.ok(!NHAN_HOP_LE.has(pha[0]?.nhan ?? ""));
  });
});
