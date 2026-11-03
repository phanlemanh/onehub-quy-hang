// E9b (hàng 31) — job CI `ro-ri` chạy bộ kiểm rò rỉ và là điều kiện của `ci-ok` và `deploy`. Đọc tệp workflow bằng gói
// `yaml` của kho; chiều đỏ trên bản sao YAML trong bộ nhớ.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse } from "yaml";

const GOC = new URL("../../../", import.meta.url);
const ciYml = readFileSync(new URL(".github/workflows/ci.yml", GOC), "utf8");
const pkg = JSON.parse(readFileSync(new URL("package.json", GOC), "utf8"));

/** Lỗi nối CI của job ro-ri — mảng rỗng là đạt. */
export function kiemNoiRoRi(wf, scripts) {
  const loi = [];
  const job = wf?.jobs?.["ro-ri"];
  if (!job) loi.push("thiếu job ro-ri");
  else if (!(job.steps ?? []).some((s) => typeof s.run === "string" && s.run.includes("npm run test:ro-ri"))) {
    loi.push("job ro-ri không chạy npm run test:ro-ri");
  }
  for (const ten of ["ci-ok", "deploy"]) {
    const needs = [wf?.jobs?.[ten]?.needs ?? []].flat();
    if (!needs.includes("ro-ri")) loi.push(`${ten}: needs thiếu ro-ri`);
  }
  if (typeof scripts?.["test:ro-ri"] !== "string") loi.push("package.json thiếu script test:ro-ri");
  return loi;
}

test("E9b CI nối ro-ri — job, needs của ci-ok và deploy, script gốc", () => {
  assert.deepEqual(kiemNoiRoRi(parse(ciYml), pkg.scripts), []);
});

test("E9b chiều đỏ — bản sao bỏ ro-ri khỏi needs của ci-ok", () => {
  const wf = parse(ciYml);
  wf.jobs["ci-ok"].needs = wf.jobs["ci-ok"].needs.filter((n) => n !== "ro-ri");
  assert.deepEqual(kiemNoiRoRi(wf, pkg.scripts), ["ci-ok: needs thiếu ro-ri"]);
});
