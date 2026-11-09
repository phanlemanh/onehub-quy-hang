# Logo OneHub cho Quỹ hàng — thiết kế

Ngày: 2026-11-09 · Hạng: T2 · Hồ sơ: `_acceptance/logo-onehub/`

## Vì sao

Quỹ hàng đang dùng tạm hai thứ không phải thương hiệu: ô hộp màu chính ở cột nhà và đăng nhập, biểu tượng ba vạch khi cài
lên màn hình chính, và không có biểu tượng trên thẻ trình duyệt. Chủ kho muốn dùng logo OneHub đang chạy ở OneHub CRM.

## Logo bên CRM

Chỉ đọc `~/dev/crm`. CRM có hai dạng: hình sáu lục giác (`Logo`, không chữ) và bản ngang kèm chữ «OneHub» (`LogoLockup`).
Hình dùng một dải màu xanh, giống nhau ở sáng và tối; chỉ chữ của bản ngang đổi màu theo nền. Bộ icon CRM sinh sẵn: favicon
16/32/48 trong suốt, apple 180 và manifest 192/512 nền trắng đục.

CRM dùng hình không chữ trong app (cột, thanh) và bản ngang ở trang đăng nhập.

Logo không mang chữ «CRM», nên không có gì phải cắt ghép. Dùng dạng nào ở đăng nhập là Hỏi-1 của Cổng Phạm vi.

## Quyết định

- Chỉ dùng **hình sáu lục giác**, giữ chữ «Quỹ hàng» cạnh nó ở đăng nhập. Tên sản phẩm không đổi; bản ngang chữ «OneHub» sẽ
  thay tên sản phẩm bằng tên công ty.
- **Chép nguyên tệp** của CRM, không vẽ lại: `favicon.svg` thành tệp dấu hiệu, `favicon.ico`, apple 180, manifest 192/512.
- Tệp SVG nằm ở `public/icons/`, hiện qua thẻ ảnh của Next. Mã màu nằm trong tệp ảnh, không vào mã giao diện (luật màu). Thư
  mục `/icons/` đã tải được khi chưa đăng nhập.
- Một thành phần dùng chung `DauHieuOneHub`, cột nhà và đăng nhập cùng gọi.
- Trang khách `/s/<mã>` không có logo Quỹ hàng hôm nay, đầu trang là tên sàn. Không thêm.
- Thanh trên của vỏ điện thoại không có logo hôm nay (tên nhà · gõ mã · chuông). Không thêm.

Favicon theo tên miền nên trang khách cũng nhận biểu tượng này trên thẻ trình duyệt (Hỏi-2). Đây chỉ là hình thương hiệu,
không phải dữ liệu nội bộ, nhưng là thứ khách của sàn nhìn thấy nên chủ kho quyết.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: người mở trang → thấy dấu hiệu OneHub ở đúng chỗ ô hộp cũ (điểm ra: không đổi luồng).
- Biên: tệp ảnh không tải được → ô trống đúng cỡ, không xô lệch bố cục, vì thẻ ảnh khai sẵn rộng và cao.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cột nhà của vỏ máy tính | Điều hướng giữa các nhà | Sau đăng nhập / các nhà |
| Đăng nhập, chọn sàn, chưa gắn sàn | Đưa người vào một sàn | Chưa có phiên / trong ứng dụng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cot-nha-mac-dinh | Cột nhà | Hình sáu lục giác ở đầu cột, sáng và tối | Bấm nhà |
| ST-dang-nhap-mac-dinh | Đăng nhập | Hình sáu lục giác cạnh chữ «Quỹ hàng», 1440 và 375, sáng và tối | Điền email |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ảnh là trang trí, chữ thay thế rỗng: cột nhà và đăng nhập đã có tên sản phẩm hoặc tên nhà cho trình đọc màn hình.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `next/image` | dùng | Thẻ ảnh của khung, khai sẵn cỡ nên không xô bố cục |
| `DauHieuOneHub` | ghép | Một dòng quanh thẻ ảnh để hai chỗ gọi cùng một nguồn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke), không đổi. Căn cứ: việc chỉ thay một hình ở vỏ đang có, luồng hiển nhiên,
không tra mẫu.

### 7. Thẻ việc

- Người: mọi người dùng Quỹ hàng. Việc: nhận ra đang ở sản phẩm của OneHub. Dữ liệu: không có. Xong khi: logo đúng hiện ở cột
  nhà, đăng nhập, thẻ trình duyệt, màn hình chính. Ngoài: không đổi bố cục màn nào.
<!-- UX-SPEC-TEMPLATE>>> -->
