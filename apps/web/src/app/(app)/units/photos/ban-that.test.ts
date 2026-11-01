// Vá ảnh bản thật phía web (va-anh-ban-that: E1c, E5). fetch giả và thông báo giả — không mạng, không React.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { nguonApi } from "./nguon-api";
import type { TepSanSang } from "./tai-len";
import { lamViec, VIEC_ANH, type ViecAnh } from "./viec-anh";

const bam = async (b: Blob) => createHash("sha256").update(Buffer.from(await b.arrayBuffer())).digest("hex");
const tep = (n: number): TepSanSang => {
  const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(n - 4).fill(7)])], "lon.jpg", { type: "image/jpeg" });
  return { ok: true, file, type: "image/jpeg", takenAt: null, thumb: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])]), width: 4000, height: 3000 };
};
function fetchGia(link: object) {
  const goi: { url: string; method: string; body: unknown }[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    goi.push({ url: String(url), method: init?.method ?? "GET", body: init?.body });
    if (String(url).endsWith("/upload-url")) return new Response(JSON.stringify(link), { status: 200 });
    return new Response("{}", { status: 201 });
  }) as typeof fetch;
  return { f, goi };
}

test("E1c đường ba bước: có link → xin link, PUT byte gốc lên link, xác nhận không mang bản gốc; không link → đường cũ", async () => {
  const LINK = "https://s3-gia.test/storage/v1/s3/unit-photos/co-a/p-1/original?X-Amz-Expires=60";
  const t = tep(6_000_000);
  const { f, goi } = fetchGia({ truc_tiep: true, photoId: "p-1", url: LINK });
  await nguonApi("[Toà mẫu]", "A-06.01", f).them(t, "shareable");
  assert.deepEqual(goi.map((g) => `${g.method} ${g.url}`), ["POST /api/v1/units/photos/upload-url", `PUT ${LINK}`, "POST /api/v1/units/photos"]);
  assert.deepEqual(JSON.parse(goi[0]!.body as string), { toa: "[Toà mẫu]", ma: "A-06.01", contentType: "image/jpeg", byteSize: 6_000_000 });
  assert.equal(await bam(goi[1]!.body as Blob), await bam(t.file), "PUT không mang đúng byte gốc");
  const fd = goi[2]!.body as FormData;
  assert.equal(fd.get("photoId"), "p-1");
  assert.equal(fd.get("original"), null, "xác nhận vẫn mang bản gốc qua API");
  assert.ok(fd.get("thumb") instanceof Blob);
  const cu = fetchGia({ truc_tiep: false });
  await nguonApi("[Toà mẫu]", "A-06.01", cu.f).them(t, "shareable");
  assert.deepEqual(cu.goi.map((g) => g.method), ["POST", "POST"]);
  assert.ok((cu.goi[1]!.body as FormData).get("original") instanceof Blob, "đường cũ không mang bản gốc");
});

test("E5 báo lỗi sửa xoá: năm việc × (API lỗi, mất mạng) báo đúng chữ; thành công không báo; mọi nút đi qua lamViec", async () => {
  const CHU: Record<ViecAnh, string> = {
    bia: "Không đặt ảnh bìa được — thử lại",
    mau: "Không đánh dấu ảnh mẫu được — thử lại",
    ngan: "Không chuyển ngăn được — thử lại",
    thuTu: "Không đổi thứ tự được — thử lại",
    xoa: "Không xoá ảnh được — thử lại",
  };
  assert.deepEqual(VIEC_ANH, CHU);
  const hong = { api: () => Promise.reject(new Error("ảnh: 500")), mang: () => Promise.reject(new TypeError("Failed to fetch")) };
  for (const viec of Object.keys(CHU) as ViecAnh[]) {
    for (const [ten, goi] of Object.entries(hong)) {
      const bao: string[] = [];
      let tai = 0;
      await lamViec(viec, goi, { baoLoi: (c) => bao.push(c), taiLai: () => tai++ });
      assert.deepEqual(bao, [CHU[viec]], `${viec} × ${ten}`);
      assert.equal(tai, 1, `${viec} × ${ten}: không tải lại`);
    }
    const bao: string[] = [];
    await lamViec(viec, () => Promise.resolve(), { baoLoi: (c) => bao.push(c), taiLai: () => {} });
    assert.deepEqual(bao, [], `${viec} thành công mà vẫn báo lỗi`);
  }
  // Mọi lời gọi sửa, xoá của mục Ảnh nằm trong lam(...) — quét mã nguồn thật.
  const nguon = readFileSync(fileURLToPath(new URL("./muc-anh.tsx", import.meta.url)), "utf8");
  const tran = nguon.split("\n").filter((d) => /nguon\.(sua|xoa)\(/.test(d) && !/lam\("(bia|mau|ngan|thuTu|xoa)", \(\) => nguon\.(sua|xoa)\(/.test(d));
  assert.deepEqual(tran, [], "có nút sửa/xoá ảnh không đi qua lamViec");
  assert.ok(nguon.split("\n").filter((d) => /lam\("/.test(d)).length >= 7, "đếm lời gọi lam quá ít — bài quét không thấy mã");
});
