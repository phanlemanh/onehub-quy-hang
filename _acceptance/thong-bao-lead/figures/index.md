# Hình tại điểm quyết định — thong-bao-lead

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Gửi qua hộp thư đi (giao lead → ghi dòng → gửi → lỗi tạm → nhịp gửi lại) | 5 bước nối tiếp, một rẽ | `hop-thu-di.html` |
| Hỏi-1 — trưởng nhóm nhận đẩy lời báo | dưới ngưỡng: một rẽ hai lối | — |
| Hỏi-2 — nội dung có mã căn | dưới ngưỡng: một rẽ hai lối | — |
| Hỏi-3 — chỗ đặt dải bật | dưới ngưỡng: một rẽ hai lối | — |

## Đề bài hình `hop-thu-di`

- Loại: sơ đồ luồng (flowchart) trái → phải.
- Nút: «Lead về đầu chủ (nhịp chia / trưởng nhóm giao / nhập lead)» → «Cùng giao dịch: ghi lead + ghi dòng hộp thư đi» → «Giao dịch ghi xong» → «Gửi tới mọi thiết bị của người nhận» → rẽ: «Thành công: ghi mốc gửi» / «404·410: gỡ đăng ký» / «Lỗi tạm: nhịp chia phút sau gửi lại (tối đa 3 lần, trong 15 phút)».
- Nhánh phụ: «Giao dịch quay lui → không có dòng, không gửi».
- AC liên quan: AC-3, AC-5.
