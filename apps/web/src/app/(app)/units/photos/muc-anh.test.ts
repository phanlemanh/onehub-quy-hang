// Ảnh không lưu trên máy (hàng 18: phần web của E6). Mục Ảnh không nhập bộ đồng bộ hay IndexedDB (đọc mã nguồn), và lượt
// kéo thật của bộ đồng bộ không gọi đường ảnh, không ghi khoá ảnh vào kho trên máy (chạy hàm với máy chủ giả).
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { keoLichSu, keoVe } from "../../../../lib/sync/keo";
import type { Goi, Ngan } from "../../../../lib/sync/types";

const ANH = fileURLToPath(new URL(".", import.meta.url));

function quet(anh: string): string[] {
  const loi: string[] = [];
  for (const ten of readdirSync(anh).filter((t) => /\.tsx?$/.test(t) && !t.endsWith(".test.ts"))) {
    const t = readFileSync(join(anh, ten), "utf8");
    if (/from\s+["'][^"']*lib\/sync/.test(t)) loi.push(`${ten}: nhập bộ đồng bộ`);
    if (/indexedDB|localStorage|caches\.open/.test(t)) loi.push(`${ten}: chạm bộ nhớ trình duyệt`);
  }
  return loi;
}

test("E6 phía web: mục Ảnh không qua bộ đồng bộ, không IndexedDB; bản sao thêm một dòng nhập thì bị gọi tên", () => {
  assert.deepEqual(quet(ANH), []);
  const sao = mkdtempSync(join(tmpdir(), "quet-anh-"));
  cpSync(ANH, sao, { recursive: true });
  const muc = join(sao, "muc-anh.tsx");
  writeFileSync(muc, `import { useBoDongBo } from "@/lib/sync/react";\n${readFileSync(muc, "utf8")}`);
  assert.deepEqual(quet(sao), ["muc-anh.tsx: nhập bộ đồng bộ"]);
});

/** Chạy một lượt kéo của bộ đồng bộ với máy chủ giả; trả mọi đường nó gọi và các khoá của ngăn kho nó ghi. */
async function luotKeo(keo: (goi: Goi, n: Ngan) => Promise<Ngan>) {
  const duong: string[] = [];
  const goi: Goi = async (_m, path) => {
    duong.push(path);
    return { status: 200, body: path.endsWith("/listings") ? [] : { id: "x", events: [] } };
  };
  const n0: Ngan = { listings: [], history: {}, queue: [], review: [], lastPullAt: null, lastAttempt: null } as unknown as Ngan;
  const n = await keo(goi, n0);
  return { duong, khoa: Object.keys(n) };
}
const coAnh = (r: { duong: string[]; khoa: string[] }) => [...r.duong.filter((d) => /photo/i.test(d)), ...r.khoa.filter((k) => /photo|anh/i.test(k))];

test("E6 phía web: lượt kéo thật của bộ đồng bộ không gọi đường ảnh, ngăn kho không có khoá ảnh", async () => {
  const keo = await luotKeo((g, n) => keoVe(g, n, "2026-11-01T00:00:00Z"));
  assert.deepEqual(keo.duong, ["/api/v1/listings"]);
  assert.deepEqual(coAnh(keo), []);
  assert.deepEqual(coAnh(await luotKeo((g, n) => keoLichSu(g, n, "x"))), []);
  // Đối chứng dương: một lượt kéo có gọi đường ảnh thì bị gọi tên.
  const gia = await luotKeo(async (g, n) => (await g("GET", "/api/v1/units/photos?toa=A&ma=1"), n));
  assert.deepEqual(coAnh(gia), ["/api/v1/units/photos?toa=A&ma=1"]);
});
