// Số đo thiết bị và mất mạng (hồ sơ ghi-thiet-bi-va-mat-mang) — E8, E9. Sự kiện dựng bằng khuôn ListingEvent thật và qua
// khuôn chặt của lõi; ca «chưa có sự kiện» chạy trên đầu vào rỗng và bộ mẫu hàng 5 như so-do.test.ts.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload, type ListingEvent } from "../listing/events";
import type { DauVaoSoDo, DongSoDo, HangVao, LuotMatMang, MetricCode } from "./kieu";
import { boMau } from "./mau.fixture";
import { tinhSoDo } from "./so-do";

const TU = "2026-11-03T00:00:00Z";
const DEN = "2026-11-17T00:00:00Z";
const TRONG = "2026-11-05T02:00:00.000Z";
const NGOAI = "2026-11-17T00:00:00.000Z"; // đúng den: ngoài kỳ nửa mở
const DANH_MUC = boMau("2026-10-01T01:00:00.000Z").danhMuc;

const dong = (rows: readonly DongSoDo[], ma: MetricCode) => rows.find((r) => r.ma === ma)!;
const tinh = (v: Partial<DauVaoSoDo>) => tinhSoDo({ tu: TU, den: DEN, hang: [], lead: [], danhMuc: DANH_MUC, ...v });

type SuKien = { nguoi: string; vai: string[]; at: string; device?: "desktop" | "mobile" | null; madeOffline?: boolean };
/** Một hàng: sự kiện tạo hàng rồi «Còn / giữ giá» lần lượt, mỗi sự kiện mang người, vai, thiết bị của nó. */
function hang(id: string, ...ds: SuKien[]): HangVao {
  const events: ListingEvent[] = ds.map((d, i) => ({
    seq: i + 1,
    type: i === 0 ? "created" : "owner_confirmed",
    payload: i === 0 ? { buildingName: "Toà A" } : {},
    actorUserId: d.nguoi,
    actorRoles: d.vai,
    confirmedWithOwner: i !== 0,
    occurredAt: d.at,
    ...(d.device !== undefined && { device: d.device }),
    ...(d.madeOffline !== undefined && { madeOffline: d.madeOffline }),
  }));
  for (const e of events) assert.deepEqual(validatePayload(e.type, e.payload), []);
  return { id, events };
}

// ---- E8 · AC-8 ----

test("thiết bị theo vai: đếm từng ô, không rõ để riêng", () => {
  // Ma trận giữ đúng số của E8: 3 điện thoại (2 listing_agent, 1 team_lead), 2 máy tính buyer_agent, 1 không rõ, 1 điện
  // thoại ngoài kỳ. Người hai vai đo ở ma trận phụ dưới — không ghép được vào ma trận chính mà giữ nguyên số của E8.
  const ds = [
    hang("h1", { nguoi: "dau-chu-1", vai: ["listing_agent"], at: TRONG, device: "mobile" }, { nguoi: "dau-chu-1", vai: ["listing_agent"], at: TRONG, device: "mobile" }),
    hang("h2", { nguoi: "truong-nhom-1", vai: ["team_lead"], at: TRONG, device: "mobile" }, { nguoi: "dau-chu-1", vai: ["listing_agent"], at: NGOAI, device: "mobile" }),
    hang("h3", { nguoi: "dau-khach-1", vai: ["buyer_agent"], at: TRONG, device: "desktop" }, { nguoi: "dau-khach-1", vai: ["buyer_agent"], at: TRONG, device: "desktop" }, { nguoi: "dau-khach-1", vai: ["buyer_agent"], at: TRONG }),
  ];
  const r = dong(tinh({ hang: ds }), "actions_by_device_role");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "ti-le");
  assert.deepEqual([r.tu, r.mau], [3, 5]);
  assert.deepEqual(r.chiTiet, { "mobile·listing_agent": 2, "mobile·team_lead": 1, "desktop·buyer_agent": 2, "khong-ro": 1, tong: 6 });
  assert.equal(r.phanTram, 60);

  // Người hai vai: một thao tác đếm vào mỗi vai, tử và mẫu đếm thao tác một lần; không vai vào ô khong-vai.
  const hai = dong(tinh({ hang: [hang("h4", { nguoi: "dau-chu-2", vai: ["listing_agent", "team_lead"], at: TRONG, device: "mobile" }, { nguoi: "may", vai: [], at: TRONG, device: "desktop" })] }), "actions_by_device_role");
  assert.ok(hai.trangThai === "do-duoc" && hai.kieu === "ti-le");
  assert.deepEqual([hai.tu, hai.mau], [1, 2]);
  assert.deepEqual(hai.chiTiet, { "mobile·listing_agent": 1, "mobile·team_lead": 1, "desktop·khong-vai": 1, "khong-ro": 0, tong: 2 });
});

// ---- E9 · AC-9 ----

test("mất mạng điện thoại: lượt trong kỳ và thao tác lúc mất mạng", () => {
  const sau = (phut: number, tu = TRONG) => new Date(Date.parse(tu) + phut * 60_000).toISOString();
  const matMang: LuotMatMang[] = [
    { device: "mobile", startedAt: TRONG, endedAt: sau(10), queuedOps: 2 },
    { device: "mobile", startedAt: sau(60), endedAt: sau(85), queuedOps: 1 },
    { device: "desktop", startedAt: sau(120), endedAt: sau(180), queuedOps: 4 },
    { device: "mobile", startedAt: NGOAI, endedAt: sau(5, NGOAI), queuedOps: 1 },
  ];
  const ds = [
    hang(
      "h1",
      { nguoi: "dau-chu-1", vai: ["listing_agent"], at: TRONG, device: "mobile", madeOffline: true },
      { nguoi: "dau-chu-1", vai: ["listing_agent"], at: sau(5), device: "mobile", madeOffline: true },
      { nguoi: "dau-chu-1", vai: ["listing_agent"], at: sau(70), device: "mobile", madeOffline: true },
      { nguoi: "dau-chu-1", vai: ["listing_agent"], at: sau(130), device: "desktop", madeOffline: true },
      { nguoi: "dau-chu-1", vai: ["listing_agent"], at: sau(200), device: "mobile", madeOffline: false },
    ),
  ];
  const r = dong(tinh({ hang: ds, matMang }), "mobile_offline");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem");
  assert.equal(r.so, 2);
  assert.deepEqual(r.chiTiet, { tongPhut: 35, daiNhatPhut: 25, thaoTacLucMatMang: 3 });
});

const BON_MA_THIEU = ["inquiry_to_send", "sheet_publishes", "customer_link_opens", "customer_interest"];

test("chưa có sự kiện: bốn mã nói rõ thiếu gì", () => {
  const mau = boMau("2026-11-03T01:00:00.000Z");
  for (const rows of [tinh({}), tinh({ hang: mau.hang, lead: mau.lead })]) {
    const thieu = rows.filter((r) => r.trangThai === "chua-co-su-kien");
    assert.deepEqual(thieu.map((r) => r.ma).sort(), [...BON_MA_THIEU].sort());
    for (const r of thieu) {
      assert.ok(r.trangThai === "chua-co-su-kien" && r.thieu.trim().length > 0, `${r.ma}: thiếu câu «thiếu»`);
      for (const k of ["so", "tu", "mau", "trungVi", "n"]) assert.ok(!(k in r), `${r.ma} không được mang số (${k})`);
    }
    for (const ma of ["actions_by_device_role", "mobile_offline"] as const) assert.equal(dong(rows, ma).trangThai, "do-duoc", `${ma} đo được`);
  }
  for (const r of tinh({})) {
    if (BON_MA_THIEU.includes(r.ma)) continue;
    assert.equal(r.trangThai, "do-duoc", `${r.ma} đo được trên đầu vào rỗng`);
    if (r.trangThai !== "do-duoc") continue;
    if (r.kieu === "ti-le") assert.equal(r.mau, 0);
    if (r.kieu === "dem") assert.equal(r.so, 0);
    if (r.kieu === "thoi-luong") assert.equal(r.n, 0);
  }
});
