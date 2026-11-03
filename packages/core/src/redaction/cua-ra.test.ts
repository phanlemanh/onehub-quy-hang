// E9 (hàng 31) — rào cửa ra: trang có URL của cửa ra phải có bài kiểm rò rỉ gọi `canMoi` và `timRoRi`. Cây thật của kho
// phải sạch; chiều đỏ đo trên cây mẫu dựng trong thư mục tạm (không ghi vào cây kho).
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { duongApiKhai, timCuaRaThieuKiem, urlCuaTrang } from "./rao-cua-ra";

const GOC_KHO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const KIEM_DAT = 'import { canMoi, timRoRi } from "@quy-hang/core/redaction";\ntimRoRi(dungTrang(canMoi()), []);\n';

function cayMau(tep: Record<string, string>): string {
  const goc = mkdtempSync(join(tmpdir(), "rao-cua-ra-"));
  for (const [p, noiDung] of Object.entries(tep)) {
    mkdirSync(dirname(join(goc, p)), { recursive: true });
    writeFileSync(join(goc, p), noiDung);
  }
  return goc;
}

const APP = "apps/web/src/app";
const ROUTE_CONG_KHAI = 'export function registerPublicRoutes(api) {\n  api.openapi(createRoute({ method: "get", path: "/api/v1/public/shares/{code}" }), h);\n}\n';
const CHO_GIU = 'import { Placeholder } from "@/components/shell/placeholder";\n\nexport default function Page() {\n  return <Placeholder path="/exports/new" />;\n}\n';

test("E9 cây thật của kho không có cửa ra thiếu bài kiểm", () => {
  assert.deepEqual(timCuaRaThieuKiem(GOC_KHO), []);
});

test("E9 URL bỏ nhóm route, kể cả hai lớp", () => {
  assert.equal(urlCuaTrang("(khach)/(mo)/s/[ma]/page.tsx"), "/s/[ma]");
  assert.deepEqual(duongApiKhai('createRoute({ method: "get", path: "/api/v1/public/shares/{code}" })\napi.get("/api/v1/s/:ma", h)'), [
    "/api/v1/public/shares/{code}",
    "/api/v1/s/:ma",
  ]);
});

test("E9 ma trận 12 ô trên cây mẫu", () => {
  const ca: [string, Record<string, string>, { url: string }[]][] = [
    ["trang /s không tệp kiểm", { [`${APP}/s/[ma]/page.tsx`]: "x" }, [{ url: "/s/[ma]" }]],
    ["nhóm route không tệp kiểm", { [`${APP}/(khach)/s/[ma]/page.tsx`]: "x" }, [{ url: "/s/[ma]" }]],
    ["có tệp kiểm đạt cạnh trang", { [`${APP}/s/[ma]/page.tsx`]: "x", [`${APP}/s/[ma]/trang.ro-ri.test.ts`]: KIEM_DAT }, []],
    ["tệp kiểm rỗng", { [`${APP}/s/[ma]/page.tsx`]: "x", [`${APP}/s/[ma]/trang.ro-ri.test.ts`]: "" }, [{ url: "/s/[ma]" }]],
    ["trang không phải cửa ra", { [`${APP}/(app)/inventory/page.tsx`]: "x" }, []],
    ["trang chỗ giữ của vỏ (chưa cầm dữ liệu)", { [`${APP}/(app)/exports/new/page.tsx`]: CHO_GIU }, []],
    ["trang chỗ giữ có thêm nhập khác thì là trang thật", { [`${APP}/(app)/exports/new/page.tsx`]: `import { banRaNgoai } from "@quy-hang/core/redaction";\n${CHO_GIU}` }, [{ url: "/exports/new" }]],
    ["route API công khai khuôn Hono của kho không tệp kiểm", { "packages/api/src/public/routes.ts": ROUTE_CONG_KHAI }, [{ url: "/api/v1/public/shares/{code}" }]],
    ["route API công khai có tệp kiểm đạt", { "packages/api/src/public/routes.ts": ROUTE_CONG_KHAI, "packages/api/src/public/routes.ro-ri.test.ts": KIEM_DAT }, []],
    ["route API nội bộ không phải cửa ra", { "packages/api/src/listings/routes.ts": 'createRoute({ path: "/api/v1/listings" })' }, []],
    ["trang chỗ giữ có nhập nhiều dòng thì là trang thật", { [`${APP}/(app)/exports/new/page.tsx`]: `import {\n  banRaNgoai,\n} from "@quy-hang/core/redaction";\n${CHO_GIU}` }, [{ url: "/exports/new" }]],
    ["trang chỗ giữ có nhập chỉ để chạy thì là trang thật", { [`${APP}/(app)/exports/new/page.tsx`]: `import "./du-lieu";\n${CHO_GIU}` }, [{ url: "/exports/new" }]],
  ];
  for (const [ten, tep, mong] of ca) {
    const goc = cayMau(tep);
    try {
      assert.deepEqual(timCuaRaThieuKiem(goc).map((t) => ({ url: t.url })), mong, ten);
    } finally {
      rmSync(goc, { recursive: true, force: true });
    }
  }
});

test("E9 tệp kiểm ở thư mục cha của cửa vẫn tính; nhóm route hai lớp không tệp kiểm thì đỏ", () => {
  const goc = cayMau({
    [`${APP}/(khach)/(mo)/s/[ma]/page.tsx`]: "x",
    [`${APP}/(app)/shares/new/page.tsx`]: "x",
    [`${APP}/(app)/shares/kiem.ro-ri.test.tsx`]: KIEM_DAT,
  });
  try {
    assert.deepEqual(timCuaRaThieuKiem(goc), [{ url: "/s/[ma]", tep: `${APP}/(khach)/(mo)/s/[ma]/page.tsx` }]);
  } finally {
    rmSync(goc, { recursive: true, force: true });
  }
});
