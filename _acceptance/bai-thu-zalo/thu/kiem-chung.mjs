// Hàm kiểm dùng chung cho bài kiểm của bài thử Zalo: mỗi hàm ném lỗi mang thông điệp ghim khi vật sai,
// để ca phá thử đo được chiều đỏ bằng đúng hàm mà ca xanh dùng.
import { docCoPng } from './anh.mjs';

export const THE_OG = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];

export function layThe(html, ten) {
  const thuoc = ten.startsWith('og:') ? 'property' : 'name';
  const m = html.match(new RegExp(`<meta ${thuoc}="${ten}" content="([^"]*)"`));
  return m ? m[1] : null;
}

export function kiemTheOg(html) {
  for (const t of THE_OG) if (!layThe(html, t)) throw new Error(`thiếu ${t}`);
  if (layThe(html, 'twitter:card') !== 'summary_large_image') throw new Error('thiếu twitter:card');
  for (const t of ['og:image', 'og:url']) {
    if (!/^https?:\/\//.test(layThe(html, t))) throw new Error(`${t} không phải URL tuyệt đối`);
  }
}

export function kiemAnh(buf) {
  const co = docCoPng(buf);
  if (!co) throw new Error('không phải PNG');
  if (co.rong !== 1200 || co.cao !== 630) throw new Error('cỡ ảnh khác 1200×630');
  if (buf.length >= 300 * 1024) throw new Error('ảnh nặng từ 300 KB');
}

export const MAU_SO_DT = /(\+?84|0)\d{2,3}[\s.]?\d{3}[\s.]?\d{3,4}/;
const CHU_NOI_BO = ['giá đáy', 'chủ nhà', 'sổ'];

export function kiemChiMau(html) {
  if (!html.includes('Mẫu')) throw new Error('thiếu nhãn «Mẫu»');
  if (MAU_SO_DT.test(html)) throw new Error('có số điện thoại');
  const thap = html.toLowerCase();
  for (const c of CHU_NOI_BO) if (thap.includes(c)) throw new Error(`có chữ nội bộ «${c}»`);
}

const MAU_IP = [/\b\d{1,3}(?:\.\d{1,3}){3}\b/, /(?:^|[^\w:])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\w:])/i];

export function kiemKhongIp(chu) {
  if (MAU_IP.some((m) => m.test(chu))) throw new Error('có IP thô');
}

/** Nhật ký jsonl không mang IP thô ở trường nào ngoài `ua` (UA trình duyệt có chuỗi kiểu «Chrome/120.0.0.0»). */
export function kiemNhatKyKhongIp(jsonl) {
  for (const dong of jsonl.split('\n').filter(Boolean)) {
    const d = JSON.parse(dong);
    delete d.ua;
    kiemKhongIp(JSON.stringify(d));
  }
}
