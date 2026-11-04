// Hôm nay của đầu khách qua API trên Postgres thật (hàng 37: AC-1, AC-2, AC-3, AC-4 — E1, E2, E3, E4b). Người, hàng từ bộ dựng
// sàn thử qua đường ghi thật; số là số mẫu `0900 000 0xx`, tên «[Tên]». Danh mục (số phòng ngủ) chèn bằng vai chủ.
import { SU_KIEN_LAN_GUI, thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "./san-thu";

let ag: string | null = null;
const khu = `khu-thu-${randomUUID().slice(0, 8)}`;
after(async () => {
  if (ag) {
    await appPool.query("delete from catalog_units where subdivision_key = $1", [khu]);
    await appPool.query("delete from catalog_subdivisions where subdivision_key = $1", [khu]);
    await appPool.query("delete from agreements where id = $1", [ag]);
  }
  await cleanup();
});

const MOT = {
  dk1: { vai: ["buyer_agent"] },
  dk2: { vai: ["buyer_agent"] },
  dkdc: { vai: ["buyer_agent", "listing_agent"], khu: ["Toà A"] },
  tn: { vai: ["team_lead"] },
  tndk: { vai: ["team_lead", "buyer_agent"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A", "Toà B"] },
  ts: { vai: ["telesales"] },
};
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const so: string[] = [];
const TY = 1_000_000_000;

async function danhMuc(s: San, toa: string, ma: string, pn: number) {
  if (!ag) {
    ag = (
      await appPool.query<{ id: string }>(
        `insert into agreements (company_id, kind, direction, counterparty, counterparty_company_id, data_classes, valid_from, approved_by)
         values ($1, 'catalog_source', 'inbound', 'onehub-invest', null, '{catalog}', now(), '[Tên]') returning id`,
        [s.companyId],
      )
    ).rows[0]!.id;
    await appPool.query("insert into catalog_subdivisions (subdivision_key, subdivision_name, provider, measured_at, agreement_id) values ($1, '[Khu thử]', 'thu', now(), $2)", [khu, ag]);
  }
  await appPool.query(
    `insert into catalog_units (upi, subdivision_key, building_key, building_name, unit_number, bedrooms_total, property_type, property_sub_type, provider, measured_at, agreement_id)
     values ($1, $2, $3, $4, $5, $6, 'Residential', 'Condominium', 'thu', now(), $7) on conflict do nothing`,
    [`UPI-${randomUUID()}`, khu, toa === "Toà A" ? "toa-a" : "toa-b", toa, ma, pn, ag],
  );
}
const lenh = async (s: San, id: string, body: object, k = "dc1") => {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  const r = await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck(s, k));
  assert.equal(r.status, 200, await r.clone().text());
};
/** Một hàng lên Đang bán (lệnh thật) với giá cho trước; có số phòng ngủ trong danh mục. */
async function hang(s: San, gia = 3.2 * TY, o: { toa?: string; pn?: number } = {}) {
  const toa = o.toa ?? "Toà A";
  const ma = maMoi(s);
  const id = await hangCoChu(s, "dc1", ma, soMoi(s), toa);
  await danhMuc(s, toa, ma, o.pn ?? 2);
  await lenBang(s, "dc1", id);
  if (gia !== 3.2 * TY) await lenh(s, id, { type: "price_changed", payload: { listPrice: gia, feeInclusion: "included" } });
  return id;
}
async function lanGui(s: San, k: string, listingIds: string[]) {
  const sdt = soMoi(s);
  so.push(sdt);
  const t = thanKhachMoi({ ten: `[Tên] ${k}`, so: sdt, need: "purchase" });
  assert.ok(t.ok);
  const p = await send("POST", "/api/v1/prospects", t.than, ck(s, k));
  assert.equal(p.status, 201, await p.clone().text());
  const g = thanLanGui({ nguoiNhan: "khach_rieng", prospectId: ((await p.json()) as { id: string }).id, listingIds });
  assert.ok(g.ok);
  const r = await send("POST", "/api/v1/shares", g.than, ck(s, k));
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; code: string };
}
type Tin = { kind: string; at: string; day: string; share?: { id: string; recipient: string }; shares?: { id: string; recipient: string }[]; listing?: { id: string; name: string }; opens?: number; interested?: { id: string }[]; changed?: unknown };
const tin = async (s: San, k: string) => {
  const r = await send("GET", "/api/v1/today/buyer", undefined, ck(s, k));
  assert.equal(r.status, 200, await r.clone().text());
  return ((await r.json()) as { items: Tin[] }).items;
};
const mo = (code: string, visitor: string) => send("POST", `/api/v1/public/shares/${code}/events`, { type: SU_KIEN_LAN_GUI.mo, visitor });
const thich = (code: string, visitor: string, listingId: string) => send("POST", `/api/v1/public/shares/${code}/events`, { type: SU_KIEN_LAN_GUI.quanTam, visitor, listingId });
const doSo = (than: string) => so.filter((x) => than.replace(/\D/g, "").includes(x.replace(/\D/g, "").slice(-9)));
const KHOA_CAM = ["phone", "contactId", "ownerName", "ownerPhone", "floorPrice"];
const ngayVN = (d: Date) => new Date(d.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);

// ---- AC-1 ----
test("hôm nay đầu khách: tin theo người xem", async () => {
  const s = await sanMoi(MOT);
  const a = await hang(s);
  // Chủ nhà của căn mang tên và số riêng đã cài — máy dò quét đúng hai giá trị ấy trên thân trả.
  const TEN_CHU = "[Tên] Chủ căn E1";
  const soChu = soMoi(s);
  const r0 = await send("PUT", `/api/v1/listings/${a}/owner`, { ownerName: TEN_CHU, ownerPhone: soChu, floorPrice: 2.7 * TY }, ck(s, "dc1"));
  assert.equal(r0.status, 200, await r0.clone().text());
  const daCai = (await appPool.query<{ n: string }>("select owner_name n from listing_owners where listing_id = $1", [a])).rows[0];
  assert.equal(daCai?.n, TEN_CHU, "tên chủ đã cài");
  const g1 = await lanGui(s, "dk1", [a]);
  const g2 = await lanGui(s, "dk2", [a]);
  const g3 = await lanGui(s, "dkdc", [a]);
  const g4 = await lanGui(s, "tndk", [a]);
  for (const g of [g1, g2, g3, g4]) assert.equal((await mo(g.code, `may-${g.id.slice(0, 8)}`)).status, 201);
  const lan = (ds: Tin[]) => [...new Set(ds.map((t) => t.share?.id))];
  assert.deepEqual(lan(await tin(s, "dk1")), [g1.id], "đầu khách 1 chỉ thấy link của mình");
  assert.deepEqual(lan(await tin(s, "dk2")), [g2.id], "đầu khách 2 chỉ thấy link của mình");
  assert.deepEqual(lan(await tin(s, "dkdc")), [g3.id], "người nhiều vai: tin của chính mình");
  // Trưởng nhóm có vai Đầu khách: luật dòng cho đọc mọi Lần gửi của sàn, vùng vẫn chỉ gồm link mình gửi.
  assert.deepEqual(lan(await tin(s, "tndk")), [g4.id], "trưởng nhóm kiêm đầu khách: chỉ link của mình");
  const BANG: [string, string, number][] = [
    ["đầu chủ chỉ một vai", ck(s, "dc1"), 403],
    ["telesales", ck(s, "ts"), 403],
    ["trưởng nhóm không vai Đầu khách", ck(s, "tn"), 403],
    ["không cookie", "", 401],
    ["đầu khách và đầu chủ", ck(s, "dkdc"), 200],
  ];
  assert.equal(BANG.length, 5, "số dòng bảng viết trước");
  for (const [ten, cookie, ma] of BANG) assert.equal((await send("GET", "/api/v1/today/buyer", undefined, cookie)).status, ma, ten);

  // 23:30 UTC hai hôm trước rơi vào ngày Việt Nam hôm sau của nó (không trùng ngày của lượt mở vừa rồi); tin mới trước.
  const hai = new Date(Date.now() - 2 * 86_400_000);
  const muonHon = new Date(Date.UTC(hai.getUTCFullYear(), hai.getUTCMonth(), hai.getUTCDate(), 23, 30));
  assert.equal((await mo(g1.code, "may-khach-dem")).status, 201);
  await appPool.query("update share_events set created_at = $1 where share_id = $2 and visitor = 'may-khach-dem'", [muonHon, g1.id]);
  const ds = await tin(s, "dk1");
  const dem = ds.find((t) => t.at === muonHon.toISOString())!;
  assert.equal(dem.day, ngayVN(muonHon), "ngày giờ Việt Nam");
  assert.notEqual(dem.day, muonHon.toISOString().slice(0, 10), "đối chứng: ngày UTC khác ngày Việt Nam");
  assert.deepEqual(ds.map((t) => t.at), [...ds.map((t) => t.at)].sort().reverse(), "mới trước");

  const than = JSON.stringify(ds);
  for (const k of KHOA_CAM) assert.ok(!than.includes(`"${k}"`), `thân có khoá ${k}`);
  const doChu = (t: string) => [...(t.includes(TEN_CHU) ? [TEN_CHU] : []), ...(t.replace(/\D/g, "").includes(soChu.replace(/\D/g, "").slice(-9)) ? [soChu] : [])];
  assert.deepEqual(doSo(than), [], "thân mang số khách");
  assert.deepEqual(doChu(than), [], "thân mang tên hay số chủ nhà");
  assert.ok(!than.includes(String(2.7 * TY)), "thân mang giá đáy");
  assert.deepEqual(doSo(`ghi ${so[0]}`), [so[0]], "đối chứng dương: máy dò bắt số khách đã cài");
  assert.deepEqual(doChu(`chủ ${TEN_CHU} · ${soChu}`), [TEN_CHU, soChu], "đối chứng dương: máy dò bắt tên và số chủ đã cài");
});

// ---- AC-2 ----
test("hôm nay đầu khách: một tin phản ứng mỗi Lần gửi mỗi ngày", async () => {
  const s = await sanMoi(MOT);
  const [a, b, c] = [await hang(s), await hang(s), await hang(s)];
  const g = await lanGui(s, "dk1", [a, b, c]);
  for (const v of ["may-khach-AAAA", "may-khach-BBBB"]) assert.equal((await mo(g.code, v)).status, 201);
  for (const l of [c, a]) assert.equal((await thich(g.code, "may-khach-AAAA", l)).status, 201);
  const phan = (ds: Tin[]) => ds.filter((t) => t.kind === "reaction" && t.share?.id === g.id);
  let ds = phan(await tin(s, "dk1"));
  assert.equal(ds.length, 1, `số tin phản ứng ${ds.length}`);
  const moi = (await appPool.query<{ t: Date }>("select max(created_at) t from share_events where share_id = $1", [g.id])).rows[0]!.t;
  assert.deepEqual([ds[0]!.opens, ds[0]!.interested!.map((x) => x.id), ds[0]!.at], [2, [a, c], moi.toISOString()]);

  // Một lượt mở dời sang hôm trước → tin thứ hai ở ngày ấy; sự kiện cũ hơn 7 ngày không sinh tin.
  await appPool.query("update share_events set created_at = created_at - interval '1 day' where share_id = $1 and visitor = 'may-khach-BBBB'", [g.id]);
  ds = phan(await tin(s, "dk1"));
  assert.deepEqual(ds.map((t) => t.opens), [1, 1], "hai ngày hai tin");
  await appPool.query("update share_events set created_at = created_at - interval '10 days' where share_id = $1 and visitor = 'may-khach-BBBB'", [g.id]);
  assert.equal(phan(await tin(s, "dk1")).length, 1, "sự kiện cũ hơn 7 ngày");
});

// ---- AC-3 ----
test("hôm nay đầu khách: căn đã gửi vừa đổi", async () => {
  const s = await sanMoi(MOT);
  const [a, b, c] = [await hang(s), await hang(s), await hang(s)];
  const g = await lanGui(s, "dk1", [a, b]);
  const gTat = await lanGui(s, "dk1", [c]);
  assert.equal((await send("POST", `/api/v1/shares/${gTat.id}/disable`, undefined, ck(s, "dk1"))).status, 200);
  await lenh(s, a, { type: "price_changed", payload: { listPrice: 2.9 * TY, feeInclusion: "included" } });
  await lenh(s, b, { type: "status_changed", payload: { to: "Pending" } });
  await lenh(s, c, { type: "price_changed", payload: { listPrice: 2.8 * TY, feeInclusion: "included" } });
  const doi = (ds: Tin[]) => ds.filter((t) => t.kind === "changed");
  const ds = doi(await tin(s, "dk1"));
  assert.deepEqual(
    ds.map((t) => [t.listing!.id, t.share!.id, t.changed]).sort((x, y) => String(x[0]).localeCompare(String(y[0]))),
    [[a, g.id, { price: { from: 3.2 * TY, to: 2.9 * TY } }], [b, g.id, { status: { to: "Pending" } }]].sort((x, y) => String(x[0]).localeCompare(String(y[0]))),
  );
  assert.ok(ds.every((t) => t.share!.recipient === "[Tên] dk1"), "người nhận");
  assert.ok(!ds.some((t) => t.share!.id === gTat.id), "link đã tắt sinh tin «Vừa đổi»");

  // Giá đáy (lớp nguồn) đổi qua lệnh thật: lưu được nhưng không sinh tin, thân không mang giá đáy.
  const r = await send("PUT", `/api/v1/listings/${a}/owner`, { ownerName: "[Tên]", ownerPhone: soMoi(s), floorPrice: 2.5 * TY }, ck(s, "dc1"));
  assert.equal(r.status, 200, await r.clone().text());
  const luu = (await appPool.query<{ f: string | null }>("select floor_price::text f from listing_owners where listing_id = $1", [a])).rows[0];
  assert.equal(luu?.f, String(2.5 * TY), "giá đáy đã lưu");
  const sau = await tin(s, "dk1");
  assert.equal(doi(sau).length, 2, "giá đáy sinh tin");
  assert.ok(!JSON.stringify(sau).includes("2500000000"), "thân mang giá đáy");
});

// ---- AC-4 ----
test("hôm nay đầu khách: căn mới khớp bộ đã gửi", async () => {
  const s = await sanMoi(MOT);
  const goc = await hang(s, 3 * TY);
  const g = await lanGui(s, "dk1", [goc]);
  // Sau lúc gửi đầu chủ đưa ba căn lên Đang bán: chỉ căn cùng toà, cùng số phòng ngủ, giá trong ±15% khớp.
  const khop = await hang(s, 3.1 * TY);
  const xa = await hang(s, 4 * TY);
  const toaB = await hang(s, 3 * TY, { toa: "Toà B" });
  const moi = (ds: Tin[]) => ds.filter((t) => t.kind === "new_match");
  const ds = moi(await tin(s, "dk1"));
  assert.deepEqual(ds.map((t) => [t.listing!.id, t.shares!.map((x) => x.id)]), [[khop, [g.id]]], `căn lạc: ${JSON.stringify({ xa, toaB })}`);
  assert.equal(ds[0]!.shares![0]!.recipient, "[Tên] dk1");
  assert.deepEqual(moi(await tin(s, "dk2")), [], "đầu khách không gửi bộ nào");
  assert.equal((await send("POST", `/api/v1/shares/${g.id}/disable`, undefined, ck(s, "dk1"))).status, 200);
  assert.deepEqual(moi(await tin(s, "dk1")), [], "bộ đã tắt");
});
