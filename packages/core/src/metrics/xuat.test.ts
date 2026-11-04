// Số đo «Số lần xuất bảng hàng» (hồ sơ phat-hang, hàng 43) — E9 · AC-9. Đầu vào là lần xuất như bảng `exports` giữ; kỳ nửa
// mở [tu, den) như mọi số đo của hàng 52.
import assert from "node:assert/strict";
import { test } from "node:test";
import { DANH_SACH_SO_DO } from "./danh-sach";
import { trongKy, type Ky } from "./hang";
import type { DauVaoSoDo, DongSoDo, LanXuat, MetricCode } from "./kieu";
import { boMau } from "./mau.fixture";
import { tinhSoDo } from "./so-do";
import { soLanXuat, SU_KIEN_XUAT_BANG_HANG } from "./xuat";

const TU = "2026-11-03T00:00:00.000Z";
const DEN = "2026-11-17T00:00:00.000Z";
const DANH_MUC = boMau("2026-10-01T01:00:00.000Z").danhMuc;

const dong = (rows: readonly DongSoDo[], ma: MetricCode) => rows.find((r) => r.ma === ma)!;
const tinh = (v: Partial<DauVaoSoDo>) => tinhSoDo({ tu: TU, den: DEN, hang: [], lead: [], danhMuc: DANH_MUC, ...v });
const xuat = (...at: string[]): LanXuat[] => at.map((createdAt) => ({ createdAt }));

/** Bộ cận: một lần đúng lúc tu, hai lần giữa kỳ, một lần đúng lúc den, một lần trước tu — đúng là 3. */
const CAN = xuat("2026-11-02T23:59:59.999Z", TU, "2026-11-05T02:00:00.000Z", "2026-11-16T23:59:59.999Z", DEN);

/** Chỗ lệch của một cách đếm trên bộ cận; rỗng là đúng. */
function choLechCan(dem: (l: readonly LanXuat[], ky: Ky) => number): string[] {
  const ky: Ky = { tu: Date.parse(TU), den: Date.parse(DEN) };
  const so = dem(CAN, ky);
  return so === 3 ? [] : [`ca cận: đếm ra ${so}, cần 3 (tính lúc tu, không tính lúc den)`];
}
const demThat = (l: readonly LanXuat[], ky: Ky) => {
  const r = soLanXuat(l, ky);
  assert.equal(r.kieu, "dem");
  return r.kieu === "dem" ? r.so : NaN;
};

test("số lần xuất: kỳ chứa 3 lần ra 3", () => {
  const r = dong(tinh({ lanXuat: xuat("2026-11-04T01:00:00.000Z", "2026-11-08T09:30:00.000Z", "2026-11-12T15:00:00.000Z", "2026-11-20T00:00:00.000Z") }), "sheet_publishes");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem");
  assert.equal(r.so, 3);
});

test("số lần xuất: cận dưới tính, cận trên không; chiều đỏ gọi tên số 4", () => {
  const r = dong(tinh({ lanXuat: CAN }), "sheet_publishes");
  assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem");
  assert.equal(r.so, 3);
  assert.deepEqual(choLechCan(demThat), []);
  // Chiều đỏ: bản sao tính cả cận trên → ca cận đỏ, nêu số 4.
  const tinhCaDen = (l: readonly LanXuat[], ky: Ky) => l.filter((x) => trongKy(ky, x.createdAt) || Date.parse(x.createdAt) === ky.den).length;
  assert.deepEqual(choLechCan(tinhCaDen), ["ca cận: đếm ra 4, cần 3 (tính lúc tu, không tính lúc den)"]);
});

test("số lần xuất: kỳ trống ra 0, không ra «chưa có sự kiện»", () => {
  for (const lanXuat of [[], xuat(DEN, "2026-10-01T00:00:00.000Z"), undefined]) {
    const r = dong(tinh(lanXuat === undefined ? {} : { lanXuat }), "sheet_publishes");
    assert.ok(r.trangThai === "do-duoc" && r.kieu === "dem", "sheet_publishes đo được");
    assert.equal(r.so, 0);
    assert.ok(!("thieu" in r));
  }
});

test("danh sách: sheet_publishes hết thiếu, các mã khác giữ nguyên", () => {
  assert.equal(DANH_SACH_SO_DO.find((m) => m.ma === "sheet_publishes")!.thieu, undefined);
  const conThieu = DANH_SACH_SO_DO.filter((m) => m.thieu !== undefined).map((m) => m.ma);
  assert.deepEqual(conThieu, ["inquiry_to_send", "customer_link_opens", "customer_interest"]);
  const rows = tinh({ lanXuat: xuat(TU) });
  assert.deepEqual(rows.filter((r) => r.trangThai === "chua-co-su-kien").map((r) => r.ma), conThieu);
});

test("hằng loại sự kiện: «Xuất bảng hàng» là export_created", () => {
  assert.equal(SU_KIEN_XUAT_BANG_HANG, "export_created");
});
