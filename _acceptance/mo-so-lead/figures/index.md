# Hình tại điểm quyết định — mo-so-lead

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — trưởng nhóm có mở được số của lead | hai nhánh rẽ (chỉ đầu chủ được giao · thêm trưởng nhóm) → cần hình | `luong-mo-so.html` |
| Hỏi-2 — bấm «Mở số» có tự ghi «Đã nhận» | hai nhánh rẽ (không đổi nấc · tự ghi nhận) → cần hình | `luong-mo-so.html` (cùng hình) |
| Hỏi-3 — lead căn trùng có mở số được | hai nhánh rẽ (không mở · mở được) → cần hình | `luong-mo-so.html` (cùng hình) |
| Dòng sổ: một cửa mở số luôn ghi vết | dưới ngưỡng: một bước, không rẽ | — |
| Dòng sổ: lead còn việc theo định nghĩa hạn nhận/gọi | dưới ngưỡng: một điều kiện chặn | — |
| Dòng sổ: số không lưu trên máy | dưới ngưỡng: một bước | — |
| Bỏ quét coverage · bỏ design-pass · không mở số khác của liên hệ | dưới ngưỡng: không rẽ | — |

## Đề bài hình `luong-mo-so`

- Loại: sơ đồ luồng (flowchart) một chiều trái → phải, hai điểm rẽ đánh dấu «Hỏi-1», «Hỏi-2».
- Nút: Đầu chủ bấm «Mở số» trên dòng lead ở Hôm nay → Máy chủ kiểm: người bấm có phải đầu chủ đang được giao lead, lead còn
  trong việc (chưa trả lại/bỏ/gửi lại) → [không] «Từ chối, không ghi vết» · [có] Ghi một vết (người, vai, lúc) → Trả số →
  Dòng hiện số + nút «Gọi» (ứng dụng gọi của máy) → Đầu chủ tự bấm «Nhận» / «Đã gọi».
- Rẽ Hỏi-1 (ở bước kiểm): nhánh khuyến nghị «chỉ đầu chủ được giao»; nhánh khác «trưởng nhóm cùng sàn cũng mở» (nét đứt).
- Rẽ Hỏi-2 (sau «Trả số»): nhánh khuyến nghị «không đổi nấc lead»; nhánh khác «tự ghi Đã nhận» (nét đứt).
- Nhãn bằng chữ Việt; AC liên quan: AC-1, AC-2, AC-5.
