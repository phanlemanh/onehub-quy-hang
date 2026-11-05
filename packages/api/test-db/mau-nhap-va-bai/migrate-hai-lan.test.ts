// Migration 045 chạy hai lần không áp lại (hàng 50 mau-nhap-va-bai, E8): chạy chính `packages/db/scripts/migrate.mjs`
// hai lần trên một cơ sở dữ liệu tạm — không chạm cơ sở dữ liệu của dãy hay bản thật. Chỉ chạy ở CI và Postgres dãy (tạo
// database cần quyền mà vai chủ của bản thật không có).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import pg from "pg";
import { RUN } from "../helpers";

const url = process.env.DATABASE_URL!;
const MIGRATE = fileURLToPath(new URL("../../../db/scripts/migrate.mjs", import.meta.url));
const TEP_045 = "045_mau_nhap.sql";
const db = `qh_mnvb_${RUN}`;
const urlTam = (() => {
  const u = new URL(url);
  u.pathname = `/${db}`;
  return u.toString();
})();

const quanTri = async <T>(dich: string, fn: (c: pg.Client) => Promise<T>): Promise<T> => {
  const c = new pg.Client({ connectionString: dich });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
};

const migrate = () => {
  const r = spawnSync(process.execPath, [MIGRATE], { env: { ...process.env, DATABASE_URL: urlTam }, encoding: "utf8" });
  return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
};

after(() => quanTri(url, (c) => c.query(`drop database if exists ${db} with (force)`)));

test("mẫu nhập (045): chạy migrate lần hai không áp lại", async () => {
  await quanTri(url, (c) => c.query(`create database ${db}`));
  const so = "select name, applied_at from schema_migrations where name = $1";

  const lan1 = migrate();
  assert.equal(lan1.ma, 0, lan1.ra);
  assert.ok(lan1.ra.includes(`đã áp ${TEP_045}`), `lần một chưa áp 045: ${lan1.ra}`);
  const truoc = await quanTri(urlTam, async (c) => (await c.query(so, [TEP_045])).rows);
  assert.equal(truoc.length, 1, "045 có một dòng sổ");

  const lan2 = migrate();
  assert.equal(lan2.ma, 0, lan2.ra);
  assert.ok(!lan2.ra.includes(`đã áp ${TEP_045}`), `lần hai áp lại 045: ${lan2.ra}`);
  assert.deepEqual(await quanTri(urlTam, async (c) => (await c.query(so, [TEP_045])).rows), truoc, "sổ của 045 không đổi");
});
