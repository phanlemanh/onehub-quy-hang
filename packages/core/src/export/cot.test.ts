// E3 (hàng 43, AC-3) — cột ra = cột đang hiện của góc nhìn ∩ tập khoá luật ẩn cho người nhận, giữ thứ tự góc nhìn;
// cột bị bỏ liệt bằng nhãn. Ma trận viết trước: một góc nhìn thứ tự lạ × hai người nhận × bốn cấu hình = 8 ô. Chiều đỏ
// dựng bản sao bỏ bước giao với tập luật ẩn, chạy trên CÙNG ma trận.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAU_HINH_TAT_CA, canMoi, type CanNoiBo, type CauHinhRa, type NguoiNhan } from "../redaction";
import { COT_BANG_HANG, cotRa, xuatBang, type CotGocNhin, type KetQuaCot } from ".";

const TODAY = "2026-11-04";
/** Góc nhìn thứ tự lạ: mã căn, toà, diện tích, giá, phí, tình trạng, người giữ, lý do ngừng, trường riêng (+ xác nhận). */
const GOC_NHIN: readonly CotGocNhin[] = [
  "listPrice",
  "holderName",
  "buildingName",
  "confirmedAgeDays",
  "feeInclusion",
  "unitNumber",
  "withdrawnReason",
  "livingArea",
  "standardStatus",
  { id: "cf:canGoc", nhan: "Căn góc" },
];

const ten = (nn: NguoiNhan, c: CauHinhRa) =>
  `${nn}/${c.showConfirmedAge ? "hien-tuoi" : "an-tuoi"}+${c.privateHidesUnitNumber ? "an-ma-can" : "hien-ma-can"}`;

/** Ô viết tay: tên ô → [cột ra «nhãn=khoá»], [cột bỏ]. */
const DU_MA = ["Giá=listPrice", "Toà=buildingName", "Xác nhận=confirmedAgeDays", "Phí=feeInclusion", "Mã căn=unitNumber", "Diện tích=livingArea", "Trạng thái=availability"];
const DU_MA_AN_TUOI = DU_MA.filter((c) => !c.startsWith("Xác nhận"));
const NAC = ["Giá=listPrice", "Toà=buildingName", "Xác nhận=confirmedAgeDays", "Phí=feeInclusion", "Tầng=floorBand", "Diện tích=livingArea", "Trạng thái=availability"];
const NAC_AN_TUOI = NAC.filter((c) => !c.startsWith("Xác nhận"));
const BO = ["Người giữ", "Lý do ngừng", "Căn góc"];
const BO_AN_TUOI = ["Người giữ", "Xác nhận", "Lý do ngừng", "Căn góc"];
const MONG: Readonly<Record<string, [string[], string[]]>> = {
  "nhom_moi_gioi/hien-tuoi+an-ma-can": [DU_MA, BO],
  "nhom_moi_gioi/hien-tuoi+hien-ma-can": [DU_MA, BO],
  "nhom_moi_gioi/an-tuoi+an-ma-can": [DU_MA_AN_TUOI, BO_AN_TUOI],
  "nhom_moi_gioi/an-tuoi+hien-ma-can": [DU_MA_AN_TUOI, BO_AN_TUOI],
  "khach_rieng/hien-tuoi+an-ma-can": [NAC, ["Người giữ", "Mã căn", "Lý do ngừng", "Căn góc"]],
  "khach_rieng/hien-tuoi+hien-ma-can": [DU_MA, BO],
  "khach_rieng/an-tuoi+an-ma-can": [NAC_AN_TUOI, ["Người giữ", "Xác nhận", "Mã căn", "Lý do ngừng", "Căn góc"]],
  "khach_rieng/an-tuoi+hien-ma-can": [DU_MA_AN_TUOI, BO_AN_TUOI],
};

type HamCot = (cot: readonly CotGocNhin[], nguoiNhan: NguoiNhan, cauHinh: CauHinhRa) => KetQuaCot;

function kiemCot(ham: HamCot): string[] {
  const loi: string[] = [];
  let soO = 0;
  for (const nn of ["nhom_moi_gioi", "khach_rieng"] as const) {
    for (const c of CAU_HINH_TAT_CA) {
      const o = ten(nn, c);
      const [ra, bo] = MONG[o]!;
      const kq = ham(GOC_NHIN, nn, c);
      const thucRa = kq.ra.map((x) => `${x.nhan}=${x.khoa}`);
      for (const x of kq.ra) if (!ra.includes(`${x.nhan}=${x.khoa}`)) loi.push(`${o}: lọt ${x.nhan}`);
      if (JSON.stringify(thucRa) !== JSON.stringify(ra)) loi.push(`${o}: cột ra ${thucRa.join(", ")}`);
      if (JSON.stringify(kq.boQua) !== JSON.stringify(bo)) loi.push(`${o}: cột bỏ ${kq.boQua.join(", ")}`);
      soO++;
    }
  }
  if (soO !== 8) loi.push(`ma trận ${soO} ô`);
  return loi;
}

test("E3 ma trận 8 ô — cột ra đúng thứ tự góc nhìn, cột bỏ liệt bằng nhãn", () => {
  assert.deepEqual(kiemCot(cotRa), []);
});

test("E3 bảng cột phủ mọi cột của bảng hàng (inventory/cot.ts) và người giữ", () => {
  // Chép tay từ `CotId` của apps/web/src/app/(app)/inventory/cot.ts — lõi không nhập từ app.
  const COT_ID = ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "standardStatus", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "completeness", "visibility", "closePrice", "closeDate", "withdrawnReason"];
  assert.deepEqual(Object.keys(COT_BANG_HANG).sort(), [...COT_ID, "holderName"].sort());
  // Cột lớp giao dịch và nội bộ không có khoá ra.
  for (const id of ["closePrice", "closeDate", "withdrawnReason", "holderName", "visibility", "completeness"] as const) {
    assert.equal(COT_BANG_HANG[id].khoa, null, id);
  }
});

const ba = (): CanNoiBo[] => [
  { ...canMoi(), unitNumber: "A-20.01", floor: 20, buildingFloorsTotal: 30, listPrice: 5_100_000_000 },
  { ...canMoi(), unitNumber: "A-12.05", floor: 12, buildingFloorsTotal: 30, listPrice: 4_250_000_000 },
  { ...canMoi(), unitNumber: "A-03.02", floor: 3, buildingFloorsTotal: 30, listPrice: 950_000_000 },
];

test("E3 dòng giữ thứ tự góc nhìn (giá giảm dần); khách riêng ẩn mã căn thấy tầng cao/thấp, không mã căn", () => {
  const can = ba();
  const nhom = xuatBang(can, { mau: "xlsx", nguoiNhan: "nhom_moi_gioi", cot: GOC_NHIN, today: TODAY, tenSan: "[Tên sàn]" });
  const iGia = nhom.cot.indexOf("Giá");
  assert.deepEqual(nhom.dong.map((d) => d[iGia]), ["5,1 tỷ", "4,25 tỷ", "950 triệu"]);
  assert.deepEqual(nhom.dong.map((d) => d[nhom.cot.indexOf("Mã căn")]), ["A-20.01", "A-12.05", "A-03.02"]);
  assert.deepEqual(nhom.boQua, BO);

  const khach = xuatBang(can, { mau: "xlsx", nguoiNhan: "khach_rieng", cot: [...GOC_NHIN, "floor"], today: TODAY, tenSan: "[Tên sàn]" });
  assert.ok(!khach.cot.includes("Mã căn"));
  assert.equal(khach.cot.filter((c) => c === "Tầng").length, 1, "một cột nấc tầng dù góc nhìn có cả mã căn và tầng");
  assert.equal(khach.cot.indexOf("Tầng"), 4, "nấc tầng đứng ở chỗ mã căn");
  assert.deepEqual(khach.dong.map((d) => d[4]), ["Tầng cao", "Tầng thấp", "Tầng thấp"]);
  const chu = JSON.stringify(khach);
  for (const ma of ["A-20.01", "A-12.05", "A-03.02"]) assert.ok(!chu.includes(ma), ma);
  assert.ok(khach.boQua.includes("Mã căn"));
  assert.ok(!khach.boQua.includes("Tầng"));
});

test("E3 chiều đỏ — bản sao bỏ bước giao với tập luật ẩn thì «Người giữ» lọt ra ở ô nhóm môi giới", () => {
  const khongGiao: HamCot = (cot) => ({
    ra: cot.map((c) => {
      const id = typeof c === "string" ? c : c.id;
      const dn = typeof c === "string" ? COT_BANG_HANG[c] : null;
      return { id, nhan: dn?.nhan ?? (typeof c === "string" ? c : c.nhan), khoa: (dn?.khoa ?? id) as never };
    }),
    boQua: [],
  });
  const loi = kiemCot(khongGiao);
  assert.ok(loi.includes("nhom_moi_gioi/hien-tuoi+an-ma-can: lọt Người giữ"), loi.join(" | "));
});
