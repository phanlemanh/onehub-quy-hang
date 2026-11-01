// Lead bốn nấc qua API trên Postgres thật (hàng 27: AC-2..AC-9, AC-12, ADR-0020). Người và lead lấy từ bộ mẫu của hàng 5;
// hàng và chủ nhà qua đường ghi thật; đồng hồ của nhịp do bộ kiểm truyền. Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { MY_LEAD_VIEW_KEYS } from "@quy-hang/core/dedupe";
import pg from "pg";
import { appPool, cleanup } from "./helpers";
import {
  ai,
  baoCua,
  demLead,
  docHam,
  dong,
  hangCoChu,
  hangTuLead,
  leadMau,
  lenBang,
  nam,
  nhap,
  nhip,
  sanMoi,
  sau,
  send,
  soMoi,
  TOA_MAU,
  type San,
} from "./san-thu";

after(cleanup);

type View = Record<string, unknown> & { id: string; stage: string; agentName: string | null };
const ds = async (san: San, k = "ts") => {
  const r = await send("GET", "/api/v1/leads", undefined, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as View[];
};
const tim = async (san: San, id: string, k = "ts") => (await ds(san, k)).find((v) => v.id === id)!;
const tra = (san: San, id: string, k: string) => send("POST", `/api/v1/leads/${id}/return`, undefined, san.nguoi[k]?.cookie ?? "");
const guiLai = (san: San, id: string, body: unknown, k = "ts") => send("POST", `/api/v1/leads/${id}/resubmit`, body, san.nguoi[k]?.cookie ?? "");
const ghi = async (san: San, id: string, duoi: "accept" | "first-call", k: string) => {
  const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
};
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
/** Lead đã về đầu chủ: nhập rồi chạy một nhịp. */
async function leadVe(san: San, so: string, toa = "Toà A", can?: string) {
  const l = await nhap(san, nam(so, toa, can));
  await nhip(new Date(), san);
  return l.id;
}

const MOT = { ts: { vai: ["telesales"] }, tn: { vai: ["team_lead"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà B"] } };
const HAI = { ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } };

// ---- AC-2 ----
test("lead của tôi: chỉ lead mình nhập, mới nhất trước", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, ts2: { vai: ["telesales"] }, tn: { vai: ["team_lead"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const cua1: string[] = [];
  for (let i = 0; i < 3; i++) cua1.push((await nhap(s, nam(soMoi(s), "Toà A"))).id);
  const cua2 = (await nhap(s, nam(soMoi(s), "Toà A"), "ts2")).id;
  const v1 = await ds(s);
  assert.deepEqual(v1.map((v) => v.id), [...cua1].reverse(), `telesales 1 thấy ${v1.length} dòng`);
  assert.deepEqual((await ds(s, "ts2")).map((v) => v.id), [cua2]);
  // Trưởng nhóm đọc được mọi lead của sàn theo luật đọc của bảng — lối này vẫn chỉ trả lead chính người ấy nhập.
  const vTn = await ds(s, "tn");
  assert.deepEqual(vTn.map((v) => v.id), [], `trưởng nhóm thấy ${vTn.length} dòng`);
  for (const v of v1) {
    assert.deepEqual(Object.keys(v), [...MY_LEAD_VIEW_KEYS]);
    for (const k of ["ownerPhone", "owner_phone", "matchedListingId"]) assert.ok(!(k in v), k);
  }
});

test("lead của tôi: chưa đăng nhập", async () => {
  assert.equal((await send("GET", "/api/v1/leads")).status, 401);
});

test("lead của tôi: chưa nhập lead nào", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] } });
  const r = await send("GET", "/api/v1/leads", undefined, s.nguoi.ts!.cookie);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), []);
});

// ---- AC-3 ----
test("lead của tôi: bốn nấc đi qua đời lead thật", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const l04 = leadMau("L-04");
  const toa = TOA_MAU[l04.toa]!;
  const id = (await nhap(s, nam(l04.soDienThoai, toa))).id;
  const buoc = async () => {
    const v = await tim(s, id);
    const d = await dong(id);
    return { v, d };
  };
  const ten = s.nguoi.dc1!.ten;
  // [bước, nấc, chờ chia, tên đầu chủ]
  const BANG: [string, string, boolean, string | null][] = [
    ["sau nhập", "sent", true, null],
    ["sau nhịp chia", "sent", false, ten],
    ["sau nhận", "accepted", false, ten],
    ["sau first-call", "called", false, ten],
    ["sau tạo hàng, chưa Active", "called", false, ten],
    ["sau Active", "on_board", false, ten],
  ];
  const t = new Date();
  let hang = "";
  let moc: Date | null = null;
  let so = 0;
  for (const [ten_, nac, cho, dauChu] of BANG) {
    if (ten_ === "sau nhịp chia") await nhip(t, s);
    if (ten_ === "sau nhận") await ghi(s, id, "accept", "dc1");
    if (ten_ === "sau first-call") await ghi(s, id, "first-call", "dc1");
    if (ten_ === "sau tạo hàng, chưa Active") hang = await hangTuLead(s, "dc1", id);
    if (ten_ === "sau Active") moc = await lenBang(s, "dc1", hang);
    const { v, d } = await buoc();
    assert.deepEqual([v.stage, v.awaitingRouting, v.agentName], [nac, cho, dauChu], ten_);
    assert.deepEqual(
      [v.createdAt, v.routedAt, v.acceptedAt, v.firstCalledAt, v.boardAt],
      [iso(d.created_at), iso(d.routed_at), iso(d.accepted_at), iso(d.first_called_at), iso(moc)],
      `${ten_}: mốc`,
    );
    so++;
  }
  assert.equal(so, BANG.length);
  assert.equal((await tim(s, id)).routedAt, t.toISOString());
});

// ---- AC-4 ----
test("trả lại: chỉ đầu chủ của lead, khi chưa lên bảng", async () => {
  const s = await sanMoi(MOT);
  const chuaGoi = await leadVe(s, soMoi(s));
  const daGoi = await leadVe(s, soMoi(s));
  await ghi(s, daGoi, "first-call", "dc1");
  const soLen = soMoi(s);
  const daLen = await leadVe(s, soLen);
  await lenBang(s, "dc1", await hangTuLead(s, "dc1", daLen));
  await hangCoChu(s, "dc1", "A-07.07", soMoi(s)); // căn có hàng mở cho dòng «lead căn trùng»
  const khac = await leadVe(s, soMoi(s));
  const canTrung = (await nhap(s, nam(soMoi(s), "Toà A", "A-07.07"))).id;
  assert.equal((await dong(canTrung)).outcome, "unit_has_open_listing");
  for (const id of [chuaGoi, daGoi, daLen, khac]) assert.equal(ai(s, (await dong(id)).matched_agent_user_id), "dc1");
  // [dòng, lead, người gọi, mã HTTP, mã lỗi]
  const BANG: [string, string, string, number, string | null][] = [
    ["đầu chủ, chưa gọi", chuaGoi, "dc1", 200, null],
    ["đầu chủ, lần hai", chuaGoi, "dc1", 409, "already-returned"],
    ["đầu chủ, đã gọi chưa lên bảng", daGoi, "dc1", 200, null],
    ["đầu chủ, đã lên bảng", daLen, "dc1", 409, "already-on-board"],
    ["đầu chủ khác", khac, "dc2", 404, "not-found"],
    ["trưởng nhóm", khac, "tn", 404, "not-found"],
    ["telesales người nhập", khac, "ts", 404, "not-found"],
    ["lead căn trùng", canTrung, "dc1", 404, "not-found"],
    ["không cookie", khac, "khach", 401, "unauthenticated"],
  ];
  let so = 0;
  for (const [ten, id, k, ma, loi] of BANG) {
    const r = await tra(s, id, k);
    const than = (await r.json()) as { error?: string; stage?: string };
    assert.deepEqual([r.status, than.error ?? null], [ma, loi], `dòng «${ten}»`);
    if (ma === 200) assert.equal(than.stage, "returned", ten);
    so++;
  }
  assert.equal(so, BANG.length);
  for (const id of [chuaGoi, daGoi]) {
    const d = await dong(id);
    assert.ok(d.returned_at instanceof Date);
    assert.equal(ai(s, d.returned_by), "dc1");
    const v = await tim(s, id);
    assert.deepEqual([v.stage, v.returnReason], ["returned", "Số không liên lạc được"]);
  }
  for (const id of [daLen, khac]) assert.equal((await dong(id)).returned_at, null);
});

// ---- AC-5 ----
test("trả lại: lead rời việc của đầu chủ", async () => {
  const s = await sanMoi(MOT);
  const x = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const y = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  const moCua = async () =>
    (await docHam<{ open_leads: number }>(s, "select open_leads from app.lead_routing_candidates() where user_id = $1", [s.nguoi.dc1!.userId]))[0]!.open_leads;
  assert.equal(await moCua(), 2);
  assert.equal((await tra(s, x, "dc1")).status, 200);
  assert.equal(await moCua(), 1, "lead trả lại vẫn là lead đang mở");
  await nhip(sau(t, 15), s);
  await nhip(sau(t, 30), s);
  assert.deepEqual(await baoCua(x), [], "lead trả lại bị báo quá hạn");
  assert.deepEqual(await baoCua(y), ["accept_overdue", "first_call_overdue"], "đối chứng không có lời báo");
  const d = await dong(x);
  assert.deepEqual([ai(s, d.matched_agent_user_id), iso(d.routed_at)], ["dc1", t.toISOString()], "lead trả lại về hàng chờ");
});

test("trả lại: số đã trả không neo chủ nhà", async () => {
  const s = await sanMoi(MOT);
  const soTra = soMoi(s);
  const soGiu = soMoi(s);
  const p = await leadVe(s, soTra);
  await leadVe(s, soGiu);
  assert.equal((await tra(s, p, "dc1")).status, 200);
  const moi = await nhap(s, nam(soTra, "Toà B"));
  assert.equal(moi.outcome, "new", "số đã trả lại vẫn neo chủ nhà cho đầu chủ cũ");
  const doi = await nhap(s, nam(soGiu, "Toà B"));
  assert.equal(doi.outcome, "owner_has_agent", "đối chứng: số chưa trả lại không ra chủ trùng");
  assert.equal(ai(s, (await dong(doi.id)).matched_agent_user_id), "dc1");
});

test("trả lại: nhịp chia không trả lead cùng số về đầu chủ đã trả", async () => {
  const chay = async (traLai: boolean) => {
    const s = await sanMoi(HAI);
    const so = soMoi(s);
    const p = await leadVe(s, so);
    const nguoiP = ai(s, (await dong(p)).matched_agent_user_id)!;
    const conLai = nguoiP === "dc1" ? "dc2" : "dc1";
    if (traLai) assert.equal((await tra(s, p, nguoiP)).status, 200);
    const r = await nhap(s, nam(so, "Toà A"));
    await nhip(new Date(), s);
    return { nguoiP, conLai, nhan: ai(s, (await dong(r.id)).matched_agent_user_id) };
  };
  const a = await chay(true);
  assert.deepEqual(a.nhan, a.conLai, `lead cùng số về ${a.nhan}, đầu chủ đã trả là ${a.nguoiP}`);
  const b = await chay(false);
  assert.deepEqual(b.nhan, b.nguoiP, "đối chứng: lead cùng số không về đầu chủ đang giữ");
});

test("trả lại: lead chủ trùng không sinh lời báo", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  await hangCoChu(s, "dc1", "A-05.05", so);
  const q = await nhap(s, nam(so, "Toà B"));
  assert.equal(q.outcome, "owner_has_agent");
  const c = (await dong(q.id)).created_at as Date;
  assert.equal((await tra(s, q.id, "dc1")).status, 200);
  for (const p of [0, 15, 30, 31]) await nhip(sau(c, p), s);
  assert.deepEqual(await baoCua(q.id), []);
});

// ---- AC-6 ----
test("gửi lại: lead mới chép các mục, kiểm trùng như lead mới", async () => {
  const s = await sanMoi(MOT);
  const cu = await leadVe(s, soMoi(s), "Toà A", "A-03.03");
  assert.equal((await tra(s, cu, "dc1")).status, 200);
  const r = await guiLai(s, cu, { ownerPhone: soMoi(s) });
  assert.equal(r.status, 201, await r.clone().text());
  const v = (await r.json()) as View;
  assert.deepEqual(Object.keys(v), [...MY_LEAD_VIEW_KEYS]);
  assert.deepEqual([v.outcome, v.stage], ["new", "sent"]);
  const a = await dong(cu);
  const b = await dong(v.id);
  const MUC = ["building_name", "unit_number", "need", "list_price", "fee_inclusion", "desired_listing_time"] as const;
  assert.deepEqual(Object.fromEntries(MUC.map((k) => [k, b[k]])), Object.fromEntries(MUC.map((k) => [k, a[k]])));
  assert.notDeepEqual(b.owner_phone_hash, a.owner_phone_hash);
  assert.equal(a.resubmitted_lead_id, v.id);
  assert.ok(a.resubmitted_at instanceof Date);
  const list = await ds(s);
  assert.equal(list[0]!.id, v.id, "lead mới không đứng đầu");
  const cuV = list.find((x) => x.id === cu)!;
  assert.deepEqual([cuV.stage, cuV.resubmittedLeadId], ["resubmitted", v.id]);
});

test("gửi lại: số mới vẫn qua kiểm trùng", async () => {
  const s = await sanMoi(MOT);
  // [dòng, chuẩn bị → số mới, outcome, nấc, tên đầu chủ]
  const soCuaDc2 = soMoi(s);
  await leadVe(s, soCuaDc2, "Toà B");
  const BANG: [string, () => Promise<{ cu: string; so: string }>, string, string, string | null][] = [
    [
      "số của chủ nhà đầu chủ 2 đang giữ",
      async () => ({ cu: await leadVe(s, soMoi(s)), so: soCuaDc2 }),
      "owner_has_agent",
      "sent",
      s.nguoi.dc2!.ten,
    ],
    [
      "căn đã có hàng mở từ sau khi nhập lead cũ",
      async () => {
        const cu = await leadVe(s, soMoi(s), "Toà A", "A-04.04");
        await hangCoChu(s, "dc1", "A-04.04", soMoi(s));
        return { cu, so: soMoi(s) };
      },
      "unit_has_open_listing",
      "supplement",
      s.nguoi.dc1!.ten,
    ],
  ];
  let so = 0;
  for (const [ten, chuan, outcome, nac, dauChu] of BANG) {
    const { cu, so: soMoiCua } = await chuan();
    assert.equal((await tra(s, cu, "dc1")).status, 200, ten);
    const r = await guiLai(s, cu, { ownerPhone: soMoiCua });
    assert.equal(r.status, 201, ten);
    const v = (await r.json()) as View;
    assert.deepEqual([v.outcome, v.stage, v.agentName], [outcome, nac, dauChu], `dòng «${ten}»`);
    await nhip(new Date(), s);
    if (outcome === "owner_has_agent") assert.equal((await dong(v.id)).routed_at, null, "nhịp chia lại lead chủ trùng");
    so++;
  }
  assert.equal(so, BANG.length);
});

test("gửi lại: các ca từ chối", async () => {
  const s = await sanMoi({ ...MOT, ts2: { vai: ["telesales"] } });
  const daTra = await leadVe(s, soMoi(s));
  assert.equal((await tra(s, daTra, "dc1")).status, 200);
  const chuaTra = await leadVe(s, soMoi(s));
  const daGui = await leadVe(s, soMoi(s));
  assert.equal((await tra(s, daGui, "dc1")).status, 200);
  assert.equal((await guiLai(s, daGui, { ownerPhone: soMoi(s) })).status, 201);
  // [dòng, lead, thân, người gọi, mã HTTP, mã lỗi]
  const BANG: [string, string, unknown, string, number, string][] = [
    ["số sai định dạng", daTra, { ownerPhone: "0900 12" }, "ts", 400, "invalid-payload"],
    ["khoá lạ", daTra, { ownerPhone: soMoi(s), buildingName: "Toà B" }, "ts", 400, "invalid-payload"],
    ["lead chưa trả lại", chuaTra, { ownerPhone: soMoi(s) }, "ts", 409, "not-returned"],
    ["gửi lại lần hai", daGui, { ownerPhone: soMoi(s) }, "ts", 409, "already-resubmitted"],
    ["đầu chủ", daTra, { ownerPhone: soMoi(s) }, "dc1", 404, "not-found"],
    ["telesales khác", daTra, { ownerPhone: soMoi(s) }, "ts2", 404, "not-found"],
    ["không cookie", daTra, { ownerPhone: soMoi(s) }, "khach", 401, "unauthenticated"],
  ];
  let so = 0;
  for (const [ten, id, than, k, ma, loi] of BANG) {
    const truoc = await demLead(s);
    const r = await guiLai(s, id, than, k);
    assert.deepEqual([r.status, ((await r.json()) as { error: string }).error], [ma, loi], `dòng «${ten}»`);
    assert.equal(await demLead(s), truoc, `dòng «${ten}»: tạo lead mới`);
    so++;
  }
  assert.equal(so, BANG.length);
  assert.equal((await dong(daTra)).resubmitted_at, null);
});

test("gửi lại: hai lần cùng lúc", async () => {
  const s = await sanMoi(MOT);
  const cu = await leadVe(s, soMoi(s));
  assert.equal((await tra(s, cu, "dc1")).status, 200);
  const truoc = await demLead(s);
  const [a, b] = await Promise.all([guiLai(s, cu, { ownerPhone: soMoi(s) }), guiLai(s, cu, { ownerPhone: soMoi(s) })]);
  const kq = [
    [a.status, ((await a.json()) as { error?: string }).error ?? null],
    [b.status, ((await b.json()) as { error?: string }).error ?? null],
  ].sort((x, y) => Number(x[0]) - Number(y[0]));
  assert.deepEqual(kq, [
    [201, null],
    [409, "already-resubmitted"],
  ]);
  assert.equal(await demLead(s), truoc + 1);
});

// ---- AC-7 ----
test("gửi lại: lead mới đi như lead mới", async () => {
  const s = await sanMoi(HAI);
  const cu = await leadVe(s, soMoi(s));
  const nguoiCu = ai(s, (await dong(cu)).matched_agent_user_id)!;
  assert.equal((await tra(s, cu, nguoiCu)).status, 200);
  const r = await guiLai(s, cu, { ownerPhone: soMoi(s) });
  const v = (await r.json()) as View;
  assert.equal(v.outcome, "new");
  const t = sau(new Date(), 1);
  await nhip(t, s);
  const d = await dong(v.id);
  assert.deepEqual([ai(s, d.matched_agent_user_id), iso(d.routed_at)], [nguoiCu === "dc1" ? "dc2" : "dc1", t.toISOString()]);
  await nhip(sau(t, 15), s);
  assert.deepEqual(await baoCua(v.id), ["accept_overdue"]);
});

test("gửi lại: chính số cũ", async () => {
  const s = await sanMoi(HAI);
  const so = soMoi(s);
  const cu = await leadVe(s, so);
  const nguoiCu = ai(s, (await dong(cu)).matched_agent_user_id)!;
  assert.equal((await tra(s, cu, nguoiCu)).status, 200);
  const r = await guiLai(s, cu, { ownerPhone: so });
  assert.equal(r.status, 201);
  const v = (await r.json()) as View;
  assert.equal(v.outcome, "new");
  await nhip(new Date(), s);
  assert.notEqual(ai(s, (await dong(v.id)).matched_agent_user_id), nguoiCu, "lead gửi lại về đầu chủ đã trả");
});

// ---- AC-8 ----
test("lên bảng: bảng hàng viết trước", async () => {
  // [dòng, dựng hàng (trước hay sau lúc nhập lead), lên bảng?]
  const BANG: [string, string, boolean][] = [
    ["(a) đầu chủ của lead, cùng số, Active sau lúc nhập", "a", true],
    ["(b) đầu chủ khác, cùng số, Active sau lúc nhập", "b", false],
    ["(c) đầu chủ của lead, cùng số, Active trước lúc nhập", "c", false],
    ["(d) đầu chủ của lead, cùng số, còn Incomplete", "d", false],
    ["(e) đầu chủ của lead, số khác, Active sau lúc nhập", "e", false],
  ];
  let so = 0;
  for (const [ten, ca, mong] of BANG) {
    const s = await sanMoi(MOT);
    const S = soMoi(s);
    let moc: Date | null = null;
    if (ca === "c") moc = await lenBang(s, "dc1", await hangCoChu(s, "dc1", "A-01.01", S));
    const id = await leadVe(s, S);
    assert.equal(ai(s, (await dong(id)).matched_agent_user_id), "dc1", ten);
    if (ca === "a") moc = await lenBang(s, "dc1", await hangTuLead(s, "dc1", id));
    if (ca === "b") moc = await lenBang(s, "dc2", await hangCoChu(s, "dc2", "A-01.01", S));
    if (ca === "d") await hangTuLead(s, "dc1", id);
    if (ca === "e") moc = await lenBang(s, "dc1", await hangCoChu(s, "dc1", "A-01.01", soMoi(s)));
    const v = await tim(s, id);
    assert.deepEqual(v.boardAt !== null, mong, `dòng «${ten}»`);
    if (mong) assert.equal(v.boardAt, iso(moc), `dòng «${ten}»: mốc`);
    so++;
  }
  assert.equal(so, 5);
});

// ---- AC-9 ----
test("cách ly: người của B không chạm lead của A", async () => {
  const a = await sanMoi(MOT);
  const b = await sanMoi(MOT);
  const p = await leadVe(a, soMoi(a));
  const q = await leadVe(a, soMoi(a));
  assert.equal((await tra(a, p, "dc1")).status, 200);
  await leadVe(b, soMoi(b));
  const cuaA = (await ds(a)).map((v) => v.id);
  assert.ok(cuaA.length >= 2);
  assert.deepEqual((await ds(b)).map((v) => v.id).filter((id) => cuaA.includes(id)), []);
  const truoc = [await dong(p), await dong(q)];
  assert.equal((await tra(b, q, "dc1")).status, 404);
  assert.equal((await guiLai(b, p, { ownerPhone: soMoi(b) })).status, 404);
  assert.deepEqual([await dong(p), await dong(q)], truoc);
});

/** Máy dò số chủ: bỏ mọi ký tự không phải chữ số rồi tìm chín chữ số cuối của từng số; khoá cấm. */
function doSo(than: string, so: string[]): number {
  const chu = than.replace(/\D/g, "");
  let n = so.filter((x) => chu.includes(x.replace(/\D/g, "").slice(-9))).length;
  for (const k of ["matchedListingId", "listingId", "ownerPhone", "owner_phone"]) if (than.includes(`"${k}"`)) n++;
  return n;
}

test("rò: không số chủ", async () => {
  assert.equal(doSo("+84 900 000 012", ["0900 000 012"]) + doSo(JSON.stringify({ ownerPhone: "x" }), []), 2, "đối chứng dương");
  const s = await sanMoi(MOT);
  const so = [soMoi(s), soMoi(s), soMoi(s)];
  const cu = await leadVe(s, so[0]!);
  await hangCoChu(s, "dc1", "A-08.08", so[1]!);
  const thanTra = await (await tra(s, cu, "dc1")).text();
  const thanGui = await (await guiLai(s, cu, { ownerPhone: so[2] })).text();
  const thanDs = await (await send("GET", "/api/v1/leads", undefined, s.nguoi.ts!.cookie)).text();
  assert.ok((JSON.parse(thanDs) as unknown[]).length >= 2);
  for (const [ten, than] of [["danh sách", thanDs], ["trả lại", thanTra], ["gửi lại", thanGui]] as const) {
    assert.equal(doSo(than, so), 0, ten);
  }
});

// ---- AC-12 ----
/** Lùi lúc nhập lead bằng kết nối chủ: lead lên bảng đúng `ngay` ngày sau lúc nhập. */
const lui = (id: string, boardAt: Date, ngay: number) =>
  appPool.query("update leads set created_at = $2::timestamptz - make_interval(days => $3) where id = $1", [id, boardAt, ngay]);
const soDo = async (san: San, tu: Date, den: Date) =>
  (await appPool.query("select * from app.lead_board_metric($1, $2, $3)", [san.companyId, tu, den])).rows as Record<string, unknown>[];

test("số đo: ngày lead → Sẵn sàng bán trên bộ mẫu", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, ts2: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const khac = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const lenTuLead = async (san: San, lead: string) => lenBang(san, "dc1", await hangTuLead(san, "dc1", lead));
  // W lên bảng trước khoảng đo.
  const soW = soMoi(s);
  const w = await leadVe(s, soW);
  await lenTuLead(s, w);
  await new Promise((r) => setTimeout(r, 20));
  const tu = new Date();
  const [soX, soY, soZ, soZ2] = [soMoi(s), soMoi(s), soMoi(s), soMoi(s)];
  const x = await leadVe(s, soX);
  const y = (await nhap(s, nam(soY, "Toà A"), "ts2")).id;
  const z = await leadVe(s, soZ);
  assert.equal((await tra(s, z, "dc1")).status, 200);
  const z2 = ((await (await guiLai(s, z, { ownerPhone: soZ2 })).json()) as View).id;
  await nhip(new Date(), s);
  const mX = await lenTuLead(s, x);
  const mY = await lenTuLead(s, y);
  const mZ2 = await lenTuLead(s, z2);
  await lui(x, mX, 3);
  await lui(y, mY, 5);
  await lui(z, mZ2, 6);
  await lui(z2, mZ2, 5);
  const soK = soMoi(khac);
  await lenTuLead(khac, await leadVe(khac, soK));
  const den = sau(new Date(), 1);
  const ra = await soDo(s, tu, den);
  assert.deepEqual(ra.map((r) => Object.keys(r)), ra.map(() => ["lead_id", "first_created_at", "board_at", "days"]));
  const dau = async (id: string) => ((await dong(id)).created_at as Date).toISOString();
  assert.deepEqual(
    ra.map((r) => [r.lead_id, (r.first_created_at as Date).toISOString(), (r.board_at as Date).toISOString(), r.days]),
    [
      [x, await dau(x), mX.toISOString(), "3.0"],
      [y, await dau(y), mY.toISOString(), "5.0"],
      [z2, await dau(z), mZ2.toISOString(), "6.0"],
    ],
  );
  assert.ok(!ra.some((r) => r.lead_id === w));
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await assert.rejects(c.query("select * from app.lead_board_metric($1, $2, $3)", [s.companyId, tu, den]), /permission denied/);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
});

test("số đo: chuỗi gửi lại hai lần", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const tu = new Date();
  const z = await leadVe(s, soMoi(s));
  assert.equal((await tra(s, z, "dc1")).status, 200);
  const z2 = ((await (await guiLai(s, z, { ownerPhone: soMoi(s) })).json()) as View).id;
  await nhip(new Date(), s);
  assert.equal((await tra(s, z2, "dc1")).status, 200);
  const soZ3 = soMoi(s);
  const z3 = ((await (await guiLai(s, z2, { ownerPhone: soZ3 })).json()) as View).id;
  await nhip(new Date(), s);
  const m = await lenBang(s, "dc1", await hangTuLead(s, "dc1", z3));
  await lui(z, m, 7);
  await lui(z2, m, 4);
  await lui(z3, m, 2);
  const ra = await soDo(s, tu, sau(new Date(), 1));
  assert.deepEqual(ra.map((r) => [r.lead_id, r.days]), [[z3, "7.0"]]);
});
