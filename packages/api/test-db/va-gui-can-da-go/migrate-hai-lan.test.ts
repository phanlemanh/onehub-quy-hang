// Migration 037 chạy hai lần không áp lại (hàng vá va-gui-can-da-go, E4): chạy chính `packages/db/scripts/migrate.mjs`
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
const TEP_037 = "037_gui_can_da_go.sql";
const db = `qh_gcdg_${RUN}`;
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

test("gửi căn đã gỡ (037): chạy migrate lần hai không áp lại", async () => {
  await quanTri(url, (c) => c.query(`create database ${db}`));
  const so = "select name, applied_at from schema_migrations where name = $1";

  const lan1 = migrate();
  assert.equal(lan1.ma, 0, lan1.ra);
  assert.ok(lan1.ra.includes(`đã áp ${TEP_037}`), `lần một chưa áp 037: ${lan1.ra}`);
  const truoc = await quanTri(urlTam, async (c) => (await c.query(so, [TEP_037])).rows);
  assert.equal(truoc.length, 1, "037 có một dòng sổ");

  const lan2 = migrate();
  assert.equal(lan2.ma, 0, lan2.ra);
  assert.ok(!lan2.ra.includes(`đã áp ${TEP_037}`), `lần hai áp lại 037: ${lan2.ra}`);
  assert.deepEqual(await quanTri(urlTam, async (c) => (await c.query(so, [TEP_037])).rows), truoc, "sổ của 037 không đổi");
});
