// Phát hàng theo cách gọi riêng (hàng 45: E6): tiêu đề cột và chữ ô phí theo từ vựng ra ngoài của sàn gửi.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TuVung } from "../labels";
import { canMoi, type CanNoiBo } from "../redaction";
import { xuatBang, type CotGocNhin } from "./index";

const TODAY = "2026-11-05";
const COT: CotGocNhin[] = ["buildingName", "listPrice", "feeInclusion", "legalStatus", "withdrawnReason"];
const hai = (): CanNoiBo[] => [
  { ...canMoi(), feeInclusion: "included" },
  { ...canMoi(), feeInclusion: "excluded" },
];
const TV: TuVung = {
  truong: { feeInclusion: "Phí CN", legalStatus: "Sổ", withdrawnReason: "Lý do" },
  giaTri: { feeInclusion: { included: "BP" }, withdrawnReason: { unreachable: "Mất liên lạc" } },
};

test("phát hàng: tiêu đề và ô theo từ vựng ra ngoài", () => {
  const b = xuatBang(hai(), { mau: "xlsx", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]", tuVung: TV });
  // Viết trước: cột lý do ngừng không ra ngoài nên vẫn bị bỏ, nhãn riêng của nó không xuất hiện ở đâu.
  assert.deepEqual(b.cot, ["Toà", "Giá", "Phí CN", "Sổ"]);
  assert.deepEqual(b.boQua, ["Lý do ngừng"]);
  const iPhi = b.khoa.indexOf("feeInclusion");
  assert.deepEqual(b.dong.map((d) => d[iPhi]), ["BP", "Không bao phí"]);
  assert.ok(!JSON.stringify(b).includes("Mất liên lạc") && !b.cot.includes("Lý do"));
  // Không từ vựng → đúng chữ dựng sẵn trước vòng này.
  const cu = xuatBang(hai(), { mau: "xlsx", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]" });
  assert.deepEqual(cu.cot, ["Toà", "Giá", "Phí", "Pháp lý"]);
  assert.deepEqual(cu.dong.map((d) => d[iPhi]), ["Bao phí", "Không bao phí"]);
});
