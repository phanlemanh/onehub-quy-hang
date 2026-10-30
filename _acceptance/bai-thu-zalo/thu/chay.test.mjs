import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';
import { chonHam, GOC_KHO, taoBoDocHam } from './chay.mjs';
import { kiemNhatKyKhongIp } from './kiem-chung.mjs';

const CHAY = path.join(path.dirname(fileURLToPath(import.meta.url)), 'chay.mjs');
const IP_GIA = '203.0.113.7';

describe('AC-7 chọn đường hầm', () => {
  test('có cloudflared → cloudflared; chỉ ssh → ssh; không có gì → null', () => {
    assert.equal(chonHam(() => true), 'cloudflared');
    assert.equal(chonHam((t) => t === 'ssh'), 'ssh');
    assert.equal(chonHam(() => false), null);
  });
});

describe('AC-7 đọc đường hầm', () => {
  test('localhost.run: bỏ qua link quản trị trong lời chào, nhận lhr.life', () => {
    const doc = taoBoDocHam('ssh');
    assert.equal(doc('To set up and manage custom domains go to https://admin.localhost.run/\n'), null);
    assert.equal(doc('abcd1234.lhr.life tunneled with tls termination, https://abcd1234.lhr.life\n'), 'https://abcd1234.lhr.life');
  });
  test('cloudflared: có URL mà chưa nối tới edge → chưa sống; có dòng nối → sống', () => {
    const doc = taoBoDocHam('cloudflared');
    assert.equal(doc('|  https://vi-du-mau.trycloudflare.com  |\n'), null);
    assert.equal(doc('ERR Failed to dial a quic connection error="timeout: no recent network activity"\n'), null);
    assert.equal(doc('INF Registered tunnel connection connIndex=0 location=sin01\n'), 'https://vi-du-mau.trycloudflare.com');
  });
});

describe('AC-7 một lệnh', () => {
  test('chạy --khong-ham: in link + bước; nhật ký, tóm tắt không IP thô; SIGINT ghi tóm tắt', async () => {
    const goc = path.join(GOC_KHO, '.acceptance-runs', 'bai-thu-zalo');
    mkdirSync(goc, { recursive: true });
    const thuMuc = mkdtempSync(path.join(goc, 'kiem-'));
    try {
      const tt = spawn(process.execPath, [CHAY, '--khong-ham', '--cong', '0', '--thu-muc', thuMuc], { stdio: ['ignore', 'pipe', 'pipe'] });
      let ra = '';
      await new Promise((ok, loi) => {
        tt.stdout.on('data', (c) => {
          ra += c;
          if (ra.includes('Các bước:')) ok();
        });
        tt.on('exit', (m) => loi(new Error(`lệnh thoát sớm ${m}: ${ra}`)));
      });
      for (const p of ['/s/A-', '/s/I-', '/s/K-', '/chia-se', '/keo-anh']) assert.ok(ra.includes(p), `thiếu link ${p}`);
      assert.match(ra, /đường hầm: tắt theo --khong-ham/);
      const cong = ra.match(/http:\/\/localhost:(\d+)/)[1];
      const ma = ra.match(/\/s\/(A-[0-9a-f]+)/)[1];
      await fetch(`http://127.0.0.1:${cong}/s/${ma}`, { headers: { 'x-forwarded-for': IP_GIA, 'cf-connecting-ip': IP_GIA } });
      await fetch(`http://127.0.0.1:${cong}/mo`, {
        method: 'POST',
        headers: { 'x-forwarded-for': IP_GIA },
        body: JSON.stringify({ ma, phien: 'p1' }),
      });
      const thoat = new Promise((ok) => tt.on('exit', ok));
      tt.kill('SIGINT');
      assert.equal(await thoat, 0);
      const nhatKy = readFileSync(path.join(thuMuc, 'nhat-ky.jsonl'), 'utf8');
      const tomTat = readFileSync(path.join(thuMuc, 'tom-tat.json'), 'utf8');
      assert.equal(nhatKy.trim().split('\n').length, 2);
      for (const chu of [nhatKy, tomTat]) {
        for (const ip of ['127.0.0.1', '::1', IP_GIA]) assert.ok(!chu.includes(ip), `có ${ip}`);
      }
      kiemNhatKyKhongIp(nhatKy);
      const o = JSON.parse(tomTat).dem.find((d) => d.ma === ma);
      assert.equal(o.mo, 1);
      assert.ok(thuMuc.startsWith(goc));
      assert.throws(() => kiemNhatKyKhongIp(nhatKy.replace('"ip_bam":', `"x_forwarded_for":"${IP_GIA}","ip_bam":`)), /có IP thô/);
    } finally {
      rmSync(thuMuc, { recursive: true, force: true });
    }
  });
});
