// Trường riêng trên Postgres thật (hàng 47: E1, E2b, E3b, E4, E4d, E5b, E6, E7c, E8, E9b, E10b). Sàn, người, căn, liên
// hệ, Lần gửi dựng qua đường ghi thật; kết nối chủ chỉ để đếm và đọc dòng định nghĩa, nhật ký, sự kiện, bản tính.
// Số mẫu `0900 000 0xx`, tên «[Tên]», mã «can_goc» (từ «Căn góc»), «noi_that_ban_giao», «nguon_khach», «gio_goi_duoc».
import { thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { after, test } from "node:test";
import { appPool, cleanup } from "../helpers";
import { hangCoChu, maMoi, send, sanMoi, soMoi, type San } from "../san-thu";

after(cleanup);

const VAI = {
  tn: { vai: ["team_lead"] },
  dc: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà A"] },
  dk: { vai: ["buyer_agent"] },
  ts: { vai: ["telesales"] },
};
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const URL_F = "/api/v1/company/fields";
const CAN_GOC = { target: "listing", kind: "bool", label: "Căn góc", options: [] };
const NOI_THAT = { target: "listing", kind: "single_select", label: "Nội thất bàn giao", options: [{ label: "Cơ bản" }, { label: "Đầy đủ" }, { label: "Thô" }] };
const NGUON = { target: "contact", contactTypes: ["Buyer", "Tenant"], kind: "single_select", label: "Nguồn khách", options: [{ label: "Zalo" }, { label: "Giới thiệu" }] };
const GIO_GOI = { target: "contact", contactTypes: ["Seller", "Landlord"], kind: "single_select", label: "Giờ gọi được", options: [{ label: "Sáng" }, { label: "Tối" }] };

type Truong = { code: string; target: string; contactTypes: string[]; kind: string; label: string; options: { code: string; label: string }[]; dataClass: string; archived: boolean };
const ghi = (s: San, fields: unknown[], k = "qt") => send("PUT", URL_F, { fields }, ck(s, k));
async function ghiDuoc(s: San, fields: unknown[]): Promise<Truong[]> {
  const r = await ghi(s, fields);
  assert.equal(r.status, 200, await r.clone().text());
  return ((await r.json()) as { fields: Truong[] }).fields;
}
/** Thân PUT giữ nguyên bộ đang có (mọi trường còn sống). */
const giu = (bo: Truong[]) => bo.filter((t) => !t.archived).map(({ code, target, contactTypes, kind, label, options }) => ({ code, target, contactTypes, kind, label, options }));
const demDong = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from custom_fields where company_id = $1", [s.companyId])).rows[0]!.n;
const demNhatKy = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from custom_field_events where company_id = $1", [s.companyId])).rows[0]!.n;
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const customHang = async (id: string) => (await appPool.query<{ custom: unknown }>("select custom from listings where id = $1", [id])).rows[0]!.custom;
const customLienHe = async (id: string) => (await appPool.query<{ custom: unknown }>("select custom from contacts where id = $1", [id])).rows[0]!.custom;
const chuNha = async (hangId: string) => (await appPool.query<{ contact_id: string }>("select contact_id from listing_owners where listing_id = $1", [hangId])).rows[0]!.contact_id;

async function lenh(s: San, k: string, id: string, body: object) {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  return send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck(s, k));
}
async function lenhDuoc(s: San, k: string, id: string, payload: object) {
  const r = await lenh(s, k, id, { type: "custom_changed", payload });
  assert.equal(r.status, 200, await r.clone().text());
}
const canMoi = (s: San, k = "dc") => hangCoChu(s, k, maMoi(s), soMoi(s));

test("trường riêng: tạo trường của hàng", async () => {
  const s = await sanMoi(VAI);
  const truoc = await demNhatKy(s);
  const bo = await ghiDuoc(s, [CAN_GOC, NOI_THAT]);
  const r = await send("GET", URL_F, undefined, ck(s, "dc"));
  assert.equal(r.status, 200);
  const doc = ((await r.json()) as { fields: Truong[] }).fields;
  assert.deepEqual(doc, bo);
  assert.deepEqual(doc[0], { code: "can_goc", target: "listing", contactTypes: [], kind: "bool", label: "Căn góc", options: [], dataClass: "custom_field", archived: false });
  assert.deepEqual([doc[1]!.code, doc[1]!.options.map((o) => o.code)], ["noi_that_ban_giao", ["co_ban", "day_du", "tho"]]);
  const dong = (await appPool.query<{ data_class: string; updated_by: string }>("select data_class, updated_by from custom_fields where company_id = $1 order by code", [s.companyId])).rows;
  assert.deepEqual(dong, [{ data_class: "custom_field", updated_by: s.nguoi.qt!.userId }, { data_class: "custom_field", updated_by: s.nguoi.qt!.userId }]);
  assert.equal((await demNhatKy(s)) - truoc, 2, "mỗi trường mới đúng một sự kiện nhật ký");
  const nk = (await appPool.query<{ actor_user_id: string }>("select distinct actor_user_id from custom_field_events where company_id = $1", [s.companyId])).rows;
  assert.deepEqual(nk, [{ actor_user_id: s.nguoi.qt!.userId }]);
  // Chiều đỏ: lưu lại cùng bộ không ghi sự kiện mới.
  await ghiDuoc(s, giu(bo));
  assert.equal((await demNhatKy(s)) - truoc, 2, "lưu lại cùng bộ ghi thêm nhật ký");
});

test("trường riêng: trùng nghĩa bị chặn", async () => {
  const s = await sanMoi(VAI);
  const [d0, n0] = [await demDong(s), await demNhatKy(s)];
  const r1 = await ghi(s, [{ ...CAN_GOC }, { target: "listing", kind: "bool", label: "Hướng", options: [] }]);
  assert.equal(r1.status, 409);
  const t1 = (await r1.json()) as { error: string; standardField: string };
  assert.deepEqual([t1.error, t1.standardField], ["trung-nghia", "directionFaces"]);
  const r2 = await ghi(s, [{ target: "contact", contactTypes: ["Buyer"], kind: "bool", label: "Số điện thoại", options: [] }]);
  assert.equal(r2.status, 409);
  assert.deepEqual([await demDong(s), await demNhatKy(s)], [d0, n0], "bị chặn mà vẫn ghi");
  await ghiDuoc(s, [CAN_GOC]);
});

test("trường riêng: bộ trường sai không ghi gì", async () => {
  const s = await sanMoi(VAI);
  const bo = await ghiDuoc(s, [CAN_GOC]);
  const d0 = await demDong(s);
  const hai_muoi = Array.from({ length: 19 }, (_, i) => ({ target: "listing", kind: "bool", label: `Trường ${i + 1}`, options: [] }));
  const BANG: [string, unknown[], RegExp][] = [
    ["kind text", [...giu(bo), { target: "listing", kind: "text", label: "Mới", options: [] }], /kind/],
    ["31 lựa chọn", [...giu(bo), { target: "listing", kind: "single_select", label: "Mức", options: Array.from({ length: 31 }, (_, i) => ({ label: `L${i}` })) }], /options/],
    ["trường thứ 21", [...giu(bo), ...hai_muoi, { target: "listing", kind: "bool", label: "Thừa", options: [] }], /tối đa 20/],
    ["đổi kind can_goc", [{ ...giu(bo)[0], kind: "single_select", options: [{ label: "Có" }] }], /kind/],
  ];
  for (const [ten, than, re] of BANG) {
    const r = await ghi(s, than);
    assert.equal(r.status, 400, `${ten}: ${await r.clone().text()}`);
    assert.match(((await r.json()) as { reason: string }).reason, re, ten);
    assert.equal(await demDong(s), d0, `${ten}: đã ghi nửa chừng`);
  }
});

test("trường riêng: giá trị của căn", async () => {
  const s = await sanMoi(VAI);
  const bo = await ghiDuoc(s, [CAN_GOC, NOI_THAT, NGUON, { target: "listing", kind: "bool", label: "Sẽ bỏ", options: [] }]);
  const id = await canMoi(s);
  const n0 = await demSuKien(id);
  await lenhDuoc(s, "dc", id, { can_goc: true });
  assert.equal(await demSuKien(id), n0 + 1);
  const cuoi = (await appPool.query<{ type: string; payload: unknown }>("select type, payload from listing_events where listing_id = $1 order by seq desc limit 1", [id])).rows[0];
  assert.deepEqual(cuoi, { type: "custom_changed", payload: { can_goc: true } });
  assert.deepEqual(await customHang(id), { can_goc: true });
  await lenhDuoc(s, "dc", id, { noi_that_ban_giao: "co_ban" });
  assert.deepEqual(await customHang(id), { can_goc: true, noi_that_ban_giao: "co_ban" });
  await lenhDuoc(s, "dc", id, { can_goc: null });
  assert.deepEqual(await customHang(id), { noi_that_ban_giao: "co_ban" });
  // Bỏ trường «Sẽ bỏ» để có mã đã bỏ.
  await ghiDuoc(s, giu(bo).map((t) => (t.code === "se_bo" ? { ...t, archived: true } : t)));
  const BANG: [string, object][] = [
    ["khong_co", { khong_co: true }],
    ["nguon_khach", { nguon_khach: "zalo" }],
    ["can_goc", { can_goc: "co" }],
    ["noi_that_ban_giao", { noi_that_ban_giao: "khong_co" }],
    ["se_bo", { se_bo: true }],
  ];
  for (const [ma, p] of BANG) {
    const n = await demSuKien(id);
    const r = await lenh(s, "dc", id, { type: "custom_changed", payload: p });
    assert.equal(r.status, 400, `${ma}: ${await r.clone().text()}`);
    assert.match(await r.text(), new RegExp(ma));
    assert.equal(await demSuKien(id), n, `${ma}: đã ghi sự kiện`);
  }
});

test("trường riêng: giá trị đi qua đồng bộ", async () => {
  // Máy kéo bản hàng bằng GET /api/v1/listings (apps/web/src/lib/sync).
  const s = await sanMoi(VAI);
  await ghiDuoc(s, [CAN_GOC]);
  // Căn chưa lên bảng là của riêng đầu chủ (trục ai thấy hàng) — đưa cả hai lên Đang bán để trưởng nhóm thấy.
  const { lenBang } = await import("../san-thu");
  const [x, y] = [await canMoi(s), await canMoi(s)];
  await lenBang(s, "dc", x);
  await lenBang(s, "dc", y);
  await lenhDuoc(s, "dc", x, { can_goc: true });
  const r = await send("GET", "/api/v1/listings", undefined, ck(s, "tn"));
  assert.equal(r.status, 200, await r.clone().text());
  const ds = (await r.json()) as { id: string; custom?: unknown }[];
  assert.deepEqual(ds.find((h) => h.id === x)!.custom, { can_goc: true }, "bản kéo thiếu custom");
  assert.deepEqual(ds.find((h) => h.id === y)!.custom, {});
});

test("trường riêng: thân công khai không mang trường riêng", async () => {
  const s = await sanMoi(VAI);
  await ghiDuoc(s, [CAN_GOC, NOI_THAT]);
  const id = await canMoi(s);
  // Căn phải lên bảng mới gửi được — đi đường lên bảng thật.
  const { lenBang } = await import("../san-thu");
  await lenBang(s, "dc", id);
  await lenhDuoc(s, "dc", id, { can_goc: true, noi_that_ban_giao: "co_ban" });
  const k = thanKhachMoi({ ten: "[Tên]", so: soMoi(s), need: "purchase" });
  assert.ok(k.ok);
  const p = await send("POST", "/api/v1/prospects", k.than, ck(s, "dk"));
  assert.equal(p.status, 201, await p.clone().text());
  const t = thanLanGui({ nguoiNhan: "khach_rieng", prospectId: ((await p.json()) as { id: string }).id, listingIds: [id] });
  assert.ok(t.ok);
  const g = await send("POST", "/api/v1/shares", t.than, ck(s, "dk"));
  assert.equal(g.status, 201, await g.clone().text());
  const { code } = (await g.json()) as { code: string };
  const r = await send("GET", `/api/v1/public/shares/${code}`);
  assert.equal(r.status, 200, await r.clone().text());
  const chu = await r.text();
  assert.equal((JSON.parse(chu) as { can: unknown[] }).can.length, 1, "đối chứng: thân có căn");
  for (const moi of ["can_goc", "noi_that_ban_giao", "co_ban", "Căn góc", "Cơ bản", "\"custom\""]) assert.ok(!chu.includes(moi), `thân công khai mang ${moi}`);
});

test("trường riêng: trường của liên hệ theo loại", async () => {
  const s = await sanMoi(VAI);
  const bo = await ghiDuoc(s, [NGUON, GIO_GOI]);
  assert.deepEqual(bo.map((t) => [t.code, t.dataClass]), [["nguon_khach", "custom_field"], ["gio_goi_duoc", "source"]]);
  const hang = await canMoi(s);
  const x = await chuNha(hang);
  const k = thanKhachMoi({ ten: "[Tên]", so: soMoi(s), need: "purchase" });
  assert.ok(k.ok);
  const p = await send("POST", "/api/v1/prospects", k.than, ck(s, "dk"));
  assert.equal(p.status, 201);
  const y = (await appPool.query<{ contact_id: string }>("select contact_id from prospects where id = $1", [((await p.json()) as { id: string }).id])).rows[0]!.contact_id;
  const r = await send("PATCH", `/api/v1/contacts/${x}/custom`, { gio_goi_duoc: "sang" }, ck(s, "dc"));
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(await customLienHe(x), { gio_goi_duoc: "sang" });
  const sai = await send("PATCH", `/api/v1/contacts/${x}/custom`, { nguon_khach: "zalo" }, ck(s, "dc"));
  assert.equal(sai.status, 400);
  assert.match(await sai.text(), /nguon_khach/);
  const hx = await send("GET", `/api/v1/contacts/${x}/profile`, undefined, ck(s, "dc"));
  assert.deepEqual(((await hx.json()) as { contact: { custom: unknown } }).contact.custom, { gio_goi_duoc: "sang" });
  // Liên hệ khách không có người giữ — trưởng nhóm đọc.
  const hy = await send("GET", `/api/v1/contacts/${y}/profile`, undefined, ck(s, "tn"));
  assert.equal(hy.status, 200, await hy.clone().text());
  assert.deepEqual(((await hy.json()) as { contact: { custom: unknown } }).contact.custom, {});
});

// ---- E7c: mọi đường đọc liên hệ ----
const GOC = resolve(import.meta.dirname, "../../../..");
function tepTs(thu: string): string[] {
  const ra: string[] = [];
  const di = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) di(p);
      else if (p.endsWith(".ts") && !p.endsWith(".test.ts")) ra.push(p);
    }
  };
  di(thu);
  return ra;
}

test("trường riêng: mọi đường đọc liên hệ không lộ custom", async () => {
  // Chỗ đọc bảng contacts trong mã API: bảng viết trước — chỗ mới mà bảng thiếu thì ca đỏ nêu tệp.
  const CHO_DOC = ["packages/api/src/contacts/read/store.ts:2", "packages/api/src/contacts/store.ts:1"];
  const thay = tepTs(join(GOC, "packages/api/src"))
    .map((p) => [relative(GOC, p), (readFileSync(p, "utf8").match(/(from|join)\s+(public\.)?contacts\b/g) ?? []).length] as const)
    .filter(([, n]) => n > 0)
    .map(([p, n]) => `${p}:${n}`)
    .sort();
  assert.deepEqual(thay, CHO_DOC, "chỗ đọc contacts đổi — thêm đường vào bảng dưới");
  // Hàm SQL trả nguyên dòng contacts thì custom đi theo: không hàm nào được làm vậy.
  const migDir = join(GOC, "packages/db/migrations");
  for (const f of readdirSync(migDir)) {
    const sql = readFileSync(join(migDir, f), "utf8");
    assert.ok(!/returns\s+(setof\s+)?(public\.)?contacts\b/i.test(sql), `${f}: hàm trả nguyên dòng contacts`);
    assert.ok(!/return\s+query\s+select\s+\*\s+from\s+(public\.)?contacts\b/i.test(sql), `${f}: return query select * from contacts`);
  }

  const s = await sanMoi(VAI);
  await ghiDuoc(s, [GIO_GOI]);
  // Mồi: một lựa chọn mang chữ mồi để quét chuỗi.
  const bo = (await (await send("GET", URL_F, undefined, ck(s, "qt"))).json()) as { fields: Truong[] };
  await ghiDuoc(s, giu(bo.fields).map((t) => ({ ...t, options: [...t.options, { label: "Mồi giờ gọi" }] })));
  const so = soMoi(s);
  const hang = await hangCoChu(s, "dc", maMoi(s), so);
  const x = await chuNha(hang);
  assert.equal((await send("PATCH", `/api/v1/contacts/${x}/custom`, { gio_goi_duoc: "moi_gio_goi" }, ck(s, "dc"))).status, 200);
  // Đối chứng dương: người giữ thấy mồi ở hồ sơ.
  assert.ok((await (await send("GET", `/api/v1/contacts/${x}/profile`, undefined, ck(s, "dc"))).text()).includes("moi_gio_goi"));

  const sB = await sanMoi(VAI);
  const DUONG: [string, (s: San, k: string) => Promise<Response>][] = [
    ["danh sách liên hệ", (z, k) => send("GET", "/api/v1/contacts", undefined, ck(z, k))],
    ["tra theo số", (z, k) => send("POST", "/api/v1/contacts/lookup-phone", { phone: so }, ck(z, k))],
    ["hồ sơ liên hệ", (z, k) => send("GET", `/api/v1/contacts/${x}/profile`, undefined, ck(z, k))],
    ["một liên hệ", (z, k) => send("GET", `/api/v1/contacts/${x}`, undefined, ck(z, k))],
    ["chủ nhà của căn", (z, k) => send("GET", `/api/v1/listings/${hang}/owner`, undefined, ck(z, k))],
    ["kéo đồng bộ hàng", (z, k) => send("GET", "/api/v1/listings", undefined, ck(z, k))],
  ];
  const NGUOI: [string, San, string][] = [["đầu chủ không giữ", s, "dc2"], ["telesales", s, "ts"], ["quản trị", s, "qt"], ["người sàn B", sB, "dc"]];
  let o = 0;
  for (const [duong, goi] of DUONG) {
    for (const [ai, san, k] of NGUOI) {
      const chu = await (await goi(san, k)).text();
      assert.ok(!chu.includes("moi_gio_goi"), `${ai} × ${duong}: lộ giá trị trường riêng`);
      o++;
    }
  }
  assert.equal(o, DUONG.length * NGUOI.length);
});

test("trường riêng: đổi tên, thêm lựa chọn, bỏ trường", async () => {
  const s = await sanMoi(VAI);
  let bo = await ghiDuoc(s, [NOI_THAT]);
  const id = await canMoi(s);
  await lenhDuoc(s, "dc", id, { noi_that_ban_giao: "co_ban" });
  const n0 = await demSuKien(id);
  bo = await ghiDuoc(s, giu(bo).map((t) => ({ ...t, label: "Nội thất khi giao", options: [...t.options.map((o) => (o.code === "co_ban" ? { ...o, label: "Cơ bản (bếp)" } : o)), { label: "Cao cấp" }] })));
  assert.equal(await demSuKien(id), n0, "đổi tên chạm căn");
  assert.deepEqual(await customHang(id), { noi_that_ban_giao: "co_ban" });
  assert.ok(bo[0]!.options.some((o) => o.code === "cao_cap"));
  bo = await ghiDuoc(s, giu(bo).map((t) => ({ ...t, archived: true })));
  assert.equal(bo.find((t) => t.code === "noi_that_ban_giao")!.archived, true);
  assert.deepEqual(await customHang(id), { noi_that_ban_giao: "co_ban" }, "bỏ trường xoá giá trị đã ghi");
  assert.equal((await lenh(s, "dc", id, { type: "custom_changed", payload: { noi_that_ban_giao: "day_du" } })).status, 400);
  bo = await ghiDuoc(s, [NOI_THAT]);
  assert.ok(bo.some((t) => t.code === "noi_that_ban_giao_2" && !t.archived), "trường mới cùng tên phải mang mã mới");
});

test("trường riêng: sàn khác và vai khác", async () => {
  const [a, b] = [await sanMoi(VAI), await sanMoi(VAI)];
  await ghiDuoc(a, [CAN_GOC]);
  const r = await send("GET", URL_F, undefined, ck(b, "dc"));
  assert.deepEqual(((await r.json()) as { fields: unknown[] }).fields, []);
  const hb = await canMoi(b);
  assert.equal((await lenh(b, "dc", hb, { type: "custom_changed", payload: { can_goc: true } })).status, 400);
  const d0 = await demDong(a);
  for (const k of ["dc", "ts"]) assert.equal((await ghi(a, [CAN_GOC, { ...CAN_GOC, label: "Khác" }], k)).status, 403, k);
  assert.equal(await demDong(a), d0);
});

test("trường riêng: căn và liên hệ không mang custom", async () => {
  const s = await sanMoi(VAI);
  const id = await canMoi(s);
  const { lenBang } = await import("../san-thu");
  await lenBang(s, "dc", id);
  assert.deepEqual(await customHang(id), {});
  assert.equal((await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1 and type = 'custom_changed'", [id])).rows[0]!.n, 0);
  assert.deepEqual(await customLienHe(await chuNha(id)), {});
  const r = await send("GET", URL_F, undefined, ck(s, "dc"));
  assert.deepEqual(((await r.json()) as { fields: unknown[] }).fields, []);
});
