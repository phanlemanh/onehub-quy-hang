// Trang nhóm môi giới (hàng 44, trang-nhom-moi-gioi) qua API thật trên Postgres: E1, E2b, E3, E4b, E8. Căn lên Đang bán qua
// lệnh hàng; Lần gửi tạo qua POST /api/v1/shares; cấu hình sàn qua PATCH /api/v1/company/settings của Quản trị. Dữ liệu mẫu:
// `[Tên]`.
import { cotRa } from "@quy-hang/core/export";
import { CAU_HINH_MAC_DINH } from "@quy-hang/core/redaction";
import { COT_TRANG_MOI_GIOI, thanKhachMoi } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN, themAnhThat } from "../helpers";

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
  const emailQt = mail(`mg-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} mg ${ten}]`, emailQt);
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`mg-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    quanTri: { userId: "", cookie: `${await login(emailQt)}; qh_san=${s.companyId}` },
    dauChu: await them(["listing_agent"], "dc"),
    dauKhach: await them(["buyer_agent"], "dk"),
    truongNhom: await them(["team_lead"], "tn"),
    telesales: await them(["telesales"], "ts"),
  };
}
type San = Awaited<ReturnType<typeof sanMoi>>;

const CAN = Array.from({ length: 90 }, (_, i) => `M-${String(Math.floor(i / 6) + 1).padStart(2, "0")}.${String((i % 6) + 1).padStart(2, "0")}`);
let soCan = 0;

/** Căn lên Đang bán qua lệnh hàng (giá 3 tỷ, bao phí); trả mã hàng và hàm ghi lệnh tiếp. */
async function canDangBan(cookie: string) {
  const ma = CAN[soCan++ % CAN.length]!;
  const tao = await send("POST", "/api/v1/listings", { buildingName: "Toà M", unitNumber: ma }, cookie);
  assert.equal(tao.status, 201);
  let h = (await tao.json()) as { id: string; version: number };
  const id = h.id;
  const buoc = async (type: string, payload: Record<string, unknown>) => {
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(r.status, 200, await r.clone().text());
    h = (await r.json()) as { id: string; version: number };
  };
  const chu = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên] Chủ" }, cookie);
  assert.equal(chu.status, 200, await chu.clone().text());
  await themAnhThat(id);
  await buoc("price_changed", { listPrice: 3_000_000_000, feeInclusion: "included" });
  await buoc("details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
  await buoc("status_changed", { to: "Active" });
  return { id, ma, buoc };
}

const datSan = async (s: San, body: Record<string, unknown>) => send("PATCH", "/api/v1/company/settings", body, s.quanTri.cookie);
async function gui(s: San, ids: string[], muc?: number | null) {
  const body: Record<string, unknown> = { audience: "agents", prospectId: null, listingIds: ids };
  if (muc !== undefined) body.commissionSplitPct = muc;
  const r = await send("POST", "/api/v1/shares", body, s.dauKhach.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { code: string }).code;
}
async function mo(code: string) {
  const r = await send("GET", `/api/v1/public/shares/${code}`, undefined);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Record<string, unknown> & { nguoiNhan: string; can: Record<string, unknown>[]; cot?: { khoa: string }[]; dong?: string[][] };
}

test("môi giới: mở link thấy bảng", async () => {
  const s = await sanMoi("bang");
  const ba = [await canDangBan(s.dauChu.cookie), await canDangBan(s.dauChu.cookie), await canDangBan(s.dauChu.cookie)];
  const code = await gui(s, ba.map((c) => c.id));
  // Bảng viết trước ba trạng thái căn trong cùng bộ: [vị trí, lệnh đổi trạng thái].
  const BANG: [number, Record<string, unknown>[]][] = [
    [0, []],
    [1, [{ to: "Pending" }]],
    [2, [{ to: "Pending" }, { to: "Closed", closePrice: 3_000_000_000, closeDate: "2026-11-01" }]],
  ];
  for (const [i, lenh] of BANG) for (const p of lenh) await ba[i]!.buoc("status_changed", p);
  const than = await mo(code);
  assert.equal(than.nguoiNhan, "nhom_moi_gioi");
  const { ra } = cotRa(COT_TRANG_MOI_GIOI, "nhom_moi_gioi", CAU_HINH_MAC_DINH);
  assert.deepEqual(than.cot?.map((c) => c.khoa), ra.map((c) => c.khoa), "trang môi giới thiếu cột");
  assert.deepEqual(than.can.map((c) => c.unitNumber), ba.map((c) => c.ma), "thứ tự gửi");
  for (const c of than.can) assert.ok(typeof c.unitNumber === "string" && c.unitNumber.length > 0, "mã căn rỗng");
  // Giá theo luật giá ra: đã bán không có giá; còn bán có.
  let dem = 0;
  for (const [i] of BANG) {
    const coGia = Object.hasOwn(than.can[i]!, "listPrice");
    assert.equal(coGia, i !== 2, `căn ${i}: giá ra sai luật`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  // Đối chứng: khách riêng cùng căn không có khoá cột.
  const t = thanKhachMoi({ ten: "[Tên] Khách", so: "0900 000 011", need: "purchase" });
  assert.ok(t.ok);
  const khach = await send("POST", "/api/v1/prospects", t.than, s.dauKhach.cookie);
  assert.equal(khach.status, 201, await khach.clone().text());
  const p = (await khach.json()) as { id: string };
  const r = await send("POST", "/api/v1/shares", { audience: "client", prospectId: p.id, listingIds: [ba[1]!.id] }, s.dauKhach.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  assert.equal(Object.hasOwn(await mo(((await r.json()) as { code: string }).code), "cot"), false, "khách riêng có cột của môi giới");
});

test("môi giới: định nghĩa phí chụp lúc gửi", async () => {
  const s = await sanMoi("phi");
  const c = await canDangBan(s.dauChu.cookie);
  assert.equal((await datSan(s, { "fee.inclusion": ["brokerageFee"] })).status, 200);
  const a = await gui(s, [c.id]);
  assert.deepEqual((await mo(a)).dinhNghiaPhi, { ten: "Bao phí", khoan: ["phí môi giới"] });
  assert.equal((await datSan(s, { "fee.inclusion": ["personalIncomeTax", "registrationFee", "brokerageFee"] })).status, 200);
  assert.deepEqual((await mo(a)).dinhNghiaPhi, { ten: "Bao phí", khoan: ["phí môi giới"] }, "định nghĩa phí của bộ đã gửi đổi theo sàn");
  const b = await gui(s, [c.id]);
  assert.deepEqual((await mo(b)).dinhNghiaPhi, { ten: "Bao phí", khoan: ["thuế thu nhập cá nhân", "lệ phí trước bạ", "phí môi giới"] }, "Lần gửi mới chưa theo định nghĩa mới");
  // Lần gửi trước 048: cột rỗng → đọc cấu hình hiện tại.
  await appPool.query("update shares set fee_inclusion = null where code = $1", [a]);
  assert.deepEqual((await mo(a)).dinhNghiaPhi?.valueOf(), { ten: "Bao phí", khoan: ["thuế thu nhập cá nhân", "lệ phí trước bạ", "phí môi giới"] });
});

test("môi giới: mức chia của bộ", async () => {
  const s = await sanMoi("chia");
  const c = await canDangBan(s.dauChu.cookie);
  // Màn Gửi điền sẵn mặc định đọc từ GET /company/settings (vai người gửi); «gửi không sửa» = gửi đúng giá trị ấy.
  const macDinhManGui = async () => {
    const r = await send("GET", "/api/v1/company/settings", undefined, s.dauKhach.cookie);
    assert.equal(r.status, 200, await r.clone().text());
    const v = (await r.json()) as { items: { key: string; value: unknown }[] };
    const m = v.items.find((x) => x.key === "broker_page.commission_split_pct")?.value;
    return typeof m === "number" ? m : null;
  };
  const datMacDinh = async (m: number | null) =>
    assert.equal((await datSan(s, { "broker_page.commission_split_pct": m })).status, 200, `đặt mặc định ${m}`);
  const coTrenTrang = async (code: string, mong: number | null, ca: string) => {
    const than = await mo(code);
    if (mong === null) assert.equal(Object.hasOwn(than, "mucChia"), false, `có khoá mucChia — ${ca}`);
    else assert.equal(than.mucChia, mong, `mức chia sai — ${ca}`);
    const db = (await appPool.query<{ m: number | null }>("select commission_split_pct::float8 m from shares where code = $1", [code])).rows[0]!;
    assert.equal(db.m, mong, `cột mức chia — ${ca}`);
  };
  // Bảng viết trước trục mức chia của E3 (thêm hai dòng số lẻ): mỗi dòng một lần gửi và một khẳng định.
  const BANG: [string, () => Promise<void>][] = [
    ["mặc định 50, gửi không sửa", async () => {
      await datMacDinh(50);
      await coTrenTrang(await gui(s, [c.id], await macDinhManGui()), 50, "mặc định 50, gửi không sửa");
    }],
    ["mặc định 50, gửi 40", async () => {
      await datMacDinh(50);
      await coTrenTrang(await gui(s, [c.id], 40), 40, "mặc định 50, gửi 40");
    }],
    ["mặc định trống, gửi trống", async () => {
      await datMacDinh(null);
      assert.equal(await macDinhManGui(), null);
      await coTrenTrang(await gui(s, [c.id], null), null, "mặc định trống, gửi trống");
    }],
    ["gửi 40 rồi đổi mặc định 30", async () => {
      await datMacDinh(50);
      const code = await gui(s, [c.id], 40);
      await datMacDinh(30);
      await coTrenTrang(code, 40, "bộ đã gửi đổi theo mặc định mới");
    }],
    ["khách riêng kèm 40", async () => {
      const dem = async () => (await appPool.query<{ n: number }>("select count(*)::int n from shares where company_id = $1", [s.companyId])).rows[0]!.n;
      const truoc = await dem();
      const r = await send("POST", "/api/v1/shares", { audience: "client", prospectId: "00000000-0000-4000-8000-000000000001", listingIds: [c.id], commissionSplitPct: 40 }, s.dauKhach.cookie);
      assert.equal(r.status, 400, "khách riêng kèm mức chia không bị từ chối");
      assert.equal(await dem(), truoc, "khách riêng kèm mức chia vẫn thêm Lần gửi");
    }],
    ["gửi 12,5", async () => coTrenTrang(await gui(s, [c.id], 12.5), 12.5, "gửi 12,5")],
    ["gửi 0,29 (số thực)", async () => coTrenTrang(await gui(s, [c.id], 0.29), 0.29, "gửi 0,29")],
  ];
  let dem = 0;
  for (const [, chay] of BANG) {
    await chay();
    dem++;
  }
  assert.equal(dem, BANG.length);
  // Mức ngoài khoảng hay quá hai chữ số lẻ → 400.
  for (const sai of [120, 33.333]) {
    const r = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: [c.id], commissionSplitPct: sai }, s.dauKhach.cookie);
    assert.equal(r.status, 400, `mức chia ${sai} không bị từ chối`);
  }
});

test("môi giới: sàn ẩn mức chia", async () => {
  const s = await sanMoi("an");
  const c = await canDangBan(s.dauChu.cookie);
  const code = await gui(s, [c.id], 40);
  assert.equal((await mo(code)).mucChia, 40, "đối chứng: chưa ẩn thì có mức");
  assert.equal((await datSan(s, { "broker_page.hide_commission_split": true })).status, 200);
  const an = await mo(code);
  assert.equal(Object.hasOwn(an, "mucChia"), false, "mức chia lọt khi sàn ẩn");
  assert.equal((await datSan(s, { "broker_page.hide_commission_split": false })).status, 200);
  assert.equal((await mo(code)).mucChia, 40, "tắt ẩn thì mức chia trở lại");
});

test("môi giới: cài đặt sàn", async () => {
  const s = await sanMoi("cai");
  const doc = async () => {
    const r = await send("GET", "/api/v1/company/settings", undefined, s.quanTri.cookie);
    assert.equal(r.status, 200);
    const v = (await r.json()) as { items: { key: string; value: unknown }[] };
    return Object.fromEntries(v.items.map((x) => [x.key, x.value]));
  };
  assert.equal((await datSan(s, { "broker_page.commission_split_pct": 45, "broker_page.hide_commission_split": true })).status, 200);
  let v = await doc();
  assert.equal(v["broker_page.commission_split_pct"], 45);
  assert.equal(v["broker_page.hide_commission_split"], true);
  for (const sai of [120, -1]) {
    const r = await datSan(s, { "broker_page.commission_split_pct": sai });
    assert.equal(r.status, 400, `mức chia ngoài 0–100 lưu được: ${sai}`);
    const loi = (await r.json()) as { reason?: unknown };
    assert.ok(typeof loi.reason === "string" && loi.reason.includes("broker_page.commission_split_pct"), `thiếu lý do nêu khoá: ${JSON.stringify(loi)}`);
  }
  v = await doc();
  assert.equal(v["broker_page.commission_split_pct"], 45, "giá trị cũ đổi sau lần bị từ chối");
  assert.equal((await datSan(s, { "broker_page.commission_split_pct": null })).status, 200, "để trống phải lưu được");
  // Bảng vai viết trước: vai khác 403, không cookie 401.
  const VAI: [string, string, number][] = [
    ["Đầu chủ", s.dauChu.cookie, 403],
    ["Trưởng nhóm", s.truongNhom.cookie, 403],
    ["Telesales", s.telesales.cookie, 403],
    ["Đầu khách", s.dauKhach.cookie, 403],
    ["không cookie", "", 401],
  ];
  let dem = 0;
  for (const [ten, cookie, ma] of VAI) {
    const r = await send("PATCH", "/api/v1/company/settings", { "broker_page.commission_split_pct": 10 }, cookie);
    assert.equal(r.status, ma, `${ten}: mã`);
    dem++;
  }
  assert.equal(dem, VAI.length);
});
