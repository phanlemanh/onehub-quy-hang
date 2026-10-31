// Đường tra danh mục và lệnh đo tỉ lệ tự điền (hàng 9, hồ sơ danh-muc-go-ma-can) — E8b, E10.
// Phần cần Postgres (cổng vào theo sàn, năm vai, khoá trả ra) ở packages/api/test-db/catalog.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { UNIT_CODE_RULES, type CatalogData } from "@quy-hang/core";
import pg from "pg";
import { createApi } from "../app";
import type { Auth } from "../auth/auth";
import { measureAutofill, type DapAn } from "./do-ti-le";

test("danh mục: chưa đăng nhập trả 401", async () => {
  // better-auth chạm cơ sở dữ liệu cả khi không có cookie: ở đây thay bằng bộ đăng nhập trả «không phiên». Ca đầy đủ
  // qua better-auth thật ở packages/api/test-db/catalog.
  const pool = new pg.Pool();
  const khongPhien = { api: { getSession: async () => null } } as unknown as Auth;
  const api = createApi({ appPool: pool, identityPool: pool, auth: khongPhien });
  const res = await api.request("/api/v1/catalog/units/A-12.06");
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: "unauthenticated" });
});

type Goi = {
  danhMuc: CatalogData;
  hang: { ma: string; maCan: string; upi: string }[];
  lead: { ma: string; toa: string; maCan: string }[];
};
/** Gói mẫu đọc thẳng từ tệp — đường suy từ vị trí tệp này, không qua mã đang đo. */
const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as Goi;

/** Bảng đáp án dựng riêng ở đây, không gọi hàm đọc mã: hàng theo UPI gói ghi, lead theo toà + mã căn đúng chữ. */
function dapAn(danhMuc: CatalogData): DapAn[] {
  const out: DapAn[] = goi.hang.map((h) => ({ input: h.maCan, upi: h.upi }));
  for (const l of goi.lead.filter((x) => x.maCan)) {
    const toa = danhMuc.projects.flatMap((p) => p.buildings).find((b) => b.buildingKey === l.toa);
    const can = toa?.units.find((u) => u.unitNumber === l.maCan);
    assert.ok(can, `lead ${l.ma}: không có căn ${l.toa} ${l.maCan} trong danh mục mẫu`);
    out.push({ input: l.maCan, upi: can.upi });
  }
  return out;
}
/** Năm kiểu viết lại, viết tay ở đây — không lấy từ lệnh đo. */
const VIET_LAI: ((m: string) => string)[] = [
  (m) => m.toLowerCase(),
  (m) => m.split(/[-.]/).join(""),
  (m) => m.split(/[-.]/).join(" "),
  (m) => m.split(/[-.]/).join("/"),
  (m) => {
    const [b, f, s] = m.split(/[-.]/) as [string, string, string];
    return `${b}-${f}.${String(Number(s))}`;
  },
];
const NGOAI = ["C-01.01", "A-16.01", "A-01.07", "B-00.01"];

test("đo tỉ lệ tự điền trên dữ liệu mẫu: 47 mã, 100%, chưa có đúng, điền đoán 0", () => {
  const goc = dapAn(goi.danhMuc);
  assert.equal(goc.length, 47, "40 mã hàng + 7 lead có mã");
  const tatCa = goc.flatMap((a) => [a, ...VIET_LAI.map((f) => ({ input: f(a.input), upi: a.upi }))]);
  assert.equal(tatCa.length, 282);
  const kq = measureAutofill(goi.danhMuc, tatCa, NGOAI);
  assert.deepEqual({ tong: kq.tong, dung: kq.dung, chuaCo: kq.chuaCo, dienDoan: kq.dienDoan }, { tong: 282, dung: 282, chuaCo: 4, dienDoan: 0 }, kq.hut.map((h) => h.input).join(", "));
  assert.equal(kq.dong, "tự điền đúng 282/282 (100%) · chưa có 4/4 · điền đoán 0");

  // Đối chứng (a): danh mục bỏ căn của hàng H-01 thì hụt đúng mã ấy.
  const h01 = goi.hang.find((h) => h.ma === "H-01")!;
  const thieu = structuredClone(goi.danhMuc) as CatalogData & { projects: { buildings: { units: { upi: string }[] }[] }[] };
  for (const b of thieu.projects[0]!.buildings) b.units = b.units.filter((u) => u.upi !== h01.upi);
  const a = measureAutofill(thieu, tatCa, NGOAI);
  assert.ok(a.dung < a.tong, "bỏ một căn mà vẫn 100%");
  assert.ok(a.hut.some((h) => h.input === h01.maCan), `${h01.maCan} phải nằm trong danh sách hụt`);

  // Đối chứng (b): cách đọc tráo tầng và trục thì không còn 100%.
  const trao = [{ ...UNIT_CODE_RULES[0]!, template: "{b}-{s}.{f}" }];
  const b = measureAutofill(goi.danhMuc, tatCa, NGOAI, trao);
  assert.ok(b.dung < b.tong, `cách đọc tráo tầng/trục mà vẫn ${b.dong}`);
});
