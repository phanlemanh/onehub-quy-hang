// Gửi có thời hạn (hồ sơ va-thong-bao-lead, E2 và E3): guiCacDong với đồng hồ giả — không chờ thật. Mỗi ô một assert.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { PushPayload } from "@quy-hang/core/push";
import { guiCacDong, type DongCho, type HanGui, type PushResult, type PushSender } from "./gui";

const VAPID = { publicKey: "k", privateKey: "r" };
const PAYLOAD: PushPayload = { title: "Lead mới", body: "[Toà A] · Bán", url: "/today", tag: "lead:x" };
const dong = (id: string, endpoint = `https://fcm.googleapis.com/fcm/send/${id}`): DongCho => ({ id, payload: PAYLOAD, endpoint, p256dh: "p", auth: "a" });

/** Đồng hồ giả: `cho` và bộ gửi chậm dời đồng hồ đi, trả ngay. */
function dongHoGia() {
  let t = 0;
  return { dongHo: () => t, cho: async (ms: number) => void (t += ms), toi: (ms: number) => void (t += ms) };
}
const han = (d: ReturnType<typeof dongHoGia>, timeoutMs: number, budgetMs: number): HanGui => ({ timeoutMs, hanChot: d.dongHo() + budgetMs, dongHo: d.dongHo, cho: d.cho });

/** Bộ gửi giả đếm lần gọi theo địa chỉ; `tra` quyết câu trả lời. */
function boGui(tra: (endpoint: string) => Promise<PushResult>) {
  const goi: string[] = [];
  const sender: PushSender = (t) => {
    goi.push(t.endpoint);
    return tra(t.endpoint);
  };
  return { goi, sender };
}

test("AC-4 (a) dịch vụ đẩy không trả lời → lỗi tạm «quá hạn gửi» sau đúng hạn một lần gửi", { timeout: 2_000 }, async () => {
  const d = dongHoGia();
  const { sender } = boGui(() => new Promise<PushResult>(() => {}));
  const r = await guiCacDong([dong("1")], sender, VAPID, han(d, 5_000, 40_000));
  assert.deepEqual(r.ketQua, [["1", "failed", "quá hạn gửi"]], "ô treo");
  assert.equal(d.dongHo(), 5_000, "hàm trả về sau đúng timeoutMs");
});

test("AC-4 (b) gửi được → sent", async () => {
  const d = dongHoGia();
  const { sender } = boGui(async () => ({ ok: true }));
  assert.deepEqual((await guiCacDong([dong("1")], sender, VAPID, han(d, 5_000, 40_000))).ketQua, [["1", "sent", null]]);
});

test("AC-4 (c) dịch vụ đẩy trả 410 → gone", async () => {
  const d = dongHoGia();
  const { sender } = boGui(async () => ({ ok: false, status: 410, error: "dịch vụ đẩy trả 410" }));
  assert.deepEqual((await guiCacDong([dong("1")], sender, VAPID, han(d, 5_000, 40_000))).ketQua, [["1", "gone", "dịch vụ đẩy trả 410"]]);
});

test("AC-3 (d) địa chỉ không thuộc dịch vụ đẩy đã biết → gone, không gọi bộ gửi", async () => {
  const d = dongHoGia();
  const { goi, sender } = boGui(async () => ({ ok: true }));
  const r = await guiCacDong([dong("la", "https://push.example.test/x"), dong("2")], sender, VAPID, han(d, 5_000, 40_000));
  assert.deepEqual(r.ketQua.map(([id, loai]) => [id, loai]), [["la", "gone"], ["2", "sent"]], "kết quả");
  assert.equal(goi.filter((e) => e === "https://push.example.test/x").length, 0, "bộ gửi gọi tới https://push.example.test/x");
});

/** Ô (e): năm dòng, mỗi lần gửi tốn 3 giây, hạn chót = bắt đầu + 7 giây, một lần gửi tối đa 5 giây. */
async function oE(hamGui: typeof guiCacDong) {
  const d = dongHoGia();
  const { goi, sender } = boGui(async () => (d.toi(3_000), { ok: true }));
  const r = await hamGui(["1", "2", "3", "4", "5"].map((i) => dong(i)), sender, VAPID, han(d, 5_000, 7_000));
  return { r, goi };
}

test("AC-5 (e) hết ngân sách → dừng, dòng chưa gửi không có kết quả", async () => {
  const { r, goi } = await oE(guiCacDong);
  assert.equal(goi.length, 1, "số lần gửi");
  assert.deepEqual(r.ketQua.map(([id]) => id), ["1"], "dòng có kết quả");
  assert.deepEqual(r.chuaGui, ["2", "3", "4", "5"], "chưa gửi");
});

test("AC-5 đối chứng đỏ: hàm giả bỏ hạn chót gửi đủ năm dòng và bị gọi tên ở «chưa gửi»", async () => {
  const boHan: typeof guiCacDong = (dongs, sender, vapid, h) => guiCacDong(dongs, sender, vapid, { ...h, hanChot: Number.POSITIVE_INFINITY });
  const { r, goi } = await oE(boHan);
  assert.equal(goi.length, 5);
  assert.notDeepEqual(r.chuaGui, ["2", "3", "4", "5"], "chưa gửi");
});
