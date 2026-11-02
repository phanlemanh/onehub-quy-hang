// Dòng mức đủ theo bản trên máy (hàng 28, E8). Ngăn kho mẫu, ghi bằng apTrenMay — đường ghi thật của bộ đồng bộ.
import assert from "node:assert/strict";
import { test } from "node:test";
import { completeness } from "@quy-hang/core/listing";
import { apTrenMay } from "@/lib/sync/ap-tren-may";
import { moHoSo } from "@/lib/sync/doc";
import { canMau, NGAY, suKien } from "@/lib/sync/mau.test-helpers";
import { nganTrong, type ListingView, type Ngan } from "@/lib/sync/types";
import { DA_DU, dongMucDu, type DongMucDu } from "./muc-du";

/** Hồ sơ 2/5: giá kèm phí và nội thất; lần kéo mang trường mức đủ của máy chủ lúc ấy. */
function nganMau(): Ngan {
  const { view } = canMau("h1", "Toà A", [
    suKien(2, "price_changed", { listPrice: 2_750_000_000, feeInclusion: "included" }),
    suKien(3, "details_changed", { furnished: "Đủ đồ" }),
  ]);
  return { ...nganTrong(), listings: [{ ...view, completeness: completeness(view) }] };
}

let so = 0;
function ghi(n: Ngan, payload: Record<string, unknown>): Ngan {
  const kq = apTrenMay(n, "h1", "details_changed", payload, NGAY, `op-${so++}`);
  assert.ok(kq.ok, JSON.stringify(kq));
  return kq.ngan;
}

type Doc = (n: Ngan) => DongMucDu;
const docTrenMay: Doc = (n) => dongMucDu(moHoSo(n, "h1")!.can);

// [tên, các lần ghi, dòng mong, còn thiếu mong].
const MA_TRAN: [string, Record<string, unknown>[], string, string][] = [
  ["hồ sơ 2/5", [], "Mức đủ 2/5", "Còn thiếu: pháp lý, tài chính, tình trạng sử dụng"],
  ["ghi pháp lý ra 3/5", [{ legalStatus: "Có sổ" }], "Mức đủ 3/5", "Còn thiếu: tài chính, tình trạng sử dụng"],
  ["ghi rồi xoá ra lại 2/5", [{ legalStatus: "Có sổ" }, { legalStatus: null }], "Mức đủ 2/5", "Còn thiếu: pháp lý, tài chính, tình trạng sử dụng"],
  ["đủ năm mục", [{ legalStatus: "Có sổ" }, { financing: "Không vay" }, { occupantType: "Trống" }], "Mức đủ 5/5", DA_DU],
];

const caSai = (doc: Doc) =>
  MA_TRAN.filter(([, cacLan, chu, thieu]) => {
    const d = doc(cacLan.reduce(ghi, nganMau()));
    return d.chu !== chu || d.conThieu !== thieu;
  }).map(([ten]) => ten);

test("mức đủ: theo bản trên máy", () => {
  assert.equal(MA_TRAN.length, 4);
  assert.deepEqual(caSai(docTrenMay), []);
  assert.deepEqual(dongMucDu(null), { filled: 0, total: 5, chu: "Mức đủ 0/5", conThieu: "Còn thiếu: giá và phí, nội thất, pháp lý, tài chính, tình trạng sử dụng" });
});

test("mức đủ: đối chứng đỏ — đọc mức đủ của lần kéo cũ bị gọi tên", () => {
  const docLanKeo: Doc = (n) => {
    const c = (moHoSo(n, "h1")!.can as ListingView & { completeness: { filled: number; total: number } }).completeness;
    return { filled: c.filled, total: c.total, chu: `Mức đủ ${c.filled}/${c.total}`, conThieu: "" };
  };
  assert.ok(caSai(docLanKeo).includes("ghi pháp lý ra 3/5"));
});
