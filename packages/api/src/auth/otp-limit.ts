import type pg from "pg";
import { OTP_REQUEST_LIMIT, OTP_REQUEST_WINDOW_MIN } from "./constants";

/**
 * Ghi một lần xin mã và cho biết còn được xin không. Đếm ở identity.otp_requests nên đúng cả khi chạy nhiều máy chủ.
 * Lần bị từ chối không ghi thêm dòng, để cửa sổ không tự kéo dài vô hạn.
 */
export async function allowOtpRequest(identityPool: pg.Pool, email: string): Promise<boolean> {
  const mail = email.trim().toLowerCase();
  const { rows } = await identityPool.query<{ n: string }>(
    "select count(*) as n from identity.otp_requests where email = $1 and at > now() - make_interval(mins => $2)",
    [mail, OTP_REQUEST_WINDOW_MIN],
  );
  if (Number(rows[0]?.n ?? 0) >= OTP_REQUEST_LIMIT) return false;
  await identityPool.query("insert into identity.otp_requests (email) values ($1)", [mail]);
  return true;
}
