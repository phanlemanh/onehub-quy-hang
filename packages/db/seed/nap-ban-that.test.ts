// Bộ nạp mẫu cho bản thật (hàng 87) trên Postgres dãy — E1–E7, E9, E12 của hồ sơ nap-mau-ban-that.
// Chạy: node --import tsx --test "packages/db/seed/*.test.ts" (cần DATABASE_URL tới Postgres đã áp migration).
import { randomBytes, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import type pg from "pg";

// Khoá thử và bản thật giả lập phải đặt TRƯỚC khi nạp mô-đun API (createApi, createLead đọc khoá từ môi trường).
const KHOA_THU = randomBytes(32).toString("base64");
process.env.OWNER_PHONE_KEY = KHOA_THU;
process.env.NODE_ENV = "production";

const { createApi } = await import("../../api/src/app");
const { KHOA_DEV } = await import("../../api/src/owners/khoa");
const { dauVetSo, giaiMaSo, maHoaSo, nguCanhChuNha, nguCanhLead } = await import("../../api/src/owners/ma-hoa");
const h = await import("../../api/test-db/helpers");
const { TEN_SAN, MIEN_EMAIL } = await import("./du-lieu-mau.mjs");
const { goBanThat, napBanThat, timSanMau } = await import("./nap-ban-that");
type GoiMau = import("./nap-ban-that").GoiMau;

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const TEP_NAP = path.join(THU_MUC, "nap-ban-that.ts");
const GOI: GoiMau = JSON.parse(readFileSync(path.join(THU_MUC, "mau/du-lieu-mau.json"), "utf8"));
const khoa = { key: Buffer.from(KHOA_THU, "base64") };
const pool = h.appPool;
const EMAIL_CHU_KHO = h.mail("chu-kho");
const so = (s: string) => s.replace(/\s/g, "");
// Viết tay, không chép từ VAI_CHU_KHO: thước so với chính hằng số của bộ nạp thì không bao giờ đỏ (Hỏi-2 hàng 87).
const VAI_MONG = ["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"];
const ban = <T>(x: T): T => structuredClone(x);

/** Một giao dịch vai chủ; `giu` false thì rollback (để thử mà không để lại gì). */
async function gd<T>(fn: (c: pg.PoolClient) => Promise<T>, giu = true): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query("begin");
    const kq = await fn(c);
    await c.query(giu ? "commit" : "rollback");
    return kq;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
const nap = (goi = GOI, email = EMAIL_CHU_KHO) => gd((c) => napBanThat(c, goi, { khoa, email }));
const go = () => gd((c) => goBanThat(c));

/** Ảnh chụp mọi bảng của schema public và identity, mọi cột, thứ tự cố định. */
async function chup(): Promise<Record<string, string[]>> {
  const { rows } = await pool.query<{ s: string; t: string }>(
    `select table_schema s, table_name t from information_schema.tables
     where table_schema in ('public', 'identity') and table_type = 'BASE TABLE' order by 1, 2`,
  );
  const anh: Record<string, string[]> = {};
  for (const { s, t } of rows) {
    anh[`${s}.${t}`] = (await pool.query<{ r: string }>(`select row_to_json(x)::text r from "${s}"."${t}" x order by 1`)).rows.map((r) => r.r);
  }
  return anh;
}
/** Bảng nào lệch giữa hai ảnh — thông điệp của phép so. */
function bangLech(a: Record<string, string[]>, b: Record<string, string[]>): string[] {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

function chayCli(args: string[], env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, ["--import", "tsx", TEP_NAP, ...args], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

let sanThat = "";
let chuKhoId = "";

before(async () => {
  assert.deepEqual(await gd(timSanMau), [], "Postgres dãy đang có sàn mẫu — gỡ trước khi chạy bộ kiểm");
  // Sàn thật cạnh bên: chủ kho là quản trị, có một hàng, một chủ nhà, một lead (ghi thẳng bằng vai chủ).
  const s = await h.openCompany(`[Sàn ${h.RUN} thật]`, EMAIL_CHU_KHO);
  sanThat = s.companyId;
  chuKhoId = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [EMAIL_CHU_KHO])).rows[0]!.id;
  const hang = randomUUID();
  const lead = randomUUID();
  const soThat = "0900000098";
  await gd(async (c) => {
    await c.query(
      `insert into listings (id, company_id, building_name, unit_number, standard_status, version) values ($1, $2, 'Toà A', 'A-01.01', 'Incomplete', 1)`,
      [hang, sanThat],
    );
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 1, 'created', '{}', $3, '{company_admin}', false)`,
      [sanThat, hang, chuKhoId],
    );
    await c.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, updated_by) values ($1, $2, '[Tên]', $3, $4, $5)`,
      [sanThat, hang, maHoaSo(soThat, nguCanhChuNha(sanThat, hang), khoa), dauVetSo(soThat, sanThat, khoa), chuKhoId],
    );
    await c.query(
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                          owner_phone_enc, owner_phone_hash, outcome)
       values ($1, $2, $3, 'Toà A', 'sale', 1000000000, 'excluded', 'now', $4, $5, 'new')`,
      [lead, sanThat, chuKhoId, maHoaSo(soThat, nguCanhLead(sanThat, lead), khoa), dauVetSo(soThat, sanThat, khoa)],
    );
  });
});

after(async () => {
  await go();
  await h.cleanup();
});

test("nap-du-goi: đủ người, khu, hàng sáu trạng thái, chủ nhà, lead, người phụ trách (E1)", async () => {
  const { san, moi } = await nap();
  assert.deepEqual(moi, { hang: 40, chuNha: 40, lead: 12 });
  const q = async <T extends pg.QueryResultRow>(sql: string) => (await pool.query<T>(sql, [san])).rows;
  const vai = await q<{ email: string; roles: string[] }>(
    `select u.email, m.roles from company_members m join identity."user" u on u.id = m.user_id where m.company_id = $1 and u.email like '%@${MIEN_EMAIL}'`,
  );
  assert.deepEqual(
    Object.fromEntries(vai.map((v) => [v.email, v.roles])),
    Object.fromEntries(GOI.nguoi.map((n) => [n.email, n.vai])),
  );
  assert.equal((await q("select 1 from company_zones where company_id = $1")).length, 2);
  const dem = Object.fromEntries((await q<{ s: string; n: number }>("select standard_status s, count(*)::int n from listings where company_id = $1 group by 1")).map((r) => [r.s, r.n]));
  assert.deepEqual(dem, { Active: 14, Incomplete: 6, Pending: 5, Closed: 5, Hold: 5, Withdrawn: 5 }, "phân bố trạng thái lệch gói");

  const hang = await q<{ unit_number: string; list_price: string; dau_chu: string; tao: number; chu: string }>(
    `select l.unit_number, l.list_price::text, u.email dau_chu,
            (select count(*)::int from listing_events e where e.listing_id = l.id and e.type = 'created') tao, o.owner_name chu
     from listings l
     join lateral (select user_id from listing_agent_assignments a where a.listing_id = l.id order by seq desc limit 1) a on true
     join identity."user" u on u.id = a.user_id
     join listing_owners o on o.listing_id = l.id
     where l.company_id = $1`,
  );
  assert.equal(hang.length, 40);
  const theoCan = new Map(hang.map((r) => [r.unit_number, r]));
  const emailCua = new Map(GOI.nguoi.map((n) => [n.khoa, n.email]));
  const tenChu = new Map(GOI.chuNha.map((c) => [c.ma, c.ten]));
  for (const g of GOI.hang) {
    const r = theoCan.get(g.maCan);
    assert.ok(r, `${g.ma}: thiếu hàng ${g.maCan}`);
    assert.equal(r.list_price, String(g.gia), `${g.ma}: giá`);
    assert.equal(r.tao, 1, `${g.ma}: sự kiện tạo`);
    assert.equal(r.dau_chu, emailCua.get(g.dauChu), `${g.ma}: đầu chủ phụ trách`);
    assert.equal(r.chu, tenChu.get(g.chuNha), `${g.ma}: chủ nhà`);
  }
  assert.equal(new Set(hang.map((r) => r.chu)).size, 30);

  const lead = await q<{ unit_number: string | null; outcome: string }>("select unit_number, outcome from leads where company_id = $1");
  assert.equal(lead.length, 12);
  const ketQua = (ma: string) => {
    const g = GOI.lead.find((l) => l.ma === ma)!;
    return lead.filter((l) => l.unit_number === g.maCan).map((l) => l.outcome);
  };
  assert.deepEqual(ketQua("L-01"), ["unit_has_open_listing"], "L-01");
  assert.deepEqual(ketQua("L-02"), ["owner_has_agent"], "L-02");
  assert.equal(lead.filter((l) => l.outcome === "new").length, 10);
  await go();
});

test("trung-do-luat-tinh: đổi dữ liệu thì kết quả trùng đổi theo (E1 chiều đỏ)", async () => {
  const goi = ban(GOI);
  const l1 = goi.lead.find((l) => l.ma === "L-01")!;
  goi.hang.find((x) => x.maCan === l1.maCan)!.trangThai = "Closed";
  const l2 = goi.lead.find((l) => l.ma === "L-02")!;
  goi.chuNha.find((c) => so(c.soDienThoai) === so(l2.soDienThoai))!.soDienThoai = "0900 000 099";
  const { san } = await nap(goi);
  const kq = Object.fromEntries(
    (await pool.query<{ unit_number: string; outcome: string }>("select unit_number, outcome from leads where company_id = $1 and unit_number = any($2)", [san, [l1.maCan, l2.maCan]])).rows.map((r) => [r.unit_number, r.outcome]),
  );
  assert.deepEqual(kq, { [l1.maCan!]: "new", [l2.maCan!]: "new" }, "L-01, L-02 phải ra new khi hàng mở và số chủ không còn");
  await go();
});

test("chi-ban-ma: số chủ và số lead chỉ là bản mã đúng ngữ cảnh (E2)", async () => {
  const { san } = await nap();
  const chu = (await pool.query<{ listing_id: string; owner_phone: string | null; enc: Buffer; hash: Buffer; unit_number: string }>(
    `select o.listing_id, o.owner_phone, o.owner_phone_enc enc, o.owner_phone_hash hash, l.unit_number
     from listing_owners o join listings l on l.id = o.listing_id where o.company_id = $1`, [san])).rows;
  assert.equal(chu.length, 40);
  const soCua = new Map(GOI.hang.map((g) => [g.maCan, so(GOI.chuNha.find((c) => c.ma === g.chuNha)!.soDienThoai)]));
  for (const r of chu) {
    assert.equal(r.owner_phone, null);
    assert.equal(giaiMaSo(r.enc, nguCanhChuNha(san, r.listing_id), khoa), soCua.get(r.unit_number), "đối chứng dương: giải đúng số");
    assert.ok(r.hash.equals(dauVetSo(soCua.get(r.unit_number)!, san, khoa)), "dấu vết");
  }
  assert.ok(chu.length >= 2);
  const a = chu[0]!;
  const b = chu[1]!;
  assert.throws(() => giaiMaSo(a!.enc, nguCanhChuNha(san, a!.listing_id), { key: randomBytes(32) }), "khoá khác phải không giải được");
  assert.throws(() => giaiMaSo(a!.enc, nguCanhChuNha(san, b!.listing_id), khoa), "bản mã chép sang dòng khác phải không giải được");
  const lead = (await pool.query<{ id: string; owner_phone: string | null; enc: Buffer; hash: Buffer }>(
    "select id, owner_phone, owner_phone_enc enc, owner_phone_hash hash from leads where company_id = $1", [san])).rows;
  const soLead = new Set(GOI.lead.map((l) => so(l.soDienThoai)));
  for (const r of lead) {
    assert.equal(r.owner_phone, null);
    const s = giaiMaSo(r.enc, nguCanhLead(san, r.id), khoa);
    assert.ok(soLead.has(s));
    assert.ok(r.hash.equals(dauVetSo(s, san, khoa)));
  }
  await go();
});

test("khoa-sai: khoá vắng, sai dạng, khoá dev thì không ghi gì (E3)", async () => {
  const truoc = await chup();
  const ca: [string, string | undefined][] = [
    ["vắng", undefined],
    ["sai dạng", "abc"],
    ["khoá dev", KHOA_DEV.key.toString("base64")],
  ];
  for (const [ten, gia] of ca) {
    const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], { OWNER_PHONE_KEY: gia });
    assert.notEqual(r.status, 0, `${ten}: phải thoát khác 0`);
    assert.match(r.stderr, /OWNER_PHONE_KEY/, `${ten}: thông điệp nêu tên biến`);
    if (gia) assert.ok(!r.stderr.includes(gia), `${ten}: thông điệp không chứa giá trị khoá`);
  }
  assert.deepEqual(bangLech(truoc, await chup()), []);
  const ok = chayCli(["--nap", "--email", EMAIL_CHU_KHO], {});
  assert.equal(ok.status, 0, `đối chứng dương: khoá hợp lệ — ${ok.stderr}`);
  await go();
});

test("chay-lai: lần hai không đổi một dòng (E4)", async () => {
  await nap();
  const a = await chup();
  const { moi } = await nap();
  assert.deepEqual(moi, { hang: 0, chuNha: 0, lead: 0 });
  const b = await chup();
  assert.deepEqual(bangLech(a, b), [], "chạy lại đổi bảng");
  // Chiều đỏ của phép so: sửa một dòng thì ảnh chụp phải lệch đúng bảng ấy.
  const [san] = await gd(timSanMau);
  await pool.query("update listings set list_price = list_price + 1 where id = (select id from listings where company_id = $1 limit 1)", [san]);
  assert.deepEqual(bangLech(b, await chup()), ["public.listings"]);
  await go();
});

test("email-chu-kho: tạo, giữ sàn thật, chuẩn hoá, đặt lại vai, từ chối email lạ (E5)", async () => {
  // Đã là quản trị sàn thật: giữ nguyên dòng ấy, thêm dòng sàn mẫu đủ vai.
  const thanhVienThat = async () => (await pool.query("select roles from company_members where company_id = $1 and user_id = $2", [sanThat, chuKhoId])).rows;
  const vaiThat = await thanhVienThat();
  const { san } = await nap(GOI, `  ${EMAIL_CHU_KHO.toUpperCase()} `);
  assert.deepEqual(await thanhVienThat(), vaiThat, "dòng thành viên sàn thật không đổi");
  const vaiMau = async (u: string) => (await pool.query<{ roles: string[] }>("select roles from company_members where company_id = $1 and user_id = $2", [san, u])).rows[0]?.roles;
  assert.deepEqual(await vaiMau(chuKhoId), VAI_MONG, "email-chuan-hoa: khớp tài khoản đã có");
  // vai-chu-kho-dat-lai: vai cũ khác bị đặt lại, lần sau không đổi.
  await pool.query("update company_members set roles = '{company_admin}' where company_id = $1 and user_id = $2", [san, chuKhoId]);
  await nap();
  assert.deepEqual(await vaiMau(chuKhoId), VAI_MONG);
  // Email mới: tài khoản được tạo.
  const moi = h.mail("chu-kho-moi");
  await nap(GOI, moi);
  const idMoi = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [moi])).rows[0]?.id;
  assert.ok(idMoi, "tài khoản mới phải được tạo");
  assert.deepEqual(await vaiMau(idMoi), VAI_MONG);
  // Email sai dạng, miền mẫu: từ chối trước khi ghi.
  const truoc = await chup();
  for (const e of ["abc", `x@${MIEN_EMAIL}`]) await assert.rejects(nap(GOI, e), /email chủ kho/);
  assert.deepEqual(bangLech(truoc, await chup()), []);
  // Đầu ra lệnh không chứa email; kho không chứa email thử.
  const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], {});
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!(r.stdout + r.stderr).toLowerCase().includes(EMAIL_CHU_KHO), "đầu ra không chứa email");
  const goc = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const timThay = spawnSync("git", ["grep", "-l", "-F", EMAIL_CHU_KHO], { cwd: goc, encoding: "utf8" });
  assert.equal(timThay.stdout.trim(), "", "không tệp nào của kho chứa email chủ kho");
  await go();
  await pool.query('delete from identity."user" where id = $1', [idMoi]);
});

test("go: chỉ sàn mẫu và tài khoản miền mẫu, sàn thật không đổi (E6)", async () => {
  const truoc = await chup();
  assert.deepEqual(await go(), { ket: "khong-co" }, "khong-co");
  assert.deepEqual(bangLech(truoc, await chup()), []);

  await nap();
  const kq = await go();
  assert.equal(kq.ket, "da-go");
  assert.deepEqual(bangLech(truoc, await chup()), [], "sau gỡ phải bằng trước nạp");
  assert.equal((await pool.query("select 1 from identity.\"user\" where email like $1", [`%@${MIEN_EMAIL}`])).rowCount, 0);
  assert.equal((await pool.query("select 1 from company_members where company_id = $1 and user_id = $2", [sanThat, chuKhoId])).rowCount, 1);
});

test("san-that-trung-ten: sàn thật tên mẫu không bị gỡ, không bị nạp vào (E6)", async () => {
  const trung = (await pool.query<{ id: string }>("insert into companies (name) values ($1) returning id", [TEN_SAN])).rows[0]!.id;
  try {
    const truoc = await chup();
    assert.deepEqual(await go(), { ket: "khong-co" });
    assert.deepEqual(bangLech(truoc, await chup()), []);
    const { san } = await nap();
    assert.notEqual(san, trung, "nạp phải dựng sàn mẫu riêng");
    for (const t of ["company_members", "company_zones", "listings", "leads"]) {
      assert.equal((await pool.query(`select 1 from ${t} where company_id = $1`, [trung])).rowCount, 0, `${t} của sàn trùng tên`);
    }
    assert.equal((await go()).ket, "da-go", "đối chứng: sàn mẫu thật vẫn gỡ được");
    assert.equal((await pool.query("select 1 from companies where id = $1", [trung])).rowCount, 1);
  } finally {
    await pool.query("delete from companies where id = $1", [trung]);
  }
});

test("hai-san-mau: hai sàn mẫu khớp thì gỡ từ chối (E6)", async () => {
  await nap();
  const quanTri = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [`quan-tri@${MIEN_EMAIL}`])).rows[0]!.id;
  const hai = (await pool.query<{ id: string }>("insert into companies (name) values ($1) returning id", [TEN_SAN])).rows[0]!.id;
  await pool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{company_admin}')", [hai, quanTri]);
  const truoc = await chup();
  assert.deepEqual(await go(), { ket: "tu-choi", soSan: 2 });
  assert.deepEqual(bangLech(truoc, await chup()), []);
  await pool.query("delete from companies where id = $1", [hai]);
  await go();
});

test("hong-giua-chung: lỗi ở lead cuối rút lại cả lần chạy (E7)", async () => {
  const truoc = await chup();
  const goi = ban(GOI);
  goi.lead.at(-1)!.soDienThoai = "12345";
  await assert.rejects(nap(goi), /L-12/);
  assert.deepEqual(bangLech(truoc, await chup()), [], "không dòng nào được để lại");
  const { moi } = await nap();
  assert.equal(moi.hang, 40, "đối chứng: gói nguyên vẹn nạp được");
  await go();
});

test("doc-cheo: thành viên sàn thật không thấy dòng nào của sàn mẫu (E9)", async () => {
  const { san } = await nap();
  const dauChu = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [`dau-chu-1@${MIEN_EMAIL}`])).rows[0]!.id;
  const doc = (user: string, company: string) =>
    gd(async (c) => {
      await c.query("set local role quy_hang_app");
      await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [user, company]);
      const dem: Record<string, number> = {};
      for (const t of ["listings", "listing_owners", "leads", "listing_events"]) {
        dem[t] = (await c.query(`select 1 from ${t} where company_id = $1`, [san])).rowCount ?? 0;
      }
      return dem;
    }, false);
  assert.deepEqual(await doc(chuKhoId, sanThat), { listings: 0, listing_owners: 0, leads: 0, listing_events: 0 });
  assert.ok(((await doc(dauChu, san)).listings ?? 0) > 0, "đối chứng dương: đầu chủ sàn mẫu thấy hàng");
  await go();
});

test("tra-danh-muc: thành viên sàn mẫu tra được 180 căn (E12)", async () => {
  const { san } = await nap();
  const { auth, sent } = h.makeAuth();
  const app = createApi({ appPool: h.appPool, identityPool: h.identityPool, auth });
  const goiApi = (p: string, cookie = "", init: RequestInit = {}) =>
    app.request(`${h.BASE_URL}${p}`, { ...init, headers: { "content-type": "application/json", origin: h.BASE_URL, ...(cookie ? { cookie } : {}) } });
  const login = async (email: string) => {
    const truoc = sent.length;
    assert.equal((await goiApi("/api/v1/auth/email-otp/send-verification-otp", "", { method: "POST", body: JSON.stringify({ email, type: "sign-in" }) })).status, 200);
    const ma = sent.slice(truoc).find((m) => m.email === email)!;
    const res = await goiApi("/api/v1/auth/sign-in/email-otp", "", { method: "POST", body: JSON.stringify({ email, otp: ma.otp }) });
    assert.equal(res.status, 200);
    return h.cookieOf(res);
  };
  const cookie = `${await login(EMAIL_CHU_KHO)}; qh_san=${san}`;
  const ca = await goiApi("/api/v1/catalog", cookie);
  assert.equal(ca.status, 200);
  const than = (await ca.json()) as { subdivisions: { buildings: { units: unknown[] }[] }[] };
  assert.equal(than.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units)).length, 180);
  const mot = await goiApi("/api/v1/catalog/units/A-01.03", cookie);
  assert.equal(mot.status, 200);
  assert.equal(((await mot.json()) as { status: string; unit: { unitNumber: string } }).unit.unitNumber, "A-01.03");
  const le = h.mail("le");
  await h.createLoneUser(le);
  assert.equal((await goiApi("/api/v1/catalog/units/A-01.03", await login(le))).status, 403, "phiên chưa thuộc sàn nào");
  await go();
});

test("email-ky-tu-dieu-khien: bộ nạp từ chối ký tự điều khiển trước mọi câu ghi (E4, hàng va-nap-mau)", async () => {
  const { chuanHoaEmail } = await import("./nap-ban-that");
  // Ma trận viết trước: mọi lớp ký tự điều khiển và dấu tách dòng Unicode.
  const SAI = ["a@b.co\nNODE_OPTIONS=x", "a@b.co\r", "a\x00@b.co", "a@b.co\u0007", "a\x1f@b.co", "a@b.co\x7f", "a\t@b.co", "a@b.co\u2028"];
  for (const e of SAI) assert.throws(() => chuanHoaEmail(e), /email chủ kho sai dạng/, JSON.stringify(e));
  assert.equal(chuanHoaEmail("T-x@Example.Test"), "t-x@example.test", "đối chứng dương");
  const truoc = await chup();
  const r = chayCli(["--nap", "--email", "a@b.co\x7f"], {});
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /email chủ kho sai dạng/);
  assert.deepEqual(bangLech(truoc, await chup()), [], "không dòng nào đổi");
});

test("lien-he: chủ nhà và lead mẫu thành liên hệ, nạp lại không đổi (hàng 85, AC-9)", async () => {
  await nap();
  const [san] = await gd(timSanMau);
  const q = async <T extends pg.QueryResultRow>(sql: string) => (await pool.query<T>(sql, [san])).rows;
  // 30 chủ nhà của gói → 30 liên hệ Chủ bán trên 40 dòng chủ nhà của hàng; mỗi lead gắn một liên hệ.
  const chu = await q<{ n: number; gan: number; lh: number; ban: number }>(
    `select count(*)::int n, count(o.contact_id)::int gan, count(distinct o.contact_id)::int lh,
            count(distinct o.contact_id) filter (where c.contact_types = '{Seller}')::int ban
     from listing_owners o left join contacts c on c.id = o.contact_id where o.company_id = $1`,
  );
  assert.deepEqual(chu, [{ n: GOI.hang.length, gan: GOI.hang.length, lh: GOI.chuNha.length, ban: GOI.chuNha.length }]);
  const lead = await q<{ n: number; gan: number }>("select count(*)::int n, count(contact_id)::int gan from leads where company_id = $1");
  assert.deepEqual(lead, [{ n: GOI.lead.length, gan: GOI.lead.length }]);
  // Lead mang số của một chủ nhà gắn đúng liên hệ ấy; số mới thành liên hệ riêng.
  const soChu = new Set(GOI.chuNha.map((c) => so(c.soDienThoai)));
  const soLeadMoi = new Set(GOI.lead.map((l) => so(l.soDienThoai)).filter((s) => !soChu.has(s)));
  const tong = (await q<{ n: number }>("select count(*)::int n from contacts where company_id = $1"))[0]!.n;
  assert.equal(tong, GOI.chuNha.length + soLeadMoi.size);
  const a = await chup();
  assert.deepEqual((await nap()).moi, { hang: 0, chuNha: 0, lead: 0 });
  assert.deepEqual(bangLech(a, await chup()), [], "nạp lại đổi bảng");
  await go();
});
