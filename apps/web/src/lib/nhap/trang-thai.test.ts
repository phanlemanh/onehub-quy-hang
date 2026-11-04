// Trạng thái năm bước của màn Nhập Excel (hàng man-nhap-excel, E4, E8b, E6). Fetch giả ghi lại mọi yêu cầu; dữ liệu mẫu
// [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { test } from "node:test";
import { findSourceLeaks } from "@quy-hang/core/access";
import { decodeText, parseCsv, type Grid, type ImportContext } from "@quy-hang/core/import";

import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../../../packages/core/test/import/sinh";
import { chayOng } from "./duong-ong";
import { tienDoCho, xemThuTatCa, type Fetch, type TienDoGhi } from "./goi-api";
import { boDong, chonDauChu, coQuyen, coTheGhi, coTheTiep, daXemThu, goiDong, napTep, sangBuoc, suaO, taoTrangThai, type TrangThaiNhap } from "./trang-thai";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const TEP = { ten: "bang-hang.csv", bam: "a".repeat(64), loai: "csv" as const, trang: null };
const tuTep = (ten: string): Grid => {
  const t = sinhBoThu().find((x) => x.ten === ten)!;
  return t.grid ?? parseCsv(decodeText(t.bytes!));
};
const voi = (vai: string[], g: Grid): TrangThaiNhap => napTep(taoTrangThai(vai), TEP, chayOng(g, CTX));

/** Fetch giả: mở lần nhập trả mã, gói dòng trả «tạo» cho dòng không bỏ. Ghi lại thân từng yêu cầu. */
function fetchGia() {
  const ds: { url: string; body: unknown }[] = [];
  const f: Fetch = async (url, init) => {
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    ds.push({ url, body });
    if (url === "/api/v1/imports") return Response.json({ id: "00000000-0000-4000-8000-000000000001", status: "planned" }, { status: 201 });
    const rows = (body as { rows: { row: number; skip?: boolean }[] }).rows.map((r) => ({ row: r.row, action: r.skip ? "skip" : "create", reason: "x" }));
    return Response.json({ importId: "x", rows, summary: {} });
  };
  return { f, ds };
}

test("xem trước: sửa ô tính lại dấu và giá trị gửi", () => {
  let s = voi(["listing_agent"], tuTep("ban-gia"));
  const o = s.ong!;
  const cotGia = o.plan.columns.findIndex((c) => c.target === "listPrice");
  const dong = o.dong.find((d) => d.cells.find((c) => c.target === "listPrice")?.mark === "needs_person");
  assert.ok(dong, "ban-gia phải có ô giá cần người");
  s = suaO(s, dong.source, cotGia, "3,2 tỷ", CTX);
  const sau = s.ong!.dong.find((d) => d.source === dong.source)!.cells.find((c) => c.target === "listPrice")!;
  assert.notEqual(sau.mark, "needs_person");
  assert.equal(goiDong(s).find((r) => r.row === dong.source)!.cells[cotGia], "3,2 tỷ");

  let m = voi(["listing_agent"], tuTep("ban-ma-can"));
  const cotMa = m.ong!.plan.columns.findIndex((c) => c.target === "unitNumber");
  const chan = m.ong!.dong.find((d) => d.cells.find((c) => c.target === "unitNumber")?.mark === "needs_person");
  const tot = m.ong!.dong.find((d) => d.cells.find((c) => c.target === "unitNumber")?.mark === "keep");
  assert.ok(chan && tot, "ban-ma-can phải có ô mã cần người và ô mã giữ nguyên");
  const maTot = String(m.ong!.table.rows.find((r) => r.source === tot.source)!.cells[cotMa]);
  // Mã đúng của một căn khác chưa xuất hiện trong tệp — tránh thành trùng dòng.
  const daCo = new Set(m.ong!.table.rows.map((r) => String(r.cells[cotMa])));
  const toa = chan.cells.find((c) => c.target === "buildingName")?.value ?? tot.cells.find((c) => c.target === "buildingName")?.value;
  const toaNha = danhMucMau().subdivisions.flatMap((sd) => sd.buildings).find((bd) => bd.buildingName === toa) ?? danhMucMau().subdivisions[0]!.buildings[0]!;
  const moi = toaNha.units.map((u) => u.unitNumber).find((u) => !daCo.has(u) && u !== maTot);
  assert.ok(moi, "danh mục mẫu phải còn mã chưa dùng");
  m = suaO(m, chan.source, cotMa, moi, CTX);
  assert.equal(m.ong!.dong.find((d) => d.source === chan.source)!.cells.find((c) => c.target === "unitNumber")!.mark, "keep");
});

test("xem trước: bỏ dòng gửi skip", () => {
  const s = boDong(voi(["listing_agent"], tuTep("ban-gia")), 3);
  for (const r of goiDong(s)) {
    if (r.row === 3) assert.equal(r.skip, true);
    else assert.equal("skip" in r, false, `dòng ${r.row}`);
  }
});

test("xem trước: đổi gì sau xem thử thì khoá ghi", () => {
  const XT = { importId: "x", rows: [{ row: 2, action: "create" as const, reason: "x" }], summary: { create: 1, update: 0, supplement: 0, skip: 0 } };
  let s = daXemThu(voi(["listing_agent"], tuTep("ban-gia")), XT);
  assert.equal(coTheGhi(s), true, "sau xem thử");
  s = suaO(s, s.ong!.table.rows[0]!.source, 0, "Toà A", CTX);
  assert.equal(coTheGhi(s), false, "sau sửa ô");
  s = daXemThu(s, XT);
  s = boDong(s, s.ong!.table.rows[1]!.source);
  assert.equal(coTheGhi(s), false, "sau bỏ dòng");
  s = daXemThu(s, XT);
  assert.equal(coTheGhi(s), true, "xem thử lại");
});

test("quyền: vai khác không gọi API nhập", async () => {
  const { f, ds } = fetchGia();
  const s = voi(["buyer_agent"], tuTep("ban-gia"));
  assert.equal(coQuyen(s.vai), false);
  assert.equal(coTheTiep(s), false);
  const kq = await xemThuTatCa(f, s);
  assert.ok("loi" in kq, "buyer_agent gọi được API nhập");
  assert.equal(ds.length, 0, "buyer_agent: fetch có yêu cầu");
  // Đối chứng dương: Đầu chủ vào bước tải và gọi được.
  const d = voi(["listing_agent"], tuTep("ban-gia"));
  assert.equal(coTheTiep(d), true);
});

test("quyền: Trưởng nhóm chọn một đầu chủ cho cả tệp", () => {
  let s = voi(["team_lead"], tuTep("ban-gia"));
  assert.equal(coTheTiep(s), false, "chưa chọn đầu chủ");
  s = chonDauChu(s, "user-x");
  assert.equal(coTheTiep(s), true);
  for (const r of goiDong(s)) assert.equal(r.agentUserId, "user-x", `dòng ${r.row}`);
  for (const r of goiDong(voi(["listing_agent"], tuTep("ban-gia")))) assert.equal("agentUserId" in r, false);
});

test("rò nguồn: mở lần nhập không mang giá trị nguồn", async () => {
  const MAU = ["[Tên chủ mẫu]", "0900000012", "0900 000 012", "+84900000012", "3200000000"];
  const g: Grid = [
    ["Toà", "Mã căn", "SĐT chủ", "Tên chủ", "Giá đáy", "Giá"],
    ["Toà A", "A-01.01", "0900000012", "[Tên chủ mẫu]", 3200000000, "3,5 tỷ"],
    ["Toà A", "A-01.02", "0900 000 012", "[Tên chủ mẫu]", 3200000000, "3,6 tỷ"],
    ["Toà A", "A-01.03", "+84900000012", "[Tên chủ mẫu]", 3200000000, "3,7 tỷ"],
  ];
  const { f, ds } = fetchGia();
  const s = sangBuoc(voi(["listing_agent"], g), 4);
  const kq = await xemThuTatCa(f, s);
  assert.ok(!("loi" in kq));
  const mo = ds.find((d) => d.url === "/api/v1/imports")!;
  assert.deepEqual(findSourceLeaks(mo.body, MAU), [], "thân mở lần nhập rò giá trị nguồn (0900 000 012)");
  const chuoi = JSON.stringify(mo.body);
  for (const m of MAU) assert.ok(!chuoi.includes(m), `thân mở lần nhập mang «${m}»`);
  // Đối chứng dương: gói dòng CÓ mang số chủ — fetch giả bắt được thân thật.
  const goi = ds.find((d) => d.url.endsWith("/rows"))!;
  assert.ok(JSON.stringify(goi.body).includes("0900 000 012"));
});

test("rò nguồn: chỉ gọi địa chỉ đã khai", async () => {
  const { f, ds } = fetchGia();
  await xemThuTatCa(f, sangBuoc(voi(["listing_agent"], tuTep("ban-gia")), 4));
  const DUOC = [/^\/api\/v1\/imports$/, /^\/api\/v1\/imports\/[0-9a-f-]{36}\/rows$/, /^\/api\/v1\/imports\/[0-9a-f-]{36}$/, /^\/api\/v1\/catalog$/, /^\/api\/v1\/imports\/agents$/];
  assert.ok(ds.length > 0);
  for (const d of ds) assert.ok(DUOC.some((re) => re.test(d.url)), d.url);
});

test("ghi: tiến độ cũ không dùng cho bản xem thử mới", () => {
  const XT = (importId: string) => ({ importId, rows: [], summary: { create: 1, update: 0, supplement: 0, skip: 0 } });
  const t: TienDoGhi = { importId: "lan-1", goi: [[{ row: 1, cells: [] }]], xong: [], loi: { loi: "x", goi: 1 } };
  assert.equal(tienDoCho(t, XT("lan-1")), t, "cùng lần nhập: dùng tiếp tiến độ");
  assert.equal(tienDoCho(t, XT("lan-2")), null, "xem thử lại ra lần nhập mới: tiến độ cũ gửi gói cũ tới lần nhập cũ");
  assert.equal(tienDoCho(t, null), null, "bỏ dòng sau xem thử: tiến độ cũ còn dùng");
});
