import {
  chooseAgent,
  dueAlerts,
  readLeadRoutingSettings,
  unroutedDue,
  type AlertKind,
  type RoutingCandidate,
  type RoutingStrategyKey,
} from "@quy-hang/core/routing";
import { PUSH_RETRY } from "@quy-hang/core/push";
import type pg from "pg";
import { withCompany } from "../db";
import { guiHopThu, webPushSender, type PushSender } from "../push/gui";
import { baoLeadVe, baoLoiBao } from "../push/store";

/**
 * Một nhịp chia lead và xét hạn (hàng 25, ADR-0017). Mỗi sàn có việc một giao dịch dưới ngữ cảnh sàn ấy (vai
 * `quy_hang_app`, luật theo dòng vẫn áp): đọc cấu hình, đóng dấu lead mới, chia theo dấu của từng lead, rồi ghi lời báo
 * đến hạn. Một sàn lỗi (cấu hình hỏng…) thì bỏ sàn ấy, các sàn khác vẫn chạy. `now` do bên gọi đưa để bộ kiểm đặt mốc.
 * Thông báo lead (hàng 26): lead chia về đầu chủ và lời báo mới ghi dòng «cần báo» trong giao dịch của sàn; sau khi giao
 * dịch ghi xong, nhịp gửi các dòng chờ của sàn — kể cả dòng lỗi tạm của lối giao khác, trong khung PUSH_RETRY.
 */
export type TickResult = { companies: number; routed: number; alerts: number; failed: number };

type HangCho = {
  lead_id: string;
  building_name: string;
  strategy: RoutingStrategyKey;
  owner_group: Buffer | null;
  prior_agent: string | null;
};
type UngVien = {
  user_id: string;
  roles: string[];
  zone_names: string[];
  on_leave: boolean;
  joined_at: Date;
  last_routed_seq: string | null;
  open_leads: number;
};
type DuKien = {
  lead_id: string;
  agent_user_id: string | null;
  deadline_from: Date;
  accept_minutes: number;
  first_call_minutes: number;
  accepted_at: Date | null;
  first_called_at: Date | null;
  strategy: RoutingStrategyKey;
  created_at: Date;
  raised: AlertKind[];
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

async function motSan(tx: pg.PoolClient, now: Date): Promise<{ routed: number; alerts: number }> {
  const cauHinh = readLeadRoutingSettings((await tx.query("select key, value from app.lead_routing_settings_rows()")).rows);
  await tx.query("select app.stamp_leads($1, $2, $3)", [cauHinh.strategy, cauHinh.acceptMinutes, cauHinh.firstCallMinutes]);

  const cho = (await tx.query<HangCho>("select * from app.lead_routing_queue()")).rows;
  const ungVien: RoutingCandidate[] = (await tx.query<UngVien>("select * from app.lead_routing_candidates()")).rows.map((u) => ({
    userId: u.user_id,
    roles: u.roles,
    zoneNames: u.zone_names,
    onLeave: u.on_leave,
    joinedAt: u.joined_at.toISOString(),
    lastRoutedSeq: u.last_routed_seq === null ? null : Number(u.last_routed_seq),
    openLeads: u.open_leads,
  }));
  // Thứ tự trong nhịp: người vừa nhận thành người được chia gần nhất; lead cùng số trong nhịp về cùng người.
  let seq = Math.max(0, ...ungVien.map((u) => u.lastRoutedSeq ?? 0));
  const cungSo = new Map<string, string>();
  let routed = 0;
  for (const l of cho) {
    const nhom = l.owner_group?.toString("hex");
    const prior = (nhom && cungSo.get(nhom)) || l.prior_agent;
    const chon = chooseAgent({ buildingName: l.building_name, priorAgentUserId: prior }, ungVien, l.strategy);
    if (!chon.userId) continue;
    const ok = (await tx.query<{ v: boolean }>("select app.route_lead($1, $2, $3) v", [l.lead_id, chon.userId, now])).rows[0]?.v;
    if (!ok) continue;
    routed++;
    await baoLeadVe(tx, l.lead_id, chon.userId, now);
    const u = ungVien.find((x) => x.userId === chon.userId);
    if (u) {
      u.lastRoutedSeq = ++seq;
      u.openLeads++;
    }
    if (nhom) cungSo.set(nhom, chon.userId);
  }

  let alerts = 0;
  const bao = async (lead: string, kind: AlertKind, tu: Date) => {
    const r = await tx.query<{ v: boolean }>("select app.raise_lead_alert($1, $2, $3, $4) v", [lead, kind, tu, now]);
    if (!r.rows[0]?.v) return;
    alerts++;
    await baoLoiBao(tx, lead, kind, now);
  };
  for (const f of (await tx.query<DuKien>("select * from app.lead_deadline_facts()")).rows) {
    if (f.agent_user_id === null) {
      const den = !f.raised.includes("unrouted") &&
        unroutedDue({ strategy: f.strategy, createdAt: f.created_at.toISOString(), acceptMinutes: f.accept_minutes }, now);
      if (den) await bao(f.lead_id, "unrouted", f.deadline_from);
      continue;
    }
    const den = dueAlerts(
      {
        leadId: f.lead_id,
        deadlineFrom: f.deadline_from.toISOString(),
        acceptMinutes: f.accept_minutes,
        firstCallMinutes: f.first_call_minutes,
        acceptedAt: iso(f.accepted_at),
        firstCalledAt: iso(f.first_called_at),
        raised: f.raised,
      },
      now,
    );
    for (const k of den) await bao(f.lead_id, k, f.deadline_from);
  }
  return { routed, alerts };
}

/** `only`: chỉ chạy các sàn này (bộ kiểm dùng để không chạm sàn của bộ kiểm khác đang chạy song song). */
export async function runLeadTick(
  pool: pg.Pool,
  now: Date,
  only?: readonly string[],
  sender: PushSender = webPushSender,
): Promise<TickResult> {
  const kq: TickResult = { companies: 0, routed: 0, alerts: 0, failed: 0 };
  const sanCoViec = (
    await withCompany(pool, { userId: "", companyId: null }, async (tx) =>
      (await tx.query<{ company_id: string }>("select company_id from app.lead_job_companies()")).rows.map((r) => r.company_id),
    )
  ).filter((id) => !only || only.includes(id));
  // Sàn chỉ còn dòng chờ gửi lại (không còn lead cần chia hay xét hạn).
  const sanChoGui = (
    await withCompany(pool, { userId: "", companyId: null }, async (tx) =>
      (await tx.query<{ company_id: string }>("select company_id from app.push_job_companies($1, $2, $3)", [
        now,
        PUSH_RETRY.maxAttempts,
        PUSH_RETRY.windowMinutes,
      ])).rows.map((r) => r.company_id),
    )
  ).filter((id) => (!only || only.includes(id)) && !sanCoViec.includes(id));
  for (const companyId of sanCoViec) {
    try {
      const r = await withCompany(pool, { userId: "", companyId }, (tx) => motSan(tx, now));
      kq.companies++;
      kq.routed += r.routed;
      kq.alerts += r.alerts;
    } catch (e) {
      kq.failed++;
      console.error(`nhịp chia lead: sàn ${companyId} lỗi`, e instanceof Error ? e.message : e);
    }
    await guiHopThu(pool, companyId, sender, now);
  }
  for (const companyId of sanChoGui) await guiHopThu(pool, companyId, sender, now);
  return kq;
}
