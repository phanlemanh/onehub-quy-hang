// Đổi giá căn Đã bán qua bộ đồng bộ tới API thật (hàng va-doi-gia-can-da-ban, E3): máy chủ từ chối theo luật của lõi →
// lệnh rời hàng đợi vào «Cần xem», hàng trên máy về bản máy chủ. Cần DATABASE_URL tới Postgres dãy.
import { LY_DO_DOI_GIA_DA_BAN } from "@quy-hang/core/listing";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { demSuKien, goiCua, H, nguoi, sanMoi, taoCan, type Nguoi } from "./ha-tang.mjs";

after(H.cleanup);

let A: { companyId: string };
let X: Nguoi;
let Y: Nguoi;

before(async () => {
  A = await sanMoi("dgb");
  X = await nguoi("dgb-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  // Từ 046 chỉ người có Bảng hàng sửa được hàng (bang-quyen-theo-vai): người chốt bán kiêm Đầu khách.
  Y = await nguoi("dgb-y", [{ companyId: A.companyId, vai: ["company_admin", "buyer_agent"] }]);
});

function boCua() {
  const c = goiCua(X, () => A.companyId);
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(X.userId, new Map()), me: { userId: X.userId, roles: [] }, companyId: A.companyId, nhip: false });
  return { bd, c, tren: (id: string) => bd.danhSach().find((l) => l.id === id)! };
}

async function chotBan(n: Nguoi, id: string) {
  const g = await n.goi("GET", `/api/v1/listings/${id}`, undefined, A.companyId);
  const r = await n.goi("POST", `/api/v1/listings/${id}/events`, { type: "status_changed", payload: { to: "Closed", closePrice: 3_400_000_000, closeDate: "2026-10-30" }, expectedVersion: g.body.version }, A.companyId);
  assert.equal(r.status, 200, JSON.stringify(r.body));
}

async function khopMayChu(id: string, tren: { standardStatus: string; listPrice: number | null }) {
  const g = await X.goi("GET", `/api/v1/listings/${id}`, undefined, A.companyId);
  assert.deepEqual([tren.standardStatus, tren.listPrice], [g.body.standardStatus, g.body.listPrice], "hàng trên máy phải bằng bản máy chủ");
}

test("đồng bộ: đổi giá căn Đã bán vào Cần xem", async () => {
  let so = 0;

  // (a) Máy đã mới: cùng người chốt bán trước khi máy kéo.
  {
    const id = await taoCan(X, true, A.companyId);
    await chotBan(X, id);
    const { bd, tren } = boCua();
    await bd.khoiDong();
    const n0 = await demSuKien(id);
    await bd.sua(id, "price_changed", { listPrice: 3_900_000_000, feeInclusion: "included" });
    await bd.thuNgay();
    assert.equal(await demSuKien(id), n0, "máy chủ không được ghi");
    assert.equal(bd.ngan().queue.length, 0, "lệnh rời hàng đợi");
    const xem = bd.canXem().filter((r) => r.listingId === id);
    assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
    assert.deepEqual([xem[0]!.kind, xem[0]!.reason], ["tu-choi", LY_DO_DOI_GIA_DA_BAN]);
    await khopMayChu(id, tren(id));
    so++;
  }

  // (b) Máy cũ: máy kéo lúc còn Đang bán, người khác chốt bán sau đó.
  {
    const id = await taoCan(X, true, A.companyId);
    const { bd, tren } = boCua();
    await bd.khoiDong();
    assert.equal(tren(id).standardStatus, "Active");
    await chotBan(Y, id);
    const n0 = await demSuKien(id);
    await bd.sua(id, "price_changed", { listPrice: 3_900_000_000, feeInclusion: "included" });
    await bd.thuNgay();
    assert.equal(await demSuKien(id), n0, "máy chủ không được ghi");
    assert.equal(bd.ngan().queue.length, 0, "lệnh rời hàng đợi");
    const xem = bd.canXem().filter((r) => r.listingId === id);
    assert.equal(xem.length, 1, `Cần xem: ${JSON.stringify(bd.canXem())}`);
    assert.equal(xem[0]!.kind, "da-ban");
    await khopMayChu(id, tren(id));
    so++;
  }

  // Đối chứng: căn Đang bán đổi giá qua bộ đồng bộ → máy chủ ghi, không vào Cần xem.
  {
    const id = await taoCan(X, true, A.companyId);
    const { bd, tren } = boCua();
    await bd.khoiDong();
    await bd.sua(id, "price_changed", { listPrice: 3_900_000_000, feeInclusion: "included" });
    await bd.thuNgay();
    assert.equal(bd.canXem().filter((r) => r.listingId === id).length, 0);
    const g = await X.goi("GET", `/api/v1/listings/${id}`, undefined, A.companyId);
    assert.equal(g.body.listPrice, 3_900_000_000, "máy chủ ghi giá mới");
    await khopMayChu(id, tren(id));
    so++;
  }

  assert.equal(so, 3, "đủ ba ca");
});
