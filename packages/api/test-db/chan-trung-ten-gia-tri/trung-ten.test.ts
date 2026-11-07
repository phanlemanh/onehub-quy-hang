// Chặn trùng tên giá trị trên Postgres thật (hàng chan-trung-ten-gia-tri: E2, E2b). Sàn và người dựng qua đường ghi
// thật; kết nối chủ chỉ đọc dòng cấu hình nhãn để chứng nguyên khối. Tên «[Tên]», số `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "../helpers";
import { sanMoi, send, type San } from "../san-thu";

after(cleanup);

const URL_NHAN = "/api/v1/company/labels";
const ghi = (s: San, than: unknown) => send("PUT", URL_NHAN, than, s.nguoi.qt!.cookie);
const dongNhan = async (s: San) =>
  (await appPool.query<{ key: string; value: unknown }>("select key, value from company_settings where company_id = $1 and key like 'labels.%' order by key", [s.companyId])).rows;
async function docBang(s: San) {
  const r = await send("GET", URL_NHAN, undefined, s.nguoi.qt!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { values: { field: string; value: string; label: string }[] };
}
const ten = (b: Awaited<ReturnType<typeof docBang>>, f: string, v: string) => b.values.find((x) => x.field === f && x.value === v)!.label;
const LY_DO = { field: "withdrawnReason", value: "unreachable", label: "Mất liên lạc" };

test("chặn trùng tên: riêng–mặc định anh em bị từ chối nguyên khối, không trùng lưu được", async () => {
  const s = await sanMoi({});
  // Đặt trước một tên hợp lệ để chứng PUT bị từ chối không đổi khoá nào.
  assert.equal((await ghi(s, { fields: [], values: [LY_DO] })).status, 200);
  const truoc = await dongNhan(s);
  const r = await ghi(s, { fields: [{ field: "listPrice", label: "Giá rao" }], values: [LY_DO, { field: "feeInclusion", value: "excluded", label: "bao  PHÍ" }] });
  assert.equal(r.status, 400, "PUT trùng tên mặc định của anh em phải bị từ chối");
  const loi = (await r.json()) as { reason?: string };
  assert.ok(loi.reason?.includes("Trùng tên của «Bao phí»"), `reason: ${loi.reason}`);
  assert.deepEqual(await dongNhan(s), truoc, "PUT bị từ chối đã đổi dòng nhãn");
  // Đối chứng dương: cùng thân với tên không trùng.
  const ok = await ghi(s, { fields: [{ field: "listPrice", label: "Giá rao" }], values: [LY_DO, { field: "feeInclusion", value: "excluded", label: "Phí ngoài" }] });
  assert.equal(ok.status, 200, await ok.clone().text());
  assert.equal(ten(await docBang(s), "feeInclusion", "excluded"), "Phí ngoài");
});

test("chặn trùng tên: đổi chéo và riêng–riêng bị từ chối", async () => {
  const s = await sanMoi({});
  const truoc = await dongNhan(s);
  const cheo = await ghi(s, { fields: [], values: [{ field: "feeInclusion", value: "included", label: "Không bao phí" }, { field: "feeInclusion", value: "excluded", label: "Bao phí" }] });
  assert.equal(cheo.status, 400, "đổi chéo phải bị từ chối (Hỏi-1)");
  assert.ok(((await cheo.json()) as { reason?: string }).reason?.includes("Trùng tên của «"));
  const rr = await ghi(s, { fields: [], values: [LY_DO, { field: "withdrawnReason", value: "owner_changed_mind", label: "Mất liên lạc" }] });
  assert.equal(rr.status, 400, "hai lý do cùng tên phải bị từ chối");
  assert.deepEqual(await dongNhan(s), truoc);
  // Đối chứng: khác tập được trùng chữ.
  const khacTap = await ghi(s, { fields: [], values: [{ field: "withdrawnReason", value: "unreachable", label: "Bao phí" }] });
  assert.equal(khacTap.status, 200, await khacTap.clone().text());
  assert.equal(ten(await docBang(s), "withdrawnReason", "unreachable"), "Bao phí");
});
