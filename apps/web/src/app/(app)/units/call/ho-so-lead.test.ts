// Hồ sơ căn của lead tạo một lần (hàng 28, E9b). Hàm gọi giả ghi lại từng lời gọi.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Goi } from "@/lib/sync/types";
import { taoHoSoLead } from "./ho-so-lead";

const LEAD = "0b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b";
type Tra = { status: number; body: unknown };

/** Hàm gọi giả: trả theo đường, đếm lời gọi; `cho` giữ lời POST tới khi gọi `tha`. */
function goiGia(tra: Record<string, Tra>) {
  const goi: string[] = [];
  let tha: () => void = () => {};
  const cho = new Promise<void>((r) => (tha = r));
  const f: Goi = async (method, path) => {
    goi.push(`${method} ${path}`);
    if (method === "POST") await cho;
    const t = tra[`${method} ${path}`];
    if (!t) throw new Error("mất mạng");
    return t;
  };
  return { f, goi, tha: () => tha(), post: () => goi.filter((g) => g.startsWith("POST")).length };
}

const POST = `POST /api/v1/leads/${LEAD}/listing`;
const GET = `GET /api/v1/leads/assigned/${LEAD}`;
type HoSoLead = typeof taoHoSoLead;

const MA_TRAN: [string, (tao: HoSoLead) => Promise<boolean>][] = [
  [
    "chưa có hồ sơ: POST một lần",
    async (tao) => {
      const g = goiGia({ [POST]: { status: 201, body: { id: "h1" } } });
      g.tha();
      const kq = await tao(g.f, LEAD, null).lay();
      return kq.ok && kq.id === "h1" && g.post() === 1;
    },
  ],
  [
    "POST hai lần",
    async (tao) => {
      const g = goiGia({ [POST]: { status: 201, body: { id: "h1" } } });
      const hs = tao(g.f, LEAD, null);
      const a = hs.lay();
      const b = hs.lay();
      g.tha();
      const [x, y] = await Promise.all([a, b]);
      return x.ok && y.ok && x.id === "h1" && y.id === "h1" && g.post() === 1;
    },
  ],
  [
    "409 đọc lại mã hồ sơ",
    async (tao) => {
      const g = goiGia({ [POST]: { status: 409, body: { error: "lead-has-listing" } }, [GET]: { status: 200, body: { listingId: "h9" } } });
      g.tha();
      const kq = await tao(g.f, LEAD, null).lay();
      return kq.ok && kq.id === "h9" && g.goi.includes(GET);
    },
  ],
  [
    "5xx trả lỗi",
    async (tao) => {
      const g = goiGia({ [POST]: { status: 500, body: null } });
      g.tha();
      const kq = await tao(g.f, LEAD, null).lay();
      return !kq.ok && kq.loi.includes("câu trả lời chưa ghi");
    },
  ],
  [
    "đã có hồ sơ không POST",
    async (tao) => {
      const g = goiGia({});
      const kq = await tao(g.f, LEAD, "h5").lay();
      return kq.ok && kq.id === "h5" && g.goi.length === 0;
    },
  ],
];

async function caSai(tao: HoSoLead): Promise<string[]> {
  const sai: string[] = [];
  for (const [ten, kiem] of MA_TRAN) if (!(await kiem(tao))) sai.push(ten);
  return sai;
}

test("hồ sơ của lead: tạo một lần", async () => {
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(await caSai(taoHoSoLead), []);
});

test("hồ sơ của lead: lỗi rồi thử lại được", async () => {
  let lan = 0;
  const f: Goi = async () => (lan++ === 0 ? { status: 500, body: null } : { status: 201, body: { id: "h2" } });
  const hs = taoHoSoLead(f, LEAD, null);
  assert.equal((await hs.lay()).ok, false);
  assert.deepEqual(await hs.lay(), { ok: true, id: "h2", moi: true });
  assert.equal(hs.id(), "h2");
});

test("hồ sơ của lead: đối chứng đỏ — không giữ lời hứa đang bay bị gọi tên", async () => {
  const khongGiu: HoSoLead = (goi, leadId, listingId) => ({ id: () => listingId, lay: () => taoHoSoLead(goi, leadId, listingId).lay() });
  assert.ok((await caSai(khongGiu)).includes("POST hai lần"));
});
