// Bộ nạp mẫu cho bản thật (hàng 87) trên Postgres dãy — E1–E7, E9, E12 của hồ sơ nap-mau-ban-that; E1, E3–E7 của hồ sơ
// nap-mau-co-anh (ảnh vẽ bằng mã trước khi lên Đang bán, kho byte chọn như API, dọn byte khi gỡ hay khi hỏng).
// Chạy: node --import tsx --test "packages/db/seed/*.test.ts" (cần DATABASE_URL tới Postgres đã áp migration).
import { randomBytes, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import type pg from "pg";

// Khoá thử và bản thật giả lập phải đặt TRƯỚC khi nạp mô-đun API (createApi, createLead đọc khoá từ môi trường).
const KHOA_THU = randomBytes(32).toString("base64");
process.env.OWNER_PHONE_KEY = KHOA_THU;
process.env.NODE_ENV = "production";

const { createApi } = await import("../../api/src/app");
const { KHOA_DEV } = await import("../../api/src/owners/khoa");
const { dauVetSo, giaiMaSo, maHoaSo, nguCanhChuNha, nguCanhLead } = await import("../../api/src/owners/ma-hoa");
const h = await import("../../api/test-db/helpers");
const { TEN_SAN, MIEN_EMAIL } = await import("./du-lieu-mau.mjs");
const { goBanThat, napBanThat, timSanMau } = await import("./nap-ban-that");
const { khoPostgres } = await import("../../api/src/photos/kho");
const { addPhoto, isRefusal: laTuChoiAnh, readPhoto } = await import("../../api/src/photos/store");
const { anhMau } = await import("./anh-mau.mjs");
type GoiMau = import("./nap-ban-that").GoiMau;
type KhoAnh = import("../../api/src/photos/kho").KhoAnh;

const THU_MUC = path.dirname(fileURLToPath(import.meta.url));
const TEP_NAP = path.join(THU_MUC, "nap-ban-that.ts");
const GOI: GoiMau = JSON.parse(readFileSync(path.join(THU_MUC, "mau/du-lieu-mau.json"), "utf8"));
const khoa = { key: Buffer.from(KHOA_THU, "base64") };
const pool = h.appPool;
const EMAIL_CHU_KHO = h.mail("chu-kho");
const so = (s: string) => s.replace(/\s/g, "");
// Viết tay, không chép từ VAI_CHU_KHO: thước so với chính hằng số của bộ nạp thì không bao giờ đỏ (Hỏi-2 hàng 87).
const VAI_MONG = ["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"];
const ban = <T>(x: T): T => structuredClone(x);

/** Một giao dịch vai chủ; `giu` false thì rollback (để thử mà không để lại gì). */
async function gd<T>(fn: (c: pg.PoolClient) => Promise<T>, giu = true): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query("begin");
    const kq = await fn(c);
    await c.query(giu ? "commit" : "rollback");
    return kq;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
const nap = (goi = GOI, email = EMAIL_CHU_KHO, kho: KhoAnh = khoPostgres) => gd((c) => napBanThat(c, goi, { khoa, email, kho }));
const go = (kho: KhoAnh = khoPostgres) => gd((c) => goBanThat(c, kho));

/** Một giao dịch dưới vai API với người và sàn đặt cục bộ — như khi người bấm. */
const vaiApp = <T>(user: string, company: string, fn: (c: pg.PoolClient) => Promise<T>, giu = true) =>
  gd(async (c) => {
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [user, company]);
    return fn(c);
  }, giu);

type LenhKho = { lenh: "ghi" | "xoa"; companyId: string; photoId: string; bien?: string };
/** Kho giả: ghi lại mọi lệnh ghi/xoá (khuôn KhoAnh của API), không mạng. Ném ở lần ghi thứ k SAU khi đã ghi nhật ký. */
function khoGia(o: { ten?: "postgres" | "s3"; nemOLanGhi?: number; nemKhiXoa?: boolean } = {}) {
  const nhatKy: LenhKho[] = [];
  let soGhi = 0;
  const kho: KhoAnh = {
    ten: o.ten ?? "s3",
    async ghi(_tx, companyId, photoId, bien) {
      nhatKy.push({ lenh: "ghi", companyId, photoId, bien });
      if (++soGhi === o.nemOLanGhi) throw new Error(`kho giả: lỗi ở lần ghi ${soGhi}`);
    },
    async xoa(_tx, companyId, photoId) {
      nhatKy.push({ lenh: "xoa", companyId, photoId });
      if (o.nemKhiXoa) throw new Error("kho giả: lỗi khi xoá");
    },
    async doc() {
      return null;
    },
  };
  const loc = (l: LenhKho["lenh"]) => nhatKy.filter((x) => x.lenh === l);
  return { kho, nhatKy, ghi: () => loc("ghi"), xoa: () => loc("xoa") };
}

/**
 * Lỗi của nhật ký xoá so với mong: tập mã ảnh xoá BẰNG tập mong, mọi lệnh mang mã sàn mẫu, không lệnh nào chạm sàn cấm
 * hay mã ảnh cấm. Thông điệp nêu mã lệch — dùng cho cả đối chứng dương và chiều đỏ.
 */
function loiXoa(xoa: LenhKho[], o: { san: string; mong: Set<string>; camSan: string; camAnh: Set<string> }): string[] {
  const loi: string[] = [];
  const co = new Set(xoa.map((x) => x.photoId));
  for (const id of o.mong) if (!co.has(id)) loi.push(`thiếu lệnh xoá ảnh ${id}`);
  for (const id of co) if (!o.mong.has(id)) loi.push(`xoá thừa ảnh ${id}`);
  for (const x of xoa) {
    if (x.companyId !== o.san) loi.push(`lệnh xoá ${x.photoId} mang mã sàn ${x.companyId}, không phải sàn mẫu`);
    if (x.companyId === o.camSan) loi.push(`lệnh xoá chạm sàn thật ${o.camSan}`);
    if (o.camAnh.has(x.photoId)) loi.push(`lệnh xoá chạm ảnh sàn thật ${x.photoId}`);
  }
  return loi;
}

// Bảng mong viết tay (không suy từ gói): mã hàng → số ảnh thật ngăn Gửi được. Hàng từng lên Đang bán (Đang bán, Đã cọc,
// Đã bán, Tạm giữ) có một; Chưa đủ và Ngừng hẳn không có.
const ANH_MONG: Record<string, number> = {
  "H-01": 1, "H-02": 0, "H-03": 1, "H-04": 0, "H-05": 0, "H-06": 0, "H-07": 1, "H-08": 1, "H-09": 1, "H-10": 1,
  "H-11": 1, "H-12": 0, "H-13": 1, "H-14": 0, "H-15": 1, "H-16": 0, "H-17": 1, "H-18": 1, "H-19": 1, "H-20": 0,
  "H-21": 1, "H-22": 1, "H-23": 1, "H-24": 0, "H-25": 0, "H-26": 1, "H-27": 1, "H-28": 1, "H-29": 1, "H-30": 1,
  "H-31": 1, "H-32": 0, "H-33": 1, "H-34": 1, "H-35": 1, "H-36": 1, "H-37": 1, "H-38": 1, "H-39": 1, "H-40": 1,
};
/** Hàng nào có số ảnh thật lệch bảng mong — thông điệp nêu mã hàng. */
async function lechAnh(san: string, goi: GoiMau): Promise<string[]> {
  const { rows } = await pool.query<{ unit_number: string; n: number }>(
    `select unit_number, count(*)::int n from unit_photos
     where company_id = $1 and compartment = 'shareable' and not is_sample and removed_at is null group by 1`,
    [san],
  );
  const dem = new Map(rows.map((r) => [r.unit_number, r.n]));
  return goi.hang.filter((g) => (dem.get(g.maCan) ?? 0) !== ANH_MONG[g.ma]).map((g) => `${g.ma}: mong ${ANH_MONG[g.ma]} ảnh, có ${dem.get(g.maCan) ?? 0}`);
}

/** Ảnh chụp mọi bảng của schema public và identity, mọi cột, thứ tự cố định. */
async function chup(): Promise<Record<string, string[]>> {
  const { rows } = await pool.query<{ s: string; t: string }>(
    `select table_schema s, table_name t from information_schema.tables
     where table_schema in ('public', 'identity') and table_type = 'BASE TABLE' order by 1, 2`,
  );
  const anh: Record<string, string[]> = {};
  for (const { s, t } of rows) {
    anh[`${s}.${t}`] = (await pool.query<{ r: string }>(`select row_to_json(x)::text r from "${s}"."${t}" x order by 1`)).rows.map((r) => r.r);
  }
  return anh;
}
/** Bảng nào lệch giữa hai ảnh — thông điệp của phép so. */
function bangLech(a: Record<string, string[]>, b: Record<string, string[]>): string[] {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

const KHOA_KHO = ["STORAGE_S3_ACCESS_KEY", "STORAGE_S3_SECRET_KEY", "STORAGE_S3_ENDPOINT"] as const;
/** Dòng lệnh nạp; ba khoá kho ảnh của môi trường ngoài bị bỏ — ca nào cần thì tự đặt. */
function chayCli(args: string[], env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, ["--import", "tsx", TEP_NAP, ...args], {
    env: { ...process.env, ...Object.fromEntries(KHOA_KHO.map((k) => [k, undefined])), ...env },
    encoding: "utf8",
  });
}

let sanThat = "";
let chuKhoId = "";
let anhThat = "";

before(async () => {
  assert.deepEqual(await gd(timSanMau), [], "Postgres dãy đang có sàn mẫu — gỡ trước khi chạy bộ kiểm");
  // Sàn thật cạnh bên: chủ kho là quản trị, có một hàng, một chủ nhà, một lead (ghi thẳng bằng vai chủ).
  const s = await h.openCompany(`[Sàn ${h.RUN} thật]`, EMAIL_CHU_KHO);
  sanThat = s.companyId;
  chuKhoId = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [EMAIL_CHU_KHO])).rows[0]!.id;
  const hang = randomUUID();
  const lead = randomUUID();
  const soThat = "0900000098";
  await gd(async (c) => {
    await c.query(
      `insert into listings (id, company_id, building_name, unit_number, standard_status, version) values ($1, $2, 'Toà A', 'A-01.01', 'Incomplete', 1)`,
      [hang, sanThat],
    );
    await c.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 1, 'created', '{}', $3, '{company_admin}', false)`,
      [sanThat, hang, chuKhoId],
    );
    await c.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, updated_by) values ($1, $2, '[Tên]', $3, $4, $5)`,
      [sanThat, hang, maHoaSo(soThat, nguCanhChuNha(sanThat, hang), khoa), dauVetSo(soThat, sanThat, khoa), chuKhoId],
    );
    await c.query(
      `insert into leads (id, company_id, created_by, building_name, need, list_price, fee_inclusion, desired_listing_time,
                          owner_phone_enc, owner_phone_hash, outcome)
       values ($1, $2, $3, 'Toà A', 'sale', 1000000000, 'excluded', 'now', $4, $5, 'new')`,
      [lead, sanThat, chuKhoId, maHoaSo(soThat, nguCanhLead(sanThat, lead), khoa), dauVetSo(soThat, sanThat, khoa)],
    );
    // Chủ kho là trưởng nhóm ở sàn thật để thêm được ảnh của căn (luật ngăn nội bộ của hàng 18).
    await c.query("update company_members set roles = array_append(roles, 'team_lead') where company_id = $1 and user_id = $2", [sanThat, chuKhoId]);
  });
  // Sàn thật có một ảnh, thêm qua API ảnh — gỡ sàn mẫu không được chạm tới nó (E6 nap-mau-co-anh).
  const a = anhMau(99);
  const r = await vaiApp(chuKhoId, sanThat, (c) =>
    addPhoto(c, khoPostgres, sanThat, { toa: "Toà A", ma: "A-01.01", ngan: "shareable", takenAt: null, width: a.width, height: a.height, thumb: a.nhe, original: a.goc }),
  );
  assert.ok(!laTuChoiAnh(r), `thêm ảnh sàn thật: ${JSON.stringify(r)}`);
  anhThat = r.anh.id;
});

after(async () => {
  await go();
  await h.cleanup();
});

test("nap-du-goi: đủ người, khu, hàng sáu trạng thái, chủ nhà, lead, người phụ trách (E1)", async () => {
  const { san, moi } = await nap();
  assert.deepEqual(moi, { hang: 40, chuNha: 40, lead: 12 });
  const q = async <T extends pg.QueryResultRow>(sql: string) => (await pool.query<T>(sql, [san])).rows;
  const vai = await q<{ email: string; roles: string[] }>(
    `select u.email, m.roles from company_members m join identity."user" u on u.id = m.user_id where m.company_id = $1 and u.email like '%@${MIEN_EMAIL}'`,
  );
  assert.deepEqual(
    Object.fromEntries(vai.map((v) => [v.email, v.roles])),
    Object.fromEntries(GOI.nguoi.map((n) => [n.email, n.vai])),
  );
  assert.equal((await q("select 1 from company_zones where company_id = $1")).length, 2);
  const dem = Object.fromEntries((await q<{ s: string; n: number }>("select standard_status s, count(*)::int n from listings where company_id = $1 group by 1")).map((r) => [r.s, r.n]));
  assert.deepEqual(dem, { Active: 14, Incomplete: 6, Pending: 5, Closed: 5, Hold: 5, Withdrawn: 5 }, "phân bố trạng thái lệch gói");

  const hang = await q<{ unit_number: string; list_price: string; dau_chu: string; tao: number; chu: string }>(
    `select l.unit_number, l.list_price::text, u.email dau_chu,
            (select count(*)::int from listing_events e where e.listing_id = l.id and e.type = 'created') tao, o.owner_name chu
     from listings l
     join lateral (select user_id from listing_agent_assignments a where a.listing_id = l.id order by seq desc limit 1) a on true
     join identity."user" u on u.id = a.user_id
     join listing_owners o on o.listing_id = l.id
     where l.company_id = $1`,
  );
  assert.equal(hang.length, 40);
  const theoCan = new Map(hang.map((r) => [r.unit_number, r]));
  const emailCua = new Map(GOI.nguoi.map((n) => [n.khoa, n.email]));
  const tenChu = new Map(GOI.chuNha.map((c) => [c.ma, c.ten]));
  for (const g of GOI.hang) {
    const r = theoCan.get(g.maCan);
    assert.ok(r, `${g.ma}: thiếu hàng ${g.maCan}`);
    assert.equal(r.list_price, String(g.gia), `${g.ma}: giá`);
    assert.equal(r.tao, 1, `${g.ma}: sự kiện tạo`);
    assert.equal(r.dau_chu, emailCua.get(g.dauChu), `${g.ma}: đầu chủ phụ trách`);
    assert.equal(r.chu, tenChu.get(g.chuNha), `${g.ma}: chủ nhà`);
  }
  assert.equal(new Set(hang.map((r) => r.chu)).size, 30);

  const lead = await q<{ unit_number: string | null; outcome: string }>("select unit_number, outcome from leads where company_id = $1");
  assert.equal(lead.length, 12);
  const ketQua = (ma: string) => {
    const g = GOI.lead.find((l) => l.ma === ma)!;
    return lead.filter((l) => l.unit_number === g.maCan).map((l) => l.outcome);
  };
  assert.deepEqual(ketQua("L-01"), ["unit_has_open_listing"], "L-01");
  assert.deepEqual(ketQua("L-02"), ["owner_has_agent"], "L-02");
  assert.equal(lead.filter((l) => l.outcome === "new").length, 10);
  await go();
});

test("trung-do-luat-tinh: đổi dữ liệu thì kết quả trùng đổi theo (E1 chiều đỏ)", async () => {
  const goi = ban(GOI);
  const l1 = goi.lead.find((l) => l.ma === "L-01")!;
  goi.hang.find((x) => x.maCan === l1.maCan)!.trangThai = "Closed";
  const l2 = goi.lead.find((l) => l.ma === "L-02")!;
  goi.chuNha.find((c) => so(c.soDienThoai) === so(l2.soDienThoai))!.soDienThoai = "0900 000 099";
  const { san } = await nap(goi);
  const kq = Object.fromEntries(
    (await pool.query<{ unit_number: string; outcome: string }>("select unit_number, outcome from leads where company_id = $1 and unit_number = any($2)", [san, [l1.maCan, l2.maCan]])).rows.map((r) => [r.unit_number, r.outcome]),
  );
  assert.deepEqual(kq, { [l1.maCan!]: "new", [l2.maCan!]: "new" }, "L-01, L-02 phải ra new khi hàng mở và số chủ không còn");
  await go();
});

test("chi-ban-ma: số chủ và số lead chỉ là bản mã đúng ngữ cảnh (E2)", async () => {
  const { san } = await nap();
  const chu = (await pool.query<{ listing_id: string; owner_phone: string | null; enc: Buffer; hash: Buffer; unit_number: string }>(
    `select o.listing_id, o.owner_phone, o.owner_phone_enc enc, o.owner_phone_hash hash, l.unit_number
     from listing_owners o join listings l on l.id = o.listing_id where o.company_id = $1`, [san])).rows;
  assert.equal(chu.length, 40);
  const soCua = new Map(GOI.hang.map((g) => [g.maCan, so(GOI.chuNha.find((c) => c.ma === g.chuNha)!.soDienThoai)]));
  for (const r of chu) {
    assert.equal(r.owner_phone, null);
    assert.equal(giaiMaSo(r.enc, nguCanhChuNha(san, r.listing_id), khoa), soCua.get(r.unit_number), "đối chứng dương: giải đúng số");
    assert.ok(r.hash.equals(dauVetSo(soCua.get(r.unit_number)!, san, khoa)), "dấu vết");
  }
  assert.ok(chu.length >= 2);
  const a = chu[0]!;
  const b = chu[1]!;
  assert.throws(() => giaiMaSo(a!.enc, nguCanhChuNha(san, a!.listing_id), { key: randomBytes(32) }), "khoá khác phải không giải được");
  assert.throws(() => giaiMaSo(a!.enc, nguCanhChuNha(san, b!.listing_id), khoa), "bản mã chép sang dòng khác phải không giải được");
  const lead = (await pool.query<{ id: string; owner_phone: string | null; enc: Buffer; hash: Buffer }>(
    "select id, owner_phone, owner_phone_enc enc, owner_phone_hash hash from leads where company_id = $1", [san])).rows;
  const soLead = new Set(GOI.lead.map((l) => so(l.soDienThoai)));
  for (const r of lead) {
    assert.equal(r.owner_phone, null);
    const s = giaiMaSo(r.enc, nguCanhLead(san, r.id), khoa);
    assert.ok(soLead.has(s));
    assert.ok(r.hash.equals(dauVetSo(s, san, khoa)));
  }
  await go();
});

test("khoa-sai: khoá vắng, sai dạng, khoá dev thì không ghi gì (E3)", async () => {
  const truoc = await chup();
  const ca: [string, string | undefined][] = [
    ["vắng", undefined],
    ["sai dạng", "abc"],
    ["khoá dev", KHOA_DEV.key.toString("base64")],
  ];
  for (const [ten, gia] of ca) {
    const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], { OWNER_PHONE_KEY: gia });
    assert.notEqual(r.status, 0, `${ten}: phải thoát khác 0`);
    assert.match(r.stderr, /OWNER_PHONE_KEY/, `${ten}: thông điệp nêu tên biến`);
    if (gia) assert.ok(!r.stderr.includes(gia), `${ten}: thông điệp không chứa giá trị khoá`);
  }
  assert.deepEqual(bangLech(truoc, await chup()), []);
  // Ngoài bản thật, không khoá kho ảnh → kho Postgres (đường bản thật thiếu khoá: ca chon-kho).
  const ok = chayCli(["--nap", "--email", EMAIL_CHU_KHO], { NODE_ENV: undefined });
  assert.equal(ok.status, 0, `đối chứng dương: khoá hợp lệ — ${ok.stderr}`);
  await go();
});

test("chay-lai: lần hai không đổi một dòng (E4)", async () => {
  await nap();
  const a = await chup();
  const gia = khoGia();
  const { moi } = await nap(GOI, EMAIL_CHU_KHO, gia.kho);
  assert.deepEqual(moi, { hang: 0, chuNha: 0, lead: 0 });
  assert.equal(gia.ghi().length, 0, "nạp lại không được ghi byte ảnh nào");
  const b = await chup();
  assert.deepEqual(bangLech(a, b), [], "chạy lại đổi bảng");
  for (const t of ["public.unit_photos", "public.unit_photo_files", "public.unit_photo_events"]) assert.ok(a[t]?.length, `ảnh chụp có dòng ${t}`);
  // Chiều đỏ của phép so: sửa một dòng thì ảnh chụp phải lệch đúng bảng ấy.
  const [san] = await gd(timSanMau);
  await pool.query("update listings set list_price = list_price + 1 where id = (select id from listings where company_id = $1 limit 1)", [san]);
  assert.deepEqual(bangLech(b, await chup()), ["public.listings"]);
  await go();
});

test("email-chu-kho: tạo, giữ sàn thật, chuẩn hoá, đặt lại vai, từ chối email lạ (E5)", async () => {
  // Đã là quản trị sàn thật: giữ nguyên dòng ấy, thêm dòng sàn mẫu đủ vai.
  const thanhVienThat = async () => (await pool.query("select roles from company_members where company_id = $1 and user_id = $2", [sanThat, chuKhoId])).rows;
  const vaiThat = await thanhVienThat();
  const { san } = await nap(GOI, `  ${EMAIL_CHU_KHO.toUpperCase()} `);
  assert.deepEqual(await thanhVienThat(), vaiThat, "dòng thành viên sàn thật không đổi");
  const vaiMau = async (u: string) => (await pool.query<{ roles: string[] }>("select roles from company_members where company_id = $1 and user_id = $2", [san, u])).rows[0]?.roles;
  assert.deepEqual(await vaiMau(chuKhoId), VAI_MONG, "email-chuan-hoa: khớp tài khoản đã có");
  // vai-chu-kho-dat-lai: vai cũ khác bị đặt lại, lần sau không đổi.
  await pool.query("update company_members set roles = '{company_admin}' where company_id = $1 and user_id = $2", [san, chuKhoId]);
  await nap();
  assert.deepEqual(await vaiMau(chuKhoId), VAI_MONG);
  // Email mới: tài khoản được tạo.
  const moi = h.mail("chu-kho-moi");
  await nap(GOI, moi);
  const idMoi = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [moi])).rows[0]?.id;
  assert.ok(idMoi, "tài khoản mới phải được tạo");
  assert.deepEqual(await vaiMau(idMoi), VAI_MONG);
  // Email sai dạng, miền mẫu: từ chối trước khi ghi.
  const truoc = await chup();
  for (const e of ["abc", `x@${MIEN_EMAIL}`]) await assert.rejects(nap(GOI, e), /email chủ kho/);
  assert.deepEqual(bangLech(truoc, await chup()), []);
  // Đầu ra lệnh không chứa email; kho không chứa email thử.
  const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], { NODE_ENV: undefined });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!(r.stdout + r.stderr).toLowerCase().includes(EMAIL_CHU_KHO), "đầu ra không chứa email");
  const goc = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const timThay = spawnSync("git", ["grep", "-l", "-F", EMAIL_CHU_KHO], { cwd: goc, encoding: "utf8" });
  assert.equal(timThay.stdout.trim(), "", "không tệp nào của kho chứa email chủ kho");
  await go();
  await pool.query('delete from identity."user" where id = $1', [idMoi]);
});

test("go: chỉ sàn mẫu và tài khoản miền mẫu, sàn thật không đổi (E6)", async () => {
  const truoc = await chup();
  assert.deepEqual(await go(), { ket: "khong-co" }, "khong-co");
  assert.deepEqual(bangLech(truoc, await chup()), []);

  await nap();
  const kq = await go();
  assert.equal(kq.ket, "da-go");
  assert.deepEqual(bangLech(truoc, await chup()), [], "sau gỡ phải bằng trước nạp");
  assert.equal((await pool.query("select 1 from identity.\"user\" where email like $1", [`%@${MIEN_EMAIL}`])).rowCount, 0);
  assert.equal((await pool.query("select 1 from company_members where company_id = $1 and user_id = $2", [sanThat, chuKhoId])).rowCount, 1);
});

test("san-that-trung-ten: sàn thật tên mẫu không bị gỡ, không bị nạp vào (E6)", async () => {
  const trung = (await pool.query<{ id: string }>("insert into companies (name) values ($1) returning id", [TEN_SAN])).rows[0]!.id;
  try {
    const truoc = await chup();
    assert.deepEqual(await go(), { ket: "khong-co" });
    assert.deepEqual(bangLech(truoc, await chup()), []);
    const { san } = await nap();
    assert.notEqual(san, trung, "nạp phải dựng sàn mẫu riêng");
    for (const t of ["company_members", "company_zones", "listings", "leads"]) {
      assert.equal((await pool.query(`select 1 from ${t} where company_id = $1`, [trung])).rowCount, 0, `${t} của sàn trùng tên`);
    }
    assert.equal((await go()).ket, "da-go", "đối chứng: sàn mẫu thật vẫn gỡ được");
    assert.equal((await pool.query("select 1 from companies where id = $1", [trung])).rowCount, 1);
  } finally {
    await pool.query("delete from companies where id = $1", [trung]);
  }
});

test("hai-san-mau: hai sàn mẫu khớp thì gỡ từ chối (E6)", async () => {
  await nap();
  const quanTri = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [`quan-tri@${MIEN_EMAIL}`])).rows[0]!.id;
  const hai = (await pool.query<{ id: string }>("insert into companies (name) values ($1) returning id", [TEN_SAN])).rows[0]!.id;
  await pool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{company_admin}')", [hai, quanTri]);
  const truoc = await chup();
  assert.deepEqual(await go(), { ket: "tu-choi", soSan: 2 });
  assert.deepEqual(bangLech(truoc, await chup()), []);
  await pool.query("delete from companies where id = $1", [hai]);
  await go();
});

test("hong-giua-chung: lỗi ở lead cuối rút lại cả lần chạy (E7)", async () => {
  const truoc = await chup();
  const goi = ban(GOI);
  goi.lead.at(-1)!.soDienThoai = "12345";
  await assert.rejects(nap(goi), /L-12/);
  assert.deepEqual(bangLech(truoc, await chup()), [], "không dòng nào được để lại");
  // Byte đã lên kho: kho nhận lệnh xoá đúng mọi mã trong nhật ký ghi của chính kho, mỗi lệnh mang mã sàn mẫu.
  const gia = khoGia();
  await assert.rejects(nap(goi, EMAIL_CHU_KHO, gia.kho), /L-12/);
  const daGhi = new Set(gia.ghi().map((x) => x.photoId));
  assert.equal(daGhi.size, 29, "29 ảnh đã ghi trước khi lead cuối bị từ chối");
  const sanMau = gia.ghi()[0]!.companyId;
  const camAnh = new Set([anhThat]);
  assert.deepEqual(loiXoa(gia.xoa(), { san: sanMau, mong: daGhi, camSan: sanThat, camAnh }), []);
  // Chiều đỏ: bỏ một mã khỏi tập mong thì phép so nêu đúng mã ấy.
  const boMot = [...daGhi][3]!;
  assert.deepEqual(loiXoa(gia.xoa(), { san: sanMau, mong: new Set([...daGhi].filter((x) => x !== boMot)), camSan: sanThat, camAnh }), [`xoá thừa ảnh ${boMot}`]);
  // Kho ném lỗi khi xoá: lỗi của lần chạy vẫn là lỗi gốc.
  const nemXoa = khoGia({ nemKhiXoa: true });
  await assert.rejects(nap(goi, EMAIL_CHU_KHO, nemXoa.kho), /L-12/);
  assert.equal(nemXoa.xoa().length, 29, "lỗi xoá của một ảnh không dừng việc xoá ảnh khác");
  assert.deepEqual(bangLech(truoc, await chup()), [], "không sàn mẫu nào còn");
  const { moi } = await nap();
  assert.equal(moi.hang, 40, "đối chứng: gói nguyên vẹn nạp được");
  await go();
});

test("doc-cheo: thành viên sàn thật không thấy dòng nào của sàn mẫu (E9)", async () => {
  const { san } = await nap();
  const dauChu = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [`dau-chu-1@${MIEN_EMAIL}`])).rows[0]!.id;
  const doc = (user: string, company: string) =>
    gd(async (c) => {
      await c.query("set local role quy_hang_app");
      await c.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [user, company]);
      const dem: Record<string, number> = {};
      for (const t of ["listings", "listing_owners", "leads", "listing_events"]) {
        dem[t] = (await c.query(`select 1 from ${t} where company_id = $1`, [san])).rowCount ?? 0;
      }
      return dem;
    }, false);
  assert.deepEqual(await doc(chuKhoId, sanThat), { listings: 0, listing_owners: 0, leads: 0, listing_events: 0 });
  assert.ok(((await doc(dauChu, san)).listings ?? 0) > 0, "đối chứng dương: đầu chủ sàn mẫu thấy hàng");
  await go();
});

test("tra-danh-muc: thành viên sàn mẫu tra được 180 căn (E12)", async () => {
  const { san } = await nap();
  const { auth, sent } = h.makeAuth();
  const app = createApi({ appPool: h.appPool, identityPool: h.identityPool, auth });
  const goiApi = (p: string, cookie = "", init: RequestInit = {}) =>
    app.request(`${h.BASE_URL}${p}`, { ...init, headers: { "content-type": "application/json", origin: h.BASE_URL, ...(cookie ? { cookie } : {}) } });
  const login = async (email: string) => {
    const truoc = sent.length;
    assert.equal((await goiApi("/api/v1/auth/email-otp/send-verification-otp", "", { method: "POST", body: JSON.stringify({ email, type: "sign-in" }) })).status, 200);
    const ma = sent.slice(truoc).find((m) => m.email === email)!;
    const res = await goiApi("/api/v1/auth/sign-in/email-otp", "", { method: "POST", body: JSON.stringify({ email, otp: ma.otp }) });
    assert.equal(res.status, 200);
    return h.cookieOf(res);
  };
  const cookie = `${await login(EMAIL_CHU_KHO)}; qh_san=${san}`;
  const ca = await goiApi("/api/v1/catalog", cookie);
  assert.equal(ca.status, 200);
  const than = (await ca.json()) as { subdivisions: { buildings: { units: unknown[] }[] }[] };
  assert.equal(than.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units)).length, 180);
  const mot = await goiApi("/api/v1/catalog/units/A-01.03", cookie);
  assert.equal(mot.status, 200);
  assert.equal(((await mot.json()) as { status: string; unit: { unitNumber: string } }).unit.unitNumber, "A-01.03");
  const le = h.mail("le");
  await h.createLoneUser(le);
  assert.equal((await goiApi("/api/v1/catalog/units/A-01.03", await login(le))).status, 403, "phiên chưa thuộc sàn nào");
  await go();
});

test("email-ky-tu-dieu-khien: bộ nạp từ chối ký tự điều khiển trước mọi câu ghi (E4, hàng va-nap-mau)", async () => {
  const { chuanHoaEmail } = await import("./nap-ban-that");
  // Ma trận viết trước: mọi lớp ký tự điều khiển và dấu tách dòng Unicode.
  const SAI = ["a@b.co\nNODE_OPTIONS=x", "a@b.co\r", "a\x00@b.co", "a@b.co\u0007", "a\x1f@b.co", "a@b.co\x7f", "a\t@b.co", "a@b.co\u2028"];
  for (const e of SAI) assert.throws(() => chuanHoaEmail(e), /email chủ kho sai dạng/, JSON.stringify(e));
  assert.equal(chuanHoaEmail("T-x@Example.Test"), "t-x@example.test", "đối chứng dương");
  const truoc = await chup();
  const r = chayCli(["--nap", "--email", "a@b.co\x7f"], { NODE_ENV: undefined });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /email chủ kho sai dạng/);
  assert.deepEqual(bangLech(truoc, await chup()), [], "không dòng nào đổi");
});

test("lien-he: chủ nhà và lead mẫu thành liên hệ, nạp lại không đổi (hàng 85, AC-9)", async () => {
  await nap();
  const [san] = await gd(timSanMau);
  const q = async <T extends pg.QueryResultRow>(sql: string) => (await pool.query<T>(sql, [san])).rows;
  // 30 chủ nhà của gói → 30 liên hệ Chủ bán trên 40 dòng chủ nhà của hàng; mỗi lead gắn một liên hệ.
  const chu = await q<{ n: number; gan: number; lh: number; ban: number }>(
    `select count(*)::int n, count(o.contact_id)::int gan, count(distinct o.contact_id)::int lh,
            count(distinct o.contact_id) filter (where c.contact_types = '{Seller}')::int ban
     from listing_owners o left join contacts c on c.id = o.contact_id where o.company_id = $1`,
  );
  assert.deepEqual(chu, [{ n: GOI.hang.length, gan: GOI.hang.length, lh: GOI.chuNha.length, ban: GOI.chuNha.length }]);
  const lead = await q<{ n: number; gan: number }>("select count(*)::int n, count(contact_id)::int gan from leads where company_id = $1");
  assert.deepEqual(lead, [{ n: GOI.lead.length, gan: GOI.lead.length }]);
  // Lead mang số của một chủ nhà gắn đúng liên hệ ấy; số mới thành liên hệ riêng.
  const soChu = new Set(GOI.chuNha.map((c) => so(c.soDienThoai)));
  const soLeadMoi = new Set(GOI.lead.map((l) => so(l.soDienThoai)).filter((s) => !soChu.has(s)));
  const tong = (await q<{ n: number }>("select count(*)::int n from contacts where company_id = $1"))[0]!.n;
  assert.equal(tong, GOI.chuNha.length + soLeadMoi.size);
  const a = await chup();
  assert.deepEqual((await nap()).moi, { hang: 0, chuNha: 0, lead: 0 });
  assert.deepEqual(bangLech(a, await chup()), [], "nạp lại đổi bảng");
  await go();
});

test("nap-co-anh: căn từng lên Đang bán có đúng một ảnh thật do đầu chủ thêm (E1 nap-mau-co-anh)", async () => {
  const { san } = await nap();
  const dem = Object.fromEntries((await pool.query<{ s: string; n: number }>("select standard_status s, count(*)::int n from listings where company_id = $1 group by 1", [san])).rows.map((r) => [r.s, r.n]));
  assert.deepEqual(dem, { Active: 14, Incomplete: 6, Pending: 5, Closed: 5, Hold: 5, Withdrawn: 5 }, "phân bố trạng thái lệch gói");
  assert.deepEqual(await lechAnh(san, GOI), [], "số ảnh thật theo hàng lệch bảng mong");
  // Không ảnh nào khác (ảnh mẫu, ngăn nội bộ, đã xoá) — tổng ảnh bằng tổng mong.
  const tong = (await pool.query<{ n: number }>("select count(*)::int n from unit_photos where company_id = $1", [san])).rows[0]!.n;
  assert.equal(tong, Object.values(ANH_MONG).reduce((a, b) => a + b, 0));
  // Mỗi ảnh đúng một sự kiện added, người làm là đầu chủ của hàng.
  const idDauChu = new Map<string, string>();
  for (const n of GOI.nguoi) idDauChu.set(n.khoa, (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [n.email])).rows[0]!.id);
  const suKien = new Map(
    (await pool.query<{ unit_number: string; actors: string[] }>(
      `select p.unit_number, coalesce(array_agg(e.actor_user_id) filter (where e.type = 'added'), '{}') actors
       from unit_photos p left join unit_photo_events e on e.photo_id = p.id where p.company_id = $1 group by p.id, p.unit_number`,
      [san],
    )).rows.map((r) => [r.unit_number, r.actors]),
  );
  for (const g of GOI.hang.filter((x) => ANH_MONG[x.ma] === 1)) {
    assert.deepEqual(suKien.get(g.maCan), [idDauChu.get(g.dauChu)], `${g.ma}: sự kiện added của đầu chủ`);
  }
  await go();
  // Chiều đỏ trên cùng fixture: gói đổi một hàng Chưa đủ thành Đang bán thì bảng mong lệch đúng hàng ấy.
  const goi = ban(GOI);
  goi.hang.find((x) => x.ma === "H-04")!.trangThai = "Active";
  const { san: san2 } = await nap(goi);
  assert.deepEqual(await lechAnh(san2, goi), ["H-04: mong 0 ảnh, có 1"]);
  await go();
});

test("anh-doc-lai: ảnh đọc lại qua API ảnh ra đúng byte đã nạp (E3 nap-mau-co-anh)", async () => {
  const { san } = await nap();
  const thuTu = GOI.hang.findIndex((g) => g.ma === "H-07");
  const g = GOI.hang[thuTu]!;
  const dauChu = (await pool.query<{ id: string }>('select id from identity."user" where email = $1', [GOI.nguoi.find((n) => n.khoa === g.dauChu)!.email])).rows[0]!.id;
  const anh = (await pool.query<{ id: string }>("select id from unit_photos where company_id = $1 and unit_number = $2", [san, g.maCan])).rows[0]!.id;
  const doc = await vaiApp(dauChu, san, (c) => readPhoto(c, khoPostgres, san, anh, "original"), false);
  assert.ok(!laTuChoiAnh(doc) && doc.doc?.kind === "byte", `ảnh ${anh}: đọc không ra byte`);
  const bytes = doc.doc.kind === "byte" ? doc.doc.bytes : Buffer.alloc(0);
  assert.ok(bytes.equals(anhMau(thuTu).goc), `ảnh ${anh}: byte khác ảnh vẽ của thứ tự ${thuTu}`);
  // Chiều đỏ: so với ảnh vẽ của thứ tự khác thì không bằng.
  assert.ok(!bytes.equals(anhMau(thuTu + 1).goc), `ảnh ${anh}: trùng byte với thứ tự khác`);
  await go();
});

test("kho-storage: đủ khoá thì byte đi vào kho Storage dưới mã sàn mẫu, bảng byte không có dòng (E5 nap-mau-co-anh)", async () => {
  const gia = khoGia({ ten: "s3" });
  const { san } = await nap(GOI, EMAIL_CHU_KHO, gia.kho);
  const ghi = gia.ghi();
  assert.equal(ghi.length, 29 * 2);
  assert.deepEqual([...new Set(ghi.map((x) => x.companyId))], [san], "mọi lệnh ghi mang mã sàn mẫu");
  const bien = new Map<string, string[]>();
  for (const x of ghi) bien.set(x.photoId, [...(bien.get(x.photoId) ?? []), x.bien!]);
  assert.equal(bien.size, 29);
  for (const [id, b] of bien) assert.deepEqual(b.sort(), ["original", "thumb"], `ảnh ${id}: biến thể`);
  assert.equal((await pool.query("select 1 from unit_photo_files where company_id = $1", [san])).rowCount, 0);
  await go(gia.kho);
});

test("chon-kho: bản thật thiếu khoá thì dừng, lời báo nêu đúng biến thiếu, không bảng nào đổi (E5 nap-mau-co-anh)", async () => {
  const GIA = { STORAGE_S3_ACCESS_KEY: "khoa-thu", STORAGE_S3_SECRET_KEY: "bi-mat-thu", STORAGE_S3_ENDPOINT: "http://127.0.0.1:9/storage/v1/s3" };
  const bo = (...ten: string[]) => Object.fromEntries(Object.entries(GIA).filter(([k]) => !ten.includes(k)));
  // Ma trận viết trước: ô → (môi trường, tập biến mong trong lời báo).
  const O: [string, Record<string, string | undefined>, string[]][] = [
    ["bản thật · đủ ba", { NODE_ENV: "production", ...GIA }, []],
    ["bản thật · thiếu ACCESS_KEY", { NODE_ENV: "production", ...bo("STORAGE_S3_ACCESS_KEY") }, ["STORAGE_S3_ACCESS_KEY"]],
    ["bản thật · thiếu SECRET_KEY", { NODE_ENV: "production", ...bo("STORAGE_S3_SECRET_KEY") }, ["STORAGE_S3_SECRET_KEY"]],
    ["bản thật · thiếu ENDPOINT", { NODE_ENV: "production", ...bo("STORAGE_S3_ENDPOINT") }, ["STORAGE_S3_ENDPOINT"]],
    ["bản thật · không biến nào", { NODE_ENV: "production" }, ["STORAGE_S3_ACCESS_KEY", "STORAGE_S3_ENDPOINT", "STORAGE_S3_SECRET_KEY"]],
    ["ngoài bản thật · thiếu ENDPOINT", { NODE_ENV: undefined, ...bo("STORAGE_S3_ENDPOINT") }, ["STORAGE_S3_ENDPOINT"]],
  ];
  const lechO = (ten: string, mong: string[], stderr: string) => {
    const co = [...new Set(stderr.match(/STORAGE_S3_[A-Z_]+/g) ?? [])].sort();
    return JSON.stringify(co) === JSON.stringify([...mong].sort()) ? null : `ô «${ten}»: lời báo nêu ${JSON.stringify(co)}, mong ${JSON.stringify(mong)}`;
  };
  const truoc = await chup();
  let soAssert = 0;
  const raCuaO = new Map<string, string>();
  for (const [ten, env, mong] of O) {
    const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], env);
    raCuaO.set(ten, r.stderr);
    assert.equal(lechO(ten, mong, r.stderr), null);
    soAssert++;
    if (mong.length) {
      assert.equal(r.status, 1, `ô «${ten}»: mã thoát`);
      assert.ok(!Object.values(GIA).some((v) => r.stderr.includes(v)), `ô «${ten}»: lời báo không chứa giá trị khoá`);
      assert.deepEqual(bangLech(truoc, await chup()), [], `ô «${ten}»: không bảng nào đổi`);
    }
  }
  assert.equal(soAssert, 6);
  assert.deepEqual(bangLech(truoc, await chup()), [], "đủ ba khoá giả: kho không tới được, lần chạy rút lại");
  // Chiều đỏ: tập mong của ô «thiếu ACCESS_KEY» đổi thành rỗng thì ô đỏ, thông điệp nêu tên ô.
  assert.match(lechO("bản thật · thiếu ACCESS_KEY", [], raCuaO.get("bản thật · thiếu ACCESS_KEY")!) ?? "", /ô «bản thật · thiếu ACCESS_KEY»/);
});

test("khong-khoa-ngoai-ban-that: không khoá nào ngoài bản thật thì dùng kho Postgres (E5 nap-mau-co-anh)", async () => {
  const r = chayCli(["--nap", "--email", EMAIL_CHU_KHO], { NODE_ENV: undefined });
  assert.equal(r.status, 0, r.stderr);
  const [san] = await gd(timSanMau);
  assert.equal((await pool.query("select 1 from unit_photo_files where company_id = $1", [san])).rowCount, 29 * 2);
  await go();
});

test("go-xoa-byte: gỡ xoá byte đúng mọi ảnh sàn mẫu, mỗi lệnh mang mã sàn mẫu, sàn thật không đổi (E6 nap-mau-co-anh)", async () => {
  const truoc = await chup();
  const gia = khoGia();
  const { san } = await nap(GOI, EMAIL_CHU_KHO, gia.kho);
  const anhMauSan = new Set((await pool.query<{ id: string }>("select id from unit_photos where company_id = $1", [san])).rows.map((r) => r.id));
  assert.equal(anhMauSan.size, 29);
  assert.equal((await go(gia.kho)).ket, "da-go");
  const camAnh = new Set([anhThat]);
  assert.deepEqual(loiXoa(gia.xoa(), { san, mong: anhMauSan, camSan: sanThat, camAnh }), []);
  assert.deepEqual(bangLech(truoc, await chup()), [], "sàn thật và mọi bảng như trước khi nạp");
  assert.equal((await pool.query("select 1 from unit_photos where id = $1 and company_id = $2", [anhThat, sanThat])).rowCount, 1);
  // Chiều đỏ trên cùng fixture: một lệnh xoá mang mã sàn thật thì phép so nêu mã sàn ấy.
  const lech = [...gia.xoa(), { lenh: "xoa" as const, companyId: sanThat, photoId: [...anhMauSan][0]! }];
  assert.ok(loiXoa(lech, { san, mong: anhMauSan, camSan: sanThat, camAnh }).includes(`lệnh xoá chạm sàn thật ${sanThat}`));
});

test("hong-o-lan-ghi-10: kho ném sau khi đã ghi lần 10 thì xoá đúng mọi mã trong nhật ký ghi (E7 nap-mau-co-anh)", async () => {
  const truoc = await chup();
  const gia = khoGia({ nemOLanGhi: 10 });
  await assert.rejects(nap(GOI, EMAIL_CHU_KHO, gia.kho), /kho giả: lỗi ở lần ghi 10/);
  const daGhi = new Set(gia.ghi().map((x) => x.photoId));
  assert.ok(daGhi.has(gia.ghi()[9]!.photoId), "mã của lần ghi thứ 10 có trong nhật ký");
  assert.equal(daGhi.size, 5);
  const sanMau = gia.ghi()[0]!.companyId;
  assert.notEqual(sanMau, sanThat);
  assert.deepEqual(loiXoa(gia.xoa(), { san: sanMau, mong: daGhi, camSan: sanThat, camAnh: new Set([anhThat]) }), []);
  // Kho ném cả khi xoá: lỗi của lần chạy vẫn là lỗi kho ở lần 10.
  const nem = khoGia({ nemOLanGhi: 10, nemKhiXoa: true });
  await assert.rejects(nap(GOI, EMAIL_CHU_KHO, nem.kho), /kho giả: lỗi ở lần ghi 10/);
  assert.deepEqual(bangLech(truoc, await chup()), [], "không sàn mẫu nào còn");
  assert.deepEqual(await gd(timSanMau), []);
});
