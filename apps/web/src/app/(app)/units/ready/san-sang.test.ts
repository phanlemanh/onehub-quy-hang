// «Sẵn sàng bán» ở hồ sơ căn (hàng 23) — E4, E5, E5b, E6, E10; hàng vá va-san-sang-ban — VSSB-E1…E5. Phần thuần: không React,
// không mạng.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import { dungLenhTrangThai, moTaLoi, type HangSua } from "../../inventory/cell-edit/lenh";
import { bamSanSang, CHU_ANH_CAP_NHAT, dauCuaCan, demAnhThat, hienNutSanSang, kiemSanSang, thieuHienTai, type KetQuaGui } from "./san-sang";

const DU: HangSua = { id: "h1", unitNumber: "A-0601", listPrice: 3_250_000_000, feeInclusion: "included", standardStatus: "Incomplete", legalStatus: "pink_book", occupantType: "vacant" };
/** Ảnh dạng phản hồi của API ảnh (kiểu UnitPhoto của lõi). */
const anh = (compartment: UnitPhoto["compartment"], isSample = false): UnitPhoto => ({
  id: `p-${Math.random().toString(36).slice(2, 8)}`,
  buildingName: "Toà A",
  unitNumber: "A-0601",
  compartment,
  displayOrder: 0,
  isCover: false,
  isSample,
  takenAt: null,
  contentType: "image/jpeg",
  byteSize: 1000,
  width: 10,
  height: 10,
  addedAt: "2026-11-01T00:00:00Z",
} as UnitPhoto);

test("E4 khi nào có nút: 6 trạng thái × 2 quyền viết trước", () => {
  const CO: Record<StandardStatus, [boolean, boolean]> = {
    Incomplete: [true, false],
    Active: [false, false],
    Pending: [false, false],
    Closed: [false, false],
    Hold: [true, false],
    Withdrawn: [false, false],
  };
  let so = 0;
  for (const tt of STANDARD_STATUSES) {
    assert.equal(hienNutSanSang(tt, true), CO[tt][0], `${tt}, sửa được`);
    assert.equal(hienNutSanSang(tt, false), CO[tt][1], `${tt}, không sửa được`);
    so += 2;
  }
  assert.equal(so, 12);
  const nguon = readFileSync(fileURLToPath(new URL("../ho-so/cot-ho-so.tsx", import.meta.url)), "utf8");
  assert.match(nguon, /from "\.\.\/ready\/nut-san-sang"/, "hồ sơ căn không nhập nút");
  // Hồ sơ dựng nút rồi trao vào khe «Sẵn sàng bán»; hai thân (cột, điện thoại) đặt khe ấy trong mục «Lần rao đang mở».
  assert.match(nguon, /sanSang: m\.hienSanSang \? <NutSanSang /, "hồ sơ không trao nút vào khe");
  for (const tep of ["../ho-so/than-cot.tsx", "../ho-so/dien-thoai/than-dien-thoai.tsx"]) {
    const than = readFileSync(fileURLToPath(new URL(tep, import.meta.url)), "utf8");
    const muc = than.slice(than.indexOf('"Lần rao đang mở"'), than.indexOf("</Muc>", than.indexOf('"Lần rao đang mở"')));
    assert.match(muc, /khe\.sanSang/, `${tep}: nút không nằm trong mục «Lần rao đang mở»`);
  }
});

test("E5 chỉ đúng chỗ thiếu: ma trận viết trước", () => {
  const CA: [string, Partial<HangSua>, number, [string, string][]][] = [
    ["thiếu giá", { listPrice: null }, 1, [["Giá về tay", "gia"]]],
    ["thiếu điều kiện phí", { feeInclusion: null }, 1, [["Giá về tay", "gia"]]],
    ["thiếu ảnh", {}, 0, [["Ảnh thật", "anh"]]],
    ["chưa có mã căn (không báo thêm ảnh)", { unitNumber: null }, 0, [["Mã căn", "ma"]]],
    ["thiếu pháp lý", { legalStatus: null }, 1, [["Pháp lý", "legalStatus"]]],
    ["thiếu tình trạng sử dụng", { occupantType: null }, 1, [["Tình trạng sử dụng", "occupantType"]]],
    [
      "thiếu cả năm",
      { listPrice: null, feeInclusion: null, legalStatus: null, occupantType: null },
      0,
      [["Giá về tay", "gia"], ["Ảnh thật", "anh"], ["Pháp lý", "legalStatus"], ["Tình trạng sử dụng", "occupantType"]],
    ],
  ];
  for (const [ten, doi, soAnh, mong] of CA) {
    const kq = kiemSanSang({ ...DU, ...doi }, soAnh);
    assert.deepEqual(kq.thieu.map((t) => [t.nhan, t.dich]), mong, ten);
    assert.equal(kq.lenh, null, `${ten}: không lệnh`);
  }
  assert.deepEqual(kiemSanSang(DU, 1).thieu, [], "đủ → rỗng");
});

test("E5b đếm ảnh thật như máy chủ: ma trận viết trước", () => {
  const CA: [string, UnitPhoto[], number][] = [
    ["không ảnh", [], 0],
    ["chỉ ảnh mẫu Gửi được", [anh("shareable", true)], 0],
    ["chỉ ảnh Nội bộ", [anh("internal")], 0],
    ["ảnh đã xoá (API không trả)", [], 0],
    ["một ảnh thật", [anh("shareable")], 1],
    ["hai thật, một mẫu, một nội bộ", [anh("shareable"), anh("shareable"), anh("shareable", true), anh("internal")], 2],
  ];
  for (const [ten, ds, mong] of CA) assert.equal(demAnhThat(ds), mong, `${ten}: đếm ${demAnhThat(ds)}`);
});

test("E6 đủ thì gửi đúng một lệnh của trình sửa ô", async () => {
  const kq = kiemSanSang(DU, 1);
  // Cờ «Sẵn sàng bán» true: nút chỉ hiện cho người đủ cờ (bảng quyền của hàng).
  const tuO = dungLenhTrangThai(DU, "Active", {}, true);
  assert.ok(tuO.ok && "lenh" in tuO);
  assert.deepEqual(kq.lenh, tuO.lenh, `payload: ${JSON.stringify(kq.lenh)}`);
  const da: unknown[] = [];
  const gui = async (l: unknown): Promise<KetQuaGui> => (da.push(l), { ok: true });
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable")] }), gui }), { kind: "da-gui" });
  assert.deepEqual(da, [{ type: "status_changed", payload: { to: "Active" } }]);
  const tt = await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable", true)] }), gui });
  assert.equal(tt.kind, "thieu");
  assert.equal(da.length, 1, "còn thiếu mà vẫn gửi");
});

test("E10 ngoại tuyến hay đọc ảnh lỗi: «Cần mạng để kiểm ảnh», không gửi", async () => {
  let gui = 0;
  const g = async (): Promise<KetQuaGui> => (gui++, { ok: true });
  const loi = async () => {
    throw new TypeError("Failed to fetch");
  };
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: loi, gui: g }), { kind: "can-mang" }, "đọc ảnh lỗi không được coi là 0 ảnh");
  assert.deepEqual(await bamSanSang(DU, { onLine: false, docAnh: async () => ({ anh: [anh("shareable")] }), gui: g }), { kind: "can-mang" });
  assert.equal(gui, 0);
  assert.deepEqual(await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable")] }), gui: g }), { kind: "da-gui" }, "đối chứng");
  const nguon = readFileSync(fileURLToPath(new URL("./nut-san-sang.tsx", import.meta.url)), "utf8");
  assert.match(nguon, /disabled=\{!coMang \|\| dang\}/, "nút không mờ khi ngoại tuyến");
  assert.match(nguon, /CHU_CAN_MANG_KIEM_ANH/, "thiếu chữ «Cần mạng để kiểm ảnh»");
});

// ——— Hàng vá va-san-sang-ban ———
const NUT = () => readFileSync(fileURLToPath(new URL("./nut-san-sang.tsx", import.meta.url)), "utf8");
const COT = () => readFileSync(fileURLToPath(new URL("../ho-so/cot-ho-so.tsx", import.meta.url)), "utf8");

test("VSSB-E1 dấu «Chưa có» gắn với lần rao đã bấm", () => {
  const kq = { id: "lan-A1", dich: ["gia", "legalStatus"] as const };
  // [lần rao đang xem, dấu mong đợi] — A2 là lần rao khác của cùng căn A (cùng mã căn, khác mã lần rao).
  const CA: [string, string[]][] = [
    ["lan-B", []],
    ["lan-A2", []],
    ["lan-A1", ["gia", "legalStatus"]],
  ];
  for (const [id, mong] of CA) assert.deepEqual([...dauCuaCan(kq, id)], mong, `lần rao ${id}`);
  assert.deepEqual([...dauCuaCan(null, "lan-A1")], [], "chưa bấm ở đâu");
  assert.match(COT(), /<NutSanSang key=\{can\.id\} /, "nút không dựng lại theo mã lần rao");
});

test("VSSB-E2 nút gỡ ra thì dấu «Chưa có» của lần rao ấy không còn", () => {
  assert.match(NUT(), /useEffect\(\(\) => \(\) => onThieu\(id, \[\]\), \[id, onThieu\]\)/, "thiếu hàm dọn onThieu(id, [])");
  assert.deepEqual([...dauCuaCan({ id: "lan-A1", dich: [] }, "lan-A1")], [], "hàm dọn để lại dấu");
});

test("VSSB-E3 danh sách suy lại từ hàng đang xem: ma trận viết trước", async () => {
  let gui = 0;
  const g = async (): Promise<KetQuaGui> => (gui++, { ok: true });
  const bam = async (hang: HangSua, soAnh: number) => {
    const tt = await bamSanSang(hang, { onLine: true, docAnh: async () => ({ anh: Array.from({ length: soAnh }, () => anh("shareable")) }), gui: g });
    assert.equal(tt.kind, "thieu", "lần bấm phải ra danh sách");
    return tt;
  };
  const nhan = (tt: Awaited<ReturnType<typeof bam>>, hang: HangSua) => thieuHienTai(tt, hang).map((t) => t.nhan);
  // [ca, hàng lúc bấm, số ảnh, danh sách lúc bấm, hàng sau khi điền, danh sách sau khi điền]
  const CA: [string, Partial<HangSua>, number, string[], Partial<HangSua>, string[]][] = [
    ["điền giá", { listPrice: null, legalStatus: null }, 1, ["Giá về tay", "Pháp lý"], { legalStatus: null }, ["Pháp lý"]],
    ["điền thêm pháp lý", { listPrice: null, legalStatus: null }, 1, ["Giá về tay", "Pháp lý"], {}, []],
    ["điền điều kiện phí", { feeInclusion: null }, 1, ["Giá về tay"], {}, []],
    ["điền tình trạng sử dụng", { occupantType: null }, 1, ["Tình trạng sử dụng"], {}, []],
    ["chưa có mã căn, 0 ảnh → điền mã căn", { unitNumber: null }, 0, ["Mã căn"], {}, ["Ảnh thật"]],
    ["chưa có mã căn, 1 ảnh → điền mã căn", { unitNumber: null }, 1, ["Mã căn"], {}, []],
    ["đủ trường, 0 ảnh", {}, 0, ["Ảnh thật"], {}, ["Ảnh thật"]],
    ["điền pháp lý, còn ảnh", { legalStatus: null }, 0, ["Ảnh thật", "Pháp lý"], {}, ["Ảnh thật"]],
  ];
  let so = 0;
  for (const [ten, luc, soAnh, truoc, sau, mong] of CA) {
    const tt = await bam({ ...DU, ...luc }, soAnh);
    assert.deepEqual(nhan(tt, { ...DU, ...luc }), truoc, `${ten}: lúc bấm`);
    assert.deepEqual(nhan(tt, { ...DU, ...sau }), mong, `${ten}: còn lại sau khi điền`);
    so++;
  }
  assert.equal(so, CA.length);
  assert.equal(gui, 0, "hết điều thiếu mà máy tự gửi");
  assert.deepEqual(thieuHienTai({ kind: "da-gui" }, DU), [], "ngoài trạng thái thiếu thì không danh sách");
  assert.match(NUT(), /CHU_ANH_CAP_NHAT/, "thiếu dòng «Ảnh thật cập nhật khi bấm lại»");
  assert.equal(CHU_ANH_CAP_NHAT, "Ảnh thật cập nhật khi bấm lại");
});

test("VSSB-E4 lệnh không vào hàng đợi: báo lỗi bằng câu của trình sửa ô, không «đã gửi»", async () => {
  const doc = async () => ({ anh: [anh("shareable")] });
  const CA: [string, () => Promise<KetQuaGui>, string][] = [
    ["luật trên máy thiếu pháp lý", async () => ({ ok: false, loi: { kind: "missing-requirement", missing: ["legalStatus"] } }), moTaLoi({ kind: "missing-requirement", missing: ["legalStatus"] })],
    ["kho trên máy lỗi", async () => ({ ok: false, loi: { kind: "kho" } }), "Máy chưa lưu được lần sửa — thử lại"],
    ["chuyển không hợp lệ", async () => ({ ok: false, loi: { kind: "invalid-transition", reason: "[Lý do R]" } }), "[Lý do R]"],
    ["hàm gửi ném lỗi", async () => {
      throw new Error("IndexedDB");
    }, "Máy chưa lưu được lần sửa — thử lại"],
  ];
  for (const [ten, gui, chu] of CA) {
    const tt = await bamSanSang(DU, { onLine: true, docAnh: doc, gui });
    assert.deepEqual(tt, { kind: "loi", chu }, `${ten}: kind ${tt.kind}`);
  }
  assert.equal(moTaLoi({ kind: "missing-requirement", missing: ["legalStatus"] }), "Thiếu pháp lý");
  const nguon = NUT();
  assert.match(nguon, /disabled=\{!coMang \|\| dang\}/, "nút bị khoá theo trạng thái lỗi");
  assert.match(nguon, /tt\.kind === "loi" \? <TrangThai kind="error"/, "lời báo lỗi không dùng TrangThai kiểu error");
});

test("VSSB-E5 lệnh vào hàng đợi: «đã gửi», đúng một lệnh (đối chứng)", async () => {
  const da: unknown[] = [];
  const tt = await bamSanSang(DU, { onLine: true, docAnh: async () => ({ anh: [anh("shareable")] }), gui: async (l) => (da.push(l), { ok: true }) });
  assert.deepEqual(tt, { kind: "da-gui" });
  // Cờ «Sẵn sàng bán» true: nút chỉ hiện cho người đủ cờ (bảng quyền của hàng).
  const tuO = dungLenhTrangThai(DU, "Active", {}, true);
  assert.ok(tuO.ok && "lenh" in tuO);
  assert.deepEqual(da, [tuO.lenh]);
});
