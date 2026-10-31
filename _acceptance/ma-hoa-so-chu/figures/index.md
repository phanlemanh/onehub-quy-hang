# Hình tại điểm quyết định — ma-hoa-so-chu

Điểm quyết định kê từ sổ (dòng S1 chờ seal) và câu hỏi chỉ-người. Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-2 Mã hoá ở tầng API, cơ sở dữ liệu chỉ giữ bản mã | 4 bước nối tiếp (ghi → mã hoá → lưu bản mã → mở số giải mã) | `luong-so-chu.html` |
| d-…-3 AES-256-GCM, bản mã gắn dòng | dưới ngưỡng: 1 bước | — |
| d-…-4 Thiếu khoá ở production thì không dựng API | dưới ngưỡng: 2 nhánh nhưng một trục (gộp vào hình luồng) | — |
| d-…-5 Giữ cột cũ, ràng buộc NOT VALID, lệnh mã hoá lại | 3 bước nối tiếp (migration → lệnh mã hoá lại → validate) | `luong-so-chu.html` (làn dưới) |
| d-…-6 Phủ số chủ của lead bằng dấu vết + quét lược đồ | dưới ngưỡng: 2 bước | — |
| d-…-9 Hỏi-1 Preview có nhận khoá thật | 2 nhánh rẽ | `hoi-1-preview.html` |

## Đề bài `luong-so-chu`

Loại: luồng dữ liệu (data flow), hai làn. Làn trên «Ghi và mở số»: Đầu chủ → API `PUT owner` (chuẩn hoá số, mã hoá
AES-GCM với ngữ cảnh sàn:hàng, tính dấu vết) → Postgres `listing_owners` (bản mã + dấu vết, cột số rõ luôn rỗng) →
API `Mở số` gọi hàm cơ sở dữ liệu (xét quyền, ghi sự kiện, trả bản mã) → API giải mã bằng `OWNER_PHONE_KEY` → số.
Khoá `OWNER_PHONE_KEY` chỉ nằm cạnh API (Vercel), mũi tên «không bao giờ» tới Postgres và bản sao lưu. Làn dưới «Dữ
liệu đã có»: migration 008 (ràng buộc NOT VALID chặn số rõ mới) → lệnh mã hoá lại (vai chủ + khoá) → validate ràng
buộc. AC liên quan: AC-1, AC-5, AC-6, AC-7, AC-9.

## Đề bài `hoi-1-preview`

Loại: cây quyết định hai nhánh. Gốc: «Bản xem trước của Vercel có nhận OWNER_PHONE_KEY thật?» Nhánh «Không — chỉ
Production (máy khuyên)»: bản xem trước không dựng API; mất gần như không gì vì bản xem trước chưa đăng nhập được
(ADR-0009); mã nhánh chưa duyệt không đọc được số. Nhánh «Có — Preview cùng khoá»: bản xem trước chạy đủ; mọi nhánh
chạy trên cơ sở dữ liệu thật đọc được số chủ khi có dữ liệu thật. AC liên quan: AC-10.

## Đề bài `hoi-2-so-trung` (thêm sau)

| d-…-10 Hỏi-2 so trùng số chủ bằng gì | 3 nhánh rẽ | `hoi-2-so-trung.html` |

Loại: cây quyết định ba nhánh. Gốc: «Ô nhận lead (hàng 24) so số chủ của lead với chủ nhà và lead khác bằng gì, khi số
đã mã hoá?» Nhánh 1 «Dấu vết có khoá theo sàn (máy khuyên)»: cột riêng cạnh bản mã; không thử ngược được khi thiếu
khoá; không thư viện mới; lộ «hai dòng trùng số» cho người đọc thẳng bảng. Nhánh 2 «Mã hoá tất định»: lộ trùng như nhánh
1; cần thư viện mới; một khoá gánh cả giấu và so. Nhánh 3 «Giải mã hết ở API để so»: không lộ trùng trong bảng; chậm
theo số dòng; mọi số của sàn đi qua bộ nhớ API mỗi lần nhận lead. AC liên quan: AC-3.
