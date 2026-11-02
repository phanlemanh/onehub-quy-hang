// Kéo về giữ năm trường của Hôm nay đầu chủ (hàng 22, AC-5, E5b): người giữ, mốc đổi giá, mốc đổi trạng thái, hai lần đổi
// cuối — và lưới chặn nguồn vẫn chạy trên toàn thân. Dữ liệu mẫu, không người thật.
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoBoDongBo } from "./dong-bo";
import { keoVe, LoiKeo } from "./keo";
import { taoKhoBoNho } from "./kho";
import { canDangBan, NGAY } from "./mau.test-helpers";
import { nganTrong, type Goi, type ListingView } from "./types";

const ME = { userId: "u-dau-chu-1", roles: ["listing_agent"] };

/** Hai hàng mang đủ năm trường: H1 có người giữ và hai lần đổi, H2 chưa ai giữ, chưa đổi. */
function haiHang(): ListingView[] {
  const h1: ListingView = {
    ...canDangBan("h1", "[Toà A]").view,
    listAgentKey: "u-dau-chu-1",
    priceChangeTimestamp: "2026-10-30T03:00:00.000Z",
    statusChangeTimestamp: "2026-10-31T02:00:00.000Z",
    lastPriceChange: { at: "2026-10-30T03:00:00.000Z", byUserId: "u-truong-nhom", byRoles: ["team_lead"], from: 3_100_000_000, to: 2_950_000_000 },
    lastStatusChange: { at: "2026-10-31T02:00:00.000Z", byUserId: "u-dau-chu-1", byRoles: ["listing_agent"], from: "Incomplete", to: "Active" },
  };
  const h2: ListingView = {
    ...canDangBan("h2", "[Toà B]").view,
    listAgentKey: null,
    priceChangeTimestamp: null,
    statusChangeTimestamp: null,
    lastPriceChange: null,
    lastStatusChange: null,
  };
  return [h1, h2];
}

const NAM_TRUONG = ["listAgentKey", "priceChangeTimestamp", "statusChangeTimestamp", "lastPriceChange", "lastStatusChange"] as const;
const namTruong = (l: ListingView) => Object.fromEntries(NAM_TRUONG.map((k) => [k, l[k]]));

const goiTra =
  (body: unknown): Goi =>
  async (method, path) => {
    if (method === "GET" && path === "/api/v1/listings") return { status: 200, body: structuredClone(body) };
    return { status: 404, body: null };
  };

test("kéo về: giữ trường hàng đợi, chặn khoá nguồn", async () => {
  const ds = haiHang();

  // Chiều xanh: kho sau kéo có đủ năm trường đúng giá trị (so sâu).
  const kho = taoKhoBoNho(ME.userId, new Map());
  const bd = taoBoDongBo({ goi: goiTra(ds), kho, me: ME, companyId: "s", nhip: false });
  await bd.khoiDong();
  const trongKho = (await kho.read("s")).listings;
  assert.ok(trongKho, "kho phải có hàng sau kéo");
  assert.equal(trongKho.length, 2);
  assert.deepEqual(trongKho.map(namTruong), ds.map(namTruong), "năm trường của hàng 22 vào kho nguyên vẹn");
  assert.deepEqual(trongKho, ds, "cả bản xem vào kho nguyên vẹn");

  // Đối chứng dương cùng fixture: một hàng mang khoá ownerPhone → keoVe ném LoiKeo «mang nguồn», kho không đổi.
  const nhiem = haiHang();
  (nhiem[1] as Record<string, unknown>).ownerPhone = "0900 000 012";
  await assert.rejects(
    keoVe(goiTra(nhiem), nganTrong(), NGAY),
    (e: unknown) => e instanceof LoiKeo && e.message.includes("mang nguồn"),
  );
  const truoc = await kho.read("s");
  const bd2 = taoBoDongBo({ goi: goiTra(nhiem), kho, me: ME, companyId: "s", nhip: false });
  await bd2.khoiDong();
  const sau = await kho.read("s");
  assert.deepEqual(sau.listings, truoc.listings, "kho không đổi khi thân mang nguồn");
  assert.equal(sau.lastAttempt, "tu-choi");
});

test("bộ nhóm đã lưu: ngăn trống là null, lưu rồi đọc lại theo sàn", async () => {
  const kho = taoKhoBoNho(ME.userId, new Map());
  const bd = taoBoDongBo({ goi: goiTra([]), kho, me: ME, companyId: "s", nhip: false });
  await bd.khoiDong();
  assert.equal(bd.boNhomDaLuu(), null);
  const bo = { groups: [], source: "company" as const, savedAt: NGAY };
  await bd.luuBoNhom(bo);
  assert.deepEqual(bd.boNhomDaLuu(), bo);
  assert.deepEqual((await kho.read("s")).queueSet, bo);
  assert.equal((await kho.read("s-khac")).queueSet, null, "sàn khác chưa lưu");
  // Lượt kéo sau không xoá bộ đã lưu.
  await bd.thuNgay();
  assert.deepEqual((await kho.read("s")).queueSet, bo);
});
