/**
 * Danh sách số đo của hai tuần thử, theo thứ tự bảng «Đo trong hai tuần thử» của Tham chiếu §11 — trừ «Số ngày Sheet cũ
 * không được sửa» (câu bật của hàng 52). `o` là chữ nguyên văn ô «Số đo» của §11; ô gộp nhiều số thì mỗi mã một `manh`.
 * Mã chưa có sự kiện mang `thieu`: bảng số đo nói rõ thiếu gì thay vì ra số 0 (luật đợt 24).
 */
import type { MetricCode } from "./kieu";

export type MucDanhSach = { ma: MetricCode; o: string; manh: string; traLoi: string; thieu?: string };

const TUOI_DAY = "Hàng có tươi và đầy hơn không?";
const DONG_VAO = "Dòng vào có chạy không?";
const PHAT_RA = "Hàng có được phát ra từ đây không?";

export const DANH_SACH_SO_DO: readonly MucDanhSach[] = [
  { ma: "confirmed_within_n_days", o: "Tỉ lệ căn xác nhận trong N ngày; tỉ lệ căn ở mức đủ cao nhất", manh: "Tỉ lệ căn xác nhận trong N ngày", traLoi: TUOI_DAY },
  { ma: "top_completeness", o: "Tỉ lệ căn xác nhận trong N ngày; tỉ lệ căn ở mức đủ cao nhất", manh: "tỉ lệ căn ở mức đủ cao nhất", traLoi: TUOI_DAY },
  { ma: "unit_code_autofill", o: "Tỉ lệ mã căn tự điền được", manh: "Tỉ lệ mã căn tự điền được", traLoi: "Danh mục đủ phủ khu chưa?" },
  {
    ma: "inquiry_to_send",
    o: "Thời gian khách hỏi → gửi được căn",
    manh: "Thời gian khách hỏi → gửi được căn",
    traLoi: "Việc thật có nhanh hơn không?",
    thieu: "Chưa có sự kiện khách hỏi (liên hệ khách, hàng 86) và lần Gửi (luồng Gửi, hàng 34).",
  },
  { ma: "lead_to_first_call", o: "Thời gian lead → cuộc gọi đầu; số ngày lead → Sẵn sàng bán; số lead trùng bị chặn", manh: "Thời gian lead → cuộc gọi đầu", traLoi: DONG_VAO },
  { ma: "lead_to_ready", o: "Thời gian lead → cuộc gọi đầu; số ngày lead → Sẵn sàng bán; số lead trùng bị chặn", manh: "số ngày lead → Sẵn sàng bán", traLoi: DONG_VAO },
  { ma: "duplicate_leads_blocked", o: "Thời gian lead → cuộc gọi đầu; số ngày lead → Sẵn sàng bán; số lead trùng bị chặn", manh: "số lead trùng bị chặn", traLoi: DONG_VAO },
  { ma: "price_adjustment_calls", o: "Số căn gọi điều chỉnh giá đợt hai", manh: "Số căn gọi điều chỉnh giá đợt hai", traLoi: "Hàng ngộp có được chăm không?" },
  {
    ma: "sheet_publishes",
    o: "Số lần xuất bảng hàng; số link khách mở, số lượt quan tâm",
    manh: "Số lần xuất bảng hàng",
    traLoi: PHAT_RA,
    thieu: "Chưa có sự kiện lần xuất bảng hàng (xuất bảng hàng, hàng 43).",
  },
  {
    ma: "customer_link_opens",
    o: "Số lần xuất bảng hàng; số link khách mở, số lượt quan tâm",
    manh: "số link khách mở",
    traLoi: PHAT_RA,
    thieu: "Chưa có sự kiện lượt mở trang khách (trang khách, hàng 35).",
  },
  {
    ma: "customer_interest",
    o: "Số lần xuất bảng hàng; số link khách mở, số lượt quan tâm",
    manh: "số lượt quan tâm",
    traLoi: PHAT_RA,
    thieu: "Chưa có sự kiện lượt quan tâm trên trang khách (trang khách, hàng 35).",
  },
  {
    ma: "actions_by_device_role",
    o: "Tỉ lệ thao tác trên máy tính / điện thoại theo vai",
    manh: "Tỉ lệ thao tác trên máy tính / điện thoại theo vai",
    traLoi: "Ghi nhận thiết bị theo vai có đúng không?",
  },
  {
    ma: "mobile_offline",
    o: "Số lần mất mạng và thao tác lúc mất mạng trên điện thoại",
    manh: "Số lần mất mạng và thao tác lúc mất mạng trên điện thoại",
    traLoi: "Có cần ngoại tuyến thật không?",
  },
];
