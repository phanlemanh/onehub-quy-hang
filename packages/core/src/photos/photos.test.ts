// Luật ảnh căn ở lõi (hàng 18: E2, E3, E7, E8 và bảng ca của E5). Ma trận viết tay — không sinh từ hàm đang kiểm.
// Bảng ai thấy ngăn nội bộ là tệp dữ liệu; bộ kiểm cách ly (packages/db/tests) nạp CÙNG tệp để đo luật cơ sở dữ liệu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CEILING } from "../data-classes";
import {
  anhDanhMuc,
  anhRaNgoai,
  canSeeUnitInternal,
  CHU_DANH_MUC_TRONG,
  coBanNhe,
  COMPARTMENT_CLASS,
  docNgayChup,
  kiemTepAnh,
  MAX_PHOTO_BYTES,
  nhanAnh,
  sapXep,
  type UnitPhoto,
} from ".";

const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)));
const chu = (s: string) => new TextEncoder().encode(s);

test("E2 kiểm tệp ảnh: 7 ca × (kết quả, lý do)", () => {
  const ca: [string, Uint8Array, number, { ok: boolean; v: string }][] = [
    ["JPEG đúng byte đầu", new Uint8Array(JPEG), 1000, { ok: true, v: "image/jpeg" }],
    ["PNG", new Uint8Array(PNG), 1000, { ok: true, v: "image/png" }],
    ["WebP", new Uint8Array(WEBP), 1000, { ok: true, v: "image/webp" }],
    [".jpg là văn bản", chu("day khong phai anh"), 18, { ok: false, v: "Không phải ảnh" }],
    ["GIF", chu("GIF89a......"), 12, { ok: false, v: "Không phải ảnh" }],
    ["JPEG quá 10 MB một byte", new Uint8Array(JPEG), MAX_PHOTO_BYTES + 1, { ok: false, v: "Ảnh quá 10 MB" }],
    ["JPEG đúng 10 MB", new Uint8Array(JPEG), MAX_PHOTO_BYTES, { ok: true, v: "image/jpeg" }],
  ];
  assert.equal(MAX_PHOTO_BYTES, 10_485_760);
  for (const [ten, b, n, mong] of ca) {
    const kq = kiemTepAnh(b, n);
    assert.equal(kq.ok, mong.ok, `ca «${ten}»: ok`);
    assert.equal(kq.ok ? kq.type : kq.lyDo, mong.v, `ca «${ten}»: giá trị`);
  }
});

test("bản nhẹ cạnh dài ≤ 480, giữ tỉ lệ; ảnh nhỏ giữ nguyên", () => {
  assert.deepEqual(coBanNhe(2000, 1500), { w: 480, h: 360 });
  assert.deepEqual(coBanNhe(1500, 2000), { w: 360, h: 480 });
  assert.deepEqual(coBanNhe(300, 200), { w: 300, h: 200 });
});

/** JPEG tối thiểu có APP1 Exif: IFD0 trỏ ExifIFD, ExifIFD có một thẻ ngày. Viết tay theo chuẩn TIFF, little-endian. */
function jpegExif(the: number, ngay: string): Uint8Array {
  const tiff: number[] = [];
  const u16 = (v: number) => tiff.push(v & 0xff, (v >> 8) & 0xff);
  const u32 = (v: number) => (u16(v & 0xffff), u16(v >>> 16));
  tiff.push(0x49, 0x49); u16(42); u32(8); // header, IFD0 ở 8
  u16(1); u16(0x8769); u16(4); u32(1); u32(26); u32(0); // IFD0: ExifIFD ở 26
  u16(1); u16(the); u16(2); u32(20); u32(44); u32(0); // ExifIFD: thẻ ngày, chuỗi ở 44
  for (const c of ngay) tiff.push(c.charCodeAt(0));
  tiff.push(0);
  const app1 = [..."Exif"].map((c) => c.charCodeAt(0)).concat([0, 0], tiff);
  const len = app1.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, len >> 8, len & 0xff, ...app1, 0xff, 0xda, 0, 2]);
}

const P = (o: Partial<UnitPhoto> & { id: string }): UnitPhoto => ({
  buildingName: "[Toà mẫu]", unitNumber: "A-01.01", compartment: "shareable", displayOrder: 0, isCover: false, isSample: false,
  takenAt: null, addedAt: "2026-11-01T03:00:00Z", contentType: "image/jpeg", width: 10, height: 10, ...o,
});

test("E3 sắp ảnh, bìa, nhãn, ngày chụp: 8 ca viết trước", () => {
  const ds = [P({ id: "a", displayOrder: 0 }), P({ id: "b", displayOrder: 1, isCover: true }), P({ id: "c", displayOrder: 2 })];
  assert.deepEqual(sapXep(ds, "shareable").map((p) => p.id), ["b", "a", "c"], "bìa đầu rồi theo thứ tự");
  assert.deepEqual(sapXep(ds.map((p) => ({ ...p, isCover: false })), "shareable").map((p) => p.id), ["a", "b", "c"], "chưa chọn bìa → ảnh đầu là bìa");
  assert.equal(nhanAnh(P({ id: "s", isSample: true, takenAt: "2026-10-20" })), "Ảnh mẫu");
  assert.equal(nhanAnh(P({ id: "t", takenAt: "2026-10-20" })), "Ảnh thật · 20/10/2026");
  assert.equal(nhanAnh(P({ id: "u", takenAt: null, addedAt: "2026-11-01T03:00:00Z" })), "Ảnh thật · 01/11/2026");
  assert.equal(docNgayChup(jpegExif(0x9003, "2026:10:20 08:15:00")), "2026-10-20", "EXIF DateTimeOriginal");
  assert.equal(docNgayChup(new Uint8Array([...JPEG, 0, 16, ...new Array(14).fill(0), 0xff, 0xda])), null, "không EXIF");
  const hong = jpegExif(0x9003, "2026:10:20 08:15:00").slice(0, 30);
  assert.equal(docNgayChup(hong), null, "EXIF hỏng");
});

test("E3 chiều đỏ được ghim: thẻ DateTime (0x0132, ngày sửa) không được đọc như ngày chụp", () => {
  assert.equal(docNgayChup(jpegExif(0x0132, "2026:11:01 09:00:00")), null, "ngày sửa lọt thành ngày chụp");
});

test("E7 ảnh ra ngoài: chỉ ngăn Gửi được, đúng thứ tự, nội bộ không bao giờ ra", () => {
  const ds = [
    P({ id: "g2", displayOrder: 2 }),
    P({ id: "g0", displayOrder: 0 }),
    P({ id: "g1", displayOrder: 1, isCover: true }),
    P({ id: "mau", displayOrder: 3, isSample: true }),
    P({ id: "nb1", compartment: "internal", displayOrder: 0 }),
    P({ id: "nb2", compartment: "internal", displayOrder: 1, isCover: true }),
  ];
  const ra = anhRaNgoai(ds);
  assert.deepEqual(ra.map((p) => p.id), ["g1", "g0", "g2", "mau"]);
  assert.equal(nhanAnh(ra.find((p) => p.id === "mau")!), "Ảnh mẫu");
  assert.equal(COMPARTMENT_CLASS.internal, "source");
  assert.equal(CEILING[COMPARTMENT_CLASS.internal], "never_leaves_company");
  const moiLop = Object.keys(CEILING) as (keyof typeof CEILING)[];
  assert.deepEqual(anhRaNgoai(ds, { thoaThuan: moiLop }).map((p) => p.id), ["g1", "g0", "g2", "mau"], "thoả thuận mọi lớp vẫn không mở nội bộ");
});

test("E8 ảnh tự có từ mã: danh mục thật chưa có ảnh; dòng giả có ảnh ra đúng toà và mã", () => {
  const goc = new URL("../../../db/seed/mau/du-lieu-mau.json", import.meta.url);
  type DM = { danhMuc: { subdivisions: { buildings: { buildingName: string; units: { unitNumber: string }[] }[] }[] } };
  const mau = JSON.parse(readFileSync(goc, "utf8")) as DM;
  const toa = mau.danhMuc.subdivisions[0]?.buildings[0];
  const mot = toa && toa.units[0] ? { buildingName: toa.buildingName, ...toa.units[0] } : null;
  assert.ok(mot, "dữ liệu mẫu phải có ít nhất một căn danh mục");
  assert.deepEqual(anhDanhMuc(mot), []);
  const media = [{ kind: "floor_plan" as const, url: "https://example.test/a.png" }];
  assert.deepEqual(anhDanhMuc({ buildingName: "Toà A", unitNumber: "A-01.01", media }), media);
  assert.deepEqual(anhDanhMuc(null), []);
  assert.equal(CHU_DANH_MUC_TRONG, "Danh mục chưa có mặt bằng, ảnh view cho căn này");
});

type Ca = { o: string; vai: string[]; giu: boolean; coLanRao: boolean; doc_noi_bo: boolean; doc_byte_noi_bo: boolean; them_noi_bo: boolean; them_gui_duoc: boolean; doc_gui_duoc: boolean };
const BANG: Ca[] = JSON.parse(readFileSync(new URL("./bang-xem-noi-bo.json", import.meta.url), "utf8"));

test("E5 bảng ai thấy ngăn nội bộ ở lõi: 8 người × 5 ô", () => {
  assert.equal(BANG.length, 8);
  let o = 0;
  for (const c of BANG) {
    const nguoi = `u-${c.o}`;
    const holder = !c.coLanRao ? null : c.giu ? nguoi : "u-dau-chu-giu-can-khac";
    const thay = canSeeUnitInternal({ userId: nguoi, roles: c.vai }, { holderUserId: holder });
    for (const k of ["doc_noi_bo", "doc_byte_noi_bo", "them_noi_bo", "them_gui_duoc"] as const) {
      assert.equal(thay, c[k], `${c.o} × ${k}`);
      o++;
    }
    assert.equal(true, c.doc_gui_duoc, `${c.o} × doc_gui_duoc`);
    o++;
  }
  assert.equal(o, 40);
});
