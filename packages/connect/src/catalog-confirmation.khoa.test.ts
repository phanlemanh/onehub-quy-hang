import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { dungKhungToa, dungThuocTinhCan } from "@quy-hang/core/confirmation";
import {
  bocUpi,
  danhMucMau,
  dauKhungToa,
  dauThuocTinhCan,
  DAU_NOI_DOI_CHUNG,
  DAU_NOI_SDT,
  DUONG_DUNG_TOA,
  DUONG_DUNG_UPI,
  DUONG_MAU,
  maTranKhoa,
  nguCanhMau,
} from "../../core/src/confirmation/nen-thu.fixture";
import { parseCatalogConfirmation } from "./catalog-confirmation";

function hai(): { khung: Record<string, unknown>; can: Record<string, unknown> } {
  const nc = nguCanhMau();
  const khung = dungKhungToa(dauKhungToa(), nc);
  const can = dungThuocTinhCan(dauThuocTinhCan(), nc);
  if (!khung.ok || !can.ok) throw new Error("sự kiện mẫu phải dựng được");
  return { khung: khung.suKien as unknown as Record<string, unknown>, can: can.suKien as unknown as Record<string, unknown> };
}

const { khung, can } = hai();
const sdtDung = "dáng số điện thoại";

/** Kết quả khuôn trên sự kiện mẫu đổi đúng một khoá. */
const docToa = (k: string) => parseCatalogConfirmation({ ...khung, buildingKey: k });
const docUpi = (u: string) => parseCatalogConfirmation({ ...can, upi: u });

function biChanDung(r: ReturnType<typeof parseCatalogConfirmation>, duong: string): boolean {
  return !r.ok && r.errors.some((e) => e.path.join(".") === duong && e.message.includes(sdtDung));
}

test("khoá máy cấp: ma trận số điện thoại bị khuôn chặn", () => {
  const sdt = maTranKhoa(DAU_NOI_SDT);
  const doiChung = maTranKhoa(DAU_NOI_DOI_CHUNG);
  assert.equal(sdt.length, 175);
  const lot: string[] = [];
  const oan: string[] = [];
  let soChan = 0;
  let soQua = 0;
  for (const [duong, doc, boc] of [
    ["buildingKey", docToa, (k: string) => k],
    ["upi", docUpi, bocUpi],
  ] as const) {
    for (const [i, k] of sdt.entries()) {
      soChan++;
      if (!biChanDung(doc(boc(k)), duong)) lot.push(`${duong} ← ${boc(k)}`);
      soQua++;
      const dc = boc(doiChung[i] ?? "");
      if (!doc(dc).ok) oan.push(`${duong} ← ${dc}`);
    }
  }
  assert.deepEqual(lot, []);
  assert.deepEqual(oan, []);
  assert.equal(soChan, sdt.length * 2);
  assert.equal(soChan, 350);
  assert.equal(soQua, 350);
});

test("khoá dạng thật qua cả hai tầng", () => {
  const KHOA_TOA = ["bld_01JC8R4ZQK0123456789ABCDEF", "bld_0123456789012345678901ABCD", "bld_01234567890123456789012345"];
  const KHOA_UPI = [
    "urn:onehub:upi:1:VN:VN-HN:bld_0123456789012345678901ABCD",
    "urn:onehub:upi:1:VN:VN-01:bld_01JC8R4ZQK0123456789ABCDEF",
    "urn:onehub:upi:1:VN:VN-01:bld_01234567890123456789012345",
  ];
  const biTuChoi: string[] = [];
  let soLan = 0;
  for (const k of KHOA_TOA) {
    soLan++;
    if (!docToa(k).ok) biTuChoi.push(`khuôn ← ${k}`);
    for (const d of DUONG_DUNG_TOA) {
      soLan++;
      if (!d.dung(k).ok) biTuChoi.push(`${d.ten} ← ${k}`);
    }
  }
  for (const u of KHOA_UPI) {
    soLan++;
    if (!docUpi(u).ok) biTuChoi.push(`khuôn ← ${u}`);
    for (const d of DUONG_DUNG_UPI) {
      soLan++;
      if (!d.dung(u).ok) biTuChoi.push(`${d.ten} ← ${u}`);
    }
  }
  assert.deepEqual(biTuChoi, [], "khoá thật bị từ chối oan");
  assert.equal(soLan, KHOA_TOA.length * (1 + DUONG_DUNG_TOA.length) + KHOA_UPI.length * (1 + DUONG_DUNG_UPI.length));
  assert.equal(soLan, 21);

  const nc = nguCanhMau();
  const tongTuTep = (JSON.parse(readFileSync(DUONG_MAU, "utf8")) as { danhMuc: ReturnType<typeof danhMucMau> }).danhMuc.subdivisions
    .flatMap((s) => s.buildings)
    .reduce((n, b) => n + b.units.length, 0);
  assert.ok(tongTuTep > 0);
  let dem = 0;
  for (const b of nc.danhMuc.subdivisions.flatMap((s) => s.buildings)) {
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
  assert.equal(dem, tongTuTep);
});

test("khoá máy cấp: đoạn đứng riêng 9 đến 11 chữ số", () => {
  const maTran: readonly [string, boolean][] = [
    ["toa-1234-5678", true],
    ["toa-1234-56789", false],
    ["toa-1234-5678901", false],
    ["toa-1234-56789012", true],
    ["12-0900000071", false],
    ["toa-123-456789012", false],
  ];
  const sai: string[] = [];
  let soLan = 0;
  for (const [k, qua] of maTran) {
    soLan++;
    if (docToa(k).ok !== qua) sai.push(`khuôn ← ${k}: mong ${qua ? "qua" : "chặn"}`);
    soLan++;
    if (DUONG_DUNG_TOA[0]?.dung(k).ok !== qua) sai.push(`dungKhungToa ← ${k}: mong ${qua ? "qua" : "chặn"}`);
  }
  assert.deepEqual(sai, []);
  assert.equal(soLan, maTran.length * 2);
  assert.equal(soLan, 12);
});

test("khoá máy cấp: số liền dính chữ giữ nguyên", () => {
  const maTran = ["x0900000071", "0900000071x"];
  const biTuChoi: string[] = [];
  let soLan = 0;
  for (const k of maTran) {
    soLan++;
    if (!docToa(k).ok) biTuChoi.push(`khuôn toà ← ${k}`);
    for (const d of DUONG_DUNG_TOA) {
      soLan++;
      if (!d.dung(k).ok) biTuChoi.push(`${d.ten} toà ← ${k}`);
    }
    const u = bocUpi(k);
    soLan++;
    if (!docUpi(u).ok) biTuChoi.push(`khuôn upi ← ${u}`);
    for (const d of DUONG_DUNG_UPI) {
      soLan++;
      if (!d.dung(u).ok) biTuChoi.push(`${d.ten} upi ← ${u}`);
    }
  }
  assert.deepEqual(biTuChoi, []);
  assert.equal(soLan, maTran.length * 7);
  assert.equal(soLan, 14);
});

test("khoá máy cấp: có dấu tách dính chữ bị chặn", () => {
  const dinh = (d: readonly string[]) => d.slice(1).flatMap((x) => [`toa${x}`, `${x}x`]);
  const sdt = dinh(DAU_NOI_SDT);
  const doiChung = dinh(DAU_NOI_DOI_CHUNG);
  assert.equal(sdt.length, 12);
  const lot: string[] = [];
  const oan: string[] = [];
  let soChan = 0;
  let soQua = 0;
  const chamDuong = (ten: string, kq: { ok: boolean; loi?: { truong: string; thongDiep: string }[] }, truong: string, k: string) => {
    if (kq.ok || !kq.loi?.some((l) => l.truong === truong && l.thongDiep.includes(sdtDung))) lot.push(`${ten} ← ${k}`);
  };
  for (const [i, k] of sdt.entries()) {
    const dc = doiChung[i] ?? "";
    const u = bocUpi(k);
    const uDc = bocUpi(dc);
    soChan += 7;
    soQua += 7;
    if (!biChanDung(docToa(k), "buildingKey")) lot.push(`khuôn toà ← ${k}`);
    if (!biChanDung(docUpi(u), "upi")) lot.push(`khuôn upi ← ${u}`);
    if (!docToa(dc).ok) oan.push(`khuôn toà ← ${dc}`);
    if (!docUpi(uDc).ok) oan.push(`khuôn upi ← ${uDc}`);
    for (const d of DUONG_DUNG_TOA) {
      chamDuong(d.ten, d.dung(k) as never, "buildingKey", k);
      if (!d.dung(dc).ok) oan.push(`${d.ten} ← ${dc}`);
    }
    for (const d of DUONG_DUNG_UPI) {
      chamDuong(d.ten, d.dung(u) as never, "upi", u);
      if (!d.dung(uDc).ok) oan.push(`${d.ten} ← ${uDc}`);
    }
  }
  assert.deepEqual(lot, []);
  assert.deepEqual(oan, []);
  assert.equal(soChan, sdt.length * 7);
  assert.equal(soChan, 84);
  assert.equal(soQua, 84);
});
