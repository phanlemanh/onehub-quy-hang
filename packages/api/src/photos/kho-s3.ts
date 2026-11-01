import { createHash, createHmac } from "node:crypto";

/**
 * Bản Supabase Storage của kho ảnh (hàng 18, ADR-0014) — mô-đun DUY NHẤT đọc khoá S3 của Storage. Khoá S3 chỉ chạm Storage,
 * không chạm cơ sở dữ liệu, nhưng phủ mọi bucket và bỏ qua luật của Storage: chỉ máy chủ cầm, chỉ ký link sau khi API đã
 * đọc được dòng ảnh dưới luật theo dòng. Ký yêu cầu theo AWS SigV4 bằng `node:crypto`, không thêm gói. Thông điệp lỗi chỉ
 * nêu tên biến, không bao giờ giá trị.
 */
export type CauHinhS3 = { accessKey: string; secretKey: string; endpoint: string; region: string; bucket: string };

export const BUCKET_ANH = "unit-photos";
/** Lời báo khi bản thật không có khoá — tên biến chỉ nằm ở mô-đun này. */
export const LOI_THIEU_KHOA = "kho ảnh: thiếu STORAGE_S3_ACCESS_KEY, STORAGE_S3_SECRET_KEY, STORAGE_S3_ENDPOINT ở bản thật";
/** Vùng của dự án Supabase (Singapore, Kiến trúc §3); đổi bằng STORAGE_S3_REGION khi dự án ở vùng khác. */
const VUNG_MAC_DINH = "ap-southeast-1";

/** Đọc cấu hình từ môi trường: đủ ba biến → cấu hình; thiếu cả ba → null; thiếu một phần → ném, nêu tên biến thiếu. */
export function cauHinhS3(env: NodeJS.ProcessEnv = process.env): CauHinhS3 | null {
  const v = {
    STORAGE_S3_ACCESS_KEY: env.STORAGE_S3_ACCESS_KEY?.trim() ?? "",
    STORAGE_S3_SECRET_KEY: env.STORAGE_S3_SECRET_KEY?.trim() ?? "",
    STORAGE_S3_ENDPOINT: env.STORAGE_S3_ENDPOINT?.trim() ?? "",
  };
  const thieu = Object.entries(v).filter(([, x]) => !x).map(([k]) => k);
  if (thieu.length === 3) return null;
  if (thieu.length) throw new Error(`kho ảnh: thiếu ${thieu.join(", ")} — đặt đủ ba biến STORAGE_S3_* hoặc bỏ cả ba`);
  return {
    accessKey: v.STORAGE_S3_ACCESS_KEY,
    secretKey: v.STORAGE_S3_SECRET_KEY,
    endpoint: v.STORAGE_S3_ENDPOINT.replace(/\/+$/, ""),
    region: env.STORAGE_S3_REGION?.trim() || VUNG_MAC_DINH,
    bucket: BUCKET_ANH,
  };
}

const hex = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const hmac = (k: Buffer | string, s: string) => createHmac("sha256", k).update(s).digest();
const ma = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const ngayAmz = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function khoaKy(secret: string, ngay: string, region: string) {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, ngay), region), "s3"), "aws4_request");
}

type KyLink = { url: string; accessKey: string; secretKey: string; region: string; now: Date; expires: number };

/** Link GET ký sẵn (query SigV4, chỉ ký header host). */
export function kyLinkGet(o: KyLink): string {
  return kyLink("GET", o);
}

/** Link PUT ký sẵn — trình duyệt tải bản gốc thẳng lên kho, không qua giới hạn thân yêu cầu của hàm Vercel. */
export function kyLinkPut(o: KyLink): string {
  return kyLink("PUT", o);
}

function kyLink(method: "GET" | "PUT", o: KyLink): string {
  const u = new URL(o.url);
  const amz = ngayAmz(o.now);
  const scope = `${amz.slice(0, 8)}/${o.region}/s3/aws4_request`;
  const q: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${o.accessKey}/${scope}`],
    ["X-Amz-Date", amz],
    ["X-Amz-Expires", String(o.expires)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  const cq = q.map(([k, v]) => `${ma(k)}=${ma(v)}`).sort().join("&");
  const canon = [method, u.pathname, cq, `host:${u.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const sts = ["AWS4-HMAC-SHA256", amz, scope, hex(canon)].join("\n");
  const sig = createHmac("sha256", khoaKy(o.secretKey, amz.slice(0, 8), o.region)).update(sts).digest("hex");
  return `${u.origin}${u.pathname}?${cq}&X-Amz-Signature=${sig}`;
}

/** Header Authorization cho PUT/DELETE (ký host, x-amz-content-sha256, x-amz-date). */
export function kyHeader(o: { method: string; url: string; body: Buffer; accessKey: string; secretKey: string; region: string; now: Date; them?: Record<string, string> }) {
  const u = new URL(o.url);
  const amz = ngayAmz(o.now);
  const scope = `${amz.slice(0, 8)}/${o.region}/s3/aws4_request`;
  const bam = hex(o.body);
  const them = Object.entries(o.them ?? {}).map(([k, v]) => [k.toLowerCase(), v] as const);
  const tat = [["host", u.host], ...them, ["x-amz-content-sha256", bam], ["x-amz-date", amz]].sort((a, b) => (a[0]! < b[0]! ? -1 : 1));
  const canonHeaders = tat.map(([k, v]) => `${k}:${v}\n`).join("");
  const signed = tat.map(([k]) => k).join(";");
  const canon = [o.method, u.pathname, "", canonHeaders, signed, bam].join("\n");
  const sts = ["AWS4-HMAC-SHA256", amz, scope, hex(canon)].join("\n");
  const sig = createHmac("sha256", khoaKy(o.secretKey, amz.slice(0, 8), o.region)).update(sts).digest("hex");
  return {
    ...Object.fromEntries(them),
    "x-amz-content-sha256": bam,
    "x-amz-date": amz,
    authorization: `AWS4-HMAC-SHA256 Credential=${o.accessKey}/${scope}, SignedHeaders=${signed}, Signature=${sig}`,
  };
}

/** Đường đối tượng: `<company_id>/<photo_id>/<original|thumb>` — mã sàn đứng đầu. */
export const duongDoiTuong = (companyId: string, photoId: string, variant: string) => `${companyId}/${photoId}/${variant}`;

export function khoS3(cfg: CauHinhS3, f: typeof fetch = fetch) {
  const url = (key: string) => `${cfg.endpoint}/${cfg.bucket}/${key}`;
  const ky = (method: string, key: string, body: Buffer, them?: Record<string, string>) =>
    kyHeader({ method, url: url(key), body, accessKey: cfg.accessKey, secretKey: cfg.secretKey, region: cfg.region, now: new Date(), them });
  const goi = async (method: "PUT" | "DELETE", key: string, body: Buffer, type?: string) => {
    const r = await f(url(key), { method, headers: { ...ky(method, key, body), ...(type ? { "content-type": type } : {}) }, ...(method === "PUT" ? { body: new Uint8Array(body) } : {}) });
    if (!r.ok && !(method === "DELETE" && r.status === 404)) throw new Error(`kho ảnh: ${method} trả ${r.status}`);
  };
  const link = (method: "GET" | "PUT", key: string, giay: number) =>
    (method === "GET" ? kyLinkGet : kyLinkPut)({ url: url(key), accessKey: cfg.accessKey, secretKey: cfg.secretKey, region: cfg.region, now: new Date(), expires: giay });
  return {
    ghi: (key: string, bytes: Buffer, type: string) => goi("PUT", key, bytes, type),
    xoa: (key: string) => goi("DELETE", key, Buffer.alloc(0)),
    link: (key: string, giay: number) => link("GET", key, giay),
    linkTaiLen: (key: string, giay: number) => link("PUT", key, giay),
    /** 64 byte đầu và cỡ thật của một đối tượng; không có thì null. */
    async docDau(key: string): Promise<{ dau: Buffer; size: number } | null> {
      const r = await f(url(key), { method: "GET", headers: ky("GET", key, Buffer.alloc(0), { range: "bytes=0-63" }) });
      if (r.status === 404 || r.status === 403) return null;
      if (!r.ok) throw new Error(`kho ảnh: GET trả ${r.status}`);
      const dau = Buffer.from(await r.arrayBuffer());
      const tong = /\/(\d+)$/.exec(r.headers.get("content-range") ?? "")?.[1];
      return { dau: dau.subarray(0, 64), size: tong ? Number(tong) : Number(r.headers.get("content-length") ?? dau.length) };
    },
  };
}
