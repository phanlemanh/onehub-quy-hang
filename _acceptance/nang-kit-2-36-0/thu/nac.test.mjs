// Bài đo của hồ sơ nang-kit-2-36-0 (executors.script.nang_kit): mỗi nấc kit 2.36.0 kho bật một cặp hai chiều trên cùng
// dựng thử — bật thì có tác dụng, tắt hay thiếu thì khác đi, thông điệp ghim. Mọi dựng thử nằm ngoài cây kho (worktree
// tách đầu hay kho git tạm trong thư mục tạm của hệ điều hành) và được dọn khi xong; không ca nào ghi vào cây kho.
// Kit: CLAUDE_PLUGIN_ROOT, vắng thì bản cài của kho qua packages/ui-lint/tim-kit.mjs (cùng cách executors.script.san_m1).
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';

const SLUG = 'nang-kit-2-36-0';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE = 'origin/main';
const TAG = 'v2.36.0';
const KIT_SO = '2.36.0';

function timKit() {
  if (process.env.CLAUDE_PLUGIN_ROOT) return process.env.CLAUDE_PLUGIN_ROOT;
  return execFileSync('node', [path.join(ROOT, 'packages/ui-lint/tim-kit.mjs')], { cwd: ROOT, encoding: 'utf8' }).trim();
}
const KIT = timKit();

const doc = (f) => readFileSync(f, 'utf8');
const tamDir = (ten) => realpathSync(mkdtempSync(path.join(tmpdir(), `${ten}-`)));
const gitIn = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const chay = (cmd, a, cwd) => {
  const r = spawnSync(cmd, a, { cwd, encoding: 'utf8', env: { ...process.env, CLAUDE_PLUGIN_ROOT: KIT } });
  return { ma: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

// Worktree tách đầu ở HEAD, ngoài cây kho; `sua` đổi tệp rồi (tuỳ chọn) commit trên đầu tách — không nhánh nào đổi.
function voiWorktree(sua, fn) {
  const dir = path.join(tamDir('nang-kit-wt'), 'cay');
  gitIn(ROOT, 'worktree', 'add', '-q', '--detach', dir, 'HEAD');
  try {
    if (sua) {
      const commit = sua(dir);
      if (commit) {
        gitIn(dir, 'add', '-A');
        gitIn(dir, '-c', 'user.name=Thu', '-c', 'user.email=thu@example.invalid', 'commit', '-q', '-m', commit);
      }
    }
    return fn(dir);
  } finally {
    gitIn(ROOT, 'worktree', 'remove', '--force', dir);
  }
}
const preMerge = (dir, ...them) => chay('bash', [path.join(KIT, 'scripts/pre-merge-check.sh'), '.', '--base', BASE, ...them], dir);

// ---- bộ đọc thuần (đo cả chiều đỏ trên chính hàm này) ----
export function kiemBanKit(goc) {
  const f = path.join(goc, '.claude-plugin', 'plugin.json');
  const v = existsSync(f) ? JSON.parse(doc(f)).version : '(không có plugin.json)';
  if (v !== KIT_SO) throw new Error(`kit ở ${goc} là ${v}, không phải ${KIT_SO}`);
}
export function kiemKitTag(ten, text) {
  const tags = [...text.matchAll(/^\s*KIT_TAG:\s*(\S+)/gm)].map((m) => m[1]);
  if (/v2\.35\.0/.test(text)) throw new Error(`${ten}: còn v2.35.0`);
  if (tags.length !== 1 || tags[0] !== TAG) throw new Error(`${ten}: KIT_TAG là [${tags.join(', ')}], cần đúng một dòng ${TAG}`);
}
const BO_DEM_SO = /acceptance-gate-kit\/[a-z-]+\/\d+\.\d+\.\d+/;
export function quetBoDem(ten, text) {
  const dong = text.split('\n').find((l) => !/^\s*(#|\/\/)/.test(l) && BO_DEM_SO.test(l));
  if (dong) throw new Error(`${ten}: lệnh trỏ bộ đệm có số — ${dong.trim()}`);
}
const TEP_KIT_CHEP = ['scripts/pre-merge-check.sh', 'scripts/recheck-evidence.cjs', 'scripts/product-map.mjs', 'scripts/lo-trinh.mjs', 'lib/evidence-core.cjs', 'lib/gap-probe.cjs', 'lib/workspace-record.cjs'];

describe('AC-1 bản kit của CI và của bài đo', () => {
  test('kit dùng để đo là 2.36.0', () => {
    kiemBanKit(KIT);
    const gia = tamDir('kit-gia');
    try {
      mkdirSync(path.join(gia, '.claude-plugin'));
      writeFileSync(path.join(gia, '.claude-plugin/plugin.json'), '{"name":"acceptance-gate","version":"2.35.0"}\n');
      assert.throws(() => kiemBanKit(gia), (e) => e.message.includes('2.35.0') && e.message.includes(gia));
    } finally { rmSync(gia, { recursive: true, force: true }); }
  });

  test('CI lấy kit thẻ v2.36.0', () => {
    const wf = path.join(ROOT, '.github/workflows');
    const tepCo = readdirSync(wf).filter((f) => /\.ya?ml$/.test(f)).filter((f) => doc(path.join(wf, f)).includes('KIT_TAG'));
    assert.ok(tepCo.length >= 1, 'không workflow nào khai KIT_TAG');
    for (const f of readdirSync(wf).filter((x) => /\.ya?ml$/.test(x))) {
      const t = doc(path.join(wf, f));
      assert.ok(!/v2\.35\.0/.test(t), `${f}: còn v2.35.0`);
      if (tepCo.includes(f)) kiemKitTag(f, t);
    }
    assert.throws(() => kiemKitTag('gia.yml', '    env:\n      KIT_TAG: v2.35.0\n'), /v2\.35\.0/);
  });

  test('lưới trước-gộp sạch với cấu hình mới', () => {
    const boHoSo = (dir) => { rmSync(path.join(dir, '_acceptance', SLUG), { recursive: true, force: true }); return 'thu: bo ho so cua vong'; };
    voiWorktree(boHoSo, (dir) => {
      const r = preMerge(dir, '--no-t1-escape');
      const dongCuoi = r.out.trim().split('\n').at(-1);
      assert.equal(dongCuoi, 'pre-merge-check: clean', r.out);
      assert.ok(!/^VIOLATION/m.test(r.out), r.out);
    });
    voiWorktree((dir) => {
      boHoSo(dir);
      const f = path.join(dir, '_acceptance/config.yaml');
      writeFileSync(f, doc(f).replace(/^gap_probe:.*$/m, 'gap_probe: requird'));
      return 'thu: khoa gap_probe sai';
    }, (dir) => {
      const r = preMerge(dir, '--no-t1-escape');
      assert.match(r.out, /^VIOLATION \[config\]: gap_probe: "requird"/m, r.out);
    });
  });
});

describe('AC-2 không chép kit, không bộ đệm có số', () => {
  test('không lệnh trỏ bộ đệm có số, không tệp kit chép vào kho', () => {
    const tep = [path.join(ROOT, '_acceptance/config.yaml')];
    for (const d of ['.github/workflows', 'packages/ui-lint']) {
      for (const f of readdirSync(path.join(ROOT, d))) {
        if (/\.(ya?ml|mjs)$/.test(f)) tep.push(path.join(ROOT, d, f));
      }
    }
    for (const f of tep) quetBoDem(path.relative(ROOT, f), doc(f));
    for (const f of TEP_KIT_CHEP) assert.ok(!existsSync(path.join(ROOT, f)), `kho có tệp kit chép: ${f}`);
    const cay = '    x: "node /Users/x/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.35.0/scripts/x.mjs"';
    assert.throws(() => quetBoDem('gia.yaml', cay), (e) => e.message.includes('2.35.0/scripts/x.mjs'));
  });
});

// ---- tệp sinh ----
function khoGop(coDriver) {
  const tam = tamDir('tep-sinh');
  const g = (...a) => gitIn(tam, ...a);
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'thu@example.invalid');
  g('config', 'user.name', 'Thu');
  if (coDriver) g('config', 'merge.tep-sinh.driver', 'true');
  writeFileSync(path.join(tam, '.gitattributes'), doc(path.join(ROOT, '.gitattributes')));
  writeFileSync(path.join(tam, 'PRODUCT-MAP.md'), 'dòng 1\nhồ sơ: gốc\ndòng 3\n');
  g('add', '.'); g('commit', '-q', '-m', 'goc');
  g('checkout', '-q', '-b', 'viec');
  writeFileSync(path.join(tam, 'PRODUCT-MAP.md'), 'dòng 1\nhồ sơ: nhánh việc\ndòng 3\n');
  g('commit', '-q', '-am', 'viec');
  g('checkout', '-q', 'main');
  writeFileSync(path.join(tam, 'PRODUCT-MAP.md'), 'dòng 1\nhồ sơ: nhánh chính\ndòng 3\n');
  g('commit', '-q', '-am', 'chinh');
  g('checkout', '-q', 'viec');
  const r = spawnSync('git', ['merge', '-q', '--no-edit', 'main'], { cwd: tam, encoding: 'utf8' });
  const xungDot = g('diff', '--name-only', '--diff-filter=U').trim().split('\n').filter(Boolean);
  rmSync(tam, { recursive: true, force: true });
  return { ma: r.status, xungDot };
}

describe('AC-3 gộp không dừng ở tệp sinh', () => {
  test('gộp không dừng ở tệp sinh khi có driver', () => {
    const attr = doc(path.join(ROOT, '.gitattributes')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    assert.deepEqual(attr.filter((l) => /merge=tep-sinh/.test(l)).sort(), ['LO-TRINH.html merge=tep-sinh', 'PRODUCT-MAP.md merge=tep-sinh']);
    const co = khoGop(true);
    assert.equal(co.ma, 0, `có driver mà gộp dừng: ${co.xungDot.join(', ')}`);
    assert.deepEqual(co.xungDot, []);
    const khong = khoGop(false);
    assert.notEqual(khong.ma, 0, 'không driver mà gộp không dừng — phép thử không phân biệt được');
    assert.deepEqual(khong.xungDot, ['PRODUCT-MAP.md']);
  });
});

describe('AC-4 npm install bật driver', () => {
  const chayPrepare = (lenh) => {
    const tam = tamDir('prepare');
    try {
      gitIn(tam, 'init', '-q');
      execFileSync('sh', ['-c', lenh], { cwd: tam });
      const get = (k) => spawnSync('git', ['config', '--get', k], { cwd: tam, encoding: 'utf8' }).stdout.trim();
      return { driver: get('merge.tep-sinh.driver'), hooks: get('core.hooksPath') };
    } finally { rmSync(tam, { recursive: true, force: true }); }
  };
  test('npm install bật driver tep-sinh', () => {
    const prepare = JSON.parse(doc(path.join(ROOT, 'package.json'))).scripts.prepare;
    assert.deepEqual(chayPrepare(prepare), { driver: 'true', hooks: '.githooks' });
    assert.deepEqual(chayPrepare('git config core.hooksPath .githooks || true'), { driver: '', hooks: '.githooks' });
  });
});

describe('AC-5 phản biện bắt buộc', () => {
  test('gap-probe bắt buộc chặn hồ sơ thiếu phản biện', () => {
    assert.match(doc(path.join(ROOT, '_acceptance/config.yaml')), /^gap_probe: required\s*(#.*)?$/m);
    const status = /^status:\s*(\S+)/m.exec(doc(path.join(ROOT, '_acceptance', SLUG, 'contract.md')))?.[1];
    assert.ok(['implemented', 'verified', 'machine-cleared', 'signed-off'].includes(status), `hợp đồng ở ${status} — luật phản biện chỉ xét hồ sơ đã làm xong`);
    const DONG = `VIOLATION [${SLUG}]: chưa qua phản biện context sạch`;
    voiWorktree((dir) => { rmSync(path.join(dir, '_acceptance', SLUG, 'gap-probe.md')); return 'thu: bo phan bien'; }, (dir) => {
      const r = preMerge(dir);
      assert.ok(r.out.includes(DONG), r.out);
    });
    voiWorktree(null, (dir) => {
      const r = preMerge(dir);
      assert.ok(!r.out.includes('chưa qua phản biện context sạch'), r.out);
    });
  });
});

describe('AC-6 chặn việc ngoài lộ trình', () => {
  test('chặn lộ trình gọi tên hồ sơ mới ngoài lộ trình', () => {
    assert.match(doc(path.join(ROOT, '_acceptance/config.yaml')), /^lo_trinh:\n(?: {2}.*\n)*? {2}chan: true\s*(#.*)?$/m);
    const chan = (dir) => chay('node', [path.join(KIT, 'lib/chan-lo-trinh.cjs'), '--root', dir, '--base', BASE], dir);
    voiWorktree((dir) => {
      for (const [ten, them] of [['thu-ngoai-lo-trinh', ''], ['thu-trong-lo-trinh', 'lo_trinh_ma: 9\n']]) {
        mkdirSync(path.join(dir, '_acceptance', ten));
        writeFileSync(path.join(dir, '_acceptance', ten, 'opportunity.md'), `---\nslug: ${ten}\n${them}---\n\n# Ô thử\n`);
      }
      return 'thu: hai ho so moi';
    }, (dir) => {
      const r = chan(dir);
      assert.equal(r.ma, 1, r.out);
      const vp = r.out.split('\n').filter((l) => l.startsWith('VIOLATION'));
      assert.deepEqual(vp, ['VIOLATION [thu-ngoai-lo-trinh]: hồ sơ mới không thuộc hàng lộ trình nào (lo_trinh.chan)']);
    });
    voiWorktree(null, (dir) => {
      const r = chan(dir);
      assert.equal(r.ma, 0, r.out);
      assert.ok(!/VIOLATION/.test(r.out), r.out);
    });
  });
});

describe('AC-7 máy tự định tuyến mục ngoài hợp đồng', () => {
  const dinhTuyen = (root, slug) => chay('node', [path.join(KIT, 'scripts/dinh-tuyen-may.cjs'), '--check', '--root', root, '--slug', slug], root);
  const TAT = 'dinh-tuyen-may: tắt (feature_loop.ngoai_n_tu_dinh_tuyen vắng hoặc false)';

  test('định tuyến máy đọc khoá bật', () => {
    assert.match(doc(path.join(ROOT, '_acceptance/config.yaml')), /^feature_loop:\n(?:(?: {2}.*|\s*)\n)*? {2}ngoai_n_tu_dinh_tuyen: true\s*(#.*)?$/m);
    const bat = dinhTuyen(ROOT, 'doi-ten-api-tieng-anh');
    assert.equal(bat.ma, 0, bat.out);
    assert.ok(!bat.out.split('\n').some((l) => l.startsWith('dinh-tuyen-may: tắt')), bat.out);
    voiWorktree((dir) => {
      const f = path.join(dir, '_acceptance/config.yaml');
      writeFileSync(f, doc(f).replace(/ngoai_n_tu_dinh_tuyen: true/, 'ngoai_n_tu_dinh_tuyen: false'));
    }, (dir) => {
      const tat = dinhTuyen(dir, 'doi-ten-api-tieng-anh');
      assert.equal(tat.ma, 0, tat.out);
      assert.ok(tat.out.split('\n').includes(TAT), tat.out);
    });
  });

  test('định tuyến máy không chạm hồ sơ T3', () => {
    const t3 = doc(path.join(ROOT, '_acceptance/config.yaml')).match(/^ {2}t3_paths:\n((?: {4}- .*\n)+)/m)?.[1] ?? '';
    for (const p of ['_acceptance/config.yaml', '.gitattributes']) assert.ok(t3.includes(`"${p}"`), `t3_paths thiếu ${p}`);
    // Cùng một hồ sơ đã chấm PASS (doi-ten-api-tieng-anh), đưa về «verified» để qua các vế trước vế hạng;
    // chỉ khác nhau ở risk_tier.
    const hang = (tier) => voiWorktree((dir) => {
      const f = path.join(dir, '_acceptance/doi-ten-api-tieng-anh/contract.md');
      writeFileSync(f, doc(f).replace(/^status: .*$/m, 'status: verified').replace(/^risk_tier: .*$/m, `risk_tier: ${tier}`));
    }, (dir) => dinhTuyen(dir, 'doi-ten-api-tieng-anh'));
    const r3 = hang('T3');
    assert.equal(r3.ma, 0, r3.out);
    assert.ok(r3.out.split('\n').includes('không định tuyến: hạng T3 (chỉ T2)'), r3.out);
    const r2 = hang('T2');
    assert.ok(!r2.out.includes('hạng T2') && !r2.out.includes('dinh-tuyen-may: tắt'), r2.out);
  });
});

describe('AC-8 lộ trình có hàng của vòng', () => {
  test('lộ trình có hàng của vòng', () => {
    const lt = JSON.parse(doc(path.join(ROOT, 'docs/plan/lo-trinh.json')));
    assert.equal(lt.hang.filter((h) => h.slug === SLUG).length, 1, `lộ trình cần đúng một hàng mang slug ${SLUG}`);
  });
});
