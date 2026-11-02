// AC-7 (hàng 91): trang mẫu sống mở không phiên, không chạm lớp gọi API, đủ 7 × 5 × 3 tổ hợp; bản chính thức đóng nó.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server";

import { proxy } from "../../../proxy";
import { diaChiTrang, KHO_MAU, TO_HOP, TRANG_THAI_MAU } from "./to-hop";

const DAY = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(DAY, "..", "..", "..");
const CAM = ["@/lib/api", "@/lib/sync/dong-bo", "@/lib/sync/react", "next/headers"];

function tepCua(thu: string): string[] {
  return readdirSync(thu).flatMap((t) => {
    const p = join(thu, t);
    return statSync(p).isDirectory() ? tepCua(p) : /\.tsx?$/.test(t) && !t.endsWith(".test.ts") ? [p] : [];
  });
}

function giai(tu: string, spec: string): string | null {
  const goc = spec.startsWith("@/") ? join(SRC, spec.slice(2)) : spec.startsWith(".") ? resolve(dirname(tu), spec) : null;
  if (!goc) return null;
  for (const duoi of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) if (existsSync(goc + duoi) && statSync(goc + duoi).isFile()) return goc + duoi;
  return null;
}

/** Duyệt đồ thị nhập tĩnh; trả `<tệp> → <nhập cấm>` cho mọi cạnh chạm danh sách cấm. */
export function nhapCam(dau: string[], doc: (p: string) => string = (p) => readFileSync(p, "utf8")): string[] {
  const da = new Set<string>();
  const ra: string[] = [];
  const hang = [...dau];
  while (hang.length) {
    const tep = hang.pop() as string;
    if (da.has(tep)) continue;
    da.add(tep);
    for (const m of doc(tep).matchAll(/(?:import|export)[^"']*?from\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g)) {
      const spec = (m[1] ?? m[2]) as string;
      if (CAM.some((c) => spec === c || spec.startsWith(`${c}/`))) ra.push(`${relative(SRC, tep)} → ${spec}`);
      const sau = giai(tep, spec);
      if (sau && sau.startsWith(SRC)) hang.push(sau);
    }
  }
  return ra.sort();
}

function voiMoiTruong<T>(gia: string | undefined, f: () => T): T {
  const cu = process.env.VERCEL_ENV;
  if (gia === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = gia;
  try {
    return f();
  } finally {
    if (cu === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = cu;
  }
}

const hoi = (path: string) => new NextRequest(`http://localhost${path}`);
const laNext = (r: Response) => r.headers.get("x-middleware-next") === "1";
const veLogin = (r: Response) => r.status >= 300 && r.status < 400 && new URL(r.headers.get("location") ?? "").pathname === "/login";

describe("trang mẫu", () => {
  it("trang mẫu: không gọi API", () => {
    const dau = tepCua(DAY);
    assert.ok(dau.length >= 5, `chỉ thấy ${dau.length} tệp`);
    assert.deepEqual(nhapCam(dau), []);
    const bi = join(DAY, "du-lieu-mau.ts");
    const pha = nhapCam(dau, (p) => (p === bi ? `import { getApi } from "@/lib/api";\n${readFileSync(p, "utf8")}` : readFileSync(p, "utf8")));
    assert.deepEqual(pha, ["app/mau/he-bo-cuc/du-lieu-mau.ts → @/lib/api"]);
  });

  it("trang mẫu: đủ tổ hợp", () => {
    assert.equal(TO_HOP.length, 7 * 5 * 3);
    assert.equal(TO_HOP.length, 105);
    assert.equal(TRANG_THAI_MAU.length, 5);
    assert.equal(KHO_MAU.length, 3);
    assert.equal(new Set(TO_HOP.map((t) => diaChiTrang(t.boCuc, t.trangThai, t.kho))).size, 105);
  });

  it("proxy: cho trang mẫu qua không phiên", async () => {
    for (const env of [undefined, "preview"]) {
      for (const p of ["/mau/he-bo-cuc", "/mau/he-bo-cuc/xem"]) {
        const r = await voiMoiTruong(env, () => proxy(hoi(p)));
        assert.ok(laNext(r), `${p} (${env ?? "vắng"}) phải qua`);
      }
      const r = await voiMoiTruong(env, () => proxy(hoi("/inventory")));
      assert.ok(veLogin(r), `/inventory không phiên phải về /login (${env ?? "vắng"})`);
    }
  });

  it("bản chính thức đóng trang mẫu", async () => {
    const r = await voiMoiTruong("production", () => proxy(hoi("/mau/he-bo-cuc")));
    assert.ok(veLogin(r), "bản chính thức phải đưa /mau/he-bo-cuc về /login");
    const trang = [(await import("./page")).default, (await import("./xem/page")).default];
    for (const Page of trang) {
      await voiMoiTruong("production", async () => {
        await assert.rejects(
          () => Page({ searchParams: Promise.resolve({}) }),
          (e: { digest?: string }) => e.digest === "NEXT_HTTP_ERROR_FALLBACK;404",
        );
      });
      const ra = await voiMoiTruong("preview", () => Page({ searchParams: Promise.resolve({}) }));
      assert.ok(ra, "bản thử phải dựng trang");
    }
  });
});
