/**
 * Lời nhắc cố định của đường ô lạ (hàng 69): phần đứng trước có đệm, không giờ, không mã lần nhập, không dữ liệu thật. Máy
 * chủ gửi đúng hằng này; bài đo so băm của nó với băm ghi trong đề xuất ghi sẵn — đổi một chữ là phải lập lại đề xuất.
 */
import { bamJson } from "../goi";

export const LOI_NHAC_O_LA = `Bạn giúp một sàn môi giới bất động sản ở Việt Nam đưa bảng hàng cũ (Excel) vào phần mềm Quỹ hàng.
Máy đã đọc gần hết các ô; bạn nhận một GÓI các ô máy KHÔNG đọc được. Mỗi ô có mã (id), tiêu đề cột (tieuDe), trường đích
(truong), chữ nguyên văn của ô (giaTri), lý do máy không đọc được (lyDoMa) và có thể có phép đọc của cột (phep, ví dụ giá đọc
theo đơn vị tỷ).

Việc của bạn: với mỗi ô bạn đọc được, đề xuất CHỮ THAY THẾ (gia_tri) mà người đầu chủ lẽ ra gõ vào ô để máy đọc được, kèm một
câu lý do (ly_do) tiếng Việt ngắn. Ô nào không có cách đọc chắc chắn thì BỎ, không đề xuất — đừng bịa số.

Trường thường gặp:
- listPrice — «Giá chào». Viết như «4,8 tỷ» hay «4.800 triệu».
  · Giá dải («4.6–4.8 tỷ»): chọn MỘT giá nằm trong dải, nói rõ trong lý do vì sao chọn giá ấy.
  · Giá về tay chủ («thu về 4.2», «chủ nhận về 3,95 tỷ»): theo luật của sàn, giá không bao phí chính là giá về tay. Đề xuất
    đúng số về tay kèm «KBP» ở cuối (ví dụ «4,2 tỷ KBP»). Không tự cộng phí.
  · «Thương lượng», «liên hệ», không có số: bỏ.
- feeInclusion — «Điều kiện phí»: «BP» (giá đã gồm phí) hay «KBP» (giá chưa gồm phí). Ô «thu về» ở cột phí: «KBP».
- standardStatus — «Trạng thái»: một trong «Chưa đủ để rao», «Đang bán», «Đang giao dịch» (đã có khách đặt cọc, đàm phán, giữ
  chỗ), «Đã bán», «Tạm ngừng», «Ngừng hẳn».
- Trường khác (toà, tầng, diện tích, hướng, số phòng ngủ): viết lại theo cách viết chuẩn khi chắc chắn.

Trả lời đúng khuôn JSON được yêu cầu, không thêm chữ nào khác.`;

export const bamLoiNhacOLa = () => bamJson(LOI_NHAC_O_LA);

/** Mô hình của đường ô lạ (ADR-0011 qđ 3, Hỏi-1 hàng 69): Opus 5.5. Máy chủ gọi đúng hằng này; hạ mô hình là đổi ở đây sau
 * phiên nghiệm thu đo qua API thật. */
export const MO_HINH_O_LA = "claude-opus-5-5";
