// Tải ảnh lên từ mục Ảnh (hàng 18: E1, phần web của E2b). fetch giả đếm lời gọi; vẽ bản nhẹ giả theo cỡ của luật lõi
// (trình duyệt vẽ bằng canvas, ở đây không có canvas). Ảnh là byte viết bằng mã.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { coBanNhe, CHU_CAN_MANG } from "@quy-hang/core/photos";
import { nguonApi } from "./nguon-api";
import { guiLuot, tepTuLuotDan } from "./tai-len";

const JPEG = (n: number, seed: number) => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(n - 4).fill(seed)]) as Uint8Array<ArrayBuffer>;
const tep = (ten: string, b: Uint8Array<ArrayBuffer>) => new File([b], ten, { type: "image/jpeg" });
const bam = async (b: Blob) => createHash("sha256").update(Buffer.from(await b.arrayBuffer())).digest("hex");
const veGia = async () => ({ thumb: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]), width: 2000, height: 1500 });

function fetchGia() {
  const goi: { url: string; method: string; body: FormData | null }[] = [];
  const f = (async (url: string, init?: RequestInit) => {
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
  await guiLuot([tep("so.jpg", JPEG(300, 4))], (t) => nguon.them(t, "internal"), { onLine: true, ve: veGia });
  assert.equal(goi.at(-1)!.body!.get("compartment"), "internal", "thả lên thẻ Nội bộ không vào ngăn nội bộ");
  const muc = (kind: string, file: File | null) => ({ kind, getAsFile: () => file }) as unknown as DataTransferItem;
  const dan = [muc("file", tep("d1.jpg", JPEG(10, 5))), muc("string", null), muc("file", tep("d2.jpg", JPEG(10, 6)))];
  assert.equal(tepTuLuotDan(dan, null).length, 2, "dán hai mục ảnh một mục chữ");
  assert.equal(tepTuLuotDan(dan, { tagName: "INPUT" } as Element).length, 0, "dán khi đang gõ trong ô nhập vẫn lấy ảnh");
  assert.deepEqual(coBanNhe(2000, 1500), { w: 480, h: 360 });
  assert.deepEqual(coBanNhe(300, 200), { w: 300, h: 200 });
});

test("E2b phía web: một tệp hỏng trong lượt ba tệp → hai lời gọi; mất mạng → không gọi, không giữ gì", async () => {
  const { f, goi } = fetchGia();
  const nguon = nguonApi("[Toà mẫu]", "A-06.01", f);
  const files = [tep("a.jpg", JPEG(500, 1)), new File(["day khong phai anh"], "tin-nhan.jpg", { type: "image/jpeg" }), tep("c.jpg", JPEG(502, 3))];
  const kq = await guiLuot(files, (t) => nguon.them(t, "shareable"), { onLine: true, ve: veGia });
  assert.deepEqual(kq, [{ ten: "a.jpg", loi: null }, { ten: "tin-nhan.jpg", loi: "Không phải ảnh" }, { ten: "c.jpg", loi: null }]);
  assert.equal(goi.length, 2);
  const kho = new Map<string, unknown>();
  const truoc = goi.length;
  const kq2 = await guiLuot(files, (t) => nguon.them(t, "shareable"), { onLine: false, ve: veGia });
  assert.deepEqual(kq2.map((k) => k.loi), [CHU_CAN_MANG, CHU_CAN_MANG, CHU_CAN_MANG]);
  assert.equal(goi.length, truoc, "mất mạng mà vẫn gọi API");
  assert.equal(kho.size, 0);
});
