// va-pool-ket-noi AC-6: không nơi nào trong apps/web nuốt lỗi hạ tầng khi đọc phiên. Ghim tập nơi đọc thẳng /api/v1/me,
// tập nơi bắt LoiDocPhien, và cấm `.catch` ngay sau một lời gọi readMe/readMeHayBiBao ngoài màn đăng nhập. Cặp hai chiều
// trên cùng hàm `soi` (đối chứng dương trên cây thật, chiều đỏ trên tệp dựng trong bộ nhớ).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SRC = join(ROOT, "apps/web/src");

// Nơi được đọc thẳng /api/v1/me (không tính /api/v1/me/<con>): bộ phân loại, dấu máy bị báo mất của bước chặn đầu (chỉ
// rẽ ở 401), và tab Tôi đọc trạng thái mật khẩu ở trình duyệt (lỗi thì bỏ qua, không chuyển trang).
const DOC_ME = ["apps/web/src/app/(app)/me/toi-that.tsx", "apps/web/src/lib/api.ts", "apps/web/src/lib/session-refresh.ts"];
// Nơi được bắt LoiDocPhien: chỉ màn đăng nhập (giữ ô nhập như trước).
const BAT_LOI = ["apps/web/src/app/(auth)/login/page.tsx"];

const RE_DOC_ME = /\/api\/v1\/me["'`]/;
const RE_BAT = /instanceof\s+LoiDocPhien/;
const RE_NUOT = /\breadMe(?:HayBiBao)?\(.*\)\s*\.catch\(/;
// Bước chặn đầu là một hàm riêng với bộ pool riêng: chỉ nó gọi getApi("chan-dau"), và nó không gọi getApi() cỡ mặc định.
const PROXY = "apps/web/src/proxy.ts";
const RE_CHAN_DAU = /\bgetApi\(\s*["']chan-dau["']\s*\)/;
const RE_MAC_DINH = /\bgetApi\(\s*\)/;

/** Soi một tập tệp {đường: nội dung} → ba danh sách vi phạm. */
export function soi(tepGoc) {
  // Bỏ dòng chú thích: tên đường nhắc trong comment không phải một lời gọi.
  const tep = Object.fromEntries(
    Object.entries(tepGoc).map(([p, n]) => [p, n.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join("\n")]),
  );
  const ds = Object.keys(tep).sort();
  return {
    docMeLa: ds.filter((p) => RE_DOC_ME.test(tep[p]) && !DOC_ME.includes(p)),
    batLoiLa: ds.filter((p) => RE_BAT.test(tep[p]) && !BAT_LOI.includes(p)),
    nuotLoi: ds.filter((p) => !BAT_LOI.includes(p) && tep[p].split("\n").some((l) => RE_NUOT.test(l))),
    docMe: ds.filter((p) => RE_DOC_ME.test(tep[p])),
    chanDau: ds.filter((p) => RE_CHAN_DAU.test(tep[p])),
    proxyMacDinh: ds.filter((p) => p === PROXY && RE_MAC_DINH.test(tep[p])),
  };
}

function cayThat() {
  const tep = {};
  const di = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) di(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) tep[relative(ROOT, p)] = readFileSync(p, "utf8");
    }
  };
  di(SRC);
  return tep;
}

test("nơi gọi: cây thật — đúng ba nơi đọc thẳng /api/v1/me, chỉ màn đăng nhập bắt LoiDocPhien, không ai nuốt lỗi đọc phiên, bước chặn đầu dùng cỡ «chan-dau»", () => {
  const kq = soi(cayThat());
  assert.deepEqual(kq.docMe, DOC_ME, `nơi gọi: tập nơi đọc thẳng /api/v1/me đổi: ${kq.docMe.join(", ")}`);
  assert.deepEqual(kq.batLoiLa, [], `nơi gọi: bắt LoiDocPhien ngoài màn đăng nhập: ${kq.batLoiLa.join(", ")}`);
  assert.deepEqual(kq.nuotLoi, [], `nơi gọi: .catch sau readMe ngoài màn đăng nhập: ${kq.nuotLoi.join(", ")}`);
  assert.deepEqual(kq.chanDau, [PROXY], `nơi gọi: getApi("chan-dau") phải đúng ở bước chặn đầu: ${kq.chanDau.join(", ")}`);
  assert.deepEqual(kq.proxyMacDinh, [], "nơi gọi: bước chặn đầu gọi getApi() cỡ mặc định");
});

test("nơi gọi: chiều đỏ — nơi đọc lạ, bắt lỗi lạ, nuốt lỗi lạ và cỡ pool sai nơi đều bị gọi tên", () => {
  const kq = soi({
    "apps/web/src/lib/api.ts": 'getApi().request("http://quy-hang.local/api/v1/me", x)',
    "apps/web/src/app/page.tsx": 'const me = await readMe(cookie).catch(() => null);',
    "apps/web/src/app/(auth)/select-company/page.tsx": "if (e instanceof LoiDocPhien) redirect('/login');",
    "apps/web/src/app/(app)/la.tsx": 'await fetch("/api/v1/me");',
    "apps/web/src/app/(app)/con.tsx": 'await fetch("/api/v1/me/devices");',
    "apps/web/src/app/(app)/chu-thich.ts": "// `password` của `/api/v1/me`.",
    "apps/web/src/proxy.ts": "return refreshSessionCookie(request, NextResponse.next(), getApi());",
    "apps/web/src/app/(app)/x.tsx": 'getApi("chan-dau")',
  });
  assert.deepEqual(kq.docMeLa, ["apps/web/src/app/(app)/la.tsx"], "nơi gọi: không gọi tên nơi đọc /api/v1/me lạ");
  assert.deepEqual(kq.batLoiLa, ["apps/web/src/app/(auth)/select-company/page.tsx"], "nơi gọi: không gọi tên nơi bắt LoiDocPhien lạ");
  assert.deepEqual(kq.nuotLoi, ["apps/web/src/app/page.tsx"], "nơi gọi: không gọi tên nơi nuốt lỗi đọc phiên");
  assert.deepEqual(kq.chanDau, ["apps/web/src/app/(app)/x.tsx"], "nơi gọi: không gọi tên nơi lạ gọi getApi(\"chan-dau\")");
  assert.deepEqual(kq.proxyMacDinh, [PROXY], "nơi gọi: không gọi tên bước chặn đầu dùng cỡ mặc định");
});
