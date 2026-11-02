// AC-1 (hàng 91): đọc `.mcp.json` thật của kho, rồi phá từng chỗ trên bản sao — mỗi chiều đỏ ghim thông điệp.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kiemMcp } from "../lib/mcp.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THAT = join(ROOT, ".mcp.json");

function banSao(sua) {
  const j = JSON.parse(readFileSync(THAT, "utf8"));
  sua(j);
  const p = join(mkdtempSync(join(tmpdir(), "mcp-")), ".mcp.json");
  writeFileSync(p, JSON.stringify(j));
  return p;
}

describe("mcp", () => {
  it("mcp: kho khai reui và shadcn", () => {
    const j = JSON.parse(readFileSync(THAT, "utf8"));
    assert.equal(j.mcpServers.reui.type, "http");
    assert.equal(j.mcpServers.reui.url, "https://mcp.reui.io");
    assert.equal(j.mcpServers.reui.headers["X-Reui-Style"], "base-nova");
    assert.equal(j.mcpServers.reui.headers.Authorization, "Bearer ${REUI_LICENSE_KEY:-}");
    assert.equal(j.mcpServers.shadcn.command, "npx");
    assert.deepEqual(j.mcpServers.shadcn.args, ["shadcn@latest", "mcp"]);
    assert.deepEqual(kiemMcp(THAT), []);
  });

  it("mcp: đối chứng — thiếu shadcn thì đỏ", () => {
    const loi = kiemMcp(banSao((j) => delete j.mcpServers.shadcn));
    assert.ok(loi.some((l) => l.includes("mcp: thiếu máy chủ shadcn")), loi.join("\n"));
  });

  it("mcp: đối chứng — thiếu reui thì đỏ", () => {
    const loi = kiemMcp(banSao((j) => delete j.mcpServers.reui));
    assert.ok(loi.some((l) => l.includes("mcp: thiếu máy chủ reui")), loi.join("\n"));
  });

  it("mcp: chuỗi khoá thật thì đỏ", () => {
    const loi = kiemMcp(banSao((j) => (j.mcpServers.reui.headers.Authorization = "Bearer reui_live_abcdef1234567890")));
    assert.ok(loi.some((l) => l.includes("mcp: chuỗi trông như khoá")), loi.join("\n"));
  });

  it("mcp: đối chứng — sai style thì đỏ", () => {
    const loi = kiemMcp(banSao((j) => (j.mcpServers.reui.headers["X-Reui-Style"] = "radix-nova")));
    assert.ok(loi.some((l) => l.includes("X-Reui-Style: base-nova")), loi.join("\n"));
  });
});
