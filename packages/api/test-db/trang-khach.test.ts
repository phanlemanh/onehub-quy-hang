// Trang khách `/s/<mã>` qua route công khai trên Postgres thật (hàng 35: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7). Người, hàng từ
// bộ dựng sàn thử qua đường ghi thật; số là số mẫu `0900 000 0xx`, tên «[Tên]». Thân Lần gửi lấy từ hàm thật của lõi.
import { banRaNgoai, CAU_HINH_MAC_DINH, truongRa, type CanNoiBo, type CanRaNgoai } from "@quy-hang/core/redaction";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { SU_KIEN_LAN_GUI, thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, lenBang, maMoi, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const MOT = {
  dk1: { vai: ["buyer_agent"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
};
const PUB = "/api/v1/public/shares";
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const hangLenBang = async (s: San) => {
  const id = await hangCoChu(s, "dc1", maMoi(s), soMoi(s));
  await lenBang(s, "dc1", id);
  return id;
};
const lenh = async (s: San, id: string, body: object) => {
  const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
  const r = await send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, ck(s, "dc1"));
  assert.equal(r.status, 200, await r.clone().text());
};
/** Một Lần gửi qua đường ghi thật của hàng 34; trả mã link. */
async function lanGui(s: San, nguoiNhan: "khach_rieng" | "nhom_moi_gioi", listingIds: string[]) {
  let prospectId: string | null = null;
  if (nguoiNhan === "khach_rieng") {
    const t = thanKhachMoi({ ten: "[Tên]", so: soMoi(s), need: "purchase" });
    assert.ok(t.ok);
    const r = await send("POST", "/api/v1/prospects", t.than, ck(s, "dk1"));
    assert.equal(r.status, 201, await r.clone().text());
    prospectId = ((await r.json()) as { id: string }).id;
  }
  const t = thanLanGui({ nguoiNhan, prospectId, listingIds });
  assert.ok(t.ok);
  const r = await send("POST", "/api/v1/shares", t.than, ck(s, "dk1"));
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { code: string }).code;
}
const doc = (code: string) => send("GET", `${PUB}/${code}`);
const baoSuKien = (code: string, body: object) => send("POST", `${PUB}/${code}/events`, body);
const demSuKien = async (code: string, type: string) =>
  (
    await appPool.query<{ n: number }>(
      "select count(*)::int n from share_events e join shares s on s.company_id = e.company_id and s.id = e.share_id where s.code = $1 and e.type = $2",
      [code, type],
    )
  ).rows[0]!.n;

/** Bản ra kỳ vọng của một căn: đọc thẳng hàng, danh mục, ảnh gửi được bằng kết nối chủ rồi dựng bằng banRaNgoai của lõi. */
async function banKyVong(id: string, nguoiNhan: "khach_rieng" | "nhom_moi_gioi", congTy: string, nguoiGui: string): Promise<CanRaNgoai> {
  const l = (await appPool.query("select * from listings where id = $1", [id])).rows[0];
  const cu = (await appPool.query("select * from catalog_units where building_name = $1 and app.unit_key(unit_number) = app.unit_key($2)", [l.building_name, l.unit_number])).rows[0];
  const anh = (
    await appPool.query(
      "select * from unit_photos where company_id = $1 and building_name = $2 and app.unit_key(unit_number) = app.unit_key($3) and removed_at is null and compartment = 'shareable' order by display_order, added_at",
      [l.company_id, l.building_name, l.unit_number],
    )
  ).rows.map(
    (a): UnitPhoto => ({ id: a.id, buildingName: a.building_name, unitNumber: a.unit_number, compartment: a.compartment, displayOrder: a.display_order, isCover: a.is_cover, isSample: a.is_sample, takenAt: a.taken_at, addedAt: new Date(a.added_at).toISOString(), contentType: a.content_type, width: a.width, height: a.height }) as UnitPhoto,
  );
  const can = {
    buildingName: l.building_name, livingArea: cu?.living_area == null ? null : Number(cu.living_area), bedroomsTotal: cu?.bedrooms_total ?? null,
    directionFaces: cu?.direction_faces ?? null, propertyType: cu?.property_type ?? null, propertySubType: cu?.property_sub_type ?? null,
    unitNumber: l.unit_number, upi: cu?.upi ?? null, stack: cu?.stack ?? null, floor: cu?.floor ?? null, buildingFloorsTotal: null,
    standardStatus: l.standard_status, listPrice: l.list_price == null ? null : Number(l.list_price), feeInclusion: l.fee_inclusion,
    furnished: l.furnished, legalStatus: l.legal_status, financing: l.financing, occupantType: l.occupant_type,
    lastConfirmedAt: l.last_confirmed_at ? new Date(l.last_confirmed_at).toISOString() : null, companyName: congTy, senderName: nguoiGui, photos: anh,
  } as unknown as CanNoiBo;
  return banRaNgoai(can, { cua: "gui_link", nguoiNhan, today: new Date().toISOString().slice(0, 10) });
}

// ---- AC-1 ----
test("trang khách: route đọc trả bản ra theo thứ tự gửi", async () => {
  const s = await sanMoi(MOT);
  const [c1, c2, c3] = [await hangLenBang(s), await hangLenBang(s), await hangLenBang(s)];
  const thuTu = [c3!, c1!, c2!];
  for (const nguoiNhan of ["khach_rieng", "nhom_moi_gioi"] as const) {
    const code = await lanGui(s, nguoiNhan, thuTu);
    const r = await doc(code);
    assert.equal(r.status, 200, await r.clone().text());
    const than = (await r.json()) as { companyName: string; senderName: string; nguoiNhan: string; can: CanRaNgoai[] };
    const ten = (await appPool.query<{ name: string }>("select name from companies where id = $1", [s.companyId])).rows[0]!.name;
    const nguoi = (await appPool.query<{ name: string }>('select name from identity."user" where id = $1', [s.nguoi.dk1!.userId])).rows[0]!.name;
    assert.deepEqual([than.companyName, than.senderName, than.nguoiNhan], [ten, nguoi, nguoiNhan], `${nguoiNhan}: đầu trang`);
    assert.equal(than.can.length, 3, `${nguoiNhan}: số căn`);
    const ma = (await appPool.query<{ id: string; unit_number: string }>("select id, unit_number from listings where id = any ($1)", [thuTu])).rows;
    const maTheo = new Map(ma.map((x) => [x.id, x.unit_number]));
    const duoc = truongRa(nguoiNhan, CAU_HINH_MAC_DINH) as readonly string[];
    than.can.forEach((c, i) => {
      for (const k of Object.keys(c)) assert.ok(duoc.includes(k), `${nguoiNhan}: khoá thừa ${k}`);
      if (nguoiNhan === "nhom_moi_gioi") assert.equal(c.unitNumber, maTheo.get(thuTu[i]!), `nhóm môi giới: căn ${i} sai thứ tự`);
      else assert.equal(c.unitNumber, undefined, "khách riêng thấy mã căn");
    });
    // Từng căn deepEqual bản ra kỳ vọng dựng từ dữ liệu đọc thẳng, theo đúng thứ tự gửi.
    for (const [i, id] of thuTu.entries()) assert.deepEqual(than.can[i], await banKyVong(id, nguoiNhan, ten, nguoi), `${nguoiNhan}: căn ${i}`);
    // Giá và trạng thái của bộ dựng (lenBang: 3,2 tỷ, Đang bán) đi qua bản ra.
    assert.deepEqual(than.can.map((c) => [c.availability, c.listPrice]), thuTu.map(() => ["available", 3_200_000_000]), `${nguoiNhan}: trạng thái và giá`);
  }
});

// ---- AC-3 ----
test("trang khách: giá và trạng thái sống", async () => {
  const s = await sanMoi(MOT);
  const [a, b] = [await hangLenBang(s), await hangLenBang(s)];
  const code = await lanGui(s, "khach_rieng", [a!, b!]);
  const r0 = await doc(code);
  assert.match(r0.headers.get("cache-control") ?? "", /no-store/, "route đọc phải no-store");
  assert.equal(((await r0.json()) as { can: CanRaNgoai[] }).can[0]!.listPrice, 3_200_000_000);
  await lenh(s, a!, { type: "price_changed", payload: { listPrice: 2_900_000_000, feeInclusion: "included" } });
  await lenh(s, b!, { type: "status_changed", payload: { to: "Pending" } });
  const sau = ((await (await doc(code)).json()) as { can: CanRaNgoai[] }).can;
  assert.deepEqual([sau[0]!.listPrice, sau[1]!.availability], [2_900_000_000, "under_contract"], "trang theo giá trị mới");
});

// ---- AC-4 ----
test("trang khách: lượt mở ghi một dòng mỗi máy mỗi ngày", async () => {
  const s = await sanMoi(MOT);
  const code = await lanGui(s, "khach_rieng", [await hangLenBang(s)]);
  assert.equal((await doc(code)).status, 200);
  assert.equal(await demSuKien(code, SU_KIEN_LAN_GUI.mo), 0, "GET route đọc không được ghi lượt mở");
  const mo = (v: string) => baoSuKien(code, { type: SU_KIEN_LAN_GUI.mo, visitor: v });
  assert.equal((await mo("may-khach-AAAA")).status, 201);
  assert.equal(await demSuKien(code, SU_KIEN_LAN_GUI.mo), 1);
  assert.equal((await mo("may-khach-AAAA")).status, 200, "cùng máy cùng ngày");
  assert.equal(await demSuKien(code, SU_KIEN_LAN_GUI.mo), 1);
  assert.equal((await mo("may-khach-BBBB")).status, 201);
  assert.equal(await demSuKien(code, SU_KIEN_LAN_GUI.mo), 2, "đối chứng: máy khác thêm dòng");
  const dong = (await appPool.query<{ company_id: string; type: string }>("select e.company_id, e.type from share_events e join shares s on s.id = e.share_id where s.code = $1", [code])).rows;
  assert.deepEqual(dong.map((d) => [d.company_id, d.type]), [[s.companyId, "link_opened"], [s.companyId, "link_opened"]]);
});

// ---- AC-5 ----
test("trang khách: quan tâm ghi đúng căn, từ chối căn lạ", async () => {
  const s = await sanMoi(MOT);
  const [a, b, ngoai] = [await hangLenBang(s), await hangLenBang(s), await hangLenBang(s)];
  const code = await lanGui(s, "khach_rieng", [a!, b!]);
  await lenh(s, b!, { type: "status_changed", payload: { to: "Pending" } });
  const qt = (listingId: string, visitor = "may-khach-AAAA", type: string = SU_KIEN_LAN_GUI.quanTam) => baoSuKien(code, { type, visitor, listingId });
  const BANG: [string, () => Promise<Response>, number, number][] = [
    ["căn trong Lần gửi đang bán", () => qt(a!), 201, 1],
    ["lặp cùng máy", () => qt(a!), 200, 1],
    ["căn không thuộc Lần gửi", () => qt(ngoai!), 409, 1],
    ["căn đã Đang giao dịch", () => qt(b!), 409, 1],
    ["type lạ", () => qt(a!, "may-khach-CCCC", "favorite"), 400, 1],
  ];
  assert.equal(BANG.length, 5, "số dòng bảng viết trước");
  for (const [ten, goi, ma, dem] of BANG) {
    const r = await goi();
    assert.equal(r.status, ma, `${ten}: ${await r.clone().text()}`);
    assert.equal(await demSuKien(code, SU_KIEN_LAN_GUI.quanTam), dem, `${ten}: số dòng`);
  }
});

// ---- AC-6 ----
test("trang khách: link tắt và mã sai", async () => {
  const s = await sanMoi(MOT);
  const tat = await lanGui(s, "khach_rieng", [await hangLenBang(s)]);
  const roi = await lanGui(s, "khach_rieng", [await hangLenBang(s)]);
  assert.equal((await doc(tat)).status, 200, "đối chứng: trước khi tắt");
  assert.equal((await doc(roi)).status, 200, "đối chứng: trước khi gỡ người gửi");
  await appPool.query("update shares set disabled_at = now() where code = $1", [tat]);
  const go = await send("DELETE", `/api/v1/company/members/${s.nguoi.dk1!.userId}`, undefined, ck(s, "qt"));
  assert.ok(go.status < 300, `gỡ thành viên: ${await go.clone().text()}`);
  const ten = (await appPool.query<{ name: string }>("select name from companies where id = $1", [s.companyId])).rows[0]!.name;
  const BANG = [["mã không có", "ZzZzZzZzZzZz"], ["mã sai khuôn", "ab"], ["link đã tắt", tat], ["người gửi rời sàn", roi]] as const;
  assert.equal(BANG.length, 4, "số dòng bảng viết trước");
  for (const [dong, code] of BANG) {
    const r = await doc(code);
    assert.equal(r.status, 404, `${dong}: đọc`);
    const than = await r.text();
    for (const lo of [ten, "Toà A"]) assert.ok(!than.includes(lo), `${dong}: thân 404 lộ «${lo}»`);
    const e = await baoSuKien(code, { type: SU_KIEN_LAN_GUI.mo, visitor: "may-khach-AAAA" });
    assert.equal(e.status, 404, `${dong}: sự kiện`);
  }
  assert.equal(await demSuKien(tat, SU_KIEN_LAN_GUI.mo) + (await demSuKien(roi, SU_KIEN_LAN_GUI.mo)), 0, "link không mở mà vẫn ghi");
});

// ---- AC-7 ----
test("trang khách: ảnh chỉ của bản ra", async () => {
  const s = await sanMoi(MOT);
  const [a, ngoai] = [await hangLenBang(s), await hangLenBang(s)];
  const code = await lanGui(s, "khach_rieng", [a!]);
  const khac = await lanGui(s, "khach_rieng", [ngoai!]);
  // Ngăn gửi được (bộ dựng đã thêm khi lên bảng) và ngăn nội bộ; byte ảnh ở kho Postgres của bộ kiểm.
  const anh = async (listingId: string, ngan: "shareable" | "internal") => {
    const { rows } = await appPool.query<{ id: string }>(
      `select id from unit_photos where company_id = $1 and building_name = (select building_name from listings where id = $2)
         and unit_number = (select unit_number from listings where id = $2) and compartment = $3 limit 1`,
      [s.companyId, listingId, ngan],
    );
    let id = rows[0]?.id;
    if (!id) {
      id = (
        await appPool.query<{ id: string }>(
          `insert into unit_photos (id, company_id, building_name, unit_number, compartment, content_type, byte_size, width, height, added_by)
           select gen_random_uuid(), company_id, building_name, unit_number, $2, 'image/jpeg', 8, 10, 10, 'bai-kiem' from listings where id = $1 returning id`,
          [listingId, ngan],
        )
      ).rows[0]!.id;
    }
    await appPool.query(
      "insert into unit_photo_files (company_id, photo_id, variant, content) values ($1, $2, 'original', $3) on conflict do nothing",
      [s.companyId, id, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4])],
    );
    return id;
  };
  const [gui, noiBo, guiNgoai] = [await anh(a!, "shareable"), await anh(a!, "internal"), await anh(ngoai!, "shareable")];
  const BANG = [
    ["ảnh gửi được của căn trong Lần gửi", code, gui, 200],
    ["ảnh nội bộ cùng căn", code, noiBo, 404],
    ["ảnh gửi được của căn ngoài Lần gửi", code, guiNgoai, 404],
    ["ảnh đúng nhưng mã của Lần gửi khác", khac, gui, 404],
    ["mã không có", "ZzZzZzZzZzZz", gui, 404],
  ] as const;
  assert.equal(BANG.length, 5, "số dòng bảng viết trước");
  for (const [dong, ma, id, mong] of BANG) {
    const r = await send("GET", `${PUB}/${ma}/photos/${id}`);
    assert.equal(r.status, mong, dong);
  }
});
