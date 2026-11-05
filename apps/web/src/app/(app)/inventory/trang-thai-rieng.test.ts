// Trạng thái riêng trên Bảng hàng (hàng 46): chữ ô, huy hiệu, thẻ điện thoại, thực đơn trình sửa ô, lọc theo trạng thái
// chuẩn, áp lạc quan trên máy — E3c, E4b, E6, E10 và ca «mã đã gỡ» của Review Focus. Bảng mong đợi viết tay; dữ liệu mẫu.
import assert from "node:assert/strict";
import { test } from "node:test";
import { tuVungTuBang, type TuVung } from "@quy-hang/core/labels";
import { TRANSITIONS, STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { nhanTuBang, type NhanTrangThai } from "@quy-hang/core/statuses";
import { apTrenMay, banTrenMay } from "@/lib/sync/ap-tren-may";
import { canMau, NGAY, suKien } from "@/lib/sync/mau.test-helpers";
import { nganTrong, type Ngan } from "@/lib/sync/types";
import { chuTrangThaiThe } from "./cards/the";
import { dungLenhTrangThai, luaChonTrangThai, type HangSua } from "./cell-edit/lenh";
import { chuCuaO, mauTrangThai, type DongBang } from "./cot";
import { locDong, luaChon } from "./loc";

const NHAN: NhanTrangThai[] = [{ ma: "giu_cho", label: "Giữ chỗ", anchor: "Pending" }];
const TV: TuVung = { truong: {}, giaTri: {}, trangThai: NHAN };

const dong = (id: string, standardStatus: StandardStatus, statusLabel: string | null = null): DongBang => ({
  id,
  buildingName: "Toà A",
  unitNumber: `A-${id}`,
  unitType: "2PN",
  livingArea: 68.5,
  floor: 12,
  directionFaces: "Đông Nam",
  standardStatus,
  statusLabel,
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  furnished: null,
  legalStatus: "pink_book",
  financing: null,
  occupantType: "vacant",
  confirmedAgeDays: 2,
  needsCallBack: false,
  completeness: 5,
  visibility: "Company",
  closePrice: null,
  closeDate: null,
  withdrawnReason: null,
});

const hang = (standardStatus: StandardStatus, statusLabel: string | null = null): HangSua => dong("h", standardStatus, statusLabel);

test("bảng hàng: nhãn của căn", () => {
  const o = (d: DongBang) => chuCuaO(d, "standardStatus", TV);
  assert.equal(o(dong("1", "Pending", "giu_cho")), "Giữ chỗ");
  assert.equal(o(dong("2", "Pending")), "Đang giao dịch");
  assert.equal(o(dong("3", "Active", "giu_cho")), "Đang bán", "mã neo lệch → nhãn mặc định");
  assert.equal(o(dong("4", "Pending", "da_go")), "Đang giao dịch", "mã đã gỡ → nhãn mặc định");
  assert.equal(mauTrangThai(dong("1", "Pending", "giu_cho")), mauTrangThai(dong("2", "Pending")));
  assert.equal(chuTrangThaiThe(dong("1", "Pending", "giu_cho"), TV), "Giữ chỗ");

  // Thực đơn từ căn Active: mỗi nấc nhãn mặc định rồi nhãn riêng neo vào nó.
  const tuActive = luaChonTrangThai(hang("Active"), NHAN);
  assert.deepEqual(
    tuActive.map((l) => l.chu),
    ["Đang giao dịch", "Giữ chỗ", "Đã bán", "Tạm ngừng", "Ngừng hẳn"],
  );
  const giu = tuActive.find((l) => l.chu === "Giữ chỗ")!;
  const kq = dungLenhTrangThai(hang("Active"), giu.to, { label: giu.label });
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "status_changed", payload: { to: "Pending", label: "giu_cho" } });

  // Từ căn Pending/giu_cho: thêm «Đang giao dịch» cùng nấc — về nhãn mặc định.
  const tuGiu = luaChonTrangThai(hang("Pending", "giu_cho"), NHAN);
  const veMacDinh = tuGiu.find((l) => l.to === "Pending" && l.chu === "Đang giao dịch");
  assert.ok(veMacDinh, "thiếu lựa chọn «Đang giao dịch» cùng nấc");
  const kq2 = dungLenhTrangThai(hang("Pending", "giu_cho"), veMacDinh.to, { label: veMacDinh.label });
  assert.ok(kq2.ok);
  assert.deepEqual(kq2.lenh, { type: "status_changed", payload: { to: "Pending", label: null } });
  assert.ok(!tuGiu.some((l) => l.to === "Pending" && l.label === "giu_cho"), "không lựa chọn nhãn căn đang mang");
});

test("bảng hàng: mã đã gỡ", () => {
  // Bộ nhãn tải về cũ hơn máy chủ hay nhãn vừa gỡ: ô hiện chữ mặc định, thực đơn không còn lựa chọn mang mã ấy.
  assert.equal(chuCuaO(dong("1", "Pending", "da_go"), "standardStatus", TV), "Đang giao dịch");
  const ds = luaChonTrangThai(hang("Pending", "da_go"), NHAN);
  assert.ok(!ds.some((l) => l.label === "da_go"));
  assert.ok(!ds.some((l) => l.chu === "da_go"));
});

test("bảng hàng: nấc của căn mang nhãn", () => {
  const ds = luaChonTrangThai(hang("Pending", "giu_cho"), NHAN);
  const nac = [...new Set(ds.filter((l) => l.to !== "Pending").map((l) => l.to))];
  assert.deepEqual(nac, ["Active", "Closed", "Withdrawn"]);
  assert.deepEqual(nac, [...TRANSITIONS.Pending]);

  // Áp lạc quan trên máy: đổi nhãn tại chỗ qua luật nhãn của lõi, không qua bảng chuyển.
  const { view } = canMau("h", "[Toà A]", [suKien(2, "status_changed", { to: "Active" }), suKien(3, "status_changed", { to: "Pending" })]);
  assert.equal(view.standardStatus, "Pending");
  assert.equal(view.statusLabel ?? null, null);
  const goc = (): Ngan => ({ ...nganTrong(), listings: [view], lastPullAt: NGAY, lastAttempt: "ok" });
  const dat = apTrenMay(goc(), "h", "status_changed", { to: "Pending", label: "giu_cho" }, NGAY, "op-1", undefined, NHAN);
  assert.ok(dat.ok, dat.ok ? "" : JSON.stringify(dat.loi));
  assert.equal(dat.ngan.queue.length, 1);
  const sauDat = banTrenMay(view, dat.ngan.queue);
  assert.equal(sauDat.statusLabel, "giu_cho");
  assert.equal(sauDat.standardStatus, "Pending");

  const n0 = goc();
  const trung = apTrenMay(n0, "h", "status_changed", { to: "Pending", label: null }, NGAY, "op-2", undefined, NHAN);
  assert.equal(trung.ok, false, "đổi nhãn sang đúng nhãn đang mang phải bị từ chối");
  assert.deepEqual(n0.queue, []);
});

test("bảng hàng: lọc theo trạng thái chuẩn", () => {
  const NAM = [dong("1", "Pending", "giu_cho"), dong("2", "Pending"), dong("3", "Active"), dong("4", "Pending", "giu_cho"), dong("5", "Hold")];
  // Lọc «Đang giao dịch» theo trạng thái chuẩn: gồm cả căn mang «Giữ chỗ».
  assert.deepEqual(
    locDong(NAM, { standardStatus: "Pending" }).map((d) => Number(d.id)),
    [1, 2, 4],
  );
  const mong = [
    { value: "Pending", label: "Đang giao dịch" },
    { value: "Active", label: "Đang bán" },
    { value: "Hold", label: "Tạm ngừng" },
  ];
  // Thứ tự lựa chọn là thứ tự chữ (luật có từ hàng 45 của `luaChon`); bài so tập lựa chọn theo giá trị.
  const theoGiaTri = (a: { value: string }, b: { value: string }) => a.value.localeCompare(b.value);
  assert.deepEqual([...luaChon(NAM, "standardStatus", TV)].sort(theoGiaTri), [...mong].sort(theoGiaTri));
  assert.ok(!luaChon(NAM, "standardStatus", TV).some((o) => o.label === "Giữ chỗ"));
});

test("bảng hàng: sàn chưa thêm nhãn", () => {
  const MAC_DINH: Record<StandardStatus, string> = {
    Incomplete: "Chưa đủ để rao",
    Active: "Đang bán",
    Pending: "Đang giao dịch",
    Closed: "Đã bán",
    Hold: "Tạm ngừng",
    Withdrawn: "Ngừng hẳn",
  };
  const RONG: TuVung = { truong: {}, giaTri: {}, trangThai: [] };
  for (const tv of [RONG, tuVungTuBang({ fields: [], values: [] }), undefined]) {
    const chu = Object.fromEntries(STANDARD_STATUSES.map((s) => [s, chuCuaO(dong("x", s), "standardStatus", tv)]));
    assert.deepEqual(chu, MAC_DINH);
    for (const s of STANDARD_STATUSES) {
      const ds = luaChonTrangThai(hang(s), tv?.trangThai);
      assert.deepEqual(
        ds.map((l) => l.to),
        [...TRANSITIONS[s]],
        s,
      );
      assert.ok(ds.every((l) => l.label === null && l.chu === MAC_DINH[l.to]), s);
    }
  }
});

test("bảng hàng: từ vựng của sàn đọc bộ nhãn trạng thái", () => {
  // Thân API viết trước (khuôn `code`); `tuVungTuBang` cho cùng bộ nhãn với `nhanTuBang` của lõi.
  const than = {
    fields: [],
    values: [],
    statuses: [
      { status: "Active", default: "Đang bán", labels: [] },
      { status: "Pending", default: "Đang giao dịch", labels: [{ code: "giu_cho", label: "Giữ chỗ", inUse: 2 }] },
      { status: "Lạ", default: "?", labels: [{ code: "la", label: "Lạ", inUse: 0 }] },
      { status: "Hold", default: "Tạm ngừng", labels: [{ code: "Sai Ma", label: "Sai", inUse: 0 }] },
    ],
  };
  assert.deepEqual(tuVungTuBang(than).trangThai, NHAN);
  assert.deepEqual(tuVungTuBang(than).trangThai, nhanTuBang(than));
  // Thân chưa có `statuses` (API đời trước) → từ vựng không khoá nhãn trạng thái, chữ mặc định.
  assert.equal(Object.hasOwn(tuVungTuBang({ fields: [], values: [] }), "trangThai"), false);
});
