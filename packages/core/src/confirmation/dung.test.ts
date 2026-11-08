import assert from "node:assert/strict";
import { test } from "node:test";
import type { Agreement } from "../agreements";
import { canMoi } from "../redaction/moi";
import { timRoRi } from "../redaction/kiem-ro-ri";
import type { KhoaCanNoiBo } from "../redaction/lop-truong";
import { dungBaoSai, dungKhungToa, dungThuocTinhCan, KHONG_BAO_GIO, type KetQua } from "./dung";
import { KHOA_RIENG, KHOA_VO, type LoaiSuKien } from "./khuon";
import {
  dauBaoSai,
  dauKhungToa,
  dauThuocTinhCan,
  nguCanhMau,
  thoaThuanXacNhan,
  TOA_MAU,
  UPI_MAU,
} from "./nen-thu.fixture";
import { moiNgoaiDanhMuc } from "./quet-ro-ri.fixture";

type Dung = (dau: never, nc: ReturnType<typeof nguCanhMau>) => KetQua<unknown>;
const BA_LOAI: readonly [LoaiSuKien, Dung, () => Record<string, unknown>][] = [
  ["building_frame", dungKhungToa as Dung, dauKhungToa],
  ["unit_attributes", dungThuocTinhCan as Dung, dauThuocTinhCan],
  ["correction", dungBaoSai as Dung, dauBaoSai],
];

const loiCua = (kq: KetQua<unknown>) => (kq.ok ? [] : kq.loi);

test("không bao giờ có: hàm dựng từ chối", () => {
  const moi = canMoi();
  let dem = 0;
  for (const [loai, dung, dau] of BA_LOAI) {
    assert.ok(dung(dau() as never, nguCanhMau()).ok, `${loai}: đối chứng dương không chèn thì dựng được`);
    for (const k of KHONG_BAO_GIO) {
      const kq = dung({ ...dau(), [k]: moi[k as KhoaCanNoiBo] } as never, nguCanhMau());
      assert.equal(kq.ok, false, `${loai} · ${k}: phải từ chối`);
      const loi = loiCua(kq);
      assert.equal(loi.length, 1, `${loai} · ${k}: đúng một lỗi (${JSON.stringify(loi)})`);
      assert.equal(loi[0]?.truong, k);
      dem++;
    }
  }
  assert.equal(dem, KHONG_BAO_GIO.length * 3);
  assert.equal(dem, 18);
});

test("không bao giờ có: bộ kiểm rò rỉ trên sự kiện từ căn mồi", () => {
  const can = canMoi();
  const nc = nguCanhMau();
  const suKien = [
    dungKhungToa({ ...dauKhungToa(), storiesTotal: can.buildingFloorsTotal ?? 15 }, nc),
    dungThuocTinhCan(
      {
        buildingKey: TOA_MAU,
        upi: null,
        unitNumber: can.unitNumber ?? "",
        livingArea: can.livingArea ?? undefined,
        bedroomsTotal: can.bedroomsTotal ?? undefined,
        directionFaces: can.directionFaces ?? undefined,
        floor: can.floor ?? undefined,
      },
      nc,
    ),
    dungBaoSai({ buildingKey: TOA_MAU, upi: UPI_MAU, field: "livingArea", correctValue: can.livingArea ?? 1 }, nc),
  ];
  const moi = moiNgoaiDanhMuc();
  assert.ok(moi.some((m) => m.truong === "floorPrice") && moi.some((m) => m.truong === "ownerPhone"), "mồi có giá đáy và số chủ");
  for (const kq of suKien) {
    assert.ok(kq.ok, JSON.stringify(loiCua(kq)));
    assert.deepEqual(timRoRi(JSON.stringify(kq.suKien), moi), [], "không mồi nào lọt");
  }
  // Đối chứng: chèn chuỗi mồi giá đáy thì bộ quét gọi tên floorPrice.
  const ro = timRoRi(JSON.stringify({ x: String(can.floorPrice) }), moi);
  assert.ok(ro.some((r) => r.truong === "floorPrice"), JSON.stringify(ro));
});

test("không chữ tự do: hàm dựng từ chối", () => {
  const nc = nguCanhMau();
  const maTran: [string, KetQua<unknown>][] = [
    ["unitNumber", dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: "gọi chủ nhé" }, nc)],
    ["unitNumber", dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: "0900000071" }, nc)],
    ["directionFaces", dungThuocTinhCan({ ...dauThuocTinhCan(), directionFaces: "Đông Nam view hồ" }, nc)],
    ["stacks", dungKhungToa({ ...dauKhungToa(), stacks: ["01", "TRUC-MOI-53"] }, nc)],
    ["correctValue", dungBaoSai({ ...dauBaoSai(), field: "unitNumber", correctValue: "A 01 gọi lại" }, nc)],
  ];
  let dem = 0;
  for (const [truong, kq] of maTran) {
    assert.equal(kq.ok, false, `${truong}: phải từ chối`);
    assert.ok(loiCua(kq).some((l) => l.truong === truong), `${truong}: ${JSON.stringify(loiCua(kq))}`);
    dem++;
  }
  assert.equal(dem, 5);
  // Đối chứng dương: chuẩn hoá trong dạng đóng.
  const tot = dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: "a-12.06", directionFaces: "Đông Nam" }, nc);
  assert.ok(tot.ok, JSON.stringify(loiCua(tot)));
  assert.equal(tot.suKien.unitNumber, "A-12.06");
  assert.equal(tot.suKien.directionFaces, "Southeast");
});

test("chỉ dựng với thoả thuận xác nhận đang bật", () => {
  const maTran: Agreement[] = [
    thoaThuanXacNhan({ kind: "listing_channel" }),
    thoaThuanXacNhan({ status: "paused" }),
    thoaThuanXacNhan({ validUntil: new Date("2026-11-05T00:00:00Z") }),
    thoaThuanXacNhan({ validFrom: new Date("2026-12-01T00:00:00Z") }),
    thoaThuanXacNhan({ dataClasses: ["shareable_listing"] }),
  ];
  let dem = 0;
  for (const thoaThuan of maTran) {
    for (const [loai, dung, dau] of BA_LOAI) {
      const kq = dung(dau() as never, nguCanhMau({ thoaThuan }));
      assert.equal(kq.ok, false, `${loai} · ${thoaThuan.kind}/${thoaThuan.status}`);
      assert.ok(loiCua(kq).some((l) => l.truong === "thoaThuan"), JSON.stringify(loiCua(kq)));
    }
    dem++;
  }
  assert.equal(dem, 5);
  for (const [loai, dung, dau] of BA_LOAI) assert.ok(dung(dau() as never, nguCanhMau()).ok, `${loai}: đối chứng dương`);
});

test("khoá phát ra đúng danh sách ghim", () => {
  const GHIM: Record<LoaiSuKien, string[]> = {
    building_frame: ["buildingKey", "storiesTotal", "skippedFloors", "stacks"],
    unit_attributes: ["buildingKey", "upi", "unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"],
    correction: ["buildingKey", "upi", "field", "correctValue"],
  };
  assert.deepEqual([...KHOA_VO], ["schemaVersion", "eventType", "officeKey", "memberKey", "observedOn"]);
  for (const [loai, dung, dau] of BA_LOAI) {
    assert.deepEqual([...KHOA_RIENG[loai]], GHIM[loai], `${loai}: KHOA_RIENG đổi so với ghim`);
    const kq = dung(dau() as never, nguCanhMau());
    assert.ok(kq.ok);
    const khoa = Object.keys(kq.suKien as object);
    assert.deepEqual(khoa.slice(0, KHOA_VO.length), [...KHOA_VO], `${loai}: vỏ đứng đầu, đúng thứ tự`);
    assert.deepEqual(khoa.slice(KHOA_VO.length), GHIM[loai], `${loai}: phần riêng đúng danh sách ghim`);
  }
});

test("mốc thô: observedOn là ngày đưa vào", () => {
  for (const [, dung, dau] of BA_LOAI) {
    const kq = dung(dau() as never, nguCanhMau());
    assert.ok(kq.ok);
    assert.equal((kq.suKien as { observedOn: string }).observedOn, "2026-11-08");
  }
});

test("báo sai: sáu trường", () => {
  const maTran: [string, string | number, string | number][] = [
    ["unitNumber", "A-01.10", "A-01.10"],
    ["livingArea", 55.1, 55.1],
    ["bedroomsTotal", 2, 2],
    ["directionFaces", "Tây Bắc", "Northwest"],
    ["floor", 2, 2],
    ["stack", "09", "09"],
  ];
  let dem = 0;
  for (const [field, vao, ra] of maTran) {
    const kq = dungBaoSai({ ...dauBaoSai(), field: field as never, correctValue: vao }, nguCanhMau());
    assert.ok(kq.ok, `${field}: ${JSON.stringify(loiCua(kq))}`);
    assert.equal(kq.suKien.field, field);
    assert.equal(kq.suKien.correctValue, ra);
    dem++;
  }
  assert.equal(dem, 6);
});

test("báo sai: trùng danh mục bị từ chối", () => {
  // Căn A-01.01 của danh mục mẫu: tầng 1, trục 01, 54,2 m², 1 phòng, Đông Nam.
  const maTran: [string, string | number][] = [
    ["unitNumber", "A-01.01"],
    ["livingArea", 54.2],
    ["bedroomsTotal", 1],
    ["directionFaces", "Đông Nam"],
    ["floor", 1],
    ["stack", "01"],
    ["unitNumber", "a-01.01"],
    ["directionFaces", "Southeast"],
  ];
  let dem = 0;
  for (const [field, v] of maTran) {
    const kq = dungBaoSai({ ...dauBaoSai(), field: field as never, correctValue: v }, nguCanhMau());
    assert.equal(kq.ok, false, `${field}=${v}: phải từ chối`);
    const l = loiCua(kq).find((x) => x.truong === "correctValue");
    assert.ok(l && l.thongDiep.includes("trùng danh mục"), `${field}=${v}: ${JSON.stringify(loiCua(kq))}`);
    dem++;
  }
  assert.equal(dem, 8);
});

test("báo sai: từ chối khác", () => {
  const maTran: [string, Record<string, unknown>][] = [
    ["field", { field: "buildingName", correctValue: "Toà B" }],
    ["correctValue", { field: "livingArea", correctValue: "74,5" }],
    ["correctValue", { field: "bedroomsTotal", correctValue: 2.5 }],
    ["upi", { upi: "urn:onehub:upi:mau:Z-99.99" }],
    ["buildingKey", { buildingKey: "toa-khong-co" }],
  ];
  let dem = 0;
  for (const [truong, them] of maTran) {
    const kq = dungBaoSai({ ...dauBaoSai(), ...them } as never, nguCanhMau());
    assert.equal(kq.ok, false, `${truong}: phải từ chối`);
    assert.ok(loiCua(kq).some((l) => l.truong === truong), `${truong}: ${JSON.stringify(loiCua(kq))}`);
    dem++;
  }
  assert.equal(dem, 5);
});

test("khung toà: hợp lệ", () => {
  const kq = dungKhungToa(dauKhungToa(), nguCanhMau());
  assert.ok(kq.ok, JSON.stringify(loiCua(kq)));
  assert.equal(kq.suKien.storiesTotal, 15);
  assert.deepEqual(kq.suKien.skippedFloors, [4, 13]);
  assert.deepEqual(kq.suKien.stacks, ["01", "02", "03", "04", "05", "06"]);
});

test("khung toà: từ chối", () => {
  const maTran: [string, Record<string, unknown>][] = [
    ["storiesTotal", { storiesTotal: 0 }],
    ["storiesTotal", { storiesTotal: 121 }],
    ["skippedFloors", { skippedFloors: [16] }],
    ["skippedFloors", { skippedFloors: [13, 4] }],
    ["skippedFloors", { skippedFloors: [4, 4] }],
    ["stacks", { stacks: ["01", "01"] }],
    ["stacks", { stacks: [] }],
    ["buildingKey", { buildingKey: "toa-khong-co" }],
  ];
  let dem = 0;
  for (const [truong, them] of maTran) {
    const kq = dungKhungToa({ ...dauKhungToa(), ...them } as never, nguCanhMau());
    assert.equal(kq.ok, false, `${truong} ${JSON.stringify(them)}: phải từ chối`);
    assert.ok(loiCua(kq).some((l) => l.truong === truong), `${truong}: ${JSON.stringify(loiCua(kq))}`);
    dem++;
  }
  assert.equal(dem, 8);
});
