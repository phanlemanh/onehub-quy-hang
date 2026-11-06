# Hình tại điểm quyết định — truong-rieng-toi-thieu

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 trường của liên hệ chủ nhà mang lớp nguồn | 4 bước nối tiếp (màn → định nghĩa → giá trị → người đọc) + 2 nhánh (loại chủ → source / loại khách → custom_field) | `luong-truong-rieng.html` |
| Hỏi-6 không kèm khi phát hàng cho đội khác | chung hình với Hỏi-1 (nhánh ra ngoài bị chặn) | `luong-truong-rieng.html` |
| Hỏi-2 máy dò chặn tạo | dưới ngưỡng: 1 rẽ (trúng → Cách gọi) | — |
| Hỏi-3 kiểu, đối tượng cố định; lựa chọn không gỡ | dưới ngưỡng: 1 bước | — |
| Hỏi-4 chỉ Bảng hàng máy tính | dưới ngưỡng: danh sách mặt | — |
| Hỏi-5 trần 20 mỗi sàn | dưới ngưỡng: một con số | — |

## Đề bài `luong-truong-rieng`

- Loại hình: sơ đồ luồng dữ liệu trái → phải, ba làn (hàng · liên hệ khách · liên hệ chủ nhà), một cửa ra ngoài bị chặn.
- Nút: Màn Trường riêng (quản trị sàn) → máy dò trùng nghĩa (trúng → «đổi tên ở Cách gọi», dừng) → bảng `custom_fields` (mã,
  kiểu, lựa chọn, lớp; nhật ký; sàn B không thấy) → ba làn:
  - Hàng: lớp custom_field → sự kiện `custom_changed` → `listings.custom` → Bảng hàng máy tính (cột, sửa ô, lọc).
  - Liên hệ Người mua · Người thuê: lớp custom_field → `contacts.custom` → hồ sơ liên hệ.
  - Liên hệ Chủ bán · Chủ cho thuê: lớp **source** (Hỏi-1) → `contacts.custom` qua hàm ghi có kiểm quyền → chỉ người giữ và
    trưởng nhóm đọc.
- Cửa ra (trang khách /s/<mã>, phát hàng cho đội khác, xuất bảng, thoả thuận AI): một chốt «luật ẩn ở lõi — không có khoá
  custom» chặn cả ba làn (Hỏi-6).
- Nhãn bằng chữ: «Hỏi-1» trên làn chủ nhà; «Hỏi-6» trên chốt ra ngoài; «sàn B không thấy» trên `custom_fields`.
- AC liên quan: AC-1, AC-2, AC-4, AC-5, AC-6, AC-7, AC-9.
