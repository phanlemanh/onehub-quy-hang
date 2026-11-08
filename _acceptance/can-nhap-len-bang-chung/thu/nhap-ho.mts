// Trưởng nhóm nhập hộ qua API (đúng lời gọi màn Nhập gửi) một dòng «Đang bán» thiếu pháp lý, giao đầu chủ `agent` giữ căn —
// khung «hom-nay-b» của eval E9. In mã căn tạo ra.
//   cd apps/web && TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx ../../_acceptance/can-nhap-len-bang-chung/thu/nhap-ho.mts <url> <cookie> <agentUserId> <mã>
import { createHash } from "node:crypto";
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";

const [url, cookie, agent, ma] = process.argv.slice(2);
if (!url || !cookie || !agent || !ma) throw new Error("cần <url> <cookie> <agentUserId> <mã>");
const homNay = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const dong: Cell[] = [ma.startsWith("B") ? "Toà B" : "Toà A", ma, "3,5 tỷ", "bao phí", "Đang bán", homNay];
const bang = readTable([["Toà", "Mã căn", "Giá", "Phí", "Tình trạng", "Ngày xác nhận"], dong]);
const goi = async (path: string, body: unknown) => {
  const r = await fetch(`${url}${path}`, { method: "POST", headers: { "content-type": "application/json", cookie, origin: url }, body: JSON.stringify(body) });
  const j = (await r.json()) as Record<string, unknown>;
  if (!r.ok) throw new Error(`${path}: ${r.status} ${JSON.stringify(j)}`);
  return j;
};
const mo = await goi("/api/v1/imports", {
  fileName: "[Tệp nhập hộ].xlsx",
  fileHash: createHash("sha256").update(`nhap-ho-${Date.now()}`).digest("hex"),
  fileKind: "xlsx",
  headers: bang.headers,
  headerRow: 0,
  plan: planFromDictionary(bang),
  units: [{ row: 2, buildingName: dong[0], unitNumber: ma }],
});
const kq = await goi(`/api/v1/imports/${mo.id}/rows`, { dryRun: false, rows: [{ row: 2, cells: dong, agentUserId: agent }] });
console.log((kq.rows as { listingId: string }[])[0]!.listingId);
