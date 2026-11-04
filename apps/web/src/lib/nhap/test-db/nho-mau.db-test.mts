// Màn Nhập Excel nhớ mẫu, vòng trọn trên Postgres dãy (hàng 67, AC-5, E5): ghi tệp 1 có đổi đích một cột và sửa một ô
// «cần người» → tệp 2 cùng mẫu (khác thứ tự cột) ghép sẵn theo kế hoạch đã ghi. Tệp sinh bằng exceljs, màn đi đúng các hàm
// của lib/nhap. Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import ExcelJS from "exceljs";
import { LY_DO_THEO_MAU, type Grid, type ImportContext, type ImportPlan } from "@quy-hang/core/import";

import { app, H, nguoi, sanMoi, type Nguoi } from "../../sync/test-db/ha-tang.mjs";
import { docTep, type TepDoc } from "../doc-tep";
import { chayOng } from "../duong-ong";
import { batDauGhi, docMau, ghiTiep, laLoi, xemThuTatCa, xongGhi, type Fetch, type TienDoGhi } from "../goi-api";
import { doiDichCot, napTep, suaO, taoTrangThai, type TrangThaiNhap, type XemThu } from "../trang-thai";

after(H.cleanup);

const HOM_NAY = new Date().toISOString().slice(0, 10);
const fetchCua = (n: Nguoi, companyId: string): Fetch => (url, init) =>
  app.request(`${H.BASE_URL}${url}`, { ...init, headers: { ...(init?.headers as Record<string, string>), origin: H.BASE_URL, cookie: n.cookie(companyId) } });

async function danhMuc(f: Fetch): Promise<{ ctx: ImportContext; can: { toa: string; ma: string }[] }> {
  const catalog = await (await f("/api/v1/catalog")).json();
  const can = catalog.subdivisions.flatMap((sd: any) => sd.buildings.flatMap((b: any) => b.units.map((u: any) => ({ toa: b.buildingName, ma: u.unitNumber }))));
  return { ctx: { today: HOM_NAY, catalog }, can };
}

async function luoiQuaExcel(g: Grid): Promise<TepDoc> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bảng hàng");
  for (const r of g) ws.addRow(r);
  const doc = await docTep("bang-hang.xlsx", new Uint8Array(await wb.xlsx.writeBuffer()));
  assert.ok(!("loi" in doc), "đọc tệp");
  return doc as TepDoc;
}

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Trạng thái", "Nhãn"];
const tep = (can: { toa: string; ma: string }[], tu: number, coc: number[]): Grid => [
  TIEU_DE,
  ...[0, 1, 2, 3].map((i) => [can[tu + i]!.toa, can[tu + i]!.ma, "3,5 tỷ", coc.includes(i) ? "đã cọc rồi" : "Còn", `nhãn ${i}`]),
];
const dao = (g: Grid): Grid => g.map((r) => [...r].reverse());

async function ghiLanDau(f: Fetch, ctx: ImportContext, g: Grid, ghi: boolean): Promise<string> {
  const doc = await luoiQuaExcel(g);
  let s: TrangThaiNhap = napTep(taoTrangThai(["listing_agent"]), { ten: "bang-hang.xlsx", bam: "d".repeat(64), loai: "xlsx", trang: doc.trangChon }, chayOng(doc.grid, ctx));
  s = doiDichCot(s, s.ong!.table.headers.indexOf("Nhãn"), "custom:Nhãn", ctx);
  const tt = s.ong!.table.headers.indexOf("Trạng thái");
  const coc = s.ong!.dong.find((d) => d.cells[tt]!.mark === "needs_person");
  assert.ok(coc, "tệp 1 phải có ô trạng thái «cần người»");
  s = suaO(s, coc.source, tt, "Đã cọc", ctx);
  const x = await xemThuTatCa(f, s);
  assert.ok(!laLoi(x), `xem thử: ${laLoi(x) ? x.loi : ""}`);
  if (ghi) {
    const t = batDauGhi({ ...s, xemThu: x as XemThu });
    assert.ok(!laLoi(t));
    const xong = await ghiTiep(f, t as TienDoGhi);
    assert.ok(xongGhi(xong), `ghi: ${xong.loi?.loi ?? ""}`);
  }
  return (x as XemThu).importId;
}

async function nhapLai(f: Fetch, ctx: ImportContext, g: Grid) {
  const mau = await docMau(f);
  assert.ok(!laLoi(mau), `đọc mẫu: ${laLoi(mau) ? mau.loi : ""}`);
  const doc = await luoiQuaExcel(g);
  return chayOng(doc.grid, ctx, mau as never);
}

test("nhớ mẫu: nhập lại là ghép sẵn", async () => {
  const s = await sanMoi("nm-vong");
  const X = await nguoi("nm-vong-x", [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const f = fetchCua(X, s.companyId);
  const { ctx, can } = await danhMuc(f);
  const id = await ghiLanDau(f, ctx, tep(can, 0, [0, 2]), true);
  const daGhi = (await H.appPool.query<{ plan: ImportPlan & { headers: string[] }; status: string }>("select plan, status from imports where id = $1", [id])).rows[0]!;
  assert.equal(daGhi.status, "committed");

  const ong = await nhapLai(f, ctx, dao(tep(can, 4, [1, 3])));
  ong.table.headers.forEach((h, i) => {
    const goc = daGhi.plan.columns[daGhi.plan.headers.indexOf(h)]!;
    const cot = ong.plan.columns[i]!;
    assert.deepEqual({ target: cot.target, transform: cot.transform, valueMap: cot.valueMap }, { target: goc.target, transform: goc.transform, valueMap: goc.valueMap }, `cột «${h}»`);
    assert.ok(cot.reason.startsWith(LY_DO_THEO_MAU), `cột «${h}»: ${cot.reason}`);
  });
  const tt = ong.table.headers.indexOf("Trạng thái");
  const coc = ong.dong.filter((d) => ong.table.rows.find((r) => r.source === d.source)!.cells[tt] === "đã cọc rồi");
  assert.equal(coc.length, 2);
  for (const d of coc) assert.notEqual(d.cells[tt]!.mark, "needs_person", `dòng ${d.source}: «đã cọc rồi» vẫn cần người`);
});

test("nhớ mẫu: chỉ xem thử thì không dạy mẫu", async () => {
  const s = await sanMoi("nm-xem");
  const X = await nguoi("nm-xem-x", [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const f = fetchCua(X, s.companyId);
  const { ctx, can } = await danhMuc(f);
  await ghiLanDau(f, ctx, tep(can, 0, [0]), false);
  const ong = await nhapLai(f, ctx, dao(tep(can, 4, [1])));
  const nhan = ong.plan.columns[ong.table.headers.indexOf("Nhãn")]!;
  assert.notEqual(nhan.target, "custom:Nhãn", "cột đổi đích của lần chỉ xem thử không được theo mẫu");
  assert.ok(!ong.plan.columns.some((c) => c.reason.startsWith(LY_DO_THEO_MAU)), "không cột nào theo mẫu");
});
