// Ảnh chụp trên điện thoại chỉ lên đúng sàn lúc chụp — chốt ở biên API (hàng 41 chup-anh-dien-thoai, bất biến 2). Một người
// thuộc hai sàn, cả hai sàn có căn trùng toà + mã; phiên đang ở sàn B. Lời gọi tự khai sàn A thì máy chủ từ chối
// `select-company` trước khi chạm dữ liệu — không dòng ảnh nào ở sàn nào. Ma trận viết trước: 3 lời gọi × (khai sàn khác ·
// khai đúng sàn · không khai). Dữ liệu mẫu, không dữ liệu cá nhân thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "cds";
const TOA = "[Toà hai sàn]";
const MA = "B-0902";
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(996, 3)]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

const goi = (method: string, path: string, body: unknown, cookie: string) =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, cookie, ...(body && !(body instanceof FormData) ? { "content-type": "application/json" } : {}) },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" }, "");
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }, "");
  assert.equal(res.status, 200);
  return cookieOf(res);
}

/** Người thuộc hai sàn, giữ căn trùng toà + mã ở cả hai. */
async function haiSan() {
  const email = mail(`${KH}-dc`);
  const userId = await createLoneUser(email);
  const phien = await login(email);
  const san = async (ten: string) => {
    const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, ["listing_agent"]]);
    const cookie = `${phien}; qh_san=${s.companyId}`;
    const r = await goi("POST", "/api/v1/listings", { buildingName: TOA, unitNumber: MA }, cookie);
    assert.equal(r.status, 201, await r.clone().text());
    const { id } = (await r.json()) as { id: string };
    await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, $3)", [s.companyId, id, userId]);
    return { companyId: s.companyId, cookie };
  };
  return { a: await san("a"), b: await san("b") };
}

function form(san?: string) {
  const f = new FormData();
  f.set("toa", TOA);
  f.set("ma", MA);
  f.set("compartment", "internal");
  f.set("width", "2000");
  f.set("height", "1500");
  if (san) f.set("companyId", san);
  f.set("original", new File([new Uint8Array(JPEG)], "so-do.jpg", { type: "image/jpeg" }));
  f.set("thumb", new File([new Uint8Array(PNG)], "nhe.png", { type: "image/png" }));
  return f;
}
const dem = async (companyId: string) => (await appPool.query<{ n: number }>("select count(*)::int n from unit_photos where company_id = $1", [companyId])).rows[0]!.n;

test("Bất biến 2 ở biên API: phiên ở sàn B, lời gọi khai sàn A → select-company, không dòng ảnh nào; khai B hay không khai → nhận", async () => {
  const { a, b } = await haiSan();
  const LOI = [
    { ten: "danh sách", goi: (san?: string) => goi("GET", `/api/v1/units/photos?toa=${encodeURIComponent(TOA)}&ma=${encodeURIComponent(MA)}${san ? `&companyId=${san}` : ""}`, undefined, b.cookie), nhan: 200 },
    { ten: "xin link tải", goi: (san?: string) => goi("POST", "/api/v1/units/photos/upload-url", { toa: TOA, ma: MA, contentType: "image/jpeg", byteSize: JPEG.length, ...(san ? { companyId: san } : {}) }, b.cookie), nhan: 200 },
    { ten: "thêm ảnh Nội bộ", goi: (san?: string) => goi("POST", "/api/v1/units/photos", form(san), b.cookie), nhan: 201 },
  ];
  const lech: string[] = [];
  for (const l of LOI) {
    const r = await l.goi(a.companyId);
    const than = (await r.json().catch(() => null)) as { error?: string } | null;
    if (r.status !== 409 || than?.error !== "select-company") lech.push(`${l.ten} · khai sàn A · ${r.status} ${than?.error ?? ""}`);
  }
  if (await dem(a.companyId)) lech.push("sàn A có dòng ảnh");
  if (await dem(b.companyId)) lech.push("sàn B có dòng ảnh từ lời gọi khai sàn A");
  // Đối chứng dương: khai đúng sàn của phiên, và lời gọi cũ của mục Ảnh (không khai) vẫn được nhận.
  for (const l of LOI) {
    for (const san of [b.companyId, undefined]) {
      const r = await l.goi(san);
      if (r.status !== l.nhan) lech.push(`${l.ten} · ${san ? "khai sàn B" : "không khai"} · ${r.status}`);
    }
  }
  assert.deepEqual(lech, []);
  assert.equal(await dem(b.companyId), 2, "hai ảnh khai đúng sàn / không khai vào sàn B");
  assert.equal(await dem(a.companyId), 0);
});
