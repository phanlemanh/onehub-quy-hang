---
loai: dot
ma: [ND1, ND2, ND3, ND4, ND5, ND6, ND7, ND8, ND9]
nguon: [raw/2026-10-31-nhap-du-lieu/phien-31-10.md]
cap_nhat: 2026-10-31
---
# Đợt nhap-du-lieu-3110 — nhập dữ liệu có tác tử và chuẩn hoá ở mọi cửa vào

Chủ kho nâng nhập dữ liệu thành giai đoạn trọng tâm, có tác tử AI. Thiết kế chốt ở ADR-0011 (chủ kho duyệt 31/10:
«Duyệt hướng này» cho chuẩn hoá ở mọi cửa vào, «Duyệt, cắt lượt» cho phần còn lại). Thay hàng 20, 21 của đợt ban-dau-2910.

## Điều rút ra

- Tác tử viết kế hoạch từ hồ sơ cột, mã áp lên mọi dòng; chi phí theo số giá trị khác nhau, không theo số dòng.
- Nguồn và dữ liệu cá nhân (tên người, ghi chú) không bao giờ tới nhà cung cấp AI: nhà cung cấp chỉ có vùng Mỹ/toàn cầu,
  gửi dữ liệu cá nhân là chuyển ra nước ngoài theo Luật 91/2025.
- Không AI vẫn nhập được; đo chế độ tất định trước — nền đạt ngưỡng thì không dựng tác tử (Cổng Đáng của hàng tác tử đọc số
  nền).
- Chuẩn hoá là lớp chung của lõi cho mọi cửa vào; từ điển của sàn học từ lựa chọn của người; AI chỉ dọn từ điển định kỳ.
- Google Sheets bản đầu chỉ nhận file tải về; Picker + `drive.file` chờ điều kiện.

## Mã

- ND1 — lõi nhập tất định và bộ thử có đáp án; bộ chuẩn hoá dùng chung
- ND2 — thả file, xem trước từng ô, kiểm trùng, ghi qua lệnh; ngày xác nhận theo file
- ND3 — hoàn tác cả lần nhập bằng sự kiện bù
- ND4 — nhập lại cùng mẫu thì máy ghép sẵn
- ND5 — tác tử lập kế hoạch sau thoả thuận Xử lý bằng AI, cửa chặn nguồn, trần chi phí
- ND6 — ô lạ còn lại có đề xuất của máy
- ND7 — mọi cửa gõ tay gợi giá trị chuẩn; từ điển của sàn; sức khoẻ dữ liệu
- ND8 — máy dọn từ điển định kỳ
- ND9 — chọn file Google Sheets ngay trong Quỹ hàng (chờ điều kiện)
