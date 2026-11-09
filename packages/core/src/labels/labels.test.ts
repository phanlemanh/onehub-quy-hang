// Cách gọi riêng (hàng 45): kiểm nhãn, dựng dòng, từ vựng của sàn, phần ra ngoài (E3, E7, E10b).
import assert from "node:assert/strict";
import { test } from "node:test";
import { FIELD_CLASS } from "../import/fields";
import { PROPERTY_SUBTYPE_FIELDS } from "../catalog/property-type";
import { truongRa, TRUONG_RA } from "../redaction";
import {
  bangNhan,
  boTuVung,
  doiNhan,
  DS_TRUONG_DAT_TEN,
  dungDongNhan,
  TAP_DONG,
  DS_TRUONG_DONG,
  trungTenGiaTri,
  kiemNhanGiaTri,
  kiemNhanTruong,
  lopTruongDatTen,
  nhanGiaTri,
  nhanTruong,
  TRUONG_DAT_TEN,
  tuVungRaNgoai,
  tuVungTuBang,
  type TruongDatTen,
  type TuVung,
} from "./index";

test("từ vựng: kiểm giá trị riêng", () => {
  // Bảng viết trước — mỗi dòng: [trường, neo, nhãn, kỳ vọng: true = ok | chuỗi phải có trong lỗi].
  const bang: [unknown, unknown, unknown, true | string][] = [
    ["feeInclusion", "included", "BP", true],
    ["feeInclusion", undefined, "BP", "labels.value.feeInclusion: thiếu giá trị chuẩn để neo"],
    ["feeInclusion", "maybe", "BP", "không thuộc included, excluded"],
    ["withdrawnReason", "unreachable", "Mất liên lạc", true],
    ["listPrice", "x", "Giá", "labels.value.listPrice: không phải trường có tập giá trị đóng"],
    ["standardStatus", "Active", "Đang rao", "labels.value.standardStatus: không phải trường có tập giá trị đóng"],
    ["feeInclusion", "excluded", "   ", "chữ rỗng"],
  ];
  let dem = 0;
  for (const [truong, neo, nhan, ky] of bang) {
    const kq = kiemNhanGiaTri(truong, neo, nhan);
    if (ky === true) assert.equal(kq.ok, true, `${String(truong)}/${String(neo)}`);
    else {
      assert.equal(kq.ok, false, `${String(truong)}/${String(neo)} phải lỗi`);
      assert.ok(!kq.ok && kq.loi.includes(ky), `${String(truong)}/${String(neo)}: ${!kq.ok ? kq.loi : ""}`);
    }
    dem++;
  }
  assert.equal(dem, 7);
  // Hai giá trị cùng chữ trong một trường là lỗi trùng.
  const trung = dungDongNhan({ fields: [], values: [{ field: "feeInclusion", value: "included", label: "BP" }, { field: "feeInclusion", value: "excluded", label: "bp" }] });
  assert.equal(trung.ok, false);
  assert.ok(!trung.ok && trung.loi.includes("Trùng tên của «"), !trung.ok ? trung.loi : "");
});

test("từ vựng: kiểm tên trường — dài, số điện thoại, email", () => {
  assert.deepEqual(kiemNhanTruong("feeInclusion", "  Phí CN "), { ok: true, nhan: "Phí CN" });
  const bang: [unknown, unknown, string][] = [
    ["feeInclusion", "x".repeat(41), "dài hơn 40"],
    ["feeInclusion", "Gọi 0900 000 001", "số điện thoại"],
    ["feeInclusion", "[Tên]@vidu.vn", "email"],
    ["ownerPhone", "Số chủ", "không phải trường đổi tên được"],
  ];
  for (const [f, nhan, ky] of bang) {
    const kq = kiemNhanTruong(f, nhan);
    assert.ok(!kq.ok && kq.loi.includes(ky), `${String(f)}: ${kq.ok ? "ok" : kq.loi}`);
  }
  assert.equal(kiemNhanTruong("feeInclusion", "x".repeat(40)).ok, true);
});

test("từ vựng: dựng dòng nguyên khối", () => {
  const kq = dungDongNhan({
    fields: [{ field: "feeInclusion", label: "Phí CN" }],
    values: [{ field: "feeInclusion", value: "included", label: "BP" }],
  });
  assert.deepEqual(kq, { ok: true, dong: [{ key: "labels.field.feeInclusion", value: "Phí CN" }, { key: "labels.value.feeInclusion", value: { included: "BP" } }] });
  // Một ô sai thì cả bộ sai, lỗi nêu khoá.
  const sai = dungDongNhan({ fields: [{ field: "feeInclusion", label: "Phí CN" }], values: [{ field: "feeInclusion", value: "maybe", label: "BP" }] });
  assert.ok(!sai.ok && sai.loi.startsWith("labels.value.feeInclusion"), !sai.ok ? sai.loi : "");
  assert.deepEqual(dungDongNhan({ fields: [], values: [] }), { ok: true, dong: [] });
});

test("từ vựng: sàn chưa đặt", () => {
  assert.deepEqual(boTuVung([]), { tuVung: { truong: {}, giaTri: {} }, loi: [] });
  const { tuVung, loi } = boTuVung([
    { key: "labels.field.feeInclusion", value: "Phí CN" },
    { key: "labels.field.ownerPhone", value: "Số" },
    { key: "labels.field.livingArea", value: 12 },
    { key: "labels.value.feeInclusion", value: { included: "BP", maybe: "Có lẽ" } },
    { key: "labels.value.withdrawnReason", value: "không phải đối tượng" },
    { key: "lead_routing.strategy", value: "manual" },
  ]);
  assert.deepEqual(tuVung, { truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } });
  assert.equal(loi.length, 4, loi.join(" | "));
  for (const k of ["labels.field.ownerPhone", "labels.field.livingArea", "labels.value.feeInclusion", "labels.value.withdrawnReason"])
    assert.ok(loi.some((l) => l.startsWith(k)), k);
});

test("từ vựng: chữ hiện — tên riêng hay mặc định của mặt", () => {
  const tv: TuVung = { truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } };
  assert.equal(nhanTruong(tv, "feeInclusion", "Phí"), "Phí CN");
  assert.equal(nhanTruong(tv, "listPrice", "Giá"), "Giá");
  assert.equal(nhanTruong(null, "feeInclusion", "Phí"), "Phí");
  assert.equal(nhanGiaTri(tv, "feeInclusion", "included", "Bao phí"), "BP");
  assert.equal(nhanGiaTri(tv, "feeInclusion", "excluded", "Không bao phí"), "Không bao phí");
});

test("từ vựng: chỉ phần ra ngoài", () => {
  const day: TuVung = {
    truong: Object.fromEntries(DS_TRUONG_DAT_TEN.map((f) => [f, `Riêng ${f}`])) as Partial<Record<TruongDatTen, string>>,
    giaTri: { feeInclusion: { included: "BP", excluded: "KBP" }, withdrawnReason: { unreachable: "MOI-LYDO" } },
  };
  // Tập viết trước: giao các trường với khoá ra của từng người nhận.
  const KY: Record<string, string[]> = {
    khach_rieng: ["buildingName", "unitNumber", "livingArea", "floor", "directionFaces", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType"],
    nhom_moi_gioi: ["buildingName", "unitNumber", "livingArea", "floor", "directionFaces", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType"],
  };
  for (const nn of Object.keys(TRUONG_RA) as (keyof typeof TRUONG_RA)[]) {
    const ra = tuVungRaNgoai(day, TRUONG_RA[nn]);
    assert.deepEqual(Object.keys(ra.truong).sort(), [...KY[nn]!].sort(), nn);
    assert.deepEqual(ra.giaTri, { feeInclusion: { included: "BP", excluded: "KBP" } }, nn);
    for (const cam of ["withdrawnReason", "closePrice", "closeDate", "standardStatus"]) assert.ok(!(cam in ra.truong), `${nn}: ${cam}`);
    assert.ok(!JSON.stringify(ra).includes("MOI-LYDO"), nn);
  }
  // Đối chứng dương: bản sao khoá ra của nhóm môi giới lỡ chứa closePrice → phép đo bắt đúng khoá ấy.
  const loRa = tuVungRaNgoai(day, [...TRUONG_RA.nhom_moi_gioi, "closePrice"]);
  assert.deepEqual(Object.keys(loRa.truong).filter((k) => !KY.nhom_moi_gioi!.includes(k)), ["closePrice"]);
  // Khách riêng ẩn mã căn: tập khoá thật bỏ mã căn → nhãn mã căn cũng không đi.
  const an = tuVungRaNgoai(day, truongRa("khach_rieng", { showConfirmedAge: true, privateHidesUnitNumber: true }));
  assert.ok(!("unitNumber" in an.truong));
  assert.deepEqual(tuVungRaNgoai(null, TRUONG_RA.khach_rieng), { truong: {}, giaTri: {} });
});

test("từ vựng: không trường source nào đổi tên được", () => {
  const nguon = (ds: readonly string[]) => ds.filter((f) => (FIELD_CLASS as Record<string, string>)[f] === "source");
  assert.deepEqual(nguon(DS_TRUONG_DAT_TEN), []);
  for (const f of DS_TRUONG_DAT_TEN) assert.notEqual(lopTruongDatTen(f), "source", f);
  // Đối chứng dương: bộ kiểm bắt khi bản sao danh sách chèn ownerPhone.
  assert.deepEqual(nguon([...Object.keys(TRUONG_DAT_TEN), "ownerPhone"]), ["ownerPhone"]);
});

test("từ vựng: trùng mặc định, null, khoá đổi, đọc ngược bảng", () => {
  // Gõ đúng chữ mặc định = mặc định: không dòng.
  assert.deepEqual(
    dungDongNhan({ fields: [{ field: "feeInclusion", label: "Điều kiện phí" }], values: [{ field: "feeInclusion", value: "included", label: "Bao phí" }] }),
    { ok: true, dong: [] },
  );
  // null = đã trả về mặc định: chưa đặt, không lỗi.
  assert.deepEqual(boTuVung([{ key: "labels.field.feeInclusion", value: null }, { key: "labels.value.feeInclusion", value: null }]), {
    tuVung: { truong: {}, giaTri: {} },
    loi: [],
  });
  // Bảng bốn dòng: mới, đổi, giữ nguyên, bỏ → null; khoá đã null mà vẫn vắng → không ghi lại.
  const daLuu = [
    { key: "labels.field.legalStatus", value: "Sổ" },
    { key: "labels.field.furnished", value: "NT" },
    { key: "labels.field.floor", value: "Lầu" },
    { key: "labels.field.financing", value: null },
    { key: "lead_routing.strategy", value: "manual" },
  ];
  const moi = [
    { key: "labels.field.feeInclusion", value: "Phí CN" },
    { key: "labels.field.legalStatus", value: "Sổ hồng" },
    { key: "labels.field.furnished", value: "NT" },
  ];
  assert.deepEqual(doiNhan(daLuu, moi), [
    { key: "labels.field.feeInclusion", value: "Phí CN" },
    { key: "labels.field.legalStatus", value: "Sổ hồng" },
    { key: "labels.field.floor", value: null },
  ]);
  // Map giá trị riêng: thứ tự khoá jsonb trả về khác thân gửi — không phải thay đổi (S4-r1 t3); đổi chữ thì vẫn là thay đổi.
  const luuMap = [{ key: "labels.value.feeInclusion", value: { excluded: "KBP", included: "BP" } }];
  assert.deepEqual(doiNhan(luuMap, [{ key: "labels.value.feeInclusion", value: { included: "BP", excluded: "KBP" } }]), []);
  assert.deepEqual(doiNhan(luuMap, [{ key: "labels.value.feeInclusion", value: { included: "BP", excluded: "KP" } }]), [
    { key: "labels.value.feeInclusion", value: { included: "BP", excluded: "KP" } },
  ]);
  // Đọc ngược thân GET (dựng bằng đúng hàm bên ghi): ra lại từ vựng.
  const tv: TuVung = { truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } };
  assert.deepEqual(tuVungTuBang(JSON.parse(JSON.stringify(bangNhan(tv)))), tv);
  assert.deepEqual(tuVungTuBang(null), { truong: {}, giaTri: {} });
});

// ---- Chặn trùng tên giá trị (hàng chan-trung-ten-gia-tri: E1, E1b, E1c, E1d, E1e) ----
const boGT = (...v: [string, string, string][]) => ({ fields: [], values: v.map(([field, value, label]) => ({ field, value, label })) });
const loiCua = (kq: ReturnType<typeof dungDongNhan>) => (kq.ok ? "" : kq.loi);

test("trùng tên đang hiện: mọi cặp riêng–mặc định anh em của mọi tập đóng", () => {
  // Ma trận sinh từ TAP_DONG của lõi; tập mới chưa vào danh sách khẳng định thì ca đỏ.
  assert.deepEqual([...DS_TRUONG_DONG].sort(), ["feeInclusion", "nhomViec", "propertySubType", "withdrawnReason"], "tập đóng của lõi đổi — xét lại ma trận");
  const mo = (s: string) => `  ${s.toLocaleUpperCase("vi").replace(/ /g, "   ")} `;
  let dem = 0;
  let mong = 0;
  for (const truong of DS_TRUONG_DONG) {
    const tap = TAP_DONG[truong] as Record<string, string>;
    const neo = Object.keys(tap);
    mong += neo.length * (neo.length - 1);
    for (const a of neo)
      for (const b of neo) {
        if (a === b) continue;
        const kq = dungDongNhan(boGT([truong, a, mo(tap[b]!)]));
        assert.equal(kq.ok, false, `${truong}: ${a} lấy tên của ${b} phải bị chặn`);
        assert.ok(loiCua(kq).endsWith(`: Trùng tên của «${tap[b]}»`), `${truong} ${a}→${b}: ${loiCua(kq)}`);
        assert.equal(dungDongNhan(boGT([truong, a, `${tap[b]} riêng`])).ok, true, `${truong} ${a}: đối chứng không trùng`);
        dem++;
      }
  }
  assert.equal(dem, mong);
  assert.equal(dem, 50);
});

test("trùng tên đang hiện: riêng–riêng, hoa thường, đổi chéo, khác tập, đối chứng", () => {
  // E1b — hai tên riêng cùng một chữ lạ: lỗi nêu tên mặc định của anh em, không phải chữ trùng.
  const rr = dungDongNhan(boGT(["withdrawnReason", "owner_changed_mind", "Mất liên lạc"], ["withdrawnReason", "unreachable", "mất  LIÊN lạc"]));
  assert.ok(!rr.ok && /Trùng tên của «(Chủ đổi ý|Không liên lạc được)»$/.test(rr.loi), loiCua(rr));
  assert.ok(!loiCua(rr).includes("Mất liên lạc"), "câu lỗi phải nêu giá trị anh em, không lặp chữ gõ");
  assert.equal(trungTenGiaTri("withdrawnReason", { owner_changed_mind: "Mất liên lạc", unreachable: "Mất liên lạc" }).owner_changed_mind, "unreachable");
  assert.equal(trungTenGiaTri("withdrawnReason", { owner_changed_mind: "Mất liên lạc", unreachable: "Mất liên lạc" }).unreachable, "owner_changed_mind");
  const phi = dungDongNhan(boGT(["feeInclusion", "included", "Trọn gói"], ["feeInclusion", "excluded", "trọn GÓI"]));
  assert.ok(!phi.ok && phi.loi.includes("Trùng tên của «"), loiCua(phi));
  assert.equal(dungDongNhan(boGT(["feeInclusion", "included", "Trọn gói"], ["feeInclusion", "excluded", "Chưa gồm phí"])).ok, true);
  // E1c — bỏ hoa thường, dấu cách thừa.
  const BANG: [string, string, string, string][] = [
    ["feeInclusion", "excluded", "bao   PHÍ", "Bao phí"],
    ["feeInclusion", "excluded", "  Bao Phí ", "Bao phí"],
    ["feeInclusion", "included", "KHÔNG BAO PHÍ", "Không bao phí"],
  ];
  for (const [f, v, nhan, ten] of BANG) {
    const kq = dungDongNhan(boGT([f, v, nhan]));
    assert.ok(!kq.ok && kq.loi.endsWith(`Trùng tên của «${ten}»`), `${nhan}: ${loiCua(kq)}`);
  }
  assert.equal(dungDongNhan(boGT(["feeInclusion", "excluded", "Bao phí trọn"])).ok, true);
  // E1d — không trùng; đúng mặc định của chính nó; đổi chéo bị chặn (Hỏi-1).
  const khong = dungDongNhan(boGT(["feeInclusion", "excluded", "Phí ngoài"]));
  assert.deepEqual(khong, { ok: true, dong: [{ key: "labels.value.feeInclusion", value: { excluded: "Phí ngoài" } }] });
  assert.deepEqual(dungDongNhan(boGT(["feeInclusion", "included", "Bao phí"])), { ok: true, dong: [] });
  const cheo = dungDongNhan(boGT(["feeInclusion", "included", "Không bao phí"], ["feeInclusion", "excluded", "Bao phí"]));
  assert.ok(!cheo.ok && /Trùng tên của «(Bao phí|Không bao phí)»$/.test(cheo.loi), loiCua(cheo));
  // E1e — khác tập được trùng chữ.
  assert.equal(dungDongNhan(boGT(["withdrawnReason", "unreachable", "Bao phí"])).ok, true);
});

// ---- Loại hình trong Cách gọi (hàng loai-hinh-trong-cach-goi: E1, E3, E8) ----
/** Khoá thừa và khoá thiếu của tập tên so với bảng loại hình của lõi — bộ so của E1, chạy được trên bản sao hỏng. */
function lechLoaiHinh(tap: Record<string, string>): string[] {
  const bang = Object.keys(PROPERTY_SUBTYPE_FIELDS);
  return [...Object.keys(tap).filter((k) => !bang.includes(k)).map((k) => `thừa ${k}`), ...bang.filter((k) => !Object.hasOwn(tap, k)).map((k) => `thiếu ${k}`)];
}

test("loại hình: tập đóng khớp bảng loại hình của lõi", () => {
  const VIET_TRUOC: [string, string][] = [
    ["Condominium", "Căn hộ"],
    ["Townhouse", "Nhà phố"],
    ["Single Family Residence", "Biệt thự"],
    ["Unimproved Land", "Đất"],
  ];
  const tap = TAP_DONG.propertySubType as Record<string, string>;
  for (const [neo, ten] of VIET_TRUOC) assert.equal(tap[neo], ten, neo);
  assert.deepEqual(lechLoaiHinh(tap), []);
  // Chiều đỏ: bản sao có thêm một khoá ngoài bảng, và bản sao thiếu một khoá.
  assert.deepEqual(lechLoaiHinh({ ...tap, Shophouse: "Shophouse" }), ["thừa Shophouse"]);
  const thieu = { ...tap };
  delete thieu.Townhouse;
  assert.deepEqual(lechLoaiHinh(thieu), ["thiếu Townhouse"]);
  const bang = bangNhan(null);
  assert.deepEqual(bang.fields.filter((f) => f.field === "propertySubType").map((f) => f.default), ["Loại hình"]);
  assert.deepEqual(bang.values.filter((v) => v.field === "propertySubType").map((v) => [v.value, v.default]), VIET_TRUOC);
});

test("loại hình: riêng–riêng trùng tên bị từ chối, câu lỗi nêu tên mặc định của giá trị kia", () => {
  const kq = dungDongNhan(boGT(["propertySubType", "Townhouse", "Liền kề"], ["propertySubType", "Single Family Residence", "liền  KỀ"]));
  assert.ok(!kq.ok && /Trùng tên của «(Nhà phố|Biệt thự)»$/.test(kq.loi), loiCua(kq));
  assert.ok(!loiCua(kq).includes("Liền kề"), "câu lỗi không lặp chữ gõ");
  assert.equal(dungDongNhan(boGT(["propertySubType", "Townhouse", "Liền kề"], ["propertySubType", "Single Family Residence", "Dinh thự"])).ok, true, "đối chứng");
});

test("loại hình: chữ sai", () => {
  const NEO = "Single Family Residence";
  const BANG: [string, unknown, boolean, RegExp | null][] = [
    ["rỗng", "   ", false, /chữ rỗng$/],
    ["41 ký tự", "x".repeat(41), false, /dài hơn 40 ký tự$/],
    ["số điện thoại", "Gọi 0900 000 001", false, /chứa số điện thoại$/],
    ["40 ký tự", "x".repeat(40), true, null],
  ];
  for (const [ten, chu, dat, loi] of BANG) {
    const kq = kiemNhanGiaTri("propertySubType", NEO, chu);
    assert.equal(kq.ok, dat, ten);
    if (loi && !kq.ok) assert.match(kq.loi, loi, ten);
  }
  assert.equal(kiemNhanGiaTri("propertySubType", "Shophouse", "Shop").ok, false, "neo ngoài bốn giá trị RESO");
});

test("loại hình: không ra ngoài công ty", () => {
  const tv: TuVung = {
    truong: { propertySubType: "Dòng sản phẩm", feeInclusion: "Phí CN" },
    giaTri: { propertySubType: { Townhouse: "Liền kề" }, feeInclusion: { included: "BP" } },
  };
  const ra = tuVungRaNgoai(tv, ["propertySubType", "feeInclusion"]);
  assert.equal(Object.hasOwn(ra.truong, "propertySubType"), false, "tên trường");
  assert.equal(Object.hasOwn(ra.giaTri, "propertySubType"), false, "tên giá trị");
  // Đối chứng dương trên cùng dữ liệu: điều kiện phí vẫn đi.
  assert.equal(ra.truong.feeInclusion, "Phí CN");
  assert.deepEqual(ra.giaTri.feeInclusion, { included: "BP" });
});
