// Lọc mọi cột của Bảng hàng (hàng 14) — E4, và cột mặc định, định dạng giá (E3b). 40 hàng mẫu của hàng 5 ghép danh
// mục; đáp án đếm bằng vị từ viết tay ở đây, không gọi hàm lọc đang đo.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import type { StandardStatus } from "@quy-hang/core/listing";
import { COT, COT_AN_MAC_DINH, COT_MAC_DINH, STATUS_LABEL, dinhDangGia, type CotId, type DongBang } from "./cot";
import { chiMuc, thuocTinhCan } from "./ghep-danh-muc";
import { locDong, sapDong, soOLocDangChay, type BoLocCot } from "./loc";
import { nhomDong } from "./nhom";

type HangMau = { ma: string; maCan: string; trangThai: StandardStatus; gia: number; dieuKienPhi: string };
const goi = JSON.parse(readFileSync(fileURLToPath(new URL("../../../../../../packages/db/seed/mau/du-lieu-mau.json", import.meta.url)), "utf8")) as {
  danhMuc: CatalogData;
  hang: HangMau[];
};
const idx = chiMuc(goi.danhMuc);
const toaCua = new Map(goi.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => [u.unitNumber, b.buildingName] as const))));

/** Dòng bảng dựng từ hàng mẫu — trường ngoài gói mẫu điền theo chỉ số để mọi cột có giá trị khác nhau. */
const DONG: DongBang[] = goi.hang.map((h, i) => {
  const toa = toaCua.get(h.maCan)!;
  return {
    id: h.ma,
    buildingName: toa,
    unitNumber: h.maCan,
    ...thuocTinhCan(idx, toa, h.maCan),
    standardStatus: h.trangThai,
    listPrice: h.gia,
    feeInclusion: h.dieuKienPhi === "bao_phi" ? "included" : "excluded",
    furnished: i % 4 === 0 ? "[Mẫu] Nội thất đầy đủ" : null,
    legalStatus: i % 2 === 0 ? "[Mẫu] Sổ hồng" : "[Mẫu] Hợp đồng mua bán",
    financing: i % 5 === 0 ? "[Mẫu] Đang vay ngân hàng" : null,
    occupantType: i % 3 === 0 ? "[Mẫu] Đang cho thuê" : "[Mẫu] Để trống",
    confirmedAgeDays: i % 3 === 0 ? null : i,
    needsCallBack: i >= 14,
    completeness: i % 6,
    visibility: i % 2 === 0 ? "Company" : "Private",
    closePrice: h.trangThai === "Closed" ? h.gia : null,
    closeDate: h.trangThai === "Closed" ? `2026-10-${String(10 + (i % 18)).padStart(2, "0")}` : null,
    withdrawnReason: h.trangThai === "Withdrawn" ? (i % 2 ? "unreachable" : "owner_changed_mind") : null,
  };
});

const dem = (f: (d: DongBang) => boolean) => DONG.filter(f).length;
const TY = 1e9;

// Ma trận viết trước: mỗi cột lọc được (19 cột) một ca đúng kiểu của cột, đáp án là vị từ viết tay.
const MA_TRAN: [CotId, string, (d: DongBang) => boolean][] = [
  ["buildingName", "Toà B", (d) => d.buildingName === "Toà B"],
  ["unitNumber", "a-1", (d) => (d.unitNumber ?? "").toLowerCase().includes("a-1")],
  ["unitType", "2PN", (d) => d.unitType === "2PN"],
  ["livingArea", ">70", (d) => (d.livingArea ?? -1) > 70],
  ["floor", "5-10", (d) => d.floor !== null && d.floor >= 5 && d.floor <= 10],
  ["directionFaces", "dong", (d) => (d.directionFaces ?? "").startsWith("Đông")],
  ["standardStatus", "Active", (d) => d.standardStatus === "Active"],
  ["listPrice", "<=5", (d) => d.listPrice !== null && d.listPrice <= 5 * TY],
  ["feeInclusion", "included", (d) => d.feeInclusion === "included"],
  ["furnished", "day du", (d) => d.furnished === "[Mẫu] Nội thất đầy đủ"],
  ["legalStatus", "SỔ HỒNG", (d) => d.legalStatus === "[Mẫu] Sổ hồng"],
  ["financing", "vay", (d) => d.financing !== null],
  ["occupantType", "cho thuê", (d) => d.occupantType === "[Mẫu] Đang cho thuê"],
  ["confirmedAgeDays", "<14", (d) => d.confirmedAgeDays !== null && d.confirmedAgeDays < 14],
  ["completeness", ">=3", (d) => (d.completeness ?? -1) >= 3],
  ["visibility", "Private", (d) => d.visibility === "Private"],
  ["closePrice", "4,5-5", (d) => d.closePrice !== null && d.closePrice >= 4.5 * TY && d.closePrice <= 5 * TY],
  ["closeDate", "2026-10-1", (d) => (d.closeDate ?? "").startsWith("2026-10-1")],
  ["withdrawnReason", "unreachable", (d) => d.withdrawnReason === "unreachable"],
];

test("lọc: mọi cột của bảng đều có một ca trong ma trận (không cột nào thiếu ô lọc)", () => {
  assert.deepEqual(MA_TRAN.map(([id]) => id).sort(), COT.map((c) => c.id).sort());
});

for (const [id, gia, vt] of MA_TRAN) {
  test(`lọc cột ${id} = «${gia}»`, () => {
    const mong = dem(vt);
    assert.ok(mong > 0 && mong < DONG.length, `ca của cột ${id} phải chọn ra một phần — đáp án ${mong}`);
    assert.equal(locDong(DONG, { [id]: gia }).length, mong, `cột ${id}`);
  });
}

test("lọc: ba ô cùng lúc ra giao của ba tập", () => {
  const loc: BoLocCot = { standardStatus: "Active", listPrice: "<=5", buildingName: "Toà A" };
  const mong = dem((d) => d.standardStatus === "Active" && d.listPrice !== null && d.listPrice <= 5 * TY && d.buildingName === "Toà A");
  assert.equal(locDong(DONG, loc).length, mong);
  assert.equal(soOLocDangChay(loc), 3);
});

test("lọc: rỗng ra đủ 40, không khớp ra 0, luật số sai không lọc", () => {
  assert.equal(locDong(DONG, {}).length, 40);
  assert.equal(locDong(DONG, { unitNumber: "zzz" }).length, 0);
  assert.equal(locDong(DONG, { listPrice: ">>abc" }).length, 40);
  assert.equal(soOLocDangChay({ listPrice: ">>abc" }), 0);
});

test("đối chứng đỏ: một cột bị bỏ khỏi bảng cột thì ca ma trận của nó lộ ra", () => {
  const thieu = COT.filter((c) => c.id !== "financing").map((c) => c.id);
  assert.notDeepEqual(MA_TRAN.map(([id]) => id).sort(), thieu.sort(), "thiếu cột financing phải làm phép so cột đỏ");
});

test("sắp: Giá tăng dần, ô trống xuống cuối", () => {
  const ds = sapDong(DONG, [{ id: "listPrice", desc: false }]).map((d) => d.listPrice);
  const coGia = ds.filter((v): v is number => v !== null);
  assert.deepEqual(coGia, [...coGia].sort((a, b) => a - b));
});

test("nhóm: Toà → Loại căn, số căn các nhóm con cộng bằng nhóm toà, số dòng đếm liền", () => {
  const cay = nhomDong(DONG, "toa-loai");
  assert.deepEqual(cay.map((n) => (n.kind === "nhom" ? n.label : "")), ["Toà A", "Toà B"]);
  for (const n of cay) {
    assert.ok(n.kind === "nhom");
    const con = n.subRows.map((c) => (c.kind === "nhom" ? c.soCan : 0));
    assert.equal(con.reduce((a, b) => a + b, 0), n.soCan, `nhóm ${n.label}`);
  }
  const stt: number[] = [];
  const di = (ds: ReturnType<typeof nhomDong>) => ds.forEach((d) => (d.kind === "can" ? stt.push(d.stt) : di(d.subRows)));
  di(cay);
  assert.deepEqual(stt, Array.from({ length: 40 }, (_, i) => i + 1));
  assert.equal(nhomDong(DONG, "khong").every((d) => d.kind === "can"), true);
});

test("cột mặc định: mười sáu cột đúng thứ tự, ba cột ẩn", () => {
  assert.deepEqual(
    [...COT_MAC_DINH],
    ["buildingName", "unitNumber", "unitType", "livingArea", "floor", "directionFaces", "standardStatus", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType", "confirmedAgeDays", "completeness", "visibility"],
  );
  assert.deepEqual([...COT_AN_MAC_DINH], ["closePrice", "closeDate", "withdrawnReason"]);
  assert.deepEqual(
    COT.filter((c) => COT_MAC_DINH.includes(c.id)).map((c) => c.label),
    ["Toà", "Mã căn", "Loại căn", "Diện tích", "Tầng", "Hướng", "Trạng thái", "Giá", "Phí", "Nội thất", "Pháp lý", "Tài chính", "Tình trạng sử dụng", "Xác nhận", "Mức đủ", "Ai thấy"],
  );
});

test("định dạng giá và nhãn trạng thái", () => {
  assert.equal(dinhDangGia(4_650_000_000), "4,65 tỷ");
  assert.equal(dinhDangGia(950_000_000), "950 triệu");
  assert.equal(dinhDangGia(null), "—");
  assert.deepEqual(STATUS_LABEL, {
    Incomplete: "Chưa đủ để rao",
    Active: "Đang bán",
    Pending: "Đang giao dịch",
    Closed: "Đã bán",
    Hold: "Tạm ngừng",
    Withdrawn: "Ngừng hẳn",
  });
});
