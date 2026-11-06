// Thuế phí trên Postgres thật (hàng 49: E2b, E3, E4, E7a). Màn lưu qua lối chung PATCH /api/v1/company/settings; giá ghi
// qua ba lối thật — lệnh của hàng (sửa trên ô, màn cuộc gọi), lần nhập file, lệnh mang madeOffline (đồng bộ khi có mạng
// lại); dấu do migration 050 đóng. Kết nối chủ chỉ đọc nhật ký, sự kiện và dấu. Tên `[Tên]`, không số thật.
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import pg from "pg";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

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

type Vai = "qt" | "tn" | "dc" | "dk" | "ts";
type San = { companyId: string; nguoi: Record<Vai, { userId: string; cookie: string }> };
let soSan = 0;
async function sanMoi(): Promise<San> {
  const nhan = `tp${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} thue-phi ${nhan}]`, qtEmail);
  const nguoi = { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}` } } as San["nguoi"];
  for (const [k, vai] of [
    ["tn", ["team_lead"]],
    ["dc", ["listing_agent"]],
    ["dk", ["buyer_agent"]],
    ["ts", ["telesales"]],
  ] as const) {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  }
  return { companyId: s.companyId, nguoi };
}

const BA_KHOAN = ["personalIncomeTax", "registrationFee", "brokerageFee"];
const MAC_DINH = { personalIncomeTax: 200, registrationFee: 50, brokerageFee: 100 };
const KHOA_PHI = ["fee.brokerage_pct", "fee.inclusion", "fee.personal_income_tax_pct"] as const;

type Ban = { items: { key: string; value: unknown }[] };
const doc = async (san: San): Promise<Record<string, unknown>> => {
  const r = await send("GET", "/api/v1/company/settings", undefined, san.nguoi.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return Object.fromEntries(((await r.json()) as Ban).items.filter((x) => x.key.startsWith("fee.")).map((x) => [x.key, x.value]));
};
const doi = (san: San, body: unknown, vai: Vai = "qt") => send("PATCH", "/api/v1/company/settings", body, san.nguoi[vai].cookie);
const suKien = async (san: San) =>
  (await appPool.query<{ key: string; actor_user_id: string; actor_roles: string[] }>("select key, actor_user_id, actor_roles from company_settings_events where company_id = $1 order by id", [san.companyId])).rows;

let soCan = 0;
const maCan = () => `A-${String(40 + Math.floor(soCan / 6)).padStart(2, "0")}.${String((soCan++ % 6) + 1).padStart(2, "0")}`;
async function canMoi(san: San): Promise<{ id: string; version: number }> {
  const r = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: maCan() }, san.nguoi.dc.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; version: number };
}
async function datGia(san: San, h: { id: string; version: number }, feeInclusion: "included" | "excluded", extra: Record<string, unknown> = {}) {
  const r = await send(
    "POST",
    `/api/v1/listings/${h.id}/events`,
    { type: "price_changed", payload: { listPrice: 3_000_000_000, feeInclusion }, expectedVersion: h.version, ...extra },
    san.nguoi.dc.cookie,
  );
  assert.equal(r.status, 200, await r.clone().text());
  h.version++;
}

type Dau = { seq: number; included_items: string[]; rates: Record<string, number>; computed_at: Date; occurred_at: Date; made_offline: boolean };
const dauGia = async (listingId: string): Promise<Dau[]> =>
  (
    await appPool.query<Dau>(
      `select e.seq, d.included_items, d.rates, d.computed_at, e.occurred_at, e.made_offline
         from listing_events e left join listing_price_fee_basis d on d.company_id = e.company_id and d.listing_id = e.listing_id and d.seq = e.seq
        where e.listing_id = $1 and e.type = 'price_changed' order by e.seq`,
      [listingId],
    )
  ).rows;

test("thuế phí: lưu môi giới và định nghĩa, mỗi khoá một sự kiện", async () => {
  const san = await sanMoi();
  const truoc = (await suKien(san)).length;
  const r = await doi(san, { "fee.brokerage_pct": 2, "fee.inclusion": ["personalIncomeTax", "brokerageFee"] });
  assert.equal(r.status, 200, await r.clone().text());
  const ban = await doc(san);
  assert.equal(ban["fee.brokerage_pct"], 2);
  assert.deepEqual(ban["fee.inclusion"], ["personalIncomeTax", "brokerageFee"]);
  const moi = (await suKien(san)).slice(truoc);
  assert.deepEqual(moi.map((e) => e.key).sort(), ["fee.brokerage_pct", "fee.inclusion"]);
  for (const e of moi) {
    assert.equal(e.actor_user_id, san.nguoi.qt.userId);
    assert.ok(e.actor_roles.includes("company_admin"));
  }
  // Chiều đỏ: ba giá trị sai đều 400 nêu khoá, không ghi gì.
  const sau = (await suKien(san)).length;
  for (const [body, dau] of [
    [{ "fee.brokerage_pct": 6 }, "fee.brokerage_pct: "],
    [{ "fee.inclusion": [] }, "fee.inclusion: "],
    [{ "fee.personal_income_tax_pct": 3 }, "fee.personal_income_tax_pct: "],
  ] as const) {
    const sai = await doi(san, body);
    assert.equal(sai.status, 400, JSON.stringify(body));
    const { reason } = (await sai.json()) as { reason: string };
    assert.ok(reason.startsWith(dau), `${JSON.stringify(body)}: lý do «${reason}»`);
  }
  assert.deepEqual(await doc(san), ban, "cấu hình không đổi sau ba lần sai");
  assert.equal((await suKien(san)).length, sau, "nhật ký không thêm dòng");
});

test("thuế phí: vai khác không đổi được", async () => {
  const san = await sanMoi();
  const truoc = await doc(san);
  const GIA_TRI: Record<(typeof KHOA_PHI)[number], unknown> = {
    "fee.brokerage_pct": 1.5,
    "fee.inclusion": ["personalIncomeTax"],
    "fee.personal_income_tax_pct": 2,
  };
  let so = 0;
  for (const vai of ["tn", "dc", "dk", "ts"] as const) {
    for (const khoa of KHOA_PHI) {
      const r = await doi(san, { [khoa]: GIA_TRI[khoa] }, vai);
      assert.equal(r.status, 403, `${vai} × ${khoa}`);
      so++;
    }
  }
  assert.equal(so, 12);
  assert.deepEqual(await doc(san), truoc);
  // Đối chứng dương: quản trị sàn đổi được.
  assert.equal((await doi(san, { "fee.brokerage_pct": 1.5 })).status, 200);
});

let soTep = 0;
let soNhap = 0;
/** Mã căn có trong danh mục mẫu (`SAMPLE_CATALOG`) — lần nhập chỉ ghi căn khớp danh mục. */
const maNhap = () => `A-${String(Math.floor(soNhap / 6) + 1).padStart(2, "0")}.${String((soNhap++ % 6) + 1).padStart(2, "0")}`;
async function nhapMotCan(san: San, ma: string): Promise<string> {
  const tieuDe: Cell[] = ["Toà", "Mã căn", "Giá", "Phí"];
  const dong: Cell[] = ["Toà A", ma, "3 tỷ", "bao phí"];
  const bang = readTable([tieuDe, dong]);
  const mo = await send(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-thue-phi-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: [{ row: 2, buildingName: "Toà A", unitNumber: ma }],
    },
    san.nguoi.dc.cookie,
  );
  assert.equal(mo.status, 201, await mo.clone().text());
  const { id } = (await mo.json()) as { id: string };
  const r = await send("POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows: [{ row: 2, cells: dong }] }, san.nguoi.dc.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const kq = (await r.json()) as { rows: { action: string; listingId?: string }[] };
  assert.equal(kq.rows[0]?.action, "create", JSON.stringify(kq));
  return kq.rows[0]!.listingId!;
}

test("thuế phí: giá bao phí mang định nghĩa lúc ghi ở mọi lối", async () => {
  const san = await sanMoi();
  const x = await canMoi(san);
  await datGia(san, x, "included");
  const [dauX] = await dauGia(x.id);
  assert.deepEqual([dauX!.included_items, dauX!.rates], [BA_KHOAN, MAC_DINH], "X mang mặc định");
  const t1 = dauX!.computed_at.toISOString();

  // Một sự kiện làm lúc mất mạng: mở hàng trước lần đổi, đẩy lên sau lần đổi.
  const y = await canMoi(san);
  assert.equal((await doi(san, { "fee.brokerage_pct": 2, "fee.inclusion": ["personalIncomeTax", "brokerageFee"] })).status, 200);

  const BA_LOI = ["sửa trên ô", "lần nhập file", "đồng bộ khi có mạng lại"] as const;
  await datGia(san, y, "included");
  const yNhap = await nhapMotCan(san, maNhap());
  await datGia(san, y, "included", { madeOffline: true });
  const cacDau = [(await dauGia(y.id))[0]!, ...(await dauGia(yNhap)), (await dauGia(y.id))[1]!];
  assert.equal(cacDau.length, BA_LOI.length, "mỗi lối đúng một sự kiện giá");
  let so = 0;
  for (const [i, d] of cacDau.entries()) {
    assert.deepEqual(d.included_items, ["personalIncomeTax", "brokerageFee"], `${BA_LOI[i]}: khoản`);
    assert.deepEqual(d.rates, { personalIncomeTax: 200, registrationFee: 50, brokerageFee: 200 }, `${BA_LOI[i]}: tỉ lệ`);
    assert.equal(d.computed_at.toISOString(), d.occurred_at.toISOString(), `${BA_LOI[i]}: ngày tính = lúc vào máy chủ`);
    so += 3;
  }
  assert.equal(so, 9);
  assert.equal(cacDau[2]!.made_offline, true, "lối đồng bộ mang cờ làm lúc mất mạng");

  // X giữ nguyên dấu cũ.
  const [xSau] = await dauGia(x.id);
  assert.deepEqual([xSau!.included_items, xSau!.rates, xSau!.computed_at.toISOString()], [BA_KHOAN, MAC_DINH, t1]);

  // Z không bao phí: không dấu.
  const z = await canMoi(san);
  await datGia(san, z, "excluded");
  assert.equal((await dauGia(z.id))[0]!.included_items, null);

  // Môi giới 1,5% đóng là 150 phần vạn; một ô hỏng rơi về mặc định khoá ấy, lần ghi giá vẫn qua.
  assert.equal((await doi(san, { "fee.brokerage_pct": 1.5 })).status, 200);
  const w = await canMoi(san);
  await datGia(san, w, "included");
  assert.equal((await dauGia(w.id))[0]!.rates.brokerageFee, 150);
  await appPool.query("update company_settings set value = '\"hai\"'::jsonb where company_id = $1 and key = 'fee.brokerage_pct'", [san.companyId]);
  await datGia(san, w, "included");
  assert.equal((await dauGia(w.id))[1]!.rates.brokerageFee, 100, "ô hỏng → mặc định môi giới");

  // Chiều đỏ: vai API không ghi, sửa, xoá được dấu.
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', $2, true)", [san.companyId, san.nguoi.dc.userId]);
    for (const sql of [
      `insert into listing_price_fee_basis (company_id, listing_id, seq, included_items, rates, computed_at) values ('${san.companyId}', '${x.id}', 99, '{}', '{}', now())`,
      `update listing_price_fee_basis set rates = '{}' where listing_id = '${x.id}'`,
      `delete from listing_price_fee_basis where listing_id = '${x.id}'`,
    ]) {
      await c.query("savepoint s");
      await assert.rejects(c.query(sql), /permission denied/, sql.slice(0, 6));
      await c.query("rollback to savepoint s");
    }
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
});

test("thuế phí: lối đọc dấu của giá hiện hành", async () => {
  const san = await sanMoi();
  const doc1 = async (id: string, vai: Vai = "dc", s: San = san) => send("GET", `/api/v1/listings/${id}/fee-basis`, undefined, s.nguoi[vai].cookie);
  const h = await canMoi(san);
  const chuaGia = await doc1(h.id);
  assert.equal(chuaGia.status, 200);
  assert.equal(await chuaGia.json(), null, "chưa giá → null");
  await datGia(san, h, "included");
  const luc = (await dauGia(h.id))[0]!.occurred_at.toISOString();
  assert.equal((await doi(san, { "fee.brokerage_pct": 2 })).status, 200);
  const r = await doc1(h.id);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { includedItems: BA_KHOAN, rates: MAC_DINH, computedAt: luc }, "giá ghi trước lần đổi giữ dấu cũ");
  await datGia(san, h, "included");
  assert.equal(((await (await doc1(h.id)).json()) as { rates: Record<string, number> }).rates.brokerageFee, 200, "giá mới mang môi giới mới");
  const z = await canMoi(san);
  await datGia(san, z, "excluded");
  assert.equal(await (await doc1(z.id)).json(), null, "không bao phí → null");
  const khac = await sanMoi();
  assert.equal((await doc1(h.id, "dc", khac)).status, 404, "người sàn khác");
});
