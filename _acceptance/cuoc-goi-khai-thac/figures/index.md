# Hình tại điểm quyết định — cuoc-goi-khai-thac (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · đường dẫn /units/call?lead= | hai nhánh (lead có mã căn / chỉ biết toà) → cần hình | luong-mo-va-ghi |
| Hỏi-5 · lúc tạo hồ sơ căn của lead | bốn bước nối tiếp (Gọi → mở → câu trả lời đầu → tạo hồ sơ → ghi) và hai nhánh (đã / chưa có hồ sơ) → cần hình | luong-mo-va-ghi |
| Hỏi-2 · bộ lựa chọn của danh sách hỏi | một bước, không rẽ → dưới ngưỡng: 1 bước | — |
| Hỏi-3 · ba tỉ lệ thuế phí | một phép tính, không rẽ → dưới ngưỡng: 1 bước | — |
| Hỏi-4 · tập căn đem so | một bộ lọc, không rẽ → dưới ngưỡng: 1 bước | — |

## Đề bài — luong-mo-va-ghi

- Loại hình: sơ đồ luồng (flowchart), ngang, chữ tiếng Việt.
- Nút: Hôm nay — dòng lead · nút «Gọi» → /units/call?lead=<mã lead> → đọc một lead (GET leads/assigned/<mã>) → rẽ: «đã có hồ sơ căn» / «chưa có hồ sơ căn» → (chưa) câu trả lời đầu tiên → tạo hồ sơ căn từ lead → ghi câu trả lời; (đã) ghi câu trả lời vào hồ sơ có sẵn → mức đủ tính lại trên máy → Ctrl+Enter về Hôm nay.
- Nhãn bằng chữ: đánh dấu hai ô quyết định «Hỏi-1 đường dẫn» ở nút mở và «Hỏi-5 tạo hồ sơ ở câu trả lời đầu» ở nhánh chưa có hồ sơ; ghi chú nhánh lối khác của Hỏi-5: «nút Tạo hồ sơ căn riêng (phím N)».
- AC liên quan: AC-1, AC-8, AC-9.
