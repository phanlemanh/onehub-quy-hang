# Hình tại điểm quyết định — chia-lead-va-han (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Chia trong nhịp, thứ tự chọn người (dòng sổ 3, 5, 6; Hỏi-2) | 3 bước nối tiếp (lead chờ → chọn người → về người / chờ + báo) và 2 nhánh rẽ (người của lead cùng số · người phụ trách toà) | nhip-chia-va-han |
| Hạn 15/30 phút tính từ mốc về người (dòng sổ 2; Hỏi-3) | 3 bước nối tiếp (về người → 15 phút chưa nhận → 30 phút chưa gọi) | nhip-chia-va-han |
| Hỏi-1 nhịp mỗi phút trên bản thật | 3 nhánh rẽ (pg_cron Supabase · kiểm lúc mở app · Vercel Pro) | nhip-chia-va-han |
| Dùng lại cột người nhận của hàng 24 (dòng sổ 4) | dưới ngưỡng: 1 lựa chọn cột | — |
| Hỏi-4 ai đánh dấu nghỉ | dưới ngưỡng: 1 lựa chọn quyền | — |
| Bốn mục bỏ (thông báo → 26; màn → 22, 27, 28; Cài đặt sàn → P1; tự giao lại) | dưới ngưỡng | — |

## Đề bài: nhip-chia-va-han

- Loại hình: flowchart ngang, ba làn.
- Làn «Nhịp mỗi phút»: nút «Bên gọi mỗi phút (Hỏi-1: pg_cron Supabase — khuyến nghị · kiểm lúc mở app · Vercel Pro)» →
  «POST /api/v1/jobs/lead-tick có khoá» → «Mỗi sàn có việc, một giao dịch dưới luật theo dòng».
- Làn «Chia»: «Lead không trùng chờ chia (cũ trước)» → rẽ «Đầu chủ của lead trước cùng số còn làm?» có → «Về người ấy»;
  không → «Đầu chủ phụ trách toà, không nghỉ?» có → «Về người lâu chưa được chia nhất (hoà: vào sàn trước)»; không →
  «Lead chờ · trưởng nhóm được báo «chưa chia được» một lần (Hỏi-2) · nhịp sau thử lại».
- Làn «Hạn»: «Lead đã về người (được chia, hay chủ trùng lúc nhập — Hỏi-3)» → «Quá 15 phút chưa nhận → báo trưởng nhóm» →
  «Quá 30 phút chưa gọi lần đầu → báo trưởng nhóm»; nhãn phụ «mỗi loại một lời mỗi lần giao · trưởng nhóm giao lại thì
  mốc bắt đầu lại».
- Nhãn chung: «Lời báo chỉ trong app cho trưởng nhóm — không số chủ, không gửi tin (thông báo lên máy: hàng 26)».
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5, AC-7, AC-8, AC-10.
