// Dựng dữ liệu cho bài ui-check của chế độ ép giá (hàng 29) trên Postgres THỬ của dãy D — tệp chạy tay, không phải ca kiểm:
//   node --env-file-if-exists=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/dung-d.mjs          dựng (một lần) và in mã
//   node --env-file-if-exists=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/dung-d.mjs --vong 2   dựng bộ mới cho lượt chấm 2
//   node --env-file-if-exists=.env.local --import tsx _acceptance/goi-ep-gia-dot-hai/thu/dung-d.mjs --ban <P> trưởng nhóm chuyển P sang Đã bán
// Cần sàn «[Mẫu] Sàn thử» đã nạp. Hồ sơ dựng qua API thật trong tiến trình (như dung-d.mjs của hàng 28), rồi LÙI mốc: sự kiện
// chỉ thêm và máy chủ đóng dấu giờ hiện tại, nên lệnh mở một phiên chủ cơ sở dữ liệu, `set session_replication_role = replica`
// (chỉ trong phiên ấy — bỏ qua trigger chỉ-thêm) và dời `occurred_at` từng sự kiện về số ngày đã khai, rồi đặt lại
// `last_confirmed_at` theo sự kiện có xác nhận muộn nhất. Chỉ chạy trên Postgres thử: từ chối khi cổng không phải 5565.
// Số chủ là số mẫu `0900 000 091`–`099`, tên `[Tên]`. Mã đã dựng giữ ở .acceptance-runs/goi-ep-gia-dot-hai/ — chạy lại chỉ in.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createApi } from "../../../packages/api/src/app.ts";
import { BO_NHOM_MAC_DINH, nhomCuaCan } from "../../../packages/core/src/today/index.ts";
import { appPool, BASE_URL, cookieOf, identityPool, makeAuth, themAnhThat } from "../../../packages/api/test-db/helpers.ts";

const GOC = path.resolve(import.meta.dirname, "../../..");
const { values } = parseArgs({ options: { ban: { type: "string" }, vong: { type: "string" } } });
const VONG = Number(values.vong ?? 1);
if (!(VONG >= 1 && VONG <= 5)) throw new Error("--vong chỉ nhận 1–5");
const GIU = path.join(GOC, `.acceptance-runs/goi-ep-gia-dot-hai/dung-d${VONG === 1 ? "" : `-v${VONG}`}.json`);
if (new URL(process.env.DATABASE_URL ?? "postgres://x@localhost:0/").port !== "5565") throw new Error("chỉ chạy trên Postgres thử của dãy D (cổng 5565)");

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method, p, body, cookie = "") =>
  app.request(`${BASE_URL}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
async function phai(res, ma) {
  if (res.status !== ma) throw new Error(`${res.url || "lời gọi API"}: ${res.status} — ${await res.text()}`);
  return res.json();
}
const san = (await appPool.query("select id from companies where name = '[Mẫu] Sàn thử' order by created_at limit 1")).rows[0]?.id;
if (!san) throw new Error("chưa có sàn «[Mẫu] Sàn thử» — chạy node packages/db/seed/nap.mjs --nap trước");
async function vao(email) {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const ma = sent.slice(truoc).find((m) => m.email === email);
  if (!ma) throw new Error(`không có mã cho ${email}`);
  return `${cookieOf(await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: ma.otp }))}; qh_san=${san}`;
}
async function ketThuc() {
  await appPool.end();
  await identityPool.end();
}
const phienBan = async (id) => (await appPool.query("select version from listings where id = $1", [id])).rows[0].version;
const lenh = async (ck, id, body) => phai(await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: await phienBan(id) }, ck), 200);

if (values.ban) {
  // Người khác (trưởng nhóm) chuyển Đã bán: lần hạ giá ghi trên máy đầu chủ trước đó thành ca máy chủ từ chối (AC-5).
  const tn = await vao("truong-nhom@mau.quy-hang.test");
  await lenh(tn, values.ban, { type: "status_changed", payload: { to: "Closed", closePrice: 2_750_000_000, closeDate: "2026-11-02" } });
  console.log(`hồ sơ ${values.ban} đã sang Đã bán trên máy chủ (trưởng nhóm chuyển)`);
  await ketThuc();
  process.exit(0);
}
// Không nêu lượt: in bản của lượt mới nhất đã dựng; nêu lượt đã dựng: in bản ấy.
const MOI = values.vong ? GIU : [5, 4, 3, 2].map((v) => GIU.replace(/\.json$/, `-v${v}.json`)).find((p) => existsSync(p)) ?? GIU;
if (existsSync(MOI)) {
  console.log(readFileSync(MOI, "utf8"));
  await ketThuc();
  process.exit(0);
}

const dc1 = await vao("dau-chu-1@mau.quy-hang.test");
const dc1Id = (await phai(await send("GET", "/api/v1/me", undefined, dc1), 200)).user.id;
const N = 2_800_000_000;
/** Dãy lệnh của từng hồ sơ: [số ngày trước, lệnh]. P1 mang lịch sử trả giá đủ ba loại dòng; các hồ sơ khác lên bảng 20 ngày trước. */
const DAY_P1 = [
  [40, { type: "price_changed", payload: { listPrice: 2_950_000_000, feeInclusion: "excluded" }, confirmedWithOwner: true }],
  [40, { type: "details_changed", payload: { legalStatus: "Có sổ", occupantType: "Trống" } }],
  [38, { type: "status_changed", payload: { to: "Active" } }],
  [23, { type: "price_changed", payload: { listPrice: N, feeInclusion: "excluded" }, confirmedWithOwner: true }],
  [15, { type: "owner_confirmed", payload: {}, confirmedWithOwner: true }],
];
const DAY_THUONG = [
  [22, { type: "price_changed", payload: { listPrice: N, feeInclusion: "excluded" }, confirmedWithOwner: true }],
  [22, { type: "details_changed", payload: { legalStatus: "Có sổ", occupantType: "Trống" } }],
  [20, { type: "status_changed", payload: { to: "Active" } }],
];
const TEN = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"];
const P = {};
for (const [i, ten] of TEN.entries()) {
  const can = `A-${String(20 + VONG).padStart(2, "0")}.${String(i + 1).padStart(2, "0")}`;
  const cu = (await appPool.query("select id from listings where company_id = $1 and building_name = 'Toà A' and unit_number = $2", [san, can])).rows[0];
  if (cu) throw new Error(`${can} đã có (lần dựng trước dừng giữa chừng?) — chọn --vong khác`);
  const { id } = await phai(await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, dc1), 201);
  await themAnhThat(id);
  /** seq → số ngày trước; sự kiện tạo hồ sơ cùng ngày với lệnh đầu. */
  const ngay = new Map([[1, (ten === "P1" ? DAY_P1 : DAY_THUONG)[0][0]]]);
  for (const [d, body] of ten === "P1" ? DAY_P1 : DAY_THUONG) {
    await lenh(dc1, id, body);
    const seq = (await appPool.query("select max(seq) s from listing_events where listing_id = $1", [id])).rows[0].s;
    for (let s = 1; s <= seq; s++) if (!ngay.has(s)) ngay.set(s, d);
  }
  // Mọi hồ sơ có dòng chủ nhà (gắn đầu chủ giữ căn — căn chưa gắn không vào hàng việc Hôm nay); chỉ P1 có giá đáy.
  const chu = { ownerName: "[Tên]", ownerPhone: `0900 000 0${91 + i}`, ...(ten === "P1" && { floorPrice: 2_700_000_000 }) };
  await phai(await send("PUT", `/api/v1/listings/${id}/owner`, chu, dc1), 200);
  // Lùi mốc trong phiên chủ, chỉ phiên ấy bỏ qua trigger.
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local session_replication_role = replica");
    for (const [s, d] of ngay) {
      await c.query("update listing_events set occurred_at = now() - make_interval(days => $3) - make_interval(secs => 100 - $2) where listing_id = $1 and seq = $2", [id, s, d]);
    }
    await c.query(
      "update listings set last_confirmed_at = (select max(occurred_at) from listing_events where listing_id = $1 and confirmed_with_owner) where id = $1",
      [id],
    );
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  P[ten] = { id, can };
}

// Đọc lại bằng API của đầu chủ: số ngày ép giá (mốc giá hoặc xác nhận gần nhất) và nhóm phải khớp mong đợi.
const ngayTu = (iso) => Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
const ra = [`hồ sơ (dau-chu-1, Toà A) — lượt dựng ${VONG}:`];
for (const ten of TEN) {
  const v = await phai(await send("GET", `/api/v1/listings/${P[ten].id}`, undefined, dc1), 200);
  const mocEp = Math.min(ngayTu(v.priceChangeTimestamp), ngayTu(v.lastConfirmedAt));
  if (mocEp < 10) throw new Error(`${ten}: mốc ép giá ${mocEp} ngày < 10 — chưa đủ điều kiện`);
  // Đối chứng dương của E6, E8: luật xếp nhóm của lõi (bộ mặc định — sàn mẫu không đặt bộ riêng) đưa căn vào nhóm ép giá.
  const nhom = nhomCuaCan(BO_NHOM_MAC_DINH, { ...v, unitType: null, livingArea: null }, dc1Id, new Date().toISOString());
  if (nhom?.code !== "price_adjustment") throw new Error(`${ten}: không vào nhóm «Nên gọi điều chỉnh giá» (nhóm ${nhom?.code ?? "không"})`);
  ra.push(`  ${ten} ${P[ten].id} · ${P[ten].can} · ${v.standardStatus} · 2,8 tỷ · không bao phí · mốc ép giá ${mocEp} ngày · nhóm ${nhom.label}`);
}
ra.push(
  "P1 đầu màn: «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước»; giá đáy 2,7 tỷ (thấp hơn giá về tay hiện tại); P2 chưa ghi giá đáy",
  "P1 lịch sử (mới nhất trên): «Còn · giữ giá» · «Hạ 2,95 tỷ → 2,8 tỷ» · «Lên bảng 2,95 tỷ» · «Tạo hồ sơ»",
  "P3 hạ giá; P4 giữ giá; P5 đã cọc; P6 sàn bán; P7 chủ bán nơi khác; P8 không nghe máy; P9 mất mạng rồi --ban",
);
mkdirSync(path.dirname(GIU), { recursive: true });
writeFileSync(GIU, `${ra.join("\n")}\n`);
console.log(ra.join("\n"));
await ketThuc();
