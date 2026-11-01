# Bài chuyển dữ liệu cũ không kẹt khoá — thiết kế

Ngày 01/11 · hàng `chuyen-khong-ket-khoa` (dãy L, giám sát giao) · hạng T2 (chỉ tệp bài kiểm `packages/api/test-db`).

## Vấn đề

Ghim lại PR #66 của dãy H đỏ: ca «liên hệ: chuyển dữ liệu cũ» (`packages/api/test-db/lien-he-chuyen.test.ts`, hàng 85)
báo `deadlock detected` ở bước «đưa sàn về trạng thái trước 016». Bước ấy xoá liên hệ; cơ sở dữ liệu kiểm khoá ngoại trên
bảng lead rồi bảng chủ nhà. Hai bài kiểm khác chạy song song (`ma-hoa-so-chu.test.ts`, `bat-rang-buoc-migrate.test.ts`) tạm
gỡ ràng buộc trong một giao dịch khoá độc quyền bảng chủ nhà rồi bảng lead — thứ tự ngược nhau, hai bên chờ nhau. Tái hiện
tất định: giữ khoá độc quyền bảng chủ nhà, cho bài chuyển xoá liên hệ, rồi xin khoá bảng lead → `deadlock detected`.

## Cách làm

- Trong tệp bài kiểm: hàm `theoThuTuKhoa` mở một giao dịch, khoá bảng chủ nhà rồi bảng lead (chế độ ghi dòng) trước mọi câu
  ghi; bước «trước 016» và lời gọi hàm chuyển chạy trong đó. Cùng thứ tự với nếp «đọc bảng chủ nhà trước bảng lead» của các
  hàm lead (015, 016).
- Ca mới «liên hệ: bài chuyển không kẹt khoá với bài gỡ ràng buộc chạy song song» dựng đúng thế kẹt: một giao dịch giữ khoá
  độc quyền bảng chủ nhà, bài chuyển chạy, giao dịch ấy xin khoá bảng lead — không được kẹt, và bài chuyển chạy trọn sau đó.
- Không đổi lược đồ, không đổi mã sản phẩm, không đổi hai bài gỡ ràng buộc (thước của hồ sơ khác).

## Ngoài phạm vi

- Hàm chuyển của migration 016 chạy một lần lúc áp migration, không có bài gỡ ràng buộc song song — không đổi.
- Chạy cả bộ kiểm tuần tự — chậm hơn cho mọi dãy.

## Đặc tả UX

Không có màn — bỏ.
