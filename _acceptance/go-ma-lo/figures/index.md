# Hình tại điểm quyết định — go-ma-lo (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — đường lô có phục vụ khu thấp tầng mẫu trên bản thật không (sổ dòng 9) | 2 nhánh rẽ | `hoi-1-lo-mau.html` |
| Bộ tra lô riêng, ô gõ mã chọn đường theo loại hình (sổ dòng 8) | dưới ngưỡng: 1 bước | — |
| Cách đọc mã lô là dữ liệu của khu, danh mục thêm cấp dãy (sổ dòng 3, 4) | dưới ngưỡng: 1 bước | — |

## Đề bài `hoi-1-lo-mau.html`

- Loại: hai cột so sánh (hai lối), mỗi cột: điều người dùng thật thấy khi gõ «LK1-02» trên bản thật, rồi cái giá.
- Lối A (máy khuyên): danh mục lô mặc định rỗng → bản thật trả «chưa có khu thấp tầng» → thử bằng bộ kiểm và danh mục truyền vào → giá: chưa ai thử gõ mã lô trên bản thật tới khi Invest cấp dãy (LH11) hay hàng 76 có lô của sàn.
- Lối B: phục vụ khu thấp tầng [Mẫu] như danh mục căn hộ mẫu → bản thật trả lô LK1-02 [Mẫu] với diện tích, số tầng tự điền → giá: người dùng thật có thể tự điền thuộc tính của một lô không tồn tại.
- Chú thích chung: đổi lối sau là đổi một hằng (danh mục mặc định), không đổi bộ tra.
- AC liên quan: AC-9.
