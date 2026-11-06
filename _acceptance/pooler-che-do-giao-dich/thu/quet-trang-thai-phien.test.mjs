// pooler-che-do-giao-dich AC-5 (E5): pooler chế độ giao dịch không giữ trạng thái PHIÊN — câu kế của cùng một kết nối khách
// có thể chạy trên kết nối máy chủ khác, và kết nối máy chủ đã đặt trạng thái về tay khách khác. Bài quét: mã chạy của máy
// chủ web không đặt trạng thái phiên, và mọi câu nhắc bảng danh tính ghi rõ lược đồ `identity.`.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const GOC_QUET = ["apps/web/src", "packages/api/src"];

/** Chín bảng của lược đồ identity, rút từ migration — không chép tay. */
export function bangDanhTinh() {
  const dir = join(ROOT, "packages/db/migrations");
  const ten = new Set();
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql"))) {
    for (const m of readFileSync(join(dir, f), "utf8").matchAll(/create table (?:if not exists )?identity\.("?)([a-z_]+)\1/gi)) {
      ten.add(m[2].toLowerCase());
    }
  }
  return [...ten].sort();
}

const BANG = bangDanhTinh();
// Đầu câu SQL: sau dấu nháy, backtick, chấm phẩy hay mở ngoặc (kể cả xuống dòng trong chuỗi nhiều dòng).
const DAU = String.raw`(?:["'\x60;(]\s*)`;

/** Ma trận viết trước: chín mẫu. Mỗi mẫu một tên và một biểu thức. */
export const MAU = [
  ["SET mức phiên", new RegExp(`${DAU}set\\s+(?!local\\b)(?:session\\s+authorization\\b|role\\b|[a-z_][a-z0-9_.]*\\s*(?:=|to\\b))`, "i")],
  ["set_config(…, false)", /set_config\s*\([^)]*,\s*false\s*\)/i],
  ["LISTEN/UNLISTEN", new RegExp(`${DAU}(?:un)?listen\\s+[a-z_"*]`, "i")],
  ["khoá tư vấn mức phiên", /pg_(?:try_)?advisory_lock(?:_shared)?\s*\(/i],
  ["PREPARE", new RegExp(`${DAU}prepare\\s+[a-z_"]`, "i")],
  ["bảng tạm", /create\s+temp(?:orary)?\s+table/i],
  ["câu lệnh có tên", /\.query\s*\(\s*\{[^}]*\bname\s*:/],
  ["tham số khởi động", /new\s+(?:pg\.)?(?:Pool|Client)\s*\(\s*\{[^}]*\boptions\s*:/],
  ["bảng danh tính thiếu identity.", new RegExp(`\\b(?:from|join|into|update)\\s+("?)(?:${BANG.join("|")})\\1(?![\\w./-])`, "i")],
];

/** Bỏ chú thích khối và chú thích dòng (giữ `://` của địa chỉ). */
export function boChuThich(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\w])\/\/.*$/gm, "$1");
}

/** Vi phạm của một tệp: [{ tep, mau, doan }]. */
export function viPham(tep, src) {
  const sach = boChuThich(src);
  const ra = [];
  for (const [ten, re] of MAU) {
    const m = sach.match(re);
    if (m) ra.push({ tep, mau: ten, doan: m[0].trim().slice(0, 80) });
  }
  return ra;
}

function tepChay(goc) {
  const ra = [];
  const di = (d) => {
    for (const ten of readdirSync(d)) {
      const p = join(d, ten);
      if (statSync(p).isDirectory()) {
        if (ten === "node_modules" || ten === "test-db") continue;
        di(p);
      } else if (/\.tsx?$/.test(ten) && !/\.(test|ca)\.tsx?$/.test(ten)) ra.push(p);
    }
  };
  di(join(ROOT, goc));
  return ra;
}

test("trạng thái phiên: cây thật sạch", () => {
  assert.equal(BANG.length, 9, `bảng danh tính rút từ migration: cần 9, có ${BANG.length} (${BANG.join(", ")})`);
  const tep = GOC_QUET.flatMap(tepChay);
  assert.ok(tep.length > 50, `quét quá ít tệp: ${tep.length}`);
  const vp = tep.flatMap((p) => viPham(relative(ROOT, p), readFileSync(p, "utf8")));
  for (const [ten] of MAU) {
    const cua = vp.filter((v) => v.mau === ten);
    assert.deepEqual(cua, [], `trạng thái phiên «${ten}»: ${cua.map((v) => `${v.tep}: ${v.doan}`).join(" | ")}`);
  }
});

test("trạng thái phiên: chiều đỏ và đối chứng dương", () => {
  const MOI = [
    ["SET mức phiên", `await c.query("set role x");`],
    ["SET mức phiên", `await c.query("set session authorization x");`],
    ["SET mức phiên", `await c.query("set app.company_id = 'v'");`],
    ["SET mức phiên", `await c.query("set app.company_id='v'");`],
    ["SET mức phiên", `await c.query("set x to v");`],
    ["SET mức phiên", "pool.on('connect', (c) => c.query(`SET SEARCH_PATH = identity`));"],
    ["set_config(…, false)", `await c.query("select set_config('a', $1, false)", [v]);`],
    ["LISTEN/UNLISTEN", `await c.query("listen ch");`],
    ["khoá tư vấn mức phiên", `await c.query("select pg_advisory_lock(1)");`],
    ["PREPARE", `await c.query("prepare q as select 1");`],
    ["bảng tạm", `await c.query("create temp table t (x int)");`],
    ["câu lệnh có tên", `await c.query({ name: "q", text: "select 1" });`],
    ["tham số khởi động", `const p = new pg.Pool({ options: "-c x=y" });`],
    ["bảng danh tính thiếu identity.", `await p.query('select name from "user" where id = $1', [id]);`],
  ];
  for (const [mau, ma] of MOI) {
    const tep = "apps/web/src/moi.ts";
    const vp = viPham(tep, ma);
    assert.ok(
      vp.some((v) => v.mau === mau && v.tep === tep),
      `mồi «${ma}» không bị gọi tên là «${mau}» (được: ${vp.map((v) => v.mau).join(", ") || "không gì"})`,
    );
  }
  const SACH = [
    `await c.query("set local role quy_hang_app");`,
    `await c.query("select set_config('app.user_id', $1, true)", [u]);`,
    `await c.query("select pg_advisory_xact_lock(1)");`,
    `await c.query("update listings set status = $1 where id = $2", [s, id]);`,
    `await p.query('select name from identity."user" where id = $1', [id]);`,
  ];
  for (const ma of SACH) {
    const vp = viPham("apps/web/src/sach.ts", ma);
    assert.deepEqual(vp, [], `đối chứng dương «${ma}» bị gọi tên nhầm: ${vp.map((v) => v.mau).join(", ")}`);
  }
});
