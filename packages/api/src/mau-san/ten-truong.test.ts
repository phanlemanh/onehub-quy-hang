// Tên trường tiếng Anh trong tài liệu OpenAPI của hai đường mẫu (hàng mau-api-ten-truong-tieng-anh, E1b). Không chạm cơ sở
// dữ liệu: chỉ đọc /api/v1/openapi.json.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { createApi } from "../app";
import { createAuth } from "../auth/auth";

const pool = new pg.Pool();
const api = createApi({
  appPool: pool,
  identityPool: pool,
  auth: createAuth({ identityPool: pool, secret: "s".repeat(40), baseURL: "http://localhost:3461", sender: async () => {} }),
});

type Schema = { properties?: Record<string, Schema>; items?: Schema; $ref?: string };

test("OpenAPI: mẫu bảng và mẫu bài khai tên trường tiếng Anh", async () => {
  const res = await api.request("/api/v1/openapi.json");
  assert.equal(res.status, 200);
  const doc = (await res.json()) as { components: { schemas: Record<string, Schema> } };
  const S = doc.components.schemas;
  const khoa = (s: Schema | undefined) => Object.keys(s?.properties ?? {}).sort();
  const bang = S.ExportTemplates?.properties?.templates?.items;
  assert.deepEqual(khoa(bang), ["columns", "id", "name"], `ExportTemplates: ${JSON.stringify(bang)}`);
  const bai = S.PostTemplates?.properties?.templates?.properties ?? {};
  assert.deepEqual(Object.keys(bai).sort(), ["facebook", "zalo"]);
  for (const k of ["zalo", "facebook"]) assert.deepEqual(khoa(bai[k]), ["closing", "opening"], `PostTemplates.${k}: ${JSON.stringify(bai[k])}`);
  // Đối chứng: không còn tên tiếng Việt nào trong hai schema.
  const chu = JSON.stringify([S.ExportTemplates, S.PostTemplates]);
  for (const cu of ["ten", "cot", "dau", "cuoi"]) assert.ok(!chu.includes(`"${cu}"`), `schema còn khoá «${cu}»`);
});
