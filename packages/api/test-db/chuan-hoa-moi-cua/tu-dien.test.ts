// Từ điển của sàn trên Postgres thật (hàng 70 chuan-hoa-moi-cua: E3, E5, E6, E7, E10). Sàn, người, lần nhập dựng qua
// đường ghi thật; kết nối chủ chỉ để chụp và đếm. Tên «[Tên]», số `0900 000 0xx`.
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { appPool, cleanup, RUN } from "../helpers";
import { sanMoi, send, type San } from "../san-thu";

after(cleanup);

const VAI = { dc: { vai: ["listing_agent"] }, tn: { vai: ["team_lead"] }, dk: { vai: ["buyer_agent"] } };
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const URL_TD = "/api/v1/company/value-aliases";
type Dong = { id: string; field: string; raw: string; value: string; status: string; pickCount: number };
type Bang = { rows: Dong[]; health: Record<string, { gap: number; daNeo: number; cho: number; daBo: number; lanChon: number }> };
const deXuat = (s: San, than: unknown, k = "dc") => send("POST", `${URL_TD}/proposals`, than, ck(s, k));
const quyet = (s: San, id: string, decision: string, k = "qt") => send("PUT", `${URL_TD}/${id}`, { decision }, ck(s, k));
async function doc(s: San, k = "qt"): Promise<Bang> {
  const r = await send("GET", URL_TD, undefined, ck(s, k));
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as Bang;
}
const demDong = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from company_value_aliases where company_id = $1", [s.companyId])).rows[0]!.n;

test("từ điển: đề xuất, chọn lại, duyệt, quyền, nhật ký", async () => {
  const s = await sanMoi(VAI);
  const r1 = await deXuat(s, { field: "directionFaces", raw: "dong nm", value: "Đông Nam" });
  assert.equal(r1.status, 201, await r1.clone().text());
  const id = ((await r1.json()) as Dong).id;
  const r2 = await deXuat(s, { field: "directionFaces", raw: "Dong  NM", value: "Đông Nam" }, "tn");
  assert.equal(r2.status, 201);
  let b = await doc(s);
  assert.deepEqual(b.rows.map((r) => [r.field, r.status, r.pickCount]), [["directionFaces", "proposed", 2]], "chọn lại cùng chữ gập phải tăng đếm, không thêm dòng");
  // Bảng vai: chỉ quản trị duyệt.
  for (const k of ["dc", "tn", "dk"]) {
    const r = await quyet(s, id, "approve", k);
    assert.equal(r.status, 403, `${k} duyệt được`);
  }
  assert.equal((await doc(s)).rows[0]!.status, "proposed");
  assert.equal((await quyet(s, id, "approve")).status, 200, "đối chứng: quản trị duyệt");
  // Đã duyệt: chọn lại vẫn approved, đếm 3.
  assert.equal((await deXuat(s, { field: "directionFaces", raw: "DONG NM", value: "Đông Nam" })).status, 201);
  b = await doc(s);
  assert.deepEqual(b.rows.map((r) => [r.status, r.pickCount]), [["approved", 3]]);
  assert.deepEqual(b.health.directionFaces, { gap: 1, daNeo: 1, cho: 0, daBo: 0, lanChon: 3 });
  // Bỏ: thêm một sự kiện.
  assert.equal((await quyet(s, id, "reject")).status, 200);
  const su = (await appPool.query<{ kind: string; actor_user_id: string }>("select kind, actor_user_id from company_value_alias_events where company_id = $1 order by id", [s.companyId])).rows;
  assert.deepEqual(su.map((x) => x.kind), ["proposed", "picked", "approved", "picked", "rejected"]);
  assert.equal(su[2]!.actor_user_id, s.nguoi.qt!.userId);
  // Đầu khách không đề xuất.
  assert.equal((await deXuat(s, { field: "directionFaces", raw: "tay bc", value: "Tây Bắc" }, "dk")).status, 403);
  // Quyết sai, id lạ.
  assert.equal((await send("PUT", `${URL_TD}/${id}`, { decision: "maybe" }, ck(s, "qt"))).status, 400);
  assert.equal((await quyet(s, "00000000-0000-4000-8000-000000000070", "approve")).status, 404);
});

test("từ điển: đề xuất sai bị từ chối, không ghi dòng", async () => {
  const s = await sanMoi(VAI);
  const BANG: [string, unknown][] = [
    ["số điện thoại", { field: "directionFaces", raw: "Gọi 0900 000 001", value: "Đông" }],
    ["email", { field: "directionFaces", raw: "[Tên]@vidu.vn", value: "Đông" }],
    ["số giấy tờ", { field: "directionFaces", raw: "012345678901", value: "Đông" }],
    ["dài", { field: "directionFaces", raw: "x".repeat(41), value: "Đông" }],
    ["trường lớp nguồn", { field: "ownerPhone", raw: "abc", value: "x" }],
    ["giá trị ngoài tập", { field: "directionFaces", raw: "dong nm", value: "Đông Nam Bộ" }],
    ["ghi đè cách gõ dựng sẵn", { field: "feeInclusion", raw: "bao phi", value: "excluded" }],
    ["ghi đè tên chuẩn", { field: "directionFaces", raw: "dong nam", value: "Tây Bắc" }],
  ];
  let dem = 0;
  for (const [ten, than] of BANG) {
    const r = await deXuat(s, than);
    assert.equal(r.status, 400, `${ten}: ${await r.clone().text()}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.equal(await demDong(s), 0, "đề xuất sai đã ghi dòng");
  assert.equal((await deXuat(s, { field: "directionFaces", raw: "dong nm", value: "Đông Nam" })).status, 201, "đối chứng: chữ hợp lệ");
});

// ---- Lần nhập qua đường ghi máy chủ (E6) và dữ liệu đã lưu không đổi (E7) ----
const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí"];
let soTep = 0;
async function nhapMot(s: San, ma: string, phi: string) {
  const luoi: Cell[][] = [TIEU_DE, ["Toà A", ma, "3,5 tỷ", phi]];
  const bang = readTable(luoi);
  const mo = await send(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp tu dien ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-td-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: [{ row: 2, buildingName: "Toà A", unitNumber: ma }],
    },
    ck(s, "dc"),
  );
  assert.equal(mo.status, 201, await mo.clone().text());
  const id = ((await mo.json()) as { id: string }).id;
  const r = await send("POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows: [{ row: 2, cells: luoi[1] }] }, ck(s, "dc"));
  assert.equal(r.status, 200, await r.clone().text());
  return ((await r.json()) as { rows: { action: string; reason: string; listingId?: string }[] }).rows[0]!;
}
const phiCua = async (listingId: string) =>
  (await appPool.query<{ p: string | null }>("select payload->>'feeInclusion' p from listing_events where listing_id = $1 and type = 'price_changed' order by seq desc limit 1", [listingId])).rows[0]?.p ?? null;

test("từ điển: cách gõ đã duyệt chuẩn hoá thẳng ở đường ghi lần nhập, sàn khác không", async () => {
  const s = await sanMoi(VAI);
  const k = await sanMoi(VAI);
  const r = await deXuat(s, { field: "feeInclusion", raw: "tron goi", value: "included" });
  const id = ((await r.json()) as Dong).id;
  // Chưa duyệt: lần nhập chưa nhận chữ ấy.
  // Lần nhập vẫn tạo căn, nhưng ô phí chưa nhận thì giá không ghi (lý do nêu thiếu điều kiện phí).
  const truoc = await nhapMot(s, "A-01.01", "TRON  GOI");
  assert.equal(truoc.action, "create", JSON.stringify(truoc));
  assert.equal(await phiCua(truoc.listingId!), null, `đề xuất chưa duyệt đã chuẩn hoá: ${JSON.stringify(truoc)}`);
  assert.equal((await quyet(s, id, "approve")).status, 200);
  const sau = await nhapMot(s, "A-01.02", "TRON  GOI");
  assert.equal(sau.action, "create", `cách gõ đã duyệt chưa chuẩn hoá: ${JSON.stringify(sau)}`);
  assert.equal(await phiCua(sau.listingId!), "included");
  // Đối chứng: sàn khác cùng tệp — chữ ấy không chuẩn hoá.
  const khac = await nhapMot(k, "A-01.03", "TRON  GOI");
  assert.equal(await phiCua(khac.listingId!), null, "từ điển của sàn A lọt sang sàn K");
});

test("từ điển: duyệt hay bỏ không đổi dữ liệu đã lưu", async () => {
  const s = await sanMoi(VAI);
  const tao = await nhapMot(s, "A-02.01", "bao phí");
  assert.equal(tao.action, "create", JSON.stringify(tao));
  const chup = async () => ({
    listings: (await appPool.query("select * from listings where company_id = $1 order by id", [s.companyId])).rows,
    events: (await appPool.query("select listing_id, seq, type, payload from listing_events where company_id = $1 order by listing_id, seq", [s.companyId])).rows,
  });
  const truoc = await chup();
  const id = ((await (await deXuat(s, { field: "feeInclusion", raw: "phi rieng", value: "excluded" })).json()) as Dong).id;
  await quyet(s, id, "approve");
  await quyet(s, id, "reject");
  assert.deepEqual(await chup(), truoc, "duyệt hay bỏ đã đổi dữ liệu căn");
  assert.equal((await doc(s)).rows[0]!.status, "rejected", "đối chứng: bảng từ điển đổi thật");
});
