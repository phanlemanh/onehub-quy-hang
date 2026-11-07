// Bộ kiểm rò nguồn ra AI của đường ô lạ (hàng 69, AC-1, E1b; ADR-0011 qđ 2): gói ô lạ — thứ thứ hai rời Quỹ hàng sang nhà
// cung cấp AI — dựng bằng đúng mã trình duyệt dùng, trên mọi file của bộ thử hàng 64, bộ lạ hàng 68 (kế hoạch đã gộp đề
// xuất ghi sẵn) và bộ ô lạ hàng 69, không được chứa chuỗi cấm nào.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  applyPlan,
  bamGoi,
  buildProfile,
  classifyColumns,
  dungGoiDeXuat,
  dungGoiOLa,
  gopDeXuat,
  kiemDeXuat,
  planFromDictionary,
  readTable,
  type Grid,
  type ImportContext,
} from "@quy-hang/core/import";
import { CAM_LO, luoiOLa } from "../../../../../../_acceptance/nhap-o-la/thu/bo-o-la";
import { sinhBoLa } from "../../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../../../core/test/import/sinh";

const DE_XUAT_68 = new URL("../../../../../../_acceptance/nhap-tac-tu-ke-hoach/de-xuat/", import.meta.url);

async function goiOLaCua(grid: Grid, ctx: ImportContext, gop: boolean) {
  const table = readTable(grid);
  const profile = buildProfile(table, classifyColumns(table)).columns;
  let plan = planFromDictionary(table);
  if (gop) {
    const goi = dungGoiDeXuat(profile, plan);
    const tep = JSON.parse(readFileSync(new URL(`${await bamGoi(goi)}.json`, DE_XUAT_68), "utf8")) as { dauRa: unknown };
    plan = gopDeXuat(table, plan, kiemDeXuat(goi, tep.dauRa));
  }
  return dungGoiOLa(profile, plan, applyPlan(table, plan, ctx).rows);
}

test("gói ô lạ không chứa chuỗi cấm", async () => {
  const ctx = { today: HOM_NAY, catalog: danhMucMau() };
  const thu = sinhBoThu();
  const la = sinhBoLa();
  assert.equal(thu.length + la.length, 13, "9 file bộ thử hàng 64 + 4 file lạ");
  for (const [t, gop] of [...thu.map((t) => [t, false] as const), ...la.map((t) => [t, true] as const)]) {
    const goi = JSON.stringify(await goiOLaCua(t.grid ?? (await import("@quy-hang/core/import")).parseCsv((await import("@quy-hang/core/import")).decodeText(t.bytes!)), ctx, gop));
    const trung = t.dapAn.camLo.filter((s) => goi.includes(s));
    assert.deepEqual(trung, [], `${t.ten}: gói ô lạ chứa chuỗi cấm ${JSON.stringify(trung)}`);
  }
  const boOLa = JSON.stringify(await goiOLaCua(luoiOLa(), { today: HOM_NAY }, false));
  assert.deepEqual(CAM_LO.filter((s) => boOLa.includes(s)), [], "bộ ô lạ: gói chứa chuỗi cấm");
});

test("mồi rò ô lạ: số và tên trong ô lạ, cột chủ nhà mang chữ lạ", async () => {
  const grid: Grid = [
    ["Toà", "Mã căn", "Giá (tỷ)", "Trạng thái", "Chủ nhà"],
    ["Toà A", "A-01.03", "thu về 4.2 gọi 0900 000 011", "chủ Nguyễn Văn An giữ", "thương lượng"],
    ["Toà A", "A-01.05", "thu về 4.2", "Đang bán", "[Tên]"],
  ];
  const goi = await goiOLaCua(grid, { today: HOM_NAY }, false);
  const json = JSON.stringify(goi);
  for (const s of ["0900 000 011", "0900000011", "Nguyễn Văn An", "[Tên]"]) assert.ok(!json.includes(s), `gói chứa «${s}»`);
  assert.ok(!goi.o.some((o) => o.cot === 4), "gói có ô của cột Chủ nhà");
  // Đối chứng dương trên tệp sạch cùng khuôn cột (cột có mồi số bị bộ phân loại che cả cột — chặn càng chặt càng đúng).
  const sach = await goiOLaCua([grid[0]!, ["Toà A", "A-01.05", "thu về 4.2", "giữ chỗ", "[Tên]"]], { today: HOM_NAY }, false);
  assert.ok(sach.o.some((o) => o.giaTri === "thu về 4.2"), "đối chứng dương: ô «thu về 4.2» sạch có trong gói");
  assert.ok(sach.o.some((o) => o.giaTri === "giữ chỗ"), "đối chứng dương: ô «giữ chỗ» sạch có trong gói");
});
