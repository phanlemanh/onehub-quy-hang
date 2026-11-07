# Hình tại điểm quyết định — kiem-nhanh-rang-buoc-ban-ma

| Điểm | Đếm | Hình |
|---|---|---|
| Luật ràng buộc bản mã: số rõ × ràng buộc × vai → đỏ hay chỉ báo | 3 nhánh rẽ | luat-ban-ma |
| Hai cặp bảng giữ cứng | dưới ngưỡng: 0 bước | — |

## Đề bài luat-ban-ma

- Loại: cây quyết định trái sang phải, cho MỖI bảng (listing_owners, leads).
- Nút 1: vai kết nối thấy mọi dòng? (superuser hoặc bypassrls) — Không → ĐỎ «vai kết nối chịu luật theo dòng».
- Nút 2: ràng buộc *_phone_chi_ban_ma có không? — Không → ĐỎ «thiếu ràng buộc».
- Nút 3: còn số rõ (đếm > 0)? × ràng buộc đã bật?
  - 0 số rõ + đã bật → XANH «bật»
  - 0 số rõ + chưa bật → ĐỎ «bảng sạch mà ràng buộc chưa bật»
  - còn số rõ + chưa bật → XANH có báo «còn N số rõ (chờ mã hoá lại)»
  - còn số rõ + đã bật → ĐỎ «ràng buộc bật mà còn số rõ» (không thể có)
- Ghi chú: chỉ đếm dòng, không đọc giá trị số; một kết nối, chỉ đọc; đỏ thì không gọi Vercel.
- AC: AC-1, AC-2, AC-3, AC-6.
