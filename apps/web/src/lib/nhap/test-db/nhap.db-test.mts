// Màn Nhập Excel nói với API thật trên Postgres dãy (hàng man-nhap-excel: E5, E7, E8c). Tệp sinh bằng exceljs — bên ghi
// thật; màn đi đúng các hàm của lib/nhap (đọc tệp, đường ống, trạng thái, gọi API). Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import ExcelJS from "exceljs";
import { LY_DO_DONG_NHAP, type Grid, type ImportContext } from "@quy-hang/core/import";

import { app, H, nguoi, sanMoi, type Nguoi } from "../../sync/test-db/ha-tang.mjs";
import { docTep, type TepDoc } from "../doc-tep";
import { chayOng } from "../duong-ong";
import { batDauGhi, docDauChu, ghiTiep, laLoi, tongGhi, xemThuTatCa, xongGhi, type Fetch, type TienDoGhi } from "../goi-api";
import { chonDauChu, napTep, taoTrangThai, type TrangThaiNhap, type XemThu } from "../trang-thai";

after(H.cleanup);

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí"];
const HOM_NAY = new Date().toISOString().slice(0, 10);

/** Fetch của một người ở một sàn, đi thẳng vào API trong tiến trình. */
const fetchCua = (n: Nguoi, companyId: string): Fetch => (url, init) =>
  app.request(`${H.BASE_URL}${url}`, { ...init, headers: { ...(init?.headers as Record<string, string>), origin: H.BASE_URL, cookie: n.cookie(companyId) } });

async function canDanhMuc(f: Fetch): Promise<{ ctx: ImportContext; can: { toa: string; ma: string }[] }> {
  const catalog = await (await f("/api/v1/catalog")).json();
  const can = catalog.subdivisions.flatMap((sd: any) => sd.buildings.flatMap((b: any) => b.units.map((u: any) => ({ toa: b.buildingName, ma: u.unitNumber }))));
  return { ctx: { today: HOM_NAY, catalog }, can };
}

async function tepXlsx(g: Grid): Promise<TepDoc> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bảng hàng");
  for (const r of g) ws.addRow(r);
  const doc = await docTep("bang-hang.xlsx", new Uint8Array(await wb.xlsx.writeBuffer()));
  assert.ok(!("loi" in doc), "đọc tệp");
  return doc as TepDoc;
}

async function trangThai(vai: string[], g: Grid, ctx: ImportContext): Promise<TrangThaiNhap> {
  const doc = await tepXlsx(g);
  return napTep(taoTrangThai(vai), { ten: "bang-hang.xlsx", bam: "c".repeat(64), loai: "xlsx", trang: doc.trangChon }, chayOng(doc.grid, ctx));
}

const dem = async (bang: string, where: string, args: unknown[]) => Number((await H.appPool.query(`select count(*)::int n from ${bang} where ${where}`, args)).rows[0].n);

async function xemThu(f: Fetch, s: TrangThaiNhap): Promise<XemThu> {
  const x = await xemThuTatCa(f, s);
  assert.ok(!laLoi(x), `xem thử: ${laLoi(x) ? x.loi : ""}`);
  return x as XemThu;
}

async function ghiHet(f: Fetch, s: TrangThaiNhap): Promise<TienDoGhi> {
  const t = batDauGhi(s);
  assert.ok(!laLoi(t), `bắt đầu ghi: ${laLoi(t) ? t.loi : ""}`);
  const xong = await ghiTiep(f, t as TienDoGhi);
  assert.ok(xongGhi(xong), `ghi: ${xong.loi?.loi ?? ""}`);
  return xong;
}

test("nhập: xem thử bằng ghi trên 450 dòng", async () => {
  const s = await sanMoi("nx-450");
  const X = await nguoi("nx-450-x", [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const Y = await nguoi("nx-450-y", [{ companyId: s.companyId, vai: ["listing_agent"] }]);
  const f = fetchCua(X, s.companyId);
  const { ctx, can } = await canDanhMuc(f);
  // Căn đã có hàng mở của Y — dòng 7 của tệp sẽ thành tin bổ sung.
  const giu = can[0]!;
  const r = await Y.goi("POST", "/api/v1/listings", { buildingName: giu.toa, unitNumber: giu.ma }, s.companyId);
  assert.equal(r.status, 201);
  const con = can.slice(1);
  const dong: Grid = [TIEU_DE];
  for (let i = 1; i <= 450; i++) {
    const c = i <= 170 ? con[i - 1]! : { toa: "Toà A", ma: `Z-${900 + i}` };
    dong.push([c.toa, c.ma, "3,5 tỷ", "bao phí"]);
  }
  // Ma trận trùng viết tay: cùng gói (5, 6), vắt gói 1–2 (10, 210), vắt gói 2–3 (390, 420).
  dong[6] = [...dong[5]!];
  dong[210] = [...dong[10]!];
  dong[390] = [con[170]!.toa, con[170]!.ma, "3,5 tỷ", "bao phí"];
  dong[420] = [...dong[390]!];
  dong[7] = [giu.toa, giu.ma, "3,5 tỷ", "bao phí"];
  const st = await trangThai(["listing_agent"], dong, ctx);

  const truoc = await dem("listings", "company_id = $1", [s.companyId]);
  const xt = await xemThu(f, st);
  assert.equal(await dem("listings", "company_id = $1", [s.companyId]), truoc, "xem thử để lại hàng");
  assert.equal(await dem("import_rows", "import_id = $1", [xt.importId]), 0, "xem thử để lại dòng nhập");

  const ghi = await ghiHet(f, { ...st, xemThu: xt });
  const ra = new Map(ghi.xong.flatMap((g) => g.rows).map((x) => [x.row, x.action + " " + x.reason]));
  const lech = xt.rows.filter((x) => ra.get(x.row) !== x.action + " " + x.reason).map((x) => `${x.row}: ${x.action} ${x.reason} → ${ra.get(x.row)}`);
  assert.deepEqual(tongGhi(ghi), xt.summary, `xem thử ≠ ghi — ${lech.slice(0, 6).join(" | ")}`);
  assert.equal(await dem("listings", "company_id = $1", [s.companyId]), truoc + xt.summary.create);
  const theoDong = (rows: { row: number; action: string; reason: string }[]) => new Map(rows.map((x) => [x.row, [x.action, x.reason]]));
  const a = theoDong(xt.rows);
  const b = theoDong(ghi.xong.flatMap((g) => g.rows));
  for (const so of [5, 6, 10, 210, 390, 420]) assert.deepEqual(b.get(so), a.get(so), `xem thử ≠ ghi ở dòng ${so}`);
  for (const [dau, sau] of [[5, 6], [10, 210], [390, 420]] as const) assert.equal(a.get(sau)?.[0], "skip", `dòng ${sau} trùng dòng ${dau}`);
  assert.equal(a.get(7)?.[0], "supplement");
});

test("nhập: lỗi mạng giữa gói, thử lại không nhân đôi", async () => {
  const chay = async (nhan: string, matPhanHoi: boolean) => {
    const s = await sanMoi(nhan);
    const X = await nguoi(`${nhan}-x`, [{ companyId: s.companyId, vai: ["listing_agent"] }]);
    const that = fetchCua(X, s.companyId);
    const { ctx, can } = await canDanhMuc(that);
    const dong: Grid = [TIEU_DE];
    for (let i = 1; i <= 300; i++) {
      const c = i <= 160 ? can[i - 1]! : { toa: "Toà A", ma: `Z-${900 + i}` };
      dong.push([c.toa, c.ma, "3,5 tỷ", "bao phí"]);
    }
    const st = await trangThai(["listing_agent"], dong, ctx);
    const xt = await xemThu(that, st);
    let lanGoi2 = 0;
    const gui: number[][] = [];
    const f: Fetch = async (url, init) => {
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      if (body && body.dryRun === false) gui.push(body.rows.map((r: { row: number }) => r.row));
      const res = await that(url, init);
      // Gói 2 lần đầu: máy chủ đã ghi rồi phản hồi mất trên đường về.
      if (matPhanHoi && body && body.dryRun === false && body.rows[0].row > 200 && lanGoi2++ === 0) throw new Error("mất phản hồi");
      return res;
    };
    let t = await ghiTiep(f, batDauGhi({ ...st, xemThu: xt }) as TienDoGhi);
    if (matPhanHoi) {
      assert.equal(t.xong.length, 1, "gói 1 xong");
      assert.equal(t.loi?.goi, 2, "gói 2 lỗi");
      t = await ghiTiep(f, t);
      assert.equal(gui.at(-1)!.length, 100, "thử lại gửi đúng 100 dòng của gói 2");
      assert.deepEqual(gui.at(-1), gui.at(-2), "thử lại gửi đúng các dòng của gói 2");
    }
    assert.ok(xongGhi(t));
    const tao = await dem("listing_events", "import_id = $1 and type = 'created'", [xt.importId]);
    assert.equal(tao, xt.summary.create, `${nhan}: nhân đôi`);
    return tongGhi(t);
  };
  assert.deepEqual(await chay("nx-mang", true), await chay("nx-mang-dc", false));
});

test("nhập: Trưởng nhóm nhập hộ đầu chủ", async () => {
  const A = await sanMoi("nx-tn-a");
  const B = await sanMoi("nx-tn-b");
  const T = await nguoi("nx-tn-t", [{ companyId: A.companyId, vai: ["team_lead"] }]);
  const X = await nguoi("nx-tn-x", [{ companyId: A.companyId, vai: ["listing_agent"] }]);
  const Y = await nguoi("nx-tn-y", [{ companyId: B.companyId, vai: ["listing_agent"] }]);
  const f = fetchCua(T, A.companyId);
  const { ctx, can } = await canDanhMuc(f);
  const ds = await docDauChu(f);
  assert.ok(!laLoi(ds) && ds.some((d) => d.userId === X.userId), "danh sách đầu chủ có X");
  const dong: Grid = [TIEU_DE, ...can.slice(0, 210).map((c) => [c.toa, c.ma, "3,5 tỷ", "bao phí"])];
  const st = chonDauChu(await trangThai(["team_lead"], dong, ctx), X.userId);
  const xt = await xemThu(f, st);
  const ghi = await ghiHet(f, { ...st, xemThu: xt });
  const ids = ghi.xong.flatMap((g) => g.rows).filter((r) => r.action === "create").map((r) => r.listingId!);
  assert.equal(ids.length, xt.summary.create);
  for (const id of ids) {
    const giu = (await H.appPool.query("select user_id from listing_agent_assignments where listing_id = $1 order by seq desc limit 1", [id])).rows[0]?.user_id;
    assert.equal(giu, X.userId, `đầu chủ giữ căn là T thay vì X (hàng ${id})`);
  }
  // Đối chứng âm: đầu chủ của sàn B → mọi dòng bỏ với lý do của lõi.
  const sai = chonDauChu(await trangThai(["team_lead"], [TIEU_DE, ...can.slice(210, 215).map((c) => [c.toa, c.ma, "3,5 tỷ", "bao phí"])], ctx), Y.userId);
  const xs = await xemThu(f, sai);
  for (const r of xs.rows) assert.deepEqual([r.action, r.reason], ["skip", LY_DO_DONG_NHAP.chuaDauChu], `dòng ${r.row}`);
});
