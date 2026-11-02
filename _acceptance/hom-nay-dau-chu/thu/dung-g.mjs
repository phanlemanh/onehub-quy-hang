// Dựng dữ liệu cho các ca ui-check E7–E10 của hàng 22 (Hôm nay của đầu chủ) trên Postgres của dãy G, sàn «[Mẫu] Sàn thử»
// đã nạp bằng `node packages/db/seed/nap.mjs --nap`. In mã căn và mã lead của từng nhóm để người chấm đối chiếu.
//
//   node --env-file-if-exists=.env.local --import tsx _acceptance/hom-nay-dau-chu/thu/dung-g.mjs            dựng bộ mới
//   … dung-g.mjs --trong          dau-chu-2 hết việc (E10): xác nhận, điền đủ căn của mình, ghi đã gọi lead của mình
//   … dung-g.mjs --thu           chạy thử: dựng, in, rồi rollback — không ghi gì
//   … dung-g.mjs --san-thu       dựng trên một sàn thử riêng «[Thử] Hôm nay hàng 22» (cùng người mẫu, cùng vai) — sàn mẫu
//                                không đổi; người mẫu thấy thêm sàn ấy ở bộ chọn sàn. Gỡ: … dung-g.mjs --go-san-thu
//   … dung-g.mjs --doi-l5 <lead>  sau khi màn đã mở: dau-chu-1 trả lại L5 rồi telesales gửi lại — bấm «Trả lại» trên dòng
//                                 L5 còn trên màn thì máy chủ trả 409 (E9)
//
// Cần DATABASE_URL vai chủ của dãy G (vd postgres://postgres:quyhang@localhost:5564/postgres). Mọi câu ghi chạy dưới vai
// API `quy_hang_app` với người mẫu đúng vai (luật theo dòng áp như khi người bấm), trong MỘT giao dịch.
//
// Đường ghi:
// - Lead (L1…L5): đúng hàm ghi của API — createLead (telesales), reassignLead (trưởng nhóm), acceptLead, createListingFromLead
//   + applyCommand (đầu chủ), returnLead, resubmitLead. Số chủ mã hoá bằng `khoaSoChu()` như API: máy dev không đặt
//   OWNER_PHONE_KEY thì là khoá dev công khai (`KHOA_DEV`, packages/api/src/owners/khoa.ts) — chạy lệnh này với cùng
//   `.env.local` mà máy dev dãy G dùng để số mã hoá cùng khoá với API đang chạy.
// - Căn mang mốc quá khứ (xác nhận 16 ngày trước, đổi giá hôm qua…): API ghi sự kiện lúc `now()`, không có lối ghi lùi
//   giờ. Bộ dựng chép đúng bước của `applyCommand` — kiểm khuôn (`validatePayload`) và bảng chuyển (`checkTransition`)
//   của lõi, ghi sự kiện dưới vai `quy_hang_app` với người làm đúng là người mẫu, bản tính bằng `foldListing` — chỉ khác
//   ở chỗ đặt `occurred_at` tường minh. Người giữ ghi vào `listing_agent_assignments` như putOwner.
//
// Chạy lại thì dựng bộ mới trên các căn chưa có hàng (sự kiện chỉ thêm, không xoá được) — mỗi lần in danh sách của lần ấy.
// Dữ liệu mẫu: toà, mã căn của gói mẫu; số chủ là số giả sinh lúc chạy, không lưu ở kho.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import { checkTransition, completeness, confirmsWithOwner, foldListing, validatePayload } from "@quy-hang/core/listing";
import { BO_NHOM_MAC_DINH, nhomCuaCan } from "@quy-hang/core/today";
import { createLead, createListingFromLead, isRefusal as laTuChoiLead, resubmitLead, returnLead } from "../../../packages/api/src/leads/store.ts";
import { applyCommand, isRefusal, STATE_COLUMNS, viewerOf } from "../../../packages/api/src/listings/store.ts";
import { readQueueFacts } from "../../../packages/api/src/listings/lan-doi.ts";
import { acceptLead, markFirstCall, reassignLead } from "../../../packages/api/src/routing/store.ts";
import { readAssignedLeads } from "../../../packages/api/src/today/store.ts";
import { MIEN_EMAIL, TEN_SAN } from "../../../packages/db/seed/du-lieu-mau.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const GOI = JSON.parse(readFileSync(join(ROOT, "packages/db/seed/mau/du-lieu-mau.json"), "utf8"));
const EMAIL_HAI_VAI = `hai-vai@${MIEN_EMAIL}`;
const KHOA = Object.keys(STATE_COLUMNS);
const COT = KHOA.map((k) => STATE_COLUMNS[k]);
const DU_CHI_TIET = { furnished: "Cơ bản", legalStatus: "Sổ hồng", financing: "Không vay", occupantType: "Chủ ở" };
const CHI_TIET_DANG_BAN = { legalStatus: "Sổ hồng", occupantType: "Chủ ở" };

const NGAY = 86_400_000;
const VN = 7 * 3_600_000;
const bayGio = Date.now();
const lui = (ngay) => new Date(bayGio - ngay * NGAY).toISOString();
/** 12:00 giờ Việt Nam của hôm qua — «hôm qua» chắc chắn bất kể giờ chạy. */
const truaHomQua = () => {
  const ngayVn = Math.floor((bayGio + VN) / NGAY) - 1;
  return new Date(ngayVn * NGAY - VN + 12 * 3_600_000).toISOString();
};
const vuaXong = () => new Date(bayGio - 60_000).toISOString();

const tuChoi = (ma, r) => {
  throw new Error(`${ma}: ${r.error?.code ?? r}${r.details ? ` ${JSON.stringify(r.details)}` : ""}${r.reason ? ` ${r.reason}` : ""}`);
};

/** Như trongVai của nap-ban-that.ts: vai API, người và sàn đặt cục bộ trong giao dịch của người gọi. */
async function trongVai(client, userId, san, fn) {
  await client.query("set local role quy_hang_app");
  await client.query("select set_config('app.user_id', $1, true), set_config('app.company_id', $2, true)", [userId, san]);
  const kq = await fn(client);
  await client.query("reset role");
  return kq;
}

const TEN_SAN_THU = "[Thử] Hôm nay hàng 22";
let sanThu = false;

async function timSan(client) {
  if (sanThu) {
    const co = (await client.query("select id from companies where name = $1", [TEN_SAN_THU])).rows[0]?.id;
    if (co) return co;
    const mau = await timSanMau(client);
    const moi = (await client.query("insert into companies (name) values ($1) returning id", [TEN_SAN_THU])).rows[0].id;
    await client.query(
      `insert into company_members (company_id, user_id, roles)
       select $1, user_id, roles from company_members where company_id = $2`,
      [moi, mau],
    );
    return moi;
  }
  return timSanMau(client);
}

async function timSanMau(client) {
  const { rows } = await client.query(
    `select c.id from companies c where c.name = $1 and exists (
       select 1 from company_members m join identity."user" u on u.id = m.user_id where m.company_id = c.id and u.email = $2)`,
    [TEN_SAN, `quan-tri@${MIEN_EMAIL}`],
  );
  if (rows.length !== 1) throw new Error(`cần đúng một sàn mẫu, có ${rows.length} — chạy node packages/db/seed/nap.mjs --nap trước`);
  return rows[0].id;
}

async function nguoiMau(client, san) {
  // Tài khoản hai vai (Đầu chủ + telesales) cho E7 — miền mẫu, nap.mjs --xoa gỡ cùng.
  await client.query(
    `insert into identity."user" (id, name, email, "emailVerified") values (gen_random_uuid()::text, '[Mẫu] Hai vai', $1, true)
     on conflict (email) do nothing`,
    [EMAIL_HAI_VAI],
  );
  const id = {};
  for (const khoa of ["telesales", "dau-chu-1", "dau-chu-2", "truong-nhom", "quan-tri", "hai-vai"]) {
    const r = await client.query('select id from identity."user" where email = $1', [`${khoa}@${MIEN_EMAIL}`]);
    if (!r.rows[0]) throw new Error(`thiếu người mẫu ${khoa}`);
    id[khoa] = r.rows[0].id;
  }
  await client.query(
    `insert into company_members (company_id, user_id, roles) values ($1, $2, $3)
     on conflict (company_id, user_id) do update set roles = excluded.roles`,
    [san, id["hai-vai"], ["listing_agent", "telesales"]],
  );
  return id;
}

/** Căn của gói mẫu chưa có hàng nào ở sàn — lấy lần lượt. */
async function boCanTrong(client, san) {
  const co = new Set((await client.query("select building_name || '|' || unit_number k from listings where company_id = $1", [san])).rows.map((r) => r.k));
  const daLead = new Set(
    (await client.query("select building_name || '|' || coalesce(unit_number, '') k from leads where company_id = $1", [san])).rows.map((r) => r.k),
  );
  const ds = [];
  for (const s of GOI.danhMuc.subdivisions)
    for (const b of s.buildings) for (const u of b.units) if (!co.has(`${b.buildingName}|${u.unitNumber}`) && !daLead.has(`${b.buildingName}|${u.unitNumber}`)) ds.push({ toa: b.buildingName, ma: u.unitNumber });
  // Xen hai toà để danh sách đọc dễ.
  ds.sort((a, b) => a.ma.slice(2).localeCompare(b.ma.slice(2)) || a.toa.localeCompare(b.toa));
  return () => {
    const c = ds.shift();
    if (!c) throw new Error("hết căn trống trong gói mẫu");
    return c;
  };
}

/**
 * Một hàng với dòng thời gian cho trước: mỗi bước `{ ai, type, payload, at, xacNhan? }`. Kiểm như applyCommand, ghi sự kiện
 * với `occurred_at` tường minh dưới vai API của người làm, cập nhật bản tính; `giu` là người giữ căn.
 */
async function hangCoMoc(client, san, can, giu, buoc) {
  const listingId = randomUUID();
  const events = [];
  for (const [i, b] of buoc.entries()) {
    const seq = i + 1;
    const loi = validatePayload(b.type, b.payload);
    if (loi.length) tuChoi(`${can.ma} bước ${seq}`, { error: { code: "invalid-payload" }, details: loi });
    if (b.type === "status_changed") {
      const s = foldListing(events);
      const kq = checkTransition(s.standardStatus, b.payload.to, { ...s, ...b.payload });
      if (!kq.ok) tuChoi(`${can.ma} bước ${seq}`, { error: { code: kq.kind }, reason: kq.reason ?? kq.missing?.join(",") });
    }
    const xacNhan = b.type === "created" ? false : confirmsWithOwner(b.type, b.xacNhan);
    const ev = await trongVai(client, b.ai, san, async (tx) => {
      const vai = (await tx.query("select roles from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()")).rows[0].roles;
      await tx.query(
        `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner, occurred_at)
         values (app.current_company_id(), $1, $2, $3, $4, app.current_user_id(), $5, $6, $7)`,
        [listingId, seq, b.type, JSON.stringify(b.payload), vai, xacNhan, b.at],
      );
      return { seq, type: b.type, payload: b.payload, actorUserId: b.ai, actorRoles: vai, confirmedWithOwner: xacNhan, occurredAt: b.at };
    });
    events.push(ev);
    const s = foldListing(events);
    await trongVai(client, b.ai, san, async (tx) => {
      if (seq === 1) {
        await tx.query(
          `insert into listings (id, company_id, ${COT.join(", ")}) values ($1, app.current_company_id(), ${COT.map((_, j) => `$${j + 2}`).join(", ")})`,
          [listingId, ...KHOA.map((k) => s[k])],
        );
        await tx.query(
          "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values (app.current_company_id(), $1, 1, $2, app.current_user_id())",
          [listingId, giu],
        );
      } else await tx.query(`update listings set ${COT.map((c, j) => `${c} = $${j + 2}`).join(", ")} where id = $1`, [listingId, ...KHOA.map((k) => s[k])]);
    });
  }
  return { id: listingId, ten: `${can.ma} · ${can.toa}` };
}

const tao = (ai, can, at) => ({ ai, type: "created", payload: { buildingName: can.toa, unitNumber: can.ma }, at });
const gia = (ai, listPrice, at, xacNhan) => ({ ai, type: "price_changed", payload: { listPrice, feeInclusion: "included" }, at, xacNhan });
const chiTiet = (ai, payload, at) => ({ ai, type: "details_changed", payload, at });
const nac = (ai, payload, at) => ({ ai, type: "status_changed", payload, at });
const xacNhan = (ai, at) => ({ ai, type: "owner_confirmed", payload: {}, at });
/** Đang bán đủ năm mục, mọi bước cùng lúc `at` (giá đổi và xác nhận lúc ấy). */
const dangBan = (ai, can, at, listPrice = 3_250_000_000, chiTietMuc = DU_CHI_TIET) => [
  tao(ai, can, at),
  gia(ai, listPrice, at),
  chiTiet(ai, chiTietMuc, at),
  nac(ai, { to: "Active" }, at),
];

let soDem = 0;
/** Số chủ giả, khác nhau mỗi lần chạy — không phải số thật, không lưu ở kho. */
const soGia = () => `0900${String((bayGio / 1000) % 100000 | 0).padStart(5, "0")}${soDem++ % 10}`;

async function taoLead(client, san, id, ten, can, giao) {
  const l = await trongVai(client, id.telesales, san, (tx) =>
    createLead(tx, {
      buildingName: can.toa,
      ...(can.ma && { unitNumber: can.ma }),
      need: "sale",
      listPrice: 3_100_000_000,
      feeInclusion: "excluded",
      desiredListingTime: "now",
      ownerPhone: soGia(),
    }),
  );
  if (laTuChoiLead(l)) tuChoi(ten, l);
  const g = await trongVai(client, id["truong-nhom"], san, (tx) => reassignLead(tx, l.id, giao));
  if ("error" in g) tuChoi(ten, g);
  return l.id;
}

/** Dựng bộ: mỗi hàng một căn trống của gói mẫu; trả mã căn, lead của từng nhóm. */
async function dungThat(client) {
  const san = await timSan(client);
  const id = await nguoiMau(client, san);
  const ke = await boCanTrong(client, san);
  const d1 = id["dau-chu-1"];
  const d2 = id["dau-chu-2"];
  const tn = id["truong-nhom"];
  const ra = { new_lead: [], price_adjustment: [], call_back: [], missing_info: [], recent_change: [], khong: [], "dau-chu-2": [], "hai-vai": [] };
  const hang = async (nhom, giu, lyDo, buoc) => {
    const can = ke();
    const h = await hangCoMoc(client, san, can, giu, buoc(can));
    ra[nhom].push({ ...h, lyDo });
    return h;
  };

  // ——— dau-chu-1: mỗi nhóm mặc định có việc ———
  // Nên gọi điều chỉnh giá (C2 của E8 là dòng đầu).
  await hang("price_adjustment", d1, "Giá giữ 12 ngày", (c) => dangBan(d1, c, lui(12)));
  await hang("price_adjustment", d1, "Giá giữ 11 ngày", (c) => [...dangBan(d1, c, lui(20), 4_600_000_000), xacNhan(d1, lui(11))]);
  // Cần gọi lại (C1 của E8 là dòng đầu): xác nhận 16 ngày trước, giá đổi 3 ngày trước không xác nhận với chủ.
  await hang("call_back", d1, "Chưa xác nhận 16 ngày", (c) => [...dangBan(d1, c, lui(16), 3_050_000_000), gia(d1, 3_000_000_000, lui(3), false)]);
  await hang("call_back", d1, "Chưa xác nhận 20 ngày", (c) => [...dangBan(d1, c, lui(20), 1_600_000_000), nac(d1, { to: "Hold" }, lui(20))]);
  await hang("call_back", d1, "Chưa từng xác nhận", (c) => [tao(d1, c, lui(5))]);
  // Thiếu thông tin: Đang bán, mới xác nhận, thiếu nội thất và tài chính (C3 của E8 là dòng đầu).
  await hang("missing_info", d1, "Thiếu: nội thất, tài chính", (c) => dangBan(d1, c, lui(2), 3_150_000_000, CHI_TIET_DANG_BAN));
  await hang("missing_info", d1, "Thiếu: nội thất", (c) => dangBan(d1, c, lui(1), 4_850_000_000, { ...CHI_TIET_DANG_BAN, financing: "Không vay" }));
  // Mới đổi: trưởng nhóm đổi giá hôm qua; trưởng nhóm đổi trạng thái hôm nay.
  await hang("recent_change", d1, "3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua", (c) => [...dangBan(d1, c, lui(2), 3_100_000_000), gia(tn, 2_950_000_000, truaHomQua())]);
  await hang("recent_change", d1, "Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay", (c) => [...dangBan(d1, c, lui(2), 3_450_000_000), nac(tn, { to: "Pending" }, vuaXong())]);
  // Không nhóm nào: mới xác nhận, đủ; Đã bán (mọi điều kiện khác đều đúng).
  await hang("khong", d1, "đối chứng: tươi, đủ", (c) => dangBan(d1, c, vuaXong()));
  await hang("khong", d1, "đối chứng: Đã bán", (c) => [
    ...dangBan(d1, c, lui(40), 2_800_000_000, CHI_TIET_DANG_BAN),
    nac(d1, { to: "Closed", closePrice: 2_800_000_000, closeDate: lui(30).slice(0, 10) }, lui(30)),
  ]);

  // ——— dau-chu-2: căn có việc của người khác — không được hiện ở Hôm nay của dau-chu-1 ———
  await hang("dau-chu-2", d2, "Cần gọi lại (của dau-chu-2)", (c) => dangBan(d2, c, lui(20), 3_300_000_000));
  await hang("dau-chu-2", d2, "Thiếu thông tin (của dau-chu-2)", (c) => dangBan(d2, c, lui(1), 2_300_000_000, CHI_TIET_DANG_BAN));

  // ——— Lead giao dau-chu-1 ———
  const lead = {};
  lead.L1 = await taoLead(client, san, id, "L1", ke(), d1);
  lead.L2 = await taoLead(client, san, id, "L2", ke(), d1);
  const r2 = await trongVai(client, d1, san, (tx) => acceptLead(tx, lead.L2));
  if ("error" in r2) tuChoi("L2", r2);
  lead.L3 = await taoLead(client, san, id, "L3", { toa: ke().toa, ma: null }, d1);
  // L4 lên bảng: nhận, tạo hàng từ lead, hàng lên Đang bán (Lên bảng là dữ kiện, ADR-0021).
  lead.L4 = await taoLead(client, san, id, "L4", ke(), d1);
  await trongVai(client, d1, san, async (tx) => {
    const a = await acceptLead(tx, lead.L4);
    if ("error" in a) tuChoi("L4", a);
    const h = await createListingFromLead(tx, lead.L4);
    if ("error" in h) tuChoi("L4", h);
    const viewer = await viewerOf(tx, d1);
    let v = 1;
    for (const cmd of [
      { type: "price_changed", payload: { listPrice: 3_100_000_000, feeInclusion: "excluded" } },
      { type: "details_changed", payload: DU_CHI_TIET },
      { type: "status_changed", payload: { to: "Active" } },
    ]) {
      const r = await applyCommand(tx, viewer, h.id, { ...cmd, expectedVersion: v });
      if (isRefusal(r)) tuChoi("L4", r);
      v = r.state.version;
    }
    ra.khong.push({ id: h.id, ten: "(hàng của L4)", lyDo: "đối chứng: hàng tạo từ lead, tươi, đủ" });
  });
  lead.L5 = await taoLead(client, san, id, "L5", ke(), d1);

  // ——— Người hai vai: một căn Cần gọi lại, một lead tự nhập và được giao cho chính mình ———
  const hv = id["hai-vai"];
  await hang("hai-vai", hv, "Cần gọi lại (của hai vai)", (c) => dangBan(hv, c, lui(18), 2_900_000_000));
  const hvCan = ke();
  const hvLead = await trongVai(client, hv, san, (tx) =>
    createLead(tx, { buildingName: hvCan.toa, unitNumber: hvCan.ma, need: "lease", listPrice: 14_000_000, feeInclusion: "excluded", desiredListingTime: "now", ownerPhone: soGia() }),
  );
  if (laTuChoiLead(hvLead)) tuChoi("hai-vai lead", hvLead);
  const g = await trongVai(client, tn, san, (tx) => reassignLead(tx, hvLead.id, hv));
  if ("error" in g) tuChoi("hai-vai lead", g);

  await tuKiem(client, san, id, { ra, lead });
  return { san, ra, lead, hvLead: hvLead.id };
}

async function lamTrong(client) {
  const san = await timSan(client);
  const id = await nguoiMau(client, san);
  const d2 = id["dau-chu-2"];
  const { rows } = await client.query(
    `select l.id, l.standard_status from listings l
     where l.company_id = $1 and l.standard_status not in ('Closed', 'Withdrawn')
       and (select a.user_id from listing_agent_assignments a where a.listing_id = l.id order by a.seq desc limit 1) = $2`,
    [san, d2],
  );
  let n = 0;
  await trongVai(client, d2, san, async (tx) => {
    const viewer = await viewerOf(tx, d2);
    for (const h of rows) {
      let v = (await tx.query("select version from listings where id = $1", [h.id])).rows[0].version;
      for (const cmd of [
        { type: "details_changed", payload: DU_CHI_TIET },
        { type: "owner_confirmed", payload: {} },
      ]) {
        const r = await applyCommand(tx, viewer, h.id, { ...cmd, expectedVersion: v });
        if (isRefusal(r)) tuChoi(h.id, r);
        v = r.state.version;
      }
      n++;
    }
  });
  const leads = (
    await client.query(
      `select id from leads where company_id = $1 and matched_agent_user_id = $2 and first_called_at is null
         and returned_at is null and discarded_at is null and resubmitted_at is null`,
      [san, d2],
    )
  ).rows;
  for (const l of leads) {
    const r = await trongVai(client, d2, san, (tx) => markFirstCall(tx, l.id));
    if ("error" in r) tuChoi(l.id, r);
  }
  console.log(`dau-chu-2: ${n} căn đã xác nhận và điền đủ, ${leads.length} lead đã ghi gọi — Hôm nay của dau-chu-2 không còn việc`);
  console.log("Lưu ý: hàng Mới đổi tính «người khác đổi từ hôm qua» — đừng để người khác sửa căn của dau-chu-2 trước khi chấm E10.");
}

async function doiL5(client, leadId) {
  const san = await timSan(client);
  const id = await nguoiMau(client, san);
  const tra = await trongVai(client, id["dau-chu-1"], san, (tx) => returnLead(tx, leadId));
  if (laTuChoiLead(tra)) tuChoi("L5 trả lại", tra);
  const gui = await trongVai(client, id.telesales, san, (tx) => resubmitLead(tx, leadId, { ownerPhone: soGia() }));
  if (laTuChoiLead(gui)) tuChoi("L5 gửi lại", gui);
  console.log(`L5 ${leadId}: đã trả lại rồi telesales gửi lại (lead mới ${gui.id}). Dòng L5 còn trên màn — bấm «Trả lại» → 409 «Lead đã trả lại rồi.»`);
}

/**
 * Tự kiểm: đọc lại bằng đường đọc của API (dữ kiện hàng đợi, lead giao cho tôi) dưới vai dau-chu-1 và chia bằng bộ máy của
 * lõi với bộ mặc định — mỗi căn phải rơi đúng nhóm đã in, lead đúng bốn mã. Lệch thì ném, giao dịch rollback.
 */
async function tuKiem(client, san, id, { ra, lead }) {
  const d1 = id["dau-chu-1"];
  const nay = new Date().toISOString();
  await trongVai(client, d1, san, async (tx) => {
    const ids = Object.values(ra).flat().map((h) => h.id);
    const facts = await readQueueFacts(tx, ids);
    const { rows } = await tx.query(`select id, ${COT.join(", ")} from listings where id = any($1)`, [ids]);
    const lech = [];
    for (const [nhom, ds] of Object.entries(ra)) {
      for (const h of ds) {
        const r = rows.find((x) => x.id === h.id);
        const s = Object.fromEntries(KHOA.map((k) => [k, r[STATE_COLUMNS[k]]]));
        const f = facts.get(h.id);
        const can = {
          ...f,
          standardStatus: s.standardStatus,
          lastConfirmedAt: s.lastConfirmedAt ? new Date(s.lastConfirmedAt).toISOString() : null,
          missing: completeness({ ...s, listPrice: s.listPrice === null ? null : Number(s.listPrice) }).missing,
          propertySubType: "Condominium",
        };
        const ra1 = nhomCuaCan(BO_NHOM_MAC_DINH, can, d1, nay)?.code ?? null;
        const mong = nhom in { price_adjustment: 1, call_back: 1, missing_info: 1, recent_change: 1 } ? nhom : null;
        if (ra1 !== mong) lech.push(`${h.ten}: mong ${mong ?? "không nhóm"}, ra ${ra1 ?? "không nhóm"}`);
      }
    }
    const giao = (await readAssignedLeads(tx)).map((l) => `${l.id}:${l.stage}`).sort();
    const mongLead = [`${lead.L1}:sent`, `${lead.L2}:accepted`, `${lead.L3}:sent`, `${lead.L5}:sent`].sort();
    if (giao.join(",") !== mongLead.join(",")) lech.push(`lead giao dau-chu-1: mong ${mongLead.join(", ")}, ra ${giao.join(", ")}`);
    if (lech.length) throw new Error(`tự kiểm lệch:\n  ${lech.join("\n  ")}`);
  });
  console.log("tự kiểm: mọi căn đúng nhóm theo đường đọc của API và bộ máy của lõi; lead giao dau-chu-1 đúng bốn mã");
}

function inKetQua({ ra, lead, hvLead }) {
  const NHAN = {
    price_adjustment: "Nên gọi điều chỉnh giá",
    call_back: "Cần gọi lại",
    missing_info: "Thiếu thông tin",
    recent_change: "Mới đổi",
    khong: "Không nhóm nào (dau-chu-1)",
    "dau-chu-2": "Của dau-chu-2 (không được hiện cho dau-chu-1)",
    "hai-vai": `Của ${EMAIL_HAI_VAI}`,
  };
  console.log(`dau-chu-1@${MIEN_EMAIL} — Hôm nay, nhóm theo bộ mặc định:`);
  console.log(`  Lead mới (${4}): L1 ${lead.L1} (Đã gửi) · L2 ${lead.L2} (Đã nhận) · L3 ${lead.L3} (Đã gửi, chỉ biết toà) · L5 ${lead.L5} (Đã gửi)`);
  for (const k of ["price_adjustment", "call_back", "missing_info", "recent_change", "khong", "dau-chu-2", "hai-vai"]) {
    console.log(`  ${NHAN[k]} (${ra[k].length}):`);
    for (const h of ra[k]) console.log(`    ${h.ten}  [${h.id}]  — ${h.lyDo}`);
  }
  console.log(`  L4 ${lead.L4}: đã lên bảng — không ở nhóm nào; POST /api/v1/leads/${lead.L4}/return → 409`);
  console.log(`E8: C1 = dòng đầu Cần gọi lại · C2 = dòng đầu Nên gọi điều chỉnh giá · C3 = dòng đầu Thiếu thông tin`);
  console.log(`E9: L5 — sau khi màn mở, chạy: … dung-g.mjs --doi-l5 ${lead.L5}`);
  console.log(`E7 hai vai: ${EMAIL_HAI_VAI} — vùng đầu chủ 2 dòng (1 căn Cần gọi lại, lead ${hvLead}), vùng Lead đã nhập 1 dòng`);
}

async function chay() {
  const { values } = parseArgs({
    options: { trong: { type: "boolean" }, thu: { type: "boolean" }, "doi-l5": { type: "string" }, "san-thu": { type: "boolean" }, "go-san-thu": { type: "boolean" } },
  });
  sanThu = !!values["san-thu"];
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("thiếu DATABASE_URL vai chủ của dãy G");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("begin");
    if (values["go-san-thu"]) {
      // Sự kiện chỉ thêm — chỉ xoá được theo cả sàn (xoá dây chuyền). Tên sàn thử là nhãn duy nhất của lệnh này.
      const r = await client.query("delete from companies where name = $1", [TEN_SAN_THU]);
      console.log(`đã gỡ ${r.rowCount} sàn thử «${TEN_SAN_THU}»`);
    } else if (values.trong) await lamTrong(client);
    else if (values["doi-l5"]) await doiL5(client, values["doi-l5"]);
    else inKetQua(await dungThat(client));
    await client.query(values.thu ? "rollback" : "commit");
    if (values.thu) console.log("(chạy thử — đã rollback, không ghi gì)");
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

chay().catch((e) => {
  // Chỉ thông điệp — lỗi của Postgres có thể mang giá trị dòng.
  console.error(`dung-g: ${e instanceof Error ? e.message : "lỗi không rõ"}`);
  process.exit(1);
});
