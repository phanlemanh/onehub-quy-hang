# Hình tại điểm quyết định — truc-ai-thay-hang

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — hàng đã lên «Toàn sàn» rời Đang bán: giữ hay hạ | hai nhánh rẽ (giữ / hạ) trên dãy trạng thái sáu nấc | cần hình: `vong-nac.html` |
| Nấc tính từ sự kiện, không cột (d-…-2) | một bước | dưới ngưỡng: 1 bước |
| Chặn ở lõi + API, không luật theo dòng (d-…-3) | bốn đường cùng một hàm, không rẽ | dưới ngưỡng: 0 nhánh |
| «Chỉ tôi» = người tạo (d-…-4) | một bước | dưới ngưỡng: 1 bước |
| Lên «Toàn sàn» lúc lần đầu Đang bán (d-…-5) | gộp vào hình Hỏi-1 | trong `vong-nac.html` |
| Lệnh của người không thấy hàng → 404 trước mọi xét (d-…-7) | hai bước | dưới ngưỡng: 2 bước |
| Bỏ «Nhóm», bỏ đổi tay, bỏ đặc tả UX, bỏ ui-observed, bỏ design-pass | không rẽ | dưới ngưỡng: 0 |

## Đề bài `vong-nac`

- Loại hình: sơ đồ trạng thái (state machine), hai làn nấc.
- Nút: sáu trạng thái chuẩn của hàng — Chưa đủ để rao, Đang bán, Đang giao dịch, Đã bán, Tạm ngừng, Ngừng hẳn — xếp
  trong hai vùng: «Chỉ tôi (chỉ người tạo đọc)» chứa Chưa đủ để rao và hai nấc cuối khi chưa từng Đang bán (Tạm ngừng,
  Ngừng hẳn đi thẳng từ Chưa đủ để rao); «Toàn sàn (cả sàn đọc)» chứa Đang bán và mọi trạng thái sau đó.
- Mũi tên: Chưa đủ để rao → Đang bán nhãn «Sẵn sàng bán — lên Toàn sàn»; Đang bán → Tạm ngừng / Đang giao dịch / Đã bán /
  Ngừng hẳn ở lại vùng Toàn sàn, nhãn «giữ Toàn sàn (Hỏi-1, khuyến nghị)»; một mũi tên đứt nét từ Tạm ngừng (đã từng
  Đang bán) về vùng Chỉ tôi nhãn «lối khác: hạ về Chỉ tôi — không chọn».
- AC liên quan: AC-1, AC-3, AC-6.
