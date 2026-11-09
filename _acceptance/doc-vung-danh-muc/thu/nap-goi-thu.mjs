// E10 (hàng 99): chuẩn bị bài nhìn màn. Chạy SAU dung-d.mjs.
//   node _acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs
// Nạp một khu vào vùng dùng chung tắt gói mẫu cho cả cơ sở dữ liệu, mà lượt chấm chạy bộ kiểm API song song trên 5575/postgres.
// Nên lệnh này chép cơ sở dữ liệu ấy sang `quy_hang_e10` cùng máy Postgres, bật lại máy dev 3495 trỏ vào bản chép (phiên đăng
// nhập trong phien.json vẫn dùng được vì bản chép mang cả bảng phiên và máy dev dùng cùng khoá), rồi nạp gói qua cửa nhận thật
// và tạo một căn Đang bán qua API. Tắt máy dev vẫn bằng dung-d.mjs --tat. Đỏ nếu mã thử có trong gói mẫu.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const NGOAI = path.join("/tmp", `quy-hang-d48-${path.basename(GOC)}`);
const LOG = path.join(NGOAI, "web-d48.log");
const PID = path.join(NGOAI, "web-d48.pid");
const PHIEN = path.join(GOC, ".acceptance-runs/luat-chia-lead/phien.json");
const CONG = 3495;
const URL_GOC = `http://localhost:${CONG}`;
const THUNG = "quy-hang-db-dkn-D";
const TEN_DB = "quy_hang_e10";
const DB = `postgres://postgres:quyhang@localhost:5575/${TEN_DB}`;
const KHOA_PHIEN = "dev-d48-chuoi-thu-khong-dung-o-ban-that";
const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

const CAN = {
  ma: "P-20.05",
  khu: "[Mẫu] Khu của gói thử",
  toa: "[Mẫu] Toà P thử",
  tang: 20,
  dienTich: 71.5,
  phongNgu: 2,
  huong: "Tây Bắc",
};
const SALE = { listPrice: 3500000000, feeInclusion: "excluded" };

if (!existsSync(PHIEN) || !existsSync(PID)) throw new Error("chưa dựng chỗ thử — chạy dung-d.mjs trước");
const phien = JSON.parse(readFileSync(PHIEN, "utf8"));

const mau = JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8")).danhMuc;
if (mau.subdivisions.some((s) => s.buildings.some((b) => b.units.some((u) => u.unitNumber === CAN.ma)))) {
  throw new Error(`mã thử ${CAN.ma} có trong gói mẫu — bài nhìn màn không phân biệt được hai nguồn`);
}

const nghe = () => spawnSync("lsof", [`-iTCP:${CONG}`, "-sTCP:LISTEN", "-P", "-t"], { encoding: "utf8" }).stdout.trim();
const song = async () => {
  try {
    return (await fetch(`${URL_GOC}/api/v1/health`)).status === 200;
  } catch {
    return false;
  }
};

// Tắt máy dev đã dựng, theo PID đã ghi (luật đợt 8).
const cu = Number(readFileSync(PID, "utf8"));
try {
  process.kill(-cu, "SIGTERM");
} catch {
  try {
    process.kill(cu, "SIGTERM");
  } catch {
    // đã tắt
  }
}
for (let i = 0; i < 40 && nghe(); i++) await ngu(500);
if (nghe()) throw new Error(`cổng ${CONG} vẫn có tiến trình nghe sau khi tắt máy dev PID ${cu}`);

function sql(lenh) {
  const r = spawnSync("docker", ["exec", THUNG, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-c", lenh], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`psql hỏng: ${r.stderr}`);
}
sql(`drop database if exists ${TEN_DB} with (force)`);
sql(`create database ${TEN_DB}`);
const chep = spawnSync("docker", ["exec", THUNG, "bash", "-c", `set -o pipefail; pg_dump -U postgres postgres | psql -q -U postgres ${TEN_DB}`], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
if (chep.status !== 0) throw new Error(`chép cơ sở dữ liệu hỏng: ${chep.stderr}`);

const db = new pg.Client({ connectionString: DB });
await db.connect();
try {
  if ((await db.query("select 1 from companies where id = $1", [phien.san])).rowCount !== 1) throw new Error("bản chép không có sàn mẫu");
  // Lượt chạy song song có thể đang giữ dòng thử trong vùng lúc chép.
  await db.query("delete from catalog_units");
  await db.query("delete from catalog_subdivisions");
  await db.query("insert into catalog_trusted_companies (company_id) values ($1) on conflict do nothing", [phien.san]);
  await db.query(
    `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, status, approved_by)
     values ($1, 'catalog_source', 'inbound', 'onehub-invest', '{catalog}', now() - interval '1 day', 'active', '[Tên]')`,
    [phien.san],
  );

  // Bản cũ của `.next/dev` làm trang tự nạp lại liên tục khi máy dev bật lại.
  rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
  const out = openSync(LOG, "a");
  const p = spawn("npx", ["next", "dev", "-p", String(CONG), "apps/web"], {
    cwd: GOC,
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env, DATABASE_URL: DB, BETTER_AUTH_SECRET: KHOA_PHIEN, BETTER_AUTH_URL: URL_GOC },
  });
  p.unref();
  writeFileSync(PID, String(p.pid));
  for (let i = 0; i < 120 && !(await song()); i++) await ngu(2000);
  if (!(await song())) throw new Error(`máy dev không lên — xem ${LOG}`);

  const h = { "content-type": "application/json", origin: URL_GOC };
  const goi = async (ai, method, duong, body) => {
    const r = await fetch(`${URL_GOC}${duong}`, { method, headers: { ...h, cookie: phien.cookie[ai] }, body: body && JSON.stringify(body) });
    if (!r.ok) throw new Error(`${method} ${duong}: ${r.status} ${await r.text()}`);
    return r.json();
  };

  await goi("quan-tri", "POST", "/api/v1/catalog/feeds", {
    schemaVersion: 1,
    provider: "[Mẫu] Nguồn thử E10",
    measuredAt: new Date().toISOString(),
    subdivisions: [
      {
        subdivisionKey: "thu-e10-khu",
        subdivisionName: CAN.khu,
        complexName: null,
        buildings: [
          {
            buildingKey: "P",
            buildingName: CAN.toa,
            units: [
              {
                upi: `urn:onehub:upi:thu:e10:${CAN.ma}`,
                unitNumber: CAN.ma,
                stack: "05",
                floor: CAN.tang,
                livingArea: CAN.dienTich,
                bedroomsTotal: CAN.phongNgu,
                directionFaces: CAN.huong,
                propertyType: "Residential",
                propertySubType: "Condominium",
              },
            ],
          },
        ],
      },
    ],
  });

  const l = await goi("dau-chu-1", "POST", "/api/v1/listings", { buildingName: CAN.toa, unitNumber: CAN.ma });
  let phienBan = l.version;
  const su = async (type, payload) => {
    phienBan = (await goi("dau-chu-1", "POST", `/api/v1/listings/${l.id}/events`, { type, payload, expectedVersion: phienBan })).version;
  };
  await su("price_changed", SALE);
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
  await db.query(
    `insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
     values ($1, $2, (select coalesce(max(seq), 0) + 1 from listing_agent_assignments where listing_id = $2), $3, $4)`,
    [phien.san, l.id, phien.nguoi.dc1, phien.nguoi.tn],
  );

  // Tra thử trên chính máy dev: gói phải đang được đọc, trước khi trình duyệt nào mở.
  const tra = await goi("dau-chu-1", "GET", `/api/v1/catalog/units/${encodeURIComponent(CAN.ma)}`);
  if (tra.status !== "found" || tra.unit.livingArea !== CAN.dienTich) throw new Error(`tra ${CAN.ma} sai: ${JSON.stringify(tra)}`);

  // Làm nóng các trang của bài trước khi trình duyệt mở (lý do ở dung-d.mjs).
  for (const duong of ["/inventory", `/units/${encodeURIComponent(CAN.ma)}`]) {
    const r = await fetch(`${URL_GOC}${duong}`, { headers: { cookie: phien.cookie["dau-chu-1"] } });
    await r.text();
    if (r.status !== 200) throw new Error(`làm nóng ${duong}: ${r.status}`);
  }
  console.log(JSON.stringify({ buoc: "da-nap", url: URL_GOC, pid: p.pid, listing: l.id, ...CAN, loaiCan: `${CAN.phongNgu}PN` }));
} finally {
  await db.end();
}
