// Máy chủ thử của bài thử Zalo: trang mẫu có thẻ Open Graph, ảnh xem trước, trang chia sẻ, trang kéo ảnh, nhật ký.
// Mã thử — không thành mã sản phẩm (luật đợt 5). Không phụ thuộc gói ngoài.
import { createHash, randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import http from 'node:http';
import { anhXemTruoc } from './anh.mjs';
import { chonCachChiaSe, demTheoMa, phanLop } from './dem.mjs';

const MA_HOP_LE = /^[A-Za-z0-9_-]{1,32}$/;
const TRAN_THAN = 16 * 1024;
// Khoá nhận từ trang khi người thử bấm hay trang tự báo; khoá khác bị bỏ.
const KHOA_NHAN = ['ma', 'phien', 'cau', 'tra_loi', 'cach', 'ket_cuc', 'loi', 'co_tep', 'kieu', 'co', 'kieu_du_lieu',
  'nguon_uri', 'man'];

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

function goc(req) {
  const proto = String(req.headers['x-forwarded-proto'] ?? 'http').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost').split(',')[0].trim();
  return `${proto}://${host}`;
}

const thoat = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Nội dung mẫu: nhãn «Mẫu», không tên, số hay giá thật (AGENTS.md: dữ liệu cá nhân thật không vào kho).
const MAU = {
  tieuDe: 'Mẫu · Căn [Mã căn] — Toà [Tên toà]',
  moTa: 'Mẫu · 2 phòng ngủ · 70 m² · 3,2 tỷ (đã gồm phí chuyển nhượng) · [Tên sàn]',
};

const KHUNG = (tieuDe, dau, than) => `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${thoat(tieuDe)}</title>${dau}
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:16px;max-width:640px;color:#1a1a1a;background:#fafafa}
h1{font-size:20px}button{font:inherit;padding:10px 14px;margin:4px 4px 4px 0;border-radius:8px;border:1px solid #888;background:#fff}
.nhan{display:inline-block;font-size:12px;padding:2px 8px;border-radius:99px;background:#ffe9a8}
#o{border:2px dashed #888;border-radius:12px;padding:32px;text-align:center;min-height:120px}
#o img{max-width:100%;max-height:240px}.ghi{font-size:14px;color:#444;white-space:pre-wrap}</style></head>
<body><span class="nhan">Mẫu · bài thử</span>${than}</body></html>`;

const GUI = `function gui(du){var t=JSON.stringify(du);if(navigator.sendBeacon){navigator.sendBeacon('/ghi',new Blob([t],{type:'text/plain'}))}else{fetch('/ghi',{method:'POST',body:t,keepalive:true})}}`;

function trangCan(ma, o) {
  const url = `${o}/s/${ma}`;
  const anh = `${o}/og/${ma}.png`;
  const dau = [
    `<meta name="description" content="${thoat(MAU.moTa)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${thoat(MAU.tieuDe)}">`,
    `<meta property="og:description" content="${thoat(MAU.moTa)}">`,
    `<meta property="og:url" content="${thoat(url)}">`,
    `<meta property="og:image" content="${thoat(anh)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n');
  const cau = [
    ['xem-truoc', 'Ở Zalo, tin chứa link này có hiện ảnh xem trước không?', ['co-anh', 'chi-chu', 'khong']],
    ['tieu-de', 'Có hiện tiêu đề «Mẫu · Căn…» không?', ['co', 'khong']],
  ];
  const nut = cau.map(([k, hoi, ds]) => `<p>${thoat(hoi)}<br>${ds
    .map((d) => `<button data-cau="${k}" data-tl="${d}">${({ 'co-anh': 'Có ảnh', 'chi-chu': 'Chỉ có chữ', khong: 'Không', co: 'Có' })[d]}</button>`)
    .join('')}</p>`).join('');
  const than = `<h1>${thoat(MAU.tieuDe)}</h1><p>${thoat(MAU.moTa)}</p><p>Mã link: <b>${thoat(ma)}</b></p>
<p class="ghi" id="trang-thai">Đang ghi lượt mở…</p>${nut}<p class="ghi" id="da-tra-loi"></p>
<script>${GUI}
var ma=${JSON.stringify(ma)};var p=Math.random().toString(36).slice(2)+Date.now().toString(36);
var t=JSON.stringify({ma:ma,phien:p});
if(navigator.sendBeacon){navigator.sendBeacon('/mo',new Blob([t],{type:'text/plain'}))}else{fetch('/mo',{method:'POST',body:t,keepalive:true})}
document.getElementById('trang-thai').textContent='Đã ghi lượt mở của mã '+ma+'.';
document.querySelectorAll('button[data-cau]').forEach(function(b){b.onclick=function(){gui({ma:ma,phien:p,cau:b.dataset.cau,tra_loi:b.dataset.tl,man:'s'});document.getElementById('da-tra-loi').textContent='Đã ghi: '+b.textContent}});
</script>`;
  return KHUNG(MAU.tieuDe, dau, than);
}

function trangChiaSe() {
  const than = `<h1>Thử chia sẻ ảnh + tin</h1>
<p>Bấm một nút, chọn Zalo trong bảng chia sẻ, gửi cho chính mình («Cloud của tôi»).</p>
<p class="ghi" id="cach">Đang kiểm cách chia sẻ…</p>
<button id="anh-tin">Gửi ảnh + tin</button><button id="chi-anh">Gửi chỉ ảnh</button><button id="link-tin">Gửi link + tin</button>
<p class="ghi" id="ket"></p>
<p>Sau khi gửi, ở Zalo:<br>
<button data-cau="zalo-trong-bang" data-tl="co">Zalo có trong bảng</button><button data-cau="zalo-trong-bang" data-tl="khong">Không thấy Zalo</button><br>
<button data-cau="zalo-nhan-anh" data-tl="co">Zalo nhận ảnh</button><button data-cau="zalo-nhan-anh" data-tl="khong">Không nhận ảnh</button><br>
<button data-cau="zalo-nhan-tin" data-tl="co">Zalo nhận tin</button><button data-cau="zalo-nhan-tin" data-tl="khong">Không nhận tin</button></p>
<p class="ghi" id="da-tra-loi"></p>
<script>${GUI}
var chonCachChiaSe=${chonCachChiaSe.toString()};
var TIN='Mẫu · Căn [Mã căn] — 2 phòng ngủ, 70 m², 3,2 tỷ. Xem: '+location.origin+'/s/CS';
var tep=null;
fetch('/og/CS.png').then(function(r){return r.blob()}).then(function(b){tep=new File([b],'mau-can.png',{type:'image/png'});
document.getElementById('cach').textContent='Trình duyệt này: '+({tep:'chia sẻ được ảnh + tin',link:'chỉ chia sẻ được link + tin','khong-ho-tro':'không có bảng chia sẻ từ web'})[chonCachChiaSe(navigator,tep)];});
function thu(kieu){var cach=chonCachChiaSe(navigator,tep);var du;
if(cach==='khong-ho-tro'){document.getElementById('ket').textContent='Trình duyệt này không mở được bảng chia sẻ từ web.';gui({cach:cach,ket_cuc:'khong-ho-tro',man:kieu});return}
if(kieu==='link-tin'||cach==='link'){du={title:'Mẫu · Căn [Mã căn]',text:TIN,url:location.origin+'/s/CS'};cach='link'}
else if(kieu==='chi-anh'){du={files:[tep]}}else{du={files:[tep],text:TIN}}
navigator.share(du).then(function(){document.getElementById('ket').textContent='Bảng chia sẻ đã mở và trả «đã gửi».';gui({cach:cach,ket_cuc:'da-gui',man:kieu})},
function(e){var huy=e&&e.name==='AbortError';document.getElementById('ket').textContent=huy?'Người huỷ.':'Lỗi: '+(e&&e.name);gui({cach:cach,ket_cuc:huy?'huy':'loi',loi:e&&e.name,man:kieu})})}
['anh-tin','chi-anh','link-tin'].forEach(function(k){document.getElementById(k).onclick=function(){thu(k)}});
document.querySelectorAll('button[data-cau]').forEach(function(b){b.onclick=function(){gui({cau:b.dataset.cau,tra_loi:b.dataset.tl,man:'chia-se'});document.getElementById('da-tra-loi').textContent='Đã ghi: '+b.textContent}});
</script>`;
  return KHUNG('Mẫu · thử chia sẻ', '', than);
}

function trangKeoAnh() {
  const than = `<h1>Thử kéo ảnh từ Zalo máy tính</h1>
<p>Kéo một ảnh từ Zalo máy tính vào ô dưới, hoặc chép ảnh trong Zalo rồi dán (Ctrl/Cmd+V) ở trang này.</p>
<div id="o">Thả ảnh vào đây</div><p class="ghi" id="ket"></p>
<script>${GUI}
var o=document.getElementById('o');
function nhan(dt,cach){var kieu=dt?Array.from(dt.types||[]):[];var tep=dt?Array.from(dt.files||[]).filter(function(f){return /^image\\//.test(f.type)}):[];
var uri='';try{uri=dt.getData('text/uri-list')||''}catch(e){}var nguon='';try{nguon=uri?new URL(uri.split('\\n')[0]).host:''}catch(e){}
if(tep.length){var f=tep[0];o.innerHTML='';var i=document.createElement('img');i.src=URL.createObjectURL(f);o.appendChild(i);
document.getElementById('ket').textContent='Đã nhận '+f.type+' · '+f.size+' byte · kiểu kéo: '+kieu.join(', ');
gui({cach:cach,co_tep:true,kieu:f.type,co:f.size,kieu_du_lieu:kieu,nguon_uri:nguon,man:'keo-anh'})}
else{document.getElementById('ket').textContent='không có tệp ảnh · kiểu nhận được: '+(kieu.join(', ')||'(trống)');
gui({cach:cach,co_tep:false,kieu_du_lieu:kieu,nguon_uri:nguon,man:'keo-anh'})}}
o.addEventListener('dragover',function(e){e.preventDefault()});
o.addEventListener('drop',function(e){e.preventDefault();nhan(e.dataTransfer,'keo')});
document.addEventListener('paste',function(e){nhan(e.clipboardData,'dan')});
</script>`;
  return KHUNG('Mẫu · thử kéo ảnh', '', than);
}

const boKhoa = (d, k) => {
  const c = { ...d };
  delete c[k];
  return c;
};

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
        ok({});
      }
    });
  });
}

function locKhoa(du) {
  const ra = {};
  for (const k of KHOA_NHAN) {
    if (du[k] === undefined) continue;
    const v = du[k];
    ra[k] = Array.isArray(v) ? v.slice(0, 20).map((x) => String(x).slice(0, 80)) : typeof v === 'string' ? v.slice(0, 200) : v;
  }
  return ra;
}

/** Máy chủ thử. `nhatKy` từ taoNhatKy; `muoi` băm IP — IP thô không bao giờ ghi. */
export function taoMayChu({ nhatKy, muoi = randomBytes(8).toString('hex') } = {}) {
  const bamIp = (req) => {
    const ip = String(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '')
      .split(',')[0]
      .trim();
    return createHash('sha256').update(`${muoi}|${ip}`).digest('hex').slice(0, 12);
  };
  const ghiLuot = (req, loai, them = {}) => {
    const ua = String(req.headers['user-agent'] ?? '');
    const { lop, ly_do } = phanLop(ua, req.headers);
    nhatKy.ghi({ luc: new Date().toISOString(), loai, ua, lop, ly_do, ip_bam: bamIp(req), ...them });
  };
  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://x');
    const p = url.pathname;
    const html = (s) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(s);
    };
    let m;
    if (req.method === 'GET' && (m = p.match(/^\/s\/([^/]+)$/)) && MA_HOP_LE.test(m[1])) {
      ghiLuot(req, 'tai-trang', { ma: m[1], prefetch: req.headers['sec-purpose'] ?? req.headers.purpose ?? null });
      return html(trangCan(m[1], goc(req)));
    }
    if (req.method === 'GET' && (m = p.match(/^\/og\/([^/]+)\.png$/)) && MA_HOP_LE.test(m[1])) {
      ghiLuot(req, 'tai-anh', { ma: m[1] });
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'public, max-age=300' });
      return res.end(anhXemTruoc(m[1]));
    }
    if (req.method === 'POST' && p === '/mo') {
      const du = await docThan(req);
      if (typeof du.ma !== 'string' || !MA_HOP_LE.test(du.ma)) {
        res.writeHead(400);
        return res.end();
      }
      ghiLuot(req, 'mo', { ma: du.ma, phien: String(du.phien ?? '').slice(0, 64) });
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'POST' && p === '/ghi') {
      const du = locKhoa(await docThan(req));
      const loai = du.cau ? 'quan-sat' : du.man === 'keo-anh' ? 'nhan-anh' : du.ket_cuc ? 'chia-se' : 'khac';
      ghiLuot(req, loai, du);
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'GET' && p === '/chia-se') return html(trangChiaSe());
    if (req.method === 'GET' && p === '/keo-anh') return html(trangKeoAnh());
    if (req.method === 'GET' && p === '/dem') {
      const ra = { dem: demTheoMa(nhatKy.dong) };
      if (url.searchParams.get('nhat-ky') === '1') ra.su_kien = nhatKy.dong.map((d) => boKhoa(d, 'ip_bam'));
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      return res.end(JSON.stringify(ra, null, 2));
    }
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('không có');
  });
}
