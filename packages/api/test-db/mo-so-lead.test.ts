// Mở số của lead qua API trên Postgres thật (hồ sơ mo-so-lead: E1, E2, E4). Người và sàn từ sàn thử của hàng 27; số mẫu
// 0900 000 0xx. Chỉ sàn của ca được nhịp chia chạm.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, test } from "node:test";
import { timDangSo } from "../src/owners/ma-hoa";
import { appPool, cleanup } from "./helpers";
import { dong, hangCoChu, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const DOI = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
};
const chuan = (so: string) => so.replace(/\s/g, "");
const moSo = (san: San, id: string, ai: string) => send("POST", `/api/v1/leads/${id}/phone-reveal`, undefined, san.nguoi[ai]?.cookie ?? "");
const vet = async (id: string) =>
  (await appPool.query<{ actor_user_id: string; actor_roles: string[]; occurred_at: Date }>(
    "select actor_user_id, actor_roles, occurred_at from lead_phone_reveals where lead_id = $1 order by id",
    [id],
  )).rows;
const ghi = async (san: San, id: string, duoi: string, ai: string) => {
  const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, san.nguoi[ai]!.cookie);
  assert.equal(r.status, 200, `${duoi}: ${await r.clone().text()}`);
};
const dongLead = async (id: string) =>
  (await appPool.query("select outcome, accepted_at, first_called_at, matched_agent_user_id, returned_at from leads where id = $1", [id])).rows[0];

// ---- E1 ----
test("mở số: đầu chủ được giao", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const l = await nhap(s, nam(so, "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await dong(l.id)).matched_agent_user_id, s.nguoi.dc1!.userId);
  const truoc = new Date(Date.now() - 1000);
  const r = await moSo(s, l.id, "dc1");
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(await r.json(), { ownerPhone: chuan(so) });
  const v1 = await vet(l.id);
  assert.equal(v1.length, 1, "vết sau lần mở đầu");
  assert.equal(v1[0]!.actor_user_id, s.nguoi.dc1!.userId);
  assert.ok(v1[0]!.actor_roles.includes("listing_agent"));
  assert.ok(v1[0]!.occurred_at >= truoc && v1[0]!.occurred_at <= new Date(Date.now() + 1000), "lúc mở");
  assert.equal((await moSo(s, l.id, "dc1")).status, 200);
  assert.equal((await vet(l.id)).length, 2, "vết sau lần mở hai");
});

test("mở số: bốn lối giao — người nhận mở được", async () => {
  const s = await sanMoi(DOI);
  const BANG: [string, () => Promise<{ id: string; ai: string }>][] = [
    ["nhịp chia", async () => {
      const l = await nhap(s, nam(soMoi(s), "Toà A"));
      await nhip(new Date(), s);
      return { id: l.id, ai: "dc1" };
    }],
    ["trưởng nhóm giao", async () => {
      const l = await nhap(s, nam(soMoi(s), "Toà A"));
      await nhip(new Date(), s);
      const r = await send("POST", `/api/v1/leads/${l.id}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
      assert.equal(r.status, 200, await r.clone().text());
      return { id: l.id, ai: "dc2" };
    }],
    ["nhập khớp chủ nhà", async () => {
      const so = soMoi(s);
      await hangCoChu(s, "dc1", "A-21.01", so);
      const l = await nhap(s, nam(so, "Toà A"));
      assert.equal(l.outcome, "owner_has_agent");
      return { id: l.id, ai: "dc1" };
    }],
    ["tự nhận kho chung", async () => {
      const s2 = await sanMoi(DOI);
      const r = await send("PUT", "/api/v1/company/settings/lead-routing", { strategy: "open_pool" }, s2.nguoi.qt!.cookie);
      assert.equal(r.status, 200, await r.clone().text());
      const l = await nhap(s2, nam(soMoi(s2), "Toà A"));
      await nhip(new Date(), s2);
      const n = await send("POST", `/api/v1/leads/${l.id}/claim`, undefined, s2.nguoi.dc1!.cookie);
      assert.equal(n.status, 200, await n.clone().text());
      Object.assign(s, { _kho: s2 });
      return { id: l.id, ai: "dc1@kho" };
    }],
  ];
  let so = 0;
  for (const [ten, dung] of BANG) {
    const { id, ai } = await dung();
    const san = ai.endsWith("@kho") ? (s as San & { _kho: San })._kho : s;
    const r = await moSo(san, id, ai.replace("@kho", ""));
    assert.equal(r.status, 200, `dòng «${ten}»: ${await r.clone().text()}`);
    assert.equal((await vet(id)).length, 1, `dòng «${ten}»: vết`);
    so++;
  }
  assert.equal(so, 4);
});

test("mở số: ba nấc còn việc, mở số không đổi lead", async () => {
  const s = await sanMoi(DOI);
  const leadVe = async () => {
    const l = await nhap(s, nam(soMoi(s), "Toà A"));
    await nhip(new Date(), s);
    return l.id;
  };
  const BANG: [string, () => Promise<string>][] = [
    ["Đã gửi", leadVe],
    ["Đã nhận", async () => { const id = await leadVe(); await ghi(s, id, "accept", "dc1"); return id; }],
    ["Đã gọi", async () => { const id = await leadVe(); await ghi(s, id, "first-call", "dc1"); return id; }],
  ];
  let so = 0;
  for (const [nac, dung] of BANG) {
    const id = await dung();
    const truoc = await dongLead(id);
    assert.equal((await moSo(s, id, "dc1")).status, 200, `nấc «${nac}»`);
    assert.equal((await moSo(s, id, "dc1")).status, 200, `nấc «${nac}» lần hai`);
    assert.equal((await vet(id)).length, 2, `nấc «${nac}»: vết`);
    assert.deepEqual(await dongLead(id), truoc, `nấc «${nac}»: mở số đổi lead`);
    so++;
  }
  assert.equal(so, 3);
  // Đối chứng dương: lối «Nhận» thì mốc nhận đổi — phép so trên bắt được thay đổi của dòng lead.
  const id = await leadVe();
  const truoc = await dongLead(id);
  await ghi(s, id, "accept", "dc1");
  assert.notDeepEqual(await dongLead(id), truoc, "đối chứng: Nhận không đổi accepted_at");
});

// ---- E2 + E4 ----
test("mở số: người không được mở, và số không ra ngoài cửa mở số", async () => {
  const s = await sanMoi({ ...DOI, ts2: { vai: ["telesales"] } });
  const sKhac = await sanMoi(DOI);
  const leadCuaDc1 = async () => {
    const so = soMoi(s);
    const l = await nhap(s, nam(so, "Toà A"));
    await nhip(new Date(), s);
    return { id: l.id, so: chuan(so) };
  };
  const tuChoi: { body: string; so: string }[] = [];
  // Bảng viết trước: (dòng, dựng → lead + người mở, mã mong).
  const BANG: [string, () => Promise<{ id: string; so: string; ai: string; san?: San }>, number][] = [
    ["đầu chủ khác cùng sàn", async () => ({ ...(await leadCuaDc1()), ai: "dc2" }), 404],
    ["telesales đã nhập lead", async () => ({ ...(await leadCuaDc1()), ai: "ts" }), 403],
    ["trưởng nhóm", async () => ({ ...(await leadCuaDc1()), ai: "tn" }), 403],
    ["quản trị sàn", async () => ({ ...(await leadCuaDc1()), ai: "qt" }), 403],
    ["người sàn khác", async () => ({ ...(await leadCuaDc1()), ai: "dc1", san: sKhac }), 404],
    ["người được giao đã bị gỡ vai Đầu chủ", async () => {
      const l = await leadCuaDc1();
      await appPool.query("update company_members set roles = '{telesales}' where company_id = $1 and user_id = $2", [s.companyId, s.nguoi.dc1!.userId]);
      return { ...l, ai: "dc1" };
    }, 403],
    ["lead đã trả lại", async () => {
      await appPool.query("update company_members set roles = '{listing_agent}' where company_id = $1 and user_id = $2", [s.companyId, s.nguoi.dc1!.userId]);
      const l = await leadCuaDc1();
      await ghi(s, l.id, "return", "dc1");
      return { ...l, ai: "dc1" };
    }, 404],
    ["lead đã gửi lại — lead cũ", async () => {
      const l = await leadCuaDc1();
      await ghi(s, l.id, "return", "dc1");
      const r = await send("POST", `/api/v1/leads/${l.id}/resubmit`, { ownerPhone: soMoi(s) }, s.nguoi.ts!.cookie);
      assert.equal(r.status, 201, await r.clone().text());
      return { ...l, ai: "dc1" };
    }, 404],
    ["lead căn trùng — đầu chủ giữ căn mở", async () => {
      await hangCoChu(s, "dc1", "A-31.01", soMoi(s));
      const so = soMoi(s);
      const l = await nhap(s, nam(so, "Toà A", "A-31.01"));
      assert.equal(l.outcome, "unit_has_open_listing");
      assert.equal((await dong(l.id)).matched_agent_user_id, s.nguoi.dc1!.userId);
      return { id: l.id, so: chuan(so), ai: "dc1" };
    }, 404],
    ["lead căn trùng đã bỏ", async () => {
      await hangCoChu(s, "dc1", "A-32.01", soMoi(s));
      const so = soMoi(s);
      const l = await nhap(s, nam(so, "Toà A", "A-32.01"), "ts2");
      const b = await send("POST", `/api/v1/leads/${l.id}/discard`, undefined, s.nguoi.ts2!.cookie);
      assert.equal(b.status, 200, await b.clone().text());
      return { id: l.id, so: chuan(so), ai: "dc1" };
    }, 404],
    ["chưa đăng nhập", async () => ({ ...(await leadCuaDc1()), ai: "khong-co" }), 401],
  ];
  let so = 0;
  for (const [ten, dung, mong] of BANG) {
    const { id, so: soLead, ai, san } = await dung();
    const r = await moSo(san ?? s, id, ai);
    const body = await r.text();
    assert.equal(r.status, mong, `dòng «${ten}»: ${body}`);
    assert.equal((await vet(id)).length, 0, `dòng «${ten}»: có vết`);
    tuChoi.push({ body, so: soLead });
    so++;
  }
  assert.equal(so, 11);

  // Đối chứng dương cùng dữ liệu: người được giao mở chính một lead còn việc → 200, một vết, thân mang số.
  const ok = await leadCuaDc1();
  const r = await moSo(s, ok.id, "dc1");
  const okBody = await r.text();
  assert.equal(r.status, 200, okBody);
  assert.equal((await vet(ok.id)).length, 1);

  // E4 — số không ra ngoài cửa mở số. Máy dò bốn dạng; đối chứng: thân của lời mở thành công bị bắt.
  assert.ok(timDangSo(okBody, ok.so), "máy dò không bắt số trong thân mở thành công");
  for (const t of tuChoi) assert.equal(timDangSo(t.body, t.so), null, `lời từ chối mang số: ${t.body}`);
  const rDs = await send("GET", "/api/v1/leads/assigned", undefined, s.nguoi.dc1!.cookie);
  const ds = await rDs.text();
  // Đối chứng dương: danh sách trả được và thật sự chứa lead vừa mở — khẳng định âm dưới đây đo trên một thân có lead ấy.
  assert.equal(rDs.status, 200, `danh sách lead giao: ${ds}`);
  assert.ok((JSON.parse(ds) as { id: string }[]).some((x) => x.id === ok.id), "danh sách lead giao không có lead vừa mở — đối chứng hỏng");
  assert.equal(timDangSo(ds, ok.so), null, "danh sách lead giao mang số");
});

test("mở số: nhật ký máy chủ không mang số, kể cả khi giải mã lỗi", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const l = await nhap(s, nam(so, "Toà A"));
  await nhip(new Date(), s);
  // Bọc năm kênh nhật ký thật của API trong lúc gọi.
  const bat: string[] = [];
  const cu = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
  const ghiLai = (...a: unknown[]) => void bat.push(a.map((x) => (x instanceof Error ? `${x.message}\n${x.stack}` : String(x))).join(" "));
  const khoaCu = process.env.OWNER_PHONE_KEY;
  let r500: Response;
  try {
    console.log = ghiLai;
    console.error = ghiLai;
    console.warn = ghiLai;
    process.stdout.write = ((c: unknown) => (ghiLai(c), true)) as typeof process.stdout.write;
    process.stderr.write = ((c: unknown) => (ghiLai(c), true)) as typeof process.stderr.write;
    // Ép lỗi giải mã: khoá hợp lệ nhưng khác khoá đã mã hoá.
    process.env.OWNER_PHONE_KEY = randomBytes(32).toString("base64");
    r500 = await moSo(s, l.id, "dc1");
    process.env.OWNER_PHONE_KEY = khoaCu ?? "";
    if (khoaCu === undefined) delete process.env.OWNER_PHONE_KEY;
    await moSo(s, l.id, "dc2"); // từ chối — cũng qua kênh nhật ký nếu có
  } finally {
    Object.assign(console, { log: cu.log, error: cu.error, warn: cu.warn });
    process.stdout.write = cu.out;
    process.stderr.write = cu.err;
    if (khoaCu === undefined) delete process.env.OWNER_PHONE_KEY;
    else process.env.OWNER_PHONE_KEY = khoaCu;
  }
  assert.equal(r500!.status, 500);
  assert.equal(timDangSo(await r500!.text(), chuan(so)), null, "thân lỗi 500 mang số");
  assert.ok(bat.length >= 1, "bọc nhật ký không bắt được dòng nào — đối chứng hỏng");
  for (const d of bat) assert.equal(timDangSo(d, chuan(so)), null, `nhật ký mang số: ${d.slice(0, 120)}`);
  assert.equal((await vet(l.id)).length, 0, "lỗi giải mã vẫn để lại vết");
});
