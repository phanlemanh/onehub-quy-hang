// Gọi từ máy tính qua API trên Postgres thật (hồ sơ goi-tu-may-tinh: E1, E2, E4, E5, E10). Người và sàn từ sàn thử của
// hàng 27; số mẫu 0900 000 0xx. Gửi đẩy đi qua một bộ gửi giả bơm vào API — không gọi dịch vụ đẩy thật; mọi lối của ca
// (nhập, chia, quay số) đi qua cùng API ấy. Chỉ sàn của ca được nhịp chia chạm.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { PUSH_PAYLOAD_KEYS, type PushPayload } from "@quy-hang/core/push";
import { createApi } from "../src/app";
import { runLeadTick } from "../src/jobs/lead-tick";
import { timDangSo } from "../src/owners/ma-hoa";
import type { PushSender } from "../src/push/gui";
import { appPool, BASE_URL, cleanup, identityPool, makeAuth, RUN } from "./helpers";
import { dong, hangCoChu, nam, sanMoi, soMoi, type San } from "./san-thu";

after(cleanup);

// ---- Bộ gửi giả: ghi lại mọi lần gửi ----
type LanGui = { endpoint: string; payload: PushPayload };
const daGui: LanGui[] = [];
const guiGia: PushSender = async (t, payload) => {
  daGui.push({ endpoint: t.endpoint, payload });
  return { ok: true };
};
const { auth } = makeAuth();
const app = createApi({ appPool, identityPool, auth, pushSender: guiGia });
const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
const nhip = (san: San) => runLeadTick(appPool, new Date(), [san.companyId], guiGia);

const DOI = {
  ts: { vai: ["telesales"] },
  ts2: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
  kiem: { vai: ["telesales", "listing_agent"], khu: ["Toà C"] },
};
const chuan = (so: string) => so.replace(/\s/g, "");
/** Hai dịch vụ đẩy thật khác nhau: máy tính (Google) và iPhone (Apple). */
const diaChi = (san: San, k: string, may: "M" | "P") =>
  may === "M" ? `https://fcm.googleapis.com/fcm/send/${RUN}/${san.companyId}/${k}/M` : `https://web.push.apple.com/${RUN}/${san.companyId}/${k}/P`;
const khoaThietBi = () => ({ p256dh: "B".repeat(87), auth: "A".repeat(22) });
async function bat(san: San, k: string, may: "M" | "P") {
  const r = await send("POST", "/api/v1/me/push-subscriptions", { endpoint: diaChi(san, k, may), expirationTime: null, keys: khoaThietBi() }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
}
async function nhap(san: San, body: unknown, k = "ts") {
  const r = await send("POST", "/api/v1/leads", body, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; outcome: string };
}
const quaySo = (san: San, id: string, k: string, body: unknown = {}) => send("POST", `/api/v1/leads/${id}/phone-dial`, body, san.nguoi[k]?.cookie ?? "");
const moSo = (san: San, id: string, k: string) => send("POST", `/api/v1/leads/${id}/phone-reveal`, undefined, san.nguoi[k]!.cookie);
const ghi = async (san: San, id: string, duoi: string, k: string) => {
  const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, `${duoi}: ${await r.clone().text()}`);
};
const hopThu = async (id: string) =>
  (await appPool.query<{ user_id: string; payload: PushPayload }>("select user_id, payload from push_outbox where payload->>'tag' = $1 order by id", [`quay-so:${id}`])).rows;
const vet = async (id: string) => Number((await appPool.query<{ n: string }>("select count(*) n from lead_phone_reveals where lead_id = $1", [id])).rows[0]!.n);
const dongLead = async (id: string) =>
  (await appPool.query("select outcome, accepted_at, first_called_at, matched_agent_user_id, returned_at from leads where id = $1", [id])).rows[0];
/** Lead về dc1 qua nhịp chia; trả mã và số đã chuẩn. */
async function leadCuaDc1(s: San, can?: string) {
  const so = soMoi(s);
  const l = await nhap(s, nam(so, "Toà A", can));
  await nhip(s);
  assert.equal((await dong(l.id)).matched_agent_user_id, s.nguoi.dc1!.userId, "lead không về dc1");
  return { id: l.id, so: chuan(so) };
}
const mong = (id: string): PushPayload => ({ title: "Gọi chủ nhà", body: "Toà A · Bán", url: `/units/call/dial?lead=${id}`, tag: `quay-so:${id}` });

// ---- E1 ----
test("quay số: đầu chủ được giao", async () => {
  const s = await sanMoi(DOI);
  const leadVe = async () => (await leadCuaDc1(s)).id;
  // Đăng ký bật SAU khi chia lead đầu — mọi lần gửi tính từ đây là của lời quay số.
  const idDau = await leadVe();
  await bat(s, "dc1", "M");
  await bat(s, "dc1", "P");
  const BANG: [string, () => Promise<string>][] = [
    ["Đã gửi", async () => idDau],
    ["Đã nhận", async () => { const id = await leadVe(); await ghi(s, id, "accept", "dc1"); return id; }],
    ["Đã gọi", async () => { const id = await leadVe(); await ghi(s, id, "first-call", "dc1"); return id; }],
  ];
  let dem = 0;
  for (const [nac, dung] of BANG) {
    const id = await dung();
    const truoc = await dongLead(id);
    const tu = daGui.length;
    const r = await quaySo(s, id, "dc1");
    assert.equal(r.status, 200, `nấc «${nac}»: ${await r.clone().text()}`);
    assert.deepEqual(await r.json(), { devices: 2, otherDevices: 2 }, `nấc «${nac}»`);
    const ht = await hopThu(id);
    assert.equal(ht.length, 2, `nấc «${nac}»: số dòng hộp thư`);
    for (const d of ht) {
      assert.equal(d.user_id, s.nguoi.dc1!.userId, `nấc «${nac}»: hộp thư cho người khác`);
      assert.deepEqual(Object.keys(d.payload).sort(), [...PUSH_PAYLOAD_KEYS].sort());
      assert.deepEqual(d.payload, mong(id), `nấc «${nac}»: nội dung hộp thư (url phải là trang quay số)`);
    }
    const gui = daGui.slice(tu);
    assert.deepEqual(gui.map((g) => g.endpoint).sort(), [diaChi(s, "dc1", "M"), diaChi(s, "dc1", "P")].sort(), `nấc «${nac}»: đích gửi`);
    for (const g of gui) assert.deepEqual(g.payload, mong(id), `nấc «${nac}»: nội dung gửi`);
    assert.deepEqual(await dongLead(id), truoc, `nấc «${nac}»: quay số đổi lead`);
    assert.equal(await vet(id), 0, `nấc «${nac}»: quay số ghi vết mở số`);
    dem++;
  }
  assert.equal(dem, 3);
  // Đối chứng dương: «Nhận» đổi dòng lead; mở số ghi một vết — hai phép so trên bắt được thay đổi thật.
  const id = await leadVe();
  const truoc = await dongLead(id);
  await ghi(s, id, "accept", "dc1");
  assert.notDeepEqual(await dongLead(id), truoc, "đối chứng: Nhận không đổi accepted_at");
  assert.equal((await moSo(s, id, "dc1")).status, 200);
  assert.equal(await vet(id), 1, "đối chứng: mở số không ghi vết");
  // Không thân (máy không gửi gì kèm) cũng là lời gọi hợp lệ.
  const r = await app.request(`${BASE_URL}/api/v1/leads/${id}/phone-dial`, { method: "POST", headers: { origin: BASE_URL, cookie: s.nguoi.dc1!.cookie } });
  assert.equal(r.status, 200, await r.clone().text());
});

// ---- E2 + E4 ----
test("quay số: người không được gọi, và không rò lớp nguồn", async () => {
  const s = await sanMoi(DOI);
  const sKhac = await sanMoi(DOI);
  // Ai cũng có đăng ký — từ chối đúng thì vẫn không dòng hộp thư nào.
  for (const k of ["dc1", "dc2", "tn", "ts"]) await bat(s, k, "P");
  await bat(sKhac, "dc1", "P");
  const tuChoi: { body: string; so: string }[] = [];
  // E4: mọi lời gọi cửa quay số của ca — từ chối lẫn thành công — chạy trong vòng bọc năm kênh nhật ký; `lo` gom hết.
  const lo: string[] = [];
  const boc = async <T>(fn: () => Promise<T>): Promise<T> => {
    const cu = { log: console.log, error: console.error, warn: console.warn, out: process.stdout.write, err: process.stderr.write };
    const ghiLai = (...a: unknown[]) => void lo.push(a.map(String).join(" "));
    try {
      console.log = ghiLai;
      console.error = ghiLai;
      console.warn = ghiLai;
      process.stdout.write = ((c: unknown) => (ghiLai(c), true)) as typeof process.stdout.write;
      process.stderr.write = ((c: unknown) => (ghiLai(c), true)) as typeof process.stderr.write;
      return await fn();
    } finally {
      Object.assign(console, { log: cu.log, error: cu.error, warn: cu.warn });
      process.stdout.write = cu.out;
      process.stderr.write = cu.err;
    }
  };
  const BANG: [string, () => Promise<{ id: string; so: string; k: string; san?: San }>, number][] = [
    ["đầu chủ khác cùng sàn", async () => ({ ...(await leadCuaDc1(s)), k: "dc2" }), 404],
    ["telesales đã nhập lead", async () => ({ ...(await leadCuaDc1(s)), k: "ts" }), 403],
    ["trưởng nhóm", async () => ({ ...(await leadCuaDc1(s)), k: "tn" }), 403],
    ["quản trị sàn", async () => ({ ...(await leadCuaDc1(s)), k: "qt" }), 403],
    ["người sàn khác", async () => ({ ...(await leadCuaDc1(s)), k: "dc1", san: sKhac }), 404],
    ["người được giao đã bị gỡ vai Đầu chủ", async () => {
      const l = await leadCuaDc1(s);
      await appPool.query("update company_members set roles = '{telesales}' where company_id = $1 and user_id = $2", [s.companyId, s.nguoi.dc1!.userId]);
      return { ...l, k: "dc1" };
    }, 403],
    ["chưa đăng nhập", async () => {
      // dc1 lấy lại vai Đầu chủ sau dòng gỡ vai.
      await appPool.query("update company_members set roles = '{listing_agent}' where company_id = $1 and user_id = $2", [s.companyId, s.nguoi.dc1!.userId]);
      return { ...(await leadCuaDc1(s)), k: "khong-co" };
    }, 401],
    ["lead đã trả lại", async () => {
      const l = await leadCuaDc1(s);
      await ghi(s, l.id, "return", "dc1");
      return { ...l, k: "dc1" };
    }, 404],
    ["lead đã bỏ", async () => {
      await hangCoChu(s, "dc1", "A-32.01", soMoi(s));
      const so = soMoi(s);
      const l = await nhap(s, nam(so, "Toà A", "A-32.01"), "ts2");
      const b = await send("POST", `/api/v1/leads/${l.id}/discard`, undefined, s.nguoi.ts2!.cookie);
      assert.equal(b.status, 200, await b.clone().text());
      return { id: l.id, so: chuan(so), k: "dc1" };
    }, 404],
    ["lead căn trùng — đầu chủ giữ căn gọi", async () => {
      await hangCoChu(s, "dc1", "A-31.01", soMoi(s));
      const so = soMoi(s);
      const l = await nhap(s, nam(so, "Toà A", "A-31.01"));
      assert.equal(l.outcome, "unit_has_open_listing");
      assert.equal((await dong(l.id)).matched_agent_user_id, s.nguoi.dc1!.userId);
      return { id: l.id, so: chuan(so), k: "dc1" };
    }, 404],
  ];
  let dem = 0;
  for (const [ten, dung, ma] of BANG) {
    const { id, so, k, san } = await dung();
    const tu = daGui.length;
    const { r, body } = await boc(async () => {
      const r = await quaySo(san ?? s, id, k);
      return { r, body: await r.text() };
    });
    assert.equal(r.status, ma, `dòng «${ten}»: ${body}`);
    assert.equal((await hopThu(id)).length, 0, `dòng «${ten}»: có dòng hộp thư`);
    assert.equal(daGui.length - tu, 0, `dòng «${ten}»: có lần gửi`);
    tuChoi.push({ body, so });
    dem++;
  }
  assert.equal(dem, 10);

  // Tầng hai sau luật theo dòng: đầu chủ kiêm người nhập ĐỌC ĐƯỢC lead mình nhập (luật đọc của bảng lead), nên chỉ điều kiện
  // «người được giao» của cửa quay số chặn người này khi lead về dc1.
  {
    const so = soMoi(s);
    const l = await nhap(s, nam(so, "Toà A"), "kiem");
    await nhip(s);
    assert.equal((await dong(l.id)).matched_agent_user_id, s.nguoi.dc1!.userId);
    await bat(s, "kiem", "M");
    const { r, body } = await boc(async () => {
      const r = await quaySo(s, l.id, "kiem");
      return { r, body: await r.text() };
    });
    assert.equal(r.status, 404, `đầu chủ kiêm người nhập gọi lead về dc1: ${body}`);
    assert.equal((await hopThu(l.id)).length, 0, "đầu chủ kiêm người nhập: có dòng hộp thư");
    tuChoi.push({ body, so: chuan(so) });
  }

  // Đối chứng dương cùng dữ liệu: người được giao gọi chính một lead còn việc → 200, có dòng hộp thư.
  const ok = await leadCuaDc1(s, "A-12.05");
  const tu = daGui.length;
  const { r: rOk, body: okBody } = await boc(async () => {
    const r = await quaySo(s, ok.id, "dc1");
    return { r, body: await r.text() };
  });
  assert.equal(rOk.status, 200, okBody);
  const ht = await hopThu(ok.id);
  assert.ok(ht.length >= 1, "đối chứng: không dòng hộp thư");

  // E4 — mọi chỗ thông báo đi qua: không số (bốn dạng), không mã căn, không giá.
  const RO: [string, (t: string) => boolean][] = [
    ["số", (t) => timDangSo(t, ok.so) !== null],
    ["mã căn", (t) => t.includes("A-12.05")],
    ["giá", (t) => t.includes("3200000000") || t.includes("3,2 tỷ") || t.includes("3.200.000.000")],
  ];
  const cho: [string, string][] = [
    ...ht.map((d, i): [string, string] => [`hộp thư ${i}`, JSON.stringify(d.payload)]),
    ...daGui.slice(tu).map((g, i): [string, string] => [`lần gửi ${i}`, JSON.stringify(g.payload)]),
    ["thân trả quay số", okBody],
    ...tuChoi.map((t, i): [string, string] => [`thân từ chối ${i}`, t.body]),
    ["nhật ký", lo.join("\n")],
  ];
  for (const [noi, chu] of cho) for (const [loai, bat] of RO) assert.equal(bat(chu), false, `rò ${loai} ở ${noi}: ${chu}`);
  for (const t of tuChoi) assert.equal(timDangSo(t.body, t.so), null, `lời từ chối mang số: ${t.body}`);
  for (const t of tuChoi) assert.equal(timDangSo(lo.join("\n"), t.so), null, "nhật ký ở lối từ chối mang số của lead");
  // Đối chứng dương: máy dò chạy thật — thân mở số mang số, nội dung thông báo mang tên toà.
  const mo = await (await moSo(s, ok.id, "dc1")).text();
  assert.ok(timDangSo(mo, ok.so), "máy dò không bắt số trong thân mở số");
  assert.ok(JSON.stringify(ht[0]!.payload).includes("Toà A"), "nội dung thông báo không có tên toà");
});

// ---- E5 ----
test("quay số: chưa có thiết bị khác", async () => {
  const s = await sanMoi(DOI);
  await bat(s, "dc2", "P"); // đăng ký của người khác cùng sàn không được đếm
  const BANG: [string, () => Promise<void>, (s: San) => unknown, { devices: number; otherDevices: number }][] = [
    ["(a) chưa đăng ký nào", async () => {}, () => ({}), { devices: 0, otherDevices: 0 }],
    ["(b) chỉ máy tính này", () => bat(s, "dc1", "M"), (x) => ({ endpoint: diaChi(x, "dc1", "M") }), { devices: 1, otherDevices: 0 }],
    ["(c) máy tính này và điện thoại", () => bat(s, "dc1", "P"), (x) => ({ endpoint: diaChi(x, "dc1", "M") }), { devices: 2, otherDevices: 1 }],
  ];
  let dem = 0;
  for (const [ten, dung, than, ketQua] of BANG) {
    const { id } = await leadCuaDc1(s);
    await dung();
    const tu = daGui.length;
    const r = await quaySo(s, id, "dc1", than(s));
    assert.equal(r.status, 200, `dòng ${ten}: ${await r.clone().text()}`);
    assert.deepEqual(await r.json(), ketQua, `dòng ${ten}`);
    assert.equal((await hopThu(id)).length, ketQua.devices, `dòng ${ten}: hộp thư`);
    assert.equal(daGui.length - tu, ketQua.devices, `dòng ${ten}: lần gửi`);
    dem++;
  }
  assert.equal(dem, 3);
});

// ---- E10 ----
test("quay số: url thông báo dẫn tới trang quay số và mở số một vết", async () => {
  const s = await sanMoi(DOI);
  const { id, so } = await leadCuaDc1(s);
  await bat(s, "dc1", "P");
  assert.equal((await quaySo(s, id, "dc1")).status, 200);
  const url = (await hopThu(id))[0]!.payload.url;
  const m = /^\/units\/call\/dial\?lead=([0-9a-f-]{36})$/.exec(url);
  assert.ok(m && m[1] === id, `url thông báo sai khuôn: ${url}`);
  const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  const trang = join(GOC, "apps/web/src/app/(app)", url.slice(1, url.indexOf("?")), "page.tsx");
  assert.ok(existsSync(trang), `trang không tồn tại: ${trang}`);
  const r = await moSo(s, id, "dc1");
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual(await r.json(), { ownerPhone: so });
  assert.equal(await vet(id), 1, "mở số từ trang quay số: vết");
});
