/**
 * Trạng thái mật khẩu do sàn cấp (hàng dang-nhap-mat-khau, migration 034): đọc ghi `identity.password_state`,
 * `password_failures`, `password_events` và dòng `credential` của `identity.account` bằng kết nối danh tính. Không
 * hàm nào nhận hay trả mật khẩu thô — chỉ băm đã tính ở nơi gọi.
 */
import { createHash } from "node:crypto";
import type pg from "pg";
import { MA_DOI_PHUT, SAI_CUA_SO_PHUT, SAI_LIEN_TIEP_KHOA } from "./constants";

export type LoaiSuKien = "cap" | "doi" | "dat-lan-dau" | "vo-hieu-bao-mat" | "khoa-20" | "vo-hieu-san-khac";
export type TrangThai = {
  kind: "tam" | "tu-dat";
  origin: "san-cap" | "tu-doi";
  issuedCompanyId: string | null;
  tempExpiresAt: Date | null;
  failedStreak: number;
  disabledAt: Date | null;
};
export type TaiKhoan = { userId: string; email: string; hash: string | null; state: TrangThai | null };

export const chuanEmail = (email: string) => email.trim().toLowerCase();
export const bamMaDoi = (ma: string) => createHash("sha256").update(ma).digest("hex");

type Dong = {
  id: string;
  email: string;
  password: string | null;
  kind: TrangThai["kind"] | null;
  origin: TrangThai["origin"];
  issued_company_id: string | null;
  temp_expires_at: Date | null;
  failed_streak: number;
  disabled_at: Date | null;
};
const COT = `u.id, u.email, a."password", s.kind, s.origin, s.issued_company_id, s.temp_expires_at, s.failed_streak, s.disabled_at
  from identity."user" u
  left join identity.account a on a."userId" = u.id and a."providerId" = 'credential'
  left join identity.password_state s on s.user_id = u.id`;
const taiKhoan = (r: Dong): TaiKhoan => ({
  userId: r.id,
  email: r.email,
  hash: r.password,
  state: r.kind
    ? { kind: r.kind, origin: r.origin, issuedCompanyId: r.issued_company_id, tempExpiresAt: r.temp_expires_at, failedStreak: r.failed_streak, disabledAt: r.disabled_at }
    : null,
});

export async function docTheoEmail(pool: pg.Pool, email: string): Promise<TaiKhoan | null> {
  const { rows } = await pool.query<Dong>(`select ${COT} where lower(u.email) = $1`, [chuanEmail(email)]);
  return rows[0] ? taiKhoan(rows[0]) : null;
}
export async function docTheoNguoi(pool: pg.Pool, userId: string): Promise<TaiKhoan | null> {
  const { rows } = await pool.query<Dong>(`select ${COT} where u.id = $1`, [userId]);
  return rows[0] ? taiKhoan(rows[0]) : null;
}

/** Mật khẩu dùng được: có băm, không vô hiệu, không phải mật khẩu tạm. */
export const coMatKhauDung = (t: TaiKhoan) => !!t.hash && !!t.state && !t.state.disabledAt && t.state.kind === "tu-dat";
/** Ba trạng thái cho dòng «Mật khẩu» ở Cá nhân. */
export function trangThaiDong(t: TaiKhoan | null): "khong" | "co" | "vo-hieu" {
  if (!t?.hash || !t.state) return "khong";
  if (t.state.disabledAt) return "vo-hieu";
  return t.state.kind === "tu-dat" ? "co" : "khong";
}

export async function demSai(pool: pg.Pool, email: string): Promise<number> {
  const { rows } = await pool.query<{ n: string }>(
    "select count(*) as n from identity.password_failures where email = $1 and at > now() - make_interval(mins => $2)",
    [chuanEmail(email), SAI_CUA_SO_PHUT],
  );
  return Number(rows[0]?.n ?? 0);
}

export async function ghiSuKien(
  db: pg.Pool | pg.PoolClient,
  e: { userId: string; kind: LoaiSuKien; actorUserId: string | null; companyId?: string | null },
): Promise<void> {
  await db.query("insert into identity.password_events (user_id, company_id, actor_user_id, kind) values ($1, $2, $3, $4)", [
    e.userId,
    e.companyId ?? null,
    e.actorUserId,
    e.kind,
  ]);
}

/** Một lần thử sai: ghi cửa sổ theo email; tài khoản có thật thì cộng chuỗi sai, tới ngưỡng thì vô hiệu. */
export async function ghiSai(pool: pg.Pool, email: string, userId: string | null): Promise<void> {
  await pool.query("insert into identity.password_failures (email) values ($1)", [chuanEmail(email)]);
  if (!userId) return;
  const { rows } = await pool.query<{ failed_streak: number }>(
    `update identity.password_state set failed_streak = failed_streak + 1,
       disabled_at = case when failed_streak + 1 >= $2 and disabled_at is null then now() else disabled_at end,
       disabled_reason = case when failed_streak + 1 >= $2 and disabled_at is null then 'khoa-20' else disabled_reason end,
       change_token_hash = case when failed_streak + 1 >= $2 then null else change_token_hash end,
       change_token_expires_at = case when failed_streak + 1 >= $2 then null else change_token_expires_at end,
       updated_at = now()
     where user_id = $1 returning failed_streak`,
    [userId, SAI_LIEN_TIEP_KHOA],
  );
  if (rows[0]?.failed_streak === SAI_LIEN_TIEP_KHOA) await ghiSuKien(pool, { userId, kind: "khoa-20", actorUserId: null });
}

export async function xoaChuoiSai(pool: pg.Pool, userId: string): Promise<void> {
  await pool.query("update identity.password_state set failed_streak = 0, updated_at = now() where user_id = $1 and failed_streak > 0", [userId]);
}

/** Mã đổi mới cho lần đăng nhập bằng mật khẩu tạm — huỷ mã cũ. */
export async function datMaDoi(pool: pg.Pool, userId: string, maBam: string): Promise<void> {
  await pool.query(
    `update identity.password_state set change_token_hash = $2,
       change_token_expires_at = now() + make_interval(mins => $3), updated_at = now() where user_id = $1`,
    [userId, maBam, MA_DOI_PHUT],
  );
}

/** Người của mã đổi còn hạn (mật khẩu tạm còn hạn, chưa vô hiệu) — null khi mã sai, hết hạn hay đã dùng. */
export async function nguoiCuaMaDoi(pool: pg.Pool, maBam: string): Promise<{ userId: string; email: string } | null> {
  const { rows } = await pool.query<{ id: string; email: string }>(
    `select u.id, u.email from identity.password_state s join identity."user" u on u.id = s.user_id
     where s.change_token_hash = $1 and s.change_token_expires_at > now() and s.kind = 'tam'
       and s.temp_expires_at > now() and s.disabled_at is null`,
    [maBam],
  );
  return rows[0] ? { userId: rows[0].id, email: rows[0].email } : null;
}

/**
 * Đặt mật khẩu lần đầu bằng mã đổi, trong một giao dịch: tiêu mã (một lời gọi thắng khi hai lời gọi song song), ghi băm,
 * mật khẩu tạm hết dùng, ghi sự kiện. False khi mã đã bị tiêu.
 */
export async function datLanDau(pool: pg.Pool, d: { userId: string; maBam: string; hash: string }): Promise<boolean> {
  const c = await pool.connect();
  try {
    await c.query("begin");
    const r = await c.query<{ issued_company_id: string | null }>(
      `update identity.password_state set kind = 'tu-dat', temp_expires_at = null, change_token_hash = null,
         change_token_expires_at = null, failed_streak = 0, updated_at = now()
       where user_id = $1 and change_token_hash = $2 and change_token_expires_at > now() and kind = 'tam'
         and temp_expires_at > now() and disabled_at is null
       returning issued_company_id`,
      [d.userId, d.maBam],
    );
    if (r.rowCount !== 1) {
      await c.query("rollback");
      return false;
    }
    await c.query(`update identity.account set "password" = $2, "updatedAt" = now() where "userId" = $1 and "providerId" = 'credential'`, [
      d.userId,
      d.hash,
    ]);
    await ghiSuKien(c, { userId: d.userId, kind: "dat-lan-dau", actorUserId: d.userId, companyId: r.rows[0]!.issued_company_id });
    await c.query("commit");
    return true;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** Người tự đặt hay đổi mật khẩu ở Cá nhân: gốc thành «tu-doi», gỡ vô hiệu, ghi sự kiện. */
export async function datTuDoi(pool: pg.Pool, d: { userId: string; hash: string }): Promise<void> {
  const c = await pool.connect();
  try {
    await c.query("begin");
    await c.query("select pg_advisory_xact_lock(hashtextextended('mat-khau:' || $1, 0))", [d.userId]);
    const a = await c.query(`update identity.account set "password" = $2, "updatedAt" = now() where "userId" = $1 and "providerId" = 'credential'`, [
      d.userId,
      d.hash,
    ]);
    if (a.rowCount === 0) {
      await c.query(
        `insert into identity.account ("id", "accountId", "providerId", "userId", "password", "updatedAt")
         values (gen_random_uuid()::text, $1, 'credential', $1, $2, now())`,
        [d.userId, d.hash],
      );
    }
    await c.query(
      `insert into identity.password_state (user_id, kind, origin, updated_at) values ($1, 'tu-dat', 'tu-doi', now())
       on conflict (user_id) do update set kind = 'tu-dat', origin = 'tu-doi', issued_company_id = null, temp_expires_at = null,
         change_token_hash = null, change_token_expires_at = null, failed_streak = 0, disabled_at = null,
         disabled_reason = null, updated_at = now()`,
      [d.userId],
    );
    await ghiSuKien(c, { userId: d.userId, kind: "doi", actorUserId: d.userId });
    await c.query("commit");
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** «Báo mất máy»: mật khẩu đang dùng được thôi dùng. */
export async function voHieuBaoMat(pool: pg.Pool, userId: string): Promise<void> {
  const r = await pool.query(
    `update identity.password_state set disabled_at = now(), disabled_reason = 'bao-mat-may', change_token_hash = null,
       change_token_expires_at = null, updated_at = now() where user_id = $1 and disabled_at is null`,
    [userId],
  );
  if (r.rowCount) await ghiSuKien(pool, { userId, kind: "vo-hieu-bao-mat", actorUserId: userId });
}

/** Thu mọi phiên của người, trừ phiên `giu` (mã phiên) nếu có. */
export async function thuPhien(pool: pg.Pool, userId: string, giu?: string): Promise<number> {
  const r = await pool.query(`delete from identity.session where "userId" = $1 and ($2::text is null or "token" <> $2)`, [userId, giu ?? null]);
  return r.rowCount ?? 0;
}
