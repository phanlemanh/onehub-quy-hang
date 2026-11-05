// Bảng quyền thao tác × vai của hàng (hàng bang-quyen-theo-vai, AC-1). Bảng 56 ô là tệp dữ liệu viết trước — bộ kiểm API
// (packages/api/test-db/bang-quyen-theo-vai/) và bộ kiểm cách ly (packages/db/tests/isolation.test.mjs) nạp CÙNG tệp.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { duocLamVoiHang, lamViecVoiHang, lopPhuHoSo, soBangQuyenHang, THAO_TAC_HANG, type DongBangQuyen } from ".";

const BANG: DongBangQuyen[] = JSON.parse(readFileSync(new URL("./bang-quyen-hang.json", import.meta.url), "utf8"));
const NGUOI = "u-nguoi-xem";
const KHAC = "u-dau-chu-khac";

/** Người giữ căn mới nhất theo quan hệ của dòng; «tung» ở lõi như «khac» — lõi chỉ biết dòng gán mới nhất. */
const nguoiGiu = (giu: DongBangQuyen["giu"]): string | null => (giu === "minh" ? NGUOI : giu === "chua" ? null : KHAC);

test("bảng quyền hàng: lõi khớp từng ô", () => {
  assert.equal(BANG.length, 14);
  assert.deepEqual([...THAO_TAC_HANG], ["xem", "tao", "sua", "dua_len_dang_ban"]);
  let so = 0;
  for (const o of BANG) {
    for (const t of THAO_TAC_HANG) {
      const ra = duocLamVoiHang({ userId: NGUOI, roles: o.vai }, t, nguoiGiu(o.giu));
      assert.equal(ra, o[t], `«${o.o}» × ${t}: mong ${o[t]}, được ${ra}`);
      so++;
    }
  }
  assert.equal(so, BANG.length * THAO_TAC_HANG.length);
  assert.equal(so, 56);
});

test("bảng quyền hàng: cờ Sẵn sàng bán của hồ sơ căn đọc cùng luật", () => {
  let so = 0;
  for (const o of BANG) {
    const co = lopPhuHoSo({ userId: NGUOI, roles: o.vai }, nguoiGiu(o.giu)).sanSang;
    assert.equal(co, o.dua_len_dang_ban, `«${o.o}»: cờ Sẵn sàng bán ${co}, bảng ${o.dua_len_dang_ban}`);
    so++;
  }
  assert.equal(so, 14);
});

test("bảng quyền hàng: đổi một ô thì đỏ, nêu ca và thao tác", () => {
  assert.deepEqual(soBangQuyenHang(BANG), [], "bảng thật phải khớp hàm thật");
  const banSao = BANG.map((o) => (o.o === "Đầu khách" ? { ...o, dua_len_dang_ban: true } : o));
  const lech = soBangQuyenHang(banSao);
  assert.equal(lech.length, 1);
  assert.match(lech[0]!, /«Đầu khách» × dua_len_dang_ban/);
  // Đối chứng: hàm thay cho Đầu khách đưa lên Đang bán thì bảng thật đỏ đúng ô ấy.
  const hamHo = (v: { userId: string; roles: readonly string[] }, t: (typeof THAO_TAC_HANG)[number], g: string | null) =>
    t === "dua_len_dang_ban" && v.roles.includes("buyer_agent") && !v.roles.includes("telesales") ? true : duocLamVoiHang(v, t, g);
  assert.ok(soBangQuyenHang(BANG, hamHo).some((d) => d.startsWith("«Đầu khách» × dua_len_dang_ban")));
});

test("bảng quyền hàng: người có Bảng hàng là người có một trong ba vai", () => {
  for (const [vai, mong] of [
    [["telesales"], false],
    [["company_admin"], false],
    [["listing_agent"], true],
    [["buyer_agent"], true],
    [["team_lead"], true],
    [["telesales", "team_lead"], true],
    [[], false],
  ] as const) {
    assert.equal(lamViecVoiHang({ roles: vai }), mong, vai.join("+") || "không vai");
  }
});
