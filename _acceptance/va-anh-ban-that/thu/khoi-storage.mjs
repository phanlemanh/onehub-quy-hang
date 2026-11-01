// Thử khói kho ảnh thật (va-anh-ban-that, Hỏi-3) — CHỦ KHO chạy trên máy mình, khoá ở .env.local (máy không đọc):
//   node --env-file=.env.local --import tsx _acceptance/va-anh-ban-that/thu/khoi-storage.mjs [--origin https://<tên miền chính>]
// Ký link PUT bằng chính mô-đun kho-s3 của API, PUT 8 MB, hỏi CORS (OPTIONS kèm Origin), GET Range, xoá. In một dòng mỗi
// bước và dòng cuối «THỬ KHÓI: ĐẠT» hay «THỬ KHÓI: TRƯỢT — <bước>». Đối tượng thử nằm dưới tiền tố «khoi-thu/», luôn bị xoá.
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { cauHinhS3, khoS3, kyLinkPut } from "../../../packages/api/src/photos/kho-s3.ts";

const { values: a } = parseArgs({ options: { origin: { type: "string", default: "https://quy-hang.onehub.vn" } } });
const cfg = cauHinhS3();
if (!cfg) {
  console.log("THỬ KHÓI: TRƯỢT — chưa có khoá kho ảnh trong môi trường");
  process.exit(1);
}
const kho = khoS3(cfg);
const key = `khoi-thu/${randomUUID()}/original`;
const url = kyLinkPut({ url: `${cfg.endpoint}/${cfg.bucket}/${key}`, accessKey: cfg.accessKey, secretKey: cfg.secretKey, region: cfg.region, now: new Date(), expires: 60 });
const tam = new Uint8Array(8_000_000).fill(7);
tam.set([0xff, 0xd8, 0xff, 0xe0]);
let truot = null;
const buoc = async (ten, fn) => {
  if (truot) return;
  try {
    const kq = await fn();
    console.log(`✔ ${ten}${kq ? ` — ${kq}` : ""}`);
  } catch (e) {
    truot = ten;
    console.log(`✖ ${ten} — ${e.message}`);
  }
};
await buoc("hỏi CORS cho PUT từ trình duyệt", async () => {
  const r = await fetch(url, { method: "OPTIONS", headers: { Origin: a.origin, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" } });
  const cho = r.headers.get("access-control-allow-origin");
  if (!r.ok || !(cho === "*" || cho === a.origin)) throw new Error(`OPTIONS ${r.status}, allow-origin ${cho}`);
  return `allow-origin ${cho}`;
});
await buoc("PUT 8 MB bằng link ký", async () => {
  const r = await fetch(url, { method: "PUT", headers: { "content-type": "image/jpeg", Origin: a.origin }, body: tam });
  if (!r.ok) throw new Error(`PUT ${r.status} ${await r.text()}`);
});
await buoc("GET Range đọc đầu và cỡ", async () => {
  const d = await kho.docDau(key);
  if (!d || d.size !== tam.length || d.dau[0] !== 0xff) throw new Error(`đọc được ${JSON.stringify(d && { size: d.size })}`);
  return `cỡ ${d.size}`;
});
await kho.xoa(key).then(() => console.log("✔ xoá đối tượng thử"), (e) => console.log(`✖ xoá đối tượng thử — ${e.message}`));
console.log(truot ? `THỬ KHÓI: TRƯỢT — ${truot}` : "THỬ KHÓI: ĐẠT");
process.exit(truot ? 1 : 0);
