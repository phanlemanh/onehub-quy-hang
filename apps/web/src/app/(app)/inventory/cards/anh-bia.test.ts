// Ảnh bìa của thẻ (hàng 32) — E5. fetch giả đếm lời gọi; ảnh dựng theo khuôn UnitPhoto của lõi, kết quả so với chính
// anhRaNgoai của lõi trên cùng dữ liệu.
import assert from "node:assert/strict";
import { test } from "node:test";
import { anhRaNgoai, type UnitPhoto } from "@quy-hang/core/photos";
import { taoNguonAnhBia } from "./anh-bia";

const P = (o: Partial<UnitPhoto>): UnitPhoto => ({
  id: "x",
  buildingName: "[Toà mẫu]",
  unitNumber: "A-01.01",
  compartment: "shareable",
  displayOrder: 0,
  isCover: false,
  isSample: false,
  takenAt: null,
  addedAt: "2026-11-01T03:00:00Z",
  contentType: "image/jpeg",
  width: 10,
  height: 10,
  ...o,
});

function fetchGia(tra: (url: string) => Response | Promise<Response>) {
  const goi: string[] = [];
  const f = (async (u: RequestInfo | URL) => {
    goi.push(String(u));
    return tra(String(u));
  }) as typeof fetch;
  return { f, goi };
}
const json = (anh: UnitPhoto[]) => new Response(JSON.stringify({ anh, noiBo: "an", suaDuoc: false }), { status: 200 });

const BA_GUI = [P({ id: "g0", displayOrder: 0 }), P({ id: "g1", displayOrder: 1, isCover: true }), P({ id: "g2", displayOrder: 2 })];
const CHI_NOI_BO = [P({ id: "nb0", compartment: "internal" }), P({ id: "nb1", compartment: "internal", displayOrder: 1, isCover: true })];

test("ảnh bìa (a): ba ảnh Gửi được, ảnh thứ hai là bìa → bản nhỏ của ảnh bìa", async () => {
  const { f, goi } = fetchGia(() => json(BA_GUI));
  assert.equal(await taoNguonAnhBia(f).anhBia("Toà A", "A-01.01"), "/api/v1/units/photos/g1/thumb");
  assert.equal(anhRaNgoai(BA_GUI)[0]?.id, "g1", "khớp anhRaNgoai của lõi");
  assert.match(goi[0]!, /\/api\/v1\/units\/photos\?toa=To%C3%A0\+A&ma=A-01\.01$/);
});

test("ảnh bìa (b): chưa chọn bìa → ảnh Gửi được đầu theo thứ tự", async () => {
  const ds = [P({ id: "g2", displayOrder: 2 }), P({ id: "g0", displayOrder: 0 }), P({ id: "nb", compartment: "internal", displayOrder: -1 })];
  const { f } = fetchGia(() => json(ds));
  assert.equal(await taoNguonAnhBia(f).anhBia("Toà A", "A-01.01"), "/api/v1/units/photos/g0/thumb");
  assert.equal(anhRaNgoai(ds)[0]?.id, "g0");
});

test("ảnh bìa (c): chỉ ảnh Nội bộ (kể cả Nội bộ là bìa) → null", async () => {
  const { f } = fetchGia(() => json(CHI_NOI_BO));
  assert.equal(await taoNguonAnhBia(f).anhBia("Toà A", "A-01.01"), null, "Nội bộ không bao giờ là ảnh bìa");
});

test("ảnh bìa (d): không ảnh → null", async () => {
  const { f } = fetchGia(() => json([]));
  assert.equal(await taoNguonAnhBia(f).anhBia("Toà A", "A-01.01"), null);
});

test("ảnh bìa (e): căn chưa mã căn → null, không gọi API", async () => {
  const { f, goi } = fetchGia(() => json(BA_GUI));
  assert.equal(await taoNguonAnhBia(f).anhBia("Toà A", null), null);
  assert.equal(goi.length, 0);
});

test("ảnh bìa (f): mất mạng hay 401 → null, không ném", async () => {
  const nem = fetchGia(() => {
    throw new TypeError("Failed to fetch");
  });
  assert.equal(await taoNguonAnhBia(nem.f).anhBia("Toà A", "A-01.01"), null);
  const k401 = fetchGia(() => new Response("{}", { status: 401 }));
  assert.equal(await taoNguonAnhBia(k401.f).anhBia("Toà A", "A-01.01"), null);
});

test("ảnh bìa (g): cùng toà + mã gọi hai lần → API một lần", async () => {
  const { f, goi } = fetchGia(() => json(BA_GUI));
  const n = taoNguonAnhBia(f);
  await n.anhBia("Toà A", "A-01.01");
  await n.anhBia("Toà A", "A-01.01");
  assert.equal(goi.length, 1);
});

test("ảnh bìa — đối chứng đỏ: bản bỏ lọc ngăn trượt ca (c)", async () => {
  const { f } = fetchGia(() => json(CHI_NOI_BO));
  const sai = taoNguonAnhBia(f, { chon: (ds) => ds });
  await assert.rejects(async () => assert.equal(await sai.anhBia("Toà A", "A-01.01"), null, "Nội bộ không bao giờ là ảnh bìa"), /Nội bộ/);
});
