# Hình tại điểm quyết định — hom-nay-dau-chu-dien-thoai

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — ngăn «Kết quả cuộc gọi» mở ngay khi chạm «Gọi», hay chỉ khi trang hiện lại | hai nhánh rẽ, mỗi nhánh ba bước nối tiếp | `goi-mot-cham.html` |
| Nút mép phải «Gọi» ở dòng mà việc là gọi (giám sát trả H-23) | dưới ngưỡng: đã quyết, không chờ người | — |

## Đề bài: `goi-mot-cham`

- Loại hình: luồng hai nhánh so sánh, khổ điện thoại; chung bước đầu: thẻ «[Mẫu] Lead 1 · Lead mới · còn 12 phút», chạm
  «Gọi» → máy chủ mở số → máy mở cuộc gọi.
- Nhánh A (khuyến nghị) «mở ngay»: ngăn «Kết quả cuộc gọi» mở cùng lần chạm, nhớ trên máy → quay lại app (kể cả trang tải
  lại) → ngăn vẫn ở đó → chạm «Đã gọi». Giá: huỷ cuộc gọi vẫn thấy ngăn, chạm «Không nghe máy» để đóng.
- Nhánh B «mở khi hiện lại»: không có ngăn lúc chạm → quay lại app → trang hiện lại thì mở ngăn → chạm «Đã gọi». Giá: huỷ
  trước khi rời app hay app bị dừng ở nền (trang tải lại) thì không có ngăn, phải tìm lại thẻ.
- AC liên quan AC-4, AC-5.
