// Trang nhóm môi giới (hàng 44, E2, E4): định nghĩa phí, mức chia và cột dựng ở lõi. Bảng viết trước; căn mồi của hàng 31.
import assert from "node:assert/strict";
import { test } from "node:test";
import { cotRa, KHONG_CO } from "../export/cot";
import { banRaNgoai, CAU_HINH_MAC_DINH, canMoi, type CanNoiBo } from "../redaction";
import { thanTrangKhach } from "./trang-khach";
import { cauDinhNghiaPhi, cauMucChia, COT_TRANG_MOI_GIOI } from "./trang-moi-gioi";

const HOM_NAY = "2026-11-06";
const ba: CanNoiBo[] = [
  { ...canMoi(), unitNumber: "Z-03.01" },
  { ...canMoi(), unitNumber: "Z-01.01", standardStatus: "Pending" },
  { ...canMoi(), unitNumber: "Z-02.01", standardStatus: "Closed" },
];
const tv = (bao: string) => ({ truong: {}, giaTri: { feeInclusion: { included: bao } } });

test("môi giới: định nghĩa phí theo sàn", () => {
  // [ca, bản chụp lúc gửi, cấu hình sàn hiện tại, nhãn Bao phí của sàn, tên mong đợi, khoản mong đợi]
  const BANG: [string, string[] | null, string[], string | null, string, string[]][] = [
    ["một khoản", ["brokerageFee"], ["personalIncomeTax"], null, "Bao phí", ["phí môi giới"]],
    ["hai khoản", ["registrationFee", "personalIncomeTax"], ["brokerageFee"], null, "Bao phí", ["thuế thu nhập cá nhân", "lệ phí trước bạ"]],
    ["đủ ba khoản", ["personalIncomeTax", "registrationFee", "brokerageFee"], ["brokerageFee"], null, "Bao phí", ["thuế thu nhập cá nhân", "lệ phí trước bạ", "phí môi giới"]],
    ["Lần gửi trước 048 đọc cấu hình hiện tại", null, ["registrationFee"], null, "Bao phí", ["lệ phí trước bạ"]],
    ["tên gọi riêng của sàn", ["brokerageFee"], ["brokerageFee"], "Trọn gói", "Trọn gói", ["phí môi giới"]],
  ];
  let dem = 0;
  for (const [ca, chup, san, bao, ten, khoan] of BANG) {
    const than = thanTrangKhach({
      can: ba,
      audience: "agents",
      today: HOM_NAY,
      tuVung: bao ? tv(bao) : undefined,
      luuTrenLanGui: { mucChia: null, feeInclusion: chup },
      cauHinhMoiGioi: { anMucChia: false, feeInclusion: san },
    });
    assert.deepEqual(than.dinhNghiaPhi, { ten, khoan }, `định nghĩa phí không theo sàn — ${ca}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  assert.equal(cauDinhNghiaPhi({ ten: "Bao phí", khoan: ["phí môi giới"] }), "Bao phí: giá đã gồm phí môi giới");
  // Đối chứng: khách riêng không có phần môi giới.
  assert.equal(Object.hasOwn(thanTrangKhach({ can: ba, audience: "client", today: HOM_NAY }), "dinhNghiaPhi"), false);
});

test("môi giới: ẩn mức chia ở lõi", () => {
  const than = (an: boolean, muc: number | null) =>
    thanTrangKhach({ can: ba, audience: "agents", today: HOM_NAY, luuTrenLanGui: { mucChia: muc, feeInclusion: null }, cauHinhMoiGioi: { anMucChia: an, feeInclusion: ["brokerageFee"] } });
  // Đối chứng dương: không ẩn thì có mức.
  assert.equal(than(false, 40).mucChia, 40);
  const an = than(true, 40);
  assert.equal(Object.hasOwn(an, "mucChia"), false, "mức chia lọt khi sàn ẩn");
  // Thân khi ẩn đúng bằng thân khi hiện bỏ đi khoá mức chia: giá trị 40 không lọt dưới khoá nào khác.
  const hienBoMuc: Partial<ReturnType<typeof than>> = { ...than(false, 40) };
  delete hienBoMuc.mucChia;
  assert.deepEqual(an, hienBoMuc, "thân khi ẩn khác thân khi hiện ngoài khoá mức chia");
  assert.ok(!JSON.stringify(an).includes("Mức chia"), "câu mức chia lọt khi sàn ẩn");
  assert.equal(Object.hasOwn(than(false, null), "mucChia"), false, "bộ không có mức thì không có khoá mức chia");
  assert.equal(cauMucChia(40), "Mức chia: 40%");
  assert.equal(cauMucChia(12.5), "Mức chia: 12,5%");
});

test("môi giới: cột và ô dựng từ bản ra theo thứ tự gửi", () => {
  const than = thanTrangKhach({ can: ba, audience: "agents", today: HOM_NAY });
  const { ra } = cotRa(COT_TRANG_MOI_GIOI, "nhom_moi_gioi", CAU_HINH_MAC_DINH);
  assert.deepEqual(than.cot!.map((c) => c.khoa), ra.map((c) => c.khoa), "trang môi giới thiếu cột");
  assert.ok(than.cot!.some((c) => c.khoa === "unitNumber"), "nhóm môi giới phải có mã căn");
  assert.equal(than.dong!.length, 3);
  const iMa = than.cot!.findIndex((c) => c.khoa === "unitNumber");
  assert.deepEqual(than.dong!.map((d) => d[iMa]), ["Z-03.01", "Z-01.01", "Z-02.01"], "thứ tự gửi");
  // Giá theo luật giá ra: căn đã bán không có giá trong bản ra, ô giá là ô trống của bảng.
  const iGia = than.cot!.findIndex((c) => c.khoa === "listPrice");
  const banBan = banRaNgoai(ba[2]!, { cua: "gui_link", nguoiNhan: "nhom_moi_gioi", today: HOM_NAY });
  assert.equal(banBan.listPrice, undefined, "đối chứng: căn đã bán không có giá ra");
  assert.equal(than.dong![2]![iGia], KHONG_CO, "ô giá của căn đã bán phải là ô trống của bảng");
  assert.notEqual(than.dong![0]![iGia], KHONG_CO, "đối chứng: căn còn bán có giá");
});
