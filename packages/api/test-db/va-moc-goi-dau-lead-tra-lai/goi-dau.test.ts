// Vá mốc gọi đầu (hàng va-moc-goi-dau-lead-tra-lai, migration 023) — E1: POST /api/v1/leads/:id/first-call trên năm
// trạng thái lead viết trước, qua API thật trên Postgres. Mốc đọc bằng kết nối chủ. Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup } from "../helpers";
import { dong, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "../san-thu";

after(cleanup);

const goiDau = (san: San, id: string, k: string) => send("POST", `/api/v1/leads/${id}/first-call`, undefined, san.nguoi[k]!.cookie);
const moc = async (id: string) => {
  const d = await dong(id);
  return { accepted: (d.accepted_at as Date | null)?.toISOString() ?? null, called: (d.first_called_at as Date | null)?.toISOString() ?? null };
};
const NGUOI = { ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà B"] } };

/** Lead của dc1: nhập vào Toà A rồi một nhịp chia. */
async function leadDc1(san: San) {
  const l = await nhap(san, nam(soMoi(san), "Toà A"));
  await nhip(new Date(), san);
  assert.equal((await dong(l.id)).matched_agent_user_id, san.nguoi.dc1!.userId, "lead về dc1");
  return l.id;
}

type Ca = { ten: string; dung: (san: San) => Promise<string>; ai: string; status: number; code?: string; ghiMoc: boolean };

// Bảng viết trước: năm trạng thái lead × kết quả gọi first-call.
const BANG: Ca[] = [
  {
    ten: "gọi đầu: lead đã trả lại → 404, mốc không đổi",
    dung: async (s) => {
      const id = await leadDc1(s);
      const r = await send("POST", `/api/v1/leads/${id}/return`, undefined, s.nguoi.dc1!.cookie);
      assert.equal(r.status, 200, await r.clone().text());
      return id;
    },
    ai: "dc1",
    status: 404,
    code: "not-found",
    ghiMoc: false,
  },
  { ten: "gọi đầu: đang giữ chưa nhận → 200, ghi cả nhận", dung: leadDc1, ai: "dc1", status: 200, ghiMoc: true },
  {
    ten: "gọi đầu: đang giữ đã nhận → 200, giữ mốc nhận",
    dung: async (s) => {
      const id = await leadDc1(s);
      assert.equal((await send("POST", `/api/v1/leads/${id}/accept`, undefined, s.nguoi.dc1!.cookie)).status, 200);
      return id;
    },
    ai: "dc1",
    status: 200,
    ghiMoc: true,
  },
  {
    ten: "gọi đầu: đã gọi rồi → 409",
    dung: async (s) => {
      const id = await leadDc1(s);
      assert.equal((await goiDau(s, id, "dc1")).status, 200);
      return id;
    },
    ai: "dc1",
    status: 409,
    code: "already-called",
    ghiMoc: false,
  },
  { ten: "gọi đầu: lead của người khác → 404", dung: leadDc1, ai: "dc2", status: 404, code: "not-found", ghiMoc: false },
];

test("gọi đầu: bảng năm trạng thái đủ", () => assert.equal(BANG.length, 5));

for (const ca of BANG) {
  test(ca.ten, async () => {
    const s = await sanMoi(NGUOI);
    const id = await ca.dung(s);
    const truoc = await moc(id);
    const r = await goiDau(s, id, ca.ai);
    const than = await r.text();
    assert.equal(r.status, ca.status, `${ca.ten}: ${than}`);
    if (ca.code) assert.equal((JSON.parse(than) as { error?: string }).error, ca.code, than);
    const sauGoi = await moc(id);
    if (!ca.ghiMoc) {
      assert.deepEqual(sauGoi, truoc, "mốc nhận và mốc gọi không đổi");
      return;
    }
    assert.ok(sauGoi.called, "có mốc gọi đầu");
    if (truoc.accepted) assert.equal(sauGoi.accepted, truoc.accepted, "giữ mốc nhận cũ");
    else assert.equal(sauGoi.accepted, sauGoi.called, "ghi mốc nhận cùng lúc gọi");
  });
}
