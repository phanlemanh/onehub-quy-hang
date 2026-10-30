#!/usr/bin/env node
// Tóm tắt phiên thử với Zalo thật: bản nhật ký sạch, bảng đếm và kết luận từng vế theo luật viết trước.
//   node _acceptance/bai-thu-zalo/thu/tom-tat.mjs <nhat-ky.jsonl> [--ghi]
// --ghi: ghi nhat-ky-zalo.jsonl (bản sạch) vào hồ sơ và thay bảng giữa hai mốc của ket-qua.md nếu tệp đã có.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demTheoMa } from './dem.mjs';

const HO_SO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MOC_DAU = '<!-- dem -->';
export const MOC_CUOI = '<!-- /dem -->';

export const docJsonl = (chu) => chu.split('\n').filter(Boolean).map((d) => JSON.parse(d));

/** Bỏ băm IP — bản đưa vào kho chỉ giữ điều cần cho kết luận. */
export const lamSach = (dong) =>
  dong.map((d) => {
    const c = { ...d };
    delete c.ip_bam;
    return c;
  });

export function thietBi(ua) {
  const u = String(ua ?? '');
  if (/iPhone|iPad/.test(u)) return 'iPhone';
  if (/Android/.test(u)) return 'Android';
  if (/Macintosh|Windows|X11|Linux|CrOS/.test(u)) return 'Máy tính';
  return 'khác';
}

const laZalo = (ua) => /zalo/i.test(String(ua ?? ''));

/** Kết luận bốn vế của ngưỡng sống (opportunity.md), luật viết trước trong plan.md Task 3. */
export function ketLuan(dong) {
  const dem = demTheoMa(dong);
  const theoMa = new Map(dem.map((o) => [o.ma, o]));
  const traLoi = (cau, tl, tb) => dong.filter((d) => d.loai === 'quan-sat' && d.cau === cau && d.tra_loi === tl
    && (!tb || thietBi(d.ua) === tb));

  const xemTruoc = (tb) => traLoi('xem-truoc', 'co-anh', tb).filter((d) => (theoMa.get(d.ma)?.tai_anh ?? 0) >= 1);
  const v1A = xemTruoc('Android');
  const v1I = xemTruoc('iPhone');

  const maK = dem.filter((o) => o.ma.startsWith('K-'));
  const maAI = dem.filter((o) => /^[AI]-/.test(o.ma));
  const v2 = maK.length > 0 && maK.every((o) => o.mo === 0) && maK.some((o) => o.tai_trang + o.tai_anh >= 1)
    && maAI.some((o) => o.ma.startsWith('A-')) && maAI.some((o) => o.ma.startsWith('I-')) && maAI.every((o) => o.mo >= 1);

  const chiaSe = dong.filter((d) => d.loai === 'chia-se' && thietBi(d.ua) === 'iPhone' && d.cach === 'tep'
    && d.ket_cuc === 'da-gui');
  const nhanAnh = traLoi('zalo-nhan-anh', 'co', 'iPhone');
  const nhanTin = traLoi('zalo-nhan-tin', 'co', 'iPhone').length > 0 ? 'có'
    : traLoi('zalo-nhan-tin', 'khong', 'iPhone').length > 0 ? 'không' : 'chưa trả lời';

  const keo = dong.filter((d) => d.loai === 'nhan-anh' && d.co_tep === true && thietBi(d.ua) === 'Máy tính');

  const soMa = (ds) => ds.map((o) => `${o.ma}: tải trang ${o.tai_trang}, tải ảnh ${o.tai_anh}, mở ${o.mo}`).join('; ') || 'không có mã';
  return [
    { ve: 1, ten: 'Ảnh xem trước hiện trên Zalo Android và iPhone', dat: v1A.length > 0 && v1I.length > 0,
      so: `«có ảnh» từ Android ${v1A.length}, từ iPhone ${v1I.length}` },
    { ve: 2, ten: 'Lượt Zalo tự lấy không vào số mở', dat: v2, so: `${soMa(maK)} · ${soMa(maAI)}` },
    { ve: 3, ten: 'iPhone chia sẻ ảnh + tin sang Zalo qua bảng chia sẻ', dat: chiaSe.length > 0 && nhanAnh.length > 0,
      so: `đã gửi kèm tệp ${chiaSe.length}, Zalo nhận ảnh ${nhanAnh.length > 0 ? 'có' : 'không'}, Zalo nhận tin ${nhanTin}` },
    { ve: 4, ten: 'Kéo hoặc dán ảnh từ Zalo máy tính vào trình duyệt', dat: keo.length > 0,
      so: `nhận được tệp ảnh ${keo.length} (${[...new Set(keo.map((d) => d.cach))].join(', ') || '—'})` },
  ];
}

const o = (s) => String(s ?? '').replace(/\|/g, '/');

function demNhom(ds, khoa) {
  const m = new Map();
  for (const d of ds) {
    const k = khoa(d);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

/** Bảng markdown đặt giữa hai mốc của ket-qua.md — một hàm, nên bảng trong kết quả là bảng máy tính ra. */
export function bangKetQua(dong) {
  const ra = [];
  ra.push('### Kết luận theo bốn vế', '', '| Vế | Điều | Kết quả | Số |', '| --- | --- | --- | --- |');
  for (const k of ketLuan(dong)) ra.push(`| ${k.ve} | ${k.ten} | ${k.dat ? 'đạt' : 'không đạt'} | ${o(k.so)} |`);
  ra.push('', '### Đếm theo mã', '', '| Mã | Tải trang | Tải trang (người) | Tải ảnh | Mở | Mở bị loại | UA lớp máy |',
    '| --- | --- | --- | --- | --- | --- | --- |');
  for (const x of demTheoMa(dong)) {
    ra.push(`| ${x.ma} | ${x.tai_trang} | ${x.tai_trang_nguoi} | ${x.tai_anh} | ${x.mo} | ${x.mo_bi_loai} | ${o(x.ua_may.join(' · ')) || '—'} |`);
  }
  ra.push('', '### UA của các lượt tải không kèm lượt mở', '', '| UA | Lớp | Zalo | Lượt |', '| --- | --- | --- | --- |');
  const coMo = new Set(dong.filter((d) => d.loai === 'mo').map((d) => d.ua));
  const tai = dong.filter((d) => (d.loai === 'tai-trang' || d.loai === 'tai-anh') && !coMo.has(d.ua));
  for (const [k, n] of demNhom(tai, (d) => `${d.ua}\u0000${d.lop}`)) {
    const [ua, lop] = k.split('\u0000');
    ra.push(`| ${o(ua) || '(trống)'} | ${lop} | ${laZalo(ua) ? 'có' : 'không'} | ${n} |`);
  }
  ra.push('', '### Chia sẻ', '', '| Thiết bị | Nút | Cách | Kết cục | Lượt |', '| --- | --- | --- | --- | --- |');
  for (const [k, n] of demNhom(dong.filter((d) => d.loai === 'chia-se'), (d) => [thietBi(d.ua), d.man, d.cach, d.ket_cuc, d.loi].join('\u0000'))) {
    const [tb, man, cach, kc, loi] = k.split('\u0000');
    ra.push(`| ${tb} | ${o(man)} | ${o(cach)} | ${o(kc)}${loi ? ` (${o(loi)})` : ''} | ${n} |`);
  }
  ra.push('', '### Nhận ảnh', '', '| Thiết bị | Cách | Có tệp ảnh | Kiểu | Kiểu dữ liệu kéo | Nguồn URI | Lượt |',
    '| --- | --- | --- | --- | --- | --- | --- |');
  for (const [k, n] of demNhom(dong.filter((d) => d.loai === 'nhan-anh'),
    (d) => [thietBi(d.ua), d.cach, d.co_tep ? 'có' : 'không', d.kieu ?? '', (d.kieu_du_lieu ?? []).join(', '), d.nguon_uri ?? ''].join('\u0000'))) {
    const [tb, cach, co, kieu, kdl, uri] = k.split('\u0000');
    ra.push(`| ${tb} | ${o(cach)} | ${co} | ${o(kieu) || '—'} | ${o(kdl) || '—'} | ${o(uri) || '—'} | ${n} |`);
  }
  ra.push('', '### Câu trả lời của người thử', '', '| Thiết bị | Trang | Câu | Trả lời | Lượt |', '| --- | --- | --- | --- | --- |');
  for (const [k, n] of demNhom(dong.filter((d) => d.loai === 'quan-sat'), (d) => [thietBi(d.ua), d.man, d.cau, d.tra_loi].join('\u0000'))) {
    const [tb, man, cau, tl] = k.split('\u0000');
    ra.push(`| ${tb} | ${o(man)} | ${o(cau)} | ${o(tl)} | ${n} |`);
  }
  return `${ra.join('\n')}\n`;
}

export function thayBang(md, bang) {
  const i = md.indexOf(MOC_DAU);
  const j = md.indexOf(MOC_CUOI);
  if (i < 0 || j < i) throw new Error('ket-qua.md thiếu hai mốc <!-- dem --> … <!-- /dem -->');
  return `${md.slice(0, i + MOC_DAU.length)}\n${bang}${md.slice(j)}`;
}

export function layBang(md) {
  const i = md.indexOf(MOC_DAU);
  const j = md.indexOf(MOC_CUOI);
  if (i < 0 || j < i) throw new Error('ket-qua.md thiếu hai mốc <!-- dem --> … <!-- /dem -->');
  return md.slice(i + MOC_DAU.length + 1, j);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [tep, co] = process.argv.slice(2);
  if (!tep) {
    console.error('dùng: node tom-tat.mjs <nhat-ky.jsonl> [--ghi]');
    process.exit(2);
  }
  const sach = lamSach(docJsonl(readFileSync(tep, 'utf8')));
  const bang = bangKetQua(sach);
  if (co === '--ghi') {
    writeFileSync(path.join(HO_SO, 'nhat-ky-zalo.jsonl'), sach.map((d) => JSON.stringify(d)).join('\n') + '\n');
    const kq = path.join(HO_SO, 'ket-qua.md');
    if (existsSync(kq)) writeFileSync(kq, thayBang(readFileSync(kq, 'utf8'), bang));
  }
  process.stdout.write(bang);
}
