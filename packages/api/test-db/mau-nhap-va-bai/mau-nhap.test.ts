// Màn Mẫu nhập qua API trên Postgres thật (hàng 50 mau-nhap-va-bai, E1–E7). Lần nhập dựng qua đường nhập thật (mở → gửi gói
// → đã ghi) bằng lõi thật (`readTable` + `planFromDictionary`); tên `[Tên]`, số `0900 000 0xx`. Mỗi phép âm tính có đối chứng.
import { khoaMau, planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string };
async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} mnvb ${ten}]`, mail(`mnvb-${ten}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`mnvb-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    qt: { userId: s.userId, cookie: `${await login(mail(`mnvb-${ten}-qt`))}; qh_san=${s.companyId}` },
    dc: await them(["listing_agent"], "dc"),
    tn: await them(["team_lead"], "tn"),
    ts: await them(["telesales"], "ts"),
    dk: await them(["buyer_agent"], "dk"),
  };
}
type San = Awaited<ReturnType<typeof sanMoi>>;

let soTep = 0;
let soCan = 0;
/** Mở một lần nhập một dòng (Toà A, mã căn mới) với các tiêu đề cho trước; cột lạ đi ghi chú theo từ điển. */
async function moLan(cookie: string, tieuDe: string[]) {
  const ma = `A-${String(++soCan).padStart(2, "0")}.${String(soCan % 30).padStart(2, "0")}`;
  const giaTri = (h: string): Cell => (/^to/i.test(h.trim()) ? "Toà A" : /mã/i.test(h) ? ma : /tình trạng/i.test(h) ? "còn hàng" : /giá/i.test(h) ? "3,5 tỷ" : "ghi chú");
  const dong = tieuDe.map(giaTri);
  const bang = readTable([tieuDe, dong]);
  const plan = planFromDictionary(bang);
  const res = await send(
    "POST",
    "/api/v1/imports",
    { fileName: `[Tệp ${++soTep}].xlsx`, fileHash: createHash("sha256").update(`${RUN}-mnvb-${soTep}`).digest("hex"), fileKind: "xlsx", headers: bang.headers, headerRow: 0, plan, units: [{ row: 2, buildingName: "Toà A", unitNumber: ma }] },
    cookie,
  );
  assert.equal(res.status, 201, await res.clone().text());
  return { id: ((await res.json()) as { id: string }).id, rows: [{ row: 2, cells: dong }] };
}
async function ghi(cookie: string, lan: { id: string; rows: unknown[] }) {
  const r = await send("POST", `/api/v1/imports/${lan.id}/rows`, { dryRun: false, rows: lan.rows }, cookie);
  assert.equal(r.status, 200, await r.clone().text());
}
const nhapXong = async (cookie: string, tieuDe: string[]) => {
  const lan = await moLan(cookie, tieuDe);
  await ghi(cookie, lan);
  return lan;
};

type Cot = { headerKey: string; target: string; valueMap?: Record<string, string>; nguon: { kieu: string; importId?: string; editedBy?: string | null } };
const P = "/api/v1/company/import-templates";
const docQt = async (s: San): Promise<Cot[]> => {
  const r = await send("GET", P, undefined, s.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Cot[];
};
const docNhap = async (s: San): Promise<{ headerKey: string; target: string; valueMap?: Record<string, string> }[]> => {
  const r = await send("GET", "/api/v1/imports/templates", undefined, s.dc.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { headerKey: string; target: string }[];
};
const k = (h: string) => encodeURIComponent(khoaMau(h));
const soDong = async (companyId: string) => (await appPool.query<{ n: number }>("select count(*)::int n from import_templates where company_id = $1", [companyId])).rows[0]!.n;
const tenCua = async (userId: string) => (await identityPool.query<{ name: string }>('select name from identity."user" where id = $1', [userId])).rows[0]!.name;

// ---- E1 ----
test("mẫu nhập: xem đúng mẫu của sàn", async () => {
  const s = await sanMoi("e1");
  const a = await nhapXong(s.dc.cookie, ["Toà", "Mã căn", "Giá"]);
  const b = await nhapXong(s.dc.cookie, ["Toà", "Mã căn", "Ghi chú riêng"]);
  await moLan(s.dc.cookie, ["Toà", "Mã căn", "Chỉ ở lần mở"]); // chỉ mở, chưa ghi
  const ds = await docQt(s);
  const mong = new Set(["Toà", "Mã căn", "Giá", "Ghi chú riêng"].map(khoaMau));
  assert.ok(!ds.some((c) => c.headerKey === khoaMau("Chỉ ở lần mở")), "lần chưa ghi dạy mẫu");
  assert.deepEqual(new Set(ds.map((c) => c.headerKey)), mong, "tập khoá khác hợp tiêu đề của các lần đã ghi");
  assert.equal(ds.length, mong.size);
  assert.equal(ds.find((c) => c.headerKey === khoaMau("Toà"))!.nguon.importId, b.id, "tiêu đề trùng phải lấy lần ghi sau");
  assert.equal(ds.find((c) => c.headerKey === khoaMau("Giá"))!.nguon.importId, a.id);
});

// ---- E2 ----
test("mẫu nhập: sửa một cột, lần nhập kế dùng bản mới", async () => {
  const s = await sanMoi("e2");
  const DANG = ["Tình trạng", "Giá bán", "Toà  A", "Giá/m2", "Diện tích (m²)"];
  await nhapXong(s.dc.cookie, ["Mã căn", ...DANG]);
  const truoc = await docNhap(s);
  // Trạng thái: đổi quy đổi (trường giá trị đóng).
  const r = await send("PUT", `${P}/${k("Tình trạng")}`, { target: "standardStatus", valueMap: { "còn hàng": "Active" } }, s.qt.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const sau = await docNhap(s);
  assert.deepEqual(sau.find((c) => c.headerKey === khoaMau("Tình trạng"))?.valueMap, { "còn hàng": "Active" }, "màn nhập chưa thấy bản sửa");
  for (const c of truoc) if (c.headerKey !== khoaMau("Tình trạng")) assert.deepEqual(sau.find((x) => x.headerKey === c.headerKey)?.target, c.target, `khoá ${c.headerKey} đổi theo`);
  const qt = (await docQt(s)).find((c) => c.headerKey === khoaMau("Tình trạng"))!;
  assert.deepEqual([qt.nguon.kieu, qt.nguon.editedBy], ["sua", await tenCua(s.qt.userId)]);
  const dong = (await appPool.query<{ action: string; edited_by: string }>("select action, edited_by from import_templates where company_id = $1", [s.companyId])).rows;
  assert.deepEqual(dong, [{ action: "set", edited_by: s.qt.userId }]);
  // Năm dạng tiêu đề: mỗi dạng một PUT đúng khoá.
  let dem = 0;
  for (const h of DANG) {
    const x = await send("PUT", `${P}/${k(h)}`, { target: "keep_as_note" }, s.qt.cookie);
    assert.equal(x.status, 200, `dạng «${h}»: ${await x.clone().text()}`);
    assert.equal(((await x.json()) as Cot).headerKey, khoaMau(h), `dạng «${h}» trúng sai khoá`);
    dem++;
  }
  assert.equal(dem, DANG.length);
  // Ca xen kẽ: lần nhập mở TRƯỚC lần sửa, ghi SAU — mẫu vẫn là bản sửa.
  const dang = await moLan(s.dc.cookie, ["Mã căn", "Giá bán"]);
  assert.equal((await send("PUT", `${P}/${k("Giá bán")}`, { target: "floorPrice", transform: { name: "price", params: { unit: "ty" } } }, s.qt.cookie)).status, 200);
  await ghi(s.dc.cookie, dang);
  assert.equal((await docNhap(s)).find((c) => c.headerKey === khoaMau("Giá bán"))?.target, "floorPrice", "lần nhập dở từ trước đè bản sửa");
});

// ---- E3 ----
test("mẫu nhập: xoá một cột rồi học lại", async () => {
  const s = await sanMoi("e3");
  const DANG = ["Tình trạng", "Giá bán", "Toà  A", "Giá/m2", "Diện tích (m²)"];
  await nhapXong(s.dc.cookie, ["Mã căn", ...DANG]);
  assert.equal((await send("DELETE", `${P}/${k("Giá/m2")}`, undefined, s.qt.cookie)).status, 204);
  assert.ok(!(await docQt(s)).some((c) => c.headerKey === khoaMau("Giá/m2")), "khoá đã xoá còn trong mẫu");
  assert.ok(!(await docNhap(s)).some((c) => c.headerKey === khoaMau("Giá/m2")), "khoá đã xoá còn trong mẫu màn nhập");
  assert.ok((await docNhap(s)).some((c) => c.headerKey === khoaMau("Giá bán")), "đối chứng: khoá khác còn");
  assert.equal((await send("DELETE", `${P}/${k("Giá/m2")}`, undefined, s.qt.cookie)).status, 404, "xoá lần hai phải 404");
  // Lần nhập mở SAU lần xoá dạy lại khoá.
  const moi = await nhapXong(s.dc.cookie, ["Mã căn", "Giá/m2"]);
  assert.equal((await docQt(s)).find((c) => c.headerKey === khoaMau("Giá/m2"))?.nguon.importId, moi.id, "lần nhập mới hơn lần xoá phải dạy lại khoá");
  // Mỗi dạng tiêu đề một DELETE đúng khoá.
  let dem = 0;
  for (const h of DANG.filter((h) => h !== "Giá/m2")) {
    assert.equal((await send("DELETE", `${P}/${k(h)}`, undefined, s.qt.cookie)).status, 204, `dạng «${h}»`);
    assert.ok(!(await docQt(s)).some((c) => c.headerKey === khoaMau(h)), `dạng «${h}» còn sau khi xoá`);
    dem++;
  }
  assert.equal(dem, DANG.length - 1);
  // Ca xen kẽ: lần nhập mở TRƯỚC lần xoá, ghi SAU — khoá vẫn vắng.
  const dang = await moLan(s.dc.cookie, ["Mã căn", "Giá/m2"]);
  assert.equal((await send("DELETE", `${P}/${k("Giá/m2")}`, undefined, s.qt.cookie)).status, 204);
  await ghi(s.dc.cookie, dang);
  assert.ok(!(await docNhap(s)).some((c) => c.headerKey === khoaMau("Giá/m2")), "lần nhập dở từ trước dạy lại khoá đã xoá");
});

// ---- E4 ----
test("mẫu nhập: lần nhập đã xong không đổi", async () => {
  const s = await sanMoi("e4");
  const xong = await nhapXong(s.dc.cookie, ["Toà", "Mã căn", "Giá"]);
  const dang = await moLan(s.dc.cookie, ["Toà", "Mã căn", "Giá"]);
  const chup = async (id: string) => (await appPool.query<{ p: string }>("select plan::text p from imports where id = $1", [id])).rows[0]!.p;
  const truoc = [await chup(xong.id), await chup(dang.id)];
  const canTruoc = (await appPool.query<{ listing_id: string }>("select listing_id from import_rows where import_id = $1 and listing_id is not null", [xong.id])).rows.map((r) => r.listing_id);
  assert.equal((await send("PUT", `${P}/${k("Giá")}`, { target: "floorPrice", transform: { name: "price", params: { unit: "ty" } } }, s.qt.cookie)).status, 200);
  assert.equal((await send("DELETE", `${P}/${k("Toà")}`, undefined, s.qt.cookie)).status, 204);
  assert.deepEqual([await chup(xong.id), await chup(dang.id)], truoc, "kế hoạch đã lưu đổi theo mẫu");
  // Lần đang mở ghi tiếp theo kế hoạch cũ: cột Giá vào giá rao, không vào giá đáy.
  await ghi(s.dc.cookie, dang);
  const planDang = JSON.parse(await chup(dang.id)) as { columns: { target: string }[] };
  assert.equal(planDang.columns[2]!.target, "listPrice", "lần nhập đang mở đổi theo mẫu");
  // Hoàn tác lần đã ghi gỡ đúng tập căn của nó.
  const ht = await send("POST", `/api/v1/imports/${xong.id}/undo`, { dryRun: false }, s.dc.cookie);
  assert.equal(ht.status, 200, await ht.clone().text());
  const goSau = (await appPool.query<{ id: string }>("select id from listings where id = any($1::uuid[]) and voided", [canTruoc])).rows.map((r) => r.id);
  assert.deepEqual(new Set(goSau), new Set(canTruoc), "hoàn tác không gỡ đúng tập căn");
});

// ---- E5 ----
test("mẫu nhập: sửa sai luật bị từ chối", async () => {
  const s = await sanMoi("e5");
  await nhapXong(s.dc.cookie, ["Mã căn", "Tình trạng", "Giá"]);
  const BANG: [string, string, unknown, number][] = [
    ["đích lạ", "Giá", { target: "khong-co" }, 400],
    ["quy đổi ở trường thường", "Giá", { target: "listPrice", valueMap: { a: "b" } }, 400],
    ["quy đổi ở trường lớp nguồn", "Giá", { target: "ownerPhone", valueMap: { a: "b" } }, 400],
    ["phép không hợp với đích", "Giá", { target: "listPrice", transform: { name: "date", params: { order: "dmy" } } }, 400],
    ["khoá không có", "Không có cột này", { target: "keep_as_note" }, 404],
  ];
  const truoc = await soDong(s.companyId);
  let dem = 0;
  for (const [ca, h, than, ma] of BANG) {
    const r = await send("PUT", `${P}/${k(h)}`, than, s.qt.cookie);
    assert.equal(r.status, ma, `${ca}: ${await r.clone().text()}`);
    if (ma === 400) assert.ok(((await r.json()) as { reason?: string }).reason, `${ca}: thiếu lý do`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.equal(await soDong(s.companyId), truoc, "bản sửa sai luật vẫn ghi sổ");
  assert.equal((await send("PUT", `${P}/${k("Tình trạng")}`, { target: "standardStatus", valueMap: { "còn hàng": "Active" } }, s.qt.cookie)).status, 200, "đối chứng: quy đổi ở Trạng thái");
});

// ---- E6 ----
test("mẫu nhập: ma trận vai", async () => {
  const s = await sanMoi("e6");
  await nhapXong(s.dc.cookie, ["Mã căn", "Giá", "Toà", "Ghi chú riêng", "Tình trạng"]);
  const NGUOI: [string, string, number[]][] = [
    ["qt", s.qt.cookie, [200, 200, 204]],
    ["dc", s.dc.cookie, [403, 403, 403]],
    ["tn", s.tn.cookie, [403, 403, 403]],
    ["ts", s.ts.cookie, [403, 403, 403]],
    ["dk", s.dk.cookie, [403, 403, 403]],
    ["", "", [401, 401, 401]],
  ];
  const KHOA = ["Giá", "Toà", "Ghi chú riêng", "Tình trạng", "Mã căn", "Giá"];
  let o = 0;
  for (const [i, [ai, ck, mong]] of NGUOI.entries()) {
    const truoc = await soDong(s.companyId);
    const ma = [
      (await send("GET", P, undefined, ck)).status,
      (await send("PUT", `${P}/${k(KHOA[i]!)}`, { target: "keep_as_note" }, ck)).status,
      (await send("DELETE", `${P}/${k(KHOA[i]!)}`, undefined, ck)).status,
    ];
    for (let j = 0; j < 3; j++) {
      assert.equal(ma[j], mong[j], `${ai || "không cookie"} đường ${j}: ${ai === "dc" ? "đầu chủ sửa được mẫu" : "sai mã"}`);
      o++;
    }
    assert.equal(await soDong(s.companyId), truoc + (ai === "qt" ? 2 : 0), `${ai || "không cookie"}: số dòng sổ`);
  }
  assert.equal(o, 18);
});

// ---- E7 ----
test("mẫu nhập: sàn khác không thấy", async () => {
  const a = await sanMoi("e7a");
  const b = await sanMoi("e7b");
  await nhapXong(a.dc.cookie, ["Mã căn", "Giá riêng A"]);
  assert.ok((await docQt(a)).some((c) => c.headerKey === khoaMau("Giá riêng A")), "đối chứng: A thấy khoá của mình");
  assert.ok(!(await docQt(b)).some((c) => c.headerKey === khoaMau("Giá riêng A")), "sàn B đọc được mẫu của A");
  const truoc = await soDong(a.companyId);
  assert.equal((await send("PUT", `${P}/${k("Giá riêng A")}`, { target: "keep_as_note" }, b.qt.cookie)).status, 404);
  assert.equal((await send("DELETE", `${P}/${k("Giá riêng A")}`, undefined, b.qt.cookie)).status, 404);
  assert.equal(await soDong(a.companyId), truoc, "sàn B đổi được mẫu của A");
});
