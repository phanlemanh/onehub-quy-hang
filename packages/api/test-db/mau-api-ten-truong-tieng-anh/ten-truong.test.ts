// Tên trường tiếng Anh của mẫu qua API thật (hàng mau-api-ten-truong-tieng-anh): E1, E2, E3, E4b, E5b, E7. Dạng cũ là đầu
// ra thật của bộ ghi trước vòng (`packages/core/src/export/mau-cu.fixture.json`, chụp ở main 9f7df527). Dữ liệu mẫu:
// `[Tên]`, `0900 000 0xx`.
import type { CotBangHang, MauBai, MauBang } from "@quy-hang/core/export";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, test } from "node:test";
import { thanPutBai, thanPutBang } from "../../../../apps/web/src/app/(app)/settings/templates/mau-san";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const FX = JSON.parse(readFileSync(new URL("../../../core/src/export/mau-cu.fixture.json", import.meta.url), "utf8")) as {
  than: { "export.templates": { id: string; ten: string; cot: string[] }[]; "share.post_templates": Record<string, { dau: string; cuoi: string }> };
  luu: { "export.templates": unknown; "share.post_templates": unknown };
};
const MONG_BANG: MauBang[] = FX.than["export.templates"].map((m) => ({ id: m.id, name: m.ten.trim(), columns: m.cot as CotBangHang[] }));
const MONG_BAI: MauBai = Object.fromEntries(Object.entries(FX.than["share.post_templates"]).map(([k, l]) => [k, { opening: l.dau, closing: l.cuoi }]));

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function sanMoi(ten: string) {
  const email = mail(`tt-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} tt ${ten}]`, email);
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return { companyId: s.companyId, cookie: `${cookieOf(res)}; qh_san=${s.companyId}` };
}
type San = Awaited<ReturnType<typeof sanMoi>>;

const BANG = "/api/v1/company/templates/export";
const BAI = "/api/v1/company/templates/posts";
async function doc(s: San, duong: string) {
  const r = await send("GET", duong, undefined, s.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { templates: unknown; errors: string[] };
}
async function dongLuu(s: San, khoa: string): Promise<unknown> {
  const r = await appPool.query("select value from company_settings where company_id = $1 and key = $2", [s.companyId, khoa]);
  return r.rows[0]?.value;
}
async function ghiThang(s: San, khoa: string, value: unknown) {
  await appPool.query(
    `insert into company_settings (company_id, key, value, data_class, updated_by)
     values ($1, $2, $3::jsonb, 'company_internal', (select user_id from company_members where company_id = $1 limit 1))
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, khoa, JSON.stringify(value)],
  );
}
/** Mọi khoá ở mọi mức của một giá trị JSON (bỏ chỉ số mảng). */
function moiKhoa(v: unknown, ra = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => moiKhoa(x, ra));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      ra.add(k);
      moiKhoa(x, ra);
    }
  return ra;
}
const sx = (s: Iterable<string>) => [...s].sort();
const KHOA_BANG = ["columns", "id", "name"];
const KHOA_BAI = ["closing", "facebook", "opening", "zalo"];

test("đọc mẫu bảng ra tên mới", async () => {
  const s = await sanMoi("doc-bang");
  const hai: MauBang[] = [
    { id: randomUUID(), name: "[Tên] A", columns: ["unitNumber", "listPrice"] },
    { id: randomUUID(), name: "[Tên] B", columns: ["livingArea"] },
  ];
  assert.equal((await send("PUT", BANG, { templates: hai }, s.cookie)).status, 200);
  const ds = (await doc(s, BANG)).templates as Record<string, unknown>[];
  assert.equal(ds.length, 2);
  for (const m of ds) assert.deepEqual(sx(Object.keys(m)), KHOA_BANG, `khoá tiếng Việt trong đáp: ${JSON.stringify(m)}`);
  assert.deepEqual(ds, hai);
});

test("đọc mẫu bài ra tên mới", async () => {
  const s = await sanMoi("doc-bai");
  const bai = { zalo: { opening: "Chào nhóm", closing: "Gọi em 0900 000 002" }, facebook: { opening: "Hàng mới", closing: "Hẹn xem nhà" } };
  assert.equal((await send("PUT", BAI, { templates: bai }, s.cookie)).status, 200);
  const t = (await doc(s, BAI)).templates as Record<string, Record<string, unknown>>;
  for (const k of ["zalo", "facebook"]) assert.deepEqual(sx(Object.keys(t[k]!)), ["closing", "opening"], `khoá tiếng Việt trong đáp: ${JSON.stringify(t[k])}`);
  assert.deepEqual(t, bai);
});

test("lưu bằng tên mới", async () => {
  const s = await sanMoi("luu");
  const bang: MauBang[] = [{ id: randomUUID(), name: "[Tên] A", columns: ["listPrice", "unitNumber"] }];
  const bai = { zalo: { opening: "Chào", closing: "" } };
  assert.equal((await send("PUT", BANG, { templates: bang }, s.cookie)).status, 200);
  assert.equal((await send("PUT", BAI, { templates: bai }, s.cookie)).status, 200);
  const lb = await dongLuu(s, "export.templates");
  const la = await dongLuu(s, "share.post_templates");
  assert.ok(sx(moiKhoa(lb)).every((k) => KHOA_BANG.includes(k)), `dòng lưu còn tên cũ: ${JSON.stringify(lb)}`);
  assert.ok(sx(moiKhoa(la)).every((k) => KHOA_BAI.includes(k)), `dòng lưu còn tên cũ: ${JSON.stringify(la)}`);
  assert.deepEqual(lb, bang);
  assert.deepEqual(la, bai);
});

test("ghi bằng tên cũ bị từ chối", async () => {
  const s = await sanMoi("tu-choi");
  const dung: MauBang = { id: randomUUID(), name: "[Tên] đúng", columns: ["listPrice"] };
  assert.equal((await send("PUT", BANG, { templates: [dung] }, s.cookie)).status, 200);
  assert.equal((await send("PUT", BAI, { templates: { zalo: { opening: "Cũ", closing: "" } } }, s.cookie)).status, 200);
  const truocBang = await doc(s, BANG);
  const truocBai = await doc(s, BAI);
  const r1 = await send("PUT", BANG, { templates: [{ ...dung, name: "[Tên] sửa" }, { id: randomUUID(), ten: "B", cot: ["listPrice"] }] }, s.cookie);
  assert.equal(r1.status, 400);
  const l1 = (await r1.json()) as { reason?: unknown };
  assert.ok(typeof l1.reason === "string" && l1.reason.includes("ten") && l1.reason.includes("name"), `lý do: ${l1.reason}`);
  const r2 = await send("PUT", BAI, { templates: { zalo: { dau: "Mới", cuoi: "" } } }, s.cookie);
  assert.equal(r2.status, 400);
  const l2 = (await r2.json()) as { reason?: unknown };
  assert.ok(typeof l2.reason === "string" && l2.reason.includes("opening"), `lý do: ${l2.reason}`);
  assert.deepEqual(await doc(s, BANG), truocBang, "lần lưu bị từ chối vẫn ghi một phần");
  assert.deepEqual(await doc(s, BAI), truocBai, "lần lưu bị từ chối vẫn ghi một phần");
});

test("mẫu dạng cũ đã lưu vẫn đọc được", async () => {
  const s = await sanMoi("dang-cu");
  await ghiThang(s, "export.templates", FX.luu["export.templates"]);
  await ghiThang(s, "share.post_templates", FX.luu["share.post_templates"]);
  assert.deepEqual(await doc(s, BANG), { templates: MONG_BANG, errors: [] }, "mẫu dạng cũ thiếu hay sai");
  assert.deepEqual(await doc(s, BAI), { templates: MONG_BAI, errors: [] }, "mẫu bài dạng cũ thiếu hay sai");
});

test("lưu lại chuyển sang tên mới", async () => {
  const s = await sanMoi("luu-lai");
  await ghiThang(s, "export.templates", FX.luu["export.templates"]);
  await ghiThang(s, "share.post_templates", FX.luu["share.post_templates"]);
  const bang = (await doc(s, BANG)).templates as MauBang[];
  const bai = (await doc(s, BAI)).templates as MauBai;
  // Màn Mẫu lưu lại một mẫu không sửa, và lưu lại lời Zalo không sửa.
  assert.equal((await send("PUT", BANG, thanPutBang(bang, bang[0]!), s.cookie)).status, 200);
  assert.equal((await send("PUT", BAI, thanPutBai(bai, "zalo", bai.zalo!), s.cookie)).status, 200);
  const lb = await dongLuu(s, "export.templates");
  const la = await dongLuu(s, "share.post_templates");
  assert.ok(sx(moiKhoa(lb)).every((k) => KHOA_BANG.includes(k)), `dòng lưu còn tên cũ: ${JSON.stringify(lb)}`);
  assert.ok(sx(moiKhoa(la)).every((k) => KHOA_BAI.includes(k)), `dòng lưu còn tên cũ: ${JSON.stringify(la)}`);
  assert.deepEqual(await doc(s, BANG), { templates: MONG_BANG, errors: [] }, "lưu lại làm mất mẫu");
  assert.deepEqual(await doc(s, BAI), { templates: MONG_BAI, errors: [] }, "lưu lại làm mất mẫu bài");
});
