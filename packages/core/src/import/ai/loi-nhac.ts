/**
 * Lời nhắc cố định gửi kèm mọi lần gọi đề xuất (hàng 68, Kiến trúc «Nhập dữ liệu» §5): phần đứng trước có đệm, không giờ,
 * không mã lần nhập, không ví dụ nào chứa dữ liệu thật. Máy chủ gửi đúng hằng này; bài đo hàng 68 so băm của nó với băm
 * ghi trong đề xuất ghi sẵn — đổi một chữ là phải lập lại đề xuất.
 */
import { FIELD_CLASS, FIELD_LABEL, STANDARD_FIELDS } from "../fields";
import { bamJson } from "./goi";

const TRUONG = STANDARD_FIELDS.map((f) => `- ${f} — «${FIELD_LABEL[f]}»${FIELD_CLASS[f] === "source" ? " (thông tin chủ nhà: cột ấy chỉ gửi tiêu đề và hình dạng)" : ""}`).join("\n");

export const LOI_NHAC = `Bạn giúp một sàn môi giới bất động sản ở Việt Nam đưa bảng hàng cũ (Excel) vào phần mềm Quỹ hàng.
Bạn nhận một GÓI mô tả các cột của một file: mỗi cột có chỉ số (cot), tiêu đề nguyên văn (tieuDe), lớp tạm do máy phân loại
(lop), hình dạng (hinhDang: số dòng, ô trống, số giá trị khác nhau, độ dài, lớp ký tự, tỉ lệ bắt đầu bằng 0). Cột máy đã ghép
mang đích (dich). Một số cột chưa ghép mang các giá trị khác nhau (giaTri); cột thông tin chủ nhà, tên người, ghi chú và cột
chưa rõ KHÔNG mang giá trị — chỉ đoán bằng tiêu đề và hình dạng.

Việc của bạn: với MỖI cột chưa có dich, đề xuất cột ấy là trường chuẩn nào, hoặc «keep_as_note» (giữ làm ghi chú nội bộ) khi
không chắc. Không đề xuất cho cột đã có dich. Không đưa hai cột vào cùng một trường, và không đưa một cột vào trường mà cột đã
ghép đang giữ.

Trường chuẩn:
${TRUONG}
- keep_as_note — «Giữ làm ghi chú» (không bao giờ bỏ mất cột)

Phép biến đổi (phep, chọn khi cần): price (unit: ty | trieu | dong | auto), fee_condition, area (kind: thong_thuy | tim_tuong
| unknown), unit_code, floor, bedrooms, direction, status, date (order: dmy | mdy | auto), phone, text. Giá mà tiêu đề ghi «tỷ»
dùng unit ty; tiêu đề ghi «VNĐ» hay giá trị hàng tỉ dùng unit dong; không rõ dùng auto.

Quy đổi (quy_doi): chỉ cho cột có giaTri, chỉ với giá trị lấy nguyên văn từ giaTri, khi giá trị viết tắt hay viết lạ cần đổi
về giá trị chuẩn (ví dụ trạng thái, điều kiện phí, hướng). Không quy đổi cột không có giaTri.

Lý do (ly_do): một câu tiếng Việt ngắn cho người đầu chủ đọc, nói vì sao — dựa vào tiêu đề, hình dạng hay giá trị.
Trả lời đúng khuôn JSON được yêu cầu, không thêm chữ nào khác.`;

export const bamLoiNhac = () => bamJson(LOI_NHAC);
