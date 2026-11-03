// Luồng Gửi qua API trên Postgres thật (hàng 34: AC-2, AC-3, AC-7). Người, hàng từ bộ mẫu hàng 5 qua đường ghi thật; số là
// số mẫu `0900 000 0xx`, tên là «[Tên]». Thân «Khách mới» và «Gửi» lấy từ hàm thật của lõi — không viết tay.
import { PROSPECT_VIEW_KEYS } from "@quy-hang/core/contacts";
import { thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const MOT = {
  dk1: { vai: ["buyer_agent"] },
  dk2: { vai: ["buyer_agent"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  ts: { vai: ["telesales"] },
};

const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const taoNhuCau = async (s: San, k: string, so: string) => {
  const t = thanKhachMoi({ ten: "[Tên]", so, need: "purchase" });
  assert.ok(t.ok, "thân khách mới của lõi sai khuôn");
  const r = await send("POST", "/api/v1/prospects", t.than, ck(s, k));
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
};
const danhSach = async (s: San, k: string) => {
  const r = await send("GET", "/api/v1/prospects", undefined, ck(s, k));
  return { status: r.status, text: await r.text() };
};
/** Máy dò số: chín chữ số liền (số khách dạng nào cũng có chín chữ số cuối liền nhau khi bỏ dấu cách). */
const doChinSo = (than: string) => /\d{9}/.test(than.replace(/[\s.-]/g, ""));
const hangLenBang = async (s: San) => {
  const id = await hangCoChu(s, "dc1", maMoi(s), soMoi(s));
  await lenBang(s, "dc1", id);
  return id;
};

// ---- AC-2 ----
test("luồng gửi: danh sách khách của đầu khách", async () => {
  const s = await sanMoi(MOT);
  const a = await taoNhuCau(s, "dk1", soMoi(s));
  const b = await taoNhuCau(s, "dk1", soMoi(s));
  const dong = await taoNhuCau(s, "dk1", soMoi(s));
  const r0 = await send("POST", `/api/v1/prospects/${dong}/close`, undefined, ck(s, "dk1"));
  assert.equal(r0.status, 200, await r0.clone().text());
  const c = await taoNhuCau(s, "dk2", soMoi(s));

  const ds1 = await danhSach(s, "dk1");
  assert.equal(ds1.status, 200, ds1.text);
  const v1 = JSON.parse(ds1.text) as Record<string, unknown>[];
  assert.deepEqual(
    v1.map((p) => p.id).sort(),
    [a, b].sort(),
    `đầu khách 1 phải thấy đúng hai nhu cầu mở; thấy ${JSON.stringify(v1.map((p) => p.id))} (đã đóng: ${dong})`,
  );
  const ds2 = await danhSach(s, "dk2");
  assert.deepEqual((JSON.parse(ds2.text) as { id: string }[]).map((p) => p.id), [c], "đầu khách 2");

  for (const p of v1) assert.deepEqual(Object.keys(p), [...PROSPECT_VIEW_KEYS], "khoá của một phần tử");
  for (const k of ["contactId", "contact_id", "phone"]) assert.ok(!ds1.text.includes(`"${k}"`), `thân trả có khoá ${k}`);
  assert.ok(doChinSo("ghi 0900 000 011"), "đối chứng dương: máy dò không bắt chuỗi cài sẵn");
  assert.ok(!doChinSo(ds1.text) && !doChinSo(ds2.text), "thân trả có chín chữ số liền");

  const BANG: [string, string, number][] = [
    ["trưởng nhóm", ck(s, "tn"), 403],
    ["telesales", ck(s, "ts"), 403],
    ["đầu chủ", ck(s, "dc1"), 403],
    ["không cookie", "", 401],
  ];
  assert.equal(BANG.length, 4, "số dòng bảng viết trước");
  for (const [ten, cookie, ma] of BANG) {
    const r = await send("GET", "/api/v1/prospects", undefined, cookie);
    assert.equal(r.status, ma, ten);
  }
});

// ---- AC-3 ----
test("luồng gửi: thân do lõi dựng được API thật nhận", async () => {
  const s = await sanMoi(MOT);
  const pid = await taoNhuCau(s, "dk1", soMoi(s));
  const cua = (await appPool.query<{ owner_member_user_id: string; closed_at: Date | null }>("select owner_member_user_id, closed_at from prospects where id = $1", [pid])).rows[0];
  assert.deepEqual(cua && [cua.owner_member_user_id, cua.closed_at], [s.nguoi.dk1!.userId, null], "nhu cầu mới phải của người gọi, đang mở");

  const h1 = await hangLenBang(s);
  const h2 = await hangLenBang(s);
  for (const [ten, o] of [
    ["khách riêng", { nguoiNhan: "khach_rieng" as const, prospectId: pid, listingIds: [h1, h2] }],
    ["nhóm môi giới", { nguoiNhan: "nhom_moi_gioi" as const, prospectId: null, listingIds: [h2] }],
  ] as const) {
    const t = thanLanGui(o);
    assert.ok(t.ok, `${ten}: thân Lần gửi của lõi sai khuôn`);
    const r = await send("POST", "/api/v1/shares", t.than, ck(s, "dk1"));
    assert.equal(r.status, 201, `${ten}: ${await r.clone().text()}`);
  }

  // Đối chứng âm trong cùng ca: thân của lõi thêm một khoá lạ → 400 nêu khoá.
  const t = thanKhachMoi({ ten: "[Tên]", so: soMoi(s), need: "purchase" });
  assert.ok(t.ok);
  const r = await send("POST", "/api/v1/prospects", { ...t.than, khoaLa: 1 }, ck(s, "dk1"));
  assert.equal(r.status, 400);
  assert.match(await r.text(), /khoaLa/, "400 phải nêu khoá lạ");
});

// ---- AC-7 ----
test("luồng gửi: Lần gửi ghi đúng căn và người nhận", async () => {
  const s = await sanMoi(MOT);
  const pid = await taoNhuCau(s, "dk1", soMoi(s));
  const hang = [await hangLenBang(s), await hangLenBang(s), await hangLenBang(s)];
  const thuTu = [hang[2]!, hang[0]!, hang[1]!];
  const t = thanLanGui({ nguoiNhan: "khach_rieng", prospectId: pid, listingIds: thuTu });
  assert.ok(t.ok);
  const r = await send("POST", "/api/v1/shares", t.than, ck(s, "dk1"));
  assert.equal(r.status, 201, await r.clone().text());

  const gui = (
    await appPool.query<{ id: string; sender_user_id: string; prospect_id: string; created_at: Date | null }>(
      "select id, sender_user_id, prospect_id, created_at from shares where company_id = $1",
      [s.companyId],
    )
  ).rows;
  assert.equal(gui.length, 1, "đúng một dòng shares");
  assert.equal(gui[0]!.sender_user_id, s.nguoi.dk1!.userId, "người gửi");
  assert.equal(gui[0]!.prospect_id, pid, "nhu cầu khách");
  assert.ok(gui[0]!.created_at, "created_at rỗng");
  const can = (
    await appPool.query<{ listing_id: string; position: number }>("select listing_id, position from share_listings where share_id = $1 order by position", [gui[0]!.id])
  ).rows;
  assert.deepEqual(
    can.map((x) => [x.position, x.listing_id]),
    thuTu.map((id, i) => [i, id]),
    "share_listings phải đúng ba dòng theo position 0..2 đúng thứ tự gửi",
  );
});
