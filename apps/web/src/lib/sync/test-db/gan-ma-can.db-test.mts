// Gắn mã căn qua bộ đồng bộ tới API thật (hàng dien-ma-can-cho-hang, E6b, ADR-0026): máy chủ nhận → hàng trên máy mang mã;
// từ chối (trùng căn đang mở, gửi khi có mạng lại; hàng đã có mã ở máy khác) → hàng trên máy về bản máy chủ, lệnh rời hàng
// đợi vào «Cần xem» có lý do. Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { demSuKien, goiCua, H, nguoi, sanMoi, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

let A: { companyId: string };
let X: Nguoi;

before(async () => {
  A = await sanMoi("gmc");
  X = await nguoi("gmc-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
});

let dem = 0;
async function tao(toa: string, ma?: string): Promise<string> {
  const r = await X.goi("POST", "/api/v1/listings", ma ? { buildingName: toa, unitNumber: ma } : { buildingName: toa });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  return r.body.id as string;
}

function boCua() {
  const c = goiCua(X, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(X.userId, new Map()), me: { userId: X.userId, roles: [] }, companyId: A.companyId, nhip: false });
  return { bd, c, tren: (id: string) => bd.danhSach().find((l) => l.id === id)! };
}

test("E6b đồng bộ gắn mã căn", async () => {
  let so = 0;

  // 1. Máy chủ nhận → hàng trên máy mang mã, hàng đợi rỗng.
  {
    const id = await tao(`[Toà ${H.RUN} gmc ${++dem}]`);
    const { bd, tren } = boCua();
    await bd.khoiDong();
    await bd.sua(id, "unit_number_assigned", { unitNumber: "A-12.07" });
    await bd.thuNgay();
    assert.equal(tren(id).unitNumber, "A-12.07");
    assert.equal(bd.ngan().queue.length, 0, "hàng đợi phải rỗng");
    assert.equal(bd.canXem().filter((r) => r.listingId === id).length, 0);
    so++;
  }

  // 2. Trùng căn đang mở, gửi khi có mạng lại → về chưa mã, «Cần xem» có lý do nêu trạng thái, mang mã hàng kia.
  {
    const toa = `[Toà ${H.RUN} gmc ${++dem}]`;
    const kia = await tao(toa, "A12.05");
    const id = await tao(toa);
    const { bd, c, tren } = boCua();
    await bd.khoiDong();
    c.matMang(true);
    await bd.sua(id, "unit_number_assigned", { unitNumber: "a12-05" });
    assert.equal(tren(id).unitNumber, "a12-05", "mất mạng: hồ sơ hiện mã ngay theo bản trên máy");
    const n0 = await demSuKien(id);
    c.matMang(false);
    await bd.thuNgay();
    assert.equal(await demSuKien(id), n0, "máy chủ không được ghi");
    assert.equal(tren(id).unitNumber, null, "hàng trên máy phải về chưa mã");
    assert.equal(bd.ngan().queue.length, 0, "lệnh rời hàng đợi");
    const xem = bd.canXem().filter((r) => r.listingId === id);
    assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
    assert.match(xem[0]!.reason ?? "", /^Căn này đã có hàng đang mở \(Chưa đủ để rao\)$/);
    assert.ok(!(xem[0]!.reason ?? "").includes(kia), "lý do không in mã hàng");
    assert.equal(xem[0]!.conflictListingId, kia);
    so++;
  }

  // 3. Hàng đã có mã ở máy khác trong lúc máy này giữ bản chưa mã → giữ mã của máy chủ, «Cần xem» có lý do.
  {
    const id = await tao(`[Toà ${H.RUN} gmc ${++dem}]`);
    const { bd, c, tren } = boCua();
    await bd.khoiDong();
    c.matMang(true);
    await bd.sua(id, "unit_number_assigned", { unitNumber: "A-12.09" });
    const khac = await X.goi("POST", `/api/v1/listings/${id}/events`, { type: "unit_number_assigned", payload: { unitNumber: "A-12.08" }, expectedVersion: 1 });
    assert.equal(khac.status, 200, JSON.stringify(khac.body));
    c.matMang(false);
    await bd.thuNgay();
    assert.equal(tren(id).unitNumber, "A-12.08", "giữ mã của máy chủ");
    const xem = bd.canXem().filter((r) => r.listingId === id);
    assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
    assert.equal(xem[0]!.reason, "Hàng này đã có mã căn");
    so++;
  }

  assert.equal(so, 3, "đủ ba ca của ma trận viết trước");
});
