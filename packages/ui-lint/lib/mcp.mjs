// MCP của kho (hàng 91, AC-1): `.mcp.json` khai `reui` (HTTP, style base-nova của kho) và `shadcn`; khoá ReUI chỉ đi qua
// biến môi trường `REUI_LICENSE_KEY` — tệp không bao giờ mang chuỗi khoá. Kiểm chuẩn và test đọc cùng một hàm này.
import { existsSync, readFileSync } from "node:fs";

export const REUI = { type: "http", url: "https://mcp.reui.io", style: "base-nova", auth: "Bearer ${REUI_LICENSE_KEY:-}" };
export const SHADCN = { command: "npx", args: ["shadcn@latest", "mcp"] };

/** Chuỗi trông như khoá thật: một đoạn chữ-số liền từ 16 ký tự, không nằm trong `${…}`. */
const KHOA_THAT = /[A-Za-z0-9_-]{16,}/;

/** Trả mảng lỗi; rỗng là đạt. */
export function kiemMcp(duongTep) {
  if (!existsSync(duongTep)) return ["mcp: thiếu .mcp.json ở gốc kho"];
  let j;
  try {
    j = JSON.parse(readFileSync(duongTep, "utf8"));
  } catch {
    return ["mcp: .mcp.json không phải JSON"];
  }
  const loi = [];
  const may = j?.mcpServers ?? {};
  const reui = may.reui;
  if (!reui) loi.push("mcp: thiếu máy chủ reui");
  else {
    if (reui.type !== REUI.type || reui.url !== REUI.url) loi.push(`mcp: reui phải là ${REUI.type} ${REUI.url}`);
    if (reui.headers?.["X-Reui-Style"] !== REUI.style) loi.push(`mcp: reui phải gửi X-Reui-Style: ${REUI.style}`);
  }
  const shadcn = may.shadcn;
  if (!shadcn) loi.push("mcp: thiếu máy chủ shadcn");
  else if (shadcn.command !== SHADCN.command || !(shadcn.args ?? []).includes("shadcn@latest"))
    loi.push("mcp: shadcn phải chạy npx shadcn@latest mcp");
  for (const [ten, m] of Object.entries(may))
    for (const [h, v] of Object.entries(m?.headers ?? {})) {
      if (typeof v !== "string") continue;
      if (KHOA_THAT.test(v.replace(/\$\{[^}]*\}/g, ""))) loi.push(`mcp: chuỗi trông như khoá ở ${ten}.headers.${h} — chỉ dùng \${REUI_LICENSE_KEY:-}`);
    }
  return loi;
}
