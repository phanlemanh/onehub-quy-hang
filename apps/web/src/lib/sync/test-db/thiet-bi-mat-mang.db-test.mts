// Điện thoại mất mạng, sửa giá, có mạng lại — bộ đồng bộ trên máy nói với API thật trên Postgres dãy (hàng
// ghi-thiet-bi-va-mat-mang: AC-10, E10). Đọc lại bằng kết nối chủ để thấy đúng điều cơ sở dữ liệu giữ.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { taoBoDongBo } from "../dong-bo";
import { taoKhoBoNho } from "../kho";
import { thietBi } from "../thiet-bi";
import type { Goi } from "../types";
import { app, H, nguoi, sanMoi, taoCan } from "./ha-tang.mjs";

after(H.cleanup);

/** Hàm gọi như `goiFetch` của trình duyệt: cookie phiên + sàn, đầu thiết bị đọc từ màn hình giả; công tắc mất mạng. */
function goiDienThoai(cookie: string, man: { rong: number; cao: number }) {
  let matMang = false;
  const goi: Goi = async (method, path, body) => {
    if (matMang) throw new Error("mất mạng");
    const r = await app.request(`${H.BASE_URL}${path}`, {
      method,
      headers: { "content-type": "application/json", origin: H.BASE_URL, cookie, "x-quy-hang-device": thietBi(man.rong, man.cao) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: r.status, body: await r.json().catch(() => null) };
  };
  return { goi, matMang: (v: boolean) => void (matMang = v) };
}

test("điện thoại mất mạng: sự kiện và lượt về cơ sở dữ liệu", async () => {
  const s = await sanMoi("tbmm");
  const n = await nguoi("tbmm", [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const id = await taoCan(n, false, s.companyId);
  const truoc = (await H.appPool.query<{ n: number }>("select max(seq)::int n from listing_events where listing_id = $1", [id])).rows[0]!.n;

  const c = goiDienThoai(n.cookie(s.companyId), { rong: 390, cao: 844 });
  const bd = taoBoDongBo({ goi: c.goi, kho: taoKhoBoNho(n.userId, new Map()), me: { userId: n.userId, roles: ["listing_agent"] }, companyId: s.companyId, nhip: false, thietBi: () => thietBi(390, 844) });
  await bd.khoiDong();

  c.matMang(true);
  await bd.thuNgay(); // lượt thử ném lỗi mạng: mở lượt
  await bd.sua(id, "price_changed", { listPrice: 3_100_000_000, feeInclusion: "included" });
  c.matMang(false);
  await bd.thuNgay(); // có mạng: gửi thao tác, khép và gửi lượt
  assert.equal(bd.ngan().queue.length, 0, "hàng đợi đã gửi hết");

  const moi = (
    await H.appPool.query<{ type: string; device: string | null; made_offline: boolean }>(
      "select type, device, made_offline from listing_events where listing_id = $1 and seq > $2 order by seq",
      [id, truoc],
    )
  ).rows;
  assert.deepEqual(moi, [{ type: "price_changed", device: "mobile", made_offline: true }], `sự kiện mới: ${JSON.stringify(moi)}`);

  const luot = (
    await H.appPool.query<{ device: string; queued_ops: number }>("select device, queued_ops from offline_sessions where user_id = $1", [n.userId])
  ).rows;
  assert.deepEqual(luot, [{ device: "mobile", queued_ops: 1 }], `lượt mất mạng: ${JSON.stringify(luot)}`);
});
