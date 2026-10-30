import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chonBanCai } from "../tim-kit.mjs";

describe("tim-kit chonBanCai", () => {
  const a = mkdtempSync(join(tmpdir(), "kit-a-"));
  const b = mkdtempSync(join(tmpdir(), "kit-b-"));
  const u = mkdtempSync(join(tmpdir(), "kit-u-"));
  const entries = [
    { scope: "project", projectPath: "/kho/khac", installPath: a },
    { scope: "project", projectPath: "/kho/chinh", installPath: b },
    { scope: "user", installPath: u },
  ];
  it("chọn bản cài cho checkout chính khi worktree không có bản riêng", () => {
    assert.equal(chonBanCai(entries, ["/kho/chinh/.claude/worktrees/x", "/kho/chinh"]), b);
  });
  it("không khớp kho nào → bản cài phạm vi người dùng", () => {
    assert.equal(chonBanCai(entries, ["/kho/la"]), u);
  });
  it("bản cài trỏ thư mục không còn → không in gì (thu-san tự dừng có tên)", () => {
    assert.equal(chonBanCai([{ scope: "user", installPath: join(u, "khong-co") }], ["/kho/la"]), "");
    rmSync(a, { recursive: true }); rmSync(b, { recursive: true }); rmSync(u, { recursive: true });
  });
});
