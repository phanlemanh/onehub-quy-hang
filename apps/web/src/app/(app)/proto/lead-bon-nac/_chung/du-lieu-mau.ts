// Dữ liệu mẫu của trang ba lối hàng 27 (ADR-0019): lead telesales đã nhập, mới nhất trước. Không gọi API, không số chủ
// thật. Bản này là thứ telesales được thấy — không số chủ, không mã hàng, không trường nào của hàng.

export type Nac = "da-gui" | "da-nhan" | "da-goi" | "len-bang";

export const BON_NAC: { ma: Nac; nhan: string }[] = [
  { ma: "da-gui", nhan: "Đã gửi" },
  { ma: "da-nhan", nhan: "Đã nhận" },
  { ma: "da-goi", nhan: "Đã gọi" },
  { ma: "len-bang", nhan: "Lên bảng" },
];

export type KieuLead =
  /** Đi bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng. */
  | "bon-nac"
  /** Đầu chủ trả lại — telesales sửa số rồi gửi lại. */
  | "tra-lai"
  /** Đã sửa số và gửi lại — trỏ lead mới. */
  | "da-gui-lai"
  /** Căn đã có hàng đang mở — thành tin bổ sung, không theo bốn nấc. */
  | "tin-bo-sung";

export type LeadMau = {
  id: string;
  toa: string;
  /** Mã căn; null khi chỉ biết toà. */
  can: string | null;
  nhuCau: "Bán" | "Cho thuê";
  /** Giá đã đọc thành câu, ví dụ «3,2 tỷ, đã bao phí». */
  gia: string;
  /** Đầu chủ nhận; null khi đang chờ chia. */
  dauChu: string | null;
  kieu: KieuLead;
  /** Nấc đã qua và giờ của từng nấc (hh:mm hôm nay). */
  moc: Partial<Record<Nac, string>>;
  traLai?: { lyDo: string; luc: string };
  /** Lead đã gửi lại: lead mới thay nó. */
  guiLaiThanh?: string;
  /** Lead mới: gửi lại từ lead nào. */
  guiLaiTu?: string;
  /** Tin bổ sung: giờ gửi. */
  luc?: string;
};

export const LEAD_MAU: LeadMau[] = [
  { id: "L-08", toa: "Toà B", can: "B-15.03", nhuCau: "Bán", gia: "4,1 tỷ, chưa bao phí", dauChu: null, kieu: "bon-nac", moc: { "da-gui": "10:42" } },
  { id: "L-07", toa: "Toà A", can: "A-12.05", nhuCau: "Cho thuê", gia: "18 triệu/tháng, đã bao phí", dauChu: "[Mẫu] Đầu chủ 1", kieu: "bon-nac", moc: { "da-gui": "10:12", "da-nhan": "10:20" } },
  { id: "L-06", toa: "Toà A", can: "A-08.11", nhuCau: "Bán", gia: "2,9 tỷ, đã bao phí", dauChu: "[Mẫu] Đầu chủ 2", kieu: "bon-nac", moc: { "da-gui": "08:55", "da-nhan": "09:02", "da-goi": "09:20" }, guiLaiTu: "L-02" },
  { id: "L-05", toa: "Toà B", can: null, nhuCau: "Bán", gia: "3,2 tỷ, đã bao phí", dauChu: "[Mẫu] Đầu chủ 1", kieu: "bon-nac", moc: { "da-gui": "08:30", "da-nhan": "08:34", "da-goi": "08:51", "len-bang": "09:48" } },
  { id: "L-04", toa: "Toà A", can: "A-02.06", nhuCau: "Bán", gia: "3,6 tỷ, chưa bao phí", dauChu: "[Mẫu] Đầu chủ 1", kieu: "tin-bo-sung", moc: {}, luc: "09:30" },
  { id: "L-03", toa: "Toà B", can: "B-07.09", nhuCau: "Bán", gia: "5,5 tỷ, chưa bao phí", dauChu: "[Mẫu] Đầu chủ 2", kieu: "tra-lai", moc: { "da-gui": "08:20", "da-nhan": "08:26" }, traLai: { lyDo: "Số không liên lạc được", luc: "09:15" } },
  { id: "L-02", toa: "Toà A", can: "A-08.11", nhuCau: "Bán", gia: "2,9 tỷ, đã bao phí", dauChu: "[Mẫu] Đầu chủ 2", kieu: "da-gui-lai", moc: { "da-gui": "08:05", "da-nhan": "08:12" }, traLai: { lyDo: "Số không liên lạc được", luc: "08:40" }, guiLaiThanh: "L-06" },
  { id: "L-01", toa: "Toà A", can: "A-17.02", nhuCau: "Cho thuê", gia: "22 triệu/tháng, chưa bao phí", dauChu: "[Mẫu] Đầu chủ 2", kieu: "bon-nac", moc: { "da-gui": "07:48", "da-nhan": "07:55", "da-goi": "08:10", "len-bang": "08:44" } },
];

/** Nấc gần nhất đã qua của một lead bốn nấc. */
export function nacHienTai(l: LeadMau): Nac {
  let cuoi: Nac = "da-gui";
  for (const n of BON_NAC) if (l.moc[n.ma]) cuoi = n.ma;
  return cuoi;
}

export function nhanNac(n: Nac) {
  return BON_NAC.find((x) => x.ma === n)!.nhan;
}

export function tenCan(l: LeadMau) {
  return l.can ? `${l.toa} · ${l.can}` : `${l.toa} · chỉ biết toà`;
}

export type BadgeTrangThai = "warning-light" | "info-light" | "primary-light" | "success-light" | "destructive-light" | "invert-light";

/** Một nhãn trạng thái cho mỗi lead: chữ, giờ và biến thể Badge `-light`. */
export function trangThaiLead(l: LeadMau): { chu: string; gio: string; variant: BadgeTrangThai } {
  if (l.kieu === "tin-bo-sung") return { chu: "Tin bổ sung", gio: l.luc ?? "", variant: "invert-light" };
  if (l.kieu === "tra-lai") return { chu: "Bị trả lại", gio: l.traLai?.luc ?? "", variant: "destructive-light" };
  if (l.kieu === "da-gui-lai") return { chu: "Đã gửi lại", gio: l.traLai?.luc ?? "", variant: "invert-light" };
  const n = nacHienTai(l);
  const gio = l.moc[n] ?? "";
  if (n === "da-gui" && !l.dauChu) return { chu: "Đang chờ chia", gio, variant: "warning-light" };
  const variant: Record<Nac, BadgeTrangThai> = { "da-gui": "info-light", "da-nhan": "info-light", "da-goi": "primary-light", "len-bang": "success-light" };
  return { chu: nhanNac(n), gio, variant: variant[n] };
}

/** Câu phụ dưới tên căn: nhu cầu, giá, đầu chủ nhận. */
export function cauPhu(l: LeadMau) {
  return `${l.nhuCau} · ${l.gia}`;
}

export function tenDauChu(l: LeadMau) {
  if (l.kieu === "tin-bo-sung") return `Gửi tới ${l.dauChu ?? "đầu chủ của hàng"}`;
  return l.dauChu ?? "Chưa có người nhận";
}

export type Vung = "co-du-lieu" | "trong" | "dang-tai" | "loi";
export const CAC_VUNG: { ma: Vung; nhan: string }[] = [
  { ma: "co-du-lieu", nhan: "Có dữ liệu" },
  { ma: "trong", nhan: "Trống" },
  { ma: "dang-tai", nhan: "Đang tải" },
  { ma: "loi", nhan: "Lỗi" },
];

export function docVung(v: string | string[] | undefined): Vung {
  const s = Array.isArray(v) ? v[0] : v;
  return CAC_VUNG.some((x) => x.ma === s) ? (s as Vung) : "co-du-lieu";
}
