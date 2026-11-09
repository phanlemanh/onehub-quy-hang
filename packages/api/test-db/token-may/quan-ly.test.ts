// Cấp, đọc, thu hồi token máy (hàng 96) trên Postgres thật — E1, E2, và hai ca Review Focus của kế hoạch.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { appPool, capToken, choQuaHan, demNhatKy, doiTrangThai, donDep, FEED, goi, goiMau, NGAY, sanMoi, thanhVien, themThoaThuan, thuHoi, tin, tokensCua } from "./chung";

after(donDep);

const BANG = ["machine_tokens", "machine_token_calls"];
const danhSachCot = async () =>
  (
    await appPool.query<{ table_name: string; column_name: string }>(
      "select table_name, column_name from information_schema.columns where table_schema = 'public' and table_name = any ($1) order by table_name, ordinal_position",
      [BANG],
    )
  ).rows;

/** Cột nào của hai bảng, ở các dòng của sàn, chứa chuỗi cần tìm. Trả tên cột và số cột đã quét. */
export async function quetCot(companyId: string, chuoi: string): Promise<{ thay: string[]; soCot: number }> {
  const cot = await danhSachCot();
  const thay: string[] = [];
  for (const { table_name, column_name } of cot) {
    const { rows } = await appPool.query<{ n: string }>(
      `select count(*) n from ${table_name} where company_id = $1 and position($2 in ${column_name}::text) > 0`,
      [companyId, chuoi],
    );
    if (Number(rows[0]!.n) > 0) thay.push(`${table_name}.${column_name}`);
  }
  return { thay, soCot: cot.length };
}

test("cấp token: hiện một lần, lưu băm", async () => {
  const s = await sanMoi("e1");
  const agreementId = await themThoaThuan(s.companyId);
  const res = await goi("POST", tokensCua(agreementId), { cookie: s.cookie });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const cap = (await res.json()) as { id: string; token: string; displayPrefix: string };
  assert.match(cap.token, /^qhm_[A-Za-z0-9_-]{43}$/);
  const bam = createHash("sha256").update(cap.token).digest("hex");

  const trongBang = await appPool.query<{ token_hash: string; display_prefix: string }>("select token_hash, display_prefix from machine_tokens where id = $1", [cap.id]);
  assert.equal(trongBang.rows[0]!.token_hash, bam, "băm trong bảng phải là sha256 của chính token API trả");
  assert.equal(trongBang.rows[0]!.display_prefix, cap.token.slice(4, 12));

  const ds = await goi("GET", tokensCua(agreementId), { cookie: s.cookie });
  assert.equal(ds.status, 200);
  const than = await ds.text();
  const dong = (JSON.parse(than) as { tokens: Record<string, unknown>[] }).tokens;
  assert.equal(dong.length, 1);
  assert.deepEqual(Object.keys(dong[0]!).sort(), ["createdAt", "displayPrefix", "id", "revokedAt"]);
  assert.ok(!than.includes(cap.token), "danh sách lộ token rõ");
  assert.ok(!than.includes(bam), "danh sách lộ băm");

  // Một lời gọi nhận thật, để bảng nhật ký cũng có dòng khi quét.
  await tin(s.companyId);
  assert.equal((await goi("POST", FEED, { bearer: cap.token, body: goiMau("e1") })).status, 200);
  assert.equal(await demNhatKy(cap.id), 1);

  const quet = await quetCot(s.companyId, cap.token);
  assert.deepEqual(quet.thay, [], "có cột chứa token rõ");
  assert.equal(quet.soCot, (await danhSachCot()).length);
  assert.ok(quet.soCot >= 18, `chỉ quét ${quet.soCot} cột`);
  // Đối chứng dương trên cùng dòng.
  assert.deepEqual((await quetCot(s.companyId, cap.displayPrefix)).thay.filter((c) => c.endsWith("display_prefix")), ["machine_tokens.display_prefix"]);
  // Chiều đỏ: hàm cấp giả lưu token rõ vào một cột thì phép quét đỏ và nêu tên cột.
  const gia = await sanMoi("e1-do");
  const agrGia = await themThoaThuan(gia.companyId);
  const rat = "qhm_" + "z".repeat(43);
  await appPool.query(
    "insert into machine_tokens (company_id, agreement_id, token_hash, display_prefix, created_by) values ($1, $2, $3, 'zzzzzzzz', $4)",
    [gia.companyId, agrGia, createHash("sha256").update(rat).digest("hex"), rat],
  );
  assert.deepEqual((await quetCot(gia.companyId, rat)).thay, ["machine_tokens.created_by"]);
});

test("quyền quản lý token: ma trận ba người ba lệnh", async () => {
  const s = await sanMoi("e2-qr");
  const khac = await sanMoi("e2-qr-khac");
  const agreementId = await themThoaThuan(s.companyId);
  const cap = await capToken(s, agreementId);
  const nguoi = { chuaDangNhap: undefined, thanhVien: await thanhVien(s, "e2"), quanTriKhac: khac.cookie } as const;
  const lenh = [
    { m: "POST", p: tokensCua(agreementId) },
    { m: "GET", p: tokensCua(agreementId) },
    { m: "DELETE", p: `${tokensCua(agreementId)}/${cap.id}` },
  ];
  const mong: Record<keyof typeof nguoi, [number, string]> = {
    chuaDangNhap: [401, "unauthenticated"],
    thanhVien: [403, "admin-required"],
    quanTriKhac: [404, "not-found"],
  };
  let soLan = 0;
  for (const [ai, cookie] of Object.entries(nguoi) as [keyof typeof nguoi, string | undefined][]) {
    for (const l of lenh) {
      const res = await goi(l.m, l.p, { cookie });
      assert.deepEqual([res.status, ((await res.json()) as { error: string }).error], mong[ai], `${ai} ${l.m}`);
      soLan += 1;
    }
  }
  assert.equal(soLan, 9);
  const { rows } = await appPool.query("select revoked_at from machine_tokens where agreement_id = $1", [agreementId]);
  assert.deepEqual(rows, [{ revoked_at: null }], "ma trận từ chối mà token bị đổi");
  // Đối chứng: quản trị đúng sàn thành công ở cả ba lệnh.
  assert.equal((await goi("POST", lenh[0]!.p, { cookie: s.cookie })).status, 201);
  assert.equal((await goi("GET", lenh[1]!.p, { cookie: s.cookie })).status, 200);
  assert.equal((await goi("DELETE", lenh[2]!.p, { cookie: s.cookie })).status, 204);
});

test("cấp token: loại kết nối không cấp được", async () => {
  const s = await sanMoi("e2-loai");
  const khongCap: [string, string][] = [
    ["listing_channel", "outbound"],
    ["lead_source", "inbound"],
    ["spreadsheet", "outbound"],
    ["company_partnership", "outbound"],
    ["company_api", "outbound"],
    ["ai_processing", "outbound"],
    ["catalog_source", "outbound"],
  ];
  let soLan = 0;
  for (const [kind, direction] of khongCap) {
    const id = await themThoaThuan(s.companyId, { kind, direction });
    const res = await goi("POST", tokensCua(id), { cookie: s.cookie });
    assert.deepEqual([res.status, await res.json()], [400, { error: "token-kind-not-supported" }], `${kind}/${direction}`);
    soLan += 1;
  }
  assert.equal(soLan, 7);
  for (const [kind, direction] of [["catalog_source", "inbound"], ["catalog_confirmation", "outbound"]] as const) {
    const id = await themThoaThuan(s.companyId, { kind, direction });
    assert.equal((await goi("POST", tokensCua(id), { cookie: s.cookie })).status, 201, `${kind}/${direction}`);
  }
});

test("cấp token: thoả thuận không hiệu lực", async () => {
  const s = await sanMoi("e2-hl");
  const ma = [
    { ten: "paused", t: { status: "paused" } },
    { ten: "ended", t: { status: "ended" } },
    { ten: "chưa tới hạn", t: { from: new Date(Date.now() + NGAY) } },
    { ten: "quá hạn", t: { from: new Date(Date.now() - 10 * NGAY), until: new Date(Date.now() - NGAY) } },
  ];
  let soLan = 0;
  for (const o of ma) {
    const id = await themThoaThuan(s.companyId, o.t);
    const res = await goi("POST", tokensCua(id), { cookie: s.cookie });
    assert.deepEqual([res.status, await res.json()], [403, { error: "agreement-inactive" }], o.ten);
    soLan += 1;
  }
  assert.equal(soLan, ma.length);
});

test("trần token còn sống", async () => {
  const s = await sanMoi("e2-tran");
  const id = await themThoaThuan(s.companyId);
  const dau = await capToken(s, id);
  await capToken(s, id);
  const vuot = await goi("POST", tokensCua(id), { cookie: s.cookie });
  assert.deepEqual([vuot.status, await vuot.json()], [409, { error: "token-limit-reached" }]);
  assert.equal((await thuHoi(s, id, dau.id)).status, 204);
  assert.equal((await goi("POST", tokensCua(id), { cookie: s.cookie })).status, 201, "thu hồi một cái thì cấp lại được");
});

test("hai lời cấp song song", async () => {
  const s = await sanMoi("e2-ss");
  const id = await themThoaThuan(s.companyId);
  await capToken(s, id);
  const kq = await Promise.all([goi("POST", tokensCua(id), { cookie: s.cookie }), goi("POST", tokensCua(id), { cookie: s.cookie })]);
  assert.deepEqual(kq.map((r) => r.status).sort(), [201, 409]);
  const { rows } = await appPool.query<{ n: string }>("select count(*) n from machine_tokens where agreement_id = $1 and revoked_at is null", [id]);
  assert.equal(Number(rows[0]!.n), 2);
});

test("thu hồi ở mọi trạng thái", async () => {
  const s = await sanMoi("e2-tt");
  const ma: { ten: string; doi: (id: string) => Promise<unknown> }[] = [
    { ten: "paused", doi: (id) => doiTrangThai(id, "paused") },
    { ten: "ended", doi: (id) => doiTrangThai(id, "ended") },
    { ten: "quá hạn", doi: (id) => choQuaHan(id) },
  ];
  let soLan = 0;
  for (const o of ma) {
    const id = await themThoaThuan(s.companyId);
    const t = await capToken(s, id);
    await o.doi(id);
    assert.equal((await thuHoi(s, id, t.id)).status, 204, o.ten);
    const { rows } = await appPool.query<{ revoked_at: Date | null }>("select revoked_at from machine_tokens where id = $1", [t.id]);
    assert.ok(rows[0]!.revoked_at, `${o.ten}: chưa thu hồi`);
    soLan += 1;
  }
  assert.equal(soLan, ma.length);
});

test("tokenId khác thoả thuận", async () => {
  const s = await sanMoi("e2-khac");
  const a1 = await themThoaThuan(s.companyId);
  const a2 = await themThoaThuan(s.companyId);
  const t1 = await capToken(s, a1);
  const t2 = await capToken(s, a2);
  const res = await thuHoi(s, a1, t2.id);
  assert.deepEqual([res.status, await res.json()], [404, { error: "not-found" }]);
  const { rows } = await appPool.query("select revoked_at from machine_tokens where id = any ($1::uuid[])", [[t1.id, t2.id]]);
  assert.deepEqual(rows, [{ revoked_at: null }, { revoked_at: null }]);
});

test("thu hồi lại", async () => {
  const s = await sanMoi("e2-lai");
  const id = await themThoaThuan(s.companyId);
  const t = await capToken(s, id);
  assert.equal((await thuHoi(s, id, t.id)).status, 204);
  const doc = async () => (await appPool.query("select revoked_at, revoked_by from machine_tokens where id = $1", [t.id])).rows[0];
  const dau = await doc();
  assert.ok(dau.revoked_at && dau.revoked_by);
  assert.equal((await thuHoi(s, id, t.id)).status, 204);
  assert.deepEqual(await doc(), dau);
});

test("đường dẫn sai dạng", async () => {
  const s = await sanMoi("rf-dang");
  const id = await themThoaThuan(s.companyId);
  const ma = [
    { m: "POST", p: tokensCua("khong-phai-uuid") },
    { m: "GET", p: tokensCua("khong-phai-uuid") },
    { m: "DELETE", p: `${tokensCua("khong-phai-uuid")}/00000000-0000-4000-8000-000000000001` },
    { m: "DELETE", p: `${tokensCua(id)}/khong-phai-uuid` },
  ];
  let soLan = 0;
  for (const o of ma) {
    const res = await goi(o.m, o.p, { cookie: s.cookie });
    assert.deepEqual([res.status, await res.json()], [404, { error: "not-found" }], `${o.m} ${o.p}`);
    soLan += 1;
  }
  assert.equal(soLan, ma.length);
});

test("sàn bên kia của thoả thuận", async () => {
  const chu = await sanMoi("rf-chu");
  const benKia = await sanMoi("rf-benkia");
  const id = await themThoaThuan(chu.companyId, { benKia: benKia.companyId });
  const t = await capToken(chu, id);
  const lenh = [
    { m: "POST", p: tokensCua(id) },
    { m: "GET", p: tokensCua(id) },
    { m: "DELETE", p: `${tokensCua(id)}/${t.id}` },
  ];
  let soLan = 0;
  for (const o of lenh) {
    const res = await goi(o.m, o.p, { cookie: benKia.cookie });
    assert.deepEqual([res.status, await res.json()], [404, { error: "not-found" }], o.m);
    soLan += 1;
  }
  assert.equal(soLan, 3);
  const { rows } = await appPool.query("select revoked_at from machine_tokens where agreement_id = $1", [id]);
  assert.deepEqual(rows, [{ revoked_at: null }], "bên kia đổi được token");
});
