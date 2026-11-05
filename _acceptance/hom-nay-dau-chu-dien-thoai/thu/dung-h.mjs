// Chỗ thử của Hôm nay đầu chủ trên điện thoại (hàng 39) trên máy dãy H của đợt dau-khach-nhap (Postgres 5574 container
// quy-hang-db-dkn-H, dev 3494) — dùng cho eval ui-check E8. Khuôn lấy từ _acceptance/doi-dau-chu-hang-loat/thu/dung-h.mjs.
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs        dựng Postgres + migrate + người mẫu + hàng mẫu + máy chủ dev
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs --mau  dựng bộ mẫu của E8 cho dau-chu-1 (≥ 10 việc trên Hôm nay):
//        (a) lead mẫu số 0900 000 091 giao dau-chu-1, nấc «đã nhận» (chưa gọi lần đầu) — telesales nhập qua API, ghim về
//            dau-chu-1, dau-chu-1 nhận qua API;
//        (b) căn dau-chu-1 giữ ở nhóm «Nên gọi điều chỉnh giá» (Đang bán, giá và xác nhận 12 ngày trước), chủ nhà ghi qua
//            PUT …/owner của dau-chu-1: «[Tên] C1-mau», 0900 000 092;
//        (c) một căn dau-chu-2 giữ (đối chứng: dau-chu-1 mở số chủ của nó thì bị từ chối);
//        (d) thêm căn «Nên gọi điều chỉnh giá» của dau-chu-1 tới khi cận dưới số việc ≥ 10.
//        In JSON { lead: {id, so}, canGia: {id, ma, so}, canKhac: {id}, tong, … } và ghi mau.json (ngoài cây kho).
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs --doc  in JSON { moSoLead, moSoChu, moSoChuKhac, leadDaGoi,
//                                                                      canXacNhan, … } đọc thẳng Postgres của dãy
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs --phien <email> [--ua <UA>] [--moi]  đăng nhập MỚI một máy giả
//                                                                     → in JSON {url, cookie: [{name,value}], token}
//                                                         thêm --moi: xoá mọi phiên cũ của người ấy trước (máy đầu tiên)
//   node _acceptance/hom-nay-dau-chu-dien-thoai/thu/dung-h.mjs --tat  tắt máy chủ dev lệnh này đã bật (chỉ kill PID đã ghi)
// Chỉ người mẫu …@mau.quy-hang.test; mỗi lần cấp phiên xoá bộ đếm xin mã của email ấy trên Postgres thử.
//
// Vì sao căn (b), (d) ghi thẳng sự kiện: nhóm «Nên gọi điều chỉnh giá» cần mốc giá/xác nhận ≥ 10 ngày (packages/core/src/
// today/mac-dinh.ts), API ghi sự kiện lúc now() và không có lối ghi lùi giờ. Như _acceptance/hom-nay-dau-chu/thu/dung-g.mjs:
// ghi sự kiện với `occurred_at` tường minh DƯỚI VAI API `quy_hang_app`, người làm là chính người mẫu (luật theo dòng áp
// như khi người bấm), bản tính `listings` và người giữ ghi cùng giao dịch. Chủ nhà của (b) vẫn ghi qua API.
import { execFileSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, openSync, readdirSync, readFileSync, utimesSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
// Nhật ký và PID nằm NGOÀI cây kho: máy chủ dev theo dõi cả cây, ghi trong cây làm nó dựng lại liên tục.
const CHAY = path.join(os.tmpdir(), "quy-hang-hom-nay-dt");
const LOG = path.join(CHAY, "web-h.log");
const PID = path.join(CHAY, "web-h.pid");
const MAU = path.join(CHAY, "mau.json");
const CONG = 3494;
const DB_CONG = 5574;
const CONTAINER = "quy-hang-db-dkn-H";
const URL_GOC = `http://localhost:${CONG}`;
const DATABASE_URL = `postgres://postgres:quyhang@localhost:${DB_CONG}/postgres`;
const MIEN = "mau.quy-hang.test";
const TEN_SAN = "[Mẫu] Sàn thử";
/** Số mẫu của E8 — kịch bản chay-ui.mjs đối chiếu href tel: với đúng các số này. */
const SO_LEAD = "0900000091";
const CHU_GIA = { ten: "[Tên] C1-mau", so: "0900000092" };
const CHU_KHAC = { ten: "[Tên] C2-mau", so: "0900000093" };
const TOI_THIEU = 10;

const { values: a } = parseArgs({
  options: { tat: { type: "boolean" }, phien: { type: "string" }, ua: { type: "string" }, moi: { type: "boolean" }, "xoa-phien": { type: "string" }, mau: { type: "boolean" }, doc: { type: "boolean" } },
});
mkdirSync(CHAY, { recursive: true });
const env = { ...process.env, DATABASE_URL };
const chay = (cmd, args) => execFileSync(cmd, args, { cwd: GOC, env, stdio: ["ignore", "pipe", "inherit"] }).toString();
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

if (a.tat) {
  if (existsSync(PID)) {
    const pid = Number(readFileSync(PID, "utf8"));
    try {
      process.kill(pid);
      console.log(`đã tắt máy chủ dev PID ${pid}`);
    } catch {
      console.log(`PID ${pid} không còn chạy`);
    }
  }
  process.exit(0);
}

/** Cookie «tên=giá trị; …» của một người mẫu — cấp phiên mới bằng chính lệnh này (--phien). */
const cookieCua = (email) =>
  JSON.parse(execFileSync(process.execPath, [fileURLToPath(import.meta.url), "--phien", email], { cwd: GOC }).toString())
    .cookie.map((c) => `${c.name}=${c.value}`)
    .join("; ");

async function goi(ck, method, p, body) {
  const r = await fetch(`${URL_GOC}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: URL_GOC, cookie: ck },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const than = await r.json().catch(() => null);
  if (r.status >= 300) throw new Error(`${method} ${p} → ${r.status} ${JSON.stringify(than)}`);
  return than;
}

async function moDb() {
  const db = new pg.Client({ connectionString: DATABASE_URL });
  await db.connect();
  return db;
}
const mot = async (db, q, v = []) => (await db.query(q, v)).rows[0];

if (a.mau) {
  const db = await moDb();
  try {
    const idCua = async (khoa) => {
      const r = await mot(db, `select id from identity."user" where email = $1`, [`${khoa}@${MIEN}`]);
      if (!r) throw new Error(`thiếu người mẫu ${khoa} — chạy dung-h.mjs (không cờ) trước`);
      return r.id;
    };
    const d1 = await idCua("dau-chu-1");
    const d2 = await idCua("dau-chu-2");
    const san =
      (await mot(db, `select c.id from companies c join company_members m on m.company_id = c.id where c.name = $1 and m.user_id = $2`, [TEN_SAN, d1]))?.id ??
      (await mot(db, `select company_id id from company_members where user_id = $1 limit 1`, [d1]))?.id;
    if (!san) throw new Error("dau-chu-1 không thuộc sàn nào");

    // Lần dựng trước: lead mẫu cũ còn ở «đã nhận» thì ghi mốc gọi để nó rời Hôm nay — mỗi lần chỉ một lead số 0900 000 091.
    if (existsSync(MAU)) {
      const cu = JSON.parse(readFileSync(MAU, "utf8"));
      if (cu.lead?.id) await db.query("update leads set first_called_at = now() where id = $1 and first_called_at is null and accepted_at is not null", [cu.lead.id]);
    }
    const luc = new Date().toISOString();
    const ck = { d1: `${cookieCua(`dau-chu-1@${MIEN}`)}; qh_san=${san}`, ts: `${cookieCua(`telesales@${MIEN}`)}; qh_san=${san}` };

    // (a) Lead: telesales nhập qua API (không mã căn — không vướng căn trùng), ghim về dau-chu-1 như dung-d.mjs của hàng 92,
    // rồi dau-chu-1 nhận qua API thật → nấc «đã nhận».
    const l = await goi(ck.ts, "POST", "/api/v1/leads", { ownerPhone: SO_LEAD, buildingName: "Toà A", need: "sale", listPrice: 3_200_000_000, feeInclusion: "included", desiredListingTime: "now" });
    if (!l?.id) throw new Error(`nhập lead mẫu không trả mã: ${JSON.stringify(l)}`);
    await db.query("update leads set matched_agent_user_id = $1, routed_at = coalesce(routed_at, now()) where id = $2", [d1, l.id]);
    await goi(ck.d1, "POST", `/api/v1/leads/${l.id}/accept`);
    const ld = await mot(db, "select outcome, accepted_at, first_called_at, returned_at from leads where id = $1", [l.id]);
    if (!ld.accepted_at || ld.first_called_at || ld.returned_at || ld.outcome === "unit_has_open_listing") throw new Error(`lead mẫu không ở nấc đã nhận: ${JSON.stringify(ld)}`);

    // Căn trống của gói mẫu: chưa có hàng, chưa có lead nào ở sàn.
    const goiMau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
    const daDung = new Set(
      (await db.query("select building_name || '|' || coalesce(unit_number, '') k from listings where company_id = $1 union select building_name || '|' || coalesce(unit_number, '') from leads where company_id = $1", [san])).rows.map((r) => r.k),
    );
    const trong = [];
    for (const s of goiMau.danhMuc.subdivisions) for (const b of s.buildings) for (const u of b.units) if (!daDung.has(`${b.buildingName}|${u.unitNumber}`)) trong.push({ toa: b.buildingName, ma: u.unitNumber });
    const ke = () => {
      const c = trong.shift();
      if (!c) throw new Error("hết căn trống trong gói mẫu");
      return c;
    };

    // Căn Đang bán với giá, chi tiết, lên Đang bán và xác nhận cùng lúc `lui` ngày trước — ghi dưới vai API của người giữ.
    const NGAY = 86_400_000;
    const hangGia = async (giu, ngay) => {
      const can = ke();
      const at = new Date(Date.now() - ngay * NGAY).toISOString();
      const id = randomUUID();
      const gia = 3_250_000_000;
      const chiTiet = { furnished: "[Mẫu] Cơ bản", legalStatus: "[Mẫu] Sổ hồng", financing: "[Mẫu] Không vay", occupantType: "[Mẫu] Để trống" };
      const buoc = [
        ["created", { buildingName: can.toa, unitNumber: can.ma }, false],
        ["price_changed", { listPrice: gia, feeInclusion: "included" }, true],
        ["details_changed", chiTiet, false],
        ["status_changed", { to: "Active" }, true],
      ];
      await db.query("begin");
      try {
        await db.query("set local role quy_hang_app");
        await db.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [giu, san]);
        const vai = (await mot(db, "select roles from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()")).roles;
        for (const [i, [type, payload, xacNhan]] of buoc.entries())
          await db.query(
            `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, occurred_at)
             values (app.current_company_id(), $1, $2, $3, $4, app.current_user_id(), $5, $6, $7)`,
            [id, i + 1, type, JSON.stringify(payload), vai, xacNhan, at],
          );
        await db.query(
          `insert into listings (id, company_id, building_name, unit_number, standard_status, list_price, fee_inclusion, furnished, legal_status,
             financing, occupant_type, close_price, close_date, withdrawn_reason, last_confirmed_at, voided, version)
           values ($1, app.current_company_id(), $2, $3, 'Active', $4, 'included', $5, $6, $7, $8, null, null, null, $9, false, $10)`,
          [id, can.toa, can.ma, gia, chiTiet.furnished, chiTiet.legalStatus, chiTiet.financing, chiTiet.occupantType, at, buoc.length],
        );
        await db.query(
          "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values (app.current_company_id(), $1, 1, $2, app.current_user_id())",
          [id, giu],
        );
        await db.query("commit");
      } catch (e) {
        await db.query("rollback");
        throw e;
      }
      return { id, ma: can.ma, toa: can.toa };
    };

    // (b) Căn «Nên gọi điều chỉnh giá» của dau-chu-1; chủ nhà ghi qua API như người dùng.
    const canGia = await hangGia(d1, 12);
    await goi(ck.d1, "PUT", `/api/v1/listings/${canGia.id}/owner`, { ownerName: CHU_GIA.ten, ownerPhone: CHU_GIA.so });

    // (c) Căn dau-chu-2 giữ, có chủ nhà: lấy căn của bộ nạp; không có thì dựng một căn và ghi chủ nhà bằng phiên dau-chu-2.
    const giuCuoi = `(select a.user_id from listing_agent_assignments a where a.listing_id = l.id order by a.seq desc limit 1)`;
    let canKhac = await mot(
      db,
      `select l.id from listings l where l.company_id = $1 and not l.voided and ${giuCuoi} = $2
         and exists (select 1 from listing_owners o where o.listing_id = l.id) order by l.unit_number limit 1`,
      [san, d2],
    );
    if (!canKhac) {
      canKhac = await hangGia(d2, 12);
      await goi(`${cookieCua(`dau-chu-2@${MIEN}`)}; qh_san=${san}`, "PUT", `/api/v1/listings/${canKhac.id}/owner`, { ownerName: CHU_KHAC.ten, ownerPhone: CHU_KHAC.so });
    }

    // Cận dưới số việc của dau-chu-1: lead đang ở «Lead mới» + căn chắc rơi vào «Nên gọi điều chỉnh giá» hay «Cần gọi lại»
    // (mốc xác nhận vắng/≥ 15 ngày, hay Đang bán với mốc giá và xác nhận ≥ 11 ngày — chừa một ngày cho cách tính ngày lịch
    // Việt Nam). Nhóm «Thiếu thông tin», «Mới đổi» không đếm, nên số trên màn ≥ số này.
    const demViec = async () => {
      const r = await mot(
        db,
        `select
           (select count(*)::int from leads where company_id = $1 and matched_agent_user_id = $2 and outcome in ('new', 'owner_has_agent')
              and discarded_at is null and returned_at is null and resubmitted_at is null and first_called_at is null) lead,
           (select count(*)::int from listings l where l.company_id = $1 and not l.voided and l.standard_status not in ('Closed', 'Withdrawn')
              and ${giuCuoi} = $2
              and (l.last_confirmed_at is null or l.last_confirmed_at < now() - interval '15 days'
                   or (l.standard_status = 'Active' and l.last_confirmed_at < now() - interval '11 days'
                       and coalesce((select max(e.occurred_at) from listing_events e where e.company_id = l.company_id and e.listing_id = l.id
                                       and e.type = 'price_changed'), '-infinity') < now() - interval '11 days'))) can`,
        [san, d1],
      );
      return r.lead + r.can;
    };
    // (d) Thêm căn của dau-chu-1 tới khi đủ.
    const them = [];
    let tong = await demViec();
    while (tong < TOI_THIEU && them.length < 15) {
      them.push((await hangGia(d1, 12 + them.length)).id);
      tong = await demViec();
    }
    if (tong < TOI_THIEU) throw new Error(`Hôm nay của dau-chu-1 chỉ chắc có ${tong} việc`);

    const out = { san, d1, d2, luc, lead: { id: l.id, so: SO_LEAD }, canGia: { id: canGia.id, ma: canGia.ma, so: CHU_GIA.so }, canKhac: { id: canKhac.id }, them, tong };
    writeFileSync(MAU, JSON.stringify(out));
    console.log(JSON.stringify(out));
  } finally {
    await db.end();
  }
  process.exit(0);
}

if (a.doc) {
  const m = JSON.parse(readFileSync(MAU, "utf8"));
  const db = await moDb();
  try {
    const so = async (q, v) => Number((await mot(db, q, v)).n);
    const ld = await mot(db, "select accepted_at, first_called_at, returned_at from leads where id = $1", [m.lead.id]);
    const xn = await mot(db, "select max(occurred_at) at from listing_events where listing_id = $1 and type = 'owner_confirmed'", [m.canGia.id]);
    const lc = await mot(db, "select last_confirmed_at from listings where id = $1", [m.canGia.id]);
    console.log(
      JSON.stringify({
        moSoLead: await so("select count(*) n from lead_phone_reveals where lead_id = $1", [m.lead.id]),
        moSoChu: await so("select count(*) n from owner_phone_reveals where listing_id = $1", [m.canGia.id]),
        // Lần mở số chủ của căn dau-chu-2 do dau-chu-1 làm — lối bị từ chối thì không ghi vết.
        moSoChuKhac: await so("select count(*) n from owner_phone_reveals where listing_id = $1 and actor_user_id = $2", [m.canKhac.id, m.d1]),
        leadDaGoi: !!ld?.first_called_at,
        leadNac: !ld ? null : ld.returned_at ? "returned" : ld.first_called_at ? "called" : ld.accepted_at ? "accepted" : "sent",
        canXacNhan: !!xn?.at && new Date(xn.at) > new Date(m.luc),
        xacNhanLuc: xn?.at ?? null,
        lastConfirmedAt: lc?.last_confirmed_at ?? null,
      }),
    );
  } finally {
    await db.end();
  }
  process.exit(0);
}

if (a["xoa-phien"]) {
  // Cookie mang «token.chữ-ký» (có thể đã mã hoá URL); bảng giữ phần token.
  const token = decodeURIComponent(a["xoa-phien"]).split(".")[0];
  if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error("token lạ");
  const n = chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.session where token = '${token}' returning 1`]);
  console.log(JSON.stringify({ daXoa: n.trim().split("\n").filter((l) => l === "1").length }));
  process.exit(0);
}

if (a.phien) {
  const email = a.phien;
  if (!email.endsWith("@mau.quy-hang.test")) throw new Error("chỉ cấp phiên cho người mẫu (…@mau.quy-hang.test)");
  // Postgres thử của dãy: xoá bộ đếm xin mã của người mẫu này để kịch bản cần nhiều máy không vấp giới hạn 5 mã/15 phút.
  if (!/^[a-z0-9.-]+@mau\.quy-hang\.test$/.test(email)) throw new Error("email mẫu lạ");
  chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.otp_requests where email = '${email}'`]);
  if (a.moi) chay("docker", ["exec", CONTAINER, "psql", "-U", "postgres", "-tAc", `delete from identity.session where "userId" = (select id from identity."user" where email = '${email}')`]);
  const h = { "content-type": "application/json", origin: URL_GOC, ...(a.ua ? { "user-agent": a.ua } : {}) };
  // Máy dev 3494 có thể do chỗ thử của hàng khác trong dãy H bật — đọc mã ở mọi nhật ký quy-hang-*/web-h.log ngoài cây kho.
  const nhatKy = () => [LOG, ...readdirSync(os.tmpdir()).filter((d) => d.startsWith("quy-hang-")).map((d) => path.join(os.tmpdir(), d, "web-h.log"))];
  const maCua = () =>
    [...new Set(nhatKy())].filter((f) => existsSync(f)).flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${email} `)).map((l) => `${f}\u0000${l}`));
  const truoc = new Set(maCua());
  const xin = await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, type: "sign-in" }) });
  if (xin.status !== 200) throw new Error(`xin mã ${email}: ${xin.status}`);
  let ma = null;
  for (let i = 0; !ma && i < 40; i++) {
    await ngu(300);
    const moi = maCua().filter((x) => !truoc.has(x));
    ma = moi.length ? (moi.at(-1).split("\u0000")[1].trim().split(" ").at(-1) ?? null) : null;
  }
  if (!ma) throw new Error(`không thấy mã của ${email} trong ${LOG} (hay nhật ký quy-hang-*/web-h.log khác)`);
  const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email, otp: ma }) });
  if (r.status !== 200) throw new Error(`đăng nhập ${email}: ${r.status}`);
  const cookie = r.headers.getSetCookie().map((c) => {
    const [nv] = c.split(";");
    const i = nv.indexOf("=");
    return { name: nv.slice(0, i), value: nv.slice(i + 1) };
  });
  console.log(JSON.stringify({ url: URL_GOC, cookie, token: cookie.find((c) => c.name.endsWith("session_token"))?.value ?? null }));
  process.exit(0);
}

// 1. Postgres của dãy.
const coContainer = chay("docker", ["ps", "-a", "--format", "{{.Names}} {{.State}}"]).split("\n").find((l) => l.startsWith(`${CONTAINER} `));
if (!coContainer) chay("docker", ["run", "--rm", "-d", "--name", CONTAINER, "-e", "POSTGRES_PASSWORD=quyhang", "-p", `${DB_CONG}:5432`, "postgres:16"]);
else if (!coContainer.endsWith("running")) chay("docker", ["start", CONTAINER]);
for (let i = 0; ; i++) {
  try {
    chay("docker", ["exec", CONTAINER, "pg_isready", "-U", "postgres"]);
    break;
  } catch {
    if (i > 60) throw new Error("Postgres dãy H không lên");
    await ngu(1000);
  }
}
chay("npm", ["run", "db:migrate"]);
chay("node", ["packages/db/seed/nap.mjs", "--nap"]);
// Hàng mẫu có chủ nhà (bộ nạp của hàng 43, qua API) — chạy sau khi máy chủ dev lên, ở cuối.

// 2. Máy chủ dev (dùng lại máy đang chạy ở 3494 nếu có — khi đó mã đăng nhập nằm ở nhật ký của phiên đã bật nó).
async function song() {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).ok;
  } catch {
    return false;
  }
}
/** Thư mục làm việc của tiến trình nghe cổng 3494 — máy dev của worktree khác thì không có màn của hàng 39. */
function thuMucMayDev() {
  try {
    const pids = execFileSync("lsof", ["-iTCP:" + CONG, "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).split("\n").filter(Boolean);
    return pids.map((p) => execFileSync("lsof", ["-a", "-p", p, "-d", "cwd", "-Fn"], { encoding: "utf8" }).split("\n").find((l) => l.startsWith("n"))?.slice(1) ?? null);
  } catch {
    return [];
  }
}
if (!(await song())) {
  const out = openSync(LOG, "a");
  // webpack, không Turbopack: kho chính có package-lock.json ở thư mục cha nên Turbopack lấy cả kho chính làm gốc theo dõi —
  // worktree của các dãy khác và thư mục đợt đổi liên tục làm máy dev dựng lại rồi tải lại trang không dứt (kẹt «Đang tải lần
  // đầu», hàng 43 và lượt thử 05/11). webpack chỉ theo dõi tệp thuộc đồ thị nạp.
  const p = spawn("npx", ["next", "dev", "--webpack", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    env: { ...env, BETTER_AUTH_SECRET: "dev-h-chuoi-thu-khong-dung-o-ban-that", BETTER_AUTH_URL: URL_GOC },
    detached: true,
    stdio: ["ignore", out, out],
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; !(await song()); i++) {
    if (i > 180) throw new Error(`máy chủ dev không lên — xem ${LOG}`);
    await ngu(1000);
  }
}
const thuMuc = thuMucMayDev();
const mayCuaKhoNay = thuMuc.length === 0 ? null : thuMuc.some((d) => d && (d === GOC || d.startsWith(`${GOC}${path.sep}`)));
if (mayCuaKhoNay === false)
  throw new Error(`máy dev ở ${CONG} chạy từ ${thuMuc.join(", ")} — không phải worktree này (${GOC}); tắt máy ấy bằng --tat của chỗ thử đã bật nó rồi chạy lại`);
// 3. Hàng mẫu qua API (chạy lại không nạp trùng).
execFileSync("node", [path.join(GOC, "_acceptance/hom-nay-dau-chu-dien-thoai/thu/nap-hang.mjs")], { cwd: GOC, stdio: ["ignore", "ignore", "inherit"] });
// 4. Hâm nóng: lần dựng đầu của máy dev có lúc làm trang tự tải lại liên tục (đo 04/11 ở hàng 43). Mở các đường lượt chấm
// dùng bằng phiên người mẫu cho máy dev dựng route, chạm giờ sửa một tệp của màn để nó dựng lại một lần, chờ.
{
  const cookie = cookieCua(`dau-chu-1@${MIEN}`);
  const mo = () => Promise.all(["/today", "/inventory"].map((d) => fetch(`${URL_GOC}${d}`, { headers: { cookie } }).then((r) => r.text()).catch(() => "")));
  await mo();
  const tep = path.join(GOC, "apps/web/src/app/(app)/today/mobile/danh-sach.tsx");
  const nay = new Date();
  utimesSync(tep, nay, nay);
  await ngu(10000);
  await mo();
}
console.log(JSON.stringify({ url: URL_GOC, log: LOG, pid: existsSync(PID) ? Number(readFileSync(PID, "utf8")) : null, mayCuaKhoNay }));
