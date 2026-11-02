import { noiDungLead, noiDungLoiBao } from "@quy-hang/core/push";
import type { Need } from "@quy-hang/core/dedupe";
import type { AlertKind } from "@quy-hang/core/routing";
import type pg from "pg";

/**
 * Ghi của thông báo lead trên client do withCompany trao (hàng 26). Đăng ký là của chính người gọi trong sàn đang làm
 * (luật theo dòng); dòng «cần báo» ghi qua hàm security definer trong cùng giao dịch giao lead.
 */
export type DangKyVao = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Lưu đăng ký của thiết bị; cùng thiết bị bật lại thì cập nhật khoá, không thêm dòng. `moi`: dòng mới hay đã có. */
export async function luuDangKy(tx: pg.PoolClient, d: DangKyVao): Promise<{ moi: boolean }> {
  const { rows } = await tx.query<{ moi: boolean }>(
    `insert into push_subscriptions (company_id, user_id, endpoint, p256dh, auth)
     values (app.current_company_id(), app.current_user_id(), $1, $2, $3)
     on conflict on constraint push_subscriptions_once
       do update set p256dh = excluded.p256dh, auth = excluded.auth, failed_at = null, last_error = null
     returning (xmax = 0) moi`,
    [d.endpoint, d.keys.p256dh, d.keys.auth],
  );
  return { moi: rows[0]!.moi };
}

/** Gỡ đăng ký của thiết bị (endpoint) của chính người gọi trong sàn đang làm. Trả số dòng đã gỡ. */
export async function goDangKy(tx: pg.PoolClient, endpoint: string): Promise<number> {
  return (await tx.query("delete from push_subscriptions where endpoint = $1", [endpoint])).rowCount ?? 0;
}

/** Lead vừa về đầu chủ: một dòng «cần báo» cho mỗi đăng ký của người ấy. `now`: mốc của nhịp chia (vắng = giờ máy chủ). */
export async function baoLeadVe(tx: pg.PoolClient, leadId: string, agentUserId: string, now?: Date): Promise<number> {
  const lead = (await tx.query<{ building_name: string; need: Need }>("select * from app.push_lead_brief($1)", [leadId])).rows[0];
  if (!lead) return 0;
  const noiDung = noiDungLead({ leadId, buildingName: lead.building_name, need: lead.need });
  return (await tx.query<{ n: number }>("select app.push_outbox_add($1, $2, coalesce($3, now())) n", [agentUserId, noiDung, now ?? null]))
    .rows[0]!.n;
}

/** Nhịp chia vừa ghi một lời báo mới: một dòng «cần báo» cho mỗi đăng ký của mỗi trưởng nhóm của sàn. */
export async function baoLoiBao(tx: pg.PoolClient, leadId: string, kind: AlertKind, now?: Date): Promise<number> {
  const lead = (await tx.query<{ building_name: string }>("select building_name from app.push_lead_brief($1)", [leadId])).rows[0];
  if (!lead) return 0;
  const noiDung = noiDungLoiBao({ leadId, kind, buildingName: lead.building_name });
  return (await tx.query<{ n: number }>("select app.push_outbox_add_role('team_lead', $1, coalesce($2, now())) n", [noiDung, now ?? null]))
    .rows[0]!.n;
}
