// Không đường nào ra mạng (hàng 75, hồ sơ dia-chi-chuan) — E9.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import path from "node:path";
import { test } from "node:test";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import { tenDuongChuan } from "./chuan-hoa";
import { docDiaChi } from "./doc-dia-chi";

/** Thư mục vùng, suy từ vị trí tệp này. */
const VUNG = path.dirname(fileURLToPath(import.meta.url));
const TAP_GHIM = ["chuan-hoa.ts", "danh-muc.ts", "doc-dia-chi-loi.ts", "doc-dia-chi.ts", "index.ts"];
/** Bộ sinh danh mục và bộ đọc tệp nguồn (hàng danh-muc-xa-day-du) — E8. */
const TAP_GHIM_NGUON = ["doc-tep.ts", "sinh-danh-muc.ts"];
const MODULE_CAM = new Set(["http", "https", "net", "tls", "dgram", "dns", "http2", "undici", "axios", "node-fetch"]);
const DINH_DANH_CAM = ["fetch(", "XMLHttpRequest", "WebSocket", "EventSource", "sendBeacon"];

/** Quét một chuỗi nguồn theo TÊN MODULE của câu nhập và theo định danh gọi mạng. Trả danh sách lỗi. */
function quetNguon(nguon: string): string[] {
  const loi: string[] = [];
  const mau = [
    /\bimport\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+[^'";]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of mau) {
    for (const m of nguon.matchAll(re)) {
      const ten = m[1]!;
      const goc = ten.replace(/^node:/, "").split("/")[0]!;
      if (MODULE_CAM.has(goc)) loi.push(`gọi mạng: ${ten}`);
    }
  }
  if (/\bfetch\s*\(/.test(nguon)) loi.push("gọi mạng: fetch(");
  for (const d of DINH_DANH_CAM.slice(1)) if (new RegExp(`\\b${d}\\b`).test(nguon)) loi.push(`gọi mạng: ${d}`);
  return [...new Set(loi)];
}

type DapAn = { ma: string; chu: string; dapAn: { stateOrProvince: string; streetName: string; streetNumber: string | null; thieu: string[] } };
const DAP_AN: DapAn[] = JSON.parse(readFileSync(fileURLToPath(new URL("../../../db/seed/mau-thap-tang/dap-an-thap-tang.json", import.meta.url)), "utf8")).diaChi;

test("AC-9 không mạng", async () => {
  const tep = readdirSync(VUNG).filter((t) => t.endsWith(".ts") && !t.endsWith(".test.ts")).sort();
  assert.deepEqual(tep, TAP_GHIM, "tập tệp quét lệch");
  for (const t of tep) assert.deepEqual(quetNguon(readFileSync(path.join(VUNG, t), "utf8")), [], t);
  const tepNguon = readdirSync(path.join(VUNG, "nguon")).filter((t) => t.endsWith(".ts") && !t.endsWith(".test.ts")).sort();
  assert.deepEqual(tepNguon, TAP_GHIM_NGUON, "tập tệp quét lệch: nguon/");
  for (const t of tepNguon) assert.deepEqual(quetNguon(readFileSync(path.join(VUNG, "nguon", t), "utf8")), [], `nguon/${t}`);
  console.log(`AC-9: quét ${tep.length} tệp vùng + ${tepNguon.length} tệp nguon/`);
  // Đối chứng dương: chuỗi nguồn có đường dẫn https không bị báo.
  assert.deepEqual(quetNguon('const docQua = "https://vi.wikipedia.org/wiki/Quận_1";'), []);

  // Chặn mọi đường ra mạng rồi đọc trọn bộ thử.
  let soLanGoi = 0;
  const nem = () => {
    soLanGoi++;
    throw new Error("gọi mạng trong lúc đọc địa chỉ");
  };
  const cu = { fetch: globalThis.fetch, hr: http.request, hg: http.get, sr: https.request, sg: https.get, nc: net.connect, tc: tls.connect };
  const ghi = (o: object, k: string, v: unknown) => Object.defineProperty(o, k, { value: v, configurable: true, writable: true });
  try {
    ghi(globalThis, "fetch", nem);
    ghi(http, "request", nem);
    ghi(http, "get", nem);
    ghi(https, "request", nem);
    ghi(https, "get", nem);
    ghi(net, "connect", nem);
    ghi(tls, "connect", nem);
    let khop = 0;
    for (const c of DAP_AN) {
      const kq = docDiaChi(c.chu);
      assert.equal(kq.stateOrProvince?.ten, c.dapAn.stateOrProvince, c.ma);
      assert.equal(kq.streetNumber, c.dapAn.streetNumber, c.ma);
      assert.equal(tenDuongChuan(kq.streetName ?? ""), tenDuongChuan(c.dapAn.streetName), c.ma);
      assert.deepEqual([...kq.thieu].sort(), [...c.dapAn.thieu].sort(), c.ma);
      khop++;
    }
    assert.equal(khop, DAP_AN.length);
    assert.equal(soLanGoi, 0, "không hàm ra mạng nào được gọi");
  } finally {
    ghi(globalThis, "fetch", cu.fetch);
    ghi(http, "request", cu.hr);
    ghi(http, "get", cu.hg);
    ghi(https, "request", cu.sr);
    ghi(https, "get", cu.sg);
    ghi(net, "connect", cu.nc);
    ghi(tls, "connect", cu.tc);
  }
});

test("AC-9 không mạng — phá thử: nguồn bản sao có lời gọi mạng thì đỏ đúng loại", () => {
  const goc = readFileSync(path.join(VUNG, "doc-dia-chi.ts"), "utf8");
  assert.deepEqual(quetNguon(`${goc}\nawait fetch("https://x");`), ["gọi mạng: fetch("]);
  assert.deepEqual(quetNguon(`import http from "node:http";\n${goc}`), ["gọi mạng: node:http"]);
  assert.deepEqual(quetNguon(`${goc}\nawait import("node:https");`), ["gọi mạng: node:https"]);
  assert.deepEqual(quetNguon(`${goc}\nconst h = require("http");`), ["gọi mạng: http"]);
});
