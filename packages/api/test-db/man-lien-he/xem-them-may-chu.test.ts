// «Xem thêm» phía máy chủ (va-ho-so-lien-he AC-3, lớp backend-effect): danh sách màn tải sau khi đổi loại (không con trỏ)
// trả đủ và chỉ liên hệ của loại mới; con trỏ của loại cũ gửi kèm loại mới làm sót liên hệ — đó là lý do màn không được
// gửi nó. Liên hệ chèn bằng vai chủ với `created_at` định sẵn (như bộ kiểm phân trang của 103); tên «[Tên]».
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "../helpers";
import { sanMoi, send } from "../san-thu";

after(cleanup);

test("liên hệ: xem thêm với con trỏ của loại cũ làm sót liên hệ của loại mới", async () => {
  const s = await sanMoi({ dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const ck = s.nguoi.dc1!.cookie;
  // Thứ tự tạo: 30 Chủ bán cũ → 3 Chủ cho thuê → 30 Chủ bán mới. Danh sách xếp mới trước, trang 50.
  const goc = Date.parse("2026-01-01T00:00:00Z");
  const chen = async (loai: string, phut: number) =>
    (
      await appPool.query<{ id: string }>(
        "insert into contacts (company_id, contact_types, owner_member_user_id, created_by, full_name, created_at) values ($1, $2, $3, 'x', '[Tên]', $4) returning id",
        [s.companyId, `{${loai}}`, s.nguoi.dc1!.userId, new Date(goc + phut * 60_000)],
      )
    ).rows[0]!.id;
  const banCu: string[] = [];
  const thue: string[] = [];
  const banMoi: string[] = [];
  for (let i = 0; i < 30; i++) banCu.push(await chen("Seller", i));
  for (let i = 0; i < 3; i++) thue.push(await chen("Landlord", 100 + i));
  for (let i = 0; i < 30; i++) banMoi.push(await chen("Seller", 200 + i));
  type Trang = { items: { id: string; contactTypes: string[] }[]; nextCursor: string | null };
  const doc = async (q: string): Promise<Trang> => {
    const r = await send("GET", `/api/v1/contacts?${q}`, undefined, ck);
    assert.equal(r.status, 200, `${q}: ${await r.clone().text()}`);
    return (await r.json()) as Trang;
  };

  // Trang đầu Chủ bán: 50 dòng, còn trang (con trỏ c1).
  const ban1 = await doc("type=Seller");
  assert.equal(ban1.items.length, 50, "trang đầu Chủ bán");
  assert.ok(ban1.nextCursor, "Chủ bán phải còn trang");
  // Đối chứng dương: cùng loại, con trỏ c1 → 10 Chủ bán còn lại, không trùng trang đầu, đủ 60.
  const ban2 = await doc(`type=Seller&cursor=${ban1.nextCursor}`);
  const tatCaBan = [...ban1.items, ...ban2.items].map((i) => i.id);
  assert.equal(new Set(tatCaBan).size, 60, "Chủ bán qua hai trang phải đủ 60, không trùng");
  assert.deepEqual(new Set(tatCaBan), new Set([...banCu, ...banMoi]));

  // Màn đổi sang Chủ cho thuê: lượt đọc mới không con trỏ → đủ và chỉ 3 Chủ cho thuê.
  const thueMoi = await doc("type=Landlord");
  assert.deepEqual(new Set(thueMoi.items.map((i) => i.id)), new Set(thue), "danh sách sau khi đổi loại phải đủ Chủ cho thuê");
  for (const i of thueMoi.items) assert.ok(i.contactTypes.includes("Landlord"), `dòng lạc loại ${i.id}`);

  // Con trỏ của Chủ bán gửi kèm Chủ cho thuê (kẽ hở luật cũ của màn): máy chủ lọc đúng loại nhưng bỏ qua mọi liên hệ đứng
  // trước con trỏ — sót cả 3 Chủ cho thuê. Vì vậy màn không được gửi con trỏ của bộ lọc cũ (AC-2, AC-3).
  const lac = await doc(`type=Landlord&cursor=${ban1.nextCursor}`);
  for (const i of lac.items) assert.ok(i.contactTypes.includes("Landlord"), `dòng lạc loại ${i.id}`);
  const sot = thue.filter((id) => !lac.items.some((i) => i.id === id));
  assert.equal(sot.length, 3, "con trỏ của loại cũ phải làm sót Chủ cho thuê — kịch bản không còn là kịch bản lỗi");
});
