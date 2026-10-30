// AC-9: bảng trong ket-qua.md là bảng máy tính ra từ nhật ký phiên thật — đỏ tới khi phiên mất mạng thật xong.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { kiemNhatKyKhongIp } from '../../bai-thu-zalo/thu/kiem-chung.mjs';
import { bangKetQua, docJsonl, ketLuan, layBang } from './tom-tat.mjs';

const HO_SO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = (ten) => readFileSync(path.join(HO_SO, ten), 'utf8');

export function kiemKhop(md, jsonl) {
  if (layBang(md) !== bangKetQua(docJsonl(jsonl))) throw new Error('bảng đếm lệch nhật ký');
}

describe('AC-9 kết quả khớp nhật ký', () => {
  const md = doc('ket-qua.md');
  const jsonl = doc('nhat-ky-dong-bo.jsonl');
  test('bảng giữa hai mốc bằng đúng đầu ra tom-tat.mjs trên nhat-ky-dong-bo.jsonl', () => kiemKhop(md, jsonl));
  test('nhật ký trong kho không băm IP, không IP thô', () => {
    assert.ok(!jsonl.includes('"ip_bam"'));
    kiemNhatKyKhongIp(jsonl);
  });
  test('mỗi vế có một dòng kết luận trong phần lời của ket-qua.md', () => {
    for (const k of ketLuan(docJsonl(jsonl))) {
      assert.match(md, new RegExp(`- Vế ${k.ve} — ${k.dat ? 'đạt' : 'không đạt'}`), `thiếu hay lệch dòng «- Vế ${k.ve}»`);
    }
  });
  test('phá thử: sửa một số trong bản sao → đỏ «bảng đếm lệch nhật ký»', () => {
    const sai = md.replace(/\| (\d+) \|/, (_, n) => `| ${Number(n) + 1} |`);
    assert.notEqual(sai, md);
    assert.throws(() => kiemKhop(sai, jsonl), /bảng đếm lệch nhật ký/);
  });
});
