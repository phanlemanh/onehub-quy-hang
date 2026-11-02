// Mã căn của lead qua API trên Postgres thật (hàng va-ma-can-lead: E2, E3, E4). Lead mang mã rác là dữ liệu ghi trước luật:
// đổi thẳng cột `unit_number` bằng kết nối chủ sau khi nhập. Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { LY_DO_MA_CAN_KHONG_CHU_SO } from "@quy-hang/core/listing";
import { appPool, cleanup } from "./helpers";
import { demLead, dong, hangTuLead, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const VAI = { ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } };

/** Lead đã về đầu chủ dc1: nhập rồi chạy một nhịp. */
async function leadVe(san: San, can: string) {
  const l = await nhap(san, nam(soMoi(san), "Toà A", can));
  await nhip(new Date(), san);
  return l.id;
}

/** Khuôn bản ghi rác thật: đổi cột bằng kết nối chủ, rồi xác nhận mã không so căn được. */
async function thanhMaRac(id: string) {
  await appPool.query("update leads set unit_number = '---' where id = $1", [id]);
  const r = (await appPool.query<{ unit_number: string; k: string | null }>("select unit_number, app.unit_key(unit_number) k from leads where id = $1", [id])).rows[0]!;
  assert.deepEqual([r.unit_number, r.k], ["---", null]);
}

const docHang = async (san: San, id: string) =>
  (await (await send("GET", `/api/v1/listings/${id}`, undefined, san.nguoi.dc1!.cookie)).json()) as { buildingName: string; unitNumber: string | null };

test("nhập lead mã toàn dấu bị từ chối", async () => {
  const s = await sanMoi(VAI);
  const truoc = await demLead(s);
  const r = await send("POST", "/api/v1/leads", nam(soMoi(s), "Toà A", "---"), s.nguoi.ts!.cookie);
  assert.equal(r.status, 400, await r.clone().text());
  const b = (await r.json()) as { error: string; details: { path: string; reason: string }[] };
  assert.equal(b.error, "invalid-payload");
  assert.ok(b.details.some((d) => d.path === "unitNumber" && d.reason === LY_DO_MA_CAN_KHONG_CHU_SO), JSON.stringify(b.details));
  assert.equal(await demLead(s), truoc, "lead mã rác vẫn được ghi");
  // Đối chứng dương: cùng thân, mã có chữ và số.
  await nhap(s, nam(soMoi(s), "Toà A", "A-12.05"));
  assert.equal(await demLead(s), truoc + 1);
});

test("tạo hàng từ lead mã rác", async () => {
  const s = await sanMoi(VAI);
  const rac = await leadVe(s, "A-12.04");
  await thanhMaRac(rac);
  const hang = await hangTuLead(s, "dc1", rac);
  const doc = await docHang(s, hang);
  assert.deepEqual([doc.buildingName, doc.unitNumber], ["Toà A", null]);
  assert.equal((await appPool.query("select lead_id from lead_listings where listing_id = $1", [hang])).rows[0]?.lead_id, rac);
  // Gắn mã sau ở hồ sơ căn.
  const gan = await send("POST", `/api/v1/listings/${hang}/events`, { type: "unit_number_assigned", payload: { unitNumber: "A-12.05" }, expectedVersion: 1 }, s.nguoi.dc1!.cookie);
  assert.equal(gan.status, 200, await gan.clone().text());
  assert.equal((await docHang(s, hang)).unitNumber, "A-12.05");
  // Đối chứng cùng đường: mã hợp lệ đi nguyên.
  const tot = await leadVe(s, "A-12.06");
  assert.equal((await docHang(s, await hangTuLead(s, "dc1", tot))).unitNumber, "A-12.06");
});

test("gửi lại lead mã rác", async () => {
  const s = await sanMoi(VAI);
  const guiLai = async (can: string, rac: boolean) => {
    const cu = await leadVe(s, can);
    if (rac) await thanhMaRac(cu);
    const tra = await send("POST", `/api/v1/leads/${cu}/return`, undefined, s.nguoi.dc1!.cookie);
    assert.equal(tra.status, 200, await tra.clone().text());
    const r = await send("POST", `/api/v1/leads/${cu}/resubmit`, { ownerPhone: soMoi(s) }, s.nguoi.ts!.cookie);
    assert.equal(r.status, 201, await r.clone().text());
    const moi = ((await r.json()) as { id: string }).id;
    assert.equal((await dong(cu)).resubmitted_lead_id, moi);
    return dong(moi);
  };
  const a = await guiLai("A-12.04", true);
  assert.deepEqual([a.building_name, a.unit_number], ["Toà A", null]);
  // Đối chứng cùng đường.
  assert.equal((await guiLai("A-12.07", false)).unit_number, "A-12.07");
});
