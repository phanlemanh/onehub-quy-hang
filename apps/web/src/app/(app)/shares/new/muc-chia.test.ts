// Ô «Mức chia (%)» của màn Gửi (hàng 44, E3b): thân POST /api/v1/shares mang mức chia đúng như người gửi để — mặc định của
// sàn khi chưa chạm ô, giá trị sửa khi sửa, vắng khi để trống; khách riêng không bao giờ mang khoá ấy.
import assert from "node:assert/strict";
import { test } from "node:test";
import { mucChiaGui, mucChiaMacDinh, taoBoGui, type GoiApi } from "./gui";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("gửi: mức chia của bộ đi vào thân", async () => {
  const MAC_DINH = mucChiaMacDinh({ items: [{ key: "broker_page.commission_split_pct", value: 50 }] });
  assert.equal(MAC_DINH, 50);
  // [ca, người nhận, ô nhập (null = chưa chạm), khoá mong đợi trong thân (undefined = vắng)]
  const BANG: [string, "nhom_moi_gioi" | "khach_rieng", string | null, number | undefined][] = [
    ["chưa chạm ô — mặc định của sàn", "nhom_moi_gioi", null, 50],
    ["sửa thành 40", "nhom_moi_gioi", "40", 40],
    ["để trống", "nhom_moi_gioi", "", undefined],
    ["khách riêng", "khach_rieng", "40", undefined],
  ];
  let dem = 0;
  for (const [ca, nguoiNhan, nhap, mong] of BANG) {
    const loi: unknown[] = [];
    const goi: GoiApi = async (_m, _p, body) => {
      loi.push(body);
      return { status: 201, body: { code: "AbCdEfGhIjKl" } };
    };
    const bo = taoBoGui({ goi, goc: "https://quyhang.test", layAnh: async (_a, ten) => new File(["x"], ten) });
    const muc = nguoiNhan === "nhom_moi_gioi" ? mucChiaGui(nhap, MAC_DINH) : null;
    assert.notEqual(muc, "sai");
    await bo.gui({ nguoiNhan, prospectId: nguoiNhan === "khach_rieng" ? id(9) : null, listingIds: [id(1)], tin: "[link]", ban: [{}], mucChia: muc as number | null });
    const than = loi[0] as Record<string, unknown>;
    assert.equal(than.commissionSplitPct, mong, `sửa mức chia không vào Lần gửi — ${ca}`);
    assert.equal(Object.hasOwn(than, "commissionSplitPct"), mong !== undefined, `khoá mức chia — ${ca}`);
    dem++;
  }
  assert.equal(dem, 4);
  // Chữ không đọc được hay ngoài khoảng → khoá gửi; dấu phẩy đọc được.
  for (const sai of ["abc", "120", "-1", "12.345"]) assert.equal(mucChiaGui(sai, 50), "sai", `nhận nhầm «${sai}»`);
  assert.equal(mucChiaGui("12,5", 50), 12.5);
  assert.equal(mucChiaMacDinh({ items: [] }), null);
});
