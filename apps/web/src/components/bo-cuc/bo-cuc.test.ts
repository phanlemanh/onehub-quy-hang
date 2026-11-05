// AC-2 (hàng 91): bảy kiểu, ma trận vùng, bố cục không dựng Frame, số lấy từ token, bảng bóc tách mỗi ô một nhãn.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BoCuc } from "./bo-cuc";
import { KEO_CHIA } from "./cot-keo-chia";
import { BO_CUC, coVung, type KieuBoCuc, VUNG } from "./ma-tran";
import { NganNoi } from "./ngan-noi";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..");

// Ma trận viết trước: vùng nào thuộc kiểu nào (ADR-0024 §3; Hồ sơ một cột — chủ kho 02/11).
const MA_TRAN: Record<KieuBoCuc, Record<(typeof VUNG)[number], boolean>> = {
  tran: { "dau-man": true, than: true, "cot-phu": false },
  "danh-sach-chi-tiet": { "dau-man": true, than: true, "cot-phu": true },
  doc: { "dau-man": true, than: true, "cot-phu": false },
  "ho-so": { "dau-man": true, than: true, "cot-phu": false },
  "bang-dieu-khien": { "dau-man": true, than: true, "cot-phu": false },
  "luong-nhieu-buoc": { "dau-man": true, than: true, "cot-phu": true },
  "dong-tin": { "dau-man": true, than: true, "cot-phu": false },
};

function dung(kieu: KieuBoCuc, thanLa = h("div", null, "thân")) {
  // Danh sách – chi tiết khai chi tiết đang mở: cột phụ là cột kéo chia dựng ngay ở máy chủ, đo được (hàng 105).
  const chiTiet = kieu === "danh-sach-chi-tiet" ? { mo: true } : undefined;
  return renderToStaticMarkup(
    h(BoCuc, { kieu, dauMan: h("header", { "data-vung": "dau-man" }, "đầu"), cotPhu: h("i", null, "phụ"), chiTiet }, thanLa),
  );
}

/** Thẻ mở của phần tử đầu tiên mang `data-vung="<vung>"`. */
const theMo = (html: string, vung: string) => new RegExp(`<div[^>]*data-vung="${vung}"[^>]*>`).exec(html)?.[0] ?? "";

/**
 * Cột phụ của Danh sách – chi tiết là cột kéo chia (ADR-0024 sửa đổi 05/11): nhóm panel, panel `cot-phu` 38 / 28–50, thân
 * nhỏ nhất 35, không ngăn nổi. Trả lỗi theo tên — rỗng là đạt.
 */
export function kiemCotKeoChia(html: string): string[] {
  if (!html.includes('data-slot="resizable-panel-group"')) return ["cột phụ là ngăn nổi — không có nhóm panel kéo chia"];
  const loi: string[] = [];
  const cot = theMo(html, "cot-phu");
  if (!cot) loi.push("không có panel cot-phu");
  else {
    if (!cot.includes('data-slot="resizable-panel"')) loi.push("cot-phu không phải panel kéo chia");
    if (!/flex-basis:38%/.test(cot)) loi.push("cot-phu không mặc định 38%");
    if (!cot.includes('data-nho-nhat="28"') || !cot.includes('data-lon-nhat="50"')) loi.push("cot-phu không kéo 28–50%");
  }
  if (!/data-slot="resizable-panel"[^>]*data-nho-nhat="35"/.test(html)) loi.push("thân không giữ tối thiểu 35%");
  if (!html.includes('data-slot="resizable-handle"')) loi.push("không có tay kéo");
  if (html.includes('data-vung="ngan-noi"')) loi.push("cột phụ là ngăn nổi — còn phần tử ngăn nổi");
  return loi;
}

/** Màn vẫn dựng ngăn nổi: nhập `NganNoi` và dựng `<NganNoi`. */
export const dungNganNoi = (nguon: string) => /import \{[^}]*\bNganNoi\b[^}]*\} from "@\/components\/bo-cuc(\/ngan-noi)?"|from "\.\/ngan-noi"/.test(nguon) && /<NganNoi\b/.test(nguon);

// Ba chỗ giữ ngăn nổi (ADR-0024 sửa đổi 05/11): luồng nhiều bước trên điện thoại, ngăn báo (Cần xem), lọc trên điện thoại.
const GIU_NGAN_NOI = [
  ["luồng nhiều bước", "apps/web/src/components/bo-cuc/luong-toan-man.tsx"],
  ["ngăn báo", "apps/web/src/components/sync/bang-can-xem.tsx"],
  ["lọc trên điện thoại", "apps/web/src/app/(app)/inventory/cards/ngan-loc.tsx"],
] as const;

/** Token bố cục mà globals.css phải khai. */
export const TOKEN_BO_CUC = ["--spacing-trang", "--spacing-khung", "--container-doc", "--breakpoint-vua"] as const;

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
        assert.equal(html.includes(`data-vung="${vung}"`), MA_TRAN[kieu][vung], `${kieu} · ${vung}: HTML`);
      }
    }
    assert.equal(o, 21);
    assert.deepEqual(BO_CUC.filter((k) => coVung(k, "cot-phu")), ["danh-sach-chi-tiet", "luong-nhieu-buoc"]);
  });

  it("danh-sach-chi-tiet: cột phụ là cột kéo chia", () => {
    assert.deepEqual(KEO_CHIA, { than: { nhoNhat: 35 }, cot: { macDinh: 38, nhoNhat: 28, lonNhat: 50 } });
    const html = renderToStaticMarkup(
      h(BoCuc, { kieu: "danh-sach-chi-tiet", dauMan: null, chiTiet: { mo: true, tieuDe: "Hồ sơ căn" }, cotPhu: h("i", null, "hồ sơ") }, h("div", null, "bảng")),
    );
    assert.deepEqual(kiemCotKeoChia(html), []);
    assert.match(theMo(html, "cot-phu"), /data-slot="resizable-panel"/);
    // Gốc cao bằng vùng làm việc trên máy tính: không cuộn trang, cột chạy tới đáy.
    const goc = /<div data-bo-cuc-goc="danh-sach-chi-tiet"[^>]*class="([^"]*)"/.exec(html)?.[1] ?? "";
    for (const c of ["md:min-h-0", "md:overflow-hidden", "md:pb-0"]) assert.ok(goc.split(/\s+/).includes(c), `gốc thiếu ${c}`);
    // Cột đóng: nhóm panel vẫn dựng (thân không dựng lại), không panel cot-phu.
    const dong = renderToStaticMarkup(h(BoCuc, { kieu: "danh-sach-chi-tiet", dauMan: null, chiTiet: { mo: false }, cotPhu: null }, h("div", null, "bảng")));
    assert.ok(dong.includes('data-slot="resizable-panel-group"'), "cột đóng: nhóm panel phải còn");
    assert.ok(!dong.includes('data-vung="cot-phu"'), "cột đóng: không có panel cot-phu");
    // Màn không khai chi tiết (Lead đã nhập, Đã gửi): như cũ — không nhóm panel, gốc không khoá chiều cao.
    const cu = renderToStaticMarkup(h(BoCuc, { kieu: "danh-sach-chi-tiet", dauMan: null }, h("div", null, "bảng")));
    assert.ok(!cu.includes("resizable-panel-group") && !cu.includes("md:overflow-hidden"), "màn không khai chi tiết bị đổi");
    // Chiều đỏ: nhánh ngăn nổi cũ (NganNoi phuBang bọc cột phụ) thì bài kiểm gọi tên «cột phụ là ngăn nổi».
    const nhanhCu = renderToStaticMarkup(
      h("div", { "data-bo-cuc-goc": "danh-sach-chi-tiet" }, h("div", { "data-vung": "than" }, "bảng"), h(NganNoi, { phuBang: true, mo: true, onMo: () => undefined, tieuDe: "Hồ sơ căn", children: h("div", { "data-vung": "cot-phu" }, "hồ sơ") })),
    );
    assert.deepEqual(kiemCotKeoChia(nhanhCu), ["cột phụ là ngăn nổi — không có nhóm panel kéo chia"]);
    assert.deepEqual(kiemCotKeoChia(html.replace("flex-basis:38%", "flex-basis:50%")), ["cot-phu không mặc định 38%"]);
    assert.deepEqual(kiemCotKeoChia(html.replace('data-lon-nhat="50"', 'data-lon-nhat="60"')), ["cot-phu không kéo 28–50%"]);
  });

  for (const [viec, tep] of GIU_NGAN_NOI) {
    it(`ngăn nổi giữ: ${viec}`, () => {
      const nguon = readFileSync(join(ROOT, tep), "utf8");
      assert.ok(dungNganNoi(nguon), `${viec} (${tep}) không còn dựng NganNoi`);
      // Chiều đỏ: bỏ ngăn nổi khỏi bản sao nguồn thì bài kiểm đỏ.
      assert.ok(!dungNganNoi(nguon.replaceAll("<NganNoi", "<div")), `${viec}: bản sao bỏ NganNoi mà bài kiểm vẫn xanh`);
    });
  }

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
      assert.deepEqual(maxW, kieu === "ho-so" || kieu === "dong-tin" || kieu === "doc" ? ["max-w-(--container-doc)"] : [], `${kieu}: max-w ở gốc`);
      // Đọc đứng sát cột mục lục (ADR-0024 sửa đổi 04/11); Hồ sơ, Dòng tin căn giữa.
      assert.equal(goc.split(/\s+/).includes("mx-auto"), kieu === "ho-so" || kieu === "dong-tin", `${kieu}: mx-auto ở gốc`);
    }
    const css = readFileSync(join(ROOT, "apps/web/src/app/globals.css"), "utf8");
    assert.deepEqual(tokenThieu(css), []);
    assert.deepEqual(tokenThieu(css.replace("--container-doc:", "--container-khac:")), ["--container-doc"]);
  });

  it("Đọc hẹp: đối chứng đỏ — gốc «doc» mang mx-auto thì bài so gọi tên bố cục", () => {
    const lech = (goc: string, kieu: string) =>
      goc.split(/\s+/).includes("mx-auto") !== (kieu === "ho-so" || kieu === "dong-tin") ? [`${kieu}: mx-auto ở gốc`] : [];
    assert.deepEqual(lech("flex p-trang gap-khung max-w-(--container-doc)", "doc"), []);
    assert.deepEqual(lech("flex p-trang gap-khung mx-auto max-w-(--container-doc)", "doc"), ["doc: mx-auto ở gốc"]);
    const css = readFileSync(join(ROOT, "apps/web/src/app/globals.css"), "utf8");
    assert.match(css, /--container-doc:\s*48rem/);
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
