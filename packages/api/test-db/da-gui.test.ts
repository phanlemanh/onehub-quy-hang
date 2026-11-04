// Đã gửi qua API trên Postgres thật (hàng 36: AC-1, AC-2, AC-3, AC-4, AC-5, AC-9). Người, hàng từ bộ dựng sàn thử qua đường
// ghi thật; số là số mẫu `0900 000 0xx`, tên «[Tên]». Danh mục (số phòng ngủ) chèn bằng vai chủ cho phép thử gợi ý căn thay.
import { SU_KIEN_LAN_GUI, thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import pg from "pg";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, identityPool, makeAuth } from "./helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "./san-thu";

after(async () => {
  // Danh mục thử (vai chủ) đứng trước sàn trong khoá ngoại — gỡ trước khi dọn sàn.
  if (khu) {
    await appPool.query("delete from catalog_units where subdivision_key = $1", [khu]);
    await appPool.query("delete from catalog_subdivisions where subdivision_key = $1", [khu]);
    await appPool.query("delete from agreements where id = $1", [(danhMuc as { ag?: string }).ag]);
  }
  await cleanup();
});

const MOT = {
  dk1: { vai: ["buyer_agent"] },
  dk2: { vai: ["buyer_agent"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  ts: { vai: ["telesales"] },
};
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const so: string[] = [];

/** Một hàng lên bảng với giá cho trước; có số phòng ngủ trong danh mục (vai chủ) để luật gợi ý chạy được. */
async function hang(s: San, gia = 3_200_000_000, pn = 2) {
  const ma = maMoi(s);
  const id = await hangCoChu(s, "dc1", ma, soMoi(s));
  await lenBang(s, "dc1", id);
  if (gia !== 3_200_000_000) await lenh(s, id, { type: "price_changed", payload: { listPrice: gia, feeInclusion: "included" } });
  await danhMuc(s, ma, pn);
  return id;
}
let khu: string | null = null;
async function danhMuc(s: San, ma: string, pn: number) {
  if (!khu) {
    const ag = (
      await appPool.query<{ id: string }>(
        `insert into agreements (company_id, kind, direction, counterparty, counterparty_company_id, data_classes, valid_from, approved_by)
         values ($1, 'catalog_source', 'inbound', 'onehub-invest', null, '{catalog}', now(), '[Tên]') returning id`,
        [s.companyId],
      )
    ).rows[0]!.id;
    khu = `khu-thu-${randomUUID().slice(0, 8)}`;
    await appPool.query("insert into catalog_subdivisions (subdivision_key, subdivision_name, provider, measured_at, agreement_id) values ($1, '[Khu thử]', 'thu', now(), $2)", [khu, ag]);
    (danhMuc as { ag?: string }).ag = ag;
  }
  await appPool.query(
    `insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, bedrooms_total, property_type, property_sub_type, provider, measured_at, agreement_id)
     values ($1, $2, 'toa-a', 'Toà A', $3, $4, 'Residential', 'Condominium', 'thu', now(), $5) on conflict do nothing`,
    [`UPI-${randomUUID()}`, khu, ma, pn, (danhMuc as { ag?: string }).ag],
  );
}
const lenh = async (s: San, id: string, body: object) => {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  const r = await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck(s, "dc1"));
  assert.equal(r.status, 200, await r.clone().text());
};
async function lanGui(s: San, k: string, nguoiNhan: "khach_rieng" | "nhom_moi_gioi", listingIds: string[]) {
  let prospectId: string | null = null;
  if (nguoiNhan === "khach_rieng") {
    const sdt = soMoi(s);
    so.push(sdt);
    const t = thanKhachMoi({ ten: `[Tên] ${k}`, so: sdt, need: "purchase" });
    assert.ok(t.ok);
    const r = await send("POST", "/api/v1/prospects", t.than, ck(s, k));
    assert.equal(r.status, 201, await r.clone().text());
    prospectId = ((await r.json()) as { id: string }).id;
  }
  const t = thanLanGui({ nguoiNhan, prospectId, listingIds });
  assert.ok(t.ok);
  const r = await send("POST", "/api/v1/shares", t.than, ck(s, k));
  assert.equal(r.status, 201, await r.clone().text());
  const b = (await r.json()) as { id: string; code: string };
  return b;
}
const ds = async (s: San, k: string) => (await send("GET", "/api/v1/shares", undefined, ck(s, k))).json() as Promise<Record<string, unknown>[]>;
const ct = async (s: San, k: string, id: string) => (await send("GET", `/api/v1/shares/${id}`, undefined, ck(s, k))).json() as Promise<Record<string, unknown> & { listings: Record<string, unknown>[] }>;
const doSo = (than: string) => so.filter((x) => than.replace(/\D/g, "").includes(x.replace(/\D/g, "").slice(-9)));
const KHOA_CAM = ["phone", "contactId", "ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto"];

// ---- AC-1 ----
test("đã gửi: danh sách theo người xem", async () => {
  const s = await sanMoi(MOT);
  const [a, b] = [await hang(s), await hang(s)];
  const g1 = await lanGui(s, "dk1", "khach_rieng", [a, b]);
  const g2 = await lanGui(s, "dk1", "nhom_moi_gioi", [b]);
  const g3 = await lanGui(s, "dk2", "khach_rieng", [a]);
  const v1 = await ds(s, "dk1");
  assert.deepEqual(v1.map((x) => x.id), [g2.id, g1.id], "đầu khách 1: của mình, mới trước");
  assert.deepEqual((await ds(s, "dk2")).map((x) => x.id), [g3.id]);
  assert.deepEqual((await ds(s, "tn")).map((x) => x.id).sort(), [g1.id, g2.id, g3.id].sort(), "trưởng nhóm thấy cả sàn");
  assert.deepEqual(v1.map((x) => [x.recipient, x.listingCount]), [["Nhóm môi giới", 1], ["[Tên] dk1", 2]]);
  for (const x of v1) assert.ok((x.covers as string[]).length <= 4, "bìa quá bốn ảnh");
  const BANG: [string, string, number][] = [["đầu chủ", ck(s, "dc1"), 403], ["telesales", ck(s, "ts"), 403], ["không cookie", "", 401]];
  assert.equal(BANG.length, 3, "số dòng bảng viết trước");
  for (const [ten, cookie, ma] of BANG) assert.equal((await send("GET", "/api/v1/shares", undefined, cookie)).status, ma, ten);
  const thanList = JSON.stringify(v1);
  const thanCt = JSON.stringify([await ct(s, "dk1", g1.id), await ct(s, "dk1", g2.id)]);
  for (const than of [thanList, thanCt]) {
    for (const k of KHOA_CAM) assert.ok(!than.includes(`"${k}"`), `thân có khoá ${k}`);
    assert.deepEqual(doSo(than), [], "thân mang số khách");
    assert.ok(!than.includes("[Tên] Chủ"), "thân mang tên chủ nhà");
  }
  assert.deepEqual(doSo(`ghi ${so[0]}`), [so[0]], "đối chứng dương: máy dò không bắt số cài sẵn");
});

// ---- AC-2 ----
test("đã gửi: lượt mở và quan tâm đúng sự kiện", async () => {
  const s = await sanMoi(MOT);
  const [a, b, c] = [await hang(s), await hang(s), await hang(s)];
  const g = await lanGui(s, "dk1", "khach_rieng", [a, b, c]);
  const g0 = await lanGui(s, "dk1", "nhom_moi_gioi", [a]);
  const P = `/api/v1/public/shares/${g.code}/events`;
  for (const v of ["may-khach-AAAA", "may-khach-BBBB"]) assert.equal((await send("POST", P, { type: SU_KIEN_LAN_GUI.mo, visitor: v })).status, 201);
  for (const [v, l] of [["may-khach-AAAA", a], ["may-khach-AAAA", c], ["may-khach-BBBB", a]] as const)
    assert.equal((await send("POST", P, { type: SU_KIEN_LAN_GUI.quanTam, visitor: v, listingId: l })).status, 201);
  const x = (await ds(s, "dk1")).find((y) => y.id === g.id)!;
  const moi = (await appPool.query<{ t: Date }>("select max(created_at) t from share_events where share_id = $1 and type = 'link_opened'", [g.id])).rows[0]!.t;
  assert.deepEqual([x.opens, x.interests, x.lastOpenedAt], [2, 3, moi.toISOString()]);
  assert.deepEqual((await ct(s, "dk1", g.id)).listings.map((l) => l.interest), [2, 0, 1]);
  const y = (await ds(s, "dk1")).find((z) => z.id === g0.id)!;
  assert.deepEqual([y.opens, y.lastOpenedAt], [0, null], "đối chứng: link chưa ai mở");
});

// ---- AC-3 ----
test("đã gửi: căn vừa đổi sau lúc gửi", async () => {
  const s = await sanMoi(MOT);
  const [a, b, c] = [await hang(s), await hang(s), await hang(s, 3_000_000_000)];
  const g = await lanGui(s, "dk1", "khach_rieng", [a, b, c]);
  await lenh(s, a, { type: "price_changed", payload: { listPrice: 2_900_000_000, feeInclusion: "included" } });
  await lenh(s, b, { type: "status_changed", payload: { to: "Pending" } });
  // Giá đáy (lớp nguồn) của c đổi sau lúc gửi — không làm c «vừa đổi».
  await send("PUT", `/api/v1/listings/${c}/owner`, { ownerName: "[Tên]", ownerPhone: soMoi(s), floorPrice: 2_500_000_000 }, ck(s, "dc1"));
  const v = await ct(s, "dk1", g.id);
  assert.deepEqual(v.listings.map((l) => l.changed), [{ price: { from: 3_200_000_000, to: 2_900_000_000 } }, { status: { to: "Pending" } }, null]);
  assert.ok(!JSON.stringify(v).includes("2500000000"), "thân chi tiết mang giá đáy");
});

// ---- AC-4 ----
test("đã gửi: gợi ý căn thay qua API", async () => {
  const s = await sanMoi(MOT);
  const [a, b] = [await hang(s, 3_000_000_000), await hang(s, 3_000_000_000)];
  const [t1, t2, ngoai] = [await hang(s, 3_100_000_000), await hang(s, 2_900_000_000), await hang(s, 2_000_000_000)];
  const g = await lanGui(s, "dk1", "khach_rieng", [a, b]);
  await lenh(s, a, { type: "status_changed", payload: { to: "Pending" } });
  const v = await ct(s, "dk1", g.id);
  const goiY = (v.listings[0]!.suggestions as { id: string }[]).map((x) => x.id);
  assert.deepEqual(new Set(goiY), new Set([t1, t2]), "gợi ý đúng hai căn trong khoảng");
  assert.ok(!goiY.includes(ngoai) && !goiY.includes(b), "gợi ý căn ngoài khoảng hay đã trong link");
  assert.deepEqual(v.listings[1]!.suggestions, [], "căn không đổi có gợi ý");
});

// ---- AC-5 ----
test("đã gửi: tắt link", async () => {
  const s = await sanMoi(MOT);
  const g = await lanGui(s, "dk1", "khach_rieng", [await hang(s)]);
  const g2 = await lanGui(s, "dk1", "nhom_moi_gioi", [await hang(s)]);
  const tat = (k: string, id: string) => send("POST", `/api/v1/shares/${id}/disable`, undefined, ck(s, k));
  const doc = async (id: string) => (await appPool.query<{ d: Date | null }>("select disabled_at d from shares where id = $1", [id])).rows[0]!.d;
  const BANG: [string, () => Response | Promise<Response>, number[], string, boolean][] = [
    ["đầu khách khác cùng sàn", () => tat("dk2", g.id), [403, 404], g.id, false],
    ["telesales", () => tat("ts", g.id), [403], g.id, false],
    ["người gửi", () => tat("dk1", g.id), [200], g.id, true],
    ["tắt lại", () => tat("dk1", g.id), [409], g.id, true],
    ["trưởng nhóm tắt link của đầu khách", () => tat("tn", g2.id), [200], g2.id, true],
  ];
  assert.equal(BANG.length, 5, "số dòng bảng viết trước");
  for (const [ten, goi, ma, id, daTat] of BANG) {
    const r = await goi();
    assert.ok(ma.includes(r.status), `${ten}: ${r.status}`);
    assert.equal((await doc(id)) !== null, daTat, `${ten}: disabled_at`);
  }
  assert.equal((await send("GET", `/api/v1/public/shares/${g.code}`)).status, 404, "trang khách của link đã tắt");
  assert.ok((await ds(s, "dk1")).find((x) => x.id === g.id)!.disabledAt, "danh sách không mang disabledAt");
});

// ---- AC-9 ----
test("trang khách: route đọc tách lỗi máy chủ với link không còn", async () => {
  const s = await sanMoi(MOT);
  const g = await lanGui(s, "dk1", "khach_rieng", [await hang(s)]);
  assert.equal((await send("GET", `/api/v1/public/shares/${g.code}`)).status, 200, "đối chứng: link mở");
  assert.equal((await send("GET", "/api/v1/public/shares/ZzZzZzZzZzZz")).status, 404, "mã không có");
  const hong = new pg.Pool({ connectionString: "postgres://khong:khong@127.0.0.1:1/khong", connectionTimeoutMillis: 500 });
  const appHong = createApi({ appPool: hong, identityPool, auth: makeAuth().auth });
  const r = await appHong.request(`${BASE_URL}/api/v1/public/shares/${g.code}`);
  assert.ok(r.status >= 500, `cơ sở dữ liệu hỏng mà trả ${r.status}`);
  await hong.end();
});
