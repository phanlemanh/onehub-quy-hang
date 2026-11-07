// Bảng quyền thao tác × vai của hàng qua API trên Postgres thật (hàng bang-quyen-theo-vai: AC-2..AC-5, AC-8). Bảng 56 ô
// đọc từ lõi (packages/core/src/access/bang-quyen-hang.json) — không chép bảng vào bài. Người giữ căn dựng bằng đường thật:
// trưởng nhóm gán đầu chủ (PUT …/listing-agent), đổi đầu chủ hàng loạt (POST /listings/agent-reassignments).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { LY_DO_DUA_LEN_DANG_BAN, THAO_TAC_HANG, type DongBangQuyen, type ThaoTacHang } from "@quy-hang/core/access";
import { EVENT_TYPES } from "@quy-hang/core/listing";
import { appPool, cleanup, createLoneUser, mail, RUN } from "../helpers";
import { lenBang, login, sanMoi, send, type Nguoi, type San } from "../san-thu";

after(cleanup);

const BANG: DongBangQuyen[] = JSON.parse(readFileSync(new URL("../../../core/src/access/bang-quyen-hang.json", import.meta.url), "utf8"));
const GIA = { listPrice: 3_300_000_000, feeInclusion: "included" };

let san: San;
let so = 0;
const maCan = () => `Q-${RUN}-${so++}.01`;

before(async () => {
  san = await sanMoi({
    giu: { vai: ["listing_agent"] }, // đầu chủ tạo hàng và giữ căn ở ca «người khác giữ»
    tn: { vai: ["team_lead"] }, // trưởng nhóm gán và đổi đầu chủ
    ts: { vai: ["telesales"] },
    dk: { vai: ["buyer_agent"] },
    dc2: { vai: ["listing_agent"] },
  });
});

const phienBan = async (id: string) => (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const banTinh = async (id: string) =>
  (await appPool.query("select list_price::float8, standard_status, unit_number, version from listings where id = $1", [id])).rows[0];
const lenh = async (n: Nguoi, id: string, type: string, payload: object, expectedVersion?: number) =>
  send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: expectedVersion ?? (await phienBan(id)) }, n.cookie);

/** Hàng «Toàn sàn» đủ điều kiện vào Đang bán, đang Tạm ngưng (Hold → Active được): đầu chủ «giu» tạo, lên bảng, tạm ngưng. */
async function hangSanSang(): Promise<string> {
  const r = await send("POST", "/api/v1/listings", { buildingName: "[Toà Q]", unitNumber: maCan() }, san.nguoi.giu!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const { id } = (await r.json()) as { id: string };
  await lenBang(san, "giu", id);
  assert.equal((await lenh(san.nguoi.giu!, id, "status_changed", { to: "Hold" })).status, 200);
  return id;
}

const ganDauChu = async (id: string, userId: string) => {
  const r = await send("PUT", `/api/v1/listings/${id}/listing-agent`, { userId }, san.nguoi.tn!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
};
const doiDauChu = async (id: string, userId: string) => {
  const r = await send("POST", "/api/v1/listings/agent-reassignments", { listingIds: [id], userId }, san.nguoi.tn!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
};

/**
 * Một ca của bảng: thành viên đúng vai và một hàng sẵn sàng do người giữ theo «giu». Ca «từng giữ, mất vai» được gán khi còn
 * vai Đầu chủ rồi quản trị bỏ vai (như đời thật); ca «tung» được gán rồi trưởng nhóm đổi đầu chủ sang người khác.
 */
async function dungCa(o: DongBangQuyen, i: number): Promise<{ nguoi: Nguoi; hang: string }> {
  const email = mail(`bq-${i}`);
  const userId = await createLoneUser(email);
  const matVai = o.giu === "minh" && !o.vai.includes("listing_agent");
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [
    san.companyId,
    userId,
    matVai ? [...o.vai, "listing_agent"] : o.vai,
  ]);
  const nguoi: Nguoi = { userId, cookie: `${await login(email)}; qh_san=${san.companyId}`, ten: email };
  const hang = await hangSanSang();
  if (o.giu === "minh" || o.giu === "tung") await ganDauChu(hang, userId);
  if (o.giu === "khac") await ganDauChu(hang, san.nguoi.giu!.userId);
  if (o.giu === "tung") await doiDauChu(hang, san.nguoi.giu!.userId);
  if (matVai) await appPool.query("update company_members set roles = $3 where company_id = $1 and user_id = $2", [san.companyId, userId, o.vai]);
  return { nguoi, hang };
}

const LAM: Record<ThaoTacHang, (n: Nguoi, hang: string) => Promise<number>> = {
  xem: async (n, h) => (await send("GET", `/api/v1/listings/${h}`, undefined, n.cookie)).status,
  tao: async (n) => (await send("POST", "/api/v1/listings", { buildingName: "[Toà Q]" }, n.cookie)).status,
  sua: async (n, h) => (await lenh(n, h, "price_changed", GIA)).status,
  dua_len_dang_ban: async (n, h) => (await lenh(n, h, "status_changed", { to: "Active" })).status,
};

test("bảng quyền: API đếm khớp từng ô của bảng", async () => {
  assert.equal(BANG.length, 14);
  const lech: string[] = [];
  let khop = 0;
  for (const [i, o] of BANG.entries()) {
    const { nguoi, hang } = await dungCa(o, i);
    for (const t of THAO_TAC_HANG) {
      const ma = await LAM[t](nguoi, hang);
      const ra = ma >= 200 && ma < 300;
      if (!ra) assert.ok(ma === 404 || ma === 403, `«${o.o}» × ${t}: từ chối bằng mã lạ ${ma}`);
      if (ra === o[t]) khop++;
      else lech.push(`«${o.o}» × ${t}: mong ${o[t] ? "✓" : "✗"}, được ${ma}`);
    }
  }
  assert.deepEqual(lech, [], "ô lệch giữa API và bảng quyền");
  assert.equal(khop, BANG.length * THAO_TAC_HANG.length);
  assert.equal(khop, 56);
});

test("bảng quyền: Telesales, Quản trị sàn không thấy hàng Toàn sàn", async () => {
  const h = await hangSanSang();
  const khongCo = await send("GET", `/api/v1/listings/00000000-0000-4000-8000-00000000dead`, undefined, san.nguoi.giu!.cookie);
  const thanKhongCo = await khongCo.json();
  for (const [ten, n] of [["Telesales", san.nguoi.ts!], ["Quản trị sàn", san.nguoi.qt!]] as const) {
    const ds = await send("GET", "/api/v1/listings", undefined, n.cookie);
    assert.equal(ds.status, 200, ten);
    assert.ok(!((await ds.json()) as { id: string }[]).some((l) => l.id === h), `${ten}: danh sách có hàng Toàn sàn`);
    const mot = await send("GET", `/api/v1/listings/${h}`, undefined, n.cookie);
    assert.equal(mot.status, 404, ten);
    assert.deepEqual(await mot.json(), thanKhongCo, `${ten}: thân lỗi khác hàng không có`);
  }
  for (const [ten, n] of [["Đầu khách", san.nguoi.dk!], ["Đầu chủ khác", san.nguoi.dc2!], ["Trưởng nhóm", san.nguoi.tn!]] as const) {
    const ds = await send("GET", "/api/v1/listings", undefined, n.cookie);
    assert.ok(((await ds.json()) as { id: string }[]).some((l) => l.id === h), `${ten}: danh sách thiếu hàng Toàn sàn`);
    assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, n.cookie)).status, 200, ten);
  }
});

test("bảng quyền: Telesales, Quản trị sàn không tạo, không sửa hàng", async () => {
  const h = await hangSanSang();
  const chuaMa = await send("POST", "/api/v1/listings", { buildingName: "[Toà Q]" }, san.nguoi.giu!.cookie);
  const hChuaMa = ((await chuaMa.json()) as { id: string }).id;
  const PAYLOAD: Record<string, [string, object]> = {
    details_changed: [h, { furnished: "full" }],
    price_changed: [h, GIA],
    status_changed: [h, { to: "Withdrawn", withdrawnReason: "owner_changed_mind" }],
    owner_confirmed: [h, {}],
    unit_number_assigned: [hChuaMa, { unitNumber: maCan() }],
    voided: [h, {}],
    // Hàng 47: trường riêng — bảng quyền xét trước mã trường, nên mã chưa có vẫn nhận «không có hàng này».
    custom_changed: [h, { can_goc: true }],
  };
  const loai = EVENT_TYPES.filter((t) => t !== "created");
  assert.equal(loai.length, EVENT_TYPES.length - 1);
  assert.deepEqual([...loai].sort(), Object.keys(PAYLOAD).sort(), "bài phải phủ mọi loại lệnh của lõi");
  let soLan = 0;
  for (const [ten, n] of [["Telesales", san.nguoi.ts!], ["Quản trị sàn", san.nguoi.qt!]] as const) {
    for (const t of loai) {
      const [id, payload] = PAYLOAD[t]!;
      const truoc = [await demSuKien(id), await banTinh(id)];
      const r = await lenh(n, id, t, payload);
      assert.equal(r.status, 404, `${ten} × ${t}`);
      assert.equal(((await r.json()) as { error: string }).error, "not-found", `${ten} × ${t}`);
      assert.deepEqual([await demSuKien(id), await banTinh(id)], truoc, `${ten} × ${t}: hàng đã đổi`);
      soLan++;
    }
    const demHang = async () => (await appPool.query<{ n: number }>("select count(*)::int n from listings where company_id = $1", [san.companyId])).rows[0]!.n;
    const truoc = await demHang();
    assert.equal((await send("POST", "/api/v1/listings", { buildingName: "[Toà Q]" }, n.cookie)).status, 404, `${ten} tạo hàng`);
    assert.equal(await demHang(), truoc, `${ten} tạo được hàng`);
  }
  assert.equal(soLan, loai.length * 2);
});

test("bảng quyền: người có Bảng hàng vẫn sửa hàng Toàn sàn", async () => {
  const ROLES: Record<string, string[]> = { "Đầu khách": ["buyer_agent"], "Đầu chủ khác": ["listing_agent"], "Trưởng nhóm": ["team_lead"] };
  const loai = EVENT_TYPES.filter((t) => t !== "created" && t !== "voided");
  // Hàng 47: sàn có trường riêng «Căn góc» để lệnh custom_changed hợp lệ.
  const tr = await send("PUT", "/api/v1/company/fields", { fields: [{ target: "listing", kind: "bool", label: "Căn góc", options: [] }] }, san.nguoi.qt!.cookie);
  assert.equal(tr.status, 200, await tr.clone().text());
  let soLan = 0;
  for (const [ten, n] of [["Đầu khách", san.nguoi.dk!], ["Đầu chủ khác", san.nguoi.dc2!], ["Trưởng nhóm", san.nguoi.tn!]] as const) {
    const h = await hangSanSang();
    await ganDauChu(h, san.nguoi.giu!.userId);
    const chuaMa = await send("POST", "/api/v1/listings", { buildingName: "[Toà Q]" }, n.cookie);
    assert.equal(chuaMa.status, 201, `${ten} tạo hàng`);
    const hChuaMa = ((await chuaMa.json()) as { id: string }).id;
    const PAYLOAD: Record<string, [string, object]> = {
      details_changed: [h, { furnished: "full" }],
      price_changed: [h, GIA],
      owner_confirmed: [h, {}],
      status_changed: [h, { to: "Withdrawn", withdrawnReason: "owner_changed_mind" }],
      unit_number_assigned: [hChuaMa, { unitNumber: maCan() }],
      custom_changed: [h, { can_goc: true }],
    };
    assert.deepEqual([...loai].sort(), Object.keys(PAYLOAD).sort(), "bài phải phủ mọi loại lệnh sửa của lõi");
    for (const t of loai) {
      const [id, payload] = PAYLOAD[t]!;
      const r = await lenh(n, id, t, payload);
      assert.equal(r.status, 200, `${ten} × ${t}: ${await r.clone().text()}`);
      const cuoi = (await appPool.query("select actor_user_id, actor_roles from listing_events where listing_id = $1 order by seq desc limit 1", [id])).rows[0];
      assert.deepEqual([cuoi.actor_user_id, cuoi.actor_roles], [n.userId, ROLES[ten]], `${ten} × ${t}: người và vai lúc làm`);
      soLan++;
    }
  }
  assert.equal(soLan, loai.length * 3);
});

test("bảng quyền: đưa lên Đang bán theo cờ Sẵn sàng bán", async () => {
  let lan = 100;
  const ca = (ten: string) => {
    const i = BANG.findIndex((o) => o.o === ten);
    assert.ok(i >= 0, `bảng thiếu ca «${ten}»`);
    return dungCa(BANG[i]!, lan++);
  };
  for (const ten of ["Trưởng nhóm · người khác giữ", "Đầu chủ · giữ căn", "Đầu chủ · căn chưa ai giữ"]) {
    const { nguoi, hang } = await ca(ten);
    const r = await lenh(nguoi, hang, "status_changed", { to: "Active" });
    assert.equal(r.status, 200, `${ten}: ${await r.clone().text()}`);
    assert.equal((await banTinh(hang)).standard_status, "Active", ten);
  }
  for (const ten of ["Đầu khách", "Đầu khách · căn chưa ai giữ", "Đầu chủ · người khác giữ", "Đầu chủ từng giữ, căn đã đổi sang người khác"]) {
    const { nguoi, hang } = await ca(ten);
    const truoc = await demSuKien(hang);
    const r = await lenh(nguoi, hang, "status_changed", { to: "Active" });
    assert.equal(r.status, 403, ten);
    assert.deepEqual(await r.json(), { error: "listing-agent-required", reason: LY_DO_DUA_LEN_DANG_BAN }, ten);
    assert.equal(await demSuKien(hang), truoc, `${ten}: có sự kiện mới`);
    assert.equal((await banTinh(hang)).standard_status, "Hold", `${ten}: trạng thái đổi`);
  }
  // Lệnh mang phiên bản cũ vẫn nhận lý do «cần đầu chủ», không phải «đụng nhau».
  const { nguoi, hang } = await ca("Đầu khách");
  const cu = await lenh(nguoi, hang, "status_changed", { to: "Active" }, (await phienBan(hang)) - 1);
  assert.equal(cu.status, 403, "phiên bản cũ");
});
