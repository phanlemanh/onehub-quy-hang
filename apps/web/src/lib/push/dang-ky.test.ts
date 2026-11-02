// Dải bật thông báo khi lưu đăng ký hỏng (hồ sơ va-thong-bao-lead, E7). Bảng viết trước, mỗi ô một assert.
import assert from "node:assert/strict";
import { test } from "node:test";
import { luu, phanLoai, type DuKienThietBi } from "./dang-ky";

const SUB = { toJSON: () => ({ endpoint: "https://fcm.googleapis.com/fcm/send/x", keys: { p256dh: "p", auth: "a" } }) } as Pick<PushSubscription, "toJSON">;
const traMa = (status: number): typeof fetch => async () => new Response(null, { status });
const tuChoi: typeof fetch = async () => {
  throw new TypeError("Failed to fetch");
};

// (a) Kết quả lưu: true chỉ khi máy chủ trả 2xx.
const LUU: [string, typeof fetch, boolean][] = [
  ["mất mạng (fetch bị từ chối)", tuChoi, false],
  ["500", traMa(500), false],
  ["401", traMa(401), false],
  ["400", traMa(400), false],
  ["201", traMa(201), true],
  ["200", traMa(200), true],
];
for (const [ten, goi, mong] of LUU) test(`AC-7 lưu ${ten} → ${mong}`, async () => assert.equal(await luu(SUB, goi), mong, `ô ${ten}`));

test("AC-7 đối chứng đỏ: hàm lưu giả không bắt lỗi thì ô «mất mạng» ném ra", async () => {
  const luuGia = async (goi: typeof fetch) => (await goi("/x", {})).ok;
  await assert.rejects(luuGia(tuChoi), /Failed to fetch/, "ô mất mạng");
});

// (b) Phân loại thiết bị theo kết quả lưu.
const GOC: DuKienThietBi = { coServiceWorker: true, coPush: true, ios: false, daCai: false, quyen: "granted", daDangKy: true, cauHinh: null };
const PHAN_LOAI: [string, Partial<DuKienThietBi>, ReturnType<typeof phanLoai>][] = [
  ["đã bật, lưu hỏng", { daLuu: false }, "loi-luu"],
  ["đã bật, lưu được", { daLuu: true }, "da-bat"],
  ["đã bật, chưa thử lưu", { daLuu: null }, "da-bat"],
  ["chưa đăng ký, lưu hỏng", { daDangKy: false, daLuu: false }, "chua-bat"],
  ["từ chối quyền, lưu hỏng", { quyen: "denied", daLuu: false }, "tu-choi"],
  ["iPhone chưa cài", { ios: true, daCai: false, daLuu: false }, "ios-chua-cai"],
];
for (const [ten, them, mong] of PHAN_LOAI) test(`AC-7 phân loại ${ten} → ${mong}`, () => assert.equal(phanLoai({ ...GOC, ...them }), mong, `ô ${ten}`));

test("AC-7 đối chứng đỏ: hàm giả bỏ daLuu thì ô «đã bật, lưu hỏng» bị gọi tên", () => {
  const gia = (d: DuKienThietBi) => phanLoai({ ...d, daLuu: null });
  const lech = PHAN_LOAI.filter(([, them, mong]) => gia({ ...GOC, ...them }) !== mong).map(([t]) => t);
  assert.deepEqual(lech, ["đã bật, lưu hỏng"]);
});
