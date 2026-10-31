# Hình tại điểm quyết định — o-nhan-lead (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Lead là bản ghi riêng tới khi đầu chủ nhận (dòng sổ 2) | 3 bước nối tiếp (nhập → kiểm trùng → chờ / về đầu chủ / tin bổ sung) | luong-kiem-trung |
| Căn trùng thắng chủ trùng (dòng sổ 4) | 2 nhánh rẽ (hai dữ kiện) | luong-kiem-trung |
| Hàng mở = bốn trạng thái chưa nấc cuối (dòng sổ 5) | dưới ngưỡng: 1 phép lọc | — |
| Vai nhập được lead (dòng sổ 6) | dưới ngưỡng: 1 bảng vai | — |
| Bản của telesales không số, không hàng (dòng sổ 7) | dưới ngưỡng: 1 lọc | — |
| Gửi lead cần mạng (dòng sổ 8) | dưới ngưỡng: 1 nhánh | — |
| Hỏi-1 nhu cầu · Hỏi-2 thời gian · Hỏi-3 tên đầu chủ | dưới ngưỡng: mỗi câu một lựa chọn giá trị | — |
| Hai mục bỏ (cột phải L1 → hàng 27; lead trùng lead chờ chia → hàng 25) | dưới ngưỡng | — |

## Đề bài: luong-kiem-trung

- Loại hình: flowchart (luồng quyết định), ngang.
- Nút: «Telesales gửi lead (năm mục)» → «Lõi kiểm năm mục» (sai → «Lỗi dưới ô») → «Cơ sở dữ liệu lấy hai dữ kiện trong sàn đang làm: hàng mở trên căn · đầu chủ của chủ nhà» → rẽ: «Có hàng mở trên căn?» có → «Căn trùng: tin bổ sung cho đầu chủ của hàng — cho «Bỏ lead này», có ghi lại»; không → «Chủ nhà đã có đầu chủ?» có → «Chủ trùng: lead về đầu chủ ấy»; không → «Không trùng: chờ chia theo luật của sàn (hàng 25)».
- Nhãn phụ: «Telesales chỉ thấy kết quả + tên đầu chủ — không hàng, không số (luật 21)»; «Hàng mở = Chưa đủ để rao · Đang bán · Đang giao dịch · Tạm ngừng».
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5, AC-7, AC-8.
