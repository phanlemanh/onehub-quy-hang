// Màn Trạng thái (hàng 46): thân lưu, lỗi từng ô, khoá Lưu (E2c); hỏi nhãn thay khi gỡ nhãn đang dùng (E8b); trang gọi
// chặn mục sàn và đưa kết quả vào chuyển hướng (E9b).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { NHAN_TRANG_THAI_MAC_DINH } from "@quy-hang/core/statuses";

import {
  canHoi,
  cauHoi,
  chonThay,
  coTheLuu,
  coTheThem,
  doiChu,
  goNhan,
  loiCuaO,
  luaChonThay,
  manBanDau,
  oCuaNeo,
  thanLuu,
  themNhan,
  type BoTrangThaiMan,
  type DongNhanMan,
  type ManTrangThai,
} from "./trang-thai-thuan";

const DAY = dirname(fileURLToPath(import.meta.url));

/** Thân `GET /api/v1/company/statuses` viết trước: sáu trạng thái chuẩn, nhãn riêng theo neo. */
function bo(nhan: Partial<Record<StandardStatus, DongNhanMan[]>> = {}): BoTrangThaiMan {
  return { statuses: STANDARD_STATUSES.map((s) => ({ status: s, default: NHAN_TRANG_THAI_MAC_DINH[s], labels: nhan[s] ?? [] })) };
}

/** Thêm một ô mới ở nhóm `s` và gõ chữ vào nó. */
function themVaGo(m: ManTrangThai, s: StandardStatus, chu: string): { m: ManTrangThai; khoa: string } {
  const moi = themNhan(m, s);
  const o = moi.o[moi.o.length - 1];
  assert.ok(o && o.anchor === s && !o.code, `themNhan phải thêm ô mới ở nhóm ${s}`);
  return { m: doiChu(moi, o.khoa, chu), khoa: o.khoa };
}

test("màn trạng thái: thân lưu và khoá Lưu", () => {
  const dau = manBanDau(bo());
  const a = themVaGo(dau, "Pending", "Giữ chỗ");
  const b = themVaGo(a.m, "Hold", "");
  const m = b.m;
  // Ô mới rỗng ở nhóm Tạm ngừng bị bỏ khỏi thân, không lỗi.
  assert.deepEqual(thanLuu(m), { labels: [{ label: "Giữ chỗ", anchor: "Pending" }], replace: {} });
  assert.equal(loiCuaO(m, b.khoa), null);
  assert.equal(coTheLuu(m), true);

  // Trùng nhãn mặc định «Đang bán» (bỏ hoa thường, dấu cách thừa): lỗi gắn ô, Lưu khoá.
  const trung = doiChu(m, b.khoa, "  đang   BÁN ");
  const loiTrung = loiCuaO(trung, b.khoa);
  assert.ok(loiTrung && /Trùng tên trạng thái/.test(loiTrung) && loiTrung.includes("«Đang bán»"), `ô «Đang bán» phải lỗi trùng tên trạng thái, được: ${String(loiTrung)}`);
  assert.equal(coTheLuu(trung), false);

  // Số điện thoại, email trong nhãn: lỗi, Lưu khoá.
  const soDt = doiChu(m, b.khoa, "Gọi 0900 000 001");
  assert.equal(loiCuaO(soDt, b.khoa), "Chứa số điện thoại");
  assert.equal(coTheLuu(soDt), false);
  const email = doiChu(m, b.khoa, "[Tên]@vidu.vn");
  assert.equal(loiCuaO(email, b.khoa), "Chứa email");
  assert.equal(coTheLuu(email), false);

  // Nhóm đã có 3 nhãn còn sống: không thêm được nữa (themNhan không đổi màn).
  let day = manBanDau(bo());
  for (const chu of ["Giữ chỗ", "Đặt cọc", "Chờ ký"]) day = themVaGo(day, "Pending", chu).m;
  assert.equal(oCuaNeo(day, "Pending").length, 3);
  assert.equal(coTheThem(day, "Pending"), false);
  assert.equal(themNhan(day, "Pending"), day);
  assert.equal(coTheThem(day, "Hold"), true);
});

test("màn trạng thái: hỏi nhãn thay", () => {
  const dau = manBanDau(
    bo({
      Pending: [
        { code: "giu_cho", label: "Giữ chỗ", inUse: 2 },
        { code: "dat_coc", label: "Đặt cọc", inUse: 0 },
      ],
      // Nhãn của nhóm khác — không bao giờ được vào lựa chọn thay của nhóm Đang giao dịch.
      Hold: [{ code: "cho_giay", label: "Chờ giấy", inUse: 1 }],
    }),
  );
  const khoaCua = (m: ManTrangThai, code: string) => {
    const o = m.o.find((x) => x.code === code);
    assert.ok(o, `màn phải có ô ${code}`);
    return o;
  };

  // Gỡ nhãn không căn nào mang: không hỏi, thân không còn nó, replace rỗng.
  const m1 = goNhan(dau, "dat_coc");
  assert.equal(canHoi(khoaCua(m1, "dat_coc")), false);
  const than1 = thanLuu(m1);
  assert.equal(than1.labels.some((l) => l.code === "dat_coc"), false);
  assert.deepEqual(than1.replace, {});
  assert.equal(coTheLuu(m1), true);

  // Gỡ nhãn 2 căn đang mang: hỏi nhãn thay cùng nhóm; dat_coc đã gỡ trong lượt nên không có.
  const m2 = goNhan(m1, "giu_cho");
  const giu = khoaCua(m2, "giu_cho");
  assert.equal(canHoi(giu), true);
  assert.equal(cauHoi(giu), "2 căn đang là «Giữ chỗ». Chuyển chúng sang:");
  assert.deepEqual(luaChonThay(m2, "giu_cho"), [{ value: null, label: "Đang giao dịch" }]);
  // Chưa chọn nhãn thay: Lưu khoá.
  assert.equal(coTheLuu(m2), false);

  // Chọn nhãn mặc định: thân mang replace {giu_cho: null}, Lưu mở.
  const m3 = chonThay(m2, "giu_cho", null);
  assert.deepEqual(thanLuu(m3), { labels: [{ code: "cho_giay", label: "Chờ giấy", anchor: "Hold" }], replace: { giu_cho: null } });
  assert.equal(coTheLuu(m3), true);
});

test("màn trạng thái: trang gọi chặn mục sàn và chuyển hướng", () => {
  /** page.tsx gán kết quả chanMucSan vào một biến, đưa biến ấy vào redirect, cả hai trước khi đọc API của sàn. */
  const chanRoiChuyen = (nguon: string) => {
    const m = /const (\w+) = chanMucSan\(/.exec(nguon);
    if (!m) return false;
    const api = nguon.indexOf("/api/v1/company/");
    const chuyen = nguon.indexOf(`redirect(${m[1]})`, m.index);
    return api > 0 && chuyen > m.index && api > chuyen;
  };
  // Đối chứng dương: trang Cách gọi chặn và chuyển hướng trước khi đọc API.
  assert.equal(chanRoiChuyen(readFileSync(join(DAY, "..", "labels", "page.tsx"), "utf8")), true);
  const trang = readFileSync(join(DAY, "page.tsx"), "utf8");
  assert.ok(trang.includes("/api/v1/company/statuses"), "settings/statuses/page.tsx phải đọc GET /api/v1/company/statuses");
  assert.equal(chanRoiChuyen(trang), true, "settings/statuses/page.tsx phải gọi chanMucSan và redirect kết quả trước khi đọc API");
  // Chiều đỏ trên bản sao: bỏ dòng chặn, hay chặn mà không chuyển hướng, thì phép đo đỏ.
  assert.equal(chanRoiChuyen(trang.replace(/^.*chanMucSan\(.*$/m, "")), false);
  assert.equal(chanRoiChuyen(trang.replace(/if \(chan\) redirect\(chan\);/, "")), false);
});
