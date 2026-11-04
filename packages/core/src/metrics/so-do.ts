/**
 * Bảng số đo hai tuần thử (hàng 52, Tham chiếu §11): một lần tính trên sự kiện của hàng, dữ kiện lead và danh mục của một kỳ
 * `[tu, den)`. Mỗi mã của `DANH_SACH_SO_DO` ra đúng một dòng, theo thứ tự §11; mã chưa có sự kiện ra «chưa có sự kiện» kèm
 * tên sự kiện thiếu, không ra số. Lõi không đọc đồng hồ — kỳ truyền vào. Ngưỡng không đặt ở đây (luật đợt 24).
 */
import { CALL_BACK_AFTER_DAYS } from "../listing/freshness";
import type { ListingState } from "../listing/fold";
import { DANH_SACH_SO_DO } from "./danh-sach";
import { goiDieuChinhGia, maCanTuDien, mucDuCaoNhat, trangThaiTaiDen, xacNhanTrongNNgay, type Ky } from "./hang";
import type { DauVaoSoDo, DongSoDo, GiaTriSoDo, MetricCode } from "./kieu";
import { leadTrungBiChan, thoiLuongLead } from "./lead";
import { matMangDienThoai, thietBiTheoVai } from "./thiet-bi";
import { soLanXuat } from "./xuat";

export function tinhSoDo(v: DauVaoSoDo): DongSoDo[] {
  const ky: Ky = { tu: Date.parse(v.tu), den: Date.parse(v.den) };
  if (!Number.isFinite(ky.tu) || !Number.isFinite(ky.den) || ky.tu >= ky.den) throw new Error("kỳ đo cần tu < den, dạng ISO 8601");
  const states = v.hang.map((h) => trangThaiTaiDen(h, ky)).filter((s): s is ListingState => s !== null);

  const do_: Partial<Record<MetricCode, () => GiaTriSoDo>> = {
    confirmed_within_n_days: () => xacNhanTrongNNgay(states, ky, v.soNgayXacNhan ?? CALL_BACK_AFTER_DAYS),
    top_completeness: () => mucDuCaoNhat(states),
    unit_code_autofill: () => maCanTuDien(v.hang, v.lead, v.danhMuc, ky),
    lead_to_first_call: () => thoiLuongLead(v.lead, ky, (l) => l.firstCalledAt, "phut"),
    lead_to_ready: () => thoiLuongLead(v.lead, ky, (l) => l.boardAt, "ngay"),
    duplicate_leads_blocked: () => leadTrungBiChan(v.lead, ky),
    price_adjustment_calls: () => goiDieuChinhGia(v.hang, ky, v.nguongDieuChinhGia),
    // Vắng `lanXuat` là rỗng, như `matMang`: sự kiện xuất đã có từ hàng 43, «chưa có sự kiện» chỉ dành cho mã chưa có nguồn.
    sheet_publishes: () => soLanXuat(v.lanXuat ?? [], ky),
    actions_by_device_role: () => thietBiTheoVai(v.hang, ky),
    mobile_offline: () => matMangDienThoai(v.hang, v.matMang ?? [], ky),
  };

  return DANH_SACH_SO_DO.map((m): DongSoDo => {
    const dau = { ma: m.ma, dongThamChieu: m.manh, traLoi: m.traLoi };
    const tinh = do_[m.ma];
    if (m.thieu !== undefined || !tinh) return { ...dau, trangThai: "chua-co-su-kien", thieu: m.thieu ?? "Chưa có cách đo." };
    return { ...dau, trangThai: "do-duoc", ...tinh() };
  });
}
