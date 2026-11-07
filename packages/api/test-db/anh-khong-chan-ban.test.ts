// Thiếu ảnh không chặn bán qua API trên Postgres thật (hàng anh-khong-chan-ban: E2, E4, E8, E9c). Sàn dựng bằng bộ thử
// chung (`san-thu.ts`); ảnh thêm thẳng bảng `unit_photos` bằng kết nối chủ như `themAnhThat`. Tên `[Tên]`, số `0900 000 0xx`.
import { thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../src/errors";
import { PUBLIC_BASE } from "../src/public/routes";
import { appPool, cleanup, mail } from "./helpers";
import { hangCoChu, login, maMoi, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const VAI = { dc: { vai: ["listing_agent"] }, dk: { vai: ["buyer_agent"] } };
const KHOA = "listing.ready_min_real_photos";

/** Hàng đủ giá kèm điều kiện phí, pháp lý, tình trạng sử dụng — chưa ảnh, chưa đổi trạng thái. */
async function hangDu(s: San): Promise<string> {
  const id = await hangCoChu(s, "dc", maMoi(s), soMoi(s));
  for (const body of [
    { type: "price_changed", payload: { listPrice: 3_200_000_000, feeInclusion: "included" } },
    { type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" } },
  ]) assert.equal((await lenh(s, id, body)).status, 200);
  return id;
}
async function lenh(s: San, id: string, body: object, ai = "dc") {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  return send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, s.nguoi[ai]!.cookie);
}
const lenDangBan = (s: San, id: string, madeOffline?: boolean) => lenh(s, id, { type: "status_changed", payload: { to: "Active" }, ...(madeOffline !== undefined && { madeOffline }) });
/** Ảnh vào căn của hàng: ngăn, mẫu, đã gỡ. */
async function anh(id: string, { ngan = "shareable", mau = false, go = false } = {}) {
  await appPool.query(
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by, is_sample, removed_at, removed_by)
     select gen_random_uuid(), company_id, building_name, unit_number, $2, 'image/jpeg', 1000, 10, 10, 'bai-kiem', $3, $4, $5
     from listings where id = $1`,
    [id, ngan, mau, go ? new Date() : null, go ? "bai-kiem" : null],
  );
}
const trangThai = async (id: string) => (await appPool.query<{ s: string }>("select standard_status s from listings where id = $1", [id])).rows[0]!.s;
const lenActive = async (id: string) =>
  (await appPool.query("select 1 from listing_events where listing_id = $1 and type = 'status_changed' and payload ->> 'to' = 'Active'", [id])).rowCount;
const datToiThieu = (s: San, n: number) =>
  appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, $2, $3::jsonb, $4)
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, KHOA, JSON.stringify(n), s.nguoi.dc!.userId],
  );

test("ba cửa nhận căn 0 ảnh (anh-khong-chan-ban E2)", async () => {
  const s = await sanMoi(VAI);
  const cua: [string, (id: string) => Promise<Response>][] = [
    ["(a) nút Sẵn sàng bán", (id) => lenDangBan(s, id)],
    ["(b) ô Trạng thái, có mạng", (id) => lenDangBan(s, id, false)],
    ["(b) ô Trạng thái, ghi lúc mất mạng", (id) => lenDangBan(s, id, true)],
  ];
  const ids: string[] = [];
  for (const [ten, goi] of cua) {
    const id = await hangDu(s);
    const r = await goi(id);
    assert.equal(r.status, 200, `${ten}: ${await r.clone().text()}`);
    assert.equal(await trangThai(id), "Active", `${ten}: trạng thái`);
    assert.equal(await lenActive(id), 1, `${ten}: đúng một sự kiện lên Đang bán`);
    ids.push(id);
  }
  const ds = (await (await send("GET", "/api/v1/listings", undefined, s.nguoi.dk!.cookie)).json()) as { id: string }[];
  assert.equal(ds.filter((h) => ids.includes(h.id)).length, 3, "đầu khách thấy cả ba căn 0 ảnh");
});

test("tối thiểu 2 thì luật cũ; sàn đã lưu dòng từ trước giữ số ấy; sàn chỉ có khoá khác theo mặc định 0 (E2, Hỏi-6)", async () => {
  const s = await sanMoi(VAI);
  await datToiThieu(s, 2);
  const id = await hangDu(s);
  await anh(id);
  for (const [ten, mat] of [["(a)", undefined], ["(b)", true]] as const) {
    const r = await lenDangBan(s, id, mat);
    assert.deepEqual([r.status, await r.json()], [400, { error: API_ERRORS.missingRequirement.code, missing: ["realPhoto"] }], `${ten} tối thiểu 2, có 1`);
  }
  // Sàn đã lưu dòng 1 trước hàng này (chèn thẳng như lối lưu cũ): căn 0 ảnh vẫn bị từ chối.
  const cu = await sanMoi(VAI);
  await datToiThieu(cu, 1);
  const r1 = await lenDangBan(cu, await hangDu(cu));
  assert.deepEqual([r1.status, await r1.json()], [400, { error: API_ERRORS.missingRequirement.code, missing: ["realPhoto"] }], "sàn đã lưu 1");
  // Sàn có dòng cấu hình khác mà vắng khoá này: theo mặc định mới 0 (Hỏi-6, chủ kho duyệt khuyến nghị 07/11).
  const khac = await sanMoi(VAI);
  await appPool.query("insert into company_settings (company_id, key, value, updated_by) values ($1, 'customer_page.show_confirmed_age', 'true'::jsonb, $2)", [khac.companyId, khac.nguoi.dc!.userId]);
  const r2 = await lenDangBan(khac, await hangDu(khac));
  assert.equal(r2.status, 200, `sàn vắng khoá: ${await r2.clone().text()}`);
});

test("photosCount và mục ảnh của mức đủ (E4)", async () => {
  const s = await sanMoi(VAI);
  const id = await hangDu(s);
  await anh(id);
  await anh(id);
  await anh(id, { ngan: "internal" });
  await anh(id, { mau: true });
  await anh(id, { go: true });
  const khong = await hangDu(s);
  type View = { id: string; photosCount: number; completeness: { total: number; missing: string[] } };
  const ds = (await (await send("GET", "/api/v1/listings", undefined, s.nguoi.dc!.cookie)).json()) as View[];
  const mot = (await (await send("GET", `/api/v1/listings/${id}`, undefined, s.nguoi.dc!.cookie)).json()) as View & Record<string, unknown>;
  const trongDs = ds.find((h) => h.id === id)!;
  assert.equal(trongDs.photosCount, 2, "danh sách: chỉ ảnh Gửi được, không mẫu, chưa gỡ");
  assert.equal(mot.photosCount, 2, "một hàng: cùng số");
  assert.equal(mot.completeness.total, 6, "mức đủ có mục ảnh");
  assert.ok(!mot.completeness.missing.includes("photos"), "có ảnh thì mục ảnh đủ");
  const k = ds.find((h) => h.id === khong)!;
  assert.equal(k.photosCount, 0);
  assert.ok(k.completeness.missing.includes("photos"), "0 ảnh: thiếu mục ảnh");
  // Cùng số với bước xét Đang bán: tối thiểu 2 → căn 2 ảnh lên, căn 1 ảnh (chỉ một Gửi được) bị từ chối.
  await datToiThieu(s, 2);
  assert.equal((await lenDangBan(s, id)).status, 200, "photosCount 2, tối thiểu 2");
  const motAnh = await hangDu(s);
  await anh(motAnh);
  await anh(motAnh, { ngan: "internal" });
  assert.equal((await lenDangBan(s, motAnh)).status, 400, "photosCount 1, tối thiểu 2");
  // Bản xem không thêm trường nguồn.
  for (const khoa of ["ownerName", "ownerPhone", "floorPrice", "owner_phone_hash"]) assert.ok(!(khoa in mot), `bản xem có trường nguồn ${khoa}`);
});

test("số ảnh tối thiểu qua lối chung (E8)", async () => {
  const s = await sanMoi(VAI);
  const r0 = await send("GET", "/api/v1/company/settings", undefined, s.nguoi.qt!.cookie);
  const v0 = (await r0.json()) as { items: { key: string; value: unknown }[] };
  assert.equal(v0.items.find((x) => x.key === KHOA)?.value, 0, "sàn mới đọc 0");
  const vao = (n: unknown, ai = "qt") => send("PATCH", "/api/v1/company/settings", { [KHOA]: n }, s.nguoi[ai]!.cookie);
  assert.equal((await vao(0)).status, 200, "0 hợp lệ");
  assert.equal((await vao(20)).status, 200, "20 hợp lệ");
  for (const sai of [21, -1]) {
    const r = await vao(sai);
    assert.equal(r.status, 400, `${sai} phải bị từ chối`);
    assert.match(await r.text(), /0.{0,3}20/, `${sai}: lý do nêu khoảng 0–20`);
  }
  assert.equal((await vao(2, "dc")).status, 403, "đầu chủ không đổi được");
});

test("gửi căn 0 ảnh (E9c)", async () => {
  const s = await sanMoi(VAI);
  const khong = await hangDu(s);
  const co = await hangDu(s);
  await anh(co);
  for (const id of [khong, co]) assert.equal((await lenDangBan(s, id)).status, 200);
  const t = thanLanGui({ nguoiNhan: "nhom_moi_gioi", prospectId: null, listingIds: [khong, co] });
  assert.ok(t.ok, "thân Lần gửi của lõi");
  const r = await send("POST", "/api/v1/shares", t.than, s.nguoi.dk!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const { code } = (await r.json()) as { code: string };
  const trang = await send("GET", `${PUBLIC_BASE}/${code}`);
  assert.equal(trang.status, 200);
  const chu = await trang.text();
  const ds = (JSON.parse(chu) as { can: { photos?: unknown[] }[] }).can;
  assert.equal(ds.length, 2, `trang khách có hai căn: ${chu.slice(0, 200)}`);
  const rong = ds.filter((h) => (h.photos ?? []).length === 0);
  assert.equal(rong.length, 1, "đúng một căn danh sách ảnh rỗng");
  assert.equal(ds.filter((h) => (h.photos ?? []).length === 1).length, 1, "căn có ảnh trả đúng một ảnh");
});

void mail;
void login;
