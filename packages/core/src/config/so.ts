/**
 * Sổ điểm biến thiên ở mã (hàng 81, ADR-0018 quyết định 1): mỗi điểm sàn chỉnh được khai một dòng — khoá, kiểu, mặc định,
 * khoảng cho phép, vai được đổi, ghi đè dưới sàn, hiệu lực, lớp dữ liệu. Đây là bản ở mã của phần A
 * `docs/architecture/so-diem-bien-thien.md`; bộ kiểm khớp (`so-khop.ts`) so hai bên. Thêm, bớt hay đổi một điểm là sửa
 * cả hai trong cùng PR. Phần B (ứng viên) và C (khoá) không có giá trị nên không vào mã.
 */
import type { DataClass } from "../data-classes";
import type { Role } from "../navigation";

export type Kieu =
  | { loai: "int"; donVi: string; min: number; max: number }
  | { loai: "decimal"; donVi: string; min: number; max: number }
  | { loai: "bool" }
  | { loai: "enum"; giaTri: readonly string[] }
  | { loai: "set"; giaTri: readonly string[] }
  | { loai: "text"; toiDa: number }
  /** Đối tượng cấu hình nhiều dòng có bảng và bộ kiểm riêng của hàng nó — sổ chỉ khai là có. */
  | { loai: "map"; bang: string | null };

/** `moi`: đối tượng mang số lúc tạo · `tinh_lai`: đọc lúc tính · `lan_sau`: áp cho lần nhập, phát, gửi, đổi trạng thái sau. */
export const HIEU_LUC = ["moi", "tinh_lai", "lan_sau"] as const;
export type HieuLuc = (typeof HIEU_LUC)[number];

export const TINH_TRANG = ["mo", "de_xuat"] as const;
export type TinhTrang = (typeof TINH_TRANG)[number];

export type DiemSo = {
  /** Số thứ tự ở sổ tài liệu (`#`). */
  so: string;
  /** `<nhóm>.<khoá>`; đoạn `<…>` là một họ khoá (mỗi trường, mỗi trạng thái một khoá). */
  khoa: string;
  ten: string;
  kieu: Kieu;
  /** Mặc định của sản phẩm; `null` chỉ khi `coTheTrong` (chưa có số, hay tắt). */
  macDinh: unknown;
  coTheTrong?: true;
  /** Giá trị không được nhỏ hơn giá trị đang áp của khoá này. */
  khongNhoHon?: string;
  aiDoi: readonly Role[];
  /** Cấp dưới sàn được sửa riêng cho một đối tượng — không phải cấu hình; null là không có. */
  ghiDe: string | null;
  hieuLuc: HieuLuc;
  lop: DataClass;
  tinhTrang: TinhTrang;
  /** Hàng lộ trình đưa màn chỉnh điểm ấy; null là chưa có màn. */
  man: string | null;
};

const QT: readonly Role[] = ["company_admin"];
const NOI_BO = "company_internal" as const;

export const SO_DIEM: readonly DiemSo[] = [
  // A1. Lead — luật 20, hàng 25, 48
  { so: "1", khoa: "lead_routing.accept_minutes", ten: "Hạn nhận lead", kieu: { loai: "int", donVi: "phút", min: 1, max: 1440 }, macDinh: 15, aiDoi: QT, ghiDe: null, hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "48" },
  { so: "2", khoa: "lead_routing.first_call_minutes", ten: "Hạn gọi lần đầu", kieu: { loai: "int", donVi: "phút", min: 1, max: 1440 }, macDinh: 30, khongNhoHon: "lead_routing.accept_minutes", aiDoi: QT, ghiDe: null, hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "48" },
  {
    so: "3",
    khoa: "lead_routing.strategy",
    ten: "Cách chia lead không trùng",
    kieu: { loai: "enum", giaTri: ["zone_round_robin", "company_round_robin", "zone_least_open", "open_pool", "manual"] },
    macDinh: "zone_round_robin",
    aiDoi: QT,
    ghiDe: "Trưởng nhóm giao lại từng lead",
    hieuLuc: "moi",
    lop: NOI_BO,
    tinhTrang: "mo",
    man: "25, 48",
  },
  { so: "3a", khoa: "lead_routing.alert_to", ten: "Báo lead quá hạn cho ai", kieu: { loai: "enum", giaTri: ["team_lead", "team_lead_and_admin"] }, macDinh: "team_lead", aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "25, 48" },
  // A2. Độ tươi, hàng đợi, nhắc trước khi gửi — luật 18, 25, hàng 22, 48
  { so: "4", khoa: "queue.call_back_after_days", ten: "«Cần gọi lại» sau số ngày chưa xác nhận", kieu: { loai: "int", donVi: "ngày", min: 7, max: 30 }, macDinh: 14, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "48" },
  { so: "5", khoa: "queue.price_negotiation_after_days", ten: "«Nên gọi ép giá» sau số ngày", kieu: { loai: "int", donVi: "ngày", min: 7, max: 14 }, macDinh: 10, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "48" },
  { so: "6", khoa: "share.stale_warning_days", ten: "Nhắc gọi trước khi gửi căn chưa xác nhận", kieu: { loai: "int", donVi: "ngày", min: 7, max: 30 }, macDinh: 14, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: null },
  { so: "36", khoa: "queue.groups", ten: "Bộ nhóm của Hôm nay đầu chủ", kieu: { loai: "map", bang: null }, macDinh: null, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "48" },
  // A3. Giá và phí — luật 7, 12, 13, §13, hàng 15, 28, 49
  { so: "7", khoa: "price.change_confirm_pct", ten: "Đổi giá quá bao nhiêu % thì hỏi lại", kieu: { loai: "int", donVi: "%", min: 5, max: 50 }, macDinh: 20, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "49" },
  {
    so: "8",
    khoa: "fee.inclusion",
    ten: "Định nghĩa «Bao phí»",
    kieu: { loai: "set", giaTri: ["personalIncomeTax", "registrationFee", "brokerageFee"] },
    macDinh: ["personalIncomeTax", "registrationFee", "brokerageFee"],
    aiDoi: QT,
    ghiDe: null,
    hieuLuc: "moi",
    lop: NOI_BO,
    tinhTrang: "mo",
    man: "49",
  },
  { so: "9", khoa: "fee.brokerage_pct", ten: "Phí môi giới", kieu: { loai: "decimal", donVi: "%", min: 0, max: 5 }, macDinh: 1, aiDoi: QT, ghiDe: "Đầu chủ sửa từng căn", hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "49" },
  // Hỏi-1 (Cổng Phạm vi 04/11): thuế và lệ phí do luật đặt — chỉ nhận đúng số mặc định tới hàng 49.
  { so: "10", khoa: "fee.personal_income_tax_pct", ten: "Thuế thu nhập cá nhân khi chuyển nhượng", kieu: { loai: "decimal", donVi: "%", min: 2, max: 2 }, macDinh: 2, aiDoi: QT, ghiDe: null, hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "49" },
  { so: "11", khoa: "fee.registration_fee_pct", ten: "Lệ phí trước bạ", kieu: { loai: "decimal", donVi: "%", min: 0.5, max: 0.5 }, macDinh: 0.5, aiDoi: QT, ghiDe: null, hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "49" },
  // A4. Trang khách và gửi — chỉ chọn trong trần của luật ẩn
  { so: "12", khoa: "customer_page.show_confirmed_age", ten: "Hiện «giá xác nhận X ngày trước» cho khách", kieu: { loai: "bool" }, macDinh: true, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: null },
  { so: "13", khoa: "customer_page.private_hides_unit_number", ten: "Gửi khách riêng ẩn mã căn", kieu: { loai: "bool" }, macDinh: true, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: null },
  { so: "14", khoa: "customer_page.off_compound_address", ten: "Khách riêng thấy gì với nhà ngoài khu", kieu: { loai: "enum", giaTri: ["street_ward", "ward_only"] }, macDinh: "street_ward", aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "de_xuat", man: null },
  // Hỏi-1: chưa có số — trống tới Cổng Phạm vi hàng 44.
  { so: "15", khoa: "broker_page.commission_split_pct", ten: "Mức chia trên trang nhóm môi giới", kieu: { loai: "decimal", donVi: "%", min: 0, max: 100 }, macDinh: null, coTheTrong: true, aiDoi: QT, ghiDe: "Người gửi sửa theo bộ", hieuLuc: "moi", lop: NOI_BO, tinhTrang: "mo", man: "44" },
  { so: "16", khoa: "broker_page.hide_commission_split", ten: "Sàn ẩn mức chia", kieu: { loai: "bool" }, macDinh: false, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "44" },
  { so: "17", khoa: "customer_page.interest_button", ten: "Nút «Quan tâm» trên trang khách", kieu: { loai: "bool" }, macDinh: true, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: null },
  // A5. Cách gọi riêng, trạng thái riêng, trường riêng
  { so: "18", khoa: "labels.field.<trường chuẩn>", ten: "Tên hiển thị của một trường chuẩn", kieu: { loai: "text", toiDa: 40 }, macDinh: null, coTheTrong: true, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "45" },
  { so: "19", khoa: "values.aliases", ten: "Giá trị riêng neo vào giá trị chuẩn", kieu: { loai: "map", bang: "company_value_aliases" }, macDinh: null, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "70" },
  // Hàng 45 (Hỏi-2): tên hiện của từng giá trị chuẩn — chiều HIỆN; #19 là chiều VÀO (từ điển gõ tắt của hàng 70).
  { so: "37", khoa: "labels.value.<trường chuẩn>", ten: "Tên hiển thị của các giá trị chuẩn của một trường tập đóng", kieu: { loai: "map", bang: "company_settings" }, macDinh: null, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "45" },
  // Hỏi-1: tắt (null) là mặc định; bật thì 2–10 người.
  { so: "20", khoa: "values.auto_accept_after_choices", ten: "Tự nhận đề xuất từ điển khi đủ số người cùng chọn", kieu: { loai: "int", donVi: "người", min: 2, max: 10 }, macDinh: null, coTheTrong: true, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "de_xuat", man: "70" },
  { so: "21", khoa: "labels.status.<mã>", ten: "Nhãn trạng thái riêng neo vào trạng thái chuẩn", kieu: { loai: "map", bang: "company_settings" }, macDinh: null, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "46" },
  { so: "22", khoa: "custom_fields", ten: "Trường riêng", kieu: { loai: "map", bang: null }, macDinh: null, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: "custom_field", tinhTrang: "mo", man: "47" },
  { so: "23", khoa: "custom_fields.<id>.share_with_partners", ten: "Kèm trường riêng khi phát hàng cho đội khác", kieu: { loai: "bool" }, macDinh: false, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "47" },
  // A6. Nhập dữ liệu, AI, mẫu — Hỏi-1: trần AI 0–10 USD tới hàng 68 đặt trần nền tảng.
  { so: "24", khoa: "ai.monthly_budget_usd", ten: "Trần chi phí AI mỗi tháng", kieu: { loai: "decimal", donVi: "USD", min: 0, max: 10 }, macDinh: 10, aiDoi: QT, ghiDe: null, hieuLuc: "tinh_lai", lop: NOI_BO, tinhTrang: "mo", man: "68" },
  { so: "25", khoa: "import.templates", ten: "Mẫu file nhập đã nhớ", kieu: { loai: "map", bang: "import_templates" }, macDinh: null, aiDoi: ["listing_agent", "team_lead", "company_admin"], ghiDe: null, hieuLuc: "lan_sau", lop: NOI_BO, tinhTrang: "mo", man: "67, 50" },
  { so: "26", khoa: "export.templates", ten: "Mẫu bảng hàng khi phát hàng", kieu: { loai: "map", bang: null }, macDinh: null, aiDoi: QT, ghiDe: "Đầu chủ chọn mẫu khi phát", hieuLuc: "lan_sau", lop: NOI_BO, tinhTrang: "mo", man: "50" },
  { so: "27", khoa: "share.post_templates", ten: "Mẫu bài theo kênh", kieu: { loai: "map", bang: null }, macDinh: null, aiDoi: QT, ghiDe: "Người gửi sửa bài trước khi chia sẻ", hieuLuc: "lan_sau", lop: NOI_BO, tinhTrang: "mo", man: "50" },
  // A7. Lên bảng — luật 17, hàng 23
  { so: "33", khoa: "listing.ready_min_real_photos", ten: "Số ảnh thật tối thiểu để căn vào Đang bán", kieu: { loai: "int", donVi: "ảnh", min: 1, max: 20 }, macDinh: 1, aiDoi: QT, ghiDe: null, hieuLuc: "lan_sau", lop: NOI_BO, tinhTrang: "mo", man: null },
];
