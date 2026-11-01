// Tải ảnh lên từ mục Ảnh (hàng 18: E1, phần web của E2b). fetch giả đếm lời gọi; vẽ bản nhẹ giả theo cỡ của luật lõi
// (trình duyệt vẽ bằng canvas, ở đây không có canvas). Ảnh là byte viết bằng mã.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { coBanNhe, CHU_CAN_MANG } from "@quy-hang/core/photos";
import { nguonApi } from "./nguon-api";
import { guiLuot, nganChoTha, tepTuLuotDan } from "./tai-len";

const JPEG = (n: number, seed: number) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(n - 4).fill(seed)]) as Uint8Array<ArrayBuffer>;
const tep = (ten: string, b: Uint8Array<ArrayBuffer>) => new File([b], ten, { type: "image/jpeg" });
const bam = async (b: Blob) => createHash("sha256").update(Buffer.from(await b.arrayBuffer())).digest("hex");
const veGia = async () => ({ thumb: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]), width: 2000, height: 1500 });

function fetchGia() {
  const goi: { url: string; method: string; body: FormData | null }[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    // Bản Postgres: xin link tải lên trả «không tải thẳng» (va-anh-ban-that) — chỉ đếm lời gọi thêm ảnh.
    if (String(url).endsWith("/upload-url")) return new Response(JSON.stringify({ truc_tiep: false }), { status: 200 });
    goi.push({ url: String(url), method: init?.method ?? "GET", body: (init?.body as FormData) ?? null });
    return new Response("{}", { status: 201 });
  }) as typeof fetch;
  return { f, goi };
}

test("E1 tải ảnh lên: ba tệp ba lời gọi, đúng byte gốc, toà, mã, ngăn; thả lên Nội bộ; dán; bản nhẹ ≤ 480", async () => {
  const { f, goi } = fetchGia();
  const nguon = nguonApi("[Toà mẫu]", "A-06.01", f);
  const files = [tep("a.jpg", JPEG(500, 1)), tep("b.jpg", JPEG(501, 2)), tep("c.jpg", JPEG(502, 3))];
  const kq = await guiLuot(files, (t) => nguon.them(t, "shareable"), { onLine: true, ve: veGia });
  assert.deepEqual(kq.map((k) => k.loi), [null, null, null]);
  assert.equal(goi.length, 3, "ba tệp phải là ba lời gọi POST");
  for (const [i, g] of goi.entries()) {
    assert.deepEqual([g.method, g.url], ["POST", "/api/v1/units/photos"]);
    assert.equal(await bam(g.body!.get("original") as Blob), await bam(files[i]!), `tệp ${i}: byte gốc đổi`);
    assert.deepEqual([g.body!.get("toa"), g.body!.get("ma"), g.body!.get("compartment")], ["[Toà mẫu]", "A-06.01", "shareable"]);
    assert.ok(g.body!.get("thumb") instanceof Blob);
  }
  // Thả lên tên thẻ: ngăn do nganChoTha quyết (cùng hàm mục Ảnh gọi), rồi gửi đi.
  const nganTha = nganChoTha({ theDich: "internal", theDangMo: "shareable", thayNoiBo: true });
  assert.equal(nganTha, "internal", "thả lên thẻ Nội bộ không vào ngăn nội bộ");
  await guiLuot([tep("so.jpg", JPEG(300, 4))], (t) => nguon.them(t, nganTha!), { onLine: true, ve: veGia });
  assert.equal(goi.at(-1)!.body!.get("compartment"), "internal");
  assert.equal(nganChoTha({ theDich: null, theDangMo: "internal", thayNoiBo: true }), "internal", "thả vào thân mục khi đang mở Nội bộ");
  assert.equal(nganChoTha({ theDich: null, theDangMo: "shareable", thayNoiBo: true }), "shareable");
  assert.equal(nganChoTha({ theDich: "internal", theDangMo: "shareable", thayNoiBo: false }), null, "người không thấy nội bộ thả được vào Nội bộ");
  assert.equal(nganChoTha({ theDich: "catalog", theDangMo: "shareable", thayNoiBo: true }), null, "thẻ Tự có từ mã nhận ảnh");
  const muc = (kind: string, file: File | null) => ({ kind, getAsFile: () => file }) as unknown as DataTransferItem;
  const dan = [muc("file", tep("d1.jpg", JPEG(10, 5))), muc("string", null), muc("file", tep("d2.jpg", JPEG(10, 6)))];
  assert.equal(tepTuLuotDan(dan, null).length, 2, "dán hai mục ảnh một mục chữ");
  assert.equal(tepTuLuotDan(dan, { tagName: "INPUT" } as Element).length, 0, "dán khi đang gõ trong ô nhập vẫn lấy ảnh");
  assert.deepEqual(coBanNhe(2000, 1500), { w: 480, h: 360 });
  assert.deepEqual(coBanNhe(300, 200), { w: 300, h: 200 });
});

/** Gắn bộ đếm vào mọi chỗ trình duyệt lưu trên máy (IndexedDB, localStorage, Cache Storage) trong lúc chạy fn. */
async function demChamBoNho(fn: () => Promise<unknown>): Promise<number> {
  const g = globalThis as Record<string, unknown>;
  const cu = { indexedDB: g.indexedDB, localStorage: g.localStorage, caches: g.caches };
  let n = 0;
  const bay = () => new Proxy({}, { get: () => { n++; return () => ({}); } });
  Object.assign(g, { indexedDB: bay(), localStorage: bay(), caches: bay() });
  try {
    await fn();
  } finally {
    Object.assign(g, cu);
  }
  return n;
}

test("E2b phía web: một tệp hỏng trong lượt ba tệp → hai lời gọi; mất mạng → không gọi, không chạm bộ nhớ máy", async () => {
  const { f, goi } = fetchGia();
  const nguon = nguonApi("[Toà mẫu]", "A-06.01", f);
  const files = [tep("a.jpg", JPEG(500, 1)), new File(["day khong phai anh"], "tin-nhan.jpg", { type: "image/jpeg" }), tep("c.jpg", JPEG(502, 3))];
  const kq = await guiLuot(files, (t) => nguon.them(t, "shareable"), { onLine: true, ve: veGia });
  assert.deepEqual(kq, [{ ten: "a.jpg", loi: null }, { ten: "tin-nhan.jpg", loi: "Không phải ảnh" }, { ten: "c.jpg", loi: null }]);
  assert.equal(goi.length, 2);
  const truoc = goi.length;
  let kq2: Awaited<ReturnType<typeof guiLuot>> = [];
  const cham = await demChamBoNho(async () => {
    kq2 = await guiLuot(files, (t) => nguon.them(t, "shareable"), { onLine: false, ve: veGia });
  });
  assert.deepEqual(kq2.map((k) => k.loi), [CHU_CAN_MANG, CHU_CAN_MANG, CHU_CAN_MANG]);
  assert.equal(goi.length, truoc, "mất mạng mà vẫn gọi API");
  assert.equal(cham, 0, `mất mạng mà chạm bộ nhớ máy ${cham} lần`);
  assert.equal(await demChamBoNho(async () => void (globalThis as { indexedDB?: { open(n: string): unknown } }).indexedDB!.open("x")), 1, "đối chứng dương: bộ đếm không bắt được một lần mở IndexedDB");
});
