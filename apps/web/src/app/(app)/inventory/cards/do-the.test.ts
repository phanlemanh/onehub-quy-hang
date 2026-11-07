// Phép đo dòng của bảng thẻ khi khe bị ẩn (va-bang-hang-cuon-so-lon) — khoá vòng resizeItem → measureElement → onChange
// đã làm Bảng hàng sàn 5.000 căn sập (React #185). Bộ cuộn ảo thật của @tanstack/react-virtual. Khe điện thoại bị ẩn trên
// máy tính nhưng cuộn chung vùng cuộn ĐANG HIỆN của trang (cao 700 ở 1366×768): dòng ẩn đo ra 0 thì mọi dòng lọt khung
// nhìn. Mỗi «khung hình» đo mọi dòng đang dựng rồi báo kích thước về bộ cuộn.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Virtualizer } from "@tanstack/react-virtual";
import { doCaoThe, uocLuongDong, type PhanTuDo } from "./do-the";

const AN: PhanTuDo = { getClientRects: () => ({ length: 0 }), getBoundingClientRect: () => ({ height: 0 }) };
const HIEN = (cao: number): PhanTuDo => ({ getClientRects: () => ({ length: 1 }), getBoundingClientRect: () => ({ height: cao }) });

test("đo dòng: dòng ẩn trả ước lượng, dòng hiện trả chiều cao thật", () => {
  assert.equal(doCaoThe(AN, 128), 128, "dòng ẩn phải trả ước lượng, không trả 0");
  assert.equal(doCaoThe(AN, 56), 56);
  assert.equal(doCaoThe(HIEN(143), 128), 143, "dòng hiện phải trả chiều cao đo được");
  assert.equal(doCaoThe(HIEN(0), 128), 0, "dòng hiện mà cao 0 thật thì vẫn là 0 — chỉ khe ẩn mới dùng ước lượng");
  assert.equal(uocLuongDong("nhom"), 56);
  assert.equal(uocLuongDong("can"), 128);
});

/** Số dòng lớn nhất bộ cuộn đòi dựng qua `khung` lần đo, khi mọi dòng đo bằng `do`. */
function soDongDung(do_: (i: number) => number, count = 5000, khung = 40): number {
  let nhieuNhat = 0;
  const v = new Virtualizer<HTMLElement, HTMLElement>({
    count,
    getScrollElement: () => ({}) as HTMLElement,
    estimateSize: () => 128,
    overscan: 6,
    scrollToFn: () => {},
    observeElementRect: (_i, cb) => {
      cb({ width: 1366, height: 700 });
      return () => {};
    },
    observeElementOffset: (_i, cb) => {
      cb(0, false);
      return () => {};
    },
    onChange: () => {},
  });
  v._didMount();
  v._willUpdate();
  for (let k = 0; k < khung; k++) {
    const ds = v.getVirtualItems();
    nhieuNhat = Math.max(nhieuNhat, ds.length);
    for (const it of ds) v.resizeItem(it.index, do_(it.index));
  }
  return nhieuNhat;
}

test("khoá vòng #185: khe ẩn đo bằng doCaoThe thì bộ cuộn chỉ dựng vài dòng, không phình theo 5.000 căn", () => {
  // Trần: khung nhìn 700 chia dòng thấp nhất 56 (13 dòng) cộng hai lần đệm 6 — 25 dòng; số không đổi giữa 1 và 40 khung.
  const moi = soDongDung(() => doCaoThe(AN, 128));
  assert.ok(moi <= 25, `khe ẩn dựng ${moi} dòng — vòng đo đang phình`);
  assert.equal(soDongDung(() => doCaoThe(AN, 128), 5000, 1), moi, "số dòng dựng phải đứng yên qua các khung hình");
});

test("đối chứng: phép đo cũ (dòng ẩn cao 0) làm bộ cuộn dựng dần cả 5.000 dòng — đúng vòng đã làm sập màn", () => {
  // Mỗi khung hình đo ra 0 thì thêm dòng lọt khung nhìn: số dòng tăng không dừng (trên trang thật tới cả 5.000).
  const cu = soDongDung(() => 0);
  assert.ok(cu >= 100, `phép đo cũ chỉ dựng ${cu} dòng — bài kiểm không tái hiện được vòng`);
  assert.ok(soDongDung(() => 0, 5000, 80) > cu, "phép đo cũ phải tiếp tục phình khi thêm khung hình");
});
