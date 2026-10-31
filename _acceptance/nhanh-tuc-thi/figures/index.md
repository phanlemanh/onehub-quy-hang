# Hình tại điểm quyết định — nhanh-tuc-thi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — không chở số chủ xuống máy | dưới ngưỡng: một lựa chọn, không chuỗi bước | — |
| Hỏi-2 — kéo định kỳ thay kênh thời gian thực | dưới ngưỡng: hai bước (đợi, kéo) | — |
| Hỏi-3 — trang thử trên bản thật | dưới ngưỡng: một lựa chọn | — |
| Cách bộ đồng bộ xử một thay đổi (đụng nhau, «Đã cọc», từ chối — AC-3..AC-7) | cần hình: 5 bước nối tiếp, 3 nhánh rẽ | `vong-doi-thay-doi.html` |

## Đề bài: vong-doi-thay-doi

- Loại hình: luồng (flowchart) trái sang phải.
- Nút: Sửa một ô → Lõi kiểm (sai khuôn → «Từ chối ngay», không xếp hàng) → Ghi trên máy + xếp hàng (mã thao tác, phiên bản
  kỳ vọng) → Gửi khi có mạng (mất mạng → giữ trong hàng đợi, thử lại 15 giây / khi quay lại trang) → Máy chủ trả lời.
- Ba nhánh của máy chủ trả lời: «Nhận» → rời hàng đợi; «Lệch phiên bản / bị từ chối» → Đối chiếu lịch sử căn → (có sự kiện
  của chính mình → «Đã áp trước», rời hàng đợi) hoặc (không → «Cần xem»: Giữ của tôi · Lấy bản mới); «Đã cọc / Đã bán của
  tôi» → lên dù phiên bản lệch.
- Nhãn chữ tiếng Việt như trên; AC liên quan: AC-3 (lõi kiểm, ghi trên máy), AC-4 (hàng đợi qua mất mạng), AC-5 (đối
  chiếu, đã áp trước), AC-6 (cần xem), AC-7 (Đã cọc / Đã bán).
