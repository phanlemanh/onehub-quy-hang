// Cấu hình theo sàn qua lối chung trên Postgres thật (hàng 82: E1–E4, E5a, E5c, E6 c–d, E7, E8). Sàn, người và lead dựng
// qua lối API thật (mở sàn, nhập lead, nhịp chia, hai lối cấu hình cũ); kết nối chủ chỉ dùng để đếm và đọc nhật ký, đọc
// hạn trên lead, và chèn thẳng một dòng cấu hình «có từ trước» không qua lối kiểm (E5c). Số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";
import { khoangCua, macDinhSo, SO_DIEM } from "@quy-hang/core/config";
import pg from "pg";
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

// ---- Sàn thử: quản trị (người mở sàn), trưởng nhóm, đầu chủ, telesales ----
type Nguoi = { userId: string; cookie: string };
type San = { companyId: string; nguoi: Record<"qt" | "tn" | "dc" | "ts", Nguoi>; so: number };
let soSan = 0;
async function sanMoi(): Promise<San> {
  const nhan = `ch${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} cau-hinh ${nhan}]`, qtEmail);
  const nguoi = { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}` } } as San["nguoi"];
  for (const [k, vai] of [
    ["tn", ["team_lead"]],
    ["dc", ["listing_agent"]],
    ["ts", ["telesales"]],
  ] as const) {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  }
  return { companyId: s.companyId, nguoi, so: 10 };
}

type DongCauHinh = { key: string; value: unknown; source: string; updatedBy: string | null; updatedAt: string | null };
type BanCauHinh = { items: DongCauHinh[]; errors: string[] };
async function doc(san: San, k: keyof San["nguoi"] = "qt"): Promise<BanCauHinh> {
  const r = await send("GET", "/api/v1/company/settings", undefined, san.nguoi[k].cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as BanCauHinh;
}
const gia = (ban: BanCauHinh, key: string) => ban.items.find((x) => x.key === key);
const doi = (san: San, body: unknown, k: keyof San["nguoi"] = "qt") => send("PATCH", "/api/v1/company/settings", body, san.nguoi[k]?.cookie ?? "");

type SuKien = { key: string; value: unknown; data_class: string; actor_user_id: string; actor_roles: string[]; at: Date };
const suKien = async (san: San) =>
  (
    await appPool.query<SuKien>(
      "select key, value, data_class, actor_user_id, actor_roles, at from company_settings_events where company_id = $1 order by id",
      [san.companyId],
    )
  ).rows;
const banHienHanh = async (san: San, key: string) =>
  (await appPool.query<{ value: unknown; data_class: string }>("select value, data_class from company_settings where company_id = $1 and key = $2", [san.companyId, key])).rows[0];

const NHAN = "lead_routing.accept_minutes";
const GOI = "lead_routing.first_call_minutes";
/** Điểm lối chung đọc và đổi — rút từ sổ ở lõi, không viết tay. */
const DIEM_CHUNG = SO_DIEM.filter((d) => d.kieu.loai !== "map" && !d.khoa.includes("<") && d.tinhTrang === "mo");

const lead = (san: San) => ({
  ownerPhone: `0900 000 0${san.so++}`,
  buildingName: "Toà A",
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
async function nhap(san: San): Promise<string> {
  const r = await send("POST", "/api/v1/leads", lead(san), san.nguoi.ts.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
}
const nhip = (san: San) => runLeadTick(appPool, new Date(), [san.companyId]);
const hanLead = async (id: string) =>
  (await appPool.query<{ accept_minutes: number | null; first_call_minutes: number | null }>("select accept_minutes, first_call_minutes from leads where id = $1", [id])).rows[0]!;

// ---- E1 ----
test("cấu hình sàn: đọc mặc định, sàn B không đổi theo A", async () => {
  const a = await sanMoi();
  const b = await sanMoi();
  const dau = await doc(a, "ts");
  assert.deepEqual(dau.items.map((x) => x.key).sort(), DIEM_CHUNG.map((d) => d.khoa).sort());
  for (const d of DIEM_CHUNG) {
    const x = gia(dau, d.khoa)!;
    assert.deepEqual(Object.keys(x).sort(), ["key", "source", "updatedAt", "updatedBy", "value"]);
    assert.deepEqual(x.value, d.macDinh, d.khoa);
    assert.equal(x.source, "default", d.khoa);
  }
  assert.deepEqual(dau.errors, []);
  assert.equal(gia(dau, NHAN)!.value, 15, "trước khi đổi A đọc 15");

  const r = await doi(a, { [NHAN]: 20 });
  assert.equal(r.status, 200, await r.clone().text());
  const sau = gia(await doc(a, "ts"), NHAN)!;
  assert.deepEqual([sau.value, sau.source, sau.updatedBy], [20, "company", a.nguoi.qt.userId]);
  assert.ok(sau.updatedAt);
  const cuaB = gia(await doc(b, "ts"), NHAN)!;
  assert.deepEqual([cuaB.value, cuaB.source], [15, "default"]);
});

// ---- E2 ----
test("cấu hình sàn: mỗi khoá một sự kiện ghi người và vai", async () => {
  const a = await sanMoi();
  const n0 = (await suKien(a)).length;
  let r = await doi(a, { "queue.call_back_after_days": 20 });
  assert.equal(r.status, 200, await r.clone().text());
  const sk1 = await suKien(a);
  assert.equal(sk1.length, n0 + 1);
  const e = sk1.at(-1)!;
  assert.deepEqual({ key: e.key, value: e.value, actor: e.actor_user_id }, { key: "queue.call_back_after_days", value: 20, actor: a.nguoi.qt.userId });
  assert.ok(e.actor_roles.includes("company_admin"), JSON.stringify(e.actor_roles));
  assert.ok(e.at instanceof Date);

  r = await doi(a, { "price.change_confirm_pct": 30, "share.stale_warning_days": 10 });
  assert.equal(r.status, 200, await r.clone().text());
  const sk2 = await suKien(a);
  assert.equal(sk2.length, n0 + 3);
  assert.deepEqual(sk2.slice(-2).map((x) => x.key).sort(), ["price.change_confirm_pct", "share.stale_warning_days"]);
  for (const [k, v] of [
    ["queue.call_back_after_days", 20],
    ["price.change_confirm_pct", 30],
    ["share.stale_warning_days", 10],
  ] as const)
    assert.equal((await banHienHanh(a, k))?.value, v, k);

  // Chiều đỏ: lệnh bị từ chối không thêm sự kiện.
  r = await doi(a, { "queue.khong_co": 1 });
  assert.equal(r.status, 400);
  assert.equal((await suKien(a)).length, n0 + 3);
});

// ---- E3 ----
test("cấu hình sàn: vai khác 403, chưa đăng nhập 401", async () => {
  const a = await sanMoi();
  const n0 = (await suKien(a)).length;
  for (const k of ["tn", "dc", "ts"] as const) {
    const r = await doi(a, { [NHAN]: 20 }, k);
    assert.equal(r.status, 403, `${k}: ${await r.clone().text()}`);
    assert.equal(((await r.json()) as { error: string }).error, "admin-required");
  }
  const vo = await send("PATCH", "/api/v1/company/settings", { [NHAN]: 20 });
  assert.equal(vo.status, 401);
  assert.equal(await banHienHanh(a, NHAN), undefined);
  assert.equal((await suKien(a)).length, n0);
  const qt = await doi(a, { [NHAN]: 20 });
  assert.equal(qt.status, 200, "đối chứng dương: quản trị đổi được");
});

// ---- E4 ----
test("cấu hình sàn: giá trị sai 400 nêu khoá, nguyên khối", async () => {
  const a = await sanMoi();
  const { min, max } = khoangCua("queue.call_back_after_days");
  const ca: [string, Record<string, unknown>, string][] = [
    ["khoá không có trong sổ", { "queue.khong_co": 1 }, "queue.khong_co"],
    ["khoá map", { "queue.groups": [] }, "queue.groups"],
    ["họ khoá", { "labels.field.unitNumber": "Mã căn" }, "labels.field.unitNumber"],
    ["khoá chưa mở", { "customer_page.off_compound_address": "hide" }, "customer_page.off_compound_address"],
    ["sai kiểu", { [NHAN]: "20" }, NHAN],
    ["dưới biên", { "queue.call_back_after_days": min - 1 }, "queue.call_back_after_days"],
    ["trên biên", { "queue.call_back_after_days": max + 1 }, "queue.call_back_after_days"],
    ["một đúng một sai", { "share.stale_warning_days": 10, [NHAN]: 0 }, NHAN],
  ];
  const n0 = (await suKien(a)).length;
  for (const [ten, body, khoa] of ca) {
    const r = await doi(a, body);
    const t = await r.text();
    assert.equal(r.status, 400, `${ten}: ${t}`);
    const j = JSON.parse(t) as { error: string; reason: string };
    assert.equal(j.error, "invalid-settings", ten);
    assert.ok(j.reason.includes(khoa), `${ten}: ${j.reason}`);
    if (ten === "một đúng một sai") assert.ok(!j.reason.includes("share.stale_warning_days"), j.reason);
  }
  assert.equal((await suKien(a)).length, n0, "lệnh bị từ chối đã ghi sự kiện");
  assert.equal(await banHienHanh(a, "share.stale_warning_days"), undefined, "khoá đúng của lệnh hỏng đã được ghi");
  for (const v of [min, max]) {
    const r = await doi(a, { "queue.call_back_after_days": v });
    assert.equal(r.status, 200, `biên ${v}: ${await r.clone().text()}`);
  }
});

// ---- E5a ----
test("cấu hình sàn: một nửa cặp hạn trái luật bị từ chối (Ngoài-5 hàng 81)", async () => {
  const a = await sanMoi();
  const hai = (s: string) => s.includes(NHAN) && s.includes(GOI);
  const n0 = (await suKien(a)).length;
  let r = await doi(a, { [NHAN]: 60 });
  let j = (await r.json()) as { error: string; reason: string };
  assert.equal(r.status, 400);
  assert.equal(j.error, "invalid-settings");
  assert.ok(hai(j.reason), j.reason);
  assert.equal((await suKien(a)).length, n0);
  let ban = await doc(a);
  assert.deepEqual([gia(ban, NHAN)!.value, gia(ban, GOI)!.value], [15, 30]);

  r = await doi(a, { [NHAN]: 45, [GOI]: 60 });
  assert.equal(r.status, 200, await r.clone().text());
  ban = await doc(a);
  assert.deepEqual([gia(ban, NHAN)!.value, gia(ban, GOI)!.value], [45, 60]);
  assert.equal((await suKien(a)).length, n0 + 2);

  r = await doi(a, { [GOI]: 40 });
  j = (await r.json()) as { error: string; reason: string };
  assert.equal(r.status, 400);
  assert.ok(hai(j.reason), j.reason);
});

// ---- E5c ----
test("cấu hình sàn: dòng cặp hạn trái luật có sẵn — GET báo, lead không mang 60/30", async () => {
  const a = await sanMoi();
  // Dòng «có từ trước», không qua lối kiểm.
  const chenThang = (v: number) =>
    appPool.query(
      `insert into company_settings (company_id, key, value, updated_by) values ($1, $2, $3::jsonb, $4)
       on conflict (company_id, key) do update set value = excluded.value`,
      [a.companyId, NHAN, JSON.stringify(v), a.nguoi.qt.userId],
    );
  await chenThang(60);
  const ban = await doc(a, "ts");
  assert.deepEqual([gia(ban, NHAN)!.value, gia(ban, GOI)!.value], [15, 30]);
  assert.equal(gia(ban, NHAN)!.source, "default");
  assert.equal(ban.errors.length, 1, ban.errors.join(" | "));
  assert.ok(ban.errors[0]!.includes(NHAN) && ban.errors[0]!.includes(GOI), ban.errors[0]);
  const l1 = await nhap(a);
  await nhip(a);
  const h1 = await hanLead(l1);
  assert.deepEqual([h1.accept_minutes, h1.first_call_minutes], [15, 30]);
  assert.notEqual(h1.accept_minutes, 60);

  // Đối chứng dương: dòng hạn nhận 20 hợp luật thì lead mới mang 20/30, không lỗi.
  await chenThang(20);
  assert.deepEqual((await doc(a)).errors, []);
  const l2 = await nhap(a);
  await nhip(a);
  const h2 = await hanLead(l2);
  assert.deepEqual([h2.accept_minutes, h2.first_call_minutes], [20, 30]);
});

// ---- E6 c ----
test("cấu hình sàn: ba lối ghi đều vào nhật ký, ghi người và vai", async () => {
  const a = await sanMoi();
  const kiemSuKien = (e: SuKien, key: string, value: unknown) => {
    assert.deepEqual({ key: e.key, value: e.value, actor: e.actor_user_id }, { key, value, actor: a.nguoi.qt.userId });
    assert.ok(e.actor_roles.includes("company_admin"), `${key}: ${JSON.stringify(e.actor_roles)}`);
    assert.ok(e.at instanceof Date);
  };
  const n0 = (await suKien(a)).length;
  let r = await send("PUT", "/api/v1/company/settings/lead-routing", { acceptMinutes: 20, firstCallMinutes: 40 }, a.nguoi.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  let sk = await suKien(a);
  assert.equal(sk.length, n0 + 2);
  assert.deepEqual(sk.slice(-2).map((x) => x.key).sort(), [NHAN, GOI].sort());
  for (const e of sk.slice(-2)) kiemSuKien(e, e.key, e.key === NHAN ? 20 : 40);

  r = await send("GET", "/api/v1/company/settings/queue", undefined, a.nguoi.qt.cookie);
  const { groups } = (await r.json()) as { groups: unknown };
  r = await send("PUT", "/api/v1/company/settings/queue", { groups }, a.nguoi.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  sk = await suKien(a);
  assert.equal(sk.length, n0 + 3);
  kiemSuKien(sk.at(-1)!, "queue.groups", groups);

  r = await doi(a, { "queue.call_back_after_days": 21 });
  assert.equal(r.status, 200);
  sk = await suKien(a);
  assert.equal(sk.length, n0 + 4);
  kiemSuKien(sk.at(-1)!, "queue.call_back_after_days", 21);
});

// ---- E6 d ----
test("cấu hình sàn: dòng có trước 026 được chép bù", async () => {
  const url = process.env.DATABASE_URL!;
  const db = `qh_chts_${RUN}`;
  const u = new URL(url);
  u.pathname = `/${db}`;
  const urlTam = u.toString();
  const voi = async <T>(dich: string, fn: (c: pg.Client) => Promise<T>) => {
    const c = new pg.Client({ connectionString: dich });
    await c.connect();
    try {
      return await fn(c);
    } finally {
      await c.end();
    }
  };
  const DIR = fileURLToPath(new URL("../../db/migrations/", import.meta.url));
  const tep = readdirSync(DIR).filter((f) => /^\d{3}_.+\.sql$/.test(f)).sort();
  const truoc026 = tep.filter((f) => f < "026_");
  await voi(url, (c) => c.query(`create database ${db}`));
  try {
    // Áp các migration số < 026 như migrate.mjs: mỗi tệp một giao dịch, ghi sổ.
    await voi(urlTam, async (c) => {
      await c.query("create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())");
      for (const f of truoc026) {
        await c.query("begin");
        await c.query(readFileSync(`${DIR}${f}`, "utf8"));
        await c.query("insert into public.schema_migrations (name) values ($1)", [f]);
        await c.query("commit");
      }
      assert.equal((await c.query("select to_regclass('public.company_settings_events') t")).rows[0].t, null, "bảng sự kiện có trước 026");
      const san = (await c.query<{ id: string }>("insert into companies (name) values ('[Sàn chép bù]') returning id")).rows[0]!.id;
      await c.query(
        `insert into company_settings (company_id, key, value, updated_by, updated_at) values
         ($1, 'lead_routing.accept_minutes', '20', 'u-chep-bu-1', '2026-10-01T00:00:00Z'),
         ($1, 'queue.call_back_after_days', '21', 'u-chep-bu-2', '2026-10-02T00:00:00Z')`,
        [san],
      );
    });
    const r = spawnSync(process.execPath, [fileURLToPath(new URL("../../db/scripts/migrate.mjs", import.meta.url))], {
      env: { ...process.env, DATABASE_URL: urlTam },
      encoding: "utf8",
    });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    const sk = await voi(urlTam, async (c) =>
      (await c.query("select key, value, actor_user_id, at from company_settings_events order by key")).rows,
    );
    assert.deepEqual(sk, [
      { key: "lead_routing.accept_minutes", value: 20, actor_user_id: "u-chep-bu-1", at: new Date("2026-10-01T00:00:00Z") },
      { key: "queue.call_back_after_days", value: 21, actor_user_id: "u-chep-bu-2", at: new Date("2026-10-02T00:00:00Z") },
    ]);
  } finally {
    await voi(url, (c) => c.query(`drop database if exists ${db} with (force)`));
  }
});

// ---- E7 ----
test("cấu hình sàn: lớp theo sổ", async () => {
  const a = await sanMoi();
  const r = await doi(a, { "queue.call_back_after_days": 20 });
  assert.equal(r.status, 200);
  const lop = SO_DIEM.find((d) => d.khoa === "queue.call_back_after_days")!.lop;
  assert.equal((await banHienHanh(a, "queue.call_back_after_days"))?.data_class, lop);
  assert.equal((await suKien(a)).at(-1)!.data_class, lop);
});

// ---- E8 ----
test("cấu hình sàn: lead cũ giữ hạn 15, lead mới mang 20", async () => {
  const a = await sanMoi();
  assert.equal(macDinhSo(NHAN), 15);
  const l1 = await nhap(a);
  await nhip(a);
  assert.equal((await hanLead(l1)).accept_minutes, 15, "lead đầu được đóng dấu lúc chia");
  const r = await doi(a, { [NHAN]: 20 });
  assert.equal(r.status, 200, await r.clone().text());
  const l2 = await nhap(a);
  await nhip(a);
  assert.equal((await hanLead(l1)).accept_minutes, 15);
  assert.equal((await hanLead(l2)).accept_minutes, 20);
});
