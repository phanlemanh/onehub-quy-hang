// Màn Nhập Excel nhớ mẫu (hàng 67, E6 E8 E9). Lưới viết tay đi qua đường ống thật của màn; fetch giả ghi lại mọi yêu cầu.
// Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Grid, ImportContext } from "@quy-hang/core/import";

import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import { chayOng } from "./duong-ong";
import { batDauGhi, ghiTiep, laLoi, moLanNhap, xemThuTatCa, type Fetch } from "./goi-api";
import { chonBuoc, coTheChonBuoc, daXemThu, napTep, sangBuoc, suaO, taoTrangThai, type TrangThaiNhap } from "./trang-thai";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const TEP = { ten: "bang-hang.csv", bam: "a".repeat(64), loai: "csv" as const, trang: null };
const voi = (g: Grid): TrangThaiNhap => napTep(taoTrangThai(["listing_agent"]), TEP, chayOng(g, CTX));

// Ba ô «đã cọc rồi» ở cột trạng thái, ba ô cùng chữ ở cột ghi chú; thêm cột số chủ, tên chủ, chữ tự do, chưa rõ.
const LUOI: Grid = [
  ["Mã căn", "Toà", "Trạng thái", "Ghi chú", "Hướng", "Tên chủ", "Mô tả", "Nhãn"],
  ["A-01.01", "Toà A", "đã cọc rồi", "đã cọc rồi", "0900 000 011", "[Tên chủ mẫu]", "căn góc, view hồ, chủ nhà dễ tính", "x1"],
  ["A-01.02", "Toà A", "đã cọc rồi", "đã cọc rồi", "0900 000 012", "[Tên chủ mẫu]", "đã cọc rồi, chờ ký", "x2"],
  ["A-01.03", "Toà A", "đã cọc rồi", "đã cọc rồi", "0900 000 013", "[Tên chủ mẫu]", "tầng cao, thoáng mát cả ngày", "x3"],
  ["A-01.04", "Toà A", "đã cọc rồi", "Còn", "0900 000 014", "[Tên chủ mẫu]", "nội thất cơ bản, vào ở ngay", "x4"],
];

test("xem trước: sửa ô thành cách gọi của cột", () => {
  const s0 = voi(LUOI);
  const o = s0.ong!;
  const tt = o.table.headers.indexOf("Trạng thái");
  const gc = o.table.headers.indexOf("Ghi chú");
  const dau = o.dong.find((d) => d.cells[tt]!.mark === "needs_person")!;
  assert.ok(dau, "cột trạng thái phải có ô «cần người»");
  const s = suaO(s0, dau.source, tt, "Đã cọc", CTX);
  assert.ok(Object.hasOwn(s.ong!.plan.columns[tt]!.valueMap ?? {}, "đã cọc rồi"), "kế hoạch phải nhớ «đã cọc rồi»");
  const cung = s.ong!.dong.filter((d) => d.source !== dau.source && o.table.rows.find((r) => r.source === d.source)!.cells[tt] === "đã cọc rồi");
  assert.equal(cung.length, 3);
  for (const d of cung) assert.notEqual(d.cells[tt]!.mark, "needs_person", `dòng ${d.source}`);
  assert.deepEqual(
    s.ong!.dong.map((d) => d.cells[gc]!.mark),
    o.dong.map((d) => d.cells[gc]!.mark),
    "cột ghi chú không đổi",
  );
  assert.equal(s.soOTheo, 3);

  // Bốn lớp cột không học × sửa một ô: kế hoạch không đổi, chỉ ô ấy đổi.
  const KHONG_HOC: [string, string, string][] = [
    ["nguồn", "Hướng", "Đông"], // cột lớp nguồn mang đích giá trị đóng, ô «cần người»: chỉ lớp cột chặn việc học
    ["tên người", "Tên chủ", "[Tên]"],
    ["chữ tự do", "Mô tả", "Đã cọc"],
    ["chưa rõ", "Nhãn", "Đã cọc"],
  ];
  const huong = o.table.headers.indexOf("Hướng");
  assert.equal(o.lop[huong]!.cls, "source");
  assert.equal(o.plan.columns[huong]!.target, "directionFaces");
  assert.equal(o.dong[0]!.cells[huong]!.mark, "needs_person");
  let so = 0;
  for (const [lop, h, moi] of KHONG_HOC) {
    const i = o.table.headers.indexOf(h);
    const src = o.table.rows[0]!.source;
    const sau = suaO(s0, src, i, moi, CTX);
    assert.deepEqual(sau.ong!.plan, o.plan, `${lop}: kế hoạch phải giữ nguyên`);
    const doi = sau.ong!.table.rows.filter((r, j) => r.cells[i] !== o.table.rows[j]!.cells[i]).map((r) => r.source);
    assert.deepEqual(doi, [src], `${lop}: chỉ ô ấy đổi`);
    so += 2;
  }
  assert.equal(so + 5, 13);
});

test("thanh bước: khoá khi máy chủ đang chạy", () => {
  const s = sangBuoc(voi(LUOI), 3);
  const CHAY = [
    ["đang đọc tệp", { dangDoc: true, dangXemThu: false, dangGhi: false }],
    ["đang xem thử", { dangDoc: false, dangXemThu: true, dangGhi: false }],
    ["đang ghi", { dangDoc: false, dangXemThu: false, dangGhi: true }],
  ] as const;
  const RANH = { dangDoc: false, dangXemThu: false, dangGhi: false };
  let so = 0;
  for (const [ten, chay] of CHAY)
    for (const dich of [1, 2]) {
      assert.equal(coTheChonBuoc(s, dich, chay), false, `${ten}: bước ${dich} không được chọn`);
      assert.equal(chonBuoc(s, dich, chay).buoc, 3, `${ten}: bấm bước ${dich} vẫn ở bước 3`);
      so++;
    }
  // Đối chứng dương qua cùng cổng: rảnh thì bước đã qua chọn được và trạng thái sang đúng bước ấy; bước chưa tới thì không.
  assert.equal(coTheChonBuoc(s, 2, RANH), true);
  assert.equal(chonBuoc(s, 2, RANH).buoc, 2);
  assert.equal(chonBuoc(s, 4, RANH).buoc, 3, "bước chưa tới không chọn được");
  so += 2;
  assert.equal(so, 8);
  const man = readFileSync(new URL("../../app/(app)/imports/new/man-nhap.tsx", import.meta.url), "utf8");
  assert.match(man, /onChonBuoc=\{\(so\) => setS\(chonBuoc\(s, so, \{ dangDoc, dangXemThu: tienDoXem !== null, dangGhi \}\)\)\}/, "màn phải chặn thanh bước qua chonBuoc với đủ ba cờ chạy");
});

test("gọi API: thân lỗi không phải chuỗi vẫn là lỗi", async () => {
  const s = voi(LUOI);
  const LOI_KIEM = { success: false, error: { name: "ZodError", issues: [{ path: ["plan"], message: "Required" }] } };
  const ds: string[] = [];
  const loiMo: Fetch = async (url) => {
    ds.push(url);
    return Response.json(LOI_KIEM, { status: 400 });
  };
  const mo = await moLanNhap(loiMo, s);
  assert.ok(laLoi(mo), "mở lần nhập phải ra lỗi");
  assert.ok(laLoi(mo) && mo.loi.trim().length > 0, "lỗi phải có chữ");
  await xemThuTatCa(loiMo, s);
  assert.ok(!ds.some((u) => u.includes("undefined")), `gọi địa chỉ có undefined: ${ds.join(", ")}`);

  // Gói 2 của lần ghi nhận cùng thân lỗi: không tính là đã ghi.
  const dong = s.ong!.table.rows.length;
  const nhieu = napTep(taoTrangThai(["listing_agent"]), TEP, chayOng([LUOI[0]!, ...Array.from({ length: 250 }, (_, i) => LUOI[1 + (i % 4)]!.map((c, j) => (j === 0 ? `A-${String(i).padStart(3, "0")}` : c)))], CTX));
  assert.ok(dong > 0);
  const xemThu = { importId: "00000000-0000-4000-8000-000000000001", the: nhieu.the, rows: [], summary: { create: 0, update: 0, supplement: 0, skip: 0 } };
  const t0 = batDauGhi(daXemThu(nhieu, xemThu));
  assert.ok(!laLoi(t0), "bắt đầu ghi được");
  let lan = 0;
  const loiGoi2: Fetch = async () => (++lan === 1 ? Response.json({ importId: "x", rows: [], summary: {} }) : Response.json(LOI_KIEM, { status: 400 }));
  const t = await ghiTiep(loiGoi2, t0);
  assert.ok(t.loi, "tiến độ phải có lỗi");
  assert.equal(t.xong.length, 1, "chỉ gói 1 xong");
  assert.equal(t.loi?.goi, 2, "gói 2 không được tính là đã ghi");

  // Đối chứng dương: lỗi dạng chuỗi vẫn như cũ.
  const cu = await moLanNhap(async () => Response.json({ error: "import-plan-invalid" }, { status: 422 }), s);
  assert.deepEqual(cu, { loi: "import-plan-invalid", status: 422 });
});
