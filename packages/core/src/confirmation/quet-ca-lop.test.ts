import assert from "node:assert/strict";
import { test } from "node:test";
import type { CatalogData } from "../catalog/types";
import { dungBaoSai, dungKhungToa, dungThuocTinhCan, type KetQua } from "./dung";
import {
  danhMucMau,
  dauBaoSai,
  dauKhungToa,
  dauThuocTinhCan,
  MOI_SO_VA_CHU,
  nguCanhMau,
  TOA_MAU,
  UPI_MAU,
} from "./nen-thu.fixture";

const loiCua = (kq: KetQua<unknown>) => (kq.ok ? [] : kq.loi);

/** Danh mục mẫu, căn A-01.01 mang UPI `upi` — để mồi qua được bước tra. */
function danhMucDoiUpi(upi: string): CatalogData {
  const dm = danhMucMau();
  const can = dm.subdivisions.flatMap((s) => s.buildings).flatMap((b) => b.units).find((u) => u.upi === UPI_MAU);
  assert.ok(can, "danh mục mẫu có căn A-01.01");
  (can as { upi: string }).upi = upi;
  return dm;
}

/** Danh mục mẫu, toà A mang khoá `khoa` — để mồi qua được bước tra. */
function danhMucDoiKhoaToa(khoa: string): CatalogData {
  const dm = danhMucMau();
  const toa = dm.subdivisions.flatMap((s) => s.buildings).find((b) => b.buildingKey === TOA_MAU);
  assert.ok(toa, "danh mục mẫu có toà A");
  (toa as { buildingKey: string }).buildingKey = khoa;
  return dm;
}

test("báo sai: UPI ngoài dạng bị từ chối", () => {
  const maTran = ["urn:onehub:upi:mau/A-01.01", "urn:onehub:upi:mau A 01", "urn:onehub:upi:mau#01"];
  let dem = 0;
  for (const upi of maTran) {
    const kq = dungBaoSai({ ...dauBaoSai(), upi }, nguCanhMau({ danhMuc: danhMucDoiUpi(upi) }));
    assert.equal(kq.ok, false, `${upi}: phải từ chối`);
    assert.ok(loiCua(kq).some((l) => l.truong === "upi"), `${upi}: ${JSON.stringify(loiCua(kq))}`);
    dem++;
  }
  assert.equal(dem, maTran.length);
  assert.equal(dem, 3);
  const tot = dungBaoSai(dauBaoSai(), nguCanhMau());
  assert.ok(tot.ok, `đối chứng dương: ${JSON.stringify(loiCua(tot))}`);
});

type CaDauVao = {
  ten: string;
  truong: string;
  bocMoi?: (m: string) => string;
  dung: (m: string) => KetQua<unknown>;
  tot: () => KetQua<unknown>;
  loiDang?: true;
};

const UPI_BOC = (m: string) => `urn:onehub:upi:${m}`;
const CHIN_TRUONG: readonly CaDauVao[] = [
  {
    ten: "unitNumber",
    truong: "unitNumber",
    dung: (m) => dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: m }, nguCanhMau()),
    tot: () => dungThuocTinhCan(dauThuocTinhCan(), nguCanhMau()),
  },
  {
    ten: "directionFaces",
    truong: "directionFaces",
    dung: (m) => dungThuocTinhCan({ ...dauThuocTinhCan(), directionFaces: m }, nguCanhMau()),
    tot: () => dungThuocTinhCan(dauThuocTinhCan(), nguCanhMau()),
  },
  {
    ten: "stack",
    truong: "stack",
    dung: (m) => dungThuocTinhCan({ ...dauThuocTinhCan(), stack: m }, nguCanhMau()),
    tot: () => dungThuocTinhCan(dauThuocTinhCan(), nguCanhMau()),
  },
  {
    ten: "stacks",
    truong: "stacks",
    dung: (m) => dungKhungToa({ ...dauKhungToa(), stacks: [m] }, nguCanhMau()),
    tot: () => dungKhungToa(dauKhungToa(), nguCanhMau()),
  },
  {
    ten: "correctValue (unitNumber)",
    truong: "correctValue",
    dung: (m) => dungBaoSai({ ...dauBaoSai(), field: "unitNumber", correctValue: m } as never, nguCanhMau()),
    tot: () => dungBaoSai({ ...dauBaoSai(), field: "unitNumber", correctValue: "A-01.02" } as never, nguCanhMau()),
  },
  {
    ten: "correctValue (stack)",
    truong: "correctValue",
    dung: (m) => dungBaoSai({ ...dauBaoSai(), field: "stack", correctValue: m } as never, nguCanhMau()),
    tot: () => dungBaoSai({ ...dauBaoSai(), field: "stack", correctValue: "02" } as never, nguCanhMau()),
  },
  {
    ten: "correctValue (directionFaces)",
    truong: "correctValue",
    dung: (m) => dungBaoSai({ ...dauBaoSai(), field: "directionFaces", correctValue: m } as never, nguCanhMau()),
    tot: () => dungBaoSai({ ...dauBaoSai(), field: "directionFaces", correctValue: "Tây" } as never, nguCanhMau()),
  },
  {
    ten: "buildingKey",
    truong: "buildingKey",
    loiDang: true,
    dung: (m) => dungKhungToa({ ...dauKhungToa(), buildingKey: m }, nguCanhMau({ danhMuc: danhMucDoiKhoaToa(m) })),
    tot: () => dungKhungToa(dauKhungToa(), nguCanhMau()),
  },
  {
    ten: "upi",
    truong: "upi",
    loiDang: true,
    bocMoi: UPI_BOC,
    dung: (m) => dungBaoSai({ ...dauBaoSai(), upi: m }, nguCanhMau({ danhMuc: danhMucDoiUpi(m) })),
    tot: () => dungBaoSai(dauBaoSai(), nguCanhMau()),
  },
];

test("quét cả lớp: hàm dựng chặn mồi ở mọi chuỗi đầu vào", () => {
  let dem = 0;
  for (const ca of CHIN_TRUONG) {
    const tot = ca.tot();
    assert.ok(tot.ok, `${ca.ten}: đối chứng dương — ${JSON.stringify(loiCua(tot))}`);
    for (const moi of MOI_SO_VA_CHU) {
      const giaTri = ca.bocMoi ? ca.bocMoi(moi) : moi;
      const kq = ca.dung(giaTri);
      assert.equal(kq.ok, false, `${ca.ten} · ${giaTri}: phải từ chối`);
      const loi = loiCua(kq).find((l) => l.truong === ca.truong);
      assert.ok(loi, `${ca.ten} · ${giaTri}: không nêu trường ${ca.truong} — ${JSON.stringify(loiCua(kq))}`);
      if (ca.loiDang) {
        assert.ok(loi.thongDiep.includes("dạng"), `${ca.ten} · ${giaTri}: thông điệp phải là lỗi dạng — ${loi.thongDiep}`);
        assert.ok(!loi.thongDiep.includes("không có trong danh mục"), `${ca.ten} · ${giaTri}: ${loi.thongDiep}`);
      }
      dem++;
    }
  }
  assert.equal(CHIN_TRUONG.length, 9);
  assert.equal(MOI_SO_VA_CHU.length, 8);
  assert.equal(dem, CHIN_TRUONG.length * MOI_SO_VA_CHU.length);
  assert.equal(dem, 72);
});

test("mã căn: 8 số có dấu nối qua, 9 số bị chặn", () => {
  const maTran: [string, boolean][] = [
    ["12.34.56.78", true],
    ["12.34.56.789", false],
  ];
  let dem = 0;
  for (const [ma, qua] of maTran) {
    const kq = dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: ma }, nguCanhMau());
    assert.equal(kq.ok, qua, `${ma}: ${JSON.stringify(loiCua(kq))}`);
    if (!qua) assert.ok(loiCua(kq).some((l) => l.truong === "unitNumber"), ma);
    dem++;
  }
  assert.equal(dem, maTran.length);
  assert.equal(dem, 2);
});

test("mã căn: số toàn chiều rộng có dấu nối bị chặn sau chuẩn hoá", () => {
  const kq = dungThuocTinhCan({ ...dauThuocTinhCan(), unitNumber: "０９０．０００．００７１" }, nguCanhMau());
  assert.equal(kq.ok, false);
  assert.ok(loiCua(kq).some((l) => l.truong === "unitNumber"), JSON.stringify(loiCua(kq)));
});

test("khoá toà không phải chuỗi: lỗi dạng, không ném", () => {
  for (const buildingKey of [123, null, undefined]) {
    const kq = dungKhungToa({ ...dauKhungToa(), buildingKey: buildingKey as never }, nguCanhMau());
    assert.equal(kq.ok, false, String(buildingKey));
    const loi = loiCua(kq).find((l) => l.truong === "buildingKey");
    assert.ok(loi?.thongDiep.includes("dạng"), `${String(buildingKey)}: ${JSON.stringify(loiCua(kq))}`);
  }
});

test("khoá đúng dạng không có trong danh mục: vẫn là lỗi không có trong danh mục", () => {
  const kq = dungKhungToa({ ...dauKhungToa(), buildingKey: "toa-khong-co" }, nguCanhMau());
  assert.equal(kq.ok, false);
  const loi = loiCua(kq).find((l) => l.truong === "buildingKey");
  assert.ok(loi?.thongDiep.includes("không có trong danh mục"), JSON.stringify(loiCua(kq)));
  assert.ok(!loi?.thongDiep.includes("dạng"), JSON.stringify(loiCua(kq)));
});
