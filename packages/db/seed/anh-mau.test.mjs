// Bài kiểm ảnh vẽ bằng mã của hồ sơ nap-mau-co-anh (E2). Thuần — không cơ sở dữ liệu. Ảnh được kiểm bằng chính luật tệp
// ảnh của lõi; phá thử trên bản sao byte, đỏ với thông điệp nêu thứ tự hàng.
//   node --import tsx --test packages/db/seed/anh-mau.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { kiemTepAnh } from "../../core/src/photos/index.ts";
import { CAO, CAO_NHE, RONG, RONG_NHE, anhMau } from "./anh-mau.mjs";

const MOT_MB = 1024 * 1024;

/** Chiều rộng, cao đọc từ khối IHDR (ngay sau chữ ký 8 byte, độ dài 4 byte, loại 4 byte). */
const chieuIhdr = (b) => {
  assert.equal(b.toString("ascii", 12, 16), "IHDR", "khối đầu không phải IHDR");
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
};

/** Lỗi đầu tiên của một tệp so với luật lõi và chiều khai; null là lành. */
function loiTep(i, ten, b, w, h) {
  const k = kiemTepAnh(b.subarray(0, 16), b.length);
  if (!k.ok) return `anh-mau i=${i} ${ten}: ${k.lyDo}`;
  if (k.type !== "image/png") return `anh-mau i=${i} ${ten}: loại ${k.type}, mong image/png`;
  const c = chieuIhdr(b);
  if (c.w !== w || c.h !== h) return `anh-mau i=${i} ${ten}: IHDR ${c.w}×${c.h}, mong ${w}×${h}`;
  if (b.length >= MOT_MB) return `anh-mau i=${i} ${ten}: ${b.length} byte, không dưới 1 MB`;
  return null;
}

test("anh-mau: tất định, đúng khuôn lõi, đúng chiều, dưới 1 MB (E2)", () => {
  assert.ok(anhMau(0).goc.equals(anhMau(0).goc), "cùng i=0 hai lần ra byte khác");
  assert.ok(anhMau(0).nhe.equals(anhMau(0).nhe), "bản nhẹ cùng i=0 hai lần ra byte khác");
  assert.ok(!anhMau(0).goc.equals(anhMau(1).goc), "i=0 và i=1 ra cùng byte");
  for (const i of [0, 1, 28]) {
    const a = anhMau(i);
    assert.equal(a.width, RONG);
    assert.equal(a.height, CAO);
    assert.equal(loiTep(i, "goc", a.goc, RONG, CAO), null);
    assert.equal(loiTep(i, "nhe", a.nhe, RONG_NHE, CAO_NHE), null);
    assert.ok(a.nhe.length < a.goc.length, `anh-mau i=${i}: bản nhẹ không nhỏ hơn bản gốc`);
  }
});

test("anh-mau: phá thử — sửa byte đầu thì luật lõi trả «Không phải ảnh», thông điệp nêu i", () => {
  const i = 28;
  const hong = Buffer.from(anhMau(i).goc);
  hong[0] = 0x00;
  assert.equal(loiTep(i, "goc", hong, RONG, CAO), "anh-mau i=28 goc: Không phải ảnh");
  // Phá chiều khai: đổi chiều rộng trong IHDR thì phép so chiều đỏ.
  const lech = Buffer.from(anhMau(i).nhe);
  lech.writeUInt32BE(161, 16);
  assert.equal(loiTep(i, "nhe", lech, RONG_NHE, CAO_NHE), "anh-mau i=28 nhe: IHDR 161×120, mong 160×120");
});

test("anh-mau: thứ tự hàng không hợp lệ bị từ chối", () => {
  assert.throws(() => anhMau(-1), /thứ tự hàng phải là số nguyên ≥ 0, nhận -1/);
  assert.throws(() => anhMau(1.5), /nhận 1\.5/);
});
