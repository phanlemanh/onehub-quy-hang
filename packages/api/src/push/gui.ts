import { PUSH_PAYLOAD_KEYS, PUSH_RETRY, type PushPayload } from "@quy-hang/core/push";
import type pg from "pg";
import webpush from "web-push";
import { withCompany } from "../db";
import { khoaSoChu } from "../owners/khoa";
import { khoaVapid, type KhoaVapid } from "./khoa-vapid";

/**
 * Gửi thông báo lead qua hộp thư đi (hàng 26, ADR-0025). Lối giao lead ghi dòng «cần báo» trong cùng giao dịch giao; sau
 * khi giao dịch ghi xong, lối ấy (và nhịp chia mỗi phút) nhận các dòng chờ của sàn rồi gửi. Lỗi gửi không bao giờ ném ra
 * lối giao: chỉ ghi lên dòng và đăng ký.
 */
export type PushTarget = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Kết quả một lần gửi tới dịch vụ đẩy: `status` là mã HTTP dịch vụ trả (vắng khi lỗi mạng). */
export type PushResult = { ok: true } | { ok: false; status?: number; error: string };

/** Bộ gửi đẩy — bơm vào ApiDeps; bản thật dùng `web-push`, bài kiểm dùng bộ gửi giả ghi lại. */
export type PushSender = (target: PushTarget, payload: PushPayload, vapid: KhoaVapid) => Promise<PushResult>;

/** Chủ thể VAPID: địa chỉ của app (`BETTER_AUTH_URL` đã có) — dịch vụ đẩy chỉ nhận https hay mailto. */
const chuThe = () => {
  const u = process.env.BETTER_AUTH_URL;
  return u?.startsWith("https://") ? u : "https://quyhang.onehub.center";
};

/** Hạn sống của thông báo ở dịch vụ đẩy: bằng khung gửi lại — quá hạn nhận lead thì thôi. */
const TTL_GIAY = PUSH_RETRY.windowMinutes * 60;

export const webPushSender: PushSender = async (target, payload, vapid) => {
  try {
    await webpush.sendNotification(target, JSON.stringify(payload), {
      TTL: TTL_GIAY,
      urgency: "high",
      vapidDetails: { subject: chuThe(), publicKey: vapid.publicKey, privateKey: vapid.privateKey },
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof webpush.WebPushError) return { ok: false, status: e.statusCode, error: `dịch vụ đẩy trả ${e.statusCode}` };
    return { ok: false, error: e instanceof Error ? e.message.slice(0, 200) : "lỗi gửi" };
  }
};

/** Dịch vụ đẩy trả 404 hay 410: đăng ký đã chết, xoá. Mã khác là lỗi tạm. */
export const dangKyChet = (r: PushResult) => !r.ok && (r.status === 404 || r.status === 410);

type DongCho = { id: string; payload: PushPayload; endpoint: string; p256dh: string; auth: string };

export type GuiKetQua = { sent: number; gone: number; failed: number };

/** Nội dung đúng bốn khoá theo thứ tự lõi khai — jsonb không giữ thứ tự khoá. */
const bonKhoa = (p: PushPayload): PushPayload => Object.fromEntries(PUSH_PAYLOAD_KEYS.map((k) => [k, p[k]])) as PushPayload;

/**
 * Gửi các dòng chờ của một sàn. Nhận dòng (giữ một phút) và khoá trong một giao dịch, gửi ngoài giao dịch, ghi kết quả
 * trong giao dịch sau. `lanDau`: lối giao chỉ gửi dòng chưa thử lần nào; nhịp chia gửi cả dòng lỗi tạm. Không ném: lỗi đọc
 * khoá hay cơ sở dữ liệu thì ghi nhật ký (không mang khoá, không nội dung) và trả 0.
 */
export async function guiHopThu(
  pool: pg.Pool,
  companyId: string,
  sender: PushSender,
  now: Date = new Date(),
  lanDau = false,
): Promise<GuiKetQua> {
  const kq: GuiKetQua = { sent: 0, gone: 0, failed: 0 };
  try {
    const ctx = { userId: "", companyId };
    const { dong, vapid } = await withCompany(pool, ctx, async (tx) => {
      const dong = (
        await tx.query<DongCho>("select id, payload, endpoint, p256dh, auth from app.push_outbox_claim($1, $2, $3, $4)", [
          now,
          PUSH_RETRY.maxAttempts,
          PUSH_RETRY.windowMinutes,
          lanDau,
        ])
      ).rows;
      return { dong, vapid: dong.length ? await khoaVapid(tx, khoaSoChu()) : null };
    });
    if (!dong.length || !vapid) return kq;
    const ketQua: [string, "sent" | "gone" | "failed", string | null][] = [];
    for (const d of dong) {
      const r = await sender({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, bonKhoa(d.payload), vapid).catch(
        (e): PushResult => ({ ok: false, error: e instanceof Error ? e.message.slice(0, 200) : "lỗi gửi" }),
      );
      const loai = r.ok ? "sent" : dangKyChet(r) ? "gone" : "failed";
      kq[loai]++;
      ketQua.push([d.id, loai, r.ok ? null : r.error]);
    }
    await withCompany(pool, ctx, async (tx) => {
      for (const [id, loai, loi] of ketQua) await tx.query("select app.push_outbox_mark($1, $2, $3)", [id, loai, loi]);
    });
  } catch (e) {
    console.error(`thông báo lead: sàn ${companyId} gửi lỗi`, e instanceof Error ? e.message.slice(0, 200) : "");
  }
  return kq;
}
