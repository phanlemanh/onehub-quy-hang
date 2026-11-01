// «Sẵn sàng bán» qua bộ đồng bộ tới API thật (hàng 23, E6b): lệnh do nút dựng lên Đang bán đúng một sự kiện; máy chủ từ
// chối (ảnh vừa bị xoá ở máy khác) thì hàng về trạng thái cũ trên máy và «Cần xem» ghi lý do có «ảnh thật».
// Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { kiemSanSang } from "../../../app/(app)/units/ready/san-sang";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { demSuKien, goiCua, H, nguoi, sanMoi, suKienMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

let A: { companyId: string };
let X: Nguoi;

before(async () => {
  A = await sanMoi("ssb");
  X = await nguoi("ssb-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
});

/** Hàng của X đủ giá, điều kiện phí, pháp lý, tình trạng sử dụng, còn «Chưa đủ để rao», có một ảnh thật. */
async function hangDu(): Promise<string> {
  const id = await taoCan(X, false);
  let v = 1;
  for (const [type, payload] of [
    ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
    ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }],
  ] as const) {
    const r = await X.goi("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v++ });
    assert.equal(r.status, 200, `${type}: ${JSON.stringify(r.body)}`);
  }
  await H.themAnhThat(id);
  return id;
}

function boCua() {
  const c = goiCua(X, () => A.companyId);
  return taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(X.userId, new Map()), me: { userId: X.userId, roles: [] }, companyId: A.companyId, nhip: false });
}

test("E6b nút tới API thật: đủ → đúng một sự kiện lên Đang bán; máy chủ từ chối → về trạng thái cũ, Cần xem có «ảnh thật»", async () => {
  const [duId, xoaId] = [await hangDu(), await hangDu()];
  const bd = boCua();
  await bd.khoiDong();
  const tren = (id: string) => bd.danhSach().find((l) => l.id === id)!;

  // Đủ: lệnh nút dựng với một ảnh thật đếm được.
  const n0 = await demSuKien(duId);
  const kq = kiemSanSang(tren(duId), 1);
  assert.ok(kq.lenh, `đủ mà không có lệnh: ${JSON.stringify(kq.thieu)}`);
  await bd.sua(duId, kq.lenh.type, kq.lenh.payload);
  await bd.thuNgay();
  const moi = await suKienMoi(duId, n0);
  assert.deepEqual(moi.map((e) => [e.type, e.payload.to]), [["status_changed", "Active"]], "đúng một sự kiện lên Đang bán");
  assert.equal(tren(duId).standardStatus, "Active");

  // Từ chối: nút đếm được ảnh, rồi ảnh bị xoá ở máy khác trước khi lệnh tới máy chủ.
  const kq2 = kiemSanSang(tren(xoaId), 1);
  assert.ok(kq2.lenh);
  await H.appPool.query("update unit_photos set removed_at = now(), removed_by = 'may-khac' where building_name = (select building_name from listings where id = $1) and unit_number = (select unit_number from listings where id = $1)", [xoaId]);
  const n1 = await demSuKien(xoaId);
  await bd.sua(xoaId, kq2.lenh.type, kq2.lenh.payload);
  await bd.thuNgay();
  assert.equal(await demSuKien(xoaId), n1, "máy chủ không được ghi");
  assert.equal(tren(xoaId).standardStatus, "Incomplete", "hàng trên máy phải về trạng thái cũ");
  const xem = bd.canXem().filter((r) => r.listingId === xoaId);
  assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
  assert.match(xem[0]!.reason ?? "", /ảnh thật/, `lý do nhận được: ${xem[0]!.reason}`);
});
