// Chuyển dữ liệu cũ sang liên hệ (hàng 85: AC-9, Hỏi-1). Dữ liệu dựng qua đường ghi thật rồi đưa về trạng thái trước 016
// bằng kết nối chủ (xoá liên hệ và số, gỡ mã liên hệ), chụp từng byte cột số cũ, rồi chạy hàm chuyển của migration.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import type pg from "pg";
import { khoaSoChu } from "../src/owners/khoa";
import { giaiMaSo } from "../src/owners/ma-hoa";
import { appPool, cleanup } from "./helpers";
import { ai, nam, nhap, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const VAI = { ts: { vai: ["telesales"] }, tn: { vai: ["team_lead"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà B"] } };
const taoHang = async (san: San, k: string, can: string) => {
  const r = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
};
const datChu = async (san: San, k: string, hang: string, so?: string) => {
  const r = await send("PUT", `/api/v1/listings/${hang}/owner`, { ownerName: "[Tên]", ...(so && { ownerPhone: so }) }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
};

/** Một sàn: lead số S nhập trước (chưa chia), ba lead số khác, hàng của hai đầu chủ cùng số S, một hàng chưa có số. */
async function dung(daoMoc: boolean) {
  const s = await sanMoi(VAI);
  const S = soMoi(s);
  const l1 = (await nhap(s, nam(S, "Toà A"))).id;
  for (let i = 0; i < 3; i++) await nhap(s, nam(soMoi(s), "Toà B"));
  const h1 = await taoHang(s, "dc1", "A-20.01");
  const h2 = await taoHang(s, "dc2", "A-20.02");
  const [dau, sau] = daoMoc ? [["dc2", h2], ["dc1", h1]] : [["dc1", h1], ["dc2", h2]];
  await datChu(s, dau[0]!, dau[1]!, S);
  await new Promise((r) => setTimeout(r, 15));
  await datChu(s, sau[0]!, sau[1]!, S);
  const h3 = await taoHang(s, "dc1", "A-20.03");
  await datChu(s, "dc1", h3);
  return { s, S, l1, h1, h2, h3, sau: sau[0]! };
}

/** Chạy trong một giao dịch khoá bảng chủ nhà rồi bảng lead trước mọi câu ghi — cùng thứ tự với các bài gỡ ràng buộc
 * (ma-hoa-so-chu, bat-rang-buoc-migrate) chạy song song. Xoá liên hệ kiểm khoá ngoại trên lead trước chủ nhà; không khoá
 * trước thì hai bên chờ nhau. */
async function theoThuTuKhoa<T>(fn: (c: pg.PoolClient) => Promise<T>, sauMoiKhoa?: (c: pg.PoolClient) => Promise<void>): Promise<T> {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("lock table listing_owners in row exclusive mode");
    await sauMoiKhoa?.(c);
    await c.query("lock table leads in row exclusive mode");
    await sauMoiKhoa?.(c);
    const kq = await fn(c);
    await c.query("commit");
    return kq;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** Đưa sàn về trạng thái trước 016: gỡ mã liên hệ, xoá số và liên hệ. */
const veTruoc016 = (san: San) =>
  theoThuTuKhoa(async (c) => {
    await c.query("update listing_owners set contact_id = null where company_id = $1", [san.companyId]);
    await c.query("update leads set contact_id = null where company_id = $1", [san.companyId]);
    await c.query("delete from contact_phones where company_id = $1", [san.companyId]);
    await c.query("delete from contacts where company_id = $1", [san.companyId]);
  });
const chup = async (san: San) =>
  (
    await appPool.query(
      `select 'o' || listing_id k, encode(owner_phone_enc, 'hex') enc, encode(owner_phone_hash, 'hex') h from listing_owners where company_id = $1
       union all select 'l' || id, encode(owner_phone_enc, 'hex'), encode(owner_phone_hash, 'hex') from leads where company_id = $1 order by 1`,
      [san.companyId],
    )
  ).rows;
const dem = async (san: San) =>
  (await appPool.query<{ c: number; p: number }>("select (select count(*)::int from contacts where company_id = $1) c, (select count(*)::int from contact_phones where company_id = $1) p", [san.companyId])).rows[0]!;
const chuyen = (san: San) => theoThuTuKhoa((c) => c.query("select * from app.lien_he_chuyen_du_lieu($1)", [san.companyId]));

test("liên hệ: chuyển dữ liệu cũ", async () => {
  const A = await dung(false);
  const B = await dung(true); // đối chứng: đảo thứ tự mốc gán
  const dauVetRieng = async (san: San) =>
    (await appPool.query<{ n: number }>("select count(distinct h)::int n from (select owner_phone_hash h from listing_owners where company_id = $1 and owner_phone_hash is not null union all select owner_phone_hash from leads where company_id = $1) x", [san.companyId])).rows[0]!.n;
  for (const X of [A, B]) {
    await veTruoc016(X.s);
    const anh = await chup(X.s);
    const r1 = (await chuyen(X.s)).rows[0];
    const lan1 = await dem(X.s);
    await chuyen(X.s);
    assert.deepEqual(await dem(X.s), lan1, "chạy lại đổi số dòng");
    // Mỗi dấu vết một liên hệ, cộng một liên hệ cho hàng chưa có số.
    assert.equal(lan1.c, (await dauVetRieng(X.s)) + 1);
    assert.deepEqual([r1.contacts, r1.leads], [lan1.c, 4]);
    const thieu = (await appPool.query("select (select count(*)::int from listing_owners where company_id = $1 and contact_id is null) o, (select count(*)::int from leads where company_id = $1 and contact_id is null) l", [X.s.companyId])).rows[0];
    assert.deepEqual(thieu, { o: 0, l: 0 });
    // Ngữ cảnh mã hoá chép nguyên: số S đi theo dòng ghi sớm nhất (lead l1); mọi số giải được bằng ngữ cảnh của chính dòng.
    const so = (await appPool.query<{ enc: Buffer; ctx: string; contact_id: string }>("select phone_enc enc, enc_context ctx, contact_id from contact_phones where company_id = $1", [X.s.companyId])).rows;
    const k = khoaSoChu();
    for (const p of so) assert.match(giaiMaSo(p.enc, p.ctx, k), /^0\d{9}$/, `không giải được ${p.ctx}`);
    const lS = (await appPool.query<{ contact_id: string }>("select contact_id from leads where id = $1", [X.l1])).rows[0]!.contact_id;
    assert.deepEqual(so.filter((p) => p.contact_id === lS).map((p) => p.ctx), [`leads:${X.s.companyId}:${X.l1}`]);
    assert.equal(giaiMaSo(so.find((p) => p.contact_id === lS)!.enc, `leads:${X.s.companyId}:${X.l1}`, k), X.S.replace(/\s/g, ""));
    // Hai hàng cùng số S, khác đầu chủ: một liên hệ, người giữ là đầu chủ gán sau cùng; có mặt trong danh sách gộp.
    const cuaHang = (await appPool.query<{ contact_id: string }>("select contact_id from listing_owners where listing_id = any($1) order by listing_id", [[X.h1, X.h2]])).rows.map((r) => r.contact_id);
    assert.deepEqual(cuaHang, [lS, lS]);
    const giu = (await appPool.query<{ owner_member_user_id: string }>("select owner_member_user_id from contacts where id = $1", [lS])).rows[0]!.owner_member_user_id;
    assert.equal(ai(X.s, giu), X.sau, "người giữ không theo mốc gán mới nhất");
    // Cột số cũ giữ nguyên từng byte (gỡ gộp được).
    assert.deepEqual(await chup(X.s), anh);
  }
  // Danh sách gộp cho trưởng nhóm của sàn A.
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [A.s.nguoi.tn!.userId, A.s.companyId]);
    const lS = (await appPool.query<{ contact_id: string }>("select contact_id from leads where id = $1", [A.l1])).rows[0]!.contact_id;
    assert.deepEqual((await c.query("select contact_id from app.lien_he_gop_nhieu_dau_chu()")).rows.map((r) => r.contact_id), [lS]);
  } finally {
    await c.query("rollback");
    c.release();
  }
  // Không liên hệ nào của A mang số của B.
  const cheo = (await appPool.query("select count(*)::int n from contact_phones p join contacts c on c.id = p.contact_id where p.company_id <> c.company_id")).rows[0].n;
  assert.equal(cheo, 0);
});

test("liên hệ: chuyển trên sàn không có dữ liệu", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] } });
  const r = (await chuyen(s)).rows;
  assert.deepEqual(r.map((x) => [x.leads, x.contacts, x.gop]), [[0, 0, 0]]);
});

test("liên hệ: bài chuyển khoá bảng chủ nhà rồi bảng lead trước mọi câu ghi", async () => {
  // Thứ tự khoá cùng các bài gỡ ràng buộc chạy song song (chủ nhà rồi lead) là thứ giữ bài chuyển khỏi kẹt khoá. Chụp khoá
  // của chính kết nối sau từng lệnh khoá — không giữ khoá mạnh trên bảng dùng chung nào, không chạm bài kiểm khác.
  const BANG = "('listing_owners'::regclass, 'leads'::regclass, 'contacts'::regclass)";
  const MANH = ["ShareLock", "ShareRowExclusiveLock", "ExclusiveLock", "AccessExclusiveLock"];
  const chup: string[][] = [];
  let manh = 0;
  const ghi = async (c: pg.PoolClient) => {
    const r = await c.query<{ bang: string; mode: string }>(
      `select relation::regclass::text bang, mode from pg_locks
       where pid = pg_backend_pid() and locktype = 'relation' and granted and relation in ${BANG}`,
    );
    chup.push(r.rows.map((x) => x.bang).sort());
    manh += (await c.query<{ n: number }>("select count(*)::int n from pg_locks where pid = pg_backend_pid() and locktype = 'relation' and mode = any($1)", [MANH])).rows[0]!.n;
  };
  await theoThuTuKhoa(ghi, ghi);
  assert.deepEqual(chup, [["listing_owners"], ["leads", "listing_owners"], ["leads", "listing_owners"]], "chưa khoá bảng chủ nhà rồi bảng lead trước câu ghi");
  assert.equal(manh, 0, "bài chuyển giữ khoá mạnh trên bảng");
  // Bài chuyển đi qua đúng đường ấy chạy trọn: mọi lead gắn liên hệ, liên hệ là bản dựng mới.
  const X = await dung(false);
  const truoc = (await appPool.query<{ id: string }>("select id from contacts where company_id = $1", [X.s.companyId])).rows.map((r) => r.id);
  assert.ok(truoc.length > 0, "đối chứng: sàn chưa có liên hệ trước khi chuyển");
  await veTruoc016(X.s);
  const goLienKet = (await appPool.query<{ n: number }>("select count(*)::int n from leads where company_id = $1 and contact_id is null", [X.s.companyId])).rows[0]!.n;
  assert.ok(goLienKet > 0, "đối chứng: bước trước 016 không gỡ liên kết lead");
  await chuyen(X.s);
  assert.equal((await appPool.query<{ n: number }>("select count(*)::int n from leads where company_id = $1 and contact_id is null", [X.s.companyId])).rows[0]!.n, 0, "lead chưa gắn liên hệ sau chuyển");
  const sau = (await appPool.query<{ id: string }>("select id from contacts where company_id = $1", [X.s.companyId])).rows.map((r) => r.id);
  assert.ok(sau.length > 0 && sau.every((id) => !truoc.includes(id)), "liên hệ sau chuyển vẫn là liên hệ cũ — bài chuyển không chạy");
});
