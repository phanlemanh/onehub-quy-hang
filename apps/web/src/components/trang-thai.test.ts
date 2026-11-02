// AC-5 (hàng 91): TrangThai bốn kiểu và hai dạng rỗng, sáu tệp trạng thái cấp tuyến, dải ngoại tuyến.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DaiNgoaiTuyen } from "./bo-cuc/dai-ngoai-tuyen";
import { TrangThai } from "./trang-thai";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..");

export const TUYEN = ["app/(app)/loading.tsx", "app/(app)/error.tsx", "app/(app)/not-found.tsx", "app/error.tsx", "app/not-found.tsx", "app/global-error.tsx"];

/** Tệp tuyến thiếu, hay không dựng qua TrangThai/ChoTai/BoCuc. */
export function tuyenHong(goc: string, co: (p: string) => boolean = existsSync): string[] {
  return TUYEN.filter((t) => {
    const p = join(goc, t);
    if (!co(p)) return true;
    const ma = readFileSync(p, "utf8");
    return !/from "@\/components\/(trang-thai|bo-cuc)"/.test(ma);
  });
}

const dung = (kind: "empty" | "error" | "notice" | "loading", them: Record<string, unknown> = {}) =>
  renderToStaticMarkup(h(TrangThai, { kind, title: "Tiêu đề", description: "Mô tả", hanhDong: h("button", null, "Làm"), ...them }));

describe("trạng thái", () => {
  it("trạng thái: năm kiểu", () => {
    const tai = dung("loading");
    assert.match(tai, /role="status"/);
    assert.match(tai, /aria-busy="true"/);
    const rong = dung("empty");
    assert.match(rong, /data-slot="empty"/);
    assert.match(rong, /data-kieu="chua-co"/);
    assert.match(rong, /data-slot="empty-content"[^>]*><button>Làm<\/button>/, "rỗng thiếu khe hành động");
    const timKhongRa = dung("empty", { timKhongRa: true });
    assert.match(timKhongRa, /data-kieu="tim-khong-ra"/);
    assert.match(timKhongRa, /lucide-search-x/);
    const loi = dung("error");
    assert.match(loi, /role="alert"/);
    assert.match(loi, /<button>Làm<\/button>/);
    const bao = dung("notice");
    assert.match(bao, /role="status"/);
    assert.ok(!bao.includes("aria-busy"));
  });

  it("tuyến: chờ tải, lỗi, không thấy", () => {
    assert.equal(TUYEN.length, 6);
    assert.deepEqual(tuyenHong(SRC), []);
    const mat = join(SRC, "app/(app)/error.tsx");
    assert.deepEqual(tuyenHong(SRC, (p) => p !== mat && existsSync(p)), ["app/(app)/error.tsx"]);
    assert.match(readFileSync(join(SRC, "app/global-error.tsx"), "utf8"), /<html lang="vi">/);
  });

  it("ngoại tuyến: dải đầu màn", () => {
    assert.equal(renderToStaticMarkup(h(DaiNgoaiTuyen, { ngoaiTuyen: false })), "");
    const dai = renderToStaticMarkup(h(DaiNgoaiTuyen, { ngoaiTuyen: true }));
    assert.match(dai, /role="status"/);
    assert.match(dai, /bản đã tải/);
  });
});
