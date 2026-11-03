// E1, E4, E6, E7 (hàng 31) — hàm ra: một hàm cho mọi cửa, vị trí căn theo người nhận (Hỏi-1, Hỏi-3), ảnh chỉ ngăn Gửi
// được, tình trạng và giá theo trạng thái (Hỏi-4). Ma trận viết tay; chiều đỏ dựng bản sao hỏng NGAY TRÊN cùng mồi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { freshness } from "../listing/freshness";
import type { StandardStatus } from "../listing/status";
import {
  AVAILABILITY,
  bangTang,
  banRaNgoai,
  CAU_HINH_MAC_DINH,
  CAU_HINH_MO_NHAT,
  canMoi,
  CUA_RA,
  NGUOI_NHAN,
  timRoRi,
  TRUONG_RA,
  type CanNoiBo,
  type CanRaNgoai,
  type GiaTriMoi,
} from ".";

const TODAY = "2026-11-03";
const VI_TRI = ["unitNumber", "upi", "stack", "floor"];
const moiViTri = (can: CanNoiBo): GiaTriMoi[] => [
  { truong: "unitNumber", giaTri: can.unitNumber!, kieu: "chu" },
  { truong: "upi", giaTri: can.upi!, kieu: "chu" },
  { truong: "stack", giaTri: can.stack!, kieu: "chu" },
];

test("E1 một hàm cho mọi cửa — khoá ⊆ danh sách, khoá lạ không ra, ba cửa cùng bản", () => {
  const can = { ...canMoi(), ghiChuNoiBo: "moi-ghi-chu-noi-bo-lot" } as CanNoiBo;
  for (const nguoiNhan of NGUOI_NHAN) {
    const ban = CUA_RA.map((cua) => banRaNgoai(can, { cua, nguoiNhan, today: TODAY }));
    for (const b of ban) {
      for (const k of Object.keys(b)) assert.ok((TRUONG_RA[nguoiNhan] as readonly string[]).includes(k), `${nguoiNhan}: ${k}`);
      assert.ok(!("ghiChuNoiBo" in b));
      assert.ok(!JSON.stringify(b).includes("moi-ghi-chu-noi-bo-lot"));
    }
    assert.deepEqual(ban[1], ban[0]);
    assert.deepEqual(ban[2], ban[0]);
  }
});

test("E1 chiều đỏ — hàm chép cả bản vào rồi xoá khoá cấm để lọt khoá lạ", () => {
  const can = { ...canMoi(), ghiChuNoiBo: "moi-ghi-chu-noi-bo-lot" } as CanNoiBo;
  const chepCa = (c: CanNoiBo) => {
    const { ownerName, ownerPhone, floorPrice, titleDeedPhoto, contacts, holderName, holderUserId, ...con } = c;
    void [ownerName, ownerPhone, floorPrice, titleDeedPhoto, contacts, holderName, holderUserId];
    return con;
  };
  const lot = Object.keys(chepCa(can)).filter((k) => !(TRUONG_RA.khach_rieng as readonly string[]).includes(k));
  assert.ok(lot.includes("ghiChuNoiBo"), `khoá lạ lọt: ${lot.join(", ")}`);
});

test("E4 khách riêng mặc định — đúng tập khoá Hỏi-3, không vị trí, nấc tầng", () => {
  const can = canMoi();
  const HOI_3 = [
    "buildingName", "floorBand", "livingArea", "bedroomsTotal", "directionFaces", "propertyType", "propertySubType",
    "furnished", "legalStatus", "occupantType", "financing", "availability", "listPrice", "feeInclusion",
    "confirmedAgeDays", "photos", "companyName", "senderName",
  ];
  for (const cua of CUA_RA) {
    const b = banRaNgoai(can, { cua, nguoiNhan: "khach_rieng", today: TODAY });
    assert.deepEqual(Object.keys(b).sort(), [...HOI_3].sort());
    for (const k of VI_TRI) assert.ok(!(k in b), `${cua}: ${k}`);
    assert.deepEqual(timRoRi(JSON.stringify(b), moiViTri(can)), []);
    assert.equal(b.floorBand, "high");
  }
});

test("E4 bảng nấc tầng (Hỏi-1)", () => {
  const ca: [number | null, number | null, "high" | "low" | null][] = [
    [12, 15, "high"],
    [8, 15, "high"],
    [7, 15, "low"],
    [1, 15, "low"],
    [5, null, null],
  ];
  for (const [tang, tong, mong] of ca) assert.equal(bangTang(tang, tong), mong, `${tang}/${tong}`);
});

test("E4 đối chứng dương — nhóm môi giới và khách riêng khi sàn tắt ẩn mã căn thấy đủ vị trí", () => {
  const can = canMoi();
  const ban: CanRaNgoai[] = [
    banRaNgoai(can, { cua: "gui_link", nguoiNhan: "nhom_moi_gioi", today: TODAY }),
    banRaNgoai(can, { cua: "gui_link", nguoiNhan: "khach_rieng", cauHinh: CAU_HINH_MO_NHAT, today: TODAY }),
  ];
  for (const b of ban) {
    assert.deepEqual(timRoRi(JSON.stringify(b), moiViTri(can)).map((r) => r.truong), ["unitNumber", "upi", "stack"]);
    assert.equal(b.floor, 12);
    assert.ok(!("floorBand" in b));
  }
});

test("E4 chiều đỏ — bỏ điều kiện ẩn mã căn thì khách riêng thấy mã", () => {
  const can = canMoi();
  const boAn = (c: CanNoiBo) => banRaNgoai(c, { cua: "gui_link", nguoiNhan: "khach_rieng", cauHinh: { ...CAU_HINH_MAC_DINH, privateHidesUnitNumber: false }, today: TODAY });
  const ro = timRoRi(JSON.stringify(boAn(can)), moiViTri(can));
  assert.match(ro.map((r) => r.truong).join(","), /unitNumber/);
});

test("E6 ảnh chỉ ngăn Gửi được, bìa đầu, nhãn, bốn khoá", () => {
  const can = canMoi();
  const moiAnh: GiaTriMoi[] = ["moi-anh-noi-bo-1", "moi-anh-noi-bo-2"].map((id) => ({ truong: `photos[${id}]`, giaTri: id, kieu: "chu" }));
  for (const cua of CUA_RA) {
    for (const nguoiNhan of NGUOI_NHAN) {
      for (const cauHinh of [CAU_HINH_MAC_DINH, CAU_HINH_MO_NHAT]) {
        const b = banRaNgoai(can, { cua, nguoiNhan, cauHinh, today: TODAY });
        assert.deepEqual(timRoRi(JSON.stringify(b), moiAnh), []);
      }
    }
  }
  const anh = banRaNgoai(can, { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY }).photos!;
  assert.deepEqual(anh.map((p) => p.id), ["moi-anh-gui-c", "moi-anh-gui-b", "moi-anh-gui-a"]);
  assert.deepEqual(anh.map((p) => p.label), ["Ảnh thật · 20/10/2026", "Ảnh thật · 20/10/2026", "Ảnh mẫu"]);
  for (const p of anh) assert.deepEqual(Object.keys(p).sort(), ["height", "id", "label", "width"]);
});

test("E6 chiều đỏ — lấy mọi ảnh không qua anhRaNgoai thì lộ ảnh nội bộ", () => {
  const can = canMoi();
  const moiAnh: GiaTriMoi[] = [{ truong: "photos[moi-anh-noi-bo-1]", giaTri: "moi-anh-noi-bo-1", kieu: "chu" }];
  const hong = { ...banRaNgoai(can, { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY }), photos: can.photos.map((p) => ({ id: p.id })) };
  assert.match(timRoRi(JSON.stringify(hong), moiAnh).map((r) => r.truong).join(","), /moi-anh-noi-bo-1/);
});

const BANG_HOI_4: [StandardStatus, string, boolean][] = [
  ["Active", "available", true],
  ["Pending", "under_contract", true],
  ["Hold", "paused", false],
  ["Closed", "unavailable", false],
  ["Withdrawn", "unavailable", false],
  ["Incomplete", "unavailable", false],
];
const CA_NGAY: [string, number][] = [
  ["2026-10-24T09:00:00Z", 10],
  ["2026-11-02T23:30:00Z", 1],
  ["2026-11-03T00:10:00Z", 0],
];
type HamRa = typeof banRaNgoai;

/** Thước của E7 — trả lỗi nêu trạng thái hay ô ngày; hàm thật → []. */
function kiemTinhTrang(ham: HamRa): string[] {
  const loi: string[] = [];
  const moiGiaoDich: GiaTriMoi[] = [
    { truong: "closePrice", giaTri: 9_876_543_212, kieu: "so_tien" },
    { truong: "closeDate", giaTri: "2019-07-13", kieu: "chu" },
  ];
  for (const [standardStatus, mong, coGia] of BANG_HOI_4) {
    const b = ham({ ...canMoi(), standardStatus }, { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY });
    if (b.availability !== mong) loi.push(`${standardStatus}: availability ${b.availability} ≠ ${mong}`);
    if ("listPrice" in b !== coGia) loi.push(`${standardStatus}: listPrice`);
    if ("feeInclusion" in b !== coGia) loi.push(`${standardStatus}: feeInclusion`);
    for (const k of ["standardStatus", "closePrice", "closeDate", "withdrawnReason", "lastConfirmedAt"]) if (k in b) loi.push(`${standardStatus}: có ${k}`);
    for (const r of timRoRi(JSON.stringify(b), moiGiaoDich)) loi.push(`${standardStatus}: rò ${r.truong}`);
  }
  for (const [lastConfirmedAt, mong] of CA_NGAY) {
    const b = ham({ ...canMoi(), lastConfirmedAt }, { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY });
    const f = freshness(lastConfirmedAt, TODAY);
    if (b.confirmedAgeDays !== mong || b.confirmedAgeDays !== (f.confirmed ? f.ageDays : null)) {
      loi.push(`ô ${lastConfirmedAt}: ${b.confirmedAgeDays} ≠ ${mong}`);
    }
  }
  return loi;
}

test("E7 tình trạng, giá, tuổi xác nhận (Hỏi-4, freshness) — 6 trạng thái, 3 ô ngày", () => {
  assert.deepEqual(kiemTinhTrang(banRaNgoai), []);
  assert.deepEqual(BANG_HOI_4.map(([s]) => [s, AVAILABILITY[s]]), BANG_HOI_4.map(([s, m]) => [s, m]));
  const tat = banRaNgoai(canMoi(), { cua: "gui_link", nguoiNhan: "khach_rieng", cauHinh: { ...CAU_HINH_MAC_DINH, showConfirmedAge: false }, today: TODAY });
  assert.ok(!("confirmedAgeDays" in tat));
  const chua = banRaNgoai({ ...canMoi(), lastConfirmedAt: null }, { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY });
  assert.equal(chua.confirmedAgeDays, null);
});

test("E7 chiều đỏ — bản sao đổi Hold thành còn hàng, bản sao đếm bằng giờ trôi", () => {
  const holdConHang: HamRa = (can, tuy) =>
    can.standardStatus === "Hold" ? banRaNgoai({ ...can, standardStatus: "Active" }, tuy) : banRaNgoai(can, tuy);
  assert.match(kiemTinhTrang(holdConHang).join(" | "), /Hold: availability available ≠ paused/);
  const gioTroi: HamRa = (can, tuy) => {
    const b = banRaNgoai(can, tuy);
    if (can.lastConfirmedAt && "confirmedAgeDays" in b) {
      b.confirmedAgeDays = Math.floor((Date.parse(`${tuy.today}T08:00:00Z`) - Date.parse(can.lastConfirmedAt)) / 86_400_000);
    }
    return b;
  };
  assert.match(kiemTinhTrang(gioTroi).join(" | "), /ô 2026-10-24T09:00:00Z: 9 ≠ 10/);
});
