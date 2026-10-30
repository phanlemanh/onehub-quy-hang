import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { demNgoaiLe, noTheoLuat } from "../muc-no.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(PKG, "muc-no.mjs");
const ESLINT = join(PKG, "..", "..", "node_modules", "eslint", "bin", "eslint.js");

const git = (cwd, ...a) => execFileSync("git", a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const write = (root, rel, text) => {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text);
};
const run = (root, extra = [], env = {}) =>
  spawnSync("node", [SCRIPT, "--root", root, "--main-ref", "main", ...extra], {
    encoding: "utf8",
    env: { ...process.env, CI: "", ...env },
  });

// Kho thử: nhánh main có trần 0, rồi một tệp giao diện vi phạm quy-hang-ui/no-raw-palette.
function khoThu() {
  const root = mkdtempSync(join(tmpdir(), "muc-no-"));
  git(root, "init", "-q", "-b", "main");
  git(root, "config", "user.email", "thu@example.invalid");
  git(root, "config", "user.name", "Thu");
  write(root, "packages/ui-lint/muc-no.json", '{ "tran": 0 }\n');
  write(
    root,
    "eslint.config.mjs",
    `import plugin from ${JSON.stringify(pathToFileURL(join(PKG, "index.mjs")).href)};\n` +
      `export default [{ files: ["**/*.jsx"], plugins: { "quy-hang-ui": plugin },\n` +
      `  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },\n` +
      `  rules: { "quy-hang-ui/no-raw-palette": "error" } }];\n`,
  );
  write(root, "apps/web/src/app/vi-pham.jsx", 'export const A = () => <div className="text-red-500" />;\n');
  git(root, "add", ".");
  git(root, "commit", "-q", "-m", "mốc");
  return root;
}

describe("noTheoLuat / demNgoaiLe", () => {
  it("chỉ cộng count của luật quy-hang-ui/*", () => {
    const got = noTheoLuat({
      "a.tsx": { "quy-hang-ui/no-raw-palette": { count: 2 }, "react-hooks/purity": { count: 5 } },
      "b.tsx": { "quy-hang-ui/no-raw-palette": { count: 1 }, "quy-hang-ui/no-aschild": { count: 1 } },
    });
    assert.deepEqual(got, { "quy-hang-ui/no-raw-palette": 3, "quy-hang-ui/no-aschild": 1 });
  });
  it("ngoại lệ có lý do được đếm; trần, không lý do, luật khác thì không", () => {
    assert.equal(demNgoaiLe("// eslint-disable-next-line quy-hang-ui/no-raw-table -- in hoá đơn\n"), 1);
    assert.equal(demNgoaiLe("// eslint-disable-next-line quy-hang-ui/no-raw-table\n"), 0);
    assert.equal(demNgoaiLe("// eslint-disable-next-line react-hooks/purity -- lý do\n"), 0);
    assert.equal(demNgoaiLe("/* eslint-disable quy-hang-ui/no-raw-palette, no-console -- màu đối tác */"), 1);
  });
});

describe("muc-no.mjs trên kho thử (nợ sinh bằng eslint --suppress-rule)", () => {
  let root;
  before(() => {
    root = khoThu();
  });
  after(() => rmSync(root, { recursive: true, force: true }));

  it("đối chứng dương: chưa suppress → nợ 0/0, thoát 0", () => {
    const r = run(root);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /mức nợ giao diện: 0\/0 · ngoại lệ có lý do: 0/);
  });

  it("suppress một vi phạm bằng chính ESLint → 1/0, thoát 1, gọi tên luật", () => {
    const s = spawnSync("node", [ESLINT, "--suppress-rule", "quy-hang-ui/no-raw-palette", "."], { cwd: root, encoding: "utf8" });
    assert.ok(existsSync(join(root, "eslint-suppressions.json")), `ESLint không ghi suppressions: ${s.stdout}${s.stderr}`);
    assert.ok(readFileSync(join(root, "eslint-suppressions.json"), "utf8").includes("quy-hang-ui/no-raw-palette"));
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /mức nợ giao diện: 1\/0/);
    assert.match(r.stderr, /nợ vượt trần: quy-hang-ui\/no-raw-palette 1/);
    rmSync(join(root, "eslint-suppressions.json"));
    assert.equal(run(root).status, 0, "xoá suppressions thì về 0/0");
  });

  it("ngoại lệ có lý do: đếm, in riêng, không chặn", () => {
    write(root, "apps/web/src/app/ngoai-le.tsx", "// eslint-disable-next-line quy-hang-ui/no-raw-table -- bảng in\nexport const a = 1;\n");
    const r = run(root);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /mức nợ giao diện: 0\/0 · ngoại lệ có lý do: 1/);
    rmSync(join(root, "apps/web/src/app/ngoai-le.tsx"));
  });

  it("ngoại lệ có lý do trong khối đã chuyển thể (components/blocks) cũng được đếm; ui/reui thì không", () => {
    write(root, "apps/web/src/components/blocks/khoi.tsx", "// eslint-disable-next-line quy-hang-ui/no-raw-table -- bảng in\nexport const a = 1;\n");
    write(root, "apps/web/src/components/ui/vendor.tsx", "// eslint-disable-next-line quy-hang-ui/no-raw-table -- vendor\nexport const a = 1;\n");
    const r = run(root);
    assert.match(r.stdout, /ngoại lệ có lý do: 1/);
    rmSync(join(root, "apps/web/src/components/blocks/khoi.tsx"));
    rmSync(join(root, "apps/web/src/components/ui/vendor.tsx"));
  });

  it("nâng trần cao hơn nhánh chính → thoát 1 «trần chỉ được giảm»", () => {
    write(root, "packages/ui-lint/muc-no.json", '{ "tran": 1 }\n');
    const r = run(root);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /trần chỉ được giảm: packages\/ui-lint\/muc-no\.json 0 → 1/);
    write(root, "packages/ui-lint/muc-no.json", '{ "tran": 0 }\n');
  });

  it("nhánh chính chưa có tệp trần → đặt trần lần đầu, không chặn", () => {
    git(root, "checkout", "-q", "-b", "chua-tran", "main");
    git(root, "rm", "-q", "packages/ui-lint/muc-no.json");
    git(root, "commit", "-q", "-m", "bỏ trần");
    write(root, "packages/ui-lint/muc-no.json", '{ "tran": 0 }\n');
    const r = run(root, ["--main-ref", "chua-tran"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /nhánh chính chưa có trần — đặt trần lần đầu/);
    git(root, "checkout", "-q", "-f", "main");
  });

  it("không có ref nhánh chính: trên CI thoát 1 có tên, ngoài CI chỉ cảnh báo", () => {
    const ci = run(root, ["--main-ref", "origin/khong-co"], { CI: "true" });
    assert.equal(ci.status, 1);
    assert.match(ci.stderr, /không so được trần với nhánh chính: không có ref origin\/khong-co/);
    const may = run(root, ["--main-ref", "origin/khong-co"]);
    assert.equal(may.status, 0, may.stderr);
    assert.match(may.stdout, /cảnh báo: không so được trần với nhánh chính/);
  });
});
