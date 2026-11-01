// Dựng dữ liệu nhìn màn «Lead đã nhập» (hàng 27) trên Postgres của dãy — tệp chạy tay, không phải ca kiểm:
//   DATABASE_URL=… npx tsx packages/api/test-db/dung-man-lead-bon-nac.ts
// Cần sàn «[Mẫu] Sàn thử» đã nạp (`node packages/db/seed/nap.mjs --nap`). Telesales mẫu nhập lead qua lối thật, nhịp chia
// và lối của đầu chủ mẫu đưa từng lead tới một nấc: chờ chia, đã nhận, đã gọi, lên bảng, trả lại, đã gửi lại, tin bổ sung.
// In mã lead từng nấc, không in số. Telesales mẫu đã có lead thì dừng — không nhập chồng.
import { createApi } from "../src/app";
import { SAMPLE_PACK } from "../src/catalog/sample";
import { runLeadTick } from "../src/jobs/lead-tick";
import { appPool, BASE_URL, cookieOf, identityPool, makeAuth } from "./helpers";

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
async function phai(res: Response, ma: number) {
  if (res.status !== ma) throw new Error(`${res.url}: ${res.status} — ${await res.text()}`);
  return res.json() as Promise<{ id: string; outcome?: string }>;
}

const san = (await appPool.query<{ id: string }>("select id from companies where name = '[Mẫu] Sàn thử' order by created_at limit 1")).rows[0]?.id;
if (!san) throw new Error("chưa có sàn «[Mẫu] Sàn thử» — chạy node packages/db/seed/nap.mjs --nap trước");
async function vao(email: string) {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const ma = sent.slice(truoc).find((m) => m.email === email);
  if (!ma) throw new Error(`không có mã cho ${email}`);
  return `${cookieOf(await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: ma.otp }))}; qh_san=${san}`;
}
const ts = await vao("telesales@mau.quy-hang.test");
const dc1 = await vao("dau-chu-1@mau.quy-hang.test");
const dc2 = await vao("dau-chu-2@mau.quy-hang.test");
const co = (await (await send("GET", "/api/v1/leads", undefined, ts)).json()) as unknown[];
if (co.length) {
  console.log(`telesales mẫu đã có ${co.length} lead — không nhập chồng`);
  process.exit(0);
}

const lead = (ma: string) => (SAMPLE_PACK as unknown as { lead: { ma: string; soDienThoai: string }[] }).lead.find((l) => l.ma === ma)!.soDienThoai;
const nam = (so: string, toa: string, can?: string) => ({
  ownerPhone: so,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
const nhap = async (body: unknown) => phai(await send("POST", "/api/v1/leads", body, ts), 201);
const ghi = async (id: string, duoi: string, ck: string) => phai(await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, ck), 200);
const nhip = () => runLeadTick(appPool, new Date(), [san]);
async function hangActive(ck: string, can: string, so: string) {
  const { id } = await phai(await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, ck), 201);
  await phai(await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Mẫu] Chủ nhà", ownerPhone: so }, ck), 200);
  let v = 1;
  for (const body of [
    { type: "price_changed", payload: { listPrice: 3_200_000_000, feeInclusion: "included" } },
    { type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" } },
    { type: "status_changed", payload: { to: "Active" } },
  ])
    await phai(await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v++ }, ck), 200);
}

const ra: [string, string][] = [];
const nhan = await nhap(nam(lead("L-03"), "Toà A", "A-09.05"));
const goi = await nhap(nam(lead("L-05"), "Toà B"));
const len = await nhap(nam(lead("L-06"), "Toà A"));
const tra = await nhap(nam(lead("L-07"), "Toà B"));
const guiLai = await nhap(nam(lead("L-08"), "Toà A"));
await nhip();
await ghi(nhan.id, "accept", dc1);
await ghi(goi.id, "first-call", dc2);
await ghi(len.id, "first-call", dc1);
await hangActive(dc1, "A-15.01", lead("L-06"));
await ghi(tra.id, "return", dc2);
await ghi(guiLai.id, "return", dc1);
const moi = await phai(await send("POST", `/api/v1/leads/${guiLai.id}/resubmit`, { ownerPhone: lead("L-09") }, ts), 201);
const bs = await nhap(nam(lead("L-10"), "Toà A", "A-15.01"));
const cho = await nhap(nam(lead("L-11"), "Toà B"));
ra.push(["đã nhận", nhan.id], ["đã gọi", goi.id], ["lên bảng", len.id], ["trả lại", tra.id], ["đã gửi lại", guiLai.id], ["lead gửi lại (chờ chia)", moi.id], ["tin bổ sung", bs.id], ["chờ chia", cho.id]);
for (const [n, id] of ra) console.log(`${n.padEnd(24)} ${id}`);
await appPool.end();
await identityPool.end();
