// Bật hẳn ràng buộc bản mã (hàng bat-rang-buoc-ban-ma, ADR-0013): migration 013 bật hai ràng buộc chặn số chủ để rõ khi
// bảng sạch, bỏ qua kèm lời nhắc khi còn số rõ. Tệp này chạy cả ở job deploy trên bản thật (glob tests/*.test.mjs).
// Ca chỉ đọc chạy mọi nơi; ca gỡ và dựng ràng buộc lấy khoá ACCESS EXCLUSIVE nên chỉ chạy với vai superuser (Postgres
// dãy, CI) — trên bản thật tự bỏ qua. Số mẫu `0900 000 06x`, tên `[Tên]`.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm cách ly cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const TEP_013 = readFileSync(new URL("../migrations/013_bat_rang_buoc_ban_ma.sql", import.meta.url), "utf8");
const BANG = [
  ["listing_owners", "listing_owners_phone_chi_ban_ma"],
  ["leads", "leads_phone_chi_ban_ma"],
];
const LY_DO_BO_QUA = "gỡ và dựng ràng buộc lấy khoá ACCESS EXCLUSIVE — không chạy trên vai không phải superuser (bản thật)";
const LENH_MA_HOA_LAI = "packages/api/van-hanh/ma-hoa-lai.ts";
const BAN_MA_MAU = Buffer.concat([Buffer.from([1]), randomBytes(38)]);
const DAU_VET_MAU = randomBytes(32);

/** Ca gỡ và dựng ràng buộc có chạy không: true, hoặc lý do bỏ qua. */
const nenChay = (rolsuper) => (rolsuper ? true : LY_DO_BO_QUA);

/** Bốn dạng của một số mẫu `09xxxxxxxx`. */
const bonDang = (so) => [so, `${so.slice(0, 4)} ${so.slice(4, 7)} ${so.slice(7)}`, `+84${so.slice(1)}`, `84${so.slice(1)}`];

const daBat = async (c, rangBuoc) =>
  (await c.query("select convalidated from pg_constraint where conname = $1", [rangBuoc])).rows[0].convalidated;

/** Lỗi theo bảng: không còn số rõ mà ràng buộc chưa bật, hoặc còn số rõ mà ràng buộc đã bật. Rỗng là đạt. */
async function kiemTrangThai(c) {
  const loi = [];
  for (const [bang, rangBuoc] of BANG) {
    const conSo = Number((await c.query(`select count(*) n from public.${bang} where owner_phone is not null`)).rows[0].n);
    const bat = await daBat(c, rangBuoc);
    if ((conSo === 0) !== bat) loi.push(`${bang}: còn ${conSo} dòng số rõ mà ${rangBuoc} ${bat ? "đã bật" : "chưa bật"}`);
  }
  return loi;
}

async function laSuperuser() {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return (await c.query("select rolsuper from pg_roles where rolname = current_user")).rows[0].rolsuper;
  } finally {
    await c.end();
  }
}

/** Một giao dịch hoàn lại, bỏ khoá ngoài khi cấy dòng trần; gom notice của cơ sở dữ liệu. */
async function voiGiaoDich(fn) {
  const c = new pg.Client({ connectionString: url });
  const notice = [];
  c.on("notice", (n) => notice.push(n.message));
  await c.connect();
  try {
    await c.query("begin");
    await c.query("set local session_replication_role = replica");
    // Khoá cả hai bảng một lần, để không tạo vòng chờ với tệp kiểm khác chạy song song.
    await c.query("lock table public.listing_owners, public.leads in access exclusive mode");
    return await fn(c, notice);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}

async function dungLaiChuaBat(c, bang, rangBuoc) {
  await c.query(`alter table public.${bang} drop constraint ${rangBuoc}`);
  await c.query(`alter table public.${bang} add constraint ${rangBuoc} check (owner_phone is null) not valid`);
}

const CAY = {
  listing_owners: (c, so) =>
    c.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone, updated_by)
       values (gen_random_uuid(), gen_random_uuid(), '[Tên]', $1, 'u-brbm') returning listing_id id`,
      [so],
    ),
  leads: (c, so) =>
    c.query(
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion,
                          desired_listing_time, owner_phone, outcome)
       values (gen_random_uuid(), gen_random_uuid(), 'u-brbm', '[Toà]', 'sale', 1, 'included', 'now', $1, 'new')
       returning id`,
      [so],
    ),
};
const KHOA = { listing_owners: "listing_id", leads: "id" };

test("bật ràng buộc: ca gỡ và dựng chỉ chạy với vai superuser", () => {
  assert.equal(nenChay(true), true);
  assert.equal(nenChay(false), LY_DO_BO_QUA);
});

test("bật ràng buộc: bảng không còn số rõ thì ràng buộc phải đã bật", { skip }, async () => {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    assert.deepEqual(await kiemTrangThai(c), []);
  } finally {
    await c.end();
  }
});

test("bật ràng buộc: bảng sạch thì tệp 013 bật hẳn, chạy lại không đổi", { skip }, async (t) => {
  const chay = nenChay(await laSuperuser());
  if (chay !== true) return t.skip(chay);
  await voiGiaoDich(async (c, notice) => {
    for (const [bang, rangBuoc] of BANG) await dungLaiChuaBat(c, bang, rangBuoc);
    for (const [, rangBuoc] of BANG) assert.equal(await daBat(c, rangBuoc), false, `${rangBuoc} phải chưa bật trước tệp 013`);
    // Hai chiều của ca trạng thái: bảng sạch mà ràng buộc chưa bật thì hàm kiểm báo đỏ đúng tên.
    const loi = await kiemTrangThai(c);
    for (const [, rangBuoc] of BANG) assert.ok(loi.some((l) => l.includes(`${rangBuoc} chưa bật`)), `hàm kiểm không bắt ${rangBuoc}: ${loi}`);

    await c.query(TEP_013);
    for (const [, rangBuoc] of BANG) assert.equal(await daBat(c, rangBuoc), true, `${rangBuoc} còn chưa bật sau tệp 013`);
    assert.equal(notice.length, 0, `bảng sạch mà có lời nhắc: ${notice}`);
    await c.query(TEP_013);
    for (const [, rangBuoc] of BANG) assert.equal(await daBat(c, rangBuoc), true);
    assert.equal(notice.length, 0, `chạy lại mà có lời nhắc: ${notice}`);
    assert.deepEqual(await kiemTrangThai(c), []);
  });
});

test("bật ràng buộc: bảng còn số rõ thì bỏ qua, bảng kia vẫn bật", { skip }, async (t) => {
  const chay = nenChay(await laSuperuser());
  if (chay !== true) return t.skip(chay);
  const luot = [
    { bang: "listing_owners", so: "0900000061" },
    { bang: "leads", so: "0900000062" },
  ];
  let daChay = 0;
  for (const { bang: ban, so } of luot) {
    const [, rbBan] = BANG.find(([b]) => b === ban);
    const [sach, rbSach] = BANG.find(([b]) => b !== ban);
    await voiGiaoDich(async (c, notice) => {
      for (const [bang, rangBuoc] of BANG) await c.query(`alter table public.${bang} drop constraint ${rangBuoc}`);
      const id = (await CAY[ban](c, so)).rows[0].id;
      for (const [bang, rangBuoc] of BANG) {
        await c.query(`alter table public.${bang} add constraint ${rangBuoc} check (owner_phone is null) not valid`);
      }

      await c.query(TEP_013);
      assert.equal(await daBat(c, rbBan), false, `${rbBan} không được bật khi ${ban} còn số rõ`);
      assert.equal(await daBat(c, rbSach), true, `${rbSach} phải bật vì ${sach} sạch`);
      const giu = (await c.query(`select owner_phone from public.${ban} where ${KHOA[ban]} = $1`, [id])).rows[0].owner_phone;
      assert.equal(giu, so, "dòng số rõ phải còn nguyên");
      assert.equal(notice.length, 1, `phải đúng một lời nhắc: ${JSON.stringify(notice)}`);
      const nhac = notice[0];
      for (const can of [ban, "1 dòng", rbBan, LENH_MA_HOA_LAI]) assert.ok(nhac.includes(can), `lời nhắc thiếu «${can}»: ${nhac}`);
      assert.ok(!nhac.includes(sach), `lời nhắc nêu cả bảng sạch: ${nhac}`);
      for (const dang of bonDang(so)) assert.ok(!nhac.includes(dang), `lời nhắc lộ số ở dạng «${dang}»`);
      assert.deepEqual(await kiemTrangThai(c), []);

      await c.query(
        `update public.${ban} set owner_phone = null, owner_phone_enc = $2, owner_phone_hash = $3 where ${KHOA[ban]} = $1`,
        [id, BAN_MA_MAU, DAU_VET_MAU],
      );
      notice.length = 0;
      await c.query(TEP_013);
      assert.equal(await daBat(c, rbBan), true, `${rbBan} phải bật sau khi hết số rõ`);
      assert.equal(notice.length, 0);
    });
    daChay++;
  }
  assert.equal(daChay, 2);
});
