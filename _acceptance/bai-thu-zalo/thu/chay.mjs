#!/usr/bin/env node
// Một lệnh chạy bài thử Zalo: máy chủ thử + đường hầm công khai + in các bước. Ctrl+C ghi tóm tắt.
//   node _acceptance/bai-thu-zalo/thu/chay.mjs [--cong 3463] [--khong-ham] [--thu-muc <đường>]
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { demTheoMa } from './dem.mjs';
import { taoMayChu, taoNhatKy } from './may-chu.mjs';

const DAY = path.dirname(fileURLToPath(import.meta.url));
export const GOC_KHO = path.resolve(DAY, '../../..');

/** Đường hầm dùng được trên máy này: cloudflared, không có thì ssh tới localhost.run, không có cả hai thì null. */
export function chonHam(coLenh) {
  if (coLenh('cloudflared')) return 'cloudflared';
  if (coLenh('ssh')) return 'ssh';
  return null;
}

const coLenhThat = (ten) => spawnSync('sh', ['-c', `command -v ${ten}`], { stdio: 'ignore' }).status === 0;

/**
 * Bộ đọc đầu ra của đường hầm: trả URL công khai chỉ khi đường hầm đã nối thật.
 * - cloudflared in URL trước khi nối tới edge; mạng chặn cổng 7844 thì nó in URL rồi thử lại mãi — phải chờ thêm dòng
 *   «Registered tunnel connection».
 * - localhost.run in lời chào có https://admin.localhost.run trước dòng URL; chỉ nhận tên miền đường hầm lhr.life.
 */
export function taoBoDocHam(loai) {
  let url = null;
  let daNoi = loai !== 'cloudflared';
  const mau = loai === 'cloudflared' ? /https:\/\/[a-z0-9-]+\.trycloudflare\.com/ : /https:\/\/[a-z0-9-]+\.lhr\.life/;
  return (manh) => {
    const chu = String(manh);
    url ??= chu.match(mau)?.[0] ?? null;
    if (/Registered tunnel connection/.test(chu)) daNoi = true;
    return url && daNoi ? url : null;
  };
}

function moHam(loai, cong) {
  const [lenh, doiSo] =
    loai === 'cloudflared'
      ? ['cloudflared', ['tunnel', '--no-autoupdate', '--url', `http://localhost:${cong}`]]
      : ['ssh', ['-o', 'StrictHostKeyChecking=accept-new', '-o', 'ServerAliveInterval=30', '-R', `80:localhost:${cong}`, 'nokey@localhost.run']];
  const tt = spawn(lenh, doiSo, { stdio: ['ignore', 'pipe', 'pipe'] });
  const doc = taoBoDocHam(loai);
  let daSong = false;
  const url = new Promise((ok) => {
    const nhan = (c) => {
      const u = doc(c);
      if (u && !daSong) {
        daSong = true;
        ok(u);
      }
    };
    tt.stdout.on('data', nhan);
    tt.stderr.on('data', nhan);
    tt.on('exit', () => {
      if (daSong) console.log(`\nđường hầm ${loai} đã đóng — link công khai không còn sống; chạy lại lệnh để có link mới`);
      ok(null);
    });
    setTimeout(() => ok(null), 45_000);
  });
  return { tt, url };
}

function docDoiSo(argv) {
  const ra = { cong: 3463, khongHam: false, thuMuc: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--cong') ra.cong = Number(argv[++i]);
    else if (argv[i] === '--khong-ham') ra.khongHam = true;
    else if (argv[i] === '--thu-muc') ra.thuMuc = argv[++i];
  }
  return ra;
}

function inBuoc(goc, ma) {
  const l = (p) => `${goc}${p}`;
  console.log(`
Bài thử Zalo — mở ở ${goc}

Link để dán vào Zalo (mỗi lần chạy là mã mới, Zalo chưa lưu đệm):
  A (Zalo Android) ${l(`/s/${ma.A}`)}
  I (Zalo iPhone)  ${l(`/s/${ma.I}`)}
  K (chỉ dán, KHÔNG bấm) ${l(`/s/${ma.K}`)}
Trang thử chia sẻ (mở bằng Safari trên iPhone): ${l('/chia-se')}
Trang thử kéo ảnh (mở bằng trình duyệt trên máy tính): ${l('/keo-anh')}
Bảng đếm lúc đang thử: ${l('/dem')}

Các bước:
 1. Zalo Android: gửi link A và link K cho «Cloud của tôi». Chờ 10 giây, nhìn ảnh xem trước. KHÔNG bấm link K.
 2. Bấm link A; trên trang trả lời hai câu bằng nút.
 3. Zalo iPhone: làm như bước 1–2 với link I (K đã gửi ở bước 1 thì gửi lại K lần nữa, vẫn không bấm).
 4. Safari iPhone: mở trang thử chia sẻ, lần lượt bấm «Gửi ảnh + tin», «Gửi chỉ ảnh», «Gửi link + tin»,
    mỗi lần chọn Zalo → «Cloud của tôi»; rồi bấm các nút trả lời trên trang.
 5. Máy tính: gửi một ảnh bất kỳ (không phải ảnh giấy tờ) vào «Cloud của tôi» trên Zalo máy tính; mở trang thử kéo ảnh;
    kéo ảnh từ Zalo vào ô; rồi chép ảnh trong Zalo và dán vào trang.
 6. Xong: Ctrl+C ở đây — máy ghi tóm tắt.
`);
}

export async function chay(argv = process.argv.slice(2), { coLenh = coLenhThat } = {}) {
  const ds = docDoiSo(argv);
  const thuMuc = ds.thuMuc ?? path.join(GOC_KHO, '.acceptance-runs', 'bai-thu-zalo',
    `thu-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  mkdirSync(thuMuc, { recursive: true });
  const tepNhatKy = path.join(thuMuc, 'nhat-ky.jsonl');
  writeFileSync(tepNhatKy, '');
  const nhatKy = taoNhatKy(tepNhatKy);
  const may = taoMayChu({ nhatKy });
  await new Promise((ok, loi) => {
    may.once('error', loi);
    may.listen(ds.cong, ok);
  });
  const cong = may.address().port;
  const duoi = randomBytes(2).toString('hex');
  const ma = { A: `A-${duoi}`, I: `I-${duoi}`, K: `K-${duoi}` };
  console.log(`máy chủ thử: http://localhost:${cong} · nhật ký: ${tepNhatKy}`);

  let ham = null;
  let goc = `http://localhost:${cong}`;
  if (ds.khongHam) {
    console.log('đường hầm: tắt theo --khong-ham — chỉ thử trên máy này');
  } else {
    const loai = chonHam(coLenh);
    if (!loai) {
      console.log('không mở được đường hầm: máy không có cloudflared cũng không có ssh — cài bằng «brew install cloudflared» rồi chạy lại');
    } else {
      ham = moHam(loai, cong);
      const url = await ham.url;
      if (url) goc = url;
      else console.log(`không mở được đường hầm qua ${loai} trong 45 giây (mạng có thể chặn) — link chỉ chạy trên máy này; thử mạng khác (điểm phát điện thoại)`);
    }
  }
  inBuoc(goc, ma);

  const dung = () => {
    const tomTat = { luc: new Date().toISOString(), goc, ma, dem: demTheoMa(nhatKy.dong), so_su_kien: nhatKy.dong.length };
    writeFileSync(path.join(thuMuc, 'tom-tat.json'), `${JSON.stringify(tomTat, null, 2)}\n`);
    console.log(`\nđã ghi tóm tắt: ${path.join(thuMuc, 'tom-tat.json')}`);
    ham?.tt.kill();
    may.close();
    process.exit(0);
  };
  process.once('SIGINT', dung);
  process.once('SIGTERM', dung);
  return { may, cong, thuMuc, ma };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  chay().catch((e) => {
    console.error(`bài thử không chạy được: ${e.message}`);
    process.exit(1);
  });
}
