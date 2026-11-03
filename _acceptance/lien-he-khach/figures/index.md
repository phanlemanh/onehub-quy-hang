# Hình tại điểm quyết định — lien-he-khach

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — khách đã do đầu khách khác phục vụ | 2 nhánh rẽ (số mới · số đã thuộc liên hệ) × 2 đầu khách | cần hình: `mot-khach-hai-dau-khach` |
| Hỏi-2 — tên khách trên nhu cầu | 3 bước nối (đầu khách gõ → nhu cầu → liên hệ không đọc) | gộp vào hình `mot-khach-hai-dau-khach` |
| Hỏi-3 — tập trường nhu cầu cố định | dưới ngưỡng: 1 bước | — |
| Hỏi-4 — lịch xem không dựng | dưới ngưỡng: 1 nhánh | — |
| Hỏi-5 — không mở lại số khách | dưới ngưỡng: 1 nhánh | — |

## Đề bài `mot-khach-hai-dau-khach`

- Loại hình: sơ đồ quan hệ dữ liệu (một người ở giữa).
- Nút: Liên hệ (một người: loại Chủ bán + Người mua; số A, số B; người giữ = đầu chủ 1) · Nhu cầu khách 1 (đầu khách 1, tên
  «[Tên] 1») · Nhu cầu khách 2 (đầu khách 2, tên «[Tên] 2») · Lần gửi 1 → nhu cầu 1 · Lần gửi 2 → nhu cầu 2 · Hàng của chủ
  (đầu chủ 1).
- Nhãn bằng chữ: «đầu khách không đọc liên hệ», «đầu chủ không thấy nhu cầu», «trưởng nhóm thấy cả hai», «người gửi = ghi
  công».
- AC liên quan: AC-4, AC-5, AC-6, AC-8.
