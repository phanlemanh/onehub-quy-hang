# Điểm quyết định — Cổng Phạm vi tang-5-giao-dien

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1: «mức nợ giao diện» đếm gì | hai nhánh rẽ — cần hình | `muc-no.html` / `muc-no.png` |
| d-4 → dòng thay: mức nợ chặn ở CI qua `npm run lint` | dưới ngưỡng: 1 bước | — |
| d-8 → dòng thay: chỉ hoãn floor khỏi CI | dưới ngưỡng: 1 bước | — |
| d-5 → dòng thay: chỗ đặt skill | dưới ngưỡng: 1 bước | — |

## Đề bài hình `muc-no`

- Loại: sơ đồ rẽ nhánh (decision tree), 2 nhánh.
- Gốc: «Một chỗ vi phạm luật giao diện» → ba đường vào: sửa ngay · bị cho qua hàng loạt (suppress) · ngoại lệ ghi tay kèm lý do.
- Nhánh A (khuyến nghị): suppress → tính vào nợ → vượt trần 0 → CI đỏ; ngoại lệ có lý do → đếm, in riêng → CI xanh, người duyệt PR thấy dòng lý do.
- Nhánh B: cả suppress lẫn ngoại lệ có lý do → tính vào nợ → CI đỏ; ngoại lệ thật chỉ còn đường tắt luật theo tệp trong cấu hình lint.
- AC liên quan: AC-7.
