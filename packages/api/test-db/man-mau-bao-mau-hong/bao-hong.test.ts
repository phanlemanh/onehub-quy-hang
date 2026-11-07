// Lưu khi mẫu đã lưu có chỗ hỏng (hàng man-mau-bao-mau-hong): E5 (mẫu bảng hàng), E5c (mẫu bài). Chỗ hỏng ghi thẳng vào
// company_settings như một dòng cũ; thân lưu dựng bằng chính hàm của màn Mẫu từ đáp GET thật. Dữ liệu mẫu: `[Tên]`,
// `0900 000 0xx`.
import type { MauBai, MauBang } from "@quy-hang/core/export";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { CHU_MAU, loiMauHong, thanPutBai, thanPutBang, trangThaiTuDap } from "../../../../apps/web/src/app/(app)/settings/templates/mau-san";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function sanMoi(ten: string) {
  const email = mail(`bh-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} bh ${ten}]`, email);
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

test("lưu mẫu bảng hàng bỏ đúng chỗ đã báo", async () => {
  const s = await sanMoi("bang");
  const [a, b, c] = [randomUUID(), randomUUID(), randomUUID()];
  const luuCu = [
    { id: a, name: "[Tên] A", columns: ["unitNumber", "listPrice"] },
    { id: b, name: " [tên] a ", columns: ["livingArea"] },
    { id: c, name: "[Tên] C", columns: ["listPrice", "holderName"] },
  ];
  await ghiThang(s, "export.templates", luuCu);
  const truoc = (await doc(s, BANG)) as { templates: MauBang[]; errors: string[] };
  assert.deepEqual(truoc.templates.map((m) => m.id), [a, c], "đọc khoan dung lệch");
  const cau = loiMauHong(truoc.errors);
  assert.equal(cau.length, 2, `errors: ${truoc.errors.join(" | ")}`);
  assert.ok(!cau.includes(CHU_MAU.hongChung), `câu chung trên errors thật: ${cau.join(" | ")}`);
  assert.ok(cau.some((x) => x.includes("Người giữ")), `không câu nào nêu Người giữ: ${cau.join(" | ")}`);
  // Đáp GET thật đi qua đúng hàm trang dùng: trạng thái tab mang câu báo.
  assert.deepEqual(trangThaiTuDap<MauBang[]>({ ok: true, body: truoc }), { kieu: "xong", giaTri: truoc.templates, baoHong: cau }, "trang vứt errors của đáp thật");
  // Lưu lại mẫu đầu không sửa (như bấm Sửa rồi Lưu ở màn Mẫu).
  assert.equal((await send("PUT", BANG, thanPutBang(truoc.templates, truoc.templates[0]!), s.cookie)).status, 200);
  const sau = (await doc(s, BANG)) as { templates: MauBang[]; errors: string[] };
  assert.deepEqual(sau, { templates: truoc.templates, errors: [] }, "lưu làm mất mẫu đọc được");
  // Quan hệ: chỗ biến mất giữa dòng lưu cũ và mới đúng bằng hai chỗ đã báo — mẫu b, và cột holderName của mẫu c.
  const moi = (await dongLuu(s, "export.templates")) as { id: string; columns: string[] }[];
  assert.deepEqual(luuCu.map((m) => m.id).filter((id) => !moi.some((x) => x.id === id)), [b]);
  assert.deepEqual(luuCu[2]!.columns.filter((x) => !moi.find((m) => m.id === c)!.columns.includes(x)), ["holderName"]);
  // Thêm một mẫu khi còn chỗ hỏng: mẫu đọc được cũ còn đủ.
  await ghiThang(s, "export.templates", luuCu);
  const lai = (await doc(s, BANG)) as { templates: MauBang[] };
  const them: MauBang = { id: randomUUID(), name: "[Tên] mới", columns: ["livingArea"] };
  assert.equal((await send("PUT", BANG, thanPutBang(lai.templates, them), s.cookie)).status, 200);
  assert.deepEqual(((await doc(s, BANG)) as { templates: MauBang[] }).templates, [...lai.templates, them], "thêm mẫu làm mất mẫu đọc được");
});

test("lưu mẫu bài bỏ đúng chỗ đã báo", async () => {
  const s = await sanMoi("bai");
  const fb = { opening: "Hàng mới tuần này", closing: "Gọi em 0900 000 003" };
  await ghiThang(s, "share.post_templates", { tiktok: { opening: "x", closing: "" }, zalo: { opening: "a".repeat(501), closing: "" }, facebook: fb });
  const truoc = (await doc(s, BAI)) as { templates: MauBai; errors: string[] };
  assert.deepEqual(truoc.templates, { facebook: fb });
  const cau = loiMauHong(truoc.errors);
  assert.equal(cau.length, 2, `errors: ${truoc.errors.join(" | ")}`);
  assert.ok(!cau.includes(CHU_MAU.hongChung), `câu chung trên errors thật: ${cau.join(" | ")}`);
  const zalo = { opening: "Chào nhóm", closing: "" };
  assert.equal((await send("PUT", BAI, thanPutBai(truoc.templates, "zalo", zalo), s.cookie)).status, 200);
  assert.deepEqual(await doc(s, BAI), { templates: { facebook: fb, zalo }, errors: [] }, "lưu mẫu bài làm mất lời đọc được");
  const moi = (await dongLuu(s, "share.post_templates")) as Record<string, unknown>;
  assert.ok(!("tiktok" in moi), "dòng lưu mới còn kênh lạ");
});
