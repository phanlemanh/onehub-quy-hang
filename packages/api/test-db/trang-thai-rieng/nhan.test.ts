// Trạng thái riêng trên Postgres thật (hàng 46: E1, E2b, E3, E3d, E4, E5, E6c, E7b, E7c, E8, E9-2 và ca Review Focus «gỡ
// nhãn: căn đã đổi giữa chừng»). Sàn, người, lead, căn, Lần gửi dựng qua đường ghi thật; kết nối chủ chỉ để đếm và đọc dòng
// cấu hình, nhật ký, sự kiện và bản tính của hàng. Số mẫu `0900 000 0xx`, tên «[Tên]», mã nhãn «giu_cho» (từ «Giữ chỗ»).
import { nhanTuBang } from "@quy-hang/core/statuses";
import { thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { after, test } from "node:test";
import type pg from "pg";
import { FACTS_SQL, thayNhanCan } from "../../src/listings/store";
import { docVaoDungTin } from "../../src/today-buyer/store";
import { appPool, cleanup } from "../helpers";
import { docHam, hangCoChu, hangTuLead, lenBang, maMoi, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const VAI = { tn: { vai: ["team_lead"] }, dc: { vai: ["listing_agent"], khu: ["Toà A"] }, dk: { vai: ["buyer_agent"] }, ts: { vai: ["telesales"] } };
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const URL_TT = "/api/v1/company/statuses";
const GIU_CHO = { label: "Giữ chỗ", anchor: "Pending" };
const DANG_DAY = { label: "Đang đẩy", anchor: "Active" };
const iso = (d: Date) => d.toISOString();

type DongTT = { status: string; default: string; labels: { code: string; label: string; inUse: number }[] };
type BangTT = { statuses: DongTT[] };
async function docTT(s: San, k = "qt"): Promise<BangTT> {
  const r = await send("GET", URL_TT, undefined, ck(s, k));
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as BangTT;
}
const ghiTT = (s: San, than: unknown, k = "qt") => send("PUT", URL_TT, than, k ? ck(s, k) : "");
async function ghiTTDuoc(s: San, than: unknown) {
  const r = await ghiTT(s, than);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as BangTT;
}
const dong = (b: BangTT, st: string) => b.statuses.find((d) => d.status === st)!;

const dongNhan = async (s: San) =>
  (
    await appPool.query<{ key: string; value: unknown; data_class: string }>(
      "select key, value, data_class from company_settings where company_id = $1 and key like 'labels.status.%' order by key",
      [s.companyId],
    )
  ).rows;
const demNhatKy = async (s: San, key: string) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from company_settings_events where company_id = $1 and key = $2", [s.companyId, key])).rows[0]!.n;
const nhatKyCuoi = async (s: San, key: string) =>
  (await appPool.query<{ value: unknown; actor_user_id: string }>("select value, actor_user_id from company_settings_events where company_id = $1 and key = $2 order by id desc limit 1", [s.companyId, key])).rows[0];
const demSuKien = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;
const suKienCuoi = async (id: string) =>
  (await appPool.query<{ type: string; payload: unknown; actor_user_id: string; occurred_at: Date }>("select type, payload, actor_user_id, occurred_at from listing_events where listing_id = $1 order by seq desc limit 1", [id])).rows[0]!;
const banTinh = async (id: string) =>
  (await appPool.query<{ standard_status: string; status_label: string | null }>("select standard_status, status_label from listings where id = $1", [id])).rows[0]!;

/** Một lệnh hàng qua đường ghi thật, phiên bản đọc lúc gửi. */
async function lenh(s: San, k: string, id: string, body: object) {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  return send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck(s, k));
}
async function lenhDuoc(s: San, k: string, id: string, body: object) {
  const r = await lenh(s, k, id, body);
  assert.equal(r.status, 200, await r.clone().text());
}
/** Căn Đang bán của đầu chủ; trả mã và mốc lên Đang bán. */
async function canDangBan(s: San, k = "dc") {
  const id = await hangCoChu(s, k, maMoi(s), soMoi(s));
  return { id, t1: await lenBang(s, k, id) };
}

test("trạng thái riêng: thêm nhãn", async () => {
  const s = await sanMoi(VAI);
  const KHOA = "labels.status.giu_cho";
  const truoc = await demNhatKy(s, KHOA);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const b = await docTT(s);
  assert.deepEqual(dong(b, "Pending").labels, [{ code: "giu_cho", label: "Giữ chỗ", inUse: 0 }]);
  assert.deepEqual(b.statuses.filter((d) => d.status !== "Pending").map((d) => d.labels), [[], [], [], [], []]);
  assert.deepEqual(await dongNhan(s), [{ key: KHOA, value: { label: "Giữ chỗ", anchor: "Pending" }, data_class: "company_internal" }]);
  assert.equal(await demNhatKy(s, KHOA), truoc + 1);
  assert.equal((await nhatKyCuoi(s, KHOA))!.actor_user_id, s.nguoi.qt!.userId);
  // Chiều đỏ: lưu lại y hệt (thân kèm mã) — khoá không đổi không ghi lại.
  await ghiTTDuoc(s, { labels: [{ code: "giu_cho", ...GIU_CHO }] });
  assert.equal(await demNhatKy(s, KHOA), truoc + 1, "lưu lại cùng bộ nhãn mà vẫn sinh sự kiện nhật ký");
});

test("trạng thái riêng: bộ nhãn sai không ghi gì", async () => {
  const s = await sanMoi(VAI);
  const sai1 = await ghiTT(s, { labels: [GIU_CHO, { label: "Đã cọc", anchor: "Reserved" }] });
  assert.equal(sai1.status, 400);
  assert.match(((await sai1.json()) as { reason: string }).reason, /labels\.status/);
  assert.deepEqual(await dongNhan(s), [], "dòng giu_cho đã lọt (ghi nửa chừng)");
  const sai2 = await ghiTT(s, { labels: [{ label: "Đang bán", anchor: "Hold" }] });
  assert.equal(sai2.status, 400);
  assert.match(((await sai2.json()) as { reason: string }).reason, /labels\.status/);
  assert.deepEqual(await dongNhan(s), []);
});

test("trạng thái riêng: căn mang nhãn", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const { id } = await canDangBan(s);
  const n0 = await demSuKien(id);
  await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  assert.equal(await demSuKien(id), n0 + 1);
  assert.deepEqual((await suKienCuoi(id)).payload, { to: "Pending", label: "giu_cho" });
  assert.deepEqual(await banTinh(id), { standard_status: "Pending", status_label: "giu_cho" }, "cột status_label không theo bản gập");
  assert.equal(dong(await docTT(s), "Pending").labels[0]!.inUse, 1);
  await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: null } });
  assert.deepEqual(await banTinh(id), { standard_status: "Pending", status_label: null });
  await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Active" } });
  assert.deepEqual(await banTinh(id), { standard_status: "Active", status_label: null });
});

test("trạng thái riêng: nhãn đi qua đồng bộ", async () => {
  // Máy kéo bản hàng bằng GET /api/v1/listings (apps/web/src/lib/sync) — packages/api/src/sync chỉ có đường gửi lượt mất mạng.
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const [x, y] = [await canDangBan(s), await canDangBan(s)];
  await lenhDuoc(s, "dc", x.id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  const r = await send("GET", "/api/v1/listings", undefined, ck(s, "tn"));
  assert.equal(r.status, 200, await r.clone().text());
  const ds = (await r.json()) as { id: string; standardStatus: string; statusLabel?: string | null }[];
  const hx = ds.find((h) => h.id === x.id)!;
  const hy = ds.find((h) => h.id === y.id)!;
  assert.deepEqual([hx.standardStatus, hx.statusLabel], ["Pending", "giu_cho"], "bản kéo thiếu statusLabel");
  assert.deepEqual([hy.standardStatus, hy.statusLabel], ["Active", null], "căn không nhãn phải mang statusLabel null");
});

test("trạng thái riêng: luật của neo và mã lạ", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const { id } = await canDangBan(s);
  await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  // Bảng viết trước: [dòng, payload, mã HTTP, mẫu lý do, sự kiện thêm].
  const BANG: [string, object, number, RegExp | null, number][] = [
    ["Pending/giu_cho → Hold", { to: "Hold" }, 400, null, 0],
    ["Pending/giu_cho → Active", { to: "Active" }, 200, null, 1],
    ["Active → Pending/khong_co", { to: "Pending", label: "khong_co" }, 400, /khong_co/, 0],
    ["Active → Closed/giu_cho", { to: "Closed", label: "giu_cho", closePrice: 3_100_000_000, closeDate: "2026-11-01" }, 400, /neo vào Pending/, 0],
  ];
  for (const [ten, payload, ma, mau, them] of BANG) {
    const n = await demSuKien(id);
    const r = await lenh(s, "dc", id, { type: "status_changed", payload });
    const than = (await r.json()) as { error?: string; reason?: string };
    assert.equal(r.status, ma, `${ten}: ${JSON.stringify(than)}`);
    if (ten.endsWith("Hold")) assert.equal(than.error, "invalid-transition", ten);
    if (mau) assert.match(than.reason ?? "", mau, ten);
    assert.equal(await demSuKien(id), n + them, `${ten}: số sự kiện`);
  }
});

test("trạng thái riêng: trang khách theo neo", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const [a, b] = [await canDangBan(s), await canDangBan(s)];
  const k = thanKhachMoi({ ten: "[Tên]", so: soMoi(s), need: "purchase" });
  assert.ok(k.ok);
  const p = await send("POST", "/api/v1/prospects", k.than, ck(s, "dk"));
  assert.equal(p.status, 201, await p.clone().text());
  const t = thanLanGui({ nguoiNhan: "khach_rieng", prospectId: ((await p.json()) as { id: string }).id, listingIds: [a.id, b.id] });
  assert.ok(t.ok);
  const g = await send("POST", "/api/v1/shares", t.than, ck(s, "dk"));
  assert.equal(g.status, 201, await g.clone().text());
  const { code } = (await g.json()) as { code: string };
  await lenhDuoc(s, "dc", a.id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  await lenhDuoc(s, "dc", b.id, { type: "status_changed", payload: { to: "Pending" } });
  const r = await send("GET", `/api/v1/public/shares/${code}`);
  assert.equal(r.status, 200, await r.clone().text());
  const chu = await r.text();
  const than = JSON.parse(chu) as { can: Record<string, unknown>[] };
  assert.deepEqual(than.can.map((c) => c.availability), ["under_contract", "under_contract"]);
  // Hai căn chỉ khác ở trường của chính căn (mã, toà, căn, tên…): cùng bộ khoá, cùng giá trị ở mọi khoá trạng thái.
  assert.deepEqual(Object.keys(than.can[0]!).sort(), Object.keys(than.can[1]!).sort());
  assert.ok(!chu.includes("giu_cho"), "thân trang khách mang mã nhãn giu_cho");
  assert.ok(!chu.includes("Giữ chỗ"), "thân trang khách mang chữ nhãn Giữ chỗ");
});

// ---- E6c: mọi chỗ đọc `payload ->> 'to'` ----
const GOC = resolve(import.meta.dirname, "../../../..");
const DOC_TO = /->>\s*'to'/;
function tepDoc(thu: string, loc: (p: string) => boolean): string[] {
  const ra: string[] = [];
  const di = (d: string) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) di(p);
      else if (loc(p) && DOC_TO.test(readFileSync(p, "utf8"))) ra.push(relative(GOC, p));
    }
  };
  di(join(GOC, thu));
  return ra.sort();
}
const MIGRATIONS = "packages/db/migrations/*.sql";
/** Bảng viết trước: mỗi tệp đọc `payload ->> 'to'` một dòng; migration gộp một dòng (hàm SQL của 015/016/021/037). */
const BANG_DOC_TO = [
  "packages/api/src/contacts/read/store.ts",
  "packages/api/src/listings/lan-doi.ts",
  "packages/api/src/listings/store.ts",
  "packages/api/src/today-buyer/store.ts",
  "packages/api/src/today/store.ts",
  MIGRATIONS,
];

/** Chạy một hàm đọc của API bằng kết nối chủ dưới ngữ cảnh sàn và người đã cho; không ghi gì. */
async function trongSan<T>(s: San, userId: string, fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', $2, true)", [s.companyId, userId]);
    return await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
}

test("trạng thái riêng: mọi chỗ đọc payload to không đổi vì đổi nhãn", async () => {
  // Ca đếm: chỗ đọc mới mà bảng thiếu thì đỏ nêu tệp.
  const api = tepDoc("packages/api/src", (p) => p.endsWith(".ts") && !p.endsWith(".test.ts"));
  const mig = tepDoc("packages/db/migrations", (p) => p.endsWith(".sql"));
  assert.ok(mig.length > 0);
  assert.deepEqual([...api, ...(mig.length ? [MIGRATIONS] : [])], BANG_DOC_TO, "chỗ đọc payload ->> 'to' khác bảng viết trước");

  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [DANG_DAY] });
  // Hai căn từ lead (để các chỗ đọc mốc lên bảng có lead): X đổi nhãn tại chỗ trong Đang bán ở t2, Y không.
  const tuLead = async () => {
    const lead = await nhap(s, nam(soMoi(s), "Toà A", maMoi(s)));
    await nhip(new Date(), s);
    const id = await hangTuLead(s, "dc", lead.id);
    return { lead: lead.id, id, t1: await lenBang(s, "dc", id) };
  };
  const [X, Y] = [await tuLead(), await tuLead()];
  await lenhDuoc(s, "dc", X.id, { type: "status_changed", payload: { to: "Active", label: "dang_day" } });
  const t2 = (await suKienCuoi(X.id)).occurred_at;
  assert.ok(t2 > X.t1);

  const hang = async (id: string) => {
    const r = await send("GET", `/api/v1/listings/${id}`, undefined, ck(s, "dc"));
    assert.equal(r.status, 200, await r.clone().text());
    return (await r.json()) as { lucVaoTrangThai: string | null; lastStatusChange: { at: string; to: string; toLabel: string | null } };
  };
  const keo = async () => {
    const r = await send("GET", "/api/v1/listings", undefined, ck(s, "dc"));
    return (await r.json()) as { id: string; lucVaoTrangThai: string | null }[];
  };
  const lucVao = async () => {
    const ds = await keo();
    return { x: (await hang(X.id)).lucVaoTrangThai, y: (await hang(Y.id)).lucVaoTrangThai, xKeo: ds.find((h) => h.id === X.id)!.lucVaoTrangThai };
  };
  const contact = async (lead: string) => (await appPool.query<{ contact_id: string }>("select contact_id from leads where id = $1", [lead])).rows[0]!.contact_id;
  const phaCua = async (lead: string) => {
    const r = await send("GET", `/api/v1/contacts/${await contact(lead)}/profile`, undefined, ck(s, "dc"));
    assert.equal(r.status, 200, await r.clone().text());
    return ((await r.json()) as { opportunities: { leadId?: string; phase: unknown }[] }).opportunities.find((o) => o.leadId === lead)!.phase;
  };
  const nacCua = async (lead: string) => {
    const r = await send("GET", `/api/v1/leads/assigned/${lead}`, undefined, ck(s, "dc"));
    assert.equal(r.status, 200, await r.clone().text());
    return ((await r.json()) as { stage: string }).stage;
  };
  const leadTs = async () => (await (await send("GET", "/api/v1/leads", undefined, ck(s, "ts"))).json()) as { id: string; boardAt: string | null }[];

  let dem = 0;
  for (const tep of BANG_DOC_TO) {
    if (tep === "packages/api/src/listings/store.ts") {
      const toi = async (id: string) => (await docHam<{ r: string[] }>(s, `select ${FACTS_SQL.statusesReached} r from listings l where l.id = $1`, [id]))[0]!.r;
      assert.deepEqual(await toi(X.id), await toi(Y.id), `${tep}: «đã từng tới»`);
      assert.deepEqual(await toi(X.id), ["Active"], tep);
    } else if (tep === "packages/api/src/listings/lan-doi.ts") {
      const [hx, hy] = [await hang(X.id), await hang(Y.id)];
      assert.equal(hx.lucVaoTrangThai, iso(X.t1), `${tep}: lúc vào trạng thái của X là t2 (${iso(t2)}), phải là t1`);
      assert.equal(hy.lucVaoTrangThai, iso(Y.t1), tep);
      assert.deepEqual([hx.lastStatusChange.to, hx.lastStatusChange.toLabel, hx.lastStatusChange.at], ["Active", "dang_day", iso(t2)], `${tep}: lần đổi gần nhất`);
      assert.equal(hy.lastStatusChange.at, iso(Y.t1), tep);
      // Đường kéo của máy (GET /listings) mang cùng mốc — Hôm nay trên máy đọc `lucVaoTrangThai`.
      assert.equal((await lucVao()).xKeo, iso(X.t1), `${tep}: bản kéo của máy mang lucVaoTrangThai t2`);
    } else if (tep === "packages/api/src/today/store.ts") {
      assert.equal(await nacCua(X.lead), await nacCua(Y.lead), tep);
    } else if (tep === "packages/api/src/contacts/read/store.ts") {
      assert.deepEqual(await phaCua(X.lead), await phaCua(Y.lead), tep);
    } else if (tep === "packages/api/src/today-buyer/store.ts") {
      // Đầu khách cần một Lần gửi để Hôm nay đọc căn mới lên; Lần gửi cũng đi qua create_share của 037.
      const t = thanLanGui({ nguoiNhan: "nhom_moi_gioi", prospectId: null, listingIds: [X.id, Y.id] });
      assert.ok(t.ok);
      const g = await send("POST", "/api/v1/shares", t.than, ck(s, "dk"));
      assert.equal(g.status, 201, await g.clone().text());
      const vao = await trongSan(s, s.nguoi.dk!.userId, (c) => docVaoDungTin(c, s.nguoi.dk!.userId, new Date()));
      const len = (id: string) => vao.activeSau.find((c) => c.id === id)?.activeAt;
      assert.equal(len(X.id), iso(X.t1), `${tep}: lần lên Đang bán của X là t2 (${iso(t2)})`);
      assert.equal(len(Y.id), iso(Y.t1), tep);
    } else if (tep === MIGRATIONS) {
      // Hàm lead_board_at_all (015/016) qua «Lead của tôi»; create_share (021/037) đã nhận X ở dòng trên.
      const ds = await leadTs();
      assert.equal(ds.find((l) => l.id === X.lead)!.boardAt, iso(X.t1), `${tep}: mốc lên bảng của X`);
      assert.equal(ds.find((l) => l.id === Y.lead)!.boardAt, iso(Y.t1), tep);
    } else assert.fail(`dòng bảng không có assert: ${tep}`);
    dem++;
  }
  assert.equal(dem, BANG_DOC_TO.length);

  // Ca thứ hai: gỡ nhãn kèm nhãn thay (AC-8) ghi sự kiện đổi nhãn — lúc vào trạng thái giữ nguyên.
  await ghiTTDuoc(s, { labels: [], replace: { dang_day: null } });
  assert.deepEqual(await banTinh(X.id), { standard_status: "Active", status_label: null });
  const sau = await lucVao();
  assert.deepEqual([sau.x, sau.y, sau.xKeo], [iso(X.t1), iso(Y.t1), iso(X.t1)], "gỡ nhãn đặt lại lúc vào trạng thái");
});

test("trạng thái riêng: Hôm nay mang nhãn của lần đổi", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const { id } = await canDangBan(s);
  await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  const r = await send("GET", "/api/v1/listings", undefined, ck(s, "tn"));
  assert.equal(r.status, 200, await r.clone().text());
  const h = ((await r.json()) as { id: string; lastStatusChange: { from: unknown; to: unknown; toLabel?: string | null; fromLabel?: string | null } }[]).find((x) => x.id === id)!;
  assert.deepEqual([h.lastStatusChange.from, h.lastStatusChange.to, h.lastStatusChange.toLabel, h.lastStatusChange.fromLabel], ["Active", "Pending", "giu_cho", null]);
});

test("trạng thái riêng: từ vựng của sàn mang bộ nhãn", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const r = await send("GET", "/api/v1/company/labels", undefined, ck(s, "dc"));
  assert.equal(r.status, 200, await r.clone().text());
  const tuVung = (await r.json()) as { statuses?: unknown };
  assert.deepEqual(tuVung.statuses, (await docTT(s, "dc")).statuses, "GET /company/labels không gắn statuses");
  assert.deepEqual(nhanTuBang(tuVung as { statuses: unknown[] }), [{ ma: "giu_cho", label: "Giữ chỗ", anchor: "Pending" }]);
});

test("trạng thái riêng: đổi tên và gỡ nhãn đang dùng", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO, DANG_DAY, { label: "Đã cọc", anchor: "Pending" }] });
  const [a, b] = [(await canDangBan(s)).id, (await canDangBan(s)).id];
  for (const id of [a, b]) await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  const dem = async () => [await demSuKien(a), await demSuKien(b)];
  const n0 = await dem();
  const giu = { code: "giu_cho", label: "Giữ chỗ 7 ngày", anchor: "Pending" };
  const day = { code: "dang_day", ...DANG_DAY };
  const coc = { code: "da_coc", label: "Đã cọc", anchor: "Pending" };

  // Đổi tên giữ mã: căn không đổi gì.
  const b1 = await ghiTTDuoc(s, { labels: [giu, day, coc] });
  assert.deepEqual(dong(b1, "Pending").labels.find((l) => l.code === "giu_cho"), { code: "giu_cho", label: "Giữ chỗ 7 ngày", inUse: 2 });
  assert.deepEqual(await dem(), n0, "đổi tên ghi sự kiện lên căn");
  assert.deepEqual([(await banTinh(a)).status_label, (await banTinh(b)).status_label], ["giu_cho", "giu_cho"]);

  // Gỡ không nhãn thay → 409 kèm số căn; dòng nhãn không đổi.
  const dongGiu = async () => (await dongNhan(s)).find((d) => d.key === "labels.status.giu_cho")!.value;
  const go = await ghiTT(s, { labels: [day, coc] });
  assert.equal(go.status, 409);
  const thanGo = (await go.json()) as { error: string; code: string; count: number; reason: string };
  assert.deepEqual([thanGo.error, thanGo.code, thanGo.count], ["status-label-in-use", "giu_cho", 2]);
  assert.match(thanGo.reason, /2 căn/);
  assert.deepEqual(await dongGiu(), { label: "Giữ chỗ 7 ngày", anchor: "Pending" });

  // Nhãn thay neo trạng thái khác → 400, không ghi gì.
  const lech = await ghiTT(s, { labels: [day, coc], replace: { giu_cho: "dang_day" } });
  assert.equal(lech.status, 400, await lech.clone().text());
  assert.deepEqual(await dongGiu(), { label: "Giữ chỗ 7 ngày", anchor: "Pending" });
  assert.deepEqual(await dem(), n0);

  // Gỡ kèm nhãn thay null: mỗi căn đúng một sự kiện đổi nhãn bằng tên quản trị.
  await ghiTTDuoc(s, { labels: [day, coc], replace: { giu_cho: null } });
  assert.deepEqual(await dem(), n0.map((n) => n + 1), "gỡ nhãn phải ghi đúng một sự kiện mỗi căn");
  for (const id of [a, b]) {
    const e = await suKienCuoi(id);
    assert.deepEqual([e.type, e.payload, e.actor_user_id], ["status_changed", { to: "Pending", label: null }, s.nguoi.qt!.userId]);
    assert.deepEqual(await banTinh(id), { standard_status: "Pending", status_label: null });
  }
  assert.equal(await dongGiu(), null);

  // Gỡ nhãn không căn nào mang: không cần nhãn thay.
  const b2 = await ghiTTDuoc(s, { labels: [day] });
  assert.deepEqual(dong(b2, "Pending").labels, []);
});

test("trạng thái riêng: gỡ nhãn: căn đã đổi giữa chừng", async () => {
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  const [a, b] = [(await canDangBan(s)).id, (await canDangBan(s)).id];
  for (const id of [a, b]) await lenhDuoc(s, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  // Màn hỏi lúc 2 căn mang nhãn; trước khi lưu, đầu chủ đưa căn a về Đang bán.
  assert.equal(dong(await docTT(s), "Pending").labels[0]!.inUse, 2);
  await lenhDuoc(s, "dc", a, { type: "status_changed", payload: { to: "Active" } });
  const [na, nb] = [await demSuKien(a), await demSuKien(b)];
  await ghiTTDuoc(s, { labels: [], replace: { giu_cho: null } });
  assert.equal(await demSuKien(a), na, "căn đã rời nhãn vẫn nhận sự kiện gỡ nhãn");
  assert.equal(await demSuKien(b), nb + 1);
  assert.deepEqual(await banTinh(a), { standard_status: "Active", status_label: null });
  assert.deepEqual(await banTinh(b), { standard_status: "Pending", status_label: null });
  // Ghi cho từng căn đọc lại căn sau khoá theo hàng: căn không còn mang mã thì bỏ qua, không sự kiện.
  const kq = await trongSan(s, s.nguoi.qt!.userId, (c) => thayNhanCan(c, a, "giu_cho", null));
  assert.equal(kq, null);
});

test("trạng thái riêng: đổi nhãn tại chỗ và gỡ nhãn ở Đã bán giữ giá chốt", async () => {
  // Lượt chấm 1 (t1/t3, AC-8): đổi nhãn tại chỗ ở nấc cuối từng xoá giá chốt và vấp check của cơ sở dữ liệu (500).
  const s = await sanMoi(VAI);
  await ghiTTDuoc(s, { labels: [{ label: "Bán qua sàn", anchor: "Closed" }, { label: "Mất liên lạc hẳn", anchor: "Withdrawn" }] });
  const [a, b] = [(await canDangBan(s)).id, (await canDangBan(s)).id];
  await lenhDuoc(s, "dc", a, { type: "status_changed", payload: { to: "Closed", closePrice: 2_900_000_000, closeDate: "2026-10-30" } });
  await lenhDuoc(s, "dc", b, { type: "status_changed", payload: { to: "Withdrawn", withdrawnReason: "unreachable" } });
  const giu = async (id: string) =>
    (await appPool.query<{ close_price: string | null; close_date: Date | null; withdrawn_reason: string | null }>("select close_price, close_date, withdrawn_reason from listings where id = $1", [id])).rows[0]!;
  const [ga, gb] = [await giu(a), await giu(b)];
  // Đổi nhãn tại chỗ ở Đã bán và Ngừng hẳn: 200, giá chốt, ngày bán, lý do giữ nguyên.
  await lenhDuoc(s, "dc", a, { type: "status_changed", payload: { to: "Closed", label: "ban_qua_san" } });
  await lenhDuoc(s, "dc", b, { type: "status_changed", payload: { to: "Withdrawn", label: "mat_lien_lac_han" } });
  assert.deepEqual(await giu(a), ga);
  assert.deepEqual(await giu(b), gb);
  assert.deepEqual(await banTinh(a), { standard_status: "Closed", status_label: "ban_qua_san" });
  // Gỡ cả hai nhãn kèm nhãn thay: 200, mỗi căn một sự kiện, dữ liệu nấc cuối giữ nguyên.
  const [na, nb] = [await demSuKien(a), await demSuKien(b)];
  await ghiTTDuoc(s, { labels: [], replace: { ban_qua_san: null, mat_lien_lac_han: null } });
  assert.deepEqual([await demSuKien(a), await demSuKien(b)], [na + 1, nb + 1]);
  assert.deepEqual(await giu(a), ga);
  assert.deepEqual(await giu(b), gb);
  assert.deepEqual(await banTinh(b), { standard_status: "Withdrawn", status_label: null });
});

test("trạng thái riêng: sàn khác và vai khác", async () => {
  const [s, B] = [await sanMoi(VAI), await sanMoi(VAI)];
  await ghiTTDuoc(s, { labels: [GIU_CHO] });
  assert.deepEqual((await docTT(B)).statuses.map((d) => d.labels), [[], [], [], [], [], []]);
  const { id } = await canDangBan(B);
  const n = await demSuKien(id);
  const r = await lenh(B, "dc", id, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });
  assert.equal(r.status, 400, await r.clone().text());
  assert.equal(await demSuKien(id), n);
  // Đối chứng dương: căn của A nhận được nhãn ấy.
  const { id: cuaA } = await canDangBan(s);
  await lenhDuoc(s, "dc", cuaA, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });

  const than = { labels: [{ code: "giu_cho", ...GIU_CHO }, { label: "Đã cọc", anchor: "Pending" }] };
  // Bảng vai viết trước: [ai, mã HTTP, số dòng labels.status.* của A sau lượt].
  const BANG: [string, number, number][] = [
    ["dc", 403, 1],
    ["tn", 403, 1],
    ["", 401, 1],
    ["qt", 200, 2],
  ];
  for (const [ai, ma, soDong] of BANG) {
    const res = await ghiTT(s, than, ai);
    assert.equal(res.status, ma, `${ai || "không cookie"}: ${await res.clone().text()}`);
    assert.equal((await dongNhan(s)).length, soDong, `${ai || "không cookie"}: số dòng nhãn`);
  }
  assert.equal(dong(await docTT(s, "dc"), "Pending").labels.length, 2);
});
