// «Sẵn sàng bán» qua bộ đồng bộ tới API thật (hàng 23, E6b): lệnh do nút dựng lên Đang bán đúng một sự kiện; máy chủ từ
// chối (ảnh vừa bị xoá ở máy khác) thì hàng về trạng thái cũ trên máy và «Cần xem» ghi lý do có «ảnh thật».
// Cần DATABASE_URL tới Postgres dãy.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { BO_NHOM_MAC_DINH, chiaNhom } from "@quy-hang/core/today";
import { xetDoiTrangThai } from "../../../app/(app)/inventory/bulk/lo";
import { dungLenhTrangThai } from "../../../app/(app)/inventory/cell-edit/lenh";
import { ghepDanhMuc } from "../../../app/(app)/inventory/ghep-danh-muc";
import { chuCuaO } from "../../../app/(app)/inventory/cot";
import { canHomNay } from "../../../app/(app)/today/ly-do";
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
  // Từ hàng anh-khong-chan-ban mặc định là 0; ca hàng 23 dưới đây chạy trên sàn đặt tối thiểu 1 (luật cũ).
  await datToiThieu(A.companyId, X.userId, 1);
});

const datToiThieu = (companyId: string, userId: string, n: number) =>
  H.appPool.query(
    `insert into company_settings (company_id, key, value, updated_by) values ($1, 'listing.ready_min_real_photos', $2::jsonb, $3)
     on conflict (company_id, key) do update set value = excluded.value`,
    [companyId, JSON.stringify(n), userId],
  );

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

// ——— anh-khong-chan-ban (E3, E6c) ———

/** Sàn riêng chưa đặt số tối thiểu: mặc định 0. Hàng đủ điều kiện khác, KHÔNG ảnh. */
async function sanKhongAnh(ten: string) {
  const B = await sanMoi(ten);
  const Y = await nguoi(`${ten}-y`, [{ companyId: B.companyId, vai: ["listing_agent"] }]);
  const hang = async () => {
    const id = await taoCan(Y, false, B.companyId);
    let v = 1;
    for (const [type, payload] of [
      ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
      ["details_changed", { legalStatus: "pink_book", occupantType: "vacant", furnished: "full", financing: "cash" }],
    ] as const) {
      const r = await Y.goi("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v++ }, B.companyId);
      assert.equal(r.status, 200, `${type}: ${JSON.stringify(r.body)}`);
    }
    return id;
  };
  const c = goiCua(Y, () => B.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(Y.userId, new Map()), me: { userId: Y.userId, roles: [] }, companyId: B.companyId, nhip: false });
  return { B, Y, hang, bd };
}
const trangThaiMayChu = async (id: string) => (await H.appPool.query<{ s: string }>("select standard_status s from listings where id = $1", [id])).rows[0]!.s;

test("ô Trạng thái đưa căn 0 ảnh lên Đang bán (anh-khong-chan-ban E3)", async () => {
  const { B, Y, hang, bd } = await sanKhongAnh("akcb-o");
  const [mot, lo1, lo2] = [await hang(), await hang(), await hang()];
  await bd.khoiDong();
  const tren = (id: string) => bd.danhSach().find((l) => l.id === id)!;
  const kq = dungLenhTrangThai(tren(mot), "Active", {}, true);
  assert.ok(kq.ok && "lenh" in kq, `ô Trạng thái: ${JSON.stringify(kq)}`);
  await bd.sua(mot, kq.lenh.type, kq.lenh.payload);
  await bd.thuNgay();
  assert.equal(tren(mot).standardStatus, "Active", "hàng trên máy Đang bán");
  assert.deepEqual(bd.canXem(), [], "Cần xem rỗng");
  assert.equal(await trangThaiMayChu(mot), "Active", "máy chủ Đang bán");
  // Sửa hàng loạt: hai căn 0 ảnh cùng lên.
  const xet = xetDoiTrangThai([tren(lo1), tren(lo2)], "Active");
  assert.equal(xet.doiDuoc.length, 2, `hàng loạt: ${JSON.stringify(xet.khongDoi)}`);
  for (const h of xet.doiDuoc) {
    const l = dungLenhTrangThai(h, "Active", {}, true);
    assert.ok(l.ok && "lenh" in l);
    await bd.sua(h.id, l.lenh.type, l.lenh.payload);
  }
  // Mỗi lượt gửi một thao tác chờ theo hàng đợi; gửi tới khi hàng đợi rỗng.
  for (let i = 0; i < 3; i++) await bd.thuNgay();
  assert.deepEqual([await trangThaiMayChu(lo1), await trangThaiMayChu(lo2)], ["Active", "Active"], "hàng loạt lên Đang bán");
  assert.deepEqual(bd.canXem(), [], "hàng loạt: Cần xem rỗng");
  // Sàn đặt tối thiểu 1: căn 0 ảnh về Cần xem với «thiếu ảnh thật».
  await datToiThieu(B.companyId, Y.userId, 1);
  const chan = await hang();
  await bd.thuNgay();
  const l2 = dungLenhTrangThai(tren(chan), "Active", {}, true);
  assert.ok(l2.ok && "lenh" in l2);
  await bd.sua(chan, l2.lenh.type, l2.lenh.payload);
  await bd.thuNgay();
  const xem = bd.canXem().filter((r) => r.listingId === chan);
  assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
  assert.match(xem[0]!.reason ?? "", /thiếu ảnh thật/);
  bd.dung();
});

test("số ảnh tới máy qua đồng bộ (anh-khong-chan-ban E6c)", async () => {
  const { Y, hang, bd } = await sanKhongAnh("akcb-sync");
  const id = await hang();
  await bd.khoiDong();
  const tren = () => bd.danhSach().find((l) => l.id === id)!;
  const idx = new Map() as never;
  const nhomCua = () => chiaNhom(BO_NHOM_MAC_DINH, [{ ...canHomNay(tren(), idx), listAgentKey: Y.userId, lastConfirmedAt: new Date().toISOString(), priceChangeTimestamp: new Date().toISOString() }], Y.userId, new Date().toISOString())
    .filter((x) => x.cans.length > 0).map((x) => x.nhom.code);
  assert.equal(tren().photosCount, 0, "kéo về: photosCount 0");
  assert.deepEqual(nhomCua(), ["add_photos"], "vào nhóm Bổ sung ảnh");
  assert.equal(chuCuaO(ghepDanhMuc(tren(), idx), "completeness"), "5/6 · thiếu ảnh thật", "Bảng hàng: 5/6 kèm dấu thiếu ảnh");
  await H.themAnhThat(id);
  await bd.thuNgay();
  assert.equal(tren().photosCount, 1, "kéo lại: photosCount 1");
  assert.deepEqual(nhomCua(), [], "rời nhóm Bổ sung ảnh");
  assert.equal(chuCuaO(ghepDanhMuc(tren(), idx), "completeness"), "6/6", "Bảng hàng: 6/6, hết dấu thiếu ảnh");
  await H.appPool.query(
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
     select gen_random_uuid(), company_id, building_name, unit_number, 'internal', 'image/jpeg', 1000, 10, 10, 'bai-kiem' from listings where id = $1`,
    [id],
  );
  await bd.thuNgay();
  assert.equal(tren().photosCount, 1, "ảnh Nội bộ không cộng");
  bd.dung();
});
