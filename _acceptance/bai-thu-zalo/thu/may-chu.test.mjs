import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { chonCachChiaSe, MAU_MAY, phanLop } from './dem.mjs';
import { kiemAnh, kiemChiMau, kiemTheOg, layThe } from './kiem-chung.mjs';
import { taoMayChu, taoNhatKy } from './may-chu.mjs';

const UA = {
  safariIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  zaloTrongApp:
    'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 Zalo android/12345',
};

let may;
let goc;
let nhatKy;

before(async () => {
  nhatKy = taoNhatKy();
  may = taoMayChu({ nhatKy, muoi: 'kiem' });
  await new Promise((ok) => may.listen(0, '127.0.0.1', ok));
  goc = `http://127.0.0.1:${may.address().port}`;
});
after(() => may.close());

const lay = (p, dau = {}) => fetch(`${goc}${p}`, { headers: dau });
const bao = (ma, phien, ua, dau = {}) =>
  fetch(`${goc}/mo`, { method: 'POST', headers: { 'user-agent': ua, ...dau }, body: JSON.stringify({ ma, phien }) });
const dem = async (ma) => (await (await lay('/dem')).json()).dem.find((d) => d.ma === ma);

describe('AC-1 thẻ Open Graph', () => {
  test('trang gọi không JS đã có đủ thẻ, URL tuyệt đối theo host của yêu cầu', async () => {
    const html = await (await lay('/s/A-1', { 'user-agent': 'facebookexternalhit/1.1' })).text();
    kiemTheOg(html);
    assert.equal(layThe(html, 'og:image'), `${goc}/og/A-1.png`);
    assert.equal(layThe(html, 'og:url'), `${goc}/s/A-1`);
  });
  test('sau đường hầm: theo x-forwarded-proto và x-forwarded-host', async () => {
    const html = await (
      await lay('/s/A-1', { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'vi-du.trycloudflare.com' })
    ).text();
    assert.equal(layThe(html, 'og:image'), 'https://vi-du.trycloudflare.com/og/A-1.png');
    assert.equal(layThe(html, 'og:url'), 'https://vi-du.trycloudflare.com/s/A-1');
  });
  test('phá thử: bỏ og:image trong bản sao → đỏ «thiếu og:image»', async () => {
    const html = await (await lay('/s/A-1')).text();
    assert.throws(() => kiemTheOg(html.replace(/<meta property="og:image" [^>]*>/, '')), /thiếu og:image/);
  });
});

describe('AC-2 ảnh xem trước', () => {
  test('PNG 1200×630, image/png, dưới 300 KB', async () => {
    const r = await lay('/og/A-1.png');
    assert.equal(r.headers.get('content-type'), 'image/png');
    kiemAnh(Buffer.from(await r.arrayBuffer()));
  });
  test('phá thử: đổi cỡ trong IHDR → đỏ «cỡ ảnh khác 1200×630»', async () => {
    const buf = Buffer.from(await (await lay('/og/A-1.png')).arrayBuffer());
    buf.writeUInt32BE(1201, 16);
    assert.throws(() => kiemAnh(buf), /cỡ ảnh khác 1200×630/);
  });
});

describe('AC-3 tải mà không báo thì không mở', () => {
  test('tải trang + ảnh không báo → 0; một báo → 1; báo lại cùng phiên → 1; phiên khác → 2', async () => {
    await lay('/s/T3', { 'user-agent': UA.safariIphone });
    await lay('/og/T3.png', { 'user-agent': UA.safariIphone });
    let o = await dem('T3');
    assert.equal(o.tai_trang, 1);
    assert.equal(o.tai_anh, 1);
    assert.equal(o.mo, 0);
    await bao('T3', 'p1', UA.safariIphone);
    assert.equal((await dem('T3')).mo, 1);
    await bao('T3', 'p1', UA.safariIphone);
    assert.equal((await dem('T3')).mo, 1);
    await bao('T3', 'p2', UA.chromeAndroid);
    o = await dem('T3');
    assert.equal(o.mo, 2);
    assert.equal(o.mo_bi_loai, 0);
  });
});

describe('AC-4 lượt báo của máy bị loại', () => {
  // Ma trận viết trước: mọi mẫu của lớp máy, cộng đầu prefetch.
  const MA_TRAN = [...MAU_MAY.map((m) => ({ ua: `Mozilla/5.0 (compatible; X-${m}/1.0)`, dau: {}, mau: m })),
    { ua: UA.chromeAndroid, dau: { 'sec-purpose': 'prefetch' }, mau: 'sec-purpose' }];
  test('ma trận phủ trọn MAU_MAY + prefetch', () => {
    assert.equal(MA_TRAN.length, MAU_MAY.length + 1);
  });
  for (const [i, c] of MA_TRAN.entries()) {
    test(`máy «${c.mau}» → bị loại kèm lý do`, async () => {
      const ma = `T4-${i}`;
      await bao(ma, 'p', c.ua, c.dau);
      const o = await dem(ma);
      assert.equal(o.mo, 0);
      assert.equal(o.mo_bi_loai, 1);
      assert.match(o.ly_do_loai[0], new RegExp(c.mau.replace(/[-]/g, '\\-')));
    });
  }
  for (const [ten, ua] of Object.entries(UA)) {
    test(`đối chứng người «${ten}» → tính`, async () => {
      assert.equal(phanLop(ua, {}).lop, 'nguoi');
      await bao(`T4-${ten}`, 'p', ua);
      assert.equal((await dem(`T4-${ten}`)).mo, 1);
    });
  }
  test('mỗi lượt tải trang ghi ua và lop', async () => {
    await lay('/s/T4-ghi', { 'user-agent': 'Zalo-thu-preview' });
    const d = nhatKy.dong.findLast((x) => x.loai === 'tai-trang' && x.ma === 'T4-ghi');
    assert.equal(d.ua, 'Zalo-thu-preview');
    assert.equal(d.lop, 'may');
  });
});

describe('AC-5 nhánh chia sẻ', () => {
  const tep = { name: 'mau.png' };
  test('ba nhánh của chonCachChiaSe', () => {
    assert.equal(chonCachChiaSe({ share() {}, canShare: () => true }, tep), 'tep');
    assert.equal(chonCachChiaSe({ share() {}, canShare: () => false }, tep), 'link');
    assert.equal(chonCachChiaSe({ share() {} }, tep), 'link');
    assert.equal(chonCachChiaSe({}, tep), 'khong-ho-tro');
  });
  test('POST /ghi một kết cục chia sẻ → đúng một dòng chia-se', async () => {
    const truoc = nhatKy.dong.filter((d) => d.loai === 'chia-se').length;
    await fetch(`${goc}/ghi`, { method: 'POST', body: JSON.stringify({ cach: 'tep', ket_cuc: 'huy', man: 'anh-tin' }) });
    const ds = nhatKy.dong.filter((d) => d.loai === 'chia-se');
    assert.equal(ds.length, truoc + 1);
    assert.equal(ds.at(-1).ket_cuc, 'huy');
  });
  test('trang chia sẻ nhúng đúng hàm chonCachChiaSe đã kiểm', async () => {
    const html = await (await lay('/chia-se')).text();
    assert.ok(html.includes(chonCachChiaSe.toString()));
  });
});

describe('AC-8 chỉ dữ liệu mẫu', () => {
  for (const p of ['/s/A-1', '/chia-se', '/keo-anh']) {
    test(`${p} chỉ có dữ liệu mẫu`, async () => kiemChiMau(await (await lay(p)).text()));
  }
  test('phá thử: chèn số điện thoại → đỏ «có số điện thoại»', async () => {
    const html = await (await lay('/s/A-1')).text();
    assert.throws(() => kiemChiMau(html.replace('</body>', '0912 345 678</body>')), /có số điện thoại/);
  });
});

describe('biên', () => {
  test('mã lạ → 404, không chèn vào trang', async () => {
    assert.equal((await lay('/s/%3Cscript%3E')).status, 404);
    assert.equal((await lay('/s/' + 'a'.repeat(33))).status, 404);
  });
  test('thân POST rác 20 KB → máy chủ vẫn sống', async () => {
    const r = await fetch(`${goc}/mo`, { method: 'POST', body: 'x'.repeat(20 * 1024) });
    assert.equal(r.status, 400);
    assert.equal((await lay('/dem')).status, 200);
  });
});
