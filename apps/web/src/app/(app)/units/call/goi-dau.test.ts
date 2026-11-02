// Mốc gọi đầu trong chế độ cuộc gọi (hàng 28, E2b, Hỏi-6). Hàm gọi giả đếm lời POST first-call.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Goi } from "@/lib/sync/types";
import { daCoMocGoiDau, taoMocGoiDau } from "./goi-dau";

const LEAD = "0b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b";

function goiGia(status = 200, body: unknown = { id: LEAD }) {
  let n = 0;
  const f: Goi = async (method, path) => {
    if (method === "POST" && path === `/api/v1/leads/${LEAD}/first-call`) n++;
    await Promise.resolve();
    return { status, body };
  };
  return { f, dem: () => n };
}

type MocGoiDau = typeof taoMocGoiDau;

// [tên, kiểm]. Câu trả lời đầu tiên và phím G cùng gọi `ghiNeuChua`.
const MA_TRAN: [string, (tao: MocGoiDau) => Promise<boolean>][] = [
  [
    "câu trả lời đầu tiên khi chưa mốc",
    async (tao) => {
      const g = goiGia();
      const m = tao(g.f, LEAD, false);
      const kq = await m.ghiNeuChua();
      return kq.ok && kq.daGhi && g.dem() === 1 && m.daCo();
    },
  ],
  [
    "hai câu trả lời liền nhau",
    async (tao) => {
      const g = goiGia();
      const m = tao(g.f, LEAD, false);
      await Promise.all([m.ghiNeuChua(), m.ghiNeuChua()]);
      await m.ghiNeuChua();
      return g.dem() === 1;
    },
  ],
  [
    "first-call thừa",
    async (tao) => {
      const g = goiGia();
      const kq = await tao(g.f, LEAD, daCoMocGoiDau("called")).ghiNeuChua();
      return kq.ok && !kq.daGhi && g.dem() === 0;
    },
  ],
  [
    "phím G khi chưa mốc rồi khi đã mốc",
    async (tao) => {
      const g = goiGia();
      const m = tao(g.f, LEAD, daCoMocGoiDau("accepted"));
      await m.ghiNeuChua();
      await m.ghiNeuChua();
      return g.dem() === 1;
    },
  ],
  [
    "409 giữ nấc, lý do bằng chữ",
    async (tao) => {
      const g = goiGia(409, { error: "already-returned" });
      const m = tao(g.f, LEAD, false);
      const kq = await m.ghiNeuChua();
      return !kq.ok && kq.loi === "Lead đã trả lại rồi." && !m.daCo() && !/already/.test(kq.loi);
    },
  ],
];

async function caSai(tao: MocGoiDau): Promise<string[]> {
  const sai: string[] = [];
  for (const [ten, kiem] of MA_TRAN) if (!(await kiem(tao))) sai.push(ten);
  return sai;
}

test("mốc gọi đầu: ghi đúng một lần", async () => {
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(await caSai(taoMocGoiDau), []);
  assert.deepEqual(["sent", "accepted", "called", "on_board"].map(daCoMocGoiDau), [false, false, true, true]);
});

test("mốc gọi đầu: đối chứng đỏ — bỏ kiểm mốc có sẵn bị gọi tên", async () => {
  const boKiem: MocGoiDau = (goi, id) => taoMocGoiDau(goi, id, false);
  assert.ok((await caSai(boKiem)).includes("first-call thừa"));
});
