// Số đo lõi và app.lead_board_metric cùng định nghĩa chuỗi gửi lại (hàng va-moc-goi-dau-lead-tra-lai, luật 37) — E5.
// Ba chủ nhà nạp qua API thật trên Postgres: x lên bảng thường; z trả lại, gửi lại thành z2 lên bảng; v trả lại hai lần,
// v3 lên bảng. Hàng lead đọc từ cơ sở dữ liệu thành LeadVao, chạy tinhSoDo của lõi và hàm SQL trên một khoảng chứa trọn
// mọi lần nhập và lên bảng, so từng chuỗi. Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import type { GiaTriSoDo, LeadVao } from "../../../core/src/metrics/kieu";
import { tinhSoDo } from "../../../core/src/metrics/so-do";
import { appPool, cleanup } from "../helpers";
import { hangTuLead, lenBang, maMoi, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : null);
const dongHoCsdl = async () => (await appPool.query("select clock_timestamp() as t")).rows[0].t as Date;

async function leadVe(san: San, so: string, can: string) {
  const l = await nhap(san, nam(so, "Toà A", can));
  await nhip(new Date(), san);
  return l.id;
}
const tra = async (san: San, id: string) => assert.equal((await send("POST", `/api/v1/leads/${id}/return`, undefined, san.nguoi.dc1!.cookie)).status, 200);
async function guiLai(san: San, id: string, so: string) {
  const r = await send("POST", `/api/v1/leads/${id}/resubmit`, { ownerPhone: so }, san.nguoi.ts!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const moi = ((await r.json()) as { id: string }).id;
  await nhip(new Date(), san);
  return moi;
}
const lenTuLead = async (san: San, id: string) => lenBang(san, "dc1", await hangTuLead(san, "dc1", id));

/** Hàng lead của sàn thành LeadVao — `board_at` từ app.lead_board_at_all, như hàm SQL đọc. */
async function docLead(san: San): Promise<LeadVao[]> {
  const { rows } = await appPool.query(
    `select l.id, l.created_at, l.unit_number, l.outcome, l.matched_agent_user_id, l.routed_at, l.accepted_at, l.first_called_at,
            l.returned_at, l.resubmitted_at, l.resubmitted_lead_id, l.discarded_at, b.board_at
     from leads l left join app.lead_board_at_all($1) b on b.lead_id = l.id
     where l.company_id = $1 order by l.created_at`,
    [san.companyId],
  );
  return rows.map((r) => ({
    id: r.id,
    createdAt: iso(r.created_at)!,
    unitNumber: r.unit_number,
    outcome: r.outcome,
    matchedAgentUserId: r.matched_agent_user_id,
    routedAt: iso(r.routed_at),
    acceptedAt: iso(r.accepted_at),
    firstCalledAt: iso(r.first_called_at),
    boardAt: iso(r.board_at),
    returnedAt: iso(r.returned_at),
    resubmittedAt: iso(r.resubmitted_at),
    resubmittedLeadId: r.resubmitted_lead_id,
    discardedAt: iso(r.discarded_at),
  }));
}

/** Số ngày lead → Sẵn sàng bán của lõi, theo thứ tự tăng. */
const ngayLoi = (lead: LeadVao[], tu: Date, den: Date) => {
  const d = tinhSoDo({ tu: tu.toISOString(), den: den.toISOString(), hang: [], lead, danhMuc: { subdivisions: [] } }).find((r) => r.ma === "lead_to_ready")!;
  return d as unknown as Extract<GiaTriSoDo, { kieu: "thoi-luong" }>;
};

test("số đo: lõi và lead_board_metric cùng định nghĩa chuỗi", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const tu = await dongHoCsdl();
  const x = await leadVe(s, soMoi(s), maMoi(s));
  const z = await leadVe(s, soMoi(s), maMoi(s));
  await tra(s, z);
  const z2 = await guiLai(s, z, soMoi(s));
  const v = await leadVe(s, soMoi(s), maMoi(s));
  await tra(s, v);
  const v2 = await guiLai(s, v, soMoi(s));
  await tra(s, v2);
  const v3 = await guiLai(s, v2, soMoi(s));
  for (const id of [x, z2, v3]) await lenTuLead(s, id);
  // Lùi lúc nhập của lead đầu mỗi chuỗi để số ngày khác 0 và khác nhau giữa các chuỗi.
  for (const [id, ngay] of [[x, 3], [z, 6], [v, 9]] as const) {
    await appPool.query("update leads set created_at = created_at - make_interval(days => $2) where id = $1", [id, ngay]);
  }
  const tuDo = new Date(tu.getTime() - 30 * 86_400_000);
  const den = new Date((await dongHoCsdl()).getTime() + 60_000);

  const lead = await docLead(s);
  const theoId = new Map(lead.map((l) => [l.id, l]));
  for (const id of [z, v, v2]) assert.ok(theoId.get(id)!.resubmittedLeadId, `mối nối chuỗi đọc từ cơ sở dữ liệu: ${id}`);

  const sql = (await appPool.query("select lead_id, days from app.lead_board_metric($1, $2, $3)", [s.companyId, tuDo, den])).rows as { lead_id: string; days: string }[];
  const loi = ngayLoi(lead, tuDo, den);

  assert.deepEqual(sql.map((r) => r.lead_id).sort(), [x, z2, v3].sort(), "SQL: lead cuối chuỗi");
  assert.equal(loi.n, 3, "lõi: mỗi chủ nhà một lần");
  assert.deepEqual(loi.giaTri, sql.map((r) => Number(r.days)).sort((a, b) => a - b), "cùng số ngày từng chuỗi");

  // Đối chứng: bỏ mối nối chuỗi thì lõi đếm cả lead đã gửi lại — đếm hai lần.
  const roiNoi = lead.map((l) => ({ ...l, resubmittedLeadId: null }));
  const hai = ngayLoi(roiNoi, tuDo, den);
  assert.equal(hai.n + hai.chua, 3 + 3, "đếm hai lần: ba lead đã gửi lại thành ba lead riêng");
  assert.notDeepEqual(hai.giaTri, loi.giaTri, "đếm hai lần: số ngày tính từ lead gửi lại");
});
