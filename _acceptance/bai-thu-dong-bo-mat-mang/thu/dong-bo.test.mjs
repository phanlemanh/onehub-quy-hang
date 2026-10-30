// Bài kiểm bộ đồng bộ tự làm mỏng — chạy trên Postgres thật đã áp 001_nen_cong_ty.sql (DATABASE_URL của dãy).
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { kiemNhatKyKhongIp } from '../../bai-thu-zalo/thu/kiem-chung.mjs';
import { CAN, MOI_SO_CHU, NGUOI, SAN_A, SAN_B, soChuDuocThay } from './du-lieu-mau.mjs';
import { kiemThuTu, taoHangDoi } from './hang-doi.mjs';
import { apDuLieuMau, keo, taoMayChu, taoNhatKy, trongPhien } from './may-chu.mjs';
import { bangKetQua, ketLuan, lamSach } from './tom-tat.mjs';

// Vắng DATABASE_URL (lượt chấm chạy trong vỏ mới) thì lùi về Postgres dãy T — luật 7 của đợt nen-dau: T → 5547.
const URL_DB = process.env.DATABASE_URL ?? 'postgres://postgres:quyhang@localhost:5547/postgres';

let pool;
let may;
let goc;
let nhatKy;

before(async () => {
  await apDuLieuMau(URL_DB);
  pool = new pg.Pool({ connectionString: URL_DB, max: 4 });
  nhatKy = taoNhatKy();
  may = taoMayChu({ pool, nhatKy, muoi: 'kiem' });
  await new Promise((ok) => may.listen(0, '127.0.0.1', ok));
  goc = `http://127.0.0.1:${may.address().port}`;
});
after(async () => {
  may.close();
  await pool.end();
});

const keoVe = async (nguoi) => (await fetch(`${goc}/keo?nguoi=${nguoi ?? ''}&sau=0`)).json();
const day = async (nguoi, ops, cat) =>
  (await fetch(`${goc}/day${cat ? `?cat=${cat}` : ''}`, { method: 'POST', body: JSON.stringify({ nguoi, client_id: `kiem-${nguoi}`, ops }) })).json();
const opMoi = (seq, listing_id, price, tao_luc) => ({ op_id: crypto.randomUUID(), client_seq: seq, listing_id, price, tao_luc });

/** Hàm kiểm dùng chung cho ca xanh và ca phá thử. */
function kiemKeoTheoSan(nguoi, kq) {
  const san = NGUOI[nguoi].san;
  for (const x of [...kq.listings, ...kq.changes, ...kq.contacts]) {
    if (x.company_id !== san) throw new Error('lộ dòng sàn khác');
  }
}
function kiemSoChu(nguoi, kq) {
  const toanVan = JSON.stringify(kq);
  const mong = soChuDuocThay(nguoi);
  for (const so of MOI_SO_CHU) {
    if (toanVan.includes(so) && !mong.has(so)) throw new Error(`lộ số chủ ${so}`);
    if (!toanVan.includes(so) && mong.has(so)) throw new Error(`thiếu số chủ ${so}`);
  }
}

describe('AC-1 kéo theo sàn', () => {
  for (const nguoi of Object.keys(NGUOI)) {
    test(`${nguoi}: không dòng nào của sàn kia, có dòng của sàn mình`, async () => {
      const kq = await keoVe(nguoi);
      kiemKeoTheoSan(nguoi, kq);
      assert.ok(kq.listings.length >= 1 && kq.changes.length >= 1, 'đối chứng dương: phải nhận dòng của sàn mình');
    });
  }
  test('phiên không đặt sàn nhận rỗng', async () => {
    const kq = await keoVe('');
    assert.equal(kq.listings.length + kq.changes.length + kq.contacts.length, 0);
  });
});

describe('AC-2 số chủ theo vai', () => {
  for (const nguoi of Object.keys(NGUOI)) {
    test(`${nguoi}: tập số chủ bằng đúng ma trận, quét toàn văn`, async () => {
      const kq = await keoVe(nguoi);
      assert.deepEqual(new Set(kq.contacts.map((c) => c.phone)), soChuDuocThay(nguoi));
      kiemSoChu(nguoi, kq);
    });
  }
  test('A1 đổi giá căn có số chủ rồi A2 kéo → không thấy số của A1', async () => {
    const tl = await day('a1', [opMoi(1, 'A-01', 3300)]);
    assert.equal(tl.ket_qua[0].trang_thai, 'da-ap', 'lần ghi của A1 phải được áp thì ca mới thử dòng thay đổi trên căn có số chủ');
    kiemSoChu('a2', await keoVe('a2'));
  });
  test('phá thử: chèn số chủ của A1 vào dữ liệu A2 → đỏ «lộ số chủ»', async () => {
    const kq = await keoVe('a2');
    kq.changes.push({ ghi_chu: CAN[0].so_chu });
    assert.throws(() => kiemSoChu('a2', kq), /lộ số chủ/);
  });
});

describe('AC-3 cách ly ở cơ sở dữ liệu', () => {
  test('máy chủ chạy bằng quy_hang_app, vai không vượt luật theo dòng', async () => {
    const kq = await keoVe('a1');
    assert.equal(kq.current_user, 'quy_hang_app');
    assert.equal(kq.rolbypassrls, false);
  });
  test('hàm kéo không lọc theo sàn vẫn chỉ trả dòng sàn của phiên', async () => {
    const kq = await trongPhien(pool, 'b1', (c) => keo(c, 0));
    kiemKeoTheoSan('b1', kq);
    assert.ok(kq.listings.length >= 1 && kq.contacts.length >= 1, 'đối chứng dương: hàm kéo phải trả dòng của sàn B');
  });
  test('phá thử: tắt luật theo dòng của ba bảng trong giao dịch → đỏ «lộ dòng sàn khác»', async () => {
    const c = await pool.connect();
    try {
      await c.query('begin');
      for (const b of ['listings', 'changes', 'owner_contacts']) await c.query(`alter table thu_dong_bo.${b} no force row level security`);
      for (const b of ['listings', 'changes', 'owner_contacts']) await c.query(`alter table thu_dong_bo.${b} disable row level security`);
      await c.query('set local role quy_hang_app');
      await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', 'b1', true), set_config('app.role', 'dau-chu', true)", [SAN_B]);
      const kq = await keo(c, 0);
      assert.throws(() => kiemKeoTheoSan('b1', kq), /lộ dòng sàn khác/);
    } finally {
      await c.query('rollback');
      c.release();
    }
  });
});

describe('AC-4 hàng đợi khi mất mạng', () => {
  test('5 thao tác khi mất mạng → giữ thứ tự, nạp lại còn đủ; nối mạng → áp đúng thứ tự', async () => {
    let kho = null;
    let coMang = false;
    const tao = () =>
      taoHangDoi({
        clientId: 'kiem-ac4',
        luu: (tt) => (kho = tt),
        nap: () => kho,
        gui: async (ops) => {
          if (!coMang) throw new Error('mất mạng');
          return day('a2', ops);
        },
      });
    const hd = tao();
    const gia = [2810, 2820, 2830, 2840, 2850];
    for (const g of gia) hd.them('A-03', g);
    await assert.rejects(hd.day(), /mất mạng/);
    assert.equal(hd.soCho(), 5);
    const hd2 = tao();
    assert.deepEqual(hd2.cho().map((o) => o.client_seq), [1, 2, 3, 4, 5]);
    coMang = true;
    const tl = await hd2.day();
    assert.equal(kiemThuTu(tl.ket_qua), 5);
    assert.equal(hd2.soCho(), 0);
    const can = (await keoVe('a2')).listings.find((l) => l.id === 'A-03');
    assert.equal(can.price, 2850);
  });
  test('một thao tác lỗi giữa lô → dừng phần sau, gửi lại vẫn áp đúng thứ tự', async () => {
    let hong = true;
    const hd = taoHangDoi({
      clientId: 'kiem-ac4-loi',
      // Lần đầu thao tác 2 mang giá không phải số → máy chủ báo lỗi; lần sau gửi giá đúng.
      gui: async (ops) => day('a2', ops.map((o) => (hong && o.client_seq === 2 ? { ...o, price: 'khong-phai-so' } : o))),
    });
    for (const g of [2910, 2920, 2930]) hd.them('A-03', g);
    const lan1 = await hd.day();
    assert.deepEqual(lan1.ket_qua.map((k) => k.trang_thai), ['da-ap', 'loi'], 'thao tác lỗi phải dừng lô, không áp thao tác 3');
    assert.deepEqual(hd.cho().map((o) => o.client_seq), [2, 3]);
    hong = false;
    const lan2 = await hd.day();
    assert.equal(kiemThuTu([...lan1.ket_qua, ...lan2.ket_qua]), 3);
    assert.equal((await keoVe('a2')).listings.find((l) => l.id === 'A-03').price, 2930);
  });
  test('phá thử: đảo thứ tự seq trong bản sao kết quả → đỏ «sai thứ tự»', () => {
    const ketQua = [1, 2, 3].map((i) => ({ client_seq: i, trang_thai: 'da-ap', seq: 10 - i }));
    assert.throws(() => kiemThuTu(ketQua), /sai thứ tự/);
  });
});

describe('AC-5 không trùng không mất', () => {
  test('gửi cùng lô hai lần → lần hai «đã áp trước», sổ thay đổi không thêm dòng', async () => {
    const ops = [opMoi(1, 'A-04', 5610), opMoi(2, 'A-04', 5620)];
    await day('a2', ops);
    const truoc = (await keoVe('a2')).changes.length;
    const lan2 = await day('a2', ops);
    assert.deepEqual(lan2.ket_qua.map((k) => k.trang_thai), ['da-ap-truoc', 'da-ap-truoc']);
    assert.equal((await keoVe('a2')).changes.length, truoc);
  });
  test('lô 4 thao tác bị cắt sau 2 → hàng đợi còn đúng 2 thao tác sau, gửi lại được', async () => {
    let cat = 2;
    const hd = taoHangDoi({ clientId: 'kiem-ac5', gui: async (ops) => day('a1', ops, cat) });
    for (const g of [4110, 4120, 4130, 4140]) hd.them('A-02', g);
    await hd.day();
    assert.deepEqual(hd.cho().map((o) => o.client_seq), [3, 4]);
    cat = 0;
    await hd.day();
    assert.equal(hd.soCho(), 0);
    assert.equal((await keoVe('a1')).listings.find((l) => l.id === 'A-02').price, 4140);
  });
});

describe('AC-6 ghi sai sàn bị từ chối', () => {
  test('B1 đổi giá căn sàn A → bị từ chối, giá không đổi, không thêm dòng thay đổi', async () => {
    const truoc = await keoVe('a1');
    const tl = await day('b1', [opMoi(1, 'A-01', 1)]);
    assert.equal(tl.ket_qua[0].trang_thai, 'bi-tu-choi');
    assert.match(tl.ket_qua[0].ly_do, /không thuộc sàn/);
    const sau = await keoVe('a1');
    assert.equal(sau.listings.find((l) => l.id === 'A-01').price, truoc.listings.find((l) => l.id === 'A-01').price);
    assert.equal(sau.changes.length, truoc.changes.length);
  });
  test('đối chứng dương: A1 đổi giá căn của mình → áp', async () => {
    const tl = await day('a1', [opMoi(1, 'A-01', 3350)]);
    assert.equal(tl.ket_qua[0].trang_thai, 'da-ap');
  });
});

describe('AC-9 luật kết luận', () => {
  const T0 = Date.parse('2026-10-30T03:00:00Z');
  const lucGiay = (giay) => new Date(T0 + giay * 1000).toISOString();
  const ghiMang = (nguoi, trang_thai, giay, so_cho) =>
    fetch(`${goc}/ghi`, { method: 'POST', body: JSON.stringify({ loai: 'mang', nguoi, trang_thai, luc_may: lucGiay(giay), so_cho }) });

  /**
   * Dựng một phiên bằng máy chủ thật: ba vai kéo về, mất mạng `giay` giây với `soOp` thao tác.
   * `canOp(i)` chọn căn của thao tác i; `soCho` là số máy còn giữ lúc nối lại; `khongSan` thêm một lần kéo không đặt sàn;
   * `sua(dong)` sửa bản sao nhật ký máy chủ đã ghi (phá thử dựa trên dòng thật, không nặn tay).
   */
  async function phien({ giay, soOp, dao = false, canOp = () => 'A-01', soCho, khongSan = false, sua = null }) {
    const tu = nhatKy.dong.length;
    for (const n of ['a1', 'tnA', 'b1']) await keoVe(n);
    if (khongSan) await keoVe('');
    await ghiMang('a1', 'tat', 0, 0);
    const ops = Array.from({ length: soOp }, (_, i) => opMoi(i + 1, canOp(i), 3400 + i, lucGiay(30 + i)));
    await ghiMang('a1', 'bat', giay, soCho ?? soOp);
    if (soOp) await day('a1', ops);
    const dong = lamSach(nhatKy.dong.slice(tu));
    if (dao) {
      const d = dong.find((x) => x.loai === 'day');
      d.ket_qua = d.ket_qua.map((k, i, a) => ({ ...k, seq: a[a.length - 1 - i].seq }));
    }
    if (sua) sua(dong);
    return dong;
  }
  const keoCua = (dong, nguoi) => dong.find((x) => x.loai === 'keo' && x.nguoi === nguoi);

  test('mất mạng 6 phút, 3 thao tác đúng thứ tự, ba vai sạch → hai vế đạt', async () => {
    const kl = ketLuan(await phien({ giay: 360, soOp: 3 }));
    assert.deepEqual(kl.map((k) => k.dat), [true, true]);
  });
  test('mất mạng 4 phút → vế 2 không đạt', async () => {
    assert.equal(ketLuan(await phien({ giay: 240, soOp: 3 }))[1].dat, false);
  });
  test('lên sai thứ tự → vế 2 không đạt', async () => {
    assert.equal(ketLuan(await phien({ giay: 360, soOp: 3, dao: true }))[1].dat, false);
  });
  test('không thao tác nào trong khoảng mất mạng → vế 2 không đạt', async () => {
    assert.equal(ketLuan(await phien({ giay: 360, soOp: 0 }))[1].dat, false);
  });
  test('mất mạng 299,5 giây → vế 2 không đạt (không làm tròn lên 5 phút); đúng 300 giây → đạt', async () => {
    assert.equal(ketLuan(await phien({ giay: 299.5, soOp: 3 }))[1].dat, false);
    assert.equal(ketLuan(await phien({ giay: 300, soOp: 3 }))[1].dat, true);
  });
  test('một thao tác trong khoảng mất mạng bị từ chối → vế 2 không đạt', async () => {
    const dong = await phien({ giay: 360, soOp: 3, canOp: (i) => (i === 2 ? 'B-01' : 'A-01') });
    assert.equal(dong.find((x) => x.loai === 'day').ket_qua[2].trang_thai, 'bi-tu-choi');
    const kl = ketLuan(dong);
    assert.equal(kl[1].dat, false);
    assert.match(kl[1].so, /3 thao tác, không đạt thứ tự/);
  });
  test('máy còn giữ 5 thao tác lúc nối lại mà máy chủ chỉ thấy 3 → vế 2 không đạt', async () => {
    const kl = ketLuan(await phien({ giay: 360, soOp: 3, soCho: 5 }));
    assert.equal(kl[1].dat, false);
    assert.match(kl[1].so, /máy còn giữ 5 lúc nối lại/);
  });
  test('một lần kéo chứa dòng sàn khác → vế 1 không đạt «lộ trong phiên thật: dòng sàn khác»', async () => {
    const kl = ketLuan(await phien({ giay: 360, soOp: 3, sua: (dong) => keoCua(dong, 'b1').cong_ty_nhan.push(SAN_A) }));
    assert.equal(kl[0].dat, false);
    assert.match(kl[0].so, /lộ trong phiên thật: dòng sàn khác/);
  });
  test('một lần kéo có số chủ ngoài ma trận vai → vế 1 không đạt «lộ trong phiên thật: số chủ ngoài ma trận vai»', async () => {
    const soA2 = [...soChuDuocThay('a2')][0];
    const kl = ketLuan(await phien({ giay: 360, soOp: 3, sua: (dong) => keoCua(dong, 'a1').so_chu_nhan.push(soA2) }));
    assert.equal(kl[0].dat, false);
    assert.match(kl[0].so, /lộ trong phiên thật: số chủ ngoài ma trận vai/);
  });
  test('lần kéo không đặt sàn: sạch thì vế 1 vẫn đạt; mang dòng sàn A thì vế 1 không đạt', async () => {
    assert.equal(ketLuan(await phien({ giay: 360, soOp: 3, khongSan: true }))[0].dat, true);
    const kl = ketLuan(await phien({ giay: 360, soOp: 3, khongSan: true, sua: (dong) => keoCua(dong, '').cong_ty_nhan.push(SAN_A) }));
    assert.equal(kl[0].dat, false);
    assert.match(kl[0].so, /phiên không đặt sàn/);
  });
  test('bảng kết quả có hai vế đạt và đúng một hàng cho mỗi lần kéo trong nhật ký', async () => {
    const dong = await phien({ giay: 360, soOp: 2, khongSan: true });
    const bang = bangKetQua(dong);
    assert.match(bang, /\| 1 \| .* \| đạt \|/);
    assert.match(bang, /\| 2 \| .* \| đạt \|/);
    const muc = bang.split('### Các lần kéo về')[1].split('###')[0];
    const hang = muc.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Người') && !l.startsWith('| ---'));
    assert.equal(hang.length, dong.filter((x) => x.loai === 'keo').length);
    assert.equal(hang.length, 4);
  });
});

describe('AC-8 một lệnh', () => {
  test('chạy --khong-ham: áp mẫu, in link /thu và bước; nhật ký không IP thô; SIGINT ghi tóm tắt', async () => {
    const goc0 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..', '.acceptance-runs', 'bai-thu-dong-bo-mat-mang');
    mkdirSync(goc0, { recursive: true });
    const thuMuc = mkdtempSync(path.join(goc0, 'kiem-'));
    try {
      const chay = path.join(path.dirname(fileURLToPath(import.meta.url)), 'chay.mjs');
      const tt = spawn(process.execPath, [chay, '--khong-ham', '--cong', '0', '--thu-muc', thuMuc], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, DATABASE_URL: URL_DB } });
      let ra = '';
      await new Promise((ok, loi) => {
        tt.stdout.on('data', (c) => {
          ra += c;
          if (ra.includes('Các bước')) ok();
        });
        tt.on('exit', (m) => loi(new Error(`lệnh thoát sớm ${m}: ${ra}`)));
      });
      assert.match(ra, /\/thu/);
      const cong = ra.match(/http:\/\/localhost:(\d+)/)[1];
      // Đếm dữ liệu mẫu lệnh vừa áp (không đọc câu lệnh in ra): 2 sàn, 6 căn, 6 số chủ; 4 người mẫu mỗi người kéo được phần mình.
      const dem = (await pool.query(
        'select (select count(distinct company_id) from thu_dong_bo.listings) as san, (select count(*) from thu_dong_bo.listings) as can, (select count(*) from thu_dong_bo.owner_contacts) as so_chu',
      )).rows[0];
      assert.deepEqual({ san: Number(dem.san), can: Number(dem.can), so_chu: Number(dem.so_chu) }, { san: 2, can: 6, so_chu: 6 });
      for (const n of Object.keys(NGUOI)) {
        const kq = await (await fetch(`http://127.0.0.1:${cong}/keo?nguoi=${n}&sau=0`)).json();
        assert.ok(kq.listings.length >= 1 && kq.listings.every((l) => l.company_id === NGUOI[n].san), `${n} phải kéo được căn sàn mình qua lệnh một-lệnh`);
      }
      assert.equal(Object.keys(NGUOI).length, 4);
      await fetch(`http://127.0.0.1:${cong}/keo?nguoi=a1&sau=0`, { headers: { 'x-forwarded-for': '203.0.113.7' } });
      const thoat = new Promise((ok) => tt.on('exit', ok));
      tt.kill('SIGINT');
      assert.equal(await thoat, 0);
      const nk = readFileSync(path.join(thuMuc, 'nhat-ky.jsonl'), 'utf8');
      const tomTat = readFileSync(path.join(thuMuc, 'tom-tat.json'), 'utf8');
      for (const chu of [nk, tomTat]) for (const ip of ['127.0.0.1', '203.0.113.7']) assert.ok(!chu.includes(ip), `có ${ip}`);
      kiemNhatKyKhongIp(nk);
      assert.throws(() => kiemNhatKyKhongIp(nk.replace('{', '{"x_forwarded_for":"203.0.113.7",')), /có IP thô/);
    } finally {
      rmSync(thuMuc, { recursive: true, force: true });
    }
  });
});

describe('dữ liệu mẫu', () => {
  test('hai sàn, bốn người, sáu căn, số chủ dạng 0900 000 0xx', () => {
    assert.deepEqual(new Set(Object.values(NGUOI).map((n) => n.san)), new Set([SAN_A, SAN_B]));
    assert.equal(CAN.length, 6);
    assert.ok(MOI_SO_CHU.every((s) => /^0900 000 0\d\d$/.test(s)));
  });
});
