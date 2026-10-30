// Máy chủ thử của bộ đồng bộ tự làm mỏng: kéo theo luật theo dòng, đẩy theo hàng đợi có khoá chống trùng, trang /thu.
// Mã thử — không thành mã sản phẩm (luật đợt 5). Nối bằng DATABASE_URL nhưng mọi truy vấn chạy sau
// `set local role quy_hang_app` (vai không vượt luật theo dòng), nên cách ly đến từ cơ sở dữ liệu.
import { createHash, randomBytes } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { CAN, NGUOI } from './du-lieu-mau.mjs';

const DAY = path.dirname(fileURLToPath(import.meta.url));
const TRAN_THAN = 64 * 1024;

export function taoNhatKy(tep) {
  const dong = [];
  return {
    dong,
    ghi(d) {
      dong.push(d);
      if (tep) appendFileSync(tep, `${JSON.stringify(d)}\n`);
    },
  };
}

/** Áp bảng mẫu và dữ liệu mẫu (vai chủ). Áp lại được. */
export async function apDuLieuMau(url) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query(readFileSync(path.join(DAY, 'schema.sql'), 'utf8'));
    for (const can of CAN) {
      await c.query(
        'insert into thu_dong_bo.listings (id, company_id, unit_code, price, owner_agent) values ($1,$2,$3,$4,$5)',
        [can.id, can.san, can.ma, can.gia, can.dau_chu],
      );
      await c.query(
        'insert into thu_dong_bo.owner_contacts (listing_id, company_id, owner_agent, phone) values ($1,$2,$3,$4)',
        [can.id, can.san, can.dau_chu, can.so_chu],
      );
      await c.query('insert into thu_dong_bo.changes (company_id, listing_id, price, by_user) values ($1,$2,$3,$4)', [
        can.san,
        can.id,
        can.gia,
        'mau',
      ]);
    }
  } finally {
    await c.end();
  }
}

/** Chạy `fn` trong một giao dịch với vai của API và phiên của người (nguoiId null = phiên không đặt sàn). */
export async function trongPhien(pool, nguoiId, fn) {
  const c = await pool.connect();
  try {
    await c.query('begin');
    await c.query('set local role quy_hang_app');
    const n = NGUOI[nguoiId];
    if (n) {
      await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', $2, true), set_config('app.role', $3, true)", [
        n.san,
        nguoiId,
        n.vai,
      ]);
    }
    const kq = await fn(c);
    await c.query('commit');
    return kq;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** Kéo về: không có điều kiện lọc theo sàn ở đây — luật theo dòng làm việc đó. */
export async function keo(c, sau) {
  const vai = (await c.query('select current_user as u, (select rolbypassrls from pg_roles where rolname = current_user) as b')).rows[0];
  const listings = (await c.query('select id, company_id, unit_code, price, owner_agent, label from thu_dong_bo.listings order by id')).rows;
  const changes = (
    await c.query('select seq, company_id, listing_id, price, client_id, client_seq from thu_dong_bo.changes where seq > $1 order by seq', [sau])
  ).rows;
  const contacts = (await c.query('select listing_id, company_id, phone from thu_dong_bo.owner_contacts order by listing_id')).rows;
  return {
    current_user: vai.u,
    rolbypassrls: vai.b,
    listings: listings.map((l) => ({ ...l, price: Number(l.price) })),
    changes: changes.map((x) => ({ ...x, seq: Number(x.seq), price: Number(x.price) })),
    contacts,
    seq_moi: changes.length ? Number(changes.at(-1).seq) : Number(sau),
  };
}

/**
 * Áp một lô theo client_seq; `cat` giả lập lô bị cắt giữa chừng (chỉ xử lý n thao tác đầu).
 * Một thao tác lỗi thì dừng cả phần sau của lô: phần sau còn trong hàng đợi của máy và lên lại đúng thứ tự.
 * Mọi kết cục mang tao_luc để luật kết luận đếm được cả thao tác không áp.
 */
export async function apLo(c, nguoiId, clientId, ops, cat = Infinity) {
  const lo = [...ops].sort((a, b) => a.client_seq - b.client_seq).slice(0, cat);
  const ketQua = [];
  for (const op of lo) {
    const goc = { op_id: op.op_id, client_seq: op.client_seq, tao_luc: op.tao_luc ?? null };
    await c.query('savepoint op');
    try {
      const cu = await c.query('select seq from thu_dong_bo.applied_ops where op_id = $1', [op.op_id]);
      if (cu.rowCount) {
        ketQua.push({ ...goc, trang_thai: 'da-ap-truoc', seq: Number(cu.rows[0].seq) });
        await c.query('release savepoint op');
        continue;
      }
      const sua = await c.query('update thu_dong_bo.listings set price = $2 where id = $1 returning company_id', [op.listing_id, op.price]);
      if (sua.rowCount === 0) {
        ketQua.push({ ...goc, trang_thai: 'bi-tu-choi', ly_do: 'căn không thuộc sàn của phiên' });
        await c.query('rollback to savepoint op');
        continue;
      }
      const seq = Number(
        (
          await c.query(
            `insert into thu_dong_bo.changes (company_id, listing_id, price, by_user, client_id, client_seq, op_id)
             values (app.current_company_id(), $1, $2, $3, $4, $5, $6) returning seq`,
            [op.listing_id, op.price, nguoiId, clientId, op.client_seq, op.op_id],
          )
        ).rows[0].seq,
      );
      await c.query('insert into thu_dong_bo.applied_ops (op_id, company_id, seq) values ($1, app.current_company_id(), $2)', [op.op_id, seq]);
      await c.query('release savepoint op');
      ketQua.push({ ...goc, trang_thai: 'da-ap', seq });
    } catch (e) {
      await c.query('rollback to savepoint op');
      ketQua.push({ ...goc, trang_thai: 'loi', ly_do: e.message });
      break;
    }
  }
  return ketQua;
}

function docThan(req) {
  return new Promise((ok) => {
    let n = 0;
    const phan = [];
    req.on('data', (c) => {
      n += c.length;
      if (n <= TRAN_THAN) phan.push(c);
    });
    req.on('end', () => {
      try {
        ok(JSON.parse(Buffer.concat(phan).toString('utf8') || '{}'));
      } catch {
        ok(null);
      }
    });
  });
}

const boKhoa = (d, k) => {
  const c = { ...d };
  delete c[k];
  return c;
};

/** Máy chủ thử. `nhatKy` từ taoNhatKy; IP chỉ ghi dạng băm có muối của lượt chạy. */
export function taoMayChu({ pool, nhatKy, muoi = randomBytes(8).toString('hex') }) {
  const bamIp = (req) => {
    const ip = String(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '')
      .split(',')[0]
      .trim();
    return createHash('sha256').update(`${muoi}|${ip}`).digest('hex').slice(0, 12);
  };
  const ghi = (req, loai, them) =>
    nhatKy.ghi({ luc: new Date().toISOString(), loai, ua: String(req.headers['user-agent'] ?? ''), ip_bam: bamIp(req), ...them });
  const json = (res, ma, du) => {
    res.writeHead(ma, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(du));
  };

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://x');
    const p = url.pathname;
    try {
      if (req.method === 'GET' && p === '/keo') {
        const nguoi = url.searchParams.get('nguoi');
        const sau = Number(url.searchParams.get('sau') ?? 0) || 0;
        const kq = await trongPhien(pool, NGUOI[nguoi] ? nguoi : null, (c) => keo(c, sau));
        ghi(req, 'keo', {
          nguoi,
          so_dong: kq.listings.length,
          cong_ty_nhan: [...new Set([...kq.listings, ...kq.changes, ...kq.contacts].map((x) => x.company_id))],
          so_chu_nhan: kq.contacts.map((x) => x.phone),
          current_user: kq.current_user,
        });
        return json(res, 200, kq);
      }
      if (req.method === 'POST' && p === '/day') {
        const du = await docThan(req);
        if (!du || !NGUOI[du.nguoi] || !Array.isArray(du.ops)) return json(res, 400, { loi: 'lô không hợp lệ' });
        const cat = Number(url.searchParams.get('cat')) || Infinity;
        const ketQua = await trongPhien(pool, du.nguoi, (c) => apLo(c, du.nguoi, String(du.client_id ?? ''), du.ops, cat));
        ghi(req, 'day', { nguoi: du.nguoi, client_id: String(du.client_id ?? '').slice(0, 64), ket_qua: ketQua });
        return json(res, 200, { ket_qua: ketQua });
      }
      if (req.method === 'POST' && p === '/ghi') {
        const du = (await docThan(req)) ?? {};
        const giu = {};
        for (const k of ['nguoi', 'client_id', 'trang_thai', 'luc_may', 'so_cho', 'ghi_chu']) {
          if (typeof du[k] === 'string' || typeof du[k] === 'number') giu[k] = typeof du[k] === 'string' ? du[k].slice(0, 120) : du[k];
        }
        ghi(req, du.loai === 'mang' ? 'mang' : 'trang', giu);
        res.writeHead(204);
        return res.end();
      }
      if (req.method === 'GET' && p === '/thu') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(readFileSync(path.join(DAY, 'trang-thu.html')));
      }
      if (req.method === 'GET' && p === '/hang-doi.mjs') {
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
        return res.end(readFileSync(path.join(DAY, 'hang-doi.mjs')));
      }
      if (req.method === 'GET' && p === '/dem') {
        const ra = { so_su_kien: nhatKy.dong.length };
        if (url.searchParams.get('nhat-ky') === '1') ra.su_kien = nhatKy.dong.map((d) => boKhoa(d, 'ip_bam'));
        return json(res, 200, ra);
      }
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('không có');
    } catch (e) {
      json(res, 500, { loi: e.message });
    }
  });
}
