// E3, E5 (hàng 31) — không rò ở mọi tổ hợp: 3 cửa × 2 người nhận × 4 cấu hình (gồm mở nhất), quét JSON bản ra bằng mồi.
// Đối chứng dương trên CÙNG mồi: quét chính bản vào thì trúng đủ; bản sao hàm ra chép một trường nội bộ thì đỏ nêu trường.
import assert from "node:assert/strict";
import { test } from "node:test";
import { banRaNgoai, CAU_HINH_MAC_DINH, CAU_HINH_TAT_CA, canMoi, CUA_RA, giaTriMoi, kiemBanRa, NGUOI_NHAN, timRoRi } from ".";

const TODAY = "2026-11-03";

test("E3 không rò ở 24 tổ hợp", () => {
  assert.equal(CUA_RA.length * NGUOI_NHAN.length * CAU_HINH_TAT_CA.length, 24);
  assert.deepEqual(kiemBanRa(banRaNgoai, canMoi(), TODAY), []);
});

test("E3 đối chứng dương — quét chính bản vào trúng đủ mọi mồi", () => {
  const can = canMoi();
  const trung = timRoRi(JSON.stringify(can), giaTriMoi(can, "khach_rieng", CAU_HINH_MAC_DINH)).map((r) => r.truong);
  assert.deepEqual(trung, [
    "closePrice", "closeDate", "withdrawnReason", "holderUserId", "holderName", "customFields.canGoc", "ownerName",
    "ownerPhone", "floorPrice", "titleDeedPhoto", "contacts[0].id", "contacts[0].fullName", "contacts[0].phones[0]",
    "contacts[1].id", "contacts[1].fullName", "contacts[1].phones[0]", "photos[moi-anh-noi-bo-1]",
    "photos[moi-anh-noi-bo-2]", "unitNumber", "upi", "stack",
  ]);
});

test("E3 chiều đỏ — bản sao hàm ra chép ownerPhone, floorPrice, holderName", () => {
  for (const truong of ["ownerPhone", "floorPrice", "holderName"] as const) {
    const ro: typeof banRaNgoai = (can, tuy) => ({ ...banRaNgoai(can, tuy), [truong]: can[truong] }) as ReturnType<typeof banRaNgoai>;
    const loi = kiemBanRa(ro, canMoi(), TODAY);
    assert.equal(loi.length, 24, `${truong}: ${loi.length}`);
    for (const l of loi) assert.match(l, new RegExp(`: rò ${truong} \\(`));
  }
});

test("E5 liên hệ không ra ngoài — không khoá contacts, không tên, số, mã", () => {
  const can = canMoi();
  for (const cua of CUA_RA) {
    for (const nguoiNhan of NGUOI_NHAN) {
      for (const cauHinh of CAU_HINH_TAT_CA) {
        const b = banRaNgoai(can, { cua, nguoiNhan, cauHinh, today: TODAY });
        assert.ok(!("contacts" in b));
        const moiLienHe = giaTriMoi(can, nguoiNhan, cauHinh).filter((m) => m.truong.startsWith("contacts"));
        assert.equal(moiLienHe.length, 6);
        assert.deepEqual(timRoRi(JSON.stringify(b), moiLienHe), []);
      }
    }
  }
});

test("E5 đối chứng dương — hai số liên hệ ở sáu cách viết", () => {
  const can = canMoi();
  const moi = giaTriMoi(can, "nhom_moi_gioi", CAU_HINH_MAC_DINH);
  const cachViet: [string, (s: string) => string][] = [
    ["so_lien", (s) => s],
    ["so_cach", (s) => `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}`],
    ["so_cham", (s) => `${s.slice(0, 4)}.${s.slice(4, 7)}.${s.slice(7)}`],
    ["so_gach", (s) => `${s.slice(0, 4)}-${s.slice(4, 7)}-${s.slice(7)}`],
    ["so_cong_84", (s) => `+84 ${s.slice(1, 4)} ${s.slice(4, 7)} ${s.slice(7)}`],
    ["so_84", (s) => `84${s.slice(1)}`],
  ];
  can.contacts.forEach((lh, i) => {
    for (const [dang, viet] of cachViet) {
      const trung = timRoRi(`Liên hệ ${viet(lh.phones[0]!)}`, moi);
      assert.deepEqual(trung, [{ truong: `contacts[${i}].phones[0]`, dang }], `${i} ${dang}`);
    }
  });
});

test("E5 chiều đỏ — bản sao hàm ra chép tên người mua", () => {
  const ro: typeof banRaNgoai = (can, tuy) => ({ ...banRaNgoai(can, tuy), senderName: can.contacts[1]!.fullName ?? "" });
  const loi = kiemBanRa(ro, canMoi(), TODAY);
  assert.ok(loi.length > 0);
  for (const l of loi) assert.match(l, /rò contacts\[1\]\.fullName/);
});
