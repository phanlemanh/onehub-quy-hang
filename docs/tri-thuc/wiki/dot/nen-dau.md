---
loai: dot
ma: [ND1, ND2, ND3, ND4]
nguon: [raw/2026-10-31-dong-dot-nen-dau/dong-dot-nen-dau.md]
cap_nhat: 2026-10-31
---
# Đợt nen-dau — việc phát sinh khi đóng đợt

Đợt Điều phối – Thợ đầu tiên của kho (hàng 1–8 và 53 của lộ trình) đóng ngày 31/10/2026. Lúc đóng, chủ kho giữ một hàng
phát sinh đã làm trong đợt và chọn tách ba lỗ tìm thấy ở Cổng Bằng chứng thành việc riêng. Bốn việc này là bản phạm vi
`dot: nen-dau` của lượt cắt kế.

## Điều rút ra

- Hàng phát sinh đổi tên API sang tiếng Anh đã làm và ký trong đợt (dãy Q, sau hàng 7) nhưng chưa có hàng trên lộ
  trình; ghi lại để lộ trình phủ đúng việc đã giao.
- Đăng nhập theo sàn (hàng 6) để lộ hai lỗ, mỗi lỗ bộ soát nêu hai lần: giới hạn xin mã chỉ gác một đường, các đường
  gửi mã khác của plugin đăng nhập vẫn gửi không giới hạn; công cụ mở sàn tìm sàn theo tên nên sàn mới trùng tên bị gộp
  vào sàn cũ — lỗ thứ hai chạm cách ly giữa công ty.
- Lõi hàng (hàng 8) nhận ngày bán không có thật rồi trả lỗi hệ thống chung chung; không ghi nửa chừng, sửa rẻ.
- Ba việc tách mới qua Cổng Bằng chứng của hàng gốc, chưa qua Cổng Đáng; không vào gói đợt nen-2.
- Không đưa lớp phủ ưu tiên vào lộ trình.

## Mã → nơi

Bảng phủ do răng sinh, ở mô tả PR cắt lượt; tệp lộ trình `docs/plan/lo-trinh.json` giữ trường `phu` của từng hàng.
