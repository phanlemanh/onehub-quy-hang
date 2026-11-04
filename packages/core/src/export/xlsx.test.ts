// E5 (hàng 43, AC-5) — bộ ghi .xlsx của lõi ghi bảng ba căn (chữ tiếng Việt có dấu và số); bộ đọc độc lập
// packages/db/seed/doc-xlsx.py (thư viện chuẩn Python, không dùng mã của bộ ghi) đọc lại đúng bảng đã xem trước. Chiều đỏ:
// bản sao bộ ghi tính sai crc32 trên CÙNG bảng → bộ đọc từ chối và nêu tên mục.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { crc32 as crc32Node } from "node:zlib";
import { canMoi, type CanNoiBo } from "../redaction";
import { crc32, ghiXlsx, tenTep, xuatBang, type CotGocNhin } from ".";
import { dongGoiZip, mucXlsx } from "./xlsx";

const GOC_KHO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const BO_DOC = join(GOC_KHO, "packages", "db", "seed", "doc-xlsx.py");
const TODAY = "2026-11-04";
const COT: readonly CotGocNhin[] = ["buildingName", "unitNumber", "livingArea", "standardStatus", "listPrice", "feeInclusion", "directionFaces"];
const ba = (): CanNoiBo[] => [
  { ...canMoi(), buildingName: "[Mẫu] Toà Ánh Dương", unitNumber: "A-12.05", listPrice: 4_250_000_000 },
  { ...canMoi(), buildingName: "[Mẫu] Toà Ánh Dương", unitNumber: "A-08.01", standardStatus: "Pending", listPrice: 1_950_000_000, feeInclusion: "included" },
  { ...canMoi(), buildingName: "[Mẫu] Toà Bình Minh", unitNumber: "B-15.10", standardStatus: "Hold", directionFaces: "Tây Bắc" },
];
const MUC_BAT_BUOC = ["[Content_Types].xml", "_rels/.rels", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/worksheets/sheet1.xml"];

type KetQuaDoc = { ok: true; sheet: string; dong: unknown[][] } | { ok: false; loi: string };

function docBangPython(bytes: Uint8Array): KetQuaDoc {
  const thu = mkdtempSync(join(tmpdir(), "xuat-xlsx-"));
  const tep = join(thu, "bang.xlsx");
  try {
    writeFileSync(tep, bytes);
    const ra = execFileSync("python3", ["-I", BO_DOC, tep], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const j = JSON.parse(ra) as { sheet: string; dong: unknown[][] };
    return { ok: true, ...j };
  } catch (e) {
    return { ok: false, loi: String((e as { stderr?: string }).stderr ?? e) };
  } finally {
    rmSync(thu, { recursive: true, force: true });
  }
}

/** Đọc thư mục trung tâm của zip (không nén) — tên mục và crc khai so với crc tính lại trên dữ liệu. */
function mucZip(b: Uint8Array): { ten: string; crcKhai: number; crcThat: number }[] {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const cuoi = b.length - 22;
  assert.equal(v.getUint32(cuoi, true), 0x06054b50);
  const so = v.getUint16(cuoi + 10, true);
  let p = v.getUint32(cuoi + 16, true);
  const ra = [];
  for (let i = 0; i < so; i++) {
    const crcKhai = v.getUint32(p + 16, true);
    const dai = v.getUint32(p + 20, true);
    const dTen = v.getUint16(p + 28, true);
    const lech = v.getUint32(p + 42, true);
    const ten = new TextDecoder().decode(b.subarray(p + 46, p + 46 + dTen));
    const dTenDau = v.getUint16(lech + 26, true);
    const du = b.subarray(lech + 30 + dTenDau, lech + 30 + dTenDau + dai);
    ra.push({ ten, crcKhai, crcThat: crc32Node(du) });
    p += 46 + dTen;
  }
  return ra;
}

test("E5 crc32 tự tính khớp crc32 của node:zlib", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const mau = new TextEncoder().encode("Toà Ánh Dương · 4,25 tỷ");
  assert.equal(crc32(mau), crc32Node(mau));
  assert.equal(crc32(new Uint8Array()), 0);
});

test("E5 bộ đọc độc lập đọc lại đúng bảng xem trước — ba căn, chữ có dấu và số; đủ mục, crc khớp, tên tệp", () => {
  const bang = xuatBang(ba(), { mau: "xlsx", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]" });
  // Thêm một cột số để đi qua đường ô số của bộ ghi.
  const coSo = { cot: [...bang.cot, "Số thứ tự"], dong: bang.dong.map((d, i) => [...d, i + 1]) };
  const bytes = ghiXlsx(coSo);
  const doc = docBangPython(bytes);
  assert.ok(doc.ok, doc.ok ? "" : doc.loi);
  assert.equal(doc.sheet, "Bảng hàng");
  assert.deepEqual(doc.dong, [coSo.cot, ...coSo.dong]);
  assert.deepEqual(doc.dong[0], ["Toà", "Mã căn", "Diện tích", "Trạng thái", "Giá", "Phí", "Hướng", "Số thứ tự"]);
  assert.deepEqual(doc.dong[3], ["[Mẫu] Toà Bình Minh", "B-15.10", "74,5 m²", "Tạm ngừng", "—", "—", "Tây Bắc", 3]);

  const muc = mucZip(bytes);
  for (const m of MUC_BAT_BUOC) assert.ok(muc.some((x) => x.ten === m), `thiếu ${m}`);
  for (const m of muc) assert.equal(m.crcKhai, m.crcThat, `crc ${m.ten}`);
  assert.equal(tenTep("xlsx", TODAY), "bang-hang-2026-11-04.xlsx");
  assert.equal(tenTep("pdf", "2026-11-04T10:00:00+07:00"), "bang-hang-2026-11-04.pdf");
  assert.equal(tenTep("png", TODAY), "bang-hang-2026-11-04.png");
  assert.throws(() => tenTep("xlsx", "04/11/2026"));
  // Cùng đầu vào ra cùng từng byte.
  assert.deepEqual(ghiXlsx(coSo), bytes);
});

test("E5 chiều đỏ — bản sao bộ ghi tính sai crc32 của sheet → bộ đọc từ chối và nêu tên mục", () => {
  const bang = xuatBang(ba(), { mau: "xlsx", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]" });
  const crcSai = (du: Uint8Array) => (du.length > 0 && new TextDecoder().decode(du).includes("<sheetData>") ? crc32(du) ^ 1 : crc32(du));
  const hong = dongGoiZip(mucXlsx(bang), crcSai);
  const doc = docBangPython(hong);
  assert.equal(doc.ok, false);
  assert.match(doc.ok ? "" : doc.loi, /CRC lệch ở mục xl\/worksheets\/sheet1\.xml/);
});
