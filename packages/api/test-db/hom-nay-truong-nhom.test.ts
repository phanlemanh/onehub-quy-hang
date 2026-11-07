// Hôm nay trưởng nhóm — hai lối đọc của trưởng nhóm qua API trên Postgres thật (hàng 42: E1, E2, E3, E5). Người, khu và
// lead dựng qua lối API thật (mời, khu, nhập lead, nhịp chia, nhận, gọi, trả lại, giao lại). Hàng đợi tính hạn bằng đồng
// hồ cơ sở dữ liệu, nên bộ kiểm đặt mốc bằng cách lùi `routed_at` bằng kết nối chủ; đọc lại cột cũng bằng kết nối chủ.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { DEFAULT_LEAD_ROUTING } from "@quy-hang/core/routing";
import { createApi } from "../src/app";
import { runLeadTick } from "../src/jobs/lead-tick";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

// ---- Sàn thử ----
type Nguoi = { userId: string; cookie: string; email: string };
type San = { companyId: string; nguoi: Record<string, Nguoi>; khu: Record<string, string>; so: number };
let soSan = 0;
async function sanMoi(vaiCan: Record<string, { vai: string[]; khu?: string[] }>): Promise<San> {
  const nhan = `tn${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} truong-nhom ${nhan}]`, qtEmail);
  const san: San = {
    companyId: s.companyId,
    nguoi: { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}`, email: qtEmail } },
    khu: {},
    so: 10,
  };
  for (const [k, { vai }] of Object.entries(vaiCan)) {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    san.nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}`, email };
  }
  for (const [k, { khu }] of Object.entries(vaiCan)) {
    if (!khu?.length) continue;
    for (const t of khu) {
      if (san.khu[t]) continue;
      const r = await send("POST", "/api/v1/company/zones", { name: t }, san.nguoi.qt!.cookie);
      assert.equal(r.status, 201, await r.clone().text());
      san.khu[t] = ((await r.json()) as { id: string }).id;
    }
    const r = await send("PATCH", `/api/v1/company/members/${san.nguoi[k]!.userId}`, { zoneIds: khu.map((t) => san.khu[t]) }, san.nguoi.qt!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  }
  return san;
}

const nam = (so: string, toa: string, can?: string) => ({
  ownerPhone: so,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
/** Số mẫu chưa dùng trong sàn (0900 000 010 trở đi). */
const soMoi = (san: San) => `0900 000 0${san.so++}`;
async function nhap(san: San, body: unknown): Promise<{ id: string; outcome: string }> {
  const r = await send("POST", "/api/v1/leads", body, san.nguoi.ts!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; outcome: string };
}
const nhip = (san: San, now = new Date()) => runLeadTick(appPool, now, [san.companyId]);
const dong = async (id: string) =>
  (
    await appPool.query<{ matched_agent_user_id: string | null; routed_at: Date | null; reassign_count: number; accept_minutes: number }>(
      "select matched_agent_user_id, routed_at, reassign_count, accept_minutes from leads where id = $1",
      [id],
    )
  ).rows[0]!;
/** Người nhận hiện tại của lead, theo khoá trong sàn. */
const nguoiGiu = async (san: San, id: string) => {
  const u = (await dong(id)).matched_agent_user_id;
  const k = Object.entries(san.nguoi).find(([, n]) => n.userId === u)?.[0];
  assert.ok(k, `lead ${id} chưa về đầu chủ nào của sàn`);
  return k;
};
async function ghi(san: San, id: string, duoi: "accept" | "first-call" | "return") {
  const k = await nguoiGiu(san, id);
  const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
}
/** Lùi mốc giao của lead: mốc hạn = now() của cơ sở dữ liệu − `phut` phút. */
const luiMocGiao = (id: string, phut: number) =>
  appPool.query("update leads set routed_at = now() - make_interval(mins => $2) where id = $1", [id, phut]);

type DongHangDoi = { leadId: string; kind: string; buildingName: string; unitNumber: string | null; agentUserId: string | null; dueAt: string };
async function hangDoi(san: San, k = "tn"): Promise<{ status: number; text: string; items: DongHangDoi[] }> {
  const r = await send("GET", "/api/v1/team/lead-queue", undefined, san.nguoi[k]?.cookie ?? "");
  const text = await r.text();
  return { status: r.status, text, items: r.status === 200 ? (JSON.parse(text) as { items: DongHangDoi[] }).items : [] };
}
const KHOA_HANG_DOI = ["agentUserId", "buildingName", "dueAt", "kind", "leadId", "unitNumber"];
const KHOA_DAU_CHU = ["displayName", "onLeave", "openLeads", "userId"];
const ACCEPT = DEFAULT_LEAD_ROUTING.acceptMinutes;
const FIRST_CALL = DEFAULT_LEAD_ROUTING.firstCallMinutes;

// ---- E1, E2: ma trận bảy lead ----
let e1: San;
let e1Lead: Record<string, string> = {};
let e1SanKhac = "";

test("hàng đợi trưởng nhóm: đúng ba lead đang mở", async () => {
  e1 = await sanMoi({
    ts: { vai: ["telesales"] },
    tn: { vai: ["team_lead"] },
    dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
    dc2: { vai: ["listing_agent"], khu: ["Toà A"] },
  });
  const khac = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  // Ma trận viết trước: mỗi lead một tình trạng.
  const SO_MOI = "0900 000 099";
  const id: Record<string, string> = {};
  id.chuaChia = (await nhap(e1, nam(soMoi(e1), "Toà Không Ai"))).id;
  id.quaHanNhan = (await nhap(e1, nam(SO_MOI, "Toà A"))).id;
  id.quaHanGoi = (await nhap(e1, nam(soMoi(e1), "Toà A"))).id;
  id.trongHan = (await nhap(e1, nam(soMoi(e1), "Toà A"))).id;
  id.daGoi = (await nhap(e1, nam(soMoi(e1), "Toà A"))).id;
  id.traLai = (await nhap(e1, nam(soMoi(e1), "Toà A"))).id;
  const sanKhac = (await nhap(khac, nam(soMoi(khac), "Toà A"))).id;
  for (const o of Object.values(id)) assert.equal((await dong(o)).matched_agent_user_id, null);
  await nhip(e1);
  await nhip(khac);
  assert.equal((await dong(id.chuaChia)).matched_agent_user_id, null, "lead toà không ai phụ trách bị chia");
  for (const k of ["quaHanNhan", "quaHanGoi", "trongHan", "daGoi", "traLai"]) await nguoiGiu(e1, id[k]!);
  await ghi(e1, id.quaHanGoi!, "accept");
  await ghi(e1, id.daGoi!, "first-call");
  await ghi(e1, id.traLai!, "return");

  // Chiều đỏ: đồng hồ chưa qua hạn nào → chỉ lead chưa chia được.
  const truoc = await hangDoi(e1);
  assert.equal(truoc.status, 200, truoc.text);
  assert.deepEqual(truoc.items.map((d) => [d.leadId, d.kind]), [[id.chuaChia, "unrouted"]]);

  // Qua hạn: lùi mốc giao của mọi lead đã chia (kể cả đã gọi, đã trả lại, lead sàn khác) — trừ lead còn trong hạn.
  await luiMocGiao(id.quaHanNhan!, ACCEPT + 5); // hạn nhận qua 5 phút
  await luiMocGiao(id.quaHanGoi!, FIRST_CALL + 10); // hạn gọi qua 10 phút
  await luiMocGiao(id.trongHan!, ACCEPT - 5);
  await luiMocGiao(id.daGoi!, FIRST_CALL + 60);
  await luiMocGiao(id.traLai!, FIRST_CALL + 60);
  await luiMocGiao(sanKhac, FIRST_CALL + 60);

  const sau = await hangDoi(e1);
  assert.equal(sau.status, 200, sau.text);
  assert.deepEqual(
    sau.items.map((d) => [d.leadId, d.kind]),
    [
      [id.quaHanGoi, "first_call_overdue"],
      [id.quaHanNhan, "accept_overdue"],
      [id.chuaChia, "unrouted"],
    ],
  );
  for (const d of sau.items) assert.deepEqual(Object.keys(d).sort(), KHOA_HANG_DOI);
  const goiQuaHan = sau.items[0]!;
  assert.equal(goiQuaHan.agentUserId, (await dong(id.quaHanGoi!)).matched_agent_user_id);
  assert.equal(Date.parse(goiQuaHan.dueAt), (await dong(id.quaHanGoi!)).routed_at!.getTime() + FIRST_CALL * 60_000);
  assert.equal(sau.items[2]!.agentUserId, null);
  assert.ok(!sau.text.includes(sanKhac), "lead sàn khác vào hàng đợi");

  // Mồi: số và tên chủ nhà không có trong thân; đối chứng dương: đầu chủ giữ đọc được cả hai qua lối của họ.
  const dcGiu = await nguoiGiu(e1, id.quaHanNhan!);
  const hang = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: "A-09.09" }, e1.nguoi[dcGiu]!.cookie);
  assert.equal(hang.status, 201, await hang.clone().text());
  const hangId = ((await hang.json()) as { id: string }).id;
  const chu = await send("PUT", `/api/v1/listings/${hangId}/owner`, { ownerName: "[Tên]", ownerPhone: SO_MOI }, e1.nguoi[dcGiu]!.cookie);
  assert.equal(chu.status, 200, await chu.clone().text());
  const moSo = await send("POST", `/api/v1/leads/${id.quaHanNhan}/phone-reveal`, undefined, e1.nguoi[dcGiu]!.cookie);
  assert.equal(moSo.status, 200, await moSo.clone().text());
  const soMo = ((await moSo.json()) as { ownerPhone: string }).ownerPhone;
  assert.equal(soMo.replace(/\D/g, ""), SO_MOI.replace(/\D/g, ""), "đối chứng: đầu chủ giữ mở được số mồi của lead");
  const docChu = await (await send("GET", `/api/v1/listings/${hangId}/owner`, undefined, e1.nguoi[dcGiu]!.cookie)).text();
  assert.ok(docChu.includes("[Tên]"), "đối chứng: lối đọc chủ nhà trả tên mồi");
  const lai = await hangDoi(e1);
  for (const moi of [SO_MOI, SO_MOI.replace(/\D/g, ""), soMo, "[Tên]"]) assert.ok(!lai.text.includes(moi), `thân hàng đợi chứa mồi ${moi}`);

  e1Lead = id;
  e1SanKhac = sanKhac;
});

test("hàng đợi trưởng nhóm: vai khác không đọc", async () => {
  assert.ok(e1, "cần sàn của ca trước");
  const NGUOI_GOI: [string, number][] = [
    ["tn", 200],
    ["dc1", 403],
    ["ts", 403],
    ["qt", 403],
    ["khong-cookie", 401],
  ];
  const LOI = ["/api/v1/team/lead-queue", "/api/v1/team/listing-agents"];
  let soAssert = 0;
  for (const duong of LOI) {
    for (const [k, ma] of NGUOI_GOI) {
      const r = await send("GET", duong, undefined, e1.nguoi[k]?.cookie ?? "");
      const text = await r.text();
      assert.equal(r.status, ma, `${k} ${duong}: ${text}`);
      soAssert++;
      if (ma !== 200) {
        assert.deepEqual(Object.keys(JSON.parse(text) as object), ["error"]);
        for (const l of [...Object.values(e1Lead), e1SanKhac]) assert.ok(!text.includes(l), `${k} ${duong}: thân lỗi chứa leadId`);
      }
    }
  }
  assert.equal(soAssert, 10);
});

// ---- E3: đầu chủ để giao ----
test("đầu chủ để giao: tên, nghỉ, lead mở", async () => {
  const s = await sanMoi({
    ts: { vai: ["telesales"] },
    tn: { vai: ["team_lead"] },
    dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
    dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
    dc3: { vai: ["listing_agent"], khu: ["Toà C"] },
  });
  const khac = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  // Tên hiển thị: dc1, dc3 có tên; dc2 giữ tên mặc định của tài khoản mời (= email).
  await identityPool.query('update identity."user" set name = $2 where id = $1', [s.nguoi.dc1!.userId, "[Tên] một"]);
  await identityPool.query('update identity."user" set name = $2 where id = $1', [s.nguoi.dc3!.userId, "[Tên] ba"]);
  const nghi = await send("PUT", `/api/v1/company/members/${s.nguoi.dc3!.userId}/leave`, { onLeave: true }, s.nguoi.tn!.cookie);
  assert.equal(nghi.status, 200, await nghi.clone().text());
  // dc1 nhận hai lead đang mở; dc2 một lead đã gọi (không còn mở).
  const a1 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const a2 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const b1 = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhap(khac, nam(soMoi(khac), "Toà A"));
  await nhip(s);
  await nhip(khac);
  assert.deepEqual([await nguoiGiu(s, a1), await nguoiGiu(s, a2), await nguoiGiu(s, b1)], ["dc1", "dc1", "dc2"]);
  await ghi(s, b1, "first-call");

  const r = await send("GET", "/api/v1/team/listing-agents", undefined, s.nguoi.tn!.cookie);
  const text = await r.text();
  assert.equal(r.status, 200, text);
  const items = (JSON.parse(text) as { items: { userId: string; displayName: string; onLeave: boolean; openLeads: number }[] }).items;
  const u = (k: string) => s.nguoi[k]!.userId;
  assert.deepEqual(items.map((d) => d.userId).sort(), [u("dc1"), u("dc2"), u("dc3")].sort());
  for (const d of items) assert.deepEqual(Object.keys(d).sort(), KHOA_DAU_CHU);
  const theo = (k: string) => {
    const d = items.find((x) => x.userId === u(k))!;
    return { displayName: d.displayName, onLeave: d.onLeave, openLeads: d.openLeads };
  };
  assert.deepEqual(theo("dc1"), { displayName: "[Tên] một", onLeave: false, openLeads: 2 });
  assert.deepEqual(theo("dc2"), { displayName: s.nguoi.dc2!.email.split("@")[0], onLeave: false, openLeads: 0 });
  assert.deepEqual(theo("dc3"), { displayName: "[Tên] ba", onLeave: true, openLeads: 0 });
  // Chiều đỏ: telesales và đầu chủ sàn khác vắng; thân không chứa email nào.
  assert.ok(!items.some((d) => d.userId === u("ts")), "telesales có mặt");
  assert.ok(!items.some((d) => d.userId === khac.nguoi.dc1!.userId), "đầu chủ sàn khác có mặt");
  for (const n of [...Object.values(s.nguoi), ...Object.values(khac.nguoi)]) assert.ok(!text.includes(n.email), `thân chứa email ${n.email}`);
  assert.ok(!text.includes("@"));
});

// ---- E5: giao lại từ hàng đợi ----
test("giao lại từ hàng đợi: lead rời hàng đợi, cơ sở dữ liệu ghi người mới", async () => {
  const s = await sanMoi({
    ts: { vai: ["telesales"] },
    tn: { vai: ["team_lead"] },
    dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
    dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
  });
  const lead = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  // Lead căn trùng viết trước: căn A-04.06 đang có hàng mở của dc2.
  const hang = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: "A-04.06" }, s.nguoi.dc2!.cookie);
  assert.equal(hang.status, 201, await hang.clone().text());
  const canTrung = await nhap(s, nam(soMoi(s), "Toà A", "A-04.06"));
  assert.equal(canTrung.outcome, "unit_has_open_listing");
  await nhip(s);
  assert.equal(await nguoiGiu(s, lead), "dc1");
  await luiMocGiao(lead, ACCEPT + 5);
  const truoc = await hangDoi(s);
  assert.deepEqual(truoc.items.map((d) => [d.leadId, d.kind]), [[lead, "accept_overdue"]]);
  const dongTruoc = await dong(lead);

  const r = await send("POST", `/api/v1/leads/${lead}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const { deadlineFrom } = (await r.json()) as { deadlineFrom: string };
  const dongSau = await dong(lead);
  assert.equal(dongSau.matched_agent_user_id, s.nguoi.dc2!.userId);
  assert.equal(dongSau.reassign_count, dongTruoc.reassign_count + 1);
  assert.equal(dongSau.routed_at!.toISOString(), deadlineFrom);
  assert.ok(!(await hangDoi(s)).items.some((d) => d.leadId === lead), "lead còn ở hàng đợi ngay sau khi giao");

  // now = lúc giao + hạn nhận − 1 phút: vắng; now = lúc giao + hạn nhận: có lại, quá hạn nhận.
  await luiMocGiao(lead, dongSau.accept_minutes - 1);
  assert.ok(!(await hangDoi(s)).items.some((d) => d.leadId === lead), "lead vào hàng đợi trước hạn nhận mới");
  await luiMocGiao(lead, dongSau.accept_minutes);
  const lai = await hangDoi(s);
  assert.deepEqual(lai.items.map((d) => [d.leadId, d.kind, d.agentUserId]), [[lead, "accept_overdue", s.nguoi.dc2!.userId]]);

  // Lead căn trùng: 400 lead-not-assignable, người giữ không đổi.
  const giuTruoc = (await dong(canTrung.id)).matched_agent_user_id;
  const tu = await send("POST", `/api/v1/leads/${canTrung.id}/assign`, { agentUserId: s.nguoi.dc1!.userId }, s.nguoi.tn!.cookie);
  assert.deepEqual([tu.status, ((await tu.json()) as { error: string }).error], [400, "lead-not-assignable"]);
  assert.equal((await dong(canTrung.id)).matched_agent_user_id, giuTruoc);
});
