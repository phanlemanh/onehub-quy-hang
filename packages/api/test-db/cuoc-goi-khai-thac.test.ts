// Chế độ cuộc gọi khai thác qua API trên Postgres thật (hàng 28: AC-1, AC-10): một lead của tôi đọc theo mã, bất kể nhóm
// Hôm nay. Người theo nếp sàn thử của hàng 27; lead qua đường ghi thật. Số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, hangTuLead, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const DUONG = (id: string) => `/api/v1/leads/assigned/${id}`;
const KHOA = ["id", "buildingName", "unitNumber", "need", "priceText", "createdAt", "stage", "acceptedAt", "acceptDueAt", "callDueAt", "listPrice", "feeInclusion", "listingId"];
type Doc = (id: string) => Promise<{ status: number; body: Record<string, unknown> | null }>;

const VAI = {
  ts: { vai: ["telesales"] },
  a: { vai: ["listing_agent"], khu: ["Toà A"] },
  b: { vai: ["listing_agent"], khu: ["Toà B"] },
};

/** Sáu lead của ma trận AC-1: L1 Đã nhận, L2 đã ghi gọi đầu, L3 của B, L4 đã trả lại, L5 có hồ sơ căn, L6 đã bỏ. */
async function dungSauLead(s: San) {
  const ghi = async (id: string, duoi: string) => {
    const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, s.nguoi.a!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  };
  const leadVe = async (toa: string, can?: string) => (await nhap(s, nam(soMoi(s), toa, can))).id;
  const L1 = await leadVe("Toà A", "A-01.01");
  const L2 = await leadVe("Toà A");
  const L3 = await leadVe("Toà B");
  const L4 = await leadVe("Toà A");
  const L5 = await leadVe("Toà A", "A-05.05");
  await nhip(new Date(), s);
  await ghi(L1, "accept");
  await ghi(L2, "first-call");
  await ghi(L4, "return");
  const H5 = await hangTuLead(s, "a", L5);
  // Lead căn trùng về A (A giữ căn đang mở), rồi telesales bỏ.
  await hangCoChu(s, "a", "A-09.09", soMoi(s));
  const L6 = await leadVe("Toà A", "A-09.09");
  const bo = await send("POST", `/api/v1/leads/${L6}/discard`, undefined, s.nguoi.ts!.cookie);
  assert.equal(bo.status, 200, await bo.clone().text());
  return { L1, L2, L3, L4, L5, H5, L6 };
}

type Ca = [ten: string, id: string, kiem: (r: Awaited<ReturnType<Doc>>) => boolean];

/** Ma trận AC-1 — trả tên các ca bộ đọc làm sai. */
async function caSai(doc: Doc, l: Awaited<ReturnType<typeof dungSauLead>>): Promise<{ sai: string[]; dem: number }> {
  const CA: Ca[] = [
    ["lead đã nhận", l.L1, (r) => r.status === 200 && r.body!.stage === "accepted" && r.body!.listingId === null && r.body!.unitNumber === "A-01.01"],
    ["lead đã gọi rời nhóm", l.L2, (r) => r.status === 200 && r.body!.stage === "called"],
    ["lead của người khác", l.L3, (r) => r.status === 404],
    ["lead đã trả lại", l.L4, (r) => r.status === 404],
    ["lead có hồ sơ căn", l.L5, (r) => r.status === 200 && r.body!.listingId === l.H5],
    ["lead đã bỏ", l.L6, (r) => r.status === 404],
  ];
  const sai: string[] = [];
  for (const [ten, id, kiem] of CA) if (!kiem(await doc(id))) sai.push(ten);
  return { sai, dem: CA.length };
}

const docQuaApi =
  (cookie: string): Doc =>
  async (id) => {
    const r = await send("GET", DUONG(id), undefined, cookie);
    return { status: r.status, body: r.status === 200 ? ((await r.json()) as Record<string, unknown>) : null };
  };

test("leads/assigned/{id}: một lead của tôi bất kể nhóm", async () => {
  const s = await sanMoi(VAI, 30);
  const l = await dungSauLead(s);
  const doc = docQuaApi(s.nguoi.a!.cookie);
  const { sai, dem } = await caSai(doc, l);
  assert.equal(dem, 6);
  assert.deepEqual(sai, []);

  const r1 = (await doc(l.L1)).body!;
  const d = (await appPool.query<{ created_at: Date; list_price: string }>("select created_at, list_price from leads where id = $1", [l.L1])).rows[0]!;
  assert.deepEqual(
    [r1.id, r1.buildingName, r1.need, r1.priceText, r1.listPrice, r1.feeInclusion, r1.createdAt],
    [l.L1, "Toà A", "sale", "3,2 tỷ, đã bao phí", Number(d.list_price), "included", d.created_at.toISOString()],
  );
  for (const id of [l.L1, l.L2, l.L5]) {
    const b = (await doc(id)).body!;
    assert.deepEqual(findSourceLeaks(b), []);
    for (const k of Object.keys(b)) assert.ok(!/phone/i.test(k), k);
  }
  // Mã sai khuôn trả 404 như lead không có.
  assert.equal((await doc("khong-phai-ma")).status, 404);

  // Đối chứng đỏ: bộ đọc bỏ điều kiện người giữ lead (đọc thẳng bằng kết nối chủ) — ca lead của người khác bị gọi tên.
  const boDieuKien: Doc = async (id) => {
    const r = (await appPool.query("select id, 'accepted' as stage from leads where id = $1 and company_id = $2", [id, s.companyId])).rows[0];
    return r ? { status: 200, body: r as Record<string, unknown> } : { status: 404, body: null };
  };
  assert.ok((await caSai(boDieuKien, l)).sai.includes("lead của người khác"));
});

/** Khoá của thân trả lệch tập khai: khoá thừa và khoá thiếu. */
const lechKhoa = (b: Record<string, unknown>) => [...Object.keys(b).filter((k) => !KHOA.includes(k)), ...KHOA.filter((k) => !(k in b))];

test("leads/assigned/{id}: vai và nguồn", async () => {
  const s = await sanMoi(VAI, 40);
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  await nhip(new Date(), s);

  // Telesales không vai Đầu chủ, quản trị sàn không vai Đầu chủ: 403; chưa đăng nhập: 401.
  for (const k of ["ts", "qt"]) {
    const r = await send("GET", DUONG(l), undefined, s.nguoi[k]!.cookie);
    assert.deepEqual([k, r.status, ((await r.json()) as { error: string }).error], [k, 403, "listing-agent-required"]);
  }
  assert.equal((await send("GET", DUONG(l))).status, 401);

  const r = await send("GET", DUONG(l), undefined, s.nguoi.a!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const b = (await r.json()) as Record<string, unknown>;
  assert.deepEqual(findSourceLeaks(b), []);
  assert.deepEqual(Object.keys(b), KHOA);
  assert.deepEqual(lechKhoa(b), []);

  // Đối chứng đỏ: bản sao bộ dựng thêm cột số che — tập khoá lệch, ca gọi tên khoá thừa.
  assert.deepEqual(lechKhoa({ ...b, owner_phone_mask: "0900 *** *01" }), ["owner_phone_mask"]);
});
