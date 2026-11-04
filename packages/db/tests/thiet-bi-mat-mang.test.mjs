// Khuôn của 028_thiet_bi_va_mat_mang (AC-1, E1): cột thiết bị và dấu mất mạng của sự kiện, bảng lượt mất mạng.
// Chạy trên Postgres thật đã áp migration; mỗi ca trong một giao dịch rồi rollback. Cách ly sàn ở isolation.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm thiết bị và mất mạng cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const COMPANY = "00000000-0000-4000-8000-0000000028a0";
const LISTING = "00000000-0000-4000-8000-0000000028a1";
const USER = "u-tbmm-1";

/** Một giao dịch bằng vai chủ với một sàn; rollback khi xong. */
async function inTx(fn) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    await client.query("insert into companies (id, name) values ($1, '[Sàn A]')", [COMPANY]);
    return await fn(client);
  } finally {
    await client.query("rollback").catch(() => {});
    await client.end();
  }
}

/** Câu dự kiến lỗi, trả lỗi để kiểm mã; không làm hỏng giao dịch của ca. */
async function loi(client, sql, params = []) {
  await client.query("savepoint tbmm");
  try {
    await client.query(sql, params);
  } catch (err) {
    await client.query("rollback to savepoint tbmm");
    return err;
  }
  await client.query("rollback to savepoint tbmm");
  return null;
}

const SU_KIEN = `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles,
                                             confirmed_with_owner, device)
                 values ($1, $2, $3, 'owner_confirmed', '{}', $4, '{listing_agent}', true, $5)`;

test("028: cột thiết bị và dấu mất mạng của sự kiện", { skip }, async () => {
  await inTx(async (c) => {
    // Sự kiện không khai hai cột (như sự kiện ghi trước 028): device null, made_offline false.
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 1, 'created', '{"buildingName":"[Toà A]"}', $3, '{listing_agent}', false)`,
      [COMPANY, LISTING, USER],
    );
    const cu = await c.query("select device, made_offline from listing_events where listing_id = $1 and seq = 1", [LISTING]);
    assert.deepEqual(cu.rows, [{ device: null, made_offline: false }]);

    // Ba giá trị được nhận.
    for (const [seq, device] of [[2, "mobile"], [3, "desktop"], [4, null]]) {
      await c.query(SU_KIEN, [COMPANY, LISTING, seq, USER, device]);
    }
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles,
                                   confirmed_with_owner, device, made_offline)
       values ($1, $2, 5, 'owner_confirmed', '{}', $3, '{listing_agent}', true, 'mobile', true)`,
      [COMPANY, LISTING, USER],
    );
    const { rows } = await c.query("select seq, device, made_offline from listing_events where listing_id = $1 order by seq", [
      LISTING,
    ]);
    assert.deepEqual(rows, [
      { seq: 1, device: null, made_offline: false },
      { seq: 2, device: "mobile", made_offline: false },
      { seq: 3, device: "desktop", made_offline: false },
      { seq: 4, device: null, made_offline: false },
      { seq: 5, device: "mobile", made_offline: true },
    ]);

    // Giá trị lạ bị ràng buộc check từ chối.
    const tablet = await loi(c, SU_KIEN, [COMPANY, LISTING, 6, USER, "tablet"]);
    assert.ok(tablet, "device 'tablet' được nhận — thiếu ràng buộc check của device");
    assert.equal(tablet.code, "23514", `device 'tablet': mã lỗi ${tablet.code} (${tablet.message})`);
    const nullOffline = await loi(
      c,
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles,
                                   confirmed_with_owner, made_offline)
       values ($1, $2, 6, 'owner_confirmed', '{}', $3, '{listing_agent}', true, null)`,
      [COMPANY, LISTING, USER],
    );
    assert.equal(nullOffline?.code, "23502", "made_offline null phải bị not null từ chối");

    // Sự kiện vẫn chỉ thêm.
    const sua = await loi(c, "update listing_events set device = 'desktop' where listing_id = $1", [LISTING]);
    assert.match(sua?.message ?? "", /chỉ thêm/);
    assert.equal(sua.constraint, "su_kien_chi_them");
    const xoa = await loi(c, "delete from listing_events where listing_id = $1", [LISTING]);
    assert.match(xoa?.message ?? "", /chỉ thêm/);
    assert.equal(xoa.constraint, "su_kien_chi_them");
  });
});

const LUOT = `insert into offline_sessions (company_id, user_id, device, started_at, ended_at, queued_ops)
              values ($1, $2, $3, $4, $5, $6)`;
const BAT_DAU = "2026-11-03T08:00:00Z";
const KET_THUC = "2026-11-03T08:05:00Z";

test("028: khuôn lượt mất mạng", { skip }, async () => {
  await inTx(async (c) => {
    // Đối chứng dương: lượt hợp lệ, kể cả lượt không thao tác nào và lượt dài 0.
    await c.query(LUOT, [COMPANY, USER, "mobile", BAT_DAU, KET_THUC, 3]);
    await c.query(LUOT, [COMPANY, USER, "desktop", BAT_DAU, BAT_DAU, 0]);
    const { rows } = await c.query(
      "select device, queued_ops, recorded_at is not null as co_moc from offline_sessions where company_id = $1 order by device",
      [COMPANY],
    );
    assert.deepEqual(rows, [
      { device: "desktop", queued_ops: 0, co_moc: true },
      { device: "mobile", queued_ops: 3, co_moc: true },
    ]);

    // Bảng viết trước: dòng sai khuôn → mã lỗi.
    const BANG = [
      ["kết thúc trước bắt đầu", [COMPANY, USER, "mobile", KET_THUC, BAT_DAU, 1], "23514"],
      ["số thao tác âm", [COMPANY, USER, "mobile", "2026-11-03T09:00:00Z", "2026-11-03T09:01:00Z", -1], "23514"],
      ["thiết bị 'tablet'", [COMPANY, USER, "tablet", "2026-11-03T09:00:00Z", "2026-11-03T09:01:00Z", 1], "23514"],
      ["trùng sàn + người + thiết bị + giờ bắt đầu", [COMPANY, USER, "mobile", BAT_DAU, "2026-11-03T08:09:00Z", 4], "23505"],
    ];
    let so = 0;
    for (const [ten, params, ma] of BANG) {
      const err = await loi(c, LUOT, params);
      assert.ok(err, `dòng «${ten}» được nhận`);
      assert.equal(err.code, ma, `dòng «${ten}»: mã lỗi ${err.code} (${err.message})`);
      so++;
    }
    assert.equal(so, 4);

    // Lượt chỉ thêm, kể cả chủ bảng.
    const sua = await loi(c, "update offline_sessions set queued_ops = 9 where company_id = $1", [COMPANY]);
    assert.match(sua?.message ?? "", /chỉ thêm/);
    const xoa = await loi(c, "delete from offline_sessions where company_id = $1", [COMPANY]);
    assert.match(xoa?.message ?? "", /chỉ thêm/);
    const cat = await loi(c, "truncate offline_sessions");
    assert.match(cat?.message ?? "", /chỉ thêm/);
    const n = await c.query("select count(*)::int n from offline_sessions where company_id = $1", [COMPANY]);
    assert.equal(n.rows[0].n, 2, "số lượt phải giữ nguyên");

    // Gỡ cả sàn: xoá dây chuyền không bị trigger chặn.
    assert.equal((await c.query("delete from companies where id = $1", [COMPANY])).rowCount, 1);
    const con = await c.query("select count(*)::int n from offline_sessions where company_id = $1", [COMPANY]);
    assert.equal(con.rows[0].n, 0);
  });
});
