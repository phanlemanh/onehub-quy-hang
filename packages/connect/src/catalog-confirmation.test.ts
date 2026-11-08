import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dungBaoSai, dungKhungToa, dungThuocTinhCan } from "@quy-hang/core/confirmation";
import { z } from "zod";
import {
  danhMucDoiKhoaToa,
  danhMucDoiUpi,
  danhMucMau,
  dauBaoSai,
  dauKhungToa,
  dauThuocTinhCan,
  DUONG_MAU,
  MOI_SO_VA_CHU,
  nguCanhMau,
  TOA_MAU,
  UPI_MAU,
} from "../../core/src/confirmation/nen-thu.fixture";
import { CATALOG_CONFIRMATION_SCHEMA_VERSION, CatalogConfirmation, parseCatalogConfirmation } from "./catalog-confirmation";

const TEP_VI_DU = fileURLToPath(new URL("./catalog-confirmation.example.json", import.meta.url));

/** Ba sự kiện mẫu dựng bằng hàm của lõi trên danh mục mẫu, khoá bên nhận thử cố định — nguồn của tệp ví dụ. */
export function suKienMau(): Record<string, unknown>[] {
  const nc = nguCanhMau();
  const ra = [dungKhungToa(dauKhungToa(), nc), dungThuocTinhCan(dauThuocTinhCan(), nc), dungBaoSai(dauBaoSai(), nc)];
  return ra.map((kq) => {
    if (!kq.ok) throw new Error(JSON.stringify(kq.loi));
    return kq.suKien as unknown as Record<string, unknown>;
  });
}

/** Đi hết cây zod, gọi `tham` ở mỗi nút kèm đường (khoá object; `[]` cho phần tử mảng, `|n` cho nhánh hợp). */
function diCay(s: z.ZodTypeAny, duong: string[], tham: (s: z.ZodTypeAny, duong: string[]) => void): void {
  tham(s, duong);
  if (s instanceof z.ZodEffects) diCay(s.innerType(), duong, tham);
  else if (s instanceof z.ZodDiscriminatedUnion) [...s.options.values()].forEach((o: z.ZodTypeAny) => diCay(o, duong, tham));
  else if (s instanceof z.ZodUnion) (s.options as z.ZodTypeAny[]).forEach((o, i) => diCay(o, [...duong, `|${i}`], tham));
  else if (s instanceof z.ZodObject) for (const [k, v] of Object.entries(s.shape)) diCay(v as z.ZodTypeAny, [...duong, k], tham);
  else if (s instanceof z.ZodArray) diCay(s.element, [...duong, "[]"], tham);
  else if (s instanceof z.ZodNullable || s instanceof z.ZodOptional) diCay(s.unwrap(), duong, tham);
}

/** Mọi ZodString không có kiểm regex nào, kèm đường. */
function chuoiThieuMau(s: z.ZodTypeAny): { tong: number; thieu: string[] } {
  let tong = 0;
  const thieu: string[] = [];
  diCay(s, [], (n, duong) => {
    if (n instanceof z.ZodString) {
      tong++;
      if (!n._def.checks.some((c) => c.kind === "regex")) thieu.push(duong.join(".") || "(gốc)");
    }
  });
  return { tong, thieu };
}

/** Mọi ZodObject kèm đường và chế độ khoá lạ. */
function cacDoiTuong(s: z.ZodTypeAny): { duong: string[]; eventType: string; strict: boolean }[] {
  const ra: { duong: string[]; eventType: string; strict: boolean }[] = [];
  diCay(s, [], (n, duong) => {
    if (n instanceof z.ZodObject) {
      const et = n.shape["eventType"];
      ra.push({ duong, eventType: et instanceof z.ZodLiteral ? String(et.value) : "?", strict: n._def.unknownKeys === "strict" });
    }
  });
  return ra;
}

/** Mọi tên khoá object ở mọi cấp. */
function moiKhoa(s: z.ZodTypeAny): Set<string> {
  const ra = new Set<string>();
  diCay(s, [], (n) => {
    if (n instanceof z.ZodObject) for (const k of Object.keys(n.shape)) ra.add(k);
  });
  return ra;
}

test("khuôn v1: ba sự kiện của lõi đọc được", () => {
  assert.equal(CATALOG_CONFIRMATION_SCHEMA_VERSION, 1);
  const ba = suKienMau();
  assert.deepEqual(ba.map((e) => e["eventType"]), ["building_frame", "unit_attributes", "correction"]);
  for (const e of ba) {
    const r = parseCatalogConfirmation(e);
    assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
    if (r.ok) assert.deepEqual(r.event, e);
  }
});

test("tệp ví dụ trùng đầu ra hàm dựng", () => {
  assert.equal(readFileSync(TEP_VI_DU, "utf8"), JSON.stringify(suKienMau(), null, 2) + "\n");
});

test("phiên bản và loại sự kiện sai bị từ chối", () => {
  const [mau] = suKienMau();
  const maTran: [Record<string, unknown>, string][] = [
    [{ ...mau, schemaVersion: 0 }, "schemaVersion"],
    [{ ...mau, schemaVersion: 2 }, "schemaVersion"],
    [Object.fromEntries(Object.entries(mau ?? {}).filter(([k]) => k !== "schemaVersion")), "schemaVersion"],
    [{ ...mau, eventType: "listing_status" }, "eventType"],
  ];
  let dem = 0;
  for (const [e, duong] of maTran) {
    const r = parseCatalogConfirmation(e);
    assert.equal(r.ok, false, `${duong}: phải từ chối`);
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === duong), JSON.stringify(!r.ok && r.errors));
    dem++;
  }
  assert.equal(dem, 4);
});

test("mọi đối tượng của khuôn là strict", () => {
  const ds = cacDoiTuong(CatalogConfirmation);
  assert.equal(ds.length, 3, JSON.stringify(ds));
  for (const d of ds) assert.ok(d.strict, `${d.eventType} ${d.duong.join(".")}: không strict`);
});

test("không bao giờ có: khuôn từ chối khoá chèn ở mọi cấp", () => {
  const KHOA = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto", "closePrice", "standardStatus"];
  const theoLoai = new Map(suKienMau().map((e) => [e["eventType"] as string, e]));
  const capDo = cacDoiTuong(CatalogConfirmation);
  let dem = 0;
  for (const cap of capDo) {
    const mau = theoLoai.get(cap.eventType);
    assert.ok(mau, cap.eventType);
    assert.ok(parseCatalogConfirmation(mau).ok, `${cap.eventType}: đối chứng dương`);
    for (const k of KHOA) {
      // Mọi cấp hiện là gốc của từng loại (đường rỗng); cấp lồng sau này cũng đi qua đây vì danh sách rút từ cây.
      const chen = structuredClone(mau) as Record<string, unknown>;
      let dich: Record<string, unknown> = chen;
      for (const p of cap.duong) dich = dich[p] as Record<string, unknown>;
      dich[k] = "[Mồi]";
      const r = parseCatalogConfirmation(chen);
      assert.equal(r.ok, false, `${cap.eventType} · ${k}: phải từ chối`);
      assert.ok(
        !r.ok && r.errors.some((x) => x.path.join(".") === cap.duong.join(".") && x.message.includes(k)),
        `${cap.eventType} · ${k}: ${JSON.stringify(!r.ok && r.errors)}`,
      );
      dem++;
    }
  }
  assert.equal(dem, KHOA.length * capDo.length);
});

test("không chữ tự do: mọi chuỗi của khuôn có mẫu hoặc tập đóng", () => {
  const { tong, thieu } = chuoiThieuMau(CatalogConfirmation);
  assert.equal(tong, 19, "số chuỗi đếm được (4 vỏ × 3 + trục khung toà + 3 thuộc tính căn + 3 báo sai)");
  assert.deepEqual(thieu, []);
  // Đối chứng âm cùng hàm đếm.
  const thu = z.object({ a: z.string().regex(/^x$/), ghiChu: z.string() }).strict();
  assert.deepEqual(chuoiThieuMau(thu).thieu, ["ghiChu"]);
});

test("không chữ tự do: khuôn từ chối", () => {
  const [khung, can, baoSai] = suKienMau();
  const maTran: [Record<string, unknown>, string][] = [
    [{ ...can, unitNumber: "gọi chủ nhé" }, "unitNumber"],
    [{ ...can, unitNumber: "0900000071" }, "unitNumber"],
    [{ ...can, directionFaces: "Đông Nam view hồ" }, "directionFaces"],
    [{ ...khung, stacks: ["01", "TRUC-MOI-53"] }, "stacks.1"],
    [{ ...baoSai, field: "unitNumber", correctValue: "A 01 gọi lại" }, "correctValue"],
  ];
  let dem = 0;
  for (const [e, duong] of maTran) {
    const r = parseCatalogConfirmation(e);
    assert.equal(r.ok, false, `${duong}: phải từ chối`);
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === duong), `${duong}: ${JSON.stringify(!r.ok && r.errors)}`);
    dem++;
  }
  assert.equal(dem, 5);
});

test("không trỏ hàng, mốc thô", () => {
  const CAM = ["listingId", "listingKey", "contactId", "leadId", "listPrice", "closePrice", "standardStatus", "mlsStatus", "shareId"];
  const khoa = moiKhoa(CatalogConfirmation);
  assert.deepEqual(CAM.filter((k) => khoa.has(k)), []);
  const VO = ["schemaVersion", "officeKey", "memberKey", "observedOn", "buildingKey", "eventType"];
  const GOC: Record<string, string[]> = {
    building_frame: [...VO, "storiesTotal", "skippedFloors", "stacks"],
    unit_attributes: [...VO, "upi", "unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"],
    correction: [...VO, "upi", "field", "correctValue"],
  };
  for (const o of [...CatalogConfirmation.innerType().options.values()]) {
    const et = String((o.shape.eventType as z.ZodLiteral<string>).value);
    assert.deepEqual(Object.keys(o.shape).sort(), [...(GOC[et] ?? [])].sort(), et);
  }
  const ba = suKienMau();
  for (const e of ba) assert.equal(e["observedOn"], "2026-11-08");
  const maTran = ["2026-11-08T09:15:00Z", "2026-11-08 09:15", "08/11/2026"];
  let dem = 0;
  for (const v of maTran) {
    const r = parseCatalogConfirmation({ ...ba[0], observedOn: v });
    assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === "observedOn"), v);
    dem++;
  }
  assert.equal(dem, 3);
});

const MA_MO_MAU = "A".repeat(43);
/** Giá trị đúng dạng của từng nút chuỗi, viết trước theo đường nút. */
const GIA_TRI_DUNG: Readonly<Record<string, string>> = {
  officeKey: MA_MO_MAU,
  memberKey: MA_MO_MAU,
  observedOn: "2026-11-08",
  buildingKey: TOA_MAU,
  "stacks.[]": "03",
  upi: UPI_MAU,
  unitNumber: "A-07.03",
  stack: "03",
  "correctValue.|1": "A-07.03",
  "correctValue.|2": "03",
};

/** Mỗi nút chuỗi chạy tám mồi và một giá trị đúng dạng qua chính nút ấy; nút UPI nhận mồi bọc tiền tố. */
function quetNutChuoi(s: z.ZodTypeAny, giaTriDung: Readonly<Record<string, string>>) {
  let nut = 0;
  let soLan = 0;
  const lot: string[] = [];
  const tuChoiOan: string[] = [];
  diCay(s, [], (n, d) => {
    if (!(n instanceof z.ZodString)) return;
    nut++;
    const duong = d.join(".") || "(gốc)";
    const laNutUpi = n._def.checks.some((c) => c.kind === "regex" && c.regex.source.includes("urn:onehub:upi"));
    for (const moi of MOI_SO_VA_CHU) {
      const gt = laNutUpi ? `urn:onehub:upi:${moi}` : moi;
      soLan++;
      if (n.safeParse(gt).success) lot.push(`${duong} ← ${gt}`);
    }
    const tot = giaTriDung[duong];
    if (tot === undefined || !n.safeParse(tot).success) tuChoiOan.push(duong);
  });
  return { nut, soLan, lot, tuChoiOan };
}

test("quét cả lớp: mọi nút chuỗi chặn mồi", () => {
  const { nut, soLan, lot, tuChoiOan } = quetNutChuoi(CatalogConfirmation, GIA_TRI_DUNG);
  assert.equal(nut, 19, "số nút chuỗi viết trước");
  assert.equal(MOI_SO_VA_CHU.length, 8);
  assert.equal(soLan, nut * MOI_SO_VA_CHU.length);
  assert.deepEqual(lot, []);
  assert.deepEqual(tuChoiOan, []);
  // Đối chứng âm cùng hàm quét: regex quá rộng bị gọi tên đường.
  const thu = quetNutChuoi(z.object({ a: z.string().regex(/^.*$/) }).strict(), { a: "x" });
  assert.equal(thu.lot.length, MOI_SO_VA_CHU.length);
  assert.ok(thu.lot.every((x) => x.startsWith("a ← ")), JSON.stringify(thu.lot));
});

test("mọi sự kiện hàm dựng nhận đều qua khuôn", () => {
  const UPI_LA = ["urn:onehub:upi:mau/A-01.01", "urn:onehub:upi:mau A 01", "urn:onehub:upi:mau#01", "urn:onehub:upi:0900000071"];
  const KHOA_LA = ["toa/1", "toa 1", "0900000071", "bld_0900000071"];
  const maTran: { ten: string; danhMuc: () => ReturnType<typeof danhMucMau>; buildingKey?: string; upi?: string; unitNumber?: string }[] = [
    ...UPI_LA.map((upi) => ({ ten: `UPI ${upi}`, danhMuc: () => danhMucDoiUpi(upi), upi })),
    ...KHOA_LA.map((buildingKey) => ({ ten: `toà ${buildingKey}`, danhMuc: () => danhMucDoiKhoaToa(buildingKey), buildingKey })),
    { ten: "mã căn 090.000.0071", danhMuc: danhMucMau, unitNumber: "090.000.0071" },
    { ten: "đối chứng đúng dạng", danhMuc: danhMucMau },
  ];
  let soLan = 0;
  let nhan = 0;
  for (const dong of maTran) {
    const nc = nguCanhMau({ danhMuc: dong.danhMuc() });
    const buildingKey = dong.buildingKey ?? TOA_MAU;
    const baHam: [string, ReturnType<typeof dungKhungToa | typeof dungThuocTinhCan | typeof dungBaoSai>][] = [
      ["khung toà", dungKhungToa({ ...dauKhungToa(), buildingKey }, nc)],
      ["thuộc tính căn", dungThuocTinhCan({ ...dauThuocTinhCan(), buildingKey, upi: dong.upi ?? null, unitNumber: dong.unitNumber ?? "A-07.03" }, nc)],
      ["báo sai", dungBaoSai({ ...dauBaoSai(), buildingKey, upi: dong.upi ?? UPI_MAU }, nc)],
    ];
    for (const [loai, kq] of baHam) {
      soLan++;
      if (!kq.ok) continue;
      nhan++;
      const r = parseCatalogConfirmation(kq.suKien);
      assert.ok(r.ok, `${dong.ten} · ${loai}: sàn thấy được nhận mà khuôn từ chối — ${JSON.stringify(!r.ok && r.errors)}`);
    }
  }
  assert.equal(soLan, maTran.length * 3);
  assert.ok(nhan > 0, "có sự kiện được nhận nhờ phần tử đối chứng");
});

test("khoá dạng thật không bị từ chối oan", () => {
  const [khung, can] = suKienMau();
  const maTran: [string, Record<string, unknown>][] = [
    ["bld_01JC8R4ZQK0123456789ABCDEF", { ...khung, buildingKey: "bld_01JC8R4ZQK0123456789ABCDEF" }],
    ["bld_0123456789012345678901ABCD", { ...khung, buildingKey: "bld_0123456789012345678901ABCD" }],
    ["upi thật", { ...can, upi: "urn:onehub:upi:1:VN:VN-HN:bld_0123456789012345678901ABCD" }],
  ];
  const biTuChoi = maTran.filter(([, e]) => !parseCatalogConfirmation(e).ok).map(([ten]) => ten);
  assert.deepEqual(biTuChoi, [], "khoá thật bị từ chối oan");
  const nc = nguCanhMau();
  const tongTuTep = (JSON.parse(readFileSync(DUONG_MAU, "utf8")) as { danhMuc: ReturnType<typeof danhMucMau> }).danhMuc.subdivisions
    .flatMap((s) => s.buildings)
    .reduce((n, b) => n + b.units.length, 0);
  assert.ok(tongTuTep > 0);
  let dem = 0;
  for (const s of nc.danhMuc.subdivisions) {
    for (const b of s.buildings) {
      for (const u of b.units) {
        const kq = dungThuocTinhCan(
          {
            buildingKey: b.buildingKey,
            upi: u.upi,
            unitNumber: u.unitNumber ?? "",
            livingArea: u.livingArea ?? undefined,
            bedroomsTotal: u.bedroomsTotal ?? undefined,
            directionFaces: u.directionFaces ?? undefined,
            floor: u.floor ?? undefined,
            stack: u.stack ?? undefined,
          },
          nc,
        );
        assert.ok(kq.ok, `${u.unitNumber}: ${JSON.stringify(!kq.ok && kq.loi)}`);
        const r = parseCatalogConfirmation(kq.suKien);
        assert.ok(r.ok, `${u.unitNumber}: ${JSON.stringify(!r.ok && r.errors)}`);
        dem++;
      }
    }
  }
  assert.equal(dem, tongTuTep);
});

test("khoá máy cấp: đoạn số điện thoại bị chặn", () => {
  const [khung, can] = suKienMau();
  const maTran: [string, Record<string, unknown>, boolean, string][] = [
    ["bld_0900000071", { ...khung, buildingKey: "bld_0900000071" }, false, "buildingKey"],
    ["upi đoạn số", { ...can, upi: "urn:onehub:upi:1:VN:VN-HN:0900000071" }, false, "upi"],
    ["x0900000071 (phần dư đã chọn)", { ...khung, buildingKey: "x0900000071" }, true, "buildingKey"],
  ];
  let dem = 0;
  for (const [ten, e, qua, duong] of maTran) {
    const r = parseCatalogConfirmation(e);
    assert.equal(r.ok, qua, `${ten}: ${JSON.stringify(!r.ok && r.errors)}`);
    if (!qua) assert.ok(!r.ok && r.errors.some((x) => x.path.join(".") === duong), ten);
    dem++;
  }
  assert.equal(dem, maTran.length);
  assert.equal(dem, 3);
});

test("khoá máy cấp: đoạn 12 chữ số trở lên không phải dáng số điện thoại", () => {
  const [khung] = suKienMau();
  const r = parseCatalogConfirmation({ ...khung, buildingKey: "bld_012345678901" });
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
});

test("thuộc tính căn: upi null vẫn dựng được và qua khuôn", () => {
  const kq = dungThuocTinhCan({ ...dauThuocTinhCan(), upi: null }, nguCanhMau());
  assert.ok(kq.ok, JSON.stringify(!kq.ok && kq.loi));
  const r = parseCatalogConfirmation(kq.suKien);
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
});
