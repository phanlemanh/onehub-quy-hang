// pooler-che-do-giao-dich AC-3 (E3), AC-4 (E4): Quỹ hàng chạy qua pooler chế độ giao dịch THẬT tại máy — PgBouncer
// `pool_mode = transaction`, `default_pool_size = 1` (mọi khách dùng chung một kết nối máy chủ) trước Postgres chỗ thử của
// hồ sơ va-pool-ket-noi. Tiến trình con nạp getApi thật của apps/web với DATABASE_URL trỏ pooler. Cần Docker và PgBouncer.
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { dirname, resolve } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { donPgbouncer, dungPgbouncer, URL_DB, URL_POOLER } from "./pgbouncer.mjs";

const DAY = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(DAY, "../../..");
const CHO_THU = resolve(ROOT, "_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs");
const CON = resolve(DAY, "con-api.mts");
// Bí mật ký cookie của chỗ thử va-pool-ket-noi — để cookie của Đầu chủ mẫu 1 do chỗ thử cấp dùng được ở đây.
const BI_MAT = "dev-su-co-chuoi-thu-khong-dung-o-ban-that";
const EMAIL_A = "dau-chu-1@mau.quy-hang.test";
const LOI_LUOC_DO = /Could not validate the database schema|relation .* does not exist|SchemaMismatch/;

let pgb;
let cookieA;

/** Chạy tiến trình con; `tin` là dòng gửi vào stdin sau khi con in «san-sang» (bỏ trống thì không gửi). */
function chayCon(lenh, doiSo, env = {}, cho) {
  const con = spawn(process.execPath, ["--import", "tsx", CON, lenh, doiSo], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "test", DATABASE_URL: URL_POOLER, BETTER_AUTH_SECRET: BI_MAT, BETTER_AUTH_URL: "http://localhost:3499", RESEND_API_KEY: "", ...env },
    stdio: ["pipe", "pipe", "pipe"],
  });
  let out = "";
  let err = "";
  con.stdout.on("data", (d) => {
    out += d;
    if (cho && out.includes("san-sang")) cho.resolve();
  });
  con.stderr.on("data", (d) => (err += d));
  const xong = new Promise((r) => con.on("exit", (code) => r(code)));
  return {
    con,
    ket: xong.then((code) => {
      const dong = out.split("\n").find((l) => l.startsWith("KQ "));
      return { code, kq: dong ? JSON.parse(dong.slice(3)) : null, out, err };
    }),
  };
}

const kyCookie = (token) => `qh.session_token=${token}.${encodeURIComponent(createHmac("sha256", BI_MAT).update(token).digest("base64"))}`;

before(async () => {
  const ra = execFileSync(process.execPath, [CHO_THU, "--dung"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  const c = JSON.parse(ra.trim().split("\n").at(-1)).cookie;
  cookieA = `${c.name}=${c.value}`;
  pgb = await dungPgbouncer();
  // Sàn mẫu nạp sẵn chưa có căn: tạo một căn qua API của chính Đầu chủ mẫu 1, đi qua pooler.
  const tao = await chayCon("tao", "[Mẫu] Toà A pooler", { COOKIE_A: cookieA }).ket;
  assert.equal(tao.kq?.status, 201, `sàn A: tạo căn trả ${tao.kq?.status} ${tao.kq?.loi ?? ""}\n${tao.err}`);
});
after(async () => {
  await donPgbouncer(pgb);
  execFileSync(process.execPath, [CHO_THU, "--don"], { cwd: ROOT, stdio: "ignore" });
});

test("pooler giao dịch: bàn thử thật ở chế độ giao dịch, một kết nối máy chủ", async () => {
  const qt = new pg.Client({ connectionString: URL_POOLER.replace(/\/postgres$/, "/pgbouncer") });
  await qt.connect();
  try {
    const { rows } = await qt.query("SHOW CONFIG");
    const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    assert.equal(cfg.pool_mode, "transaction", `bàn thử: pool_mode là ${cfg.pool_mode}, không phải transaction`);
    assert.equal(cfg.default_pool_size, "1", `bàn thử: default_pool_size là ${cfg.default_pool_size}`);
  } finally {
    await qt.end();
  }
});

// Kết nối mang search_path SAI (`public`, không có lược đồ identity): như khi pooler trao một kết nối máy chủ mà search_path
// không phải của mình. PgBouncer giữ search_path của từng khách, nên giá trị này đi theo mọi câu của khách.
const URL_SAI = `${URL_POOLER}?options=${encodeURIComponent("-c search_path=public")}`;

test("pooler giao dịch: đăng nhập bằng mã, phiên, Hôm nay, Bảng hàng qua getApi thật", async () => {
  for (const [ten, url] of [["kết nối thường", URL_POOLER], ["kết nối mang search_path=public", URL_SAI]]) {
    const { kq, code, err } = await chayCon("dang-nhap", EMAIL_A, { DATABASE_URL: url }).ket;
    assert.equal(code, 0, `đăng nhập qua pooler (${ten}): tiến trình con thoát ${code}\n${err}`);
    for (const [buoc, ma] of Object.entries(kq.buoc)) assert.equal(ma, 200, `đăng nhập qua pooler (${ten}): bước ${buoc} trả ${ma}\n${err}`);
    assert.equal(kq.email, EMAIL_A, `đăng nhập qua pooler (${ten}): /me trả sai người`);
    assert.equal(kq.san, "[Mẫu] Sàn thử", `đăng nhập qua pooler (${ten}): /me trả sai sàn`);
    assert.ok(kq.can >= 1, `đăng nhập qua pooler (${ten}): Bảng hàng không có căn nào (${kq.can})`);
    assert.doesNotMatch(err, LOI_LUOC_DO, `đăng nhập qua pooler (${ten}): nhật ký có lỗi lược đồ\n${err}`);
  }
});

test("pooler giao dịch: đối chứng — câu trần dựa vào search_path hỏng trên kết nối mang search_path khác", async () => {
  const sai = new pg.Pool({ connectionString: URL_SAI, max: 1 });
  sai.on("error", () => {});
  try {
    const { rows } = await sai.query("select current_setting('search_path') as sp");
    assert.equal(rows[0].sp, "public", `đối chứng: kết nối không mang search_path=public (${rows[0].sp}) — phép đo không đặt được ca`);
    await assert.rejects(
      sai.query('select id from "user" limit 1'),
      /relation "user" does not exist/,
      "đối chứng: câu trần vẫn chạy trên kết nối search_path=public — bàn thử không phân biệt được",
    );
    await sai.query('select id from identity."user" limit 1'); // đối chứng dương: câu ghi rõ lược đồ chạy
  } finally {
    await sai.end();
  }
});

test("pooler giao dịch: 40 yêu cầu đồng thời từ 10 tiến trình, hai sàn, không rò", async () => {
  // Sàn B: mở bằng vai chủ trên Postgres trực tiếp, một đầu chủ, một phiên, một căn tạo qua API của chính người ấy.
  const db = new pg.Client({ connectionString: URL_DB });
  await db.connect();
  let cookieB;
  let sanA;
  let sanB;
  try {
    const nhan = randomBytes(3).toString("hex");
    sanB = (await db.query("insert into companies (name) values ($1) returning id", [`[Mẫu] Sàn thử B ${nhan}`])).rows[0].id;
    const uid = `pooler-thu-b-${nhan}`;
    await db.query(`insert into identity."user" (id, name, email, "emailVerified") values ($1, '[Tên] B', $2, true)`, [uid, `dau-chu-b-${nhan}@mau.quy-hang.test`]);
    await db.query("insert into company_members (company_id, user_id, roles) values ($1, $2, array['listing_agent'])", [sanB, uid]);
    const token = `poolerthub${nhan}${randomBytes(8).toString("hex")}`;
    await db.query(
      `insert into identity.session (id, "expiresAt", token, "updatedAt", "userId") values ($1, now() + interval '1 day', $2, now(), $3)`,
      [`phien-${uid}`, token, uid],
    );
    cookieB = kyCookie(token);
    const tao = await chayCon("tao", `[Mẫu] Toà B ${nhan}`, { COOKIE_A: cookieB }).ket;
    assert.equal(tao.kq?.status, 201, `sàn B: tạo căn trả ${tao.kq?.status} ${tao.kq?.loi ?? ""}\n${tao.err}`);
    sanA = (await db.query("select company_id from company_members m join identity.\"user\" u on u.id = m.user_id where u.email = $1", [EMAIL_A])).rows[0].company_id;
  } finally {
    await db.end();
  }

  // 10 tiến trình, mỗi tiến trình một getApi (một bộ bể như một phiên bản hàm), 4 yêu cầu mỗi tiến trình = 40.
  const tinHieu = [];
  const chay = Array.from({ length: 10 }, () => {
    const cho = Promise.withResolvers();
    tinHieu.push(cho.promise);
    return chayCon("ban", "4", { COOKIE_A: cookieA, COOKIE_B: cookieB }, cho);
  });
  await Promise.all(tinHieu);
  for (const c of chay) c.con.stdin.write("bat\n");
  const kq = await Promise.all(chay.map((c) => c.ket));

  const db2 = new pg.Client({ connectionString: URL_DB });
  await db2.connect();
  let dung;
  try {
    const tap = async (san) => (await db2.query("select id from listings where company_id = $1 and not voided order by id", [san])).rows.map((r) => r.id);
    dung = { A: await tap(sanA), B: await tap(sanB) };
  } finally {
    await db2.end();
  }
  assert.ok(dung.A.length >= 1 && dung.B.length === 1, `tập căn đúng: A ${dung.A.length}, B ${dung.B.length}`);

  const phanHoi = kq.flatMap((k, p) => {
    assert.equal(k.code, 0, `tiến trình ${p} thoát ${k.code}\n${k.err}`);
    assert.doesNotMatch(k.err, LOI_LUOC_DO, `tiến trình ${p}: nhật ký có lỗi lược đồ\n${k.err}`);
    return k.kq.map((r) => ({ ...r, i: p * 4 + r.i }));
  });
  assert.equal(phanHoi.length, 40, `cần 40 phản hồi, có ${phanHoi.length}`);
  for (const r of phanHoi) {
    assert.equal(r.status, 200, `yêu cầu ${r.i} của sàn ${r.san} trả ${r.status}`);
    const khac = r.ids.filter((id) => !dung[r.san].includes(id));
    assert.deepEqual(khac, [], `yêu cầu ${r.i} của sàn ${r.san} thấy căn của sàn khác: ${khac.join(", ")}`);
    assert.deepEqual(r.ids, [...dung[r.san]].sort(), `yêu cầu ${r.i} của sàn ${r.san} thiếu căn của sàn mình`);
  }

  // Sau loạt: kết nối máy chủ duy nhất không còn vai hay sàn của ai.
  const tran = new pg.Client({ connectionString: URL_POOLER });
  await tran.connect();
  try {
    const { rows } = await tran.query("select current_user as vai, current_setting('app.company_id', true) as san");
    assert.equal(rows[0].vai, "postgres", `sau loạt: vai còn ${rows[0].vai}`);
    assert.ok(!rows[0].san, `sau loạt: app.company_id còn «${rows[0].san}»`);
  } finally {
    await tran.end();
  }
});

test("pooler giao dịch: đối chứng — đặt mức phiên thì rò sang khách khác", async () => {
  const mot = new pg.Client({ connectionString: URL_POOLER });
  const hai = new pg.Client({ connectionString: URL_POOLER });
  await mot.connect();
  await hai.connect();
  try {
    await mot.query("set app.company_id = 'ro-ri-thu'");
    const { rows } = await hai.query("select current_setting('app.company_id', true) as san");
    assert.equal(rows[0].san, "ro-ri-thu", "đối chứng: khách khác không thấy giá trị mức phiên — bàn thử không dùng chung kết nối máy chủ");
  } finally {
    await mot.query("reset all").catch(() => {});
    await mot.end();
    await hai.end();
  }
});
