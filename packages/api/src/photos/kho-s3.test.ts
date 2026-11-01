// Kho ảnh bản Supabase Storage (hàng 18: E6b phần không cần Postgres). Véc tơ ký mẫu lấy từ tài liệu SigV4 của AWS
// (Authenticating Requests: Using Query Parameters — ví dụ presigned URL), không sinh từ hàm đang kiểm.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cauHinhS3, duongDoiTuong, khoS3, kyLinkGet } from "./kho-s3";

test("ký đúng SigV4: véc tơ presigned GET của AWS", () => {
  const url = kyLinkGet({
    url: "https://examplebucket.s3.amazonaws.com/test.txt",
    accessKey: "AKIAIOSFODNN7EXAMPLE",
    secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    region: "us-east-1",
    now: new Date("2013-05-24T00:00:00Z"),
    expires: 86400,
  });
  assert.equal(new URL(url).searchParams.get("X-Amz-Signature"), "aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404");
});

test("link ảnh: sống 60 giây, đường đối tượng mở đầu bằng mã sàn", () => {
  const cfg = { accessKey: "k", secretKey: "s", endpoint: "https://ref.supabase.co/storage/v1/s3", region: "ap-southeast-1", bucket: "unit-photos" };
  const u = new URL(khoS3(cfg).link(duongDoiTuong("co-a", "p-1", "original"), 60));
  assert.equal(u.searchParams.get("X-Amz-Expires"), "60");
  assert.equal(u.pathname, "/storage/v1/s3/unit-photos/co-a/p-1/original");
});

test("cấu hình: đủ ba biến → có; vắng cả ba → null; thiếu một phần → lỗi nêu tên biến, không nêu giá trị", () => {
  const du = { STORAGE_S3_ACCESS_KEY: "ak", STORAGE_S3_SECRET_KEY: "bi-mat-123", STORAGE_S3_ENDPOINT: "https://x/s3/" };
  assert.equal(cauHinhS3(du)?.endpoint, "https://x/s3");
  assert.equal(cauHinhS3({}), null);
  assert.throws(() => cauHinhS3({ STORAGE_S3_SECRET_KEY: "bi-mat-123" }), (e: Error) => /STORAGE_S3_ACCESS_KEY, STORAGE_S3_ENDPOINT/.test(e.message) && !e.message.includes("bi-mat-123"));
});

// ---- Khoá kho ảnh một chỗ (E6b-1): đọc cây thật, không danh sách gõ tay ----
const GOC = fileURLToPath(new URL("../../../../", import.meta.url));
const BIEN = /STORAGE_S3_(ACCESS|SECRET)_KEY/;
const NHAP_S3 = /from\s+["'][^"']*kho-s3["']/;

function quetKhoa(goc: string): string[] {
  const loi: string[] = [];
  const di = (d: string) => {
    for (const ten of readdirSync(d)) {
      if (ten === "node_modules" || ten === ".next" || ten.startsWith(".")) continue;
      const p = join(d, ten);
      if (statSync(p).isDirectory()) di(p);
      else if (/\.(ts|tsx|mjs|js)$/.test(ten) && !/\.test\.(ts|tsx|mjs)$/.test(ten)) {
        const rel = relative(goc, p).split("\\").join("/");
        const t = readFileSync(p, "utf8");
        if (BIEN.test(t) && rel !== "packages/api/src/photos/kho-s3.ts") loi.push(`${rel}: đọc khoá kho ảnh`);
        if (NHAP_S3.test(t) && rel !== "packages/api/src/photos/kho.ts") loi.push(`${rel}: nhập kho-s3`);
        if (/SUPABASE_SERVICE_ROLE/.test(t)) loi.push(`${rel}: dùng service_role`);
      }
    }
  };
  for (const g of ["packages", "apps/web/src"]) di(join(goc, g));
  return loi;
}

test("khoá kho ảnh chỉ một mô-đun: cây thật sạch; bản sao thêm một tệp đọc khoá thì bị gọi tên", () => {
  assert.deepEqual(quetKhoa(GOC), []);
  const sao = mkdtempSync(join(tmpdir(), "quet-khoa-"));
  cpSync(join(GOC, "packages/api/src"), join(sao, "packages/api/src"), { recursive: true });
  cpSync(join(GOC, "apps/web/src/app/(app)/units"), join(sao, "apps/web/src/app/(app)/units"), { recursive: true });
  writeFileSync(join(sao, "packages/api/src/lo.ts"), "export const k = process.env.STORAGE_S3_SECRET_KEY;\n");
  assert.deepEqual(quetKhoa(sao), ["packages/api/src/lo.ts: đọc khoá kho ảnh"]);
});
