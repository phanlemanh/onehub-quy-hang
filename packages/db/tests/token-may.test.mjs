// Token máy của kết nối (041_token_may_ket_noi, hàng 96): khoá ngoại ghép, tra theo băm, thu hồi một chiều, nhật ký chỉ
// thêm, tập kết cục đóng, và trigger kết thúc thoả thuận. Chạy trên Postgres thật đã áp migration; mỗi ca một giao dịch
// rồi rollback.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url && process.env.CI) throw new Error("Bộ kiểm token máy cần DATABASE_URL trên CI.");
const skip = url ? false : "cần DATABASE_URL (xem .env.example)";

const SAN_A = "00000000-0000-4000-8000-0000000096b1";
const SAN_B = "00000000-0000-4000-8000-0000000096b2";
const bam = (ky) => ky.repeat(64).slice(0, 64);
const hoiLoi = (ma) => (e) => e.code === ma;

/** Hai sàn, mỗi sàn hai thoả thuận `catalog_source`; `fn` nhận kết nối đang ở vai chủ bảng và mã các thoả thuận. */
async function trongGiaoDich(fn) {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    await c.query("begin");
    await c.query("insert into companies (id, name) values ($1, '[Sàn A token]'), ($2, '[Sàn B token]')", [SAN_A, SAN_B]);
    const them = async (san) =>
      (
        await c.query(
          `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
           values ($1, 'catalog_source', 'inbound', 'onehub-invest', '{catalog}', now() - interval '1 day', '[Tên]') returning id`,
          [san],
        )
      ).rows[0].id;
    return await fn(c, { a1: await them(SAN_A), a2: await them(SAN_A), b1: await them(SAN_B) });
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}
const vaiApi = async (c, san) => {
  await c.query("set local role quy_hang_app");
  await c.query("select set_config('app.company_id', $1, true), set_config('app.user_id', '', true)", [san]);
};
async function them(c, san, agr, ky, revoked = false) {
  const { rows } = await c.query(
    `insert into machine_tokens (company_id, agreement_id, token_hash, display_prefix, created_by, revoked_at, revoked_by)
     values ($1, $2, $3, 'abcd1234', '[Tên]', $4, $5) returning id`,
    [san, agr, bam(ky), revoked ? new Date("2026-11-01T00:00:00Z") : null, revoked ? "[Tên]" : null],
  );
  return rows[0].id;
}
async function duKienLoi(c, sql, params, kiem) {
  await c.query("savepoint du_kien_loi");
  await assert.rejects(c.query(sql, params), kiem);
  await c.query("rollback to savepoint du_kien_loi");
}

test("khoá ngoại ghép", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    await vaiApi(c, SAN_B);
    await duKienLoi(
      c,
      `insert into machine_tokens (company_id, agreement_id, token_hash, display_prefix, created_by)
       values ($1, $2, $3, 'abcd1234', '[Tên]')`,
      [SAN_B, tt.a1, bam("1")],
      (e) => ["23503", "42501"].includes(e.code),
    );
    // Đối chứng dương: thoả thuận của chính sàn thì thêm được.
    const ok = await c.query(
      `insert into machine_tokens (company_id, agreement_id, token_hash, display_prefix, created_by)
       values ($1, $2, $3, 'abcd1234', '[Tên]')`,
      [SAN_B, tt.b1, bam("2")],
    );
    assert.equal(ok.rowCount, 1);
  });
});

test("tra theo băm", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const song = await them(c, SAN_A, tt.a1, "3");
    const daThuHoi = await them(c, SAN_A, tt.a1, "4", true);
    await vaiApi(c, ""); // hàm được gọi khi chưa biết sàn
    const maTran = [
      { ten: "băm đúng", hash: bam("3"), ra: [{ token_id: song, company_id: SAN_A, agreement_id: tt.a1, revoked: false }] },
      { ten: "băm của token đã thu hồi", hash: bam("4"), ra: [{ token_id: daThuHoi, company_id: SAN_A, agreement_id: tt.a1, revoked: true }] },
      { ten: "64 hex khác", hash: bam("5"), ra: [] },
      { ten: "rỗng", hash: "", ra: [] },
      { ten: "63 hex", hash: bam("3").slice(1), ra: [] },
      { ten: "chữ hoa", hash: bam("a").toUpperCase(), ra: [] },
      { ten: "có dấu", hash: bam("3").slice(1) + "é", ra: [] },
    ];
    let soLan = 0;
    for (const o of maTran) {
      const { rows } = await c.query("select * from app.machine_token_by_hash($1)", [o.hash]);
      assert.deepEqual(rows, o.ra, o.ten);
      soLan += 1;
    }
    assert.equal(soLan, maTran.length);
  });
});

test("thu hồi một chiều", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const song = await them(c, SAN_A, tt.a1, "6");
    const daThuHoi = await them(c, SAN_A, tt.a1, "7", true);
    await vaiApi(c, SAN_A);
    const cotKhoa = [
      ["token_hash", bam("8")],
      ["agreement_id", tt.a2],
      ["company_id", SAN_B],
      ["created_by", "[Tên khác]"],
    ];
    // Quyền cột là lớp chặn của ô này (không phải luật theo dòng): ghim thông điệp, và thử cả câu sửa cột khoá cùng lúc
    // đặt revoked_at, vốn qua được `with check` nên chỉ quyền cột chặn được.
    const chiQuyenCot = (e) => e.code === "42501" && /permission denied for table machine_tokens/.test(e.message);
    let soLan = 0;
    for (const [cot, gt] of cotKhoa) {
      await duKienLoi(c, `update machine_tokens set ${cot} = $1 where id = $2`, [gt, song], chiQuyenCot);
      await duKienLoi(c, `update machine_tokens set ${cot} = $1, revoked_at = now(), revoked_by = '[Tên]' where id = $2`, [gt, song], chiQuyenCot);
      soLan += 2;
    }
    assert.equal(soLan, cotKhoa.length * 2);
    // Chiều đỏ trên cùng dòng: nới quyền thành sửa cả bảng thì câu cột khoá cùng lúc thu hồi lọt qua, nên hai ô trên đang đo
    // đúng lớp quyền cột.
    await c.query("savepoint noi_quyen");
    await c.query("reset role");
    await c.query("grant update on machine_tokens to quy_hang_app");
    await vaiApi(c, SAN_A);
    const lot = await c.query("update machine_tokens set created_by = '[Tên khác]', revoked_at = now(), revoked_by = '[Tên]' where id = $1", [song]);
    assert.equal(lot.rowCount, 1, "nới quyền mà câu vẫn bị chặn: ô quyền cột không đo gì");
    await c.query("rollback to savepoint noi_quyen");
    await vaiApi(c, SAN_A);
    // Token đã thu hồi không sống lại và không bị thu hồi lần nữa.
    assert.equal((await c.query("update machine_tokens set revoked_at = null where id = $1", [daThuHoi])).rowCount, 0, "huỷ thu hồi");
    assert.equal((await c.query("update machine_tokens set revoked_at = now(), revoked_by = 'x' where id = $1", [daThuHoi])).rowCount, 0, "thu hồi lại");
    // Token còn sống: «thu hồi» mà để revoked_at trống là vi phạm luật.
    await duKienLoi(c, "update machine_tokens set revoked_by = 'x' where id = $1", [song], (e) => e.code === "42501" && /row-level security/.test(e.message));
    // Đối chứng dương.
    assert.equal((await c.query("update machine_tokens set revoked_at = now(), revoked_by = '[Tên]' where id = $1", [song])).rowCount, 1, "thu hồi token còn sống");
  });
});

const CHEN_NHAT_KY = `insert into machine_token_calls (company_id, token_id, agreement_id, method, route, http_status, outcome)
                      values ($1, $2, $3, 'POST', '/api/v1/catalog/feeds', $4, $5) returning id`;

test("nhật ký chỉ thêm", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const t = await them(c, SAN_A, tt.a1, "9");
    await vaiApi(c, SAN_A);
    const dong = (await c.query(CHEN_NHAT_KY, [SAN_A, t, tt.a1, 200, "accepted"])).rows[0].id;
    assert.ok(dong, "thêm đúng sàn được");
    await duKienLoi(c, "update machine_token_calls set http_status = 500 where id = $1", [dong], hoiLoi("42501"));
    await duKienLoi(c, "delete from machine_token_calls where id = $1", [dong], hoiLoi("42501"));
  });
});

test("trạng thái đích", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const t = await them(c, SAN_A, tt.a1, "b");
    await vaiApi(c, SAN_A);
    await duKienLoi(c, CHEN_NHAT_KY, [SAN_A, t, tt.a1, 200, "ok"], (e) => e.code === "23514" && e.constraint === "machine_token_calls_outcome_check");
    const taps = ["accepted", "invalid_payload", "wrong_connection", "agreement_inactive", "token_revoked", "server_error"];
    let soLan = 0;
    for (const o of taps) {
      assert.equal((await c.query(CHEN_NHAT_KY, [SAN_A, t, tt.a1, 200, o])).rowCount, 1, o);
      soLan += 1;
    }
    assert.equal(soLan, 6);
  });
});

test("kết thúc thoả thuận thu hồi đúng phạm vi", { skip }, async () => {
  await trongGiaoDich(async (c, tt) => {
    const cuaA1 = await them(c, SAN_A, tt.a1, "c");
    const daThuTay = await them(c, SAN_A, tt.a1, "d", true);
    const cuaA2 = await them(c, SAN_A, tt.a2, "e");
    const cuaB1 = await them(c, SAN_B, tt.b1, "f");
    const doc = async (id) =>
      (await c.query("select revoked_at, revoked_by from machine_tokens where id = $1", [id])).rows[0];
    const tayTruoc = await doc(daThuTay);

    // `paused` chỉ chặn tạm, không đụng token.
    await c.query("update agreements set status = 'paused' where id = $1", [tt.a1]);
    assert.equal((await doc(cuaA1)).revoked_at, null, "paused không được thu hồi");

    // Kết thúc bằng vai API như lời gọi thật: hàm của trigger chạy bằng vai chủ hàm.
    await vaiApi(c, SAN_A);
    await c.query("update agreements set status = 'ended' where id = $1", [tt.a1]);
    await c.query("reset role");
    const sau = await doc(cuaA1);
    assert.ok(sau.revoked_at, "token của thoả thuận ended phải bị thu hồi");
    assert.equal(sau.revoked_by, "system:agreement-ended");
    assert.deepEqual(await doc(daThuTay), tayTruoc, "token thu hồi tay giữ nguyên mốc và người");
    assert.deepEqual(await doc(cuaA2), { revoked_at: null, revoked_by: null }, "thoả thuận khác cùng sàn");
    assert.deepEqual(await doc(cuaB1), { revoked_at: null, revoked_by: null }, "thoả thuận sàn khác");

    // Mở lại sau `ended`: token không sống lại.
    await c.query("update agreements set status = 'active' where id = $1", [tt.a1]);
    assert.equal((await doc(cuaA1)).revoked_by, "system:agreement-ended");
  });
});
