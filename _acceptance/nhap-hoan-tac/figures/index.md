# Hình tại điểm quyết định — nhap-hoan-tac

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 độ tươi giữ | dưới ngưỡng: 1 nhánh | — |
| Hỏi-2 tin bổ sung không thu lại | dưới ngưỡng: 1 nhánh | — |
| Hỏi-3 hai lối vào | dưới ngưỡng: 2 bước | — |
| Hỏi-4 «sửa sau» và căn đã gửi link | cần hình: mỗi dòng của lần nhập rẽ 7 nhánh | ket-cuc-hoan-tac |
| Hỏi-5 bỏ đường đo | dưới ngưỡng: 1 nhánh | — |

## Đề bài: ket-cuc-hoan-tac

- Loại hình: cây quyết định (flowchart trái → phải).
- Gốc: «Một dòng của lần nhập». Rẽ theo hành động: tạo căn · cập nhật căn có sẵn · tin bổ sung · bỏ qua.
- Tạo căn / cập nhật → hỏi «Có sự kiện nào sau lần nhập? (kể cả người nhập, kể cả xác nhận — Hỏi-4)» → có: «Không gỡ — liệt kê: Đã có người sửa sau lần nhập».
- Không: tạo căn → «Gỡ khỏi Quỹ hàng (sự kiện voided)»; cập nhật → đổi giá? → trước đó có giá: «Trả giá cũ» · chưa có giá: «Liệt kê: Trước lần nhập căn chưa có giá»; chỉ xác nhận ngày → «Liệt kê: Độ tươi theo ngày trong file vẫn giữ (Hỏi-1)».
- Tin bổ sung → «Liệt kê: Tin bổ sung đã gửi — không thu lại (Hỏi-2)»; bỏ qua → «Không làm gì, không liệt kê». AC: AC-1..AC-4.
