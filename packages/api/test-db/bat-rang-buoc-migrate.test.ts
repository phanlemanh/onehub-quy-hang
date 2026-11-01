// Lời nhắc của migration 013 ra tới log (hàng bat-rang-buoc-ban-ma, AC-2): chạy chính `packages/db/scripts/migrate.mjs`
// trên một cơ sở dữ liệu tạm và đọc đầu ra — như log job deploy. Chỉ chạy ở CI và Postgres dãy (tạo database cần quyền
// mà vai chủ của bản thật không có). Số mẫu `0900 000 06x`, tên `[Tên]`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import pg from "pg";
import { timDangSo } from "../src/owners/ma-hoa";
import { RUN } from "./helpers";

const url = process.env.DATABASE_URL!;
const MIGRATE = fileURLToPath(new URL("../../db/scripts/migrate.mjs", import.meta.url));
const TEP_013 = "013_bat_rang_buoc_ban_ma.sql";
const SO = "0900000063";
const db = `qh_brbm_${RUN}`;
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

test("bật ràng buộc: lời nhắc của 013 hiện ở đầu ra npm run db:migrate", async () => {
  await quanTri(url, (c) => c.query(`create database ${db}`));

  const lan1 = migrate();
  assert.equal(lan1.ma, 0, lan1.ra);
  assert.ok(lan1.ra.includes(`đã áp ${TEP_013}`), `lần một chưa áp 013: ${lan1.ra}`);
  assert.ok(!lan1.ra.includes("ma-hoa-lai"), `bảng sạch mà có lời nhắc: ${lan1.ra}`);

  await quanTri(urlTam, async (c) => {
    await c.query("delete from schema_migrations where name = $1", [TEP_013]);
    await c.query("set session_replication_role = replica");
    await c.query("alter table listing_owners drop constraint listing_owners_phone_chi_ban_ma");
    await c.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone, updated_by)
       values (gen_random_uuid(), gen_random_uuid(), '[Tên]', $1, 'u-brbm')`,
      [SO],
    );
    await c.query("alter table listing_owners add constraint listing_owners_phone_chi_ban_ma check (owner_phone is null) not valid");
  });

  const lan2 = migrate();
  assert.equal(lan2.ma, 0, lan2.ra);
  for (const can of [TEP_013, "listing_owners", "1 dòng", "listing_owners_phone_chi_ban_ma", "packages/api/van-hanh/ma-hoa-lai.ts"]) {
    assert.ok(lan2.ra.includes(can), `đầu ra migrate thiếu «${can}»: ${lan2.ra}`);
  }
  assert.equal(timDangSo(lan2.ra, SO), null, "đầu ra migrate lộ số mẫu");
});
