#!/usr/bin/env node
// Tóm tắt phiên thử đồng bộ: bản nhật ký sạch, kết luận hai vế theo luật viết trước, bảng giữa hai mốc của ket-qua.md.
//   node _acceptance/bai-thu-dong-bo-mat-mang/thu/tom-tat.mjs <nhat-ky.jsonl> [--ghi]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NGUOI, soChuDuocThay } from './du-lieu-mau.mjs';

const HO_SO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MOC_DAU = '<!-- dem -->';
export const MOC_CUOI = '<!-- /dem -->';
export const NAM_PHUT_MS = 5 * 60 * 1000;

export const docJsonl = (chu) => chu.split('\n').filter(Boolean).map((d) => JSON.parse(d));
export const lamSach = (dong) =>
  dong.map((d) => {
    const c = { ...d };
    delete c.ip_bam;
    return c;
  });

/** Lần kéo có sạch không: chỉ sàn của người, số chủ bằng đúng ma trận vai, vai cơ sở dữ liệu là quy_hang_app. */
export function keoSach(d) {
  const n = NGUOI[d.nguoi];
  if (!n) return { sach: (d.cong_ty_nhan ?? []).length === 0 && (d.so_chu_nhan ?? []).length === 0, ly_do: 'phiên không đặt sàn' };
  if ((d.cong_ty_nhan ?? []).some((c) => c !== n.san)) return { sach: false, ly_do: 'lộ trong phiên thật: dòng sàn khác' };
  const mong = soChuDuocThay(d.nguoi);
  const nhan = new Set(d.so_chu_nhan ?? []);
  if (nhan.size !== mong.size || [...mong].some((s) => !nhan.has(s))) return { sach: false, ly_do: 'lộ trong phiên thật: số chủ ngoài ma trận vai' };
  if (d.current_user !== 'quy_hang_app') return { sach: false, ly_do: `truy vấn chạy bằng vai ${d.current_user}` };
  return { sach: true, ly_do: null };
}

/** Khoảng mất mạng của từng người: cặp «tat» rồi «bat» liền sau theo giờ máy. */
export function khoangMatMang(dong) {
  const theoNguoi = new Map();
  for (const d of dong.filter((x) => x.loai === 'mang' && x.luc_may)) {
    if (!theoNguoi.has(d.nguoi)) theoNguoi.set(d.nguoi, []);
    theoNguoi.get(d.nguoi).push(d);
  }
  const ra = [];
  for (const [nguoi, ds] of theoNguoi) {
    ds.sort((a, b) => a.luc_may.localeCompare(b.luc_may));
    for (let i = 0; i < ds.length - 1; i++) {
      if (ds[i].trang_thai === 'tat' && ds[i + 1].trang_thai === 'bat') {
        const tu = Date.parse(ds[i].luc_may);
        const den = Date.parse(ds[i + 1].luc_may);
        ra.push({ nguoi, tu: ds[i].luc_may, den: ds[i + 1].luc_may, giay: Math.round((den - tu) / 1000) });
      }
    }
  }
  return ra;
}

/** Thao tác tạo trong khoảng mất mạng và kết cục của chúng ở máy chủ. */
function thaoTacTrong(dong, k) {
  const tu = Date.parse(k.tu);
  const den = Date.parse(k.den);
  return dong
    .filter((d) => d.loai === 'day' && d.nguoi === k.nguoi)
    .flatMap((d) => d.ket_qua ?? [])
    .filter((o) => o.tao_luc && Date.parse(o.tao_luc) >= tu && Date.parse(o.tao_luc) <= den);
}

export function dungThuTu(ops) {
  const da = ops.filter((o) => o.trang_thai === 'da-ap').sort((a, b) => a.client_seq - b.client_seq);
  if (da.length !== ops.length) return false;
  for (let i = 1; i < da.length; i++) {
    if (!(da[i].seq > da[i - 1].seq) || da[i].client_seq !== da[i - 1].client_seq + 1) return false;
  }
  return true;
}

/** Kết luận theo luật viết trước (contract AC-9). */
export function ketLuan(dong) {
  const keo = dong.filter((d) => d.loai === 'keo' && NGUOI[d.nguoi]);
  const ban = keo.map((d) => ({ d, ...keoSach(d) }));
  const vaiDaKeo = new Set(keo.map((d) => d.nguoi));
  const duBaVai = (vaiDaKeo.has('a1') || vaiDaKeo.has('a2')) && vaiDaKeo.has('tnA') && vaiDaKeo.has('b1');
  const v1 = keo.length > 0 && duBaVai && ban.every((b) => b.sach);
  const loiV1 = ban.find((b) => !b.sach)?.ly_do ?? (duBaVai ? null : 'chưa đủ ba vai (đầu chủ A, trưởng nhóm A, đầu chủ B) kéo về');

  const khoang = khoangMatMang(dong).map((k) => {
    const ops = thaoTacTrong(dong, k);
    return { ...k, so_thao_tac: ops.length, dung_thu_tu: ops.length > 0 && dungThuTu(ops) };
  });
  const v2 = khoang.some((k) => k.giay * 1000 >= NAM_PHUT_MS && k.so_thao_tac > 0 && k.dung_thu_tu);
  return [
    { ve: 1, ten: 'Mỗi người chỉ nhận đúng phần của mình (sàn và số chủ)', dat: v1,
      so: `${keo.length} lần kéo, vai đã kéo: ${[...vaiDaKeo].join(', ') || '—'}${loiV1 ? ` · ${loiV1}` : ''}` },
    { ve: 2, ten: 'Mất mạng ≥ 5 phút rồi nối lại: mọi thay đổi lên đúng thứ tự', dat: v2,
      so: khoang.map((k) => `${k.nguoi}: mất ${k.giay} giây, ${k.so_thao_tac} thao tác, ${k.dung_thu_tu ? 'đúng thứ tự' : 'không đạt thứ tự'}`).join('; ') || 'không có khoảng mất mạng' },
  ];
}

const o = (s) => String(s ?? '').replace(/\|/g, '/');

export function bangKetQua(dong) {
  const ra = ['### Kết luận', '', '| Vế | Điều | Kết quả | Số |', '| --- | --- | --- | --- |'];
  for (const k of ketLuan(dong)) ra.push(`| ${k.ve} | ${k.ten} | ${k.dat ? 'đạt' : 'không đạt'} | ${o(k.so)} |`);
  ra.push('', '### Các lần kéo về', '', '| Người | Vai CSDL | Số căn | Sàn nhận | Số chủ nhận | Sạch |', '| --- | --- | --- | --- | --- | --- |');
  for (const d of dong.filter((x) => x.loai === 'keo')) {
    const s = keoSach(d);
    const san = (d.cong_ty_nhan ?? []).map((c) => (c.endsWith('a1') ? 'A' : c.endsWith('b1') ? 'B' : c)).join(', ');
    ra.push(`| ${o(d.nguoi ?? '(không đặt)')} | ${o(d.current_user)} | ${d.so_dong ?? 0} | ${san || '—'} | ${o((d.so_chu_nhan ?? []).join(', ')) || '—'} | ${s.sach ? 'có' : `không — ${o(s.ly_do)}`} |`);
  }
  ra.push('', '### Khoảng mất mạng', '', '| Người | Từ | Đến | Giây | Thao tác trong khoảng | Đúng thứ tự |', '| --- | --- | --- | --- | --- | --- |');
  for (const k of khoangMatMang(dong)) {
    const ops = thaoTacTrong(dong, k);
    ra.push(`| ${o(k.nguoi)} | ${k.tu} | ${k.den} | ${k.giay} | ${ops.length} | ${ops.length && dungThuTu(ops) ? 'có' : 'không'} |`);
  }
  ra.push('', '### Các lô đẩy lên', '', '| Người | client_seq | Kết cục | seq máy chủ | Tạo lúc |', '| --- | --- | --- | --- | --- |');
  for (const d of dong.filter((x) => x.loai === 'day')) {
    for (const k of d.ket_qua ?? []) ra.push(`| ${o(d.nguoi)} | ${k.client_seq} | ${o(k.trang_thai)} | ${k.seq ?? '—'} | ${k.tao_luc ?? '—'} |`);
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
    writeFileSync(path.join(HO_SO, 'nhat-ky-dong-bo.jsonl'), sach.map((d) => JSON.stringify(d)).join('\n') + '\n');
    const kq = path.join(HO_SO, 'ket-qua.md');
    if (existsSync(kq)) writeFileSync(kq, thayBang(readFileSync(kq, 'utf8'), bang));
  }
  process.stdout.write(bang);
}
