// Khoá mã hoá số chủ (hàng 62: AC-4 — ADR-0013). Bản thật thiếu khoá thì API không dựng, không có đường ghi số rõ.
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, test } from "node:test";
import pg from "pg";
import { createApi } from "../app";
import { createAuth } from "../auth/auth";
import { captureSender } from "../auth/sender";
import { KHOA_DEV, khoaSoChu, laKhoaDev } from "./khoa";
import { giaiMaSo, maHoaSo, timDangSo } from "./ma-hoa";

let luu: NodeJS.ProcessEnv;
beforeEach(() => {
  luu = { ...process.env };
});
afterEach(() => {
  for (const k of Object.keys(process.env)) if (!(k in luu)) delete process.env[k];
  Object.assign(process.env, luu);
});

const deps = () => {
  const identityPool = new pg.Pool();
  const auth = createAuth({ identityPool, secret: "s".repeat(40), baseURL: "https://quy-hang.example.test", sender: captureSender().sender });
  return { appPool: new pg.Pool(), identityPool, auth };
};
const datMoiTruong = (nodeEnv: string, khoa?: string) => {
  process.env.NODE_ENV = nodeEnv;
  if (khoa === undefined) delete process.env.OWNER_PHONE_KEY;
  else process.env.OWNER_PHONE_KEY = khoa;
};

test("khoá: production thiếu khoá thì createApi ném", () => {
  datMoiTruong("production");
  assert.throws(() => createApi(deps()), /thiếu OWNER_PHONE_KEY/);
});

test("khoá: production với khoá dev bị từ chối", () => {
  datMoiTruong("production", KHOA_DEV.key.toString("base64"));
  assert.throws(() => createApi(deps()), /OWNER_PHONE_KEY đang là khoá dev/);
  assert.throws(() => khoaSoChu({ OWNER_PHONE_KEY: KHOA_DEV.key.toString("base64") }, { choPhepKhoaDev: false }), /khoá dev/);
});

test("khoá: sai dạng bị từ chối ở mọi môi trường", () => {
  const sai = ["khong-phai-base64!!", randomBytes(16).toString("base64"), randomBytes(33).toString("base64")];
  let dem = 0;
  for (const nodeEnv of ["production", "development"]) {
    for (const gt of sai) {
      datMoiTruong(nodeEnv, gt);
      assert.throws(
        () => createApi(deps()),
        (e: Error) => {
          assert.match(e.message, /OWNER_PHONE_KEY sai dạng/);
          assert.ok(!e.message.includes(gt), "thông điệp không nêu giá trị đã đưa");
          return true;
        },
        `${nodeEnv} · ${gt.length} ký tự`,
      );
      dem++;
    }
  }
  assert.equal(dem, 6);
});

test("khoá: dev thiếu khoá vẫn dựng và vẫn mã hoá", () => {
  datMoiTruong("development");
  assert.doesNotThrow(() => createApi(deps()));
  const khoa = khoaSoChu();
  assert.ok(laKhoaDev(khoa));
  const banMa = maHoaSo("0900000012", "listing_owners:a:b", khoa);
  assert.equal(timDangSo(banMa.toString("latin1"), "0900000012"), null);
  assert.equal(giaiMaSo(banMa, "listing_owners:a:b", khoa), "0900000012");
});

test("khoá: production có khoá hợp lệ thì dựng", () => {
  const k = randomBytes(32).toString("base64");
  datMoiTruong("production", k);
  assert.doesNotThrow(() => createApi(deps()));
  assert.deepEqual(khoaSoChu().key, Buffer.from(k, "base64"));
});

test("khoá: lệnh sinh khoá ghi trong ADR-0013 cho khoá hợp lệ", () => {
  const adr = readFileSync(fileURLToPath(new URL("../../../../docs/adr/0013-ma-hoa-so-chu.md", import.meta.url)), "utf8");
  const khoi = /<!-- <<<SINH-KHOA -->\s*```bash\n([^\n]+)\n```\s*<!-- SINH-KHOA>>> -->/.exec(adr);
  assert.ok(khoi, "ADR-0013 thiếu khối lệnh sinh khoá");
  const sinh = (lenh: string) => execSync(lenh, { encoding: "utf8" }).trim();
  const khoa = khoaSoChu({ NODE_ENV: "production", OWNER_PHONE_KEY: sinh(khoi[1]!) });
  assert.equal(khoa.key.length, 32);
  // Đối chứng âm cùng bộ đọc: khoá viết hex (64 ký tự) bị từ chối — ADR ghi sai lệnh thì bản thật không lên.
  assert.throws(() => khoaSoChu({ NODE_ENV: "production", OWNER_PHONE_KEY: sinh("openssl rand -hex 32") }), /sai dạng/);
});
