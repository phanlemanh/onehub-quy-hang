// Phân lớp lượt gọi và đếm lượt mở — phần thuần của bài thử Zalo, không I/O.

// Mẫu UA của máy (máy lấy xem trước, công cụ dòng lệnh, trình duyệt không đầu). Điểm khởi đầu theo các máy lấy xem
// trước có tên (facebookexternalhit, Slackbot…); nhật ký phiên thật cho biết UA của Zalo để ADR bổ sung.
export const MAU_MAY = [
  'bot',
  'crawler',
  'spider',
  'preview',
  'facebookexternalhit',
  'curl',
  'wget',
  'python-',
  'node-fetch',
  'headless',
];

const DAU_PREFETCH = ['purpose', 'sec-purpose', 'x-purpose', 'x-moz'];

/** Lớp của một lượt gọi: `may` kèm lý do, hoặc `nguoi`. */
export function phanLop(ua, dau = {}) {
  const u = String(ua ?? '').toLowerCase();
  if (!u) return { lop: 'may', ly_do: 'không có UA' };
  const mau = MAU_MAY.find((m) => u.includes(m));
  if (mau) return { lop: 'may', ly_do: `UA chứa «${mau}»` };
  for (const k of DAU_PREFETCH) {
    const v = String(dau[k] ?? '').toLowerCase();
    if (v.includes('prefetch') || v.includes('prerender')) return { lop: 'may', ly_do: `đầu ${k}: ${v}` };
  }
  return { lop: 'nguoi', ly_do: null };
}

/**
 * Bảng đếm theo mã từ các dòng nhật ký.
 * - Thước JS: `mo` = số phiên khác nhau có lượt báo `mo` lớp người.
 * - Thước UA: `tai_trang_nguoi` = lượt tải trang lớp người (không cần JS).
 */
export function demTheoMa(dong) {
  const bang = new Map();
  const lay = (ma) => {
    if (!bang.has(ma)) {
      bang.set(ma, {
        ma,
        tai_trang: 0,
        tai_trang_nguoi: 0,
        tai_anh: 0,
        mo: 0,
        mo_bi_loai: 0,
        ua_may: [],
        ly_do_loai: [],
        _phien: new Set(),
      });
    }
    return bang.get(ma);
  };
  for (const d of dong) {
    if (!d || typeof d.ma !== 'string') continue;
    const o = lay(d.ma);
    if (d.loai === 'tai-trang') {
      o.tai_trang += 1;
      if (d.lop === 'nguoi') o.tai_trang_nguoi += 1;
      else if (d.ua && !o.ua_may.includes(d.ua)) o.ua_may.push(d.ua);
    } else if (d.loai === 'tai-anh') {
      o.tai_anh += 1;
      if (d.lop === 'may' && d.ua && !o.ua_may.includes(d.ua)) o.ua_may.push(d.ua);
    } else if (d.loai === 'mo') {
      if (d.lop === 'nguoi') {
        if (!o._phien.has(d.phien)) {
          o._phien.add(d.phien);
          o.mo += 1;
        }
      } else {
        o.mo_bi_loai += 1;
        if (d.ly_do && !o.ly_do_loai.includes(d.ly_do)) o.ly_do_loai.push(d.ly_do);
      }
    }
  }
  return [...bang.values()]
    .sort((a, b) => a.ma.localeCompare(b.ma))
    .map((o) => {
      const c = { ...o };
      delete c._phien;
      return c;
    });
}

/** Cách chia sẻ trình duyệt làm được: `tep` (ảnh + tin), `link` (link + tin) hay `khong-ho-tro`. */
export function chonCachChiaSe(nav, tep) {
  if (!nav || typeof nav.share !== 'function') return 'khong-ho-tro';
  if (typeof nav.canShare === 'function' && tep && nav.canShare({ files: [tep] })) return 'tep';
  return 'link';
}
