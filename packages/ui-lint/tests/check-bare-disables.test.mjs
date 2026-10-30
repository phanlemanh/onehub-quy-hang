import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { findBareDisables, scanSrc } from "../check-bare-disables.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "check-bare-disables.mjs");

describe("findBareDisables", () => {
  it("hợp lệ: disable có luật quy-hang-ui kèm lý do", () => {
    assert.deepEqual(
      findBareDisables("// eslint-disable-next-line quy-hang-ui/no-raw-table -- lý do\nconst a = 1;"),
      [],
    );
  });
  it("hợp lệ: luật ngoài plugin không cần lý do", () => {
    assert.deepEqual(findBareDisables("// eslint-disable-next-line react-hooks/purity\nconst a = 1;"), []);
    assert.deepEqual(findBareDisables("/* eslint-disable react-hooks/purity, no-console */\nconst a = 1;"), []);
  });
  it("hợp lệ: eslint-enable và chú thích thường", () => {
    assert.deepEqual(findBareDisables("/* eslint-enable */\n// eslint-disable-foo\n// ghi chú eslint-disable"), []);
  });
  it("hợp lệ: directive nêu luật quy-hang-ui/require-disable-reason có lý do", () => {
    assert.deepEqual(
      findBareDisables("// eslint-disable-next-line quy-hang-ui/require-disable-reason -- ví dụ trong tài liệu\n"),
      [],
    );
  });

  it("(a) bắt eslint-disable-next-line trần", () => {
    const got = findBareDisables("const a = 1;\n// eslint-disable-next-line\nconst b = 2;");
    assert.equal(got.length, 1);
    assert.equal(got[0].line, 2);
    assert.match(got[0].message, /trần/);
  });
  it("(a) bắt eslint-disable-line trần", () => {
    const got = findBareDisables("const a = 1; // eslint-disable-line\n");
    assert.equal(got.length, 1);
    assert.equal(got[0].line, 1);
  });
  it("(a) bắt /* eslint-disable */ trần, kể cả có lý do (phải nêu luật)", () => {
    assert.equal(findBareDisables("\n\n/* eslint-disable */\n").at(0).line, 3);
    assert.equal(findBareDisables("/* eslint-disable -- file sinh tự động */").length, 1);
  });

  it("(b) bắt directive nêu require-disable-reason mà thiếu lý do", () => {
    const got = findBareDisables("// eslint-disable-next-line quy-hang-ui/require-disable-reason\nconst a = 1;");
    assert.equal(got.length, 1);
    assert.match(got[0].message, /require-disable-reason/);
  });
  it("(b) dấu -- nhưng không có chữ, hoặc danh sách lẫn luật khác", () => {
    assert.equal(findBareDisables("/* eslint-disable quy-hang-ui/require-disable-reason -- */").length, 1);
    assert.equal(
      findBareDisables("// eslint-disable-line react-hooks/purity, quy-hang-ui/require-disable-reason").length,
      1,
    );
  });
});

describe("quét src/ và CLI", () => {
  const root = mkdtempSync(join(tmpdir(), "bare-disables-"));
  const write = (rel, text) => {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, text);
  };
  write("src/app/ok.tsx", "// eslint-disable-next-line quy-hang-ui/no-raw-table -- lý do\n// eslint-disable-next-line react-hooks/purity\nexport const a = 1;\n");
  write("src/app/bad.tsx", "export const a = 1;\n// eslint-disable-next-line\nexport const b = 2;\n");
  write("src/lib/bad2.ts", "/* eslint-disable quy-hang-ui/require-disable-reason */\n");
  // Vendor bị bỏ qua dù có directive trần.
  write("src/components/ui/button.tsx", "/* eslint-disable */\n");
  write("src/components/reui/x.tsx", "// eslint-disable-line\n");
  // Khối và ví dụ đã chuyển thể bị sửa tay nên chịu luật (lib/vendor.mjs) — directive trần ở đó phải bị bắt.
  write("src/components/blocks/y.tsx", "/* eslint-disable */\n");
  write("src/components/examples/z.tsx", "// eslint-disable-line\n");

  it("scanSrc báo mọi tệp ngoài ui/reui, kể cả blocks và examples", () => {
    const got = scanSrc(root).map((v) => `${v.file}:${v.line}`).sort();
    assert.deepEqual(got, ["src/app/bad.tsx:2", "src/components/blocks/y.tsx:1", "src/components/examples/z.tsx:1", "src/lib/bad2.ts:1"]);
  });

  it("CLI: thoát 1 và in file:dòng khi có vi phạm; thoát 0, không in gì khi sạch", () => {
    // CLI nhận thư mục app làm đối số đầu (mặc định suy từ vị trí script — kiểm ở ca dưới).
    const bad = spawnSync("node", [SCRIPT, root], { encoding: "utf8" });
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /src\/app\/bad\.tsx:2: /);
    assert.match(bad.stdout, /src\/lib\/bad2\.ts:1: /);

    rmSync(join(root, "src/app/bad.tsx"));
    rmSync(join(root, "src/lib/bad2.ts"));
    rmSync(join(root, "src/components/blocks/y.tsx"));
    rmSync(join(root, "src/components/examples/z.tsx"));
    const clean = spawnSync("node", [SCRIPT, root], { encoding: "utf8" });
    assert.equal(clean.status, 0);
    assert.equal(clean.stdout, "");
    rmSync(root, { recursive: true, force: true });
  });

  it("CLI không đối số: quét apps/web của kho (suy từ vị trí script) và sạch", () => {
    const r = spawnSync("node", [SCRIPT], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  });
});
