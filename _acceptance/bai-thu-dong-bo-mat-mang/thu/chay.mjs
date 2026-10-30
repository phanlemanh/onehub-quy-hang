#!/usr/bin/env node
// Một lệnh chạy bài thử đồng bộ: áp bảng + dữ liệu mẫu lên Postgres của dãy, mở máy chủ, đường hầm, in bước.
//   DATABASE_URL=postgres://… node _acceptance/bai-thu-dong-bo-mat-mang/thu/chay.mjs [--cong 3463] [--khong-ham] [--thu-muc <đường>]
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
// Bộ đọc đường hầm dùng chung với bài thử Zalo (chỉ báo sống khi đã nối thật).
import { chonHam, taoBoDocHam } from '../../bai-thu-zalo/thu/chay.mjs';
import { apDuLieuMau, taoMayChu, taoNhatKy } from './may-chu.mjs';
import { bangKetQua } from './tom-tat.mjs';

const DAY = path.dirname(fileURLToPath(import.meta.url));
export const GOC_KHO = path.resolve(DAY, '../../..');

const coLenhThat = (ten) => spawnSync('sh', ['-c', `command -v ${ten}`], { stdio: 'ignore' }).status === 0;

function moHam(loai, cong) {
  const doiSo =
    loai === 'cloudflared'
      ? ['tunnel', '--no-autoupdate', '--url', `http://localhost:${cong}`]
      : ['-o', 'StrictHostKeyChecking=accept-new', '-o', 'ServerAliveInterval=30', '-R', `80:localhost:${cong}`, 'nokey@localhost.run'];
  const tt = spawn(loai === 'cloudflared' ? 'cloudflared' : 'ssh', doiSo, { stdio: ['ignore', 'pipe', 'pipe'] });
  const doc = taoBoDocHam(loai);
  let daBao = false;
  let duoi = '';
  const url = new Promise((ok) => {
    const nhan = (c) => {
      duoi = (duoi + String(c)).slice(-600);
      const u = doc(c);
      if (u && !daBao) {
        daBao = true;
        ok(u);
      }
    };
    tt.stdout.on('data', nhan);
    tt.stderr.on('data', nhan);
    tt.on('exit', (ma) => {
      if (daBao) console.log(`\nđường hầm ${loai} đã đóng — link công khai không còn sống`);
      else ok({ loi: `${loai} thoát mã ${ma}: ${duoi.trim().split('\n').at(-1) ?? ''}` });
    });
    setTimeout(() => {
      if (!daBao) {
        daBao = true;
        tt.kill();
        ok({ loi: `${loai} chưa nối được sau 45 giây (mạng có thể chặn cổng 7844) — dùng điểm phát điện thoại` });
      }
    }, 45_000);
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

function inBuoc(goc) {
  console.log(`
Bài thử đồng bộ — mở ở ${goc}/thu

Các bước (một lần ngồi, khoảng 15 phút; Mac và điện thoại cùng dùng điểm phát của điện thoại — mạng công ty chặn đường hầm):
 1. Trên điện thoại mở ${goc}/thu, chọn «Đầu chủ A1». Bảng hiện 4 căn sàn A, số chủ chỉ ở A-01, A-02. Để màn hình sáng.
 2. Bật chế độ máy bay (hoặc tắt Wi-Fi và dữ liệu di động) trên điện thoại. Trang chuyển «Mất mạng».
 3. Trong lúc mất mạng: bấm «+10» ba lần ở A-01 và hai lần ở A-02 — số chờ đẩy lên 5. KHÔNG tải lại trang.
 4. Chờ đủ 5 phút (đồng hồ điện thoại), vẫn giữ trang mở.
 5. Tắt chế độ máy bay. Trang về «Có mạng», số chờ về 0, giá mới hiện.
 6. Đổi vai «Trưởng nhóm A» rồi «Đầu chủ B1» trên cùng trang (mỗi vai kéo về một lần).
 7. Xong: Ctrl+C ở đây — máy ghi tóm tắt.
`);
}

export async function chay(argv = process.argv.slice(2), { coLenh = coLenhThat } = {}) {
  const ds = docDoiSo(argv);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('thiếu DATABASE_URL — trỏ tới Postgres của dãy (ví dụ cổng 5547)');
  const thuMuc =
    ds.thuMuc ?? path.join(GOC_KHO, '.acceptance-runs', 'bai-thu-dong-bo-mat-mang', `thu-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  mkdirSync(thuMuc, { recursive: true });
  const tepNhatKy = path.join(thuMuc, 'nhat-ky.jsonl');
  writeFileSync(tepNhatKy, '');
  await apDuLieuMau(url);
  const pool = new pg.Pool({ connectionString: url, max: 4 });
  const nhatKy = taoNhatKy(tepNhatKy);
  const may = taoMayChu({ pool, nhatKy });
  await new Promise((ok, loi) => {
    may.once('error', loi);
    may.listen(ds.cong, ok);
  });
  const cong = may.address().port;
  console.log(`máy chủ thử: http://localhost:${cong} · nhật ký: ${tepNhatKy} · đã áp dữ liệu mẫu: 2 sàn, 4 người, 6 căn`);

  let ham = null;
  let goc = `http://localhost:${cong}`;
  if (ds.khongHam) console.log('đường hầm: tắt theo --khong-ham — chỉ thử trên máy này');
  else {
    const loai = chonHam(coLenh);
    if (!loai) console.log('không mở được đường hầm: máy không có cloudflared cũng không có ssh — cài bằng «brew install cloudflared»');
    else {
      ham = moHam(loai, cong);
      const kq = await ham.url;
      if (typeof kq === 'string') goc = kq;
      else console.log(`không mở được đường hầm: ${kq.loi} — link chỉ chạy trên máy này`);
    }
  }
  inBuoc(goc);

  const dung = async () => {
    const tomTat = { luc: new Date().toISOString(), goc, so_su_kien: nhatKy.dong.length, bang: bangKetQua(nhatKy.dong) };
    writeFileSync(path.join(thuMuc, 'tom-tat.json'), `${JSON.stringify(tomTat, null, 2)}\n`);
    console.log(`\nđã ghi tóm tắt: ${path.join(thuMuc, 'tom-tat.json')}`);
    ham?.tt.kill();
    may.close();
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', dung);
  process.once('SIGTERM', dung);
  return { may, cong, thuMuc };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  chay().catch((e) => {
    console.error(`bài thử không chạy được: ${e.message}`);
    process.exit(1);
  });
}
