// Ô nhận lead qua API trên Postgres thật (hàng 24: AC-3..AC-9 — ADR-0012). Ca trùng lấy từ bộ mẫu của hàng 5 (luật 4 của
// đợt): hàng, chủ nhà, đầu chủ nạp qua đường ghi thật của API (tạo hàng, đổi trạng thái, đặt chủ nhà) — không chèn tay.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { STATE_COLUMNS } from "../src/listings/store";
import { createApi } from "../src/app";
import { SAMPLE_PACK } from "../src/catalog/sample";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const json = async (r: Response) => (await r.json()) as Record<string, unknown>;

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string; ten: string };
async function sanMoi(ten: string, vaiCan: Record<string, string[]>) {
  const qtEmail = mail(`ld-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} lead ${ten}]`, qtEmail);
  const nguoi: Record<string, Nguoi> = { quanTri: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}`, ten: qtEmail } };
  for (const [nhan, vai] of Object.entries(vaiCan)) {
    const email = mail(`ld-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    nguoi[nhan] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}`, ten: email };
  }
  return { companyId: s.companyId, nguoi };
}

// ---- Bộ mẫu hàng 5 ----
type HangMau = { ma: string; maCan: string; trangThai: string; gia: number; dieuKienPhi: string; dauChu: string; chuNha: string };
type ChuMau = { ma: string; ten: string; soDienThoai: string };
type LeadMau = { ma: string; soDienThoai: string; toa: string; maCan: string | null };
const PACK = SAMPLE_PACK as unknown as { hang: HangMau[]; chuNha: ChuMau[]; lead: LeadMau[]; danhMuc: { subdivisions: { buildings: { buildingKey: string; buildingName: string }[] }[] } };
const TOA = Object.fromEntries(PACK.danhMuc.subdivisions.flatMap((p) => p.buildings.map((b) => [b.buildingKey, b.buildingName])));
const toaCua = (maCan: string) => TOA[maCan[0]!]!;
const hangMau = (ma: string) => PACK.hang.find((h) => h.ma === ma)!;
const chuMau = (ma: string) => PACK.chuNha.find((c) => c.ma === ma)!;
const leadMau = (ma: string) => PACK.lead.find((l) => l.ma === ma)!;

// Nạp: hàng mở của L-01 (H-04), hai hàng của chủ CN-01 (H-06, H-21), một hàng Đã bán (H-01), một hàng Ngừng hẳn (H-02).
const NAP = ["H-04", "H-06", "H-21", "H-01", "H-02"];

let A: Awaited<ReturnType<typeof sanMoi>>;
let B: Awaited<ReturnType<typeof sanMoi>>;
const idHang: Record<string, string> = {};

async function ghi(id: string, cookie: string, version: number, type: string, payload: object) {
  const res = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: version }, cookie);
  assert.equal(res.status, 200, `${type}: ${await res.clone().text()}`);
  return ((await res.json()) as { version: number }).version;
}

/** Một hàng của bộ mẫu qua đường ghi thật: đầu chủ tạo hàng, đặt chủ nhà (thành đầu chủ giữ căn), đưa tới trạng thái mẫu. */
async function napHang(h: HangMau) {
  const dc = A.nguoi[h.dauChu === "dau-chu-1" ? "dc1" : "dc2"]!;
  const tao = await send("POST", "/api/v1/listings", { buildingName: toaCua(h.maCan), unitNumber: h.maCan }, dc.cookie);
  assert.equal(tao.status, 201);
  const { id } = (await tao.json()) as { id: string };
  const chu = chuMau(h.chuNha);
  assert.equal((await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: chu.ten, ownerPhone: chu.soDienThoai }, dc.cookie)).status, 200);
  let v = 1;
  if (h.trangThai !== "Incomplete") {
    v = await ghi(id, dc.cookie, v, "price_changed", { listPrice: h.gia, feeInclusion: h.dieuKienPhi === "bao_phi" ? "included" : "excluded" });
    v = await ghi(id, dc.cookie, v, "details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
    if (h.trangThai === "Hold" || h.trangThai === "Withdrawn") {
      const to = h.trangThai;
      v = await ghi(id, dc.cookie, v, "status_changed", to === "Withdrawn" ? { to, withdrawnReason: "owner_changed_mind" } : { to });
    } else {
      v = await ghi(id, dc.cookie, v, "status_changed", { to: "Active" });
      if (h.trangThai === "Closed") await ghi(id, dc.cookie, v, "status_changed", { to: "Closed", closePrice: h.gia, closeDate: "2026-10-01" });
      if (h.trangThai === "Pending") await ghi(id, dc.cookie, v, "status_changed", { to: "Pending" });
    }
  }
  idHang[h.ma] = id;
}

before(async () => {
  A = await sanMoi("a", { ts: ["telesales"], ts2: ["telesales"], dc1: ["listing_agent"], dc2: ["listing_agent"], tn: ["team_lead"], dk: ["buyer_agent"] });
  B = await sanMoi("b", { ts: ["telesales"] });
  for (const ma of NAP) await napHang(hangMau(ma));
});

const nam = (so: string, toa: string, can: string | null) => ({
  ownerPhone: so,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
const leadTu = (l: LeadMau) => nam(l.soDienThoai, toaCua(l.maCan ?? `${l.toa}-`), l.maCan);
const gui = async (body: unknown, cookie = A.nguoi.ts!.cookie) => {
  const res = await send("POST", "/api/v1/leads", body, cookie);
  assert.equal(res.status, 201, await res.clone().text());
  return json(res);
};
const dongLead = async (id: string) =>
  (await appPool.query("select outcome, matched_agent_user_id, matched_listing_id, discarded_by, discarded_at from leads where id = $1", [id])).rows[0];
let soMoi = 70;
/** Số mẫu chưa ai dùng trong bộ mẫu (0900 000 070 trở đi). */
const soChuaCo = () => `0900 000 0${soMoi++}`;

test("căn trùng: lead L-01 của bộ mẫu về đầu chủ của hàng đang mở", async () => {
  const l = leadMau("L-01");
  assert.equal(l.maCan, hangMau("H-04").maCan, "bộ mẫu: L-01 trên căn của H-04");
  const kq = await gui(leadTu(l));
  assert.equal(kq.outcome, "unit_has_open_listing");
  assert.equal(kq.agentName, A.nguoi.dc1!.ten);
  const dong = await dongLead(String(kq.id));
  assert.equal(dong.matched_listing_id, idHang["H-04"]);
  assert.equal(dong.matched_agent_user_id, A.nguoi.dc1!.userId);
});

test("căn trùng: hàng Đã bán hay Ngừng hẳn không tính", async () => {
  let dem = 0;
  for (const ma of ["H-01", "H-02"]) {
    const h = hangMau(ma);
    assert.ok(["Closed", "Withdrawn"].includes(h.trangThai), ma);
    const kq = await gui(nam(soChuaCo(), toaCua(h.maCan), h.maCan));
    assert.equal(kq.outcome, "new", `${ma} (${h.trangThai})`);
    dem++;
  }
  assert.equal(dem, 2);
});

test("căn trùng: mã gõ khác dạng vẫn khớp", async () => {
  const ma = hangMau("H-04").maCan; // A-02.06
  for (const kieu of [ma.toLowerCase(), ma.replace(/[-.]/g, " "), ma.replace("-", ".")]) {
    const kq = await gui(nam(soChuaCo(), toaCua(ma), kieu));
    assert.equal(kq.outcome, "unit_has_open_listing", kieu);
  }
});

test("chủ trùng: lead L-02 về đầu chủ giữ chủ nhà CN-01", async () => {
  const l = leadMau("L-02");
  assert.equal(l.soDienThoai, chuMau("CN-01").soDienThoai, "bộ mẫu: L-02 mang số của CN-01");
  const kq = await gui(leadTu(l));
  assert.equal(kq.outcome, "owner_has_agent");
  assert.equal(kq.agentName, A.nguoi.dc2!.ten);
});

test("chủ trùng: số viết +84 vẫn khớp", async () => {
  const so = chuMau("CN-01").soDienThoai.replace(/\s/g, "").replace(/^0/, "+84 ");
  const kq = await gui(nam(so, "Toà B", null));
  assert.equal(kq.outcome, "owner_has_agent", so);
  assert.equal(kq.agentName, A.nguoi.dc2!.ten);
});

test("chủ trùng: lead trước đã về đầu chủ", async () => {
  const so = soChuaCo();
  // Đối chứng: số chưa có ở đâu ra không trùng.
  assert.equal((await gui(nam(soChuaCo(), "Toà B", null))).outcome, "new");
  const dau = await gui(nam(so, toaCua(hangMau("H-04").maCan), hangMau("H-04").maCan));
  assert.equal(dau.outcome, "unit_has_open_listing");
  const sau = await gui(nam(so, "Toà B", "B-09.08"));
  assert.equal(sau.outcome, "owner_has_agent");
  assert.equal(sau.agentName, A.nguoi.dc1!.ten);
});

test("không trùng: lead mẫu không khớp ra new và chờ chia", async () => {
  const soDaNap = new Set(NAP.map((m) => chuMau(hangMau(m).chuNha).soDienThoai));
  const canMo = new Set(NAP.map(hangMau).filter((h) => !["Closed", "Withdrawn"].includes(h.trangThai)).map((h) => h.maCan));
  const ds = PACK.lead.filter((l) => !["L-01", "L-02"].includes(l.ma) && !soDaNap.has(l.soDienThoai) && !(l.maCan && canMo.has(l.maCan)));
  assert.ok(ds.length >= 5, `chỉ ${ds.length} lead mẫu không trùng`);
  for (const l of ds) {
    const kq = await gui(leadTu(l));
    assert.equal(kq.outcome, "new", l.ma);
    assert.equal(kq.agentName, null, l.ma);
    const dong = await dongLead(String(kq.id));
    assert.equal(dong.matched_agent_user_id, null, l.ma);
    assert.equal(dong.matched_listing_id, null, l.ma);
  }
});

test("không trùng: chỉ biết toà", async () => {
  const kq = await gui(nam(soChuaCo(), toaCua(hangMau("H-04").maCan), null));
  assert.equal(kq.outcome, "new");
  assert.equal(kq.unitNumber, null);
});

test("sàn khác: cùng số cùng căn vẫn không trùng", async () => {
  const kq = await gui(leadTu(leadMau("L-01")), B.nguoi.ts!.cookie);
  assert.equal(kq.outcome, "new");
  const kq2 = await gui(leadTu(leadMau("L-02")), B.nguoi.ts!.cookie);
  assert.equal(kq2.outcome, "new");
});

const KHOA_HANG = new Set([...Object.keys(STATE_COLUMNS), "matchedListingId", "listingId", "matchedAgentUserId", "ownerPhone", "ownerName", "floorPrice"]);
function timRo(v: unknown, manh: string[], duong = ""): string[] {
  if (typeof v === "string") return manh.some((m) => v.includes(m)) ? [duong] : [];
  if (!v || typeof v !== "object") return [];
  return Object.entries(v).flatMap(([k, con]) => [...(KHOA_HANG.has(k) && k !== "unitNumber" && k !== "buildingName" && k !== "listPrice" && k !== "feeInclusion" ? [`${duong}.${k}`] : []), ...timRo(con, manh, `${duong}.${k}`)]);
}

test("bản của telesales qua API không mang hàng hay số", async () => {
  const so = soChuaCo();
  const soTron = so.replace(/\s/g, "");
  const bodies = [
    await gui(nam(so, toaCua(hangMau("H-04").maCan), hangMau("H-04").maCan)),
    await gui(nam(soChuaCo(), "Toà B", null)),
    await gui(leadTu(leadMau("L-02"))),
  ];
  assert.deepEqual(bodies.map((b) => b.outcome), ["unit_has_open_listing", "new", "owner_has_agent"]);
  const doc = await send("GET", `/api/v1/leads/${bodies[0]!.id}`, undefined, A.nguoi.ts!.cookie);
  assert.equal(doc.status, 200);
  for (const b of [...bodies, await json(doc)]) {
    const chuoi = JSON.stringify(b);
    for (const id of Object.values(idHang)) assert.ok(!chuoi.includes(id), `lộ mã hàng ${id}`);
    assert.deepEqual(timRo(b, [soTron, so, chuMau("CN-01").soDienThoai.replace(/\s/g, "")]), [], chuoi);
  }
  // Đối chứng dương cùng hàm quét.
  assert.deepEqual(timRo({ a: { matchedListingId: "x", ownerPhone: soTron } }, [soTron]), [".a.matchedListingId", ".a.ownerPhone", ".a.ownerPhone"]);
});

test("vai API không đọc được cột số của lead", async () => {
  const kq = await gui(nam(soChuaCo(), "Toà B", null));
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [A.nguoi.ts!.userId, A.companyId]);
    assert.equal((await c.query("select outcome from leads where id = $1", [kq.id])).rows[0].outcome, "new");
    await assert.rejects(c.query("select owner_phone from leads where id = $1", [kq.id]), /permission denied/);
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
});

test("lead người khác nhập trả 404", async () => {
  const kq = await gui(nam(soChuaCo(), "Toà B", null));
  const khong = await send("GET", "/api/v1/leads/00000000-0000-4000-8000-000000000999", undefined, A.nguoi.ts!.cookie);
  assert.equal(khong.status, 404);
  const mau = await khong.text();
  let dem = 0;
  for (const ai of [A.nguoi.dc2!, A.nguoi.ts2!]) {
    const res = await send("GET", `/api/v1/leads/${kq.id}`, undefined, ai.cookie);
    assert.equal(res.status, 404, ai.ten);
    assert.equal(await res.text(), mau, ai.ten);
    dem++;
  }
  assert.equal(dem, 2);
});

/** Dữ kiện kiểm trùng của một số, đọc như người nhập (vai API, sàn A). */
async function dauChuCuaSo(so: string): Promise<string | null> {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [A.nguoi.ts!.userId, A.companyId]);
    return (await c.query("select owner_agent from app.lead_dedupe_facts($1, 'Toà B', null, '{}')", [so.replace(/\s/g, "")])).rows[0].owner_agent;
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
}

test("bỏ lead: ghi người và lúc, dòng còn", async () => {
  const kq = await gui(nam(soChuaCo(), toaCua(hangMau("H-04").maCan), hangMau("H-04").maCan));
  assert.equal(kq.outcome, "unit_has_open_listing");
  const bo = await send("POST", `/api/v1/leads/${kq.id}/discard`, undefined, A.nguoi.ts!.cookie);
  assert.equal(bo.status, 200);
  assert.equal((await json(bo)).discarded, true);
  const dong = await dongLead(String(kq.id));
  assert.equal(dong.discarded_by, A.nguoi.ts!.userId);
  assert.ok(dong.discarded_at instanceof Date);
  const lan2 = await send("POST", `/api/v1/leads/${kq.id}/discard`, undefined, A.nguoi.ts!.cookie);
  assert.equal(lan2.status, 409);
  assert.equal((await json(lan2)).error, "already-discarded");
});

test("bỏ lead: sai kết quả hay sai người", async () => {
  const thuong = await gui(nam(soChuaCo(), "Toà B", null));
  const r1 = await send("POST", `/api/v1/leads/${thuong.id}/discard`, undefined, A.nguoi.ts!.cookie);
  assert.equal(r1.status, 400);
  assert.equal((await json(r1)).error, "not-duplicate-unit");
  const trung = await gui(nam(soChuaCo(), toaCua(hangMau("H-04").maCan), hangMau("H-04").maCan));
  let dem = 0;
  for (const ai of [A.nguoi.dc1!, A.nguoi.ts2!]) {
    const r = await send("POST", `/api/v1/leads/${trung.id}/discard`, undefined, ai.cookie);
    assert.equal(r.status, 404, ai.ten);
    dem++;
  }
  assert.equal(dem, 2);
  assert.equal((await dongLead(String(trung.id))).discarded_at, null);
});

test("bỏ lead: không còn là đầu chủ của chủ nhà", async () => {
  const so = soChuaCo();
  const trung = await gui(nam(so, toaCua(hangMau("H-04").maCan), hangMau("H-04").maCan));
  // Đối chứng: trước khi bỏ, số này đã có đầu chủ (qua lead trước).
  assert.equal(await dauChuCuaSo(so), A.nguoi.dc1!.userId);
  assert.equal((await send("POST", `/api/v1/leads/${trung.id}/discard`, undefined, A.nguoi.ts!.cookie)).status, 200);
  assert.equal(await dauChuCuaSo(so), null);
  assert.equal((await gui(nam(so, "Toà B", "B-09.07"))).outcome, "new");
});

test("vai: ba vai nhập được, hai vai bị chặn", async () => {
  const demLead = async () => (await appPool.query<{ n: number }>("select count(*)::int n from leads where company_id = $1", [A.companyId])).rows[0]!.n;
  const MA_TRAN: [string, number][] = [
    ["ts", 201],
    ["dc1", 201],
    ["tn", 201],
    ["dk", 403],
    ["quanTri", 403],
  ];
  let dem = 0;
  for (const [ai, ma] of MA_TRAN) {
    const truoc = await demLead();
    const res = await send("POST", "/api/v1/leads", nam(soChuaCo(), "Toà B", null), A.nguoi[ai]!.cookie);
    assert.equal(res.status, ma, ai);
    if (ma === 403) {
      assert.equal((await json(res)).error, "lead-role-required", ai);
      assert.equal(await demLead(), truoc, `${ai}: có dòng được ghi`);
    }
    dem++;
  }
  assert.equal(dem, 5);
  assert.equal((await send("POST", "/api/v1/leads", nam(soChuaCo(), "Toà B", null))).status, 401);
});

test("khuôn sai trả 400 kèm đúng mục", async () => {
  const thieuSo: Record<string, unknown> = nam("0900 000 099", "Toà B", null);
  delete thieuSo.ownerPhone;
  const res = await send("POST", "/api/v1/leads", thieuSo, A.nguoi.ts!.cookie);
  assert.equal(res.status, 400);
  assert.deepEqual(((await json(res)).details as { path: string }[]).map((d) => d.path), ["ownerPhone"]);
});
