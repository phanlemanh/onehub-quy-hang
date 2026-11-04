// Lượt mở và «Quan tâm» của trang khách (hàng 35: AC-4, AC-5) — fetch giả ghi lời gọi, kho máy giả.
import assert from "node:assert/strict";
import { test } from "node:test";
import { maMay, NHAN_QUAN_TAM, taoBaoMo, taoQuanTam, type Goi, type KhoMay, type TrangThaiQuanTam } from "./su-kien";

const MA = "AbCdEfGhIjKl";
const ghi = (tra: () => Promise<{ ok: boolean; status: number }> = async () => ({ ok: true, status: 201 })) => {
  const loi: { url: string; than: unknown }[] = [];
  const goi: Goi = async (url, init) => {
    loi.push({ url, than: JSON.parse(String(init.body)) });
    return tra();
  };
  return { goi, loi };
};
const khoGia = (): KhoMay & { m: Map<string, string> } => {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
};

test("trang khách: lượt mở gửi một lần sau khi chạy", async () => {
  const kho = khoGia();
  const { goi, loi } = ghi();
  const bao = taoBaoMo({ goi, kho, code: MA });
  await bao();
  await bao();
  assert.equal(loi.length, 1, "hai lần báo trong một phiên chỉ được một lời gọi");
  const may = maMay(kho);
  assert.deepEqual(loi[0], { url: `/api/v1/public/shares/${MA}/events`, than: { type: "link_opened", visitor: may } });
  assert.equal(maMay(kho), may, "mã máy giữ nguyên lần sau");
  // Kho máy ném lỗi (chế độ riêng tư): vẫn gửi với mã tạm, không ném.
  const hong: KhoMay = { getItem: () => { throw new Error("chặn"); }, setItem: () => { throw new Error("chặn"); } };
  const g2 = ghi();
  await taoBaoMo({ goi: g2.goi, kho: hong, code: MA })();
  assert.equal(g2.loi.length, 1);
  assert.match(String((g2.loi[0]!.than as { visitor: string }).visitor), /^[A-Za-z0-9_-]{8,64}$/);
});

test("trang khách: quan tâm một chạm", async () => {
  const kho = khoGia();
  let tt: TrangThaiQuanTam = "chua";
  const { goi, loi } = ghi();
  const bam = taoQuanTam({ goi, kho, code: MA, listingId: "L1", doi: (t) => (tt = t) });
  await bam();
  assert.equal(loi.length, 1);
  assert.deepEqual(loi[0]!.than, { type: "interest", listingId: "L1", visitor: maMay(kho) });
  assert.equal(NHAN_QUAN_TAM[tt], "Đã báo quan tâm");
  await bam();
  assert.equal(loi.length, 1, "chạm lại không gọi thêm");
  // Lỗi mạng → «Chưa gửi được — thử lại», bấm lại được và lần sau gọi lại.
  let lan = 0;
  const g2 = ghi(async () => {
    if (lan++ === 0) throw new TypeError("mất mạng");
    return { ok: true, status: 201 };
  });
  let t2: TrangThaiQuanTam = "chua";
  const bam2 = taoQuanTam({ goi: g2.goi, kho, code: MA, listingId: "L2", doi: (t) => (t2 = t) });
  await bam2();
  assert.equal(NHAN_QUAN_TAM[t2], "Chưa gửi được — thử lại");
  await bam2();
  assert.equal(g2.loi.length, 2, "bấm lại sau lỗi phải gọi lại");
  assert.equal(NHAN_QUAN_TAM[t2], "Đã báo quan tâm");
});
