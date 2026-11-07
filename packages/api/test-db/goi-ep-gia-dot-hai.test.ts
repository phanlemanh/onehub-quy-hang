// Chế độ ép giá qua API trên Postgres thật (hàng 29: AC-3, AC-10): giá đáy trên đường chủ nhà của hàng chỉ tới người thấy
// nguồn, tập khoá của thân trả đóng. Người theo nếp sàn thử của hàng 27; số chủ là số mẫu `0900 000 0xx`, tên `[Tên]`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { cleanup } from "./helpers";
import { hangCoChu, lenBang, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const VAI = {
  ts: { vai: ["telesales"] },
  a: { vai: ["listing_agent"], khu: ["Toà A"] },
  b: { vai: ["listing_agent"], khu: ["Toà B"] },
  tn: { vai: ["team_lead"] },
};
const KHOA_THAY = ["visible", "ownerName", "floorPrice", "hasPhone"];

async function hangCoGiaDay(s: San, can: string, giaDay: number | null) {
  const so = soMoi(s);
  const id = await hangCoChu(s, "a", can, so);
  if (giaDay !== null) {
    const r = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên]", ownerPhone: so, floorPrice: giaDay }, s.nguoi.a!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  }
  // Lên Đang bán để hàng ở nấc «Toàn sàn»: người khác đọc được hàng, chỉ nguồn bị che.
  await lenBang(s, "a", id);
  return id;
}

type Doc = (id: string, cookie: string) => Promise<{ status: number; body: Record<string, unknown> | null }>;
const docQuaApi: Doc = async (id, cookie) => {
  const r = await send("GET", `/api/v1/listings/${id}/owner`, undefined, cookie);
  return { status: r.status, body: (await r.json().catch(() => null)) as Record<string, unknown> | null };
};

/** Ma trận năm người — trả tên ca bộ đọc làm sai. */
async function caSai(doc: Doc, s: San, co: string, chua: string): Promise<{ sai: string[]; dem: number }> {
  const CA: [string, string, string, (r: Awaited<ReturnType<Doc>>) => boolean][] = [
    ["đầu chủ giữ căn", co, s.nguoi.a!.cookie, (r) => r.status === 200 && r.body?.visible === true && r.body.floorPrice === 2_700_000_000],
    ["trưởng nhóm", co, s.nguoi.tn!.cookie, (r) => r.status === 200 && r.body?.floorPrice === 2_700_000_000],
    ["floorPrice lọt", co, s.nguoi.b!.cookie, (r) => r.status === 200 && r.body?.visible === false && !("floorPrice" in r.body)],
    // Từ bảng quyền của hàng (bang-quyen-theo-vai, giám sát duyệt Q-0511-3): Telesales không có Bảng hàng — «không có hàng này».
    ["telesales", co, s.nguoi.ts!.cookie, (r) => !(r.body && "floorPrice" in r.body) && r.status === 404 && r.body?.error === "not-found"],
    ["chưa đăng nhập", co, "", (r) => r.status === 401],
    ["chưa có giá đáy", chua, s.nguoi.a!.cookie, (r) => r.status === 200 && r.body?.visible === true && r.body.floorPrice === null],
  ];
  const sai: string[] = [];
  for (const [ten, id, ck, kiem] of CA) if (!kiem(await doc(id, ck))) sai.push(ten);
  return { sai, dem: CA.length };
}

test("chủ nhà: giá đáy theo người xem", async () => {
  const s = await sanMoi(VAI, 20);
  const co = await hangCoGiaDay(s, "A-15.08", 2_700_000_000);
  const chua = await hangCoGiaDay(s, "A-15.07", null);
  const { sai, dem } = await caSai(docQuaApi, s, co, chua);
  assert.equal(dem, 6);
  assert.deepEqual(sai, []);

  // Đối chứng đỏ: bộ dựng trả trọn dòng chủ nhà cho mọi người (bản sao) — ca đầu chủ khác bị gọi tên.
  const tronDong: Doc = async (id, ck) => {
    const r = await docQuaApi(id, s.nguoi.a!.cookie);
    return ck === "" ? { status: 401, body: null } : r;
  };
  assert.ok((await caSai(tronDong, s, co, chua)).sai.includes("floorPrice lọt"));
});

/** Khoá thừa và khoá thiếu so với tập khai. */
const lechKhoa = (b: Record<string, unknown>) => [...Object.keys(b).filter((k) => !KHOA_THAY.includes(k)), ...KHOA_THAY.filter((k) => !(k in b))];

test("chủ nhà: vai và nguồn", async () => {
  const s = await sanMoi(VAI, 60);
  const id = await hangCoGiaDay(s, "A-14.08", 2_700_000_000);
  const r = await send("GET", `/api/v1/listings/${id}/owner`, undefined, s.nguoi.a!.cookie);
  assert.equal(r.status, 200);
  const b = (await r.json()) as Record<string, unknown>;
  assert.deepEqual(Object.keys(b).sort(), [...KHOA_THAY].sort());
  assert.deepEqual(lechKhoa(b), []);
  for (const k of Object.keys(b)) assert.ok(!/phone$|titleDeed/i.test(k) || k === "hasPhone", k);

  const ho = await send("GET", `/api/v1/listings/${id}`, undefined, s.nguoi.a!.cookie);
  assert.equal(ho.status, 200, await ho.clone().text());
  assert.deepEqual(findSourceLeaks(await ho.json()), []);

  // Đối chứng đỏ: thêm số chủ vào bản sao thân — tập khoá lệch, ca gọi tên khoá thừa.
  assert.deepEqual(lechKhoa({ ...b, ownerPhone: "0900 000 099" }), ["ownerPhone"]);
});
