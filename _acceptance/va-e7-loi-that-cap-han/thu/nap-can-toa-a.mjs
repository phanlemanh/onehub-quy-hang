// Nạp một căn Đang bán ở Toà A cho sàn mẫu của chỗ thử dãy D (Postgres 5575/postgres, máy dev 3495) — bước dựng của hàng 48
// (_acceptance/luat-chia-lead/thu/dung-d.mjs) cần sẵn căn ấy (cột «Đầu chủ» của E10) mà không tự nạp hàng. Đi QUA API (đường
// ghi duy nhất) bằng phiên quản trị sàn mẫu đã giữ ở .acceptance-runs/luat-chia-lead/phien.json; ảnh thật «chia sẻ được» gieo
// thẳng như bộ thử dãy D vẫn làm (Đang bán đòi đủ ảnh thật). Đã có căn như vậy thì không làm gì.
//   node _acceptance/va-e7-loi-that-cap-han/thu/nap-can-toa-a.mjs
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const URL_GOC = "http://localhost:3495";
const db = new pg.Client({ connectionString: "postgres://postgres:quyhang@localhost:5575/postgres" });
await db.connect();
try {
  const san = (await db.query("select id from companies where name = '[Mẫu] Sàn thử'")).rows[0]?.id;
  if (!san) throw new Error("không có sàn mẫu — chạy packages/db/seed/nap.mjs --nap trên 5575 trước");
  const co = await db.query(
    `select 1 from listings where company_id = $1 and standard_status = 'Active' and building_name = 'Toà A' and unit_number is not null limit 1`,
    [san],
  );
  if (co.rowCount) {
    console.log("đã có căn Đang bán ở Toà A — không nạp");
    process.exit(0);
  }
  // Phiên quản trị sàn mẫu: dùng lại phiên đã giữ nếu còn sống, không thì xin mã như dung-d.mjs của hàng 48 (mã đọc ở nhật ký
  // máy dev 3495 — máy ấy phải do dung-d.mjs bật từ cây này).
  const LOG = path.join("/tmp", `quy-hang-d48-${path.basename(GOC)}`, "web-d48.log");
  const EMAIL = "quan-tri@mau.quy-hang.test";
  const h = { "content-type": "application/json", origin: URL_GOC };
  const PHIEN = path.join(GOC, ".acceptance-runs/luat-chia-lead/phien.json");
  let cookie = existsSync(PHIEN) ? JSON.parse(readFileSync(PHIEN, "utf8")).cookie?.["quan-tri"]?.replace(/; qh_san=.*$/, "") : null;
  if (!cookie || (await fetch(`${URL_GOC}/api/v1/me`, { headers: { cookie } })).status !== 200) {
    const maCua = () => (existsSync(LOG) ? readFileSync(LOG, "utf8") : "").split("\n").filter((l) => l.includes(`[ma-dang-nhap] ${EMAIL} `));
    const truoc = maCua().length;
    await fetch(`${URL_GOC}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, type: "sign-in" }) });
    let ma = null;
    for (let i = 0; i < 60 && !ma; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const ds = maCua();
      if (ds.length > truoc) ma = ds.at(-1).trim().split(" ").at(-1);
    }
    if (!ma) throw new Error(`không thấy mã đăng nhập của ${EMAIL} ở ${LOG}`);
    const r = await fetch(`${URL_GOC}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: h, body: JSON.stringify({ email: EMAIL, otp: ma }) });
    cookie = r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  }
  cookie = `${cookie}; qh_san=${san}`;
  const goi = async (method, p, body) => {
    const r = await fetch(`${URL_GOC}${p}`, { method, headers: { "content-type": "application/json", origin: URL_GOC, cookie }, body: body && JSON.stringify(body) });
    if (!r.ok) throw new Error(`${method} ${p}: ${r.status} ${await r.text()}`);
    return r.json();
  };
  const l = await goi("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: "A-01.01" });
  let phienBan = l.version;
  const su = async (type, payload) => {
    phienBan = (await goi("POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: phienBan })).version;
  };
  await su("price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" });
  await su("details_changed", { legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" });
  await db.query(
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
     select gen_random_uuid(), l.company_id, l.building_name, l.unit_number, 'shareable', 'image/jpeg', 1, 1, 1, '[Mẫu] bộ thử dãy D'
     from listings l, generate_series(1, greatest(1, coalesce((select (s.value #>> '{}')::int from company_settings s
       where s.company_id = l.company_id and s.key = 'listing.ready_min_real_photos'), 1)))
     where l.id = $1`,
    [l.id],
  );
  await su("status_changed", { to: "Active" });
  console.log(`đã nạp căn Đang bán Toà A ${l.unitNumber ?? "A-01.01"} (${l.id})`);
} finally {
  await db.end();
}
