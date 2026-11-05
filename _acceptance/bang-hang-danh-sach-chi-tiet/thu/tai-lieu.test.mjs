// E8 và E9c (hàng 105, AC-8, AC-9): tài liệu hết lệch sau khi Danh sách – chi tiết đổi sang cột kéo chia, và diff không chạm
// `inventory/bulk/**` (hàng 89). Mỗi ca có chiều đỏ trên bản sao hay danh sách giả, thông điệp gọi tên chỗ hỏng.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const NHANH_CHINH = 'origin/main';

const ADR = 'docs/adr/0024-he-bo-cuc.md';
const THAM_CHIEU = 'docs/product/tham-chieu.md';
const VO_VA_IA = 'docs/design/vo-va-ia.md';
const HO_SO_CAN = 'design/patterns/ho-so-can.md';
const BANG_HANG = 'design/patterns/bang-hang.md';
const SO_BIEN_THIEN = 'docs/architecture/so-diem-bien-thien.md';
const SO_QUYET_DINH = '_acceptance/bang-hang-danh-sach-chi-tiet/decisions.jsonl';
const TEP = [ADR, THAM_CHIEU, VO_VA_IA, HO_SO_CAN, BANG_HANG, SO_BIEN_THIEN, SO_QUYET_DINH];
const BULK = 'apps/web/src/app/(app)/inventory/bulk/';

/** Đoạn của một quyết định đánh số trong ADR: từ «n. **» tới quyết định kế hay mục kế. */
function doanQuyetDinh(md, so) {
  const dau = md.indexOf(`\n${so}. **`);
  if (dau < 0) return null;
  const sau = md.slice(dau + 1);
  const het = sau.search(new RegExp(`\\n(?:${so + 1}\\. \\*\\*|## )`));
  return het < 0 ? sau : sau.slice(0, het);
}

/** Mục «## 12. Sổ quyết định» của Tham chiếu. */
const muc12 = (md) => md.split('## 12. Sổ quyết định')[1]?.split('\n## ')[0] ?? '';

/**
 * Kiểm tài liệu trên một cây (`doc(tep)` đọc tệp của cây) so với ADR ở nhánh chính (`adrGoc`). Trả lỗi gọi tên chỗ hỏng —
 * rỗng là đạt.
 */
export function kiemTaiLieu(doc, adrGoc) {
  const loi = [];
  const adr = doc(ADR);
  const sua = adr.split('## Sửa đổi 05/11')[1];
  if (sua === undefined) loi.push('ADR-0024: thiếu mục «Sửa đổi 05/11»');
  else {
    const doanSua = sua.split('\n## ')[0];
    for (const k of ['app-shell-11', 'solution-crm-4', 'Quyết định 2', 'Quyết định 13'])
      if (!doanSua.includes(k)) loi.push(`ADR-0024 Sửa đổi 05/11: không nêu «${k}»`);
  }
  for (const so of [2, 13]) {
    const cu = doanQuyetDinh(adrGoc, so);
    if (cu === null) loi.push(`ADR-0024 nhánh chính: không đọc được quyết định ${so}`);
    else if (!adr.includes(cu)) loi.push(`ADR-0024: chữ cũ của quyết định ${so} bị viết đè`);
  }

  const dong0511 = muc12(doc(THAM_CHIEU))
    .split('\n')
    .filter((d) => d.startsWith('| 05/11 |'));
  if (!dong0511.some((d) => d.includes('kéo chia'))) loi.push('Tham chiếu §12: thiếu dòng 05/11 nêu cột kéo chia');

  for (const tep of [VO_VA_IA, HO_SO_CAN, BANG_HANG]) {
    const md = doc(tep);
    if (!md.includes('kéo chia')) loi.push(`${tep}: không tả cột kéo chia`);
    for (const cu of ['ngăn trượt', 'đè lên bảng']) if (md.includes(cu)) loi.push(`${tep}: còn chữ «${cu}» cho hồ sơ căn`);
  }
  const daoBangHang = doc(BANG_HANG).split('\n---')[0];
  if (/ngoai_le_han:[^\n]*inventory\/page\.tsx/.test(daoBangHang)) loi.push(`${BANG_HANG}: còn ngoại lệ có hạn cho inventory/page.tsx`);
  if (!/^bo_cuc: danh-sach-chi-tiet$/m.test(daoBangHang)) loi.push(`${BANG_HANG}: bo_cuc không là danh-sach-chi-tiet`);

  // Hỏi-2 chốt giữ cứng → Sổ điểm biến thiên có một dòng điều khoá cho kiểu mở chi tiết, kèm lý do.
  const hoi2 = doc(SO_QUYET_DINH)
    .split('\n')
    .filter(Boolean)
    .map((d) => JSON.parse(d))
    .find((d) => typeof d.decision === 'string' && d.decision.startsWith('Hỏi-2'));
  if (hoi2 && /giữ cứng/.test(hoi2.decision)) {
    const khoa = doc(SO_BIEN_THIEN)
      .split('\n')
      .filter((d) => /^\| K\d+ \|/.test(d) && d.includes('Kiểu mở chi tiết'));
    if (khoa.length !== 1) loi.push('Sổ điểm biến thiên: thiếu dòng điều khoá cho kiểu mở chi tiết');
    else {
      const o = khoa[0].split(' | ');
      if (!/[Nn]ền tảng/.test(o[2] ?? '')) loi.push('Sổ điểm biến thiên: dòng điều khoá kiểu mở chi tiết thiếu lý do nền tảng');
    }
  }
  return loi;
}

/** Tệp dưới `inventory/bulk/**` trong danh sách tệp đổi — rỗng là đạt. */
export const chamBulk = (ds) => ds.filter((t) => t.startsWith(BULK)).map((t) => `diff chạm ${t}`);

const docTu = (goc) => (tep) => readFileSync(path.join(goc, tep), 'utf8');
const adrNhanhChinh = () => execFileSync('git', ['show', `${NHANH_CHINH}:${ADR}`], { cwd: ROOT, encoding: 'utf8' });

function voiBanSao(sua) {
  const d = mkdtempSync(path.join(tmpdir(), 'tai-lieu-105-'));
  try {
    for (const t of TEP) {
      mkdirSync(path.dirname(path.join(d, t)), { recursive: true });
      cpSync(path.join(ROOT, t), path.join(d, t));
    }
    sua(d);
    return kiemTaiLieu(docTu(d), adrNhanhChinh());
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}
const doiTep = (d, t, f) => writeFileSync(path.join(d, t), f(readFileSync(path.join(d, t), 'utf8')));

describe('tài liệu và vùng tệp (hàng 105)', () => {
  test('tài liệu hết lệch', () => {
    assert.deepEqual(kiemTaiLieu(docTu(ROOT), adrNhanhChinh()), []);
    // Chiều đỏ: bản sao xoá dòng 05/11 khỏi Tham chiếu §12.
    assert.deepEqual(
      voiBanSao((d) => doiTep(d, THAM_CHIEU, (s) => s.split('\n').filter((l) => !l.startsWith('| 05/11 |')).join('\n'))),
      ['Tham chiếu §12: thiếu dòng 05/11 nêu cột kéo chia'],
    );
    // Chiều đỏ: viết đè chữ cũ của quyết định 13.
    assert.deepEqual(
      voiBanSao((d) => doiTep(d, ADR, (s) => s.replace('nay trượt phải trong ngăn inset', 'nay là cột kéo chia'))),
      ['ADR-0024: chữ cũ của quyết định 13 bị viết đè'],
    );
    // Chiều đỏ: xoá dòng điều khoá kiểu mở chi tiết khỏi Sổ điểm biến thiên.
    assert.deepEqual(
      voiBanSao((d) => doiTep(d, SO_BIEN_THIEN, (s) => s.split('\n').filter((l) => !l.includes('Kiểu mở chi tiết')).join('\n'))),
      ['Sổ điểm biến thiên: thiếu dòng điều khoá cho kiểu mở chi tiết'],
    );
    // Chiều đỏ: khuôn ho-so-can còn tả ngăn trượt đè lên bảng.
    assert.deepEqual(
      voiBanSao((d) => doiTep(d, HO_SO_CAN, (s) => `${s}\nHồ sơ trượt ra ngăn trượt phải.\n`)),
      [`${HO_SO_CAN}: còn chữ «ngăn trượt» cho hồ sơ căn`],
    );
  });

  test('không chạm inventory/bulk', () => {
    const ds = execFileSync('git', ['diff', '--name-only', `${NHANH_CHINH}...HEAD`], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
    assert.ok(ds.length > 0, 'diff với nhánh chính rỗng — không đo được');
    assert.deepEqual(chamBulk(ds), []);
    // Chiều đỏ: danh sách tệp giả có một tệp bulk thì ca gọi tên tệp ấy.
    const gia = [...ds, `${BULK}thanh.tsx`];
    assert.deepEqual(chamBulk(gia), [`diff chạm ${BULK}thanh.tsx`]);
  });
});
