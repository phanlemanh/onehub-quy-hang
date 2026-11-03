// Số đo hai tuần thử (hàng 52, hồ sơ so-do-hai-tuan-thu) — E1…E10. Đầu vào từ bộ mẫu hàng 5 qua mau.fixture.ts; ca biên thêm
// sự kiện lên hàng mẫu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mock, test } from "node:test";
import type { CatalogData, CatalogUnitData } from "../catalog/types";
import { SOURCE_KEYS, validatePayload, type EventType, type ListingEvent } from "../listing/events";
import { foldListing } from "../listing/fold";
import { freshness } from "../listing/freshness";
import { completeness } from "../listing/completeness";
import { nhomCuaCan } from "../today/hang-doi";
import { boMacDinh } from "../today/mac-dinh";
import { DANH_SACH_SO_DO, type MucDanhSach } from "./danh-sach";
import type { DauVaoSoDo, DongSoDo, HangVao, LeadVao, MetricCode } from "./kieu";
import { boMau, docGoiMau, DUONG_BO_NAP, THU_TU_LENH, thuTuLenh } from "./mau.fixture";
import { tinhSoDo } from "./so-do";

const TU = "2026-11-03T00:00:00Z";
const DEN = "2026-11-17T00:00:00Z";
/** Bộ mẫu nạp trước kỳ: mọi lần xác nhận lúc nạp đã cũ khi kỳ bắt đầu. */
const MAU_CU = boMau("2026-10-01T01:00:00.000Z");
const DANH_MUC = MAU_CU.danhMuc;

const dong = (rows: readonly DongSoDo[], ma: MetricCode) => rows.find((r) => r.ma === ma)!;
const tinh = (v: Partial<DauVaoSoDo>) => tinhSoDo({ tu: TU, den: DEN, hang: [], lead: [], danhMuc: DANH_MUC, ...v });
const hangMau = (maCan: string): HangVao => {
  const id = MAU_CU.maCuaHang.get(maCan);
  const h = MAU_CU.hang.find((x) => x.id === id);
  assert.ok(h, `không có hàng mẫu ${maCan}`);
  return h;
};
/** Thêm sự kiện lên cuối một hàng (seq kế tiếp, người làm là người tạo hàng). */
function them(h: HangVao, ...ds: [EventType, Record<string, unknown>, string][]): HangVao {
  const events = [...h.events];
  for (const [type, payload, at] of ds) {
    const dau = events[0]!;
    events.push({ seq: events.length + 1, type, payload, actorUserId: dau.actorUserId, actorRoles: dau.actorRoles, confirmedWithOwner: type !== "details_changed" && type !== "created", occurredAt: at });
  }
  return { id: h.id, events };
}
const hangMoi = (id: string, at: string, unitNumber?: string): HangVao => ({
  id,
  events: [{ seq: 1, type: "created", payload: { buildingName: "Toà A", ...(unitNumber && { unitNumber }) }, actorUserId: "dau-chu-1", actorRoles: ["listing_agent"], confirmedWithOwner: false, occurredAt: at }],
});
const lead = (id: string, o: Partial<LeadVao>): LeadVao => ({
  id,
  createdAt: "2026-11-05T02:00:00.000Z",
  unitNumber: null,
  outcome: "new",
  matchedAgentUserId: "dau-chu-1",
  routedAt: null,
  acceptedAt: null,
  firstCalledAt: null,
  boardAt: null,
  returnedAt: null,
  resubmittedAt: null,
  discardedAt: null,
  ...o,
});
const sauPhut = (iso: string, phut: number) => new Date(Date.parse(iso) + phut * 60_000).toISOString();

// ---- E1 · AC-1 ----

const DUONG_THAM_CHIEU = fileURLToPath(new URL("../../../../docs/product/tham-chieu.md", import.meta.url));
const SHEET_CU = "Số ngày Sheet cũ không được sửa";

/** Ô «Số đo» của bảng «Đo trong hai tuần thử» ở §11, theo thứ tự: các dòng bảng liền nhau, bỏ dòng tiêu đề và dòng kẻ. */
function oThamChieu(md: string): string[] {
  const dongs = md.slice(md.indexOf("**Đo trong hai tuần thử**")).split("\n");
  const dau = dongs.findIndex((l) => l.startsWith("|"));
  const het = dongs.findIndex((l, i) => i > dau && !l.startsWith("|"));
  return dongs.slice(dau + 2, het).map((l) => l.split("|")[1]!.trim());
}

/** Chỗ lệch giữa danh sách số đo và các ô §11 (trừ Sheet cũ); rỗng là khớp. */
function choLech(ds: readonly MucDanhSach[], cells: readonly string[]): string[] {
  const lech: string[] = [];
  const oCuaMa = [...new Set(ds.map((m) => m.o))];
  for (const o of oCuaMa) if (!cells.includes(o)) lech.push(`mã trỏ ô không có trong §11: «${o}»`);
  for (const c of cells) {
    const manh = ds.filter((m) => m.o === c).map((m) => m.manh);
    if (!manh.length) lech.push(`ô §11 không mã nào đo: «${c}»`);
    else if (JSON.stringify(c.split(/[;,] /)) !== JSON.stringify(manh)) lech.push(`mảnh của ô «${c}» không ghép lại đúng ô: ${JSON.stringify(manh)}`);
  }
  if (ds.some((m) => m.o === SHEET_CU)) lech.push("mã trỏ dòng Sheet cũ");
  return lech;
}

test("danh sách: khớp từng ô Số đo của Tham chiếu §11", () => {
  const tatCa = oThamChieu(readFileSync(DUONG_THAM_CHIEU, "utf8"));
  assert.equal(tatCa.length, 9, "bảng §11 có 9 dòng số đo");
  assert.ok(tatCa.includes(SHEET_CU));
  const cells = tatCa.filter((c) => c !== SHEET_CU);
  assert.equal(cells.length, 8);
  assert.deepEqual([...new Set(DANH_SACH_SO_DO.map((m) => m.o))].sort(), [...cells].sort());
  assert.deepEqual(choLech(DANH_SACH_SO_DO, cells), []);
  // Chiều đỏ trên cùng ô: một mảnh đổi chữ, một mã trỏ ô lạ → máy gọi tên đúng ô lệch.
  const sai = DANH_SACH_SO_DO.map((m) => (m.ma === "lead_to_ready" ? { ...m, manh: "số ngày lead → Đang bán" } : m));
  const oLead = "Thời gian lead → cuộc gọi đầu; số ngày lead → Sẵn sàng bán; số lead trùng bị chặn";
  assert.deepEqual(choLech(sai, cells), [
    `mảnh của ô «${oLead}» không ghép lại đúng ô: ${JSON.stringify(["Thời gian lead → cuộc gọi đầu", "số ngày lead → Đang bán", "số lead trùng bị chặn"])}`,
  ]);
  const la = [...DANH_SACH_SO_DO, { ma: "mobile_offline" as const, o: "Số lần khách gọi lại", manh: "Số lần khách gọi lại", traLoi: "?" }];
  assert.deepEqual(choLech(la, cells), ["mã trỏ ô không có trong §11: «Số lần khách gọi lại»"]);
});

test("danh sách: một dòng mỗi mã, theo thứ tự §11", () => {
  const rows = tinh({});
  assert.equal(rows.length, 13);
  assert.equal(new Set(rows.map((r) => r.ma)).size, 13);
  const cells = oThamChieu(readFileSync(DUONG_THAM_CHIEU, "utf8")).filter((c) => c !== SHEET_CU);
  const thuTuO = [...new Set(rows.map((r) => DANH_SACH_SO_DO.find((m) => m.ma === r.ma)!.o))];
  assert.deepEqual(thuTuO, cells);
});

// ---- E2 · AC-2 ----

test("xác nhận trong N ngày: ranh 14 ngày", () => {
  const hang = [
    them(hangMau("A-04.06"), ["owner_confirmed", {}, "2026-11-04T05:00:00.000Z"]), // 13 ngày trước den
    them(hangMau("A-06.03"), ["owner_confirmed", {}, "2026-11-03T05:00:00.000Z"]), // 14 ngày
    hangMau("A-08.03"), // chưa xác nhận từ lúc nạp (47 ngày)
    them(hangMau("A-10.05"), ["owner_confirmed", {}, "2026-11-12T05:00:00.000Z"]), // 5 ngày
    them(hangMau("A-01.03"), ["owner_confirmed", {}, "2026-11-16T05:00:00.000Z"]), // Đã bán
    them(hangMau("A-01.05"), ["owner_confirmed", {}, "2026-11-16T05:00:00.000Z"]), // Ngừng bán
  ];
  const r14 = dong(tinh({ hang }), "confirmed_within_n_days");
  assert.ok(r14.trangThai === "do-duoc" && r14.kieu === "ti-le");
  assert.equal(r14.mau, 4, "Đã bán và Ngừng bán không vào mẫu số");
  assert.equal(r14.tu, 2, "căn 13 ngày và căn 5 ngày vào; căn 14 ngày không vào");
  assert.deepEqual(r14.theoTrangThai, { Active: { tu: 2, mau: 4 } });
  const r7 = dong(tinh({ hang, soNgayXacNhan: 7 }), "confirmed_within_n_days");
  assert.ok(r7.trangThai === "do-duoc" && r7.kieu === "ti-le");
  assert.deepEqual([r7.tu, r7.mau], [1, 4]);
  // Đối chiếu với freshness: căn mở vào tử số đúng khi không «cần gọi lại».
  const mo = hang.map((h) => foldListing(h.events)).filter((s) => s.standardStatus === "Active");
  const theoFreshness = mo.filter((s) => {
    const f = freshness(s.lastConfirmedAt, DEN.slice(0, 10));
    return f.confirmed && !f.needsCallBack;
  }).length;
  assert.equal(theoFreshness, r14.tu);
});

// ---- E3 · AC-3 ----

test("mức đủ cao nhất: chỉ hàng đủ năm mục", () => {
  const hang = [
    them(hangMau("A-04.06"), ["details_changed", { furnished: "Đủ đồ", financing: "Vay được" }, "2026-11-05T01:00:00.000Z"]),
    them(hangMau("A-06.03"), ["details_changed", { furnished: "Đủ đồ" }, "2026-11-05T01:00:00.000Z"]),
    them(hangMoi("H-moi", "2026-11-04T01:00:00.000Z", "A-09.05"), ["details_changed", { furnished: "Đủ đồ", legalStatus: "Sổ hồng", financing: "Vay được", occupantType: "Chủ ở" }, "2026-11-05T01:00:00.000Z"]),
  ];
  assert.deepEqual(hang.map((h) => completeness(foldListing(h.events)).filled), [5, 4, 4]);
  const r = dong(tinh({ hang }), "top_completeness");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "ti-le");
  assert.deepEqual([r.tu, r.mau], [1, 3], "chỉ hàng đủ năm mục vào tử số");
});

test("mức đủ cao nhất: mẫu 0", () => {
  const r = dong(tinh({ hang: [hangMau("A-01.03"), hangMau("A-01.05")] }), "top_completeness");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "ti-le");
  assert.equal(r.mau, 0);
  assert.strictEqual(r.phanTram, null);
});

// ---- E4 · AC-4 ----

const canThu = (unitNumber: string, upi: string): CatalogUnitData => ({
  upi,
  unitNumber,
  stack: null,
  floor: null,
  livingArea: 60,
  bedroomsTotal: 2,
  directionFaces: "Đông",
  propertyType: "Residential",
  propertySubType: "Condominium",
});
/** Danh mục mẫu cộng một dự án thử có căn «1206» ở hai toà (như ca của hàng 63). */
const DANH_MUC_TRUNG: CatalogData = {
  ...DANH_MUC,
  subdivisions: [
    ...DANH_MUC.subdivisions,
    {
      subdivisionKey: "mau-trung-ma",
      subdivisionName: "[Mẫu] Dự án trùng mã",
      complexName: null,
      buildings: [
        { buildingKey: "A1", buildingName: "[Mẫu] Toà A1", units: [canThu("1206", "urn:onehub:upi:thu:trung:A1-1206")] },
        { buildingKey: "A2", buildingName: "[Mẫu] Toà A2", units: [canThu("1206", "urn:onehub:upi:thu:trung:A2-1206")] },
      ],
    },
  ],
};

test("mã tự điền: tra bằng lookupUnit của lõi", () => {
  const ngay = "2026-11-05T01:00:00.000Z";
  const hang = [
    hangMoi("P1", ngay, "A-02.06"), // có trong danh mục
    hangMoi("P2", ngay, "a-02.06"), // viết thường, cùng căn
    hangMoi("P3", ngay, "C-01.01"), // ngoài danh mục
    them(hangMoi("P4", ngay), ["unit_number_assigned", { unitNumber: "A-05.06" }, "2026-11-06T01:00:00.000Z"]), // gắn mã sau
    hangMoi("P5", ngay, "1206"), // nhiều căn
    hangMoi("P6", ngay), // không mã
    hangMoi("P7", "2026-10-20T01:00:00.000Z", "A-03.05"), // gõ trước kỳ
  ];
  const leads = [lead("L1", { unitNumber: "A-12.06" }), lead("L2", { unitNumber: null })];
  const r = dong(tinh({ hang, lead: leads, danhMuc: DANH_MUC_TRUNG }), "unit_code_autofill");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "ti-le");
  assert.deepEqual([r.tu, r.mau], [4, 6]);
  assert.deepEqual(r.chiTiet, { found: 4, ambiguous: 1, not_in_catalog: 1, unreadable: 0 }, "«nhiều căn» là hụt, đếm riêng");
});

// ---- E5 · AC-5 ----

const T = "2026-11-05T02:00:00.000Z";
const leadGoi = [
  lead("g5", { firstCalledAt: sauPhut(T, 5) }),
  lead("g3", { firstCalledAt: sauPhut(T, 3) }),
  lead("g12", { firstCalledAt: sauPhut(T, 12) }),
  lead("chua", { matchedAgentUserId: null }),
  lead("sauDen", { firstCalledAt: "2026-11-17T01:00:00.000Z" }),
  lead("canTrung", { outcome: "unit_has_open_listing", firstCalledAt: sauPhut(T, 1) }),
  lead("daBo", { outcome: "unit_has_open_listing", discardedAt: sauPhut(T, 2), firstCalledAt: sauPhut(T, 1) }),
  lead("traLai", { returnedAt: sauPhut(T, 60) }),
];

test("lead → cuộc gọi đầu: thời lượng và trung vị", () => {
  const r = dong(tinh({ lead: leadGoi }), "lead_to_first_call");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "thoi-luong");
  assert.deepEqual(
    { donVi: r.donVi, n: r.n, giaTri: r.giaTri, trungVi: r.trungVi, chua: r.chua, chiTiet: r.chiTiet },
    { donVi: "phut", n: 3, giaTri: [3, 5, 12], trungVi: 5, chua: 3, chiTiet: { chuaChia: 1, daChia: 1, traLai: 1 } },
    "căn trùng và lead đã bỏ không vào; gọi sau den là chưa",
  );
  const chan = dong(tinh({ lead: [...leadGoi, lead("g8", { firstCalledAt: sauPhut(T, 8) })] }), "lead_to_first_call");
  assert.ok(chan.trangThai === "do-duoc" && chan.kieu === "thoi-luong");
  assert.deepEqual([chan.giaTri, chan.trungVi], [[3, 5, 8, 12], 6.5]);
});

test("lead → Sẵn sàng bán: ngày", () => {
  const ds = [
    lead("b2", { firstCalledAt: sauPhut(T, 5), boardAt: sauPhut(T, 2 * 1440) }),
    lead("b55", { firstCalledAt: sauPhut(T, 5), boardAt: sauPhut(T, 5.5 * 1440) }),
    lead("bSau", { firstCalledAt: sauPhut(T, 5), boardAt: "2026-11-18T00:00:00.000Z" }),
  ];
  const r = dong(tinh({ lead: ds }), "lead_to_ready");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "thoi-luong");
  assert.deepEqual([r.donVi, r.giaTri, r.trungVi, r.chua], ["ngay", [2, 5.5], 3.75, 1]);
  const rong = dong(tinh({}), "lead_to_ready");
  assert.ok(rong.trangThai === "do-duoc" && rong.kieu === "thoi-luong");
  assert.strictEqual(rong.trungVi, null);
});

// ---- E6 · AC-6 ----

test("lead trùng bị chặn: tách căn và chủ", () => {
  const ds = [
    lead("c1", { outcome: "unit_has_open_listing" }),
    lead("c2", { outcome: "unit_has_open_listing" }),
    lead("o1", { outcome: "owner_has_agent" }),
    lead("n1", {}),
    lead("n2", {}),
    lead("n3", {}),
    lead("cTruoc", { outcome: "unit_has_open_listing", createdAt: "2026-11-02T23:59:59.000Z" }),
    lead("oDen", { outcome: "owner_has_agent", createdAt: "2026-11-17T00:00:00.000Z" }),
  ];
  const r = dong(tinh({ lead: ds }), "duplicate_leads_blocked");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem");
  assert.deepEqual({ so: r.so, chiTiet: r.chiTiet }, { so: 3, chiTiet: { unit_has_open_listing: 2, owner_has_agent: 1 } });
});

// ---- E7 · AC-7 ----

test("đợt hai: căn ở nhóm điều chỉnh giá lúc gọi", () => {
  const goi = them(
    hangMau("A-04.06"),
    ["price_changed", { listPrice: 3_900_000_000, feeInclusion: "excluded" }, "2026-10-25T03:00:00.000Z"],
    ["owner_confirmed", {}, "2026-11-06T03:00:00.000Z"], // 12 ngày sau mốc → trong nhóm
    ["owner_confirmed", {}, "2026-11-07T03:00:00.000Z"],
    ["price_changed", { listPrice: 3_800_000_000, feeInclusion: "excluded" }, "2026-11-08T03:00:00.000Z"],
  );
  const moi = them(
    hangMau("A-06.03"),
    ["price_changed", { listPrice: 2_900_000_000, feeInclusion: "excluded" }, "2026-11-01T03:00:00.000Z"],
    ["price_changed", { listPrice: 2_800_000_000, feeInclusion: "excluded" }, "2026-11-06T03:00:00.000Z"], // 5 ngày sau mốc
  );
  const giu = them(hangMau("B-01.04"), ["owner_confirmed", {}, "2026-11-06T03:00:00.000Z"]); // Tạm giữ, mốc 36 ngày
  assert.equal(foldListing(giu.events).standardStatus, "Hold");
  const so = (nguong?: number) => {
    const r = dong(tinh({ hang: [goi, moi, giu], nguongDieuChinhGia: nguong }), "price_adjustment_calls");
    assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem");
    return r.so;
  };
  assert.equal(so(), 1, "chỉ căn qua ngưỡng 10 ngày được đếm, một lần dù gọi ba lần");
  assert.equal(so(5), 2, "ngưỡng 5: căn 5 ngày vào nhóm");
  // Đối chiếu với luật nhóm của Hôm nay: trạng thái ngay trước lần gọi đầu trong kỳ.
  const truoc = goi.events.filter((e) => e.occurredAt < "2026-11-06T03:00:00.000Z");
  const s = foldListing(truoc);
  const gia = truoc.filter((e) => e.type === "price_changed").at(-1)!;
  const nhom = nhomCuaCan(
    boMacDinh(),
    { standardStatus: s.standardStatus, listAgentKey: "dau-chu-1", lastConfirmedAt: s.lastConfirmedAt, priceChangeTimestamp: gia.occurredAt, lastPriceChange: null, lastStatusChange: null, missing: completeness(s).missing, propertySubType: null },
    "dau-chu-1",
    "2026-11-06T03:00:00.000Z",
  );
  assert.equal(nhom?.code, "price_adjustment");
});

// ---- E8 · AC-8 ----

const SAU_MA_THIEU = ["inquiry_to_send", "sheet_publishes", "customer_link_opens", "customer_interest", "actions_by_device_role", "mobile_offline"];

test("chưa có sự kiện: sáu mã nói rõ thiếu gì", () => {
  const mau = boMau("2026-11-03T01:00:00.000Z");
  for (const rows of [tinh({}), tinh({ hang: mau.hang, lead: mau.lead })]) {
    const thieu = rows.filter((r) => r.trangThai === "chua-co-su-kien");
    assert.deepEqual(thieu.map((r) => r.ma).sort(), [...SAU_MA_THIEU].sort());
    for (const r of thieu) {
      assert.ok(r.trangThai === "chua-co-su-kien" && r.thieu.trim().length > 0, `${r.ma}: thiếu câu «thiếu»`);
      for (const k of ["so", "tu", "mau", "trungVi", "n"]) assert.ok(!(k in r), `${r.ma} không được mang số (${k})`);
    }
  }
  for (const r of tinh({})) {
    if (SAU_MA_THIEU.includes(r.ma)) continue;
    assert.equal(r.trangThai, "do-duoc", `${r.ma} đo được trên đầu vào rỗng`);
    if (r.trangThai !== "do-duoc") continue;
    if (r.kieu === "ti-le") assert.equal(r.mau, 0);
    if (r.kieu === "dem") assert.equal(r.so, 0);
    if (r.kieu === "thoi-luong") assert.equal(r.n, 0);
  }
});

// ---- E9 · AC-9 ----

test("bộ mẫu hàng 5: số ghim", () => {
  const mau = boMau("2026-11-03T01:00:00.000Z");
  for (const h of mau.hang) for (const e of h.events) assert.deepEqual(validatePayload(e.type, e.payload), [], `${h.id} seq ${e.seq}`);
  const vao = { hang: mau.hang, lead: mau.lead, danhMuc: mau.danhMuc };
  const rows = tinh(vao);
  const so = (ma: MetricCode) => dong(rows, ma) as Extract<DongSoDo, { trangThai: "do-duoc" }>;
  const tl = (ma: MetricCode) => {
    const r = so(ma);
    assert.ok(r.kieu === "ti-le");
    return [r.tu, r.mau];
  };
  assert.deepEqual(tl("confirmed_within_n_days"), [0, 30]);
  assert.deepEqual(tl("top_completeness"), [0, 30]);
  assert.deepEqual(tl("unit_code_autofill"), [47, 47]);
  const trung = so("duplicate_leads_blocked");
  assert.ok(trung.kieu === "dem");
  assert.deepEqual([trung.so, trung.chiTiet], [2, { unit_has_open_listing: 1, owner_has_agent: 1 }]);
  const goi = so("lead_to_first_call");
  assert.ok(goi.kieu === "thoi-luong");
  assert.deepEqual([goi.n, goi.chua, goi.chiTiet], [0, 11, { chuaChia: 10, daChia: 1, traLai: 0 }]);
  const dotHai = so("price_adjustment_calls");
  assert.ok(dotHai.kieu === "dem");
  assert.equal(dotHai.so, 0);
  const homSau = dong(tinh({ ...vao, den: "2026-11-04T00:00:00Z" }), "confirmed_within_n_days");
  assert.ok(homSau.trangThai === "do-duoc" && homSau.kieu === "ti-le");
  assert.deepEqual([homSau.tu, homSau.mau], [30, 30], "ngày sau ngày nạp: mọi hàng mở vừa xác nhận");
  assert.deepEqual(tinh(vao), rows, "hai lần tính ra cùng kết quả");
});

test("bộ mẫu: không thông tin chủ nhà", () => {
  const mau = boMau("2026-11-03T01:00:00.000Z");
  const rows = tinh({ hang: mau.hang, lead: mau.lead });
  const khoa: string[] = [];
  const duyet = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(duyet);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        khoa.push(k);
        duyet(x);
      }
    }
  };
  duyet(rows);
  for (const k of SOURCE_KEYS) assert.ok(!khoa.includes(k), `đầu ra mang khoá chủ nhà ${k}`);
  const chu = JSON.stringify(rows);
  assert.doesNotMatch(chu, /0900\s?000\s?0\d\d/);
  // Đối chứng: số chủ nhà có trong gói mẫu — phép dò số không mù.
  assert.match(JSON.stringify(docGoiMau().chuNha), /0900\s?000\s?0\d\d/);
});

test("bộ mẫu: bộ chuyển theo bộ nạp", () => {
  const boNap = readFileSync(DUONG_BO_NAP, "utf8");
  const boChuyen = readFileSync(fileURLToPath(new URL("./mau.fixture.ts", import.meta.url)), "utf8");
  assert.deepEqual(thuTuLenh(boNap), [...THU_TU_LENH], "bộ nạp đổi chuỗi lệnh — sửa bộ chuyển cho khớp");
  assert.deepEqual(thuTuLenh(boChuyen), [...THU_TU_LENH], "bộ chuyển lệch chuỗi lệnh của bộ nạp");
  // Chiều đỏ: bộ nạp thêm một lệnh → thứ tự lệnh lệch.
  const napDoi = boNap.replace('await lenh({ type: "status_changed", payload: { to: "Active" } });', 'await lenh({ type: "status_changed", payload: { to: "Active" } });\n        await lenh({ type: "owner_confirmed", payload: {} });');
  assert.notEqual(napDoi, boNap, "bản sao nguồn bộ nạp phải thật sự đổi");
  assert.notDeepEqual(thuTuLenh(napDoi), [...THU_TU_LENH], "bộ nạp thêm owner_confirmed thì ca gác phải lệch");
});

// ---- E10 · AC-10 ----

test("kỳ đo: nửa mở và gấp tới den", () => {
  const hang = [
    them(
      hangMau("A-04.06"),
      ["status_changed", { to: "Closed", closePrice: 4_000_000_000, closeDate: "2026-11-17" }, DEN.replace("Z", ".000Z")],
      ["details_changed", { furnished: "Đủ đồ", financing: "Vay được" }, "2026-11-17T05:00:00.000Z"],
    ),
    hangMoi("tai-tu", "2026-11-03T00:00:00.000Z", "A-02.06"),
    hangMoi("tai-den", "2026-11-17T00:00:00.000Z", "A-03.05"),
  ];
  const rows = tinh({ hang });
  const xn = dong(rows, "confirmed_within_n_days");
  assert.ok(xn.trangThai === "do-duoc" && xn.kieu === "ti-le");
  assert.deepEqual(xn.theoTrangThai, { Active: { tu: 0, mau: 1 }, Incomplete: { tu: 0, mau: 1 } }, "đổi Đã bán đúng lúc den chưa tính; hàng tạo lúc den không vào");
  const du = dong(rows, "top_completeness");
  assert.ok(du.trangThai === "do-duoc" && du.kieu === "ti-le");
  assert.equal(du.tu, 0, "chi tiết ghi sau den không đổi mức đủ");
  const td = dong(rows, "unit_code_autofill");
  assert.ok(td.trangThai === "do-duoc" && td.kieu === "ti-le");
  assert.deepEqual([td.tu, td.mau], [1, 1], "mã gõ lúc tu vào, lúc den không vào");
});

test("kỳ đo: không đọc đồng hồ", () => {
  const mau = boMau("2026-11-03T01:00:00.000Z");
  const vao = { hang: mau.hang, lead: mau.lead };
  const truoc = tinh(vao);
  mock.timers.enable({ apis: ["Date"], now: Date.parse("2030-01-01T00:00:00Z") });
  try {
    assert.equal(new Date().getUTCFullYear(), 2030);
    assert.deepEqual(tinh(vao), truoc);
  } finally {
    mock.timers.reset();
  }
});

// Mọi sự kiện thêm trong ca kiểm cũng qua khuôn chặt của lõi.
test("ca kiểm: sự kiện thêm qua khuôn chặt", () => {
  const ds: readonly ListingEvent[] = them(hangMau("A-04.06"), ["owner_confirmed", {}, T], ["details_changed", { furnished: "Đủ đồ" }, T]).events;
  for (const e of ds) assert.deepEqual(validatePayload(e.type, e.payload), []);
});
