// Bàn dựng trạng thái mật khẩu cho phiên chụp màn (E10, E22) — kết nối chủ, chỉ dùng trên cơ sở dữ liệu thử.
//   node _acceptance/dang-nhap-mat-khau/thu/dung-trang-thai.mjs <email> <trạng-thái>
// Trạng thái: tam · tam-het · cho · xoa-cho · khoa · tu-dat · khong · vo-hieu. «tam» và «tu-dat» in mật khẩu thử ra stdout.
import { randomInt } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import pg from "pg";

const [email, tt] = process.argv.slice(2);
const TT = ["tam", "tam-het", "cho", "xoa-cho", "khoa", "tu-dat", "khong", "vo-hieu"];
if (!email || !TT.includes(tt)) {
  console.error(`dùng: dung-trang-thai.mjs <email> <${TT.join("|")}>`);
  process.exit(2);
}
const url = process.env.DATABASE_URL;
if (!url || !/localhost|127\.0\.0\.1/.test(url)) {
  console.error("cần DATABASE_URL trỏ cơ sở dữ liệu thử trên máy (localhost)");
  process.exit(2);
}
const BANG = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const MAT_KHAU_THU = "gió thổi qua đồi";

const c = new pg.Client({ connectionString: url });
await c.connect();
try {
  const nguoi = (await c.query(`select id from identity."user" where lower(email) = lower($1)`, [email])).rows[0];
  if (!nguoi) throw new Error(`không có người ${email}`);
  const u = nguoi.id;
  const san = (await c.query("select company_id from company_members where user_id = $1 limit 1", [u])).rows[0]?.company_id ?? null;
  const datMatKhau = async (pw) => {
    const hash = await hashPassword(pw.normalize("NFC"));
    const a = await c.query(`update identity.account set "password" = $2, "updatedAt" = now() where "userId" = $1 and "providerId" = 'credential'`, [u, hash]);
    if (a.rowCount === 0) {
      await c.query(
        `insert into identity.account ("id", "accountId", "providerId", "userId", "password", "updatedAt") values (gen_random_uuid()::text, $1, 'credential', $1, $2, now())`,
        [u, hash],
      );
    }
  };
  const datTrangThai = (cot) =>
    c.query(
      `insert into identity.password_state (user_id, kind, origin, issued_company_id, temp_expires_at, disabled_at, disabled_reason)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (user_id) do update set kind = excluded.kind, origin = excluded.origin, issued_company_id = excluded.issued_company_id,
         temp_expires_at = excluded.temp_expires_at, disabled_at = excluded.disabled_at, disabled_reason = excluded.disabled_reason,
         change_token_hash = null, change_token_expires_at = null, failed_streak = 0, updated_at = now()`,
      [u, cot.kind, cot.origin, cot.san ?? null, cot.het ?? null, cot.khoa ? new Date() : null, cot.khoa ?? null],
    );
  switch (tt) {
    case "tam": {
      let pw = "";
      for (let i = 0; i < 16; i++) pw += BANG[randomInt(BANG.length)];
      await datMatKhau(pw);
      await datTrangThai({ kind: "tam", origin: "san-cap", san, het: new Date(Date.now() + 72 * 3600_000) });
      console.log(pw);
      break;
    }
    case "tam-het":
      await c.query("update identity.password_state set temp_expires_at = now() - interval '1 minute' where user_id = $1 and kind = 'tam'", [u]);
      break;
    case "cho":
      for (let i = 0; i < 5; i++) await c.query("insert into identity.password_failures (email) values (lower($1))", [email]);
      break;
    case "xoa-cho":
      await c.query("delete from identity.password_failures where email = lower($1)", [email]);
      break;
    case "tu-dat":
      await datMatKhau(MAT_KHAU_THU);
      await datTrangThai({ kind: "tu-dat", origin: "tu-doi" });
      console.log(MAT_KHAU_THU);
      break;
    case "khoa":
    case "vo-hieu":
      await datMatKhau(MAT_KHAU_THU);
      await datTrangThai({ kind: "tu-dat", origin: "tu-doi", khoa: tt === "khoa" ? "khoa-20" : "bao-mat-may" });
      console.log(MAT_KHAU_THU);
      break;
    case "khong":
      await c.query(`delete from identity.account where "userId" = $1 and "providerId" = 'credential'`, [u]);
      await c.query("delete from identity.password_state where user_id = $1", [u]);
      break;
  }
} finally {
  await c.end();
}
