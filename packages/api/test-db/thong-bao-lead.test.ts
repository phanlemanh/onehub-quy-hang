// Thông báo lead qua API trên Postgres thật (hàng 26: E1, E3, E5, E8, E9; ADR-0025). Người theo bộ mẫu hàng 5 qua sàn thử
// của hàng 27; gửi đẩy đi qua một bộ gửi giả bơm vào API — không gọi dịch vụ đẩy thật. Nhịp chia chỉ chạy sàn của ca.
import assert from "node:assert/strict";
import { createPrivateKey, createPublicKey, randomBytes, sign, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { PUSH_PAYLOAD_KEYS, type PushPayload } from "@quy-hang/core/push";
import { createApi } from "../src/app";
import { withCompany } from "../src/db";
import { runLeadTick } from "../src/jobs/lead-tick";
import { khoaSoChu } from "../src/owners/khoa";
import type { PushResult, PushSender } from "../src/push/gui";
import { giaiKhoaRieng, khoaVapid } from "../src/push/khoa-vapid";
import { appPool, BASE_URL, cleanup, identityPool, makeAuth, RUN } from "./helpers";
import { ai, dong, hangCoChu, nam, sanMoi, soMoi, type San } from "./san-thu";

after(cleanup);

// ---- Bộ gửi giả: ghi lại mọi lần gửi; câu trả lời theo đăng ký do ca đặt ----
type LanGui = { endpoint: string; payload: PushPayload };
const daGui: LanGui[] = [];
let traLoi: (endpoint: string, lan: number) => PushResult = () => ({ ok: true });
const guiGia: PushSender = async (t, payload) => {
  const lan = daGui.filter((g) => g.endpoint === t.endpoint).length + 1;
  daGui.push({ endpoint: t.endpoint, payload });
  return traLoi(t.endpoint, lan);
};
const { auth } = makeAuth();
const app = createApi({ appPool, identityPool, auth, pushSender: guiGia });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const nhip = (now: Date, san: San) => runLeadTick(appPool, now, [san.companyId], guiGia);
const sau = (t: Date, phut: number) => new Date(t.getTime() + phut * 60_000);

/** Endpoint giả của một thiết bị của một người trong một sàn. */
const diaChi = (san: San, k: string, thietBi = "1") => `https://fcm.googleapis.com/fcm/send/${RUN}/${san.companyId}/${k}/${thietBi}`;
const khoaThietBi = () => ({ p256dh: randomBytes(65).toString("base64url"), auth: randomBytes(16).toString("base64url") });
async function bat(san: San, k: string, thietBi = "1", trangThai = 201) {
  const r = await send("POST", "/api/v1/me/push-subscriptions", { endpoint: diaChi(san, k, thietBi), expirationTime: null, keys: khoaThietBi() }, san.nguoi[k]!.cookie);
  assert.equal(r.status, trangThai, await r.clone().text());
}
/** Số lần gửi tới các thiết bị của một người trong sàn, tính từ mốc `tu` của sổ gửi. */
const guiToi = (san: San, k: string, tu = 0) => daGui.slice(tu).filter((g) => g.endpoint.startsWith(`https://fcm.googleapis.com/fcm/send/${RUN}/${san.companyId}/${k}/`));
async function nhapLead(san: San, body: unknown, k = "ts") {
  const r = await send("POST", "/api/v1/leads", body, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; outcome: string };
}
const dangKyCua = async (san: San, k: string) =>
  (
    await appPool.query<{ endpoint: string; failed_at: Date | null }>(
      "select endpoint, failed_at from push_subscriptions where company_id = $1 and user_id = $2 order by endpoint",
      [san.companyId, san.nguoi[k]!.userId],
    )
  ).rows;
const hopThuDi = async (san: San) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from push_outbox where company_id = $1", [san.companyId])).rows[0]!.n;

const DOI = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
};

// ---- E9 ----
test("khoá VAPID tự sinh, không ai cầm", async () => {
  await appPool.query("delete from push_vapid");
  const lay = () => withCompany(appPool, { userId: "", companyId: null }, (tx) => khoaVapid(tx, khoaSoChu()));
  const [a, b] = await Promise.all([lay(), lay()]);
  assert.equal(a.publicKey, b.publicKey, "hai lời gọi song song trả hai khoá công khai");
  const dongKhoa = (await appPool.query<{ public_key: string; private_enc: Buffer }>("select public_key, private_enc from push_vapid")).rows;
  assert.equal(dongKhoa.length, 1, `bảng khoá có ${dongKhoa.length} dòng`);
  const enc = dongKhoa[0]!.private_enc;
  const rieng = Buffer.from(a.privateKey, "base64url");
  assert.ok(!enc.equals(rieng), "cột private_enc chứa khoá riêng rõ");
  assert.ok(!enc.includes(rieng) && !enc.toString("latin1").includes(a.privateKey), "cột private_enc chứa khoá riêng rõ");
  // Giải bằng khoá con HKDF nhãn quy-hang/push-vapid/v1 ra khoá riêng khớp khoá công khai: ký thử rồi kiểm chữ ký.
  const giai = giaiKhoaRieng(enc, khoaSoChu());
  const pub = Buffer.from(dongKhoa[0]!.public_key, "base64url");
  const jwk = { kty: "EC", crv: "P-256", x: pub.subarray(1, 33).toString("base64url"), y: pub.subarray(33, 65).toString("base64url") };
  const chuKy = sign("sha256", Buffer.from("thu"), createPrivateKey({ key: { ...jwk, d: giai }, format: "jwk" }));
  assert.ok(verify("sha256", Buffer.from("thu"), createPublicKey({ key: jwk, format: "jwk" }), chuKy), "khoá riêng giải ra không khớp khoá công khai");
  await assert.rejects(
    withCompany(appPool, { userId: "", companyId: null }, (tx) => tx.query("select * from push_vapid")),
    /permission denied/,
  );
  const envMau = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../.env.example"), "utf8");
  assert.doesNotMatch(envMau, /VAPID/i, ".env.example có biến VAPID");
});

// ---- E1 ----
test("khoá công khai: máy chủ tự sinh, lần hai trả đúng khoá ấy", async () => {
  const s = await sanMoi({ dc1: { vai: ["listing_agent"] } });
  const lay = async () => {
    const r = await send("GET", "/api/v1/push/public-key", undefined, s.nguoi.dc1!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
    return ((await r.json()) as { publicKey: string }).publicKey;
  };
  const k1 = await lay();
  assert.match(k1, /^[A-Za-z0-9_-]{87}$/);
  assert.equal(Buffer.from(k1, "base64url").length, 65);
  assert.equal(await lay(), k1);
  assert.equal((await send("GET", "/api/v1/push/public-key")).status, 401);
  // Máy chủ không dựng được khoá mã hoá (khoá hỏng): 503 push-not-configured, dải web báo «chưa được cấu hình».
  const cu = process.env.OWNER_PHONE_KEY;
  process.env.OWNER_PHONE_KEY = "khoa-hong";
  try {
    const r = await send("GET", "/api/v1/push/public-key", undefined, s.nguoi.dc1!.cookie);
    assert.equal(r.status, 503);
    assert.deepEqual(await r.json(), { error: "push-not-configured" });
  } finally {
    if (cu === undefined) delete process.env.OWNER_PHONE_KEY;
    else process.env.OWNER_PHONE_KEY = cu;
  }
});

test("đăng ký: bật, bật lại, gỡ", async () => {
  const s = await sanMoi({ dc1: { vai: ["listing_agent"] } });
  const cookie = s.nguoi.dc1!.cookie;
  const dau = diaChi(s, "dc1");
  const khoa = khoaThietBi();
  const dem = async (ep: string) =>
    (await appPool.query("select company_id, user_id from push_subscriptions where endpoint = $1", [ep])).rows;
  let r = await send("POST", "/api/v1/me/push-subscriptions", { endpoint: dau, keys: khoa }, cookie);
  assert.equal(r.status, 201, await r.clone().text());
  assert.deepEqual(await dem(dau), [{ company_id: s.companyId, user_id: s.nguoi.dc1!.userId }]);
  r = await send("POST", "/api/v1/me/push-subscriptions", { endpoint: dau, keys: khoa }, cookie);
  assert.equal(r.status, 200, "bật lại cùng thiết bị");
  assert.equal((await dem(dau)).length, 1, "bật lại sinh dòng thứ hai");
  r = await send("DELETE", "/api/v1/me/push-subscriptions", { endpoint: dau }, cookie);
  assert.equal(r.status, 204);
  assert.equal((await dem(dau)).length, 0);
  assert.equal((await send("POST", "/api/v1/me/push-subscriptions", { endpoint: dau, keys: khoa })).status, 401, "không cookie");
  assert.equal((await send("POST", "/api/v1/me/push-subscriptions", { endpoint: dau }, cookie)).status, 400, "thiếu keys");
  // Đăng xuất kèm endpoint của thiết bị: gỡ đăng ký của thiết bị ấy, thiết bị khác còn.
  await bat(s, "dc1", "may-tinh");
  await bat(s, "dc1", "dien-thoai");
  r = await send("POST", "/api/v1/auth/sign-out", { pushEndpoint: diaChi(s, "dc1", "may-tinh") }, cookie);
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual((await dangKyCua(s, "dc1")).map((d) => d.endpoint), [diaChi(s, "dc1", "dien-thoai")]);
});

// ---- E3 ----
test("gửi khi lead về đầu chủ", async () => {
  const s = await sanMoi(DOI);
  for (const k of ["dc1", "dc2", "tn"]) await bat(s, k);
  const dem: Record<string, [string, number][]> = {};
  const ghi = (ten: string, tu: number) => {
    dem[ten] = (["dc1", "dc2", "tn"] as const).map((k) => [k, guiToi(s, k, tu).length] as [string, number]).filter(([, n]) => n > 0);
  };
  // Nhịp chia về dc1.
  let tu = daGui.length;
  const l1 = await nhapLead(s, nam(soMoi(s), "Toà A"));
  assert.equal(guiToi(s, "dc1", tu).length, 0, "lead chưa chia đã gửi");
  await nhip(new Date(), s);
  assert.equal(ai(s, (await dong(l1.id)).matched_agent_user_id), "dc1");
  ghi("nhịp chia về dc1", tu);
  assert.deepEqual(guiToi(s, "dc1", tu)[0]!.payload, { title: "Lead mới", body: "Toà A · Bán", url: `/today?lead=${l1.id}`, tag: `lead:${l1.id}` });
  // Trưởng nhóm giao cho dc2.
  tu = daGui.length;
  const r = await send("POST", `/api/v1/leads/${l1.id}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  ghi("trưởng nhóm giao cho dc2", tu);
  // Nhập lead khớp đầu chủ giữ chủ nhà.
  const soChu = soMoi(s);
  await hangCoChu(s, "dc1", "A-01.01", soChu);
  tu = daGui.length;
  const l3 = await nhapLead(s, nam(soChu, "Toà A"));
  assert.equal(l3.outcome, "owner_has_agent");
  ghi("nhập lead khớp đầu chủ giữ chủ nhà", tu);
  // Gửi lại lead khớp: lead về dc2 bị trả lại, gửi lại với số của chủ nhà dc1 đang giữ.
  const l4 = await nhapLead(s, nam(soMoi(s), "Toà B"));
  await nhip(new Date(), s);
  const traLai = await send("POST", `/api/v1/leads/${l4.id}/return`, undefined, s.nguoi.dc2!.cookie);
  assert.equal(traLai.status, 200, await traLai.clone().text());
  tu = daGui.length;
  const guiLai = await send("POST", `/api/v1/leads/${l4.id}/resubmit`, { ownerPhone: soChu }, s.nguoi.ts!.cookie);
  assert.equal(guiLai.status, 201, await guiLai.clone().text());
  ghi("gửi lại lead khớp", tu);
  // dc1 tự nhận từ kho chung.
  const s2 = await sanMoi(DOI);
  await bat(s2, "dc1");
  const cauHinh = await send("PUT", "/api/v1/company/settings/lead-routing", { strategy: "open_pool" }, s2.nguoi.qt!.cookie);
  assert.equal(cauHinh.status, 200, await cauHinh.clone().text());
  const l5 = await nhapLead(s2, nam(soMoi(s2), "Toà A"));
  await nhip(new Date(), s2);
  tu = daGui.length;
  const nhan = await send("POST", `/api/v1/leads/${l5.id}/claim`, undefined, s2.nguoi.dc1!.cookie);
  assert.equal(nhan.status, 200, await nhan.clone().text());
  await nhip(new Date(), s2);
  dem["dc1 tự nhận từ kho chung"] = guiToi(s2, "dc1", tu).length ? [["dc1", guiToi(s2, "dc1", tu).length]] : [];
  // Bảng viết trước: lối giao → (người nhận, số lần gửi).
  const BANG: Record<string, [string, number][]> = {
    "nhịp chia về dc1": [["dc1", 1]],
    "trưởng nhóm giao cho dc2": [["dc2", 1]],
    "nhập lead khớp đầu chủ giữ chủ nhà": [["dc1", 1]],
    "gửi lại lead khớp": [["dc1", 1]],
    "dc1 tự nhận từ kho chung": [],
  };
  let so = 0;
  for (const [ten, mong] of Object.entries(BANG)) {
    assert.deepEqual(dem[ten], mong, `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 5);
});

test("việc giao quay lui không gửi", async () => {
  const s = await sanMoi(DOI);
  for (const k of ["dc1", "dc2"]) await bat(s, k);
  const soChu = soMoi(s);
  await hangCoChu(s, "dc1", "A-02.01", soChu);
  const l = await nhapLead(s, nam(soMoi(s), "Toà A"));
  const ham = `thu_quay_lui_${RUN}`;
  // Ép lỗi sau khi giao, trong cùng giao dịch: dòng «cần báo» của sàn này không ghi được → cả giao dịch quay lui.
  await appPool.query(
    `create function public.${ham}() returns trigger language plpgsql as $$
     begin if new.company_id = '${s.companyId}' then raise exception 'ép quay lui'; end if; return new; end $$`,
  );
  await appPool.query(`create trigger ${ham} after insert on push_outbox for each row execute function public.${ham}()`);
  const tu = daGui.length;
  try {
    const BANG: [string, () => Promise<void>][] = [
      ["nhịp chia", async () => {
        const kq = await nhip(new Date(), s);
        assert.equal(kq.failed, 1);
        assert.equal((await dong(l.id)).matched_agent_user_id, null, "lead vẫn được chia");
      }],
      ["trưởng nhóm giao", async () => {
        await appPool.query(
          "update leads set matched_agent_user_id = $1, routed_at = now(), routed_seq = nextval('app.lead_routing_seq') where id = $2",
          [s.nguoi.dc1!.userId, l.id],
        );
        const r = await send("POST", `/api/v1/leads/${l.id}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
        assert.equal(r.status, 500, "trưởng nhóm giao: không quay lui vì lỗi ép");
        assert.equal(ai(s, (await dong(l.id)).matched_agent_user_id), "dc1", "việc giao không quay lui");
      }],
      ["nhập lead", async () => {
        const truoc = (await appPool.query("select count(*)::int n from leads where company_id = $1", [s.companyId])).rows[0].n;
        const r = await send("POST", "/api/v1/leads", nam(soChu, "Toà A"), s.nguoi.ts!.cookie);
        assert.equal(r.status, 500, "nhập lead: không quay lui vì lỗi ép");
        const sau_ = (await appPool.query("select count(*)::int n from leads where company_id = $1", [s.companyId])).rows[0].n;
        assert.equal(sau_, truoc, "lead vẫn được ghi");
      }],
    ];
    let so = 0;
    for (const [ten, viec] of BANG) {
      await viec();
      assert.equal(daGui.length - tu, 0, `dòng «${ten}»: có lần gửi`);
      assert.equal(await hopThuDi(s), 0, `dòng «${ten}»: còn dòng hộp thư đi`);
      so++;
    }
    assert.equal(so, 3);
  } finally {
    await appPool.query(`drop trigger if exists ${ham} on push_outbox`);
    await appPool.query(`drop function if exists public.${ham}()`);
  }
  // Đối chứng dương: gỡ lỗi ép, cùng ba lối trên cùng dữ liệu thì giao được và gửi đúng một lần — ba ô trên đỏ vì lỗi ép.
  const BANG_DOI_CHUNG: [string, () => Promise<void>, string][] = [
    ["trưởng nhóm giao", async () => {
      const r = await send("POST", `/api/v1/leads/${l.id}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
      assert.equal(r.status, 200, await r.clone().text());
    }, "dc2"],
    ["nhập lead", async () => {
      const r = await send("POST", "/api/v1/leads", nam(soChu, "Toà A"), s.nguoi.ts!.cookie);
      assert.equal(r.status, 201, await r.clone().text());
    }, "dc1"],
    ["nhịp chia", async () => {
      await nhapLead(s, nam(soMoi(s), "Toà A"));
      const kq = await nhip(new Date(), s);
      assert.deepEqual([kq.failed, kq.routed], [0, 1]);
    }, "dc1"],
  ];
  let soDoiChung = 0;
  for (const [ten, viec, ai_] of BANG_DOI_CHUNG) {
    const truoc = daGui.length;
    await viec();
    assert.equal(guiToi(s, ai_, truoc).length, 1, `đối chứng «${ten}»: không gửi đúng một lần`);
    soDoiChung++;
  }
  assert.equal(soDoiChung, 3);
});

test("lỗi tạm gửi lại", async () => {
  const s = await sanMoi(DOI);
  await bat(s, "dc1");
  await bat(s, "dc2");
  const so1 = soMoi(s);
  const so2 = soMoi(s);
  await hangCoChu(s, "dc1", "A-03.01", so1);
  await hangCoChu(s, "dc2", "B-03.01", so2, "Toà B");
  // dc1: dịch vụ đẩy trả 500 lần đầu rồi nhận. dc2: luôn 500.
  traLoi = (ep, lan) =>
    ep === diaChi(s, "dc1") ? (lan === 1 ? { ok: false, status: 500, error: "500" } : { ok: true })
    : ep === diaChi(s, "dc2") ? { ok: false, status: 500, error: "500" }
    : { ok: true };
  try {
    const tu = daGui.length;
    const t0 = new Date();
    await nhapLead(s, nam(so1, "Toà A"));
    await nhapLead(s, nam(so2, "Toà B"));
    const BANG: [string, Date, number, number][] = [
      ["lúc giao", t0, 1, 1],
      ["nhịp sau 1 phút", sau(t0, 1), 2, 2],
      ["nhịp sau 2 phút", sau(t0, 2), 2, 3],
      ["nhịp sau 3 phút (lần thứ tư)", sau(t0, 3), 2, 3],
    ];
    let so = 0;
    for (const [ten, luc, mong1, mong2] of BANG) {
      if (luc !== t0) await nhip(luc, s);
      assert.deepEqual([guiToi(s, "dc1", tu).length, guiToi(s, "dc2", tu).length], [mong1, mong2], `dòng «${ten}»`);
      so++;
    }
    assert.equal(so, 4);
  } finally {
    traLoi = () => ({ ok: true });
  }
});

test("gửi lỗi không làm hỏng việc giao", async () => {
  const s = await sanMoi(DOI);
  await bat(s, "dc1");
  traLoi = () => {
    throw new Error("bộ gửi hỏng");
  };
  try {
    const l = await nhapLead(s, nam(soMoi(s), "Toà A"));
    const tu = daGui.length;
    const kq = await nhip(new Date(), s);
    assert.equal(guiToi(s, "dc1", tu).length, 1, "bộ gửi hỏng không được gọi — ca không đo lỗi gửi");
    assert.equal(kq.routed, 1);
    assert.equal(kq.failed, 0);
    assert.equal(ai(s, (await dong(l.id)).matched_agent_user_id), "dc1");
  } finally {
    traLoi = () => ({ ok: true });
  }
});

// ---- E5 ----
test("đăng ký chết bị gỡ", async () => {
  const s = await sanMoi(DOI);
  for (const t of ["1", "2", "3"]) await bat(s, "dc1", t);
  const soChu = soMoi(s);
  await hangCoChu(s, "dc1", "A-04.01", soChu);
  const MA: Record<string, number> = { [diaChi(s, "dc1", "1")]: 410, [diaChi(s, "dc1", "2")]: 404, [diaChi(s, "dc1", "3")]: 500 };
  traLoi = (ep) => (MA[ep] ? { ok: false, status: MA[ep], error: `dịch vụ đẩy trả ${MA[ep]}` } : { ok: true });
  try {
    const t0 = new Date();
    await nhapLead(s, nam(soChu, "Toà A"));
    const con = await dangKyCua(s, "dc1");
    assert.deepEqual(con.map((d) => d.endpoint), [diaChi(s, "dc1", "3")], "đăng ký còn lại");
    assert.ok(con[0]!.failed_at instanceof Date, "đăng ký 3 không ghi lần hỏng");
    const tu = daGui.length;
    await nhip(sau(t0, 1), s);
    assert.deepEqual(daGui.slice(tu).map((g) => g.endpoint), [diaChi(s, "dc1", "3")], "lần gửi kế không tới đăng ký 3");
  } finally {
    traLoi = () => ({ ok: true });
  }
});

// ---- E8 ----
test("trưởng nhóm nhận đẩy lời báo", async () => {
  const s = await sanMoi(DOI);
  for (const k of ["tn", "dc1"]) await bat(s, k);
  const t0 = new Date();
  const baoToi = (k: string, tu: number) => guiToi(s, k, tu).filter((g) => g.payload.tag.startsWith("alert:"));
  // Bảng viết trước: loại lời báo → cách dựng; mỗi lời báo mới trưởng nhóm nhận đúng một thông báo.
  const BANG: [string, () => Promise<string>, Date][] = [
    ["unrouted", async () => (await nhapLead(s, nam(soMoi(s), "Toà C"))).id, t0],
    ["accept_overdue", async () => (await nhapLead(s, nam(soMoi(s), "Toà A"))).id, sau(t0, 16)],
    ["first_call_overdue", async () => "", sau(t0, 31)],
  ];
  let lead = "";
  let so = 0;
  for (const [kind, dung, luc] of BANG) {
    const id = await dung();
    if (id) lead = id;
    if (kind === "accept_overdue") {
      await nhip(t0, s); // chia lead Toà A về dc1 lúc t0, dc1 chưa nhận
      assert.equal(ai(s, (await dong(lead)).matched_agent_user_id), "dc1");
    }
    const tu = daGui.length;
    await nhip(luc, s);
    const nhanTn = baoToi("tn", tu).filter((g) => g.payload.tag.startsWith(`alert:${kind}:`));
    assert.equal(nhanTn.length, 1, `dòng «${kind}»: trưởng nhóm nhận ${nhanTn.length}`);
    assert.deepEqual(Object.keys(nhanTn[0]!.payload), [...PUSH_PAYLOAD_KEYS]);
    assert.equal(nhanTn[0]!.payload.url, "/today");
    assert.equal(baoToi("dc1", tu).length, 0, `dòng «${kind}»: đầu chủ nhận lời báo`);
    // Nhịp sau cùng mốc: lời báo đã có, không gửi lại.
    const tu2 = daGui.length;
    await nhip(luc, s);
    assert.equal(baoToi("tn", tu2).length, 0, `dòng «${kind} — nhịp sau»: gửi lại lời báo đã có`);
    so++;
  }
  assert.equal(so, 3);
});
