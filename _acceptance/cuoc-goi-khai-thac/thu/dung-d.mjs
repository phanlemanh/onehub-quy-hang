// Dựng dữ liệu cho bài ui-check của chế độ cuộc gọi (hàng 28) trên Postgres của dãy D — tệp chạy tay, không phải ca kiểm:
//   node --env-file-if-exists=.env.local --import tsx _acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs          dựng (một lần) và in mã
//   node --env-file-if-exists=.env.local --import tsx _acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs --tra <L>  đầu chủ trả lại lead L
//   node --env-file-if-exists=.env.local --import tsx _acceptance/cuoc-goi-khai-thac/thu/dung-d.mjs --ban <H>  chuyển hồ sơ H sang Đã bán
// Cần sàn «[Mẫu] Sàn thử» đã nạp (`node packages/db/seed/nap.mjs --nap`). Đi qua API thật trong tiến trình (như
// dung-man-lead-bon-nac.ts): telesales mẫu nhập lead, nhịp chia giao cho đầu chủ, đầu chủ ghi nấc. Không in số chủ. Mã đã
// dựng giữ ở .acceptance-runs/cuoc-goi-khai-thac/dung-d.json — chạy lại chỉ in, không dựng chồng.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { soGiaToa, tinhVeTay } from "../../../packages/core/src/pricing/index.ts";
import { createApi } from "../../../packages/api/src/app.ts";
import { runLeadTick } from "../../../packages/api/src/jobs/lead-tick.ts";
import { appPool, BASE_URL, cookieOf, identityPool, makeAuth, themAnhThat } from "../../../packages/api/test-db/helpers.ts";

const GOC = path.resolve(import.meta.dirname, "../../..");
const GIU = path.join(GOC, ".acceptance-runs/cuoc-goi-khai-thac/dung-d.json");
const { values } = parseArgs({ options: { tra: { type: "string" }, ban: { type: "string" } } });

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method, p, body, cookie = "") =>
  app.request(`${BASE_URL}${p}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
async function phai(res, ma) {
  if (res.status !== ma) throw new Error(`${new URL(res.url).pathname}: ${res.status} — ${await res.text()}`);
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
const dc1 = await vao("dau-chu-1@mau.quy-hang.test");

async function ketThuc() {
  await appPool.end();
  await identityPool.end();
}

/** Ghi một lệnh lên hồ sơ theo phiên bản hiện tại của máy chủ. */
async function lenh(ck, id, body) {
  const v = (await appPool.query("select version from listings where id = $1", [id])).rows[0].version;
  return phai(await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck), 200);
}

if (values.tra) {
  await phai(await send("POST", `/api/v1/leads/${values.tra}/return`, undefined, dc1), 200);
  console.log(`đã trả lại lead ${values.tra}`);
  await ketThuc();
  process.exit(0);
}
if (values.ban) {
  const s = (await appPool.query("select standard_status from listings where id = $1", [values.ban])).rows[0]?.standard_status;
  if (s === "Incomplete") {
    await lenh(dc1, values.ban, { type: "details_changed", payload: { legalStatus: "Có sổ", occupantType: "Trống" } });
    await themAnhThat(values.ban);
    await lenh(dc1, values.ban, { type: "status_changed", payload: { to: "Active" } });
  }
  await lenh(dc1, values.ban, { type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-11-02" } });
  console.log(`hồ sơ ${values.ban} đã sang Đã bán trên máy chủ`);
  await ketThuc();
  process.exit(0);
}

if (existsSync(GIU)) {
  console.log(readFileSync(path.join(GIU), "utf8"));
  await ketThuc();
  process.exit(0);
}

const ts = await vao("telesales@mau.quy-hang.test");
const tn = await vao("truong-nhom@mau.quy-hang.test");
const dc1Id = (await phai(await send("GET", "/api/v1/me", undefined, dc1), 200)).user.id;
// Số mẫu chưa dùng của sàn: đếm lead đã có, để chạy nối sau lần dừng giữa chừng không trùng số.
let so = 40 + Number((await appPool.query("select count(*) n from leads where company_id = $1", [san])).rows[0].n);
if (so > 99) throw new Error("hết số mẫu 0900 000 0xx của sàn — nạp lại sàn mẫu");
const nam = (toa, can, gia = 2_750_000_000) => ({
  ownerPhone: `0900 000 0${so++}`,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: gia,
  feeInclusion: "included",
  desiredListingTime: "now",
});
/** Lead của lần dựng trước (dừng giữa chừng) cùng toà · căn thì dùng lại — chạy nối không nhập chồng. */
const timLead = async (toa, can) =>
  (await appPool.query(
    "select id, outcome from leads where company_id = $1 and building_name = $2 and unit_number is not distinct from $3 order by created_at desc limit 1",
    [san, toa, can ?? null],
  )).rows[0];
const nhap = async (body, mong = "new") => {
  const cu = await timLead(body.buildingName, body.unitNumber);
  if (cu) return cu.id;
  const r = await phai(await send("POST", "/api/v1/leads", body, ts), 201);
  if (r.outcome !== mong) throw new Error(`lead ${body.buildingName} ${body.unitNumber ?? ""}: kết cục ${r.outcome}, mong ${mong}`);
  return r.id;
};
const ghi = (id, duoi) => send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, dc1).then((r) => phai(r, 200));
const hoSoTuLead = async (id) => (await phai(await send("POST", `/api/v1/leads/${id}/listing`, undefined, dc1), 201)).id;

// Căn so giá của L1: Toà A loại 1PN, bao phí và không bao phí, Đang bán và Đang giao dịch, một căn Đã bán.
const CAN_SO = [
  ["A-02.01", 2_400_000_000, "included", "Active"],
  ["A-03.01", 2_300_000_000, "excluded", "Active"],
  ["A-04.01", 2_500_000_000, "included", "Pending"],
  ["A-05.01", 2_200_000_000, "excluded", "Active"],
  ["A-06.01", 2_450_000_000, "excluded", "Pending"],
  ["A-07.01", 2_350_000_000, "included", "Closed"],
];
for (const [can, gia, phi, nac] of CAN_SO) {
  const co = await appPool.query("select 1 from listings where company_id = $1 and building_name = 'Toà A' and unit_number = $2", [san, can]);
  if (co.rowCount) continue;
  const { id } = await phai(await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, dc1), 201);
  await lenh(dc1, id, { type: "price_changed", payload: { listPrice: gia, feeInclusion: phi } });
  await lenh(dc1, id, { type: "details_changed", payload: { legalStatus: "Có sổ", occupantType: "Trống" } });
  await themAnhThat(id);
  await lenh(dc1, id, { type: "status_changed", payload: { to: "Active" } });
  if (nac === "Pending") await lenh(dc1, id, { type: "status_changed", payload: { to: "Pending" } });
  if (nac === "Closed") await lenh(dc1, id, { type: "status_changed", payload: { to: "Closed", closePrice: gia, closeDate: "2026-11-01" } });
}

const L = {};
L.L1 = await nhap(nam("Toà A", "A-09.01", 2_600_000_000));
L.L3 = await nhap(nam("Toà B", "B-09.02"));
L.L5 = await nhap(nam("Toà A", "A-07.03"));
L.L6 = await nhap(nam("Toà A"));
L.L7 = await nhap(nam("Toà A", "A-12.03"));
L.L8 = await nhap(nam("Toà Thử Trống"));
L.L11 = await nhap(nam("Toà A", "A-09.02"));
L.L12 = await nhap(nam("Toà A", "A-10.02"));
L.L13 = await nhap(nam("Toà A", "A-10.03"));
L.L14 = await nhap(nam("Toà A", "A-11.03"));
L.L15 = await nhap(nam("Toà A", "A-12.02"));
await runLeadTick(appPool, new Date(), [san]);
// L8 ở toà không ai phụ trách: trưởng nhóm giao cho đầu chủ 1.
const nac = async (id) => (await appPool.query("select accepted_at, matched_agent_user_id from leads where id = $1", [id])).rows[0];
if ((await nac(L.L8)).matched_agent_user_id !== dc1Id) await phai(await send("POST", `/api/v1/leads/${L.L8}/assign`, { agentUserId: dc1Id }, tn), 200);
for (const k of ["L1", "L5", "L7", "L11", "L12", "L13", "L14", "L15"]) if (!(await nac(L[k])).accepted_at) await ghi(L[k], "accept");
const hoSo = async (id) => (await appPool.query("select listing_id from lead_listings where lead_id = $1", [id])).rows[0]?.listing_id ?? (await hoSoTuLead(id));
L.H5 = await hoSo(L.L5);
L.H14 = await hoSo(L.L14);
// L9: lead căn trùng với hồ sơ đang mở của chính đầu chủ (H5) — về đầu chủ nhưng không tạo hồ sơ được.
const l9 = (await timLead("Toà A", "A-07.03").then(async (cu) => (cu && cu.id !== L.L5 ? cu : null))) ?? (await phai(await send("POST", "/api/v1/leads", nam("Toà A", "A-07.03"), ts), 201));
L.L9 = l9.id;
const hangMo = "A-07.03";
if ((await appPool.query("select list_price from listings where id = $1", [L.H14])).rows[0].list_price === null)
  await lenh(dc1, L.H14, { type: "price_changed", payload: { listPrice: 2_750_000_000, feeInclusion: "included" } });

// Mong đợi của khối so giá L1: tính bằng lõi trên mọi hồ sơ đầu chủ 1 đọc được (kể cả hàng mẫu cùng loại).
const ds = await phai(await send("GET", "/api/v1/listings", undefined, dc1), 200);
const pn = (ma) => (ma ? { "01": 1, "02": 2, "03": 2, "04": 2, "05": 3, "06": 3 }[ma.slice(-2)] ?? null : null);
const so1 = soGiaToa({
  can: { id: null, buildingName: "Toà A", unitNumber: "A-09.01", bedroomsTotal: 1, listPrice: 2_600_000_000, feeInclusion: "included" },
  cacCan: ds.map((l) => ({ ...l, bedroomsTotal: l.buildingName === "Toà A" || l.buildingName === "Toà B" ? pn(l.unitNumber) : null })),
});
const dong = (n) => new Intl.NumberFormat("vi-VN").format(n);
const ra = [
  "lead (dau-chu-1 trừ L3):",
  ...Object.entries(L).map(([k, v]) => `  ${k.padEnd(4)} ${v}`),
  `  L3 thuộc dau-chu-2; L9 là lead căn trùng (${hangMo}, kết cục ${l9.outcome}) — tạo hồ sơ bị từ chối`,
  "so giá L1 (Toà A, 1PN, về tay giảm dần):",
  ...so1.dong.map((d) => `  ${d.unitNumber} · ${dong(d.listPrice)} · ${d.feeInclusion === "included" ? "BP" : "N"} · ${d.standardStatus} · về tay ${dong(d.veTay)}`),
  `  dải ${dong(so1.dai.thap)} – ${dong(so1.dai.giua)} – ${dong(so1.dai.cao)}; L1 về tay ${dong(tinhVeTay(2_600_000_000, "included").veTay)}, lệch ${so1.viTri.lechPhanTram}%`,
];
mkdirSync(path.dirname(GIU), { recursive: true });
writeFileSync(GIU, `${ra.join("\n")}\n`);
console.log(ra.join("\n"));
await ketThuc();
