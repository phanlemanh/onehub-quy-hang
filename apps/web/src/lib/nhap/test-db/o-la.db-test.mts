// Ô lạ: «Dùng» ở màn tới xem thử và ghi của API thật trên Postgres dãy (hàng 69: E4c). Tệp cùng khuôn với
// `o-la.fixture.ts` (giá đơn vị tỷ, cột trạng thái, KHÔNG cột điều kiện phí), toà và mã căn lấy từ danh mục của sàn thử để
// dòng không bị bỏ vì căn lạ. Màn đi đúng các hàm của lib/nhap: đọc tệp, đường ống, trạng thái, `dungDeXuat`, gọi API.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import ExcelJS from "exceljs";
import type { Grid, ImportContext } from "@quy-hang/core/import";

import { app, H, nguoi, sanMoi, type Nguoi } from "../../sync/test-db/ha-tang.mjs";
import { docTep, type TepDoc } from "../doc-tep";
import { chayOng } from "../duong-ong";
import { batDauGhi, ghiTiep, laLoi, xemThuTatCa, xongGhi, type Fetch, type TienDoGhi } from "../goi-api";
import { dungDeXuat, hoiOLa, ttOLaDau, type HoiOLa } from "../o-la";
import { COT, LUOI_O_LA } from "../o-la.fixture";
import { napTep, sangBuoc, taoTrangThai, type TrangThaiNhap, type XemThu } from "../trang-thai";

after(H.cleanup);
const HOM_NAY = new Date().toISOString().slice(0, 10);

const fetchCua = (n: Nguoi, companyId: string): Fetch => (url, init) =>
  app.request(`${H.BASE_URL}${url}`, { ...init, headers: { ...(init?.headers as Record<string, string>), origin: H.BASE_URL, cookie: n.cookie(companyId) } });

/** Đường ô lạ giả: «thu về 4.2» → «4,2 tỷ KBP». */
const hoi: HoiOLa = async (goi) => ({
  cheDo: "ai",
  deXuat: goi.o.filter((o) => o.giaTri === "thu về 4.2").map((o) => ({ id: o.id, giaTri: "4,2 tỷ KBP", lyDo: "Chủ thu về 4,2 tỷ." })),
  loi: [],
});

async function trangThai(g: Grid, ctx: ImportContext): Promise<TrangThaiNhap> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bảng hàng");
  for (const r of g) ws.addRow(r);
  const doc = (await docTep("o-la.xlsx", new Uint8Array(await wb.xlsx.writeBuffer()))) as TepDoc;
  assert.ok(!("loi" in doc), "đọc tệp");
  return sangBuoc(napTep(taoTrangThai(["listing_agent"]), { ten: "o-la.xlsx", bam: "d".repeat(64), loai: "xlsx", trang: doc.trangChon }, chayOng(doc.grid, ctx)), 3);
}

async function lanNhap(dung: boolean) {
  const s = await sanMoi(`ola-${dung ? "dung" : "goc"}`);
  const X = await nguoi(`ola-${dung ? "dung" : "goc"}-x`, [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const f = fetchCua(X, s.companyId);
  const catalog = await (await f("/api/v1/catalog")).json();
  const can = catalog.subdivisions.flatMap((sd: any) => sd.buildings.flatMap((b: any) => b.units.map((u: any) => ({ toa: b.buildingName, ma: u.unitNumber }))))[0];
  // Dòng «thu về 4.2» của tệp mẫu, toà và mã căn có trong danh mục.
  const dong = LUOI_O_LA.find((r) => r[COT.gia] === "thu về 4.2")!;
  const g: Grid = [LUOI_O_LA[0]!, [can.toa, can.ma, dong[COT.gia]!, "Đang bán"]];
  let st = await trangThai(g, { today: HOM_NAY, catalog });
  if (dung) {
    const tt = await hoiOLa(st.ong!, hoi, ttOLaDau());
    st = dungDeXuat(st, tt, st.ong!.table.rows[0]!.source, COT.gia, { today: HOM_NAY, catalog }).s;
  }
  const x = (await xemThuTatCa(f, st)) as XemThu;
  assert.ok(!laLoi(x), "xem thử");
  return { s, f, st: { ...st, xemThu: x }, x };
}

test("Dùng đề xuất tới xem thử của máy chủ", async () => {
  const { s, f, st, x } = await lanNhap(true);
  assert.notEqual(x.rows[0]!.action, "skip", `dòng bị bỏ: ${x.rows[0]!.reason}`);
  const t = batDauGhi(st);
  assert.ok(!laLoi(t), "bắt đầu ghi");
  const xong = await ghiTiep(f, t as TienDoGhi);
  assert.ok(xongGhi(xong), "ghi");
  const ev = await H.appPool.query<{ payload: { listPrice: number; feeInclusion: string } }>(
    "select e.payload from listing_events e join listings l on l.id = e.listing_id where l.company_id = $1 and e.type = 'price_changed'",
    [s.companyId],
  );
  assert.equal(ev.rows.length, 1, "một sự kiện giá");
  assert.equal(Number(ev.rows[0]!.payload.listPrice), 4_200_000_000);
  assert.equal(ev.rows[0]!.payload.feeInclusion, "excluded");

  // Đối chứng cùng tệp, không «Dùng»: dòng bị bỏ vì ô giá cần người.
  const goc = await lanNhap(false);
  assert.equal(goc.x.rows[0]!.action, "skip", "chữ gốc «thu về 4.2» mà dòng không bị bỏ");
});
