import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { demTheoMa } from './dem.mjs';
import { kiemNhatKyKhongIp } from './kiem-chung.mjs';
import { taoMayChu, taoNhatKy } from './may-chu.mjs';
import { bangKetQua, ketLuan, lamSach, layBang, thayBang, thietBi } from './tom-tat.mjs';

const UA = {
  zaloMay: 'Zalo-thu-crawler/1.0',
  zaloAndroid: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 Chrome/129.0.0.0 Mobile Safari/537.36 Zalo android/1',
  zaloIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Zalo iOS/1',
  safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
  chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/129.0.0.0 Safari/537.36',
  bot: 'facebookexternalhit/1.1',
};

/** Dựng nhật ký bằng máy chủ thật: các bước gọi HTTP như phiên thử, `buoc` chọn ca nào chạy. */
async function phien(buoc) {
  const nhatKy = taoNhatKy();
  const may = taoMayChu({ nhatKy, muoi: 'kiem' });
  await new Promise((ok) => may.listen(0, '127.0.0.1', ok));
  const goc = `http://127.0.0.1:${may.address().port}`;
  const get = (p, ua) => fetch(`${goc}${p}`, { headers: { 'user-agent': ua, 'x-forwarded-for': '203.0.113.7' } });
  const post = (p, ua, du) => fetch(`${goc}${p}`, { method: 'POST', headers: { 'user-agent': ua }, body: JSON.stringify(du) });
  try {
    await buoc({ get, post });
    const dem = (await (await fetch(`${goc}/dem`)).json()).dem;
    return { dong: nhatKy.dong, dem };
  } finally {
    may.close();
  }
}

// Ma trận đủ của một phiên đạt cả bốn vế.
const DU = async ({ get, post }) => {
  for (const ma of ['K-1', 'A-1', 'I-1']) {
    await get(`/s/${ma}`, UA.zaloMay);
    await get(`/og/${ma}.png`, UA.zaloMay);
  }
  await post('/mo', UA.bot, { ma: 'A-1', phien: 'may' });
  await get('/s/A-1', UA.zaloAndroid);
  await post('/mo', UA.zaloAndroid, { ma: 'A-1', phien: 'a' });
  await post('/ghi', UA.zaloAndroid, { ma: 'A-1', cau: 'xem-truoc', tra_loi: 'co-anh', man: 's' });
  await get('/s/I-1', UA.zaloIphone);
  await post('/mo', UA.zaloIphone, { ma: 'I-1', phien: 'i' });
  await post('/ghi', UA.zaloIphone, { ma: 'I-1', cau: 'xem-truoc', tra_loi: 'co-anh', man: 's' });
  for (const kc of ['da-gui', 'huy', 'loi', 'khong-ho-tro']) {
    await post('/ghi', UA.safariIphone, { cach: kc === 'khong-ho-tro' ? 'khong-ho-tro' : 'tep', ket_cuc: kc, man: 'anh-tin' });
  }
  await post('/ghi', UA.safariIphone, { cau: 'zalo-nhan-anh', tra_loi: 'co', man: 'chia-se' });
  await post('/ghi', UA.safariIphone, { cau: 'zalo-nhan-tin', tra_loi: 'khong', man: 'chia-se' });
  await post('/ghi', UA.chromeMac, { cach: 'keo', co_tep: true, kieu: 'image/png', co: 1234, kieu_du_lieu: ['Files'], man: 'keo-anh' });
  await post('/ghi', UA.chromeMac, { cach: 'dan', co_tep: false, kieu_du_lieu: ['text/plain'], man: 'keo-anh' });
};

describe('AC-9 luật kết luận', () => {
  test('bảng đếm của tóm tắt bằng /dem của máy chủ thật', async () => {
    const { dong, dem } = await phien(DU);
    assert.deepEqual(demTheoMa(lamSach(dong)), dem);
  });
  test('phiên đủ ma trận → bốn vế đạt', async () => {
    const { dong } = await phien(DU);
    const kl = ketLuan(lamSach(dong));
    assert.deepEqual(kl.map((k) => [k.ve, k.dat]), [[1, true], [2, true], [3, true], [4, true]]);
    assert.match(kl[2].so, /Zalo nhận tin không/);
  });
  test('vế 2 đỏ khi K bị mở', async () => {
    const { dong } = await phien(async (h) => {
      await DU(h);
      await h.post('/mo', UA.zaloAndroid, { ma: 'K-1', phien: 'k' });
    });
    assert.equal(ketLuan(dong)[1].dat, false);
  });
  test('vế 2 đỏ khi Zalo không lấy K lần nào (không có đối chứng dương)', async () => {
    const { dong } = await phien(async (h) => {
      await DU(h);
    });
    const khongK = dong.filter((d) => d.ma !== 'K-1' || d.loai === 'mo');
    khongK.push({ loai: 'mo', ma: 'K-1', lop: 'may', ua: UA.bot, ly_do: 'UA chứa «bot»' });
    assert.equal(ketLuan(khongK)[1].dat, false);
  });
  test('vế 1 đỏ khi chỉ có câu trả lời «có ảnh» mà Zalo chưa tải ảnh của mã', async () => {
    const { dong } = await phien(async ({ post }) => {
      await post('/ghi', UA.zaloAndroid, { ma: 'A-9', cau: 'xem-truoc', tra_loi: 'co-anh', man: 's' });
      await post('/ghi', UA.zaloIphone, { ma: 'I-9', cau: 'xem-truoc', tra_loi: 'co-anh', man: 's' });
    });
    assert.equal(ketLuan(dong)[0].dat, false);
  });
  test('vế 4 đỏ khi máy tính chỉ nhận chữ', async () => {
    const { dong } = await phien(async ({ post }) => {
      await post('/ghi', UA.chromeMac, { cach: 'keo', co_tep: false, kieu_du_lieu: ['text/uri-list'], man: 'keo-anh' });
    });
    assert.equal(ketLuan(dong)[3].dat, false);
  });
  test('bản sạch không mang băm hay IP thô', async () => {
    const { dong } = await phien(DU);
    const jsonl = lamSach(dong).map((d) => JSON.stringify(d)).join('\n');
    assert.ok(!jsonl.includes('ip_bam'));
    kiemNhatKyKhongIp(jsonl);
  });
  test('thietBi phân đúng bốn nhóm', () => {
    assert.deepEqual([UA.zaloAndroid, UA.zaloIphone, UA.chromeMac, UA.zaloMay].map(thietBi), ['Android', 'iPhone', 'Máy tính', 'khác']);
  });
  test('bảng ghi vào giữa hai mốc rồi đọc lại đúng nguyên văn', async () => {
    const { dong } = await phien(DU);
    const bang = bangKetQua(dong);
    const md = thayBang('# Kết quả\n<!-- dem -->\ncũ\n<!-- /dem -->\nđuôi\n', bang);
    assert.equal(layBang(md), bang);
    assert.ok(md.endsWith('<!-- /dem -->\nđuôi\n'));
  });
});
