# Đăng nhập theo khối auth-15 — thiết kế

Hàng 93 của lộ trình. Hồ sơ `_acceptance/dang-nhap-auth-15/` (T2, làn V). Ô cơ hội ký `build` 02/11.

## Bài toán

Ba màn đứng trước lúc người có sàn — đăng nhập, chọn sàn, chưa gắn sàn — đang là bản ghép tạm bậc 6 của hàng 6 (một
`Frame` hẹp giữa trang). Chủ kho đã chọn khối `@reui/auth-15` bỏ nút OAuth (02/11, `docs/design/vo-va-ia.md` §2); dòng
«Chỗ hở» của bản ghép quá hạn từ 30/10.

## Cách làm

- Chuyển thể `auth-15` vào **chính khuôn `Khung`** của nhóm xác thực (`apps/web/src/app/(auth)/khung.tsx`) — đúng chỗ bản
  đồ khuôn `design/patterns/xac-thuc.md` đã định. Ba `page.tsx` giữ nguyên lời gọi `<Khung title="…">`, nên ba màn cùng
  đổi mà không màn nào viết lại bố cục.
- Giữ của khối: dấu hiệu trên đầu, một cột `max-w-88` giữa trang với tiêu đề `text-3xl` và lời dẫn, ô `InputGroup` có
  biểu tượng đầu ô và lời dặn dưới ô, nút rộng trọn cột, chân trang chữ nhỏ ở đáy.
- Đổi: dấu hiệu ReUI → dấu Quỹ hàng theo Hỏi-2 (khuyến nghị ô hộp màu chính của vỏ, `BoxesIcon` như
  `components/shell/home-rail.tsx`; lối khác biểu tượng ứng dụng ba vạch) cạnh chữ «Quỹ hàng»; chữ tiếng Việt, tiêu đề
  «Đăng nhập Quỹ hàng» giữ của hàng 6; magic link → mã 6 số (hai bước như hàng 6).
- Bỏ: ba nút Google/Apple/GitHub và dải «Or continue with» (kho chỉ đăng nhập bằng mã email, ADR-0005); ba liên kết chân
  trang và dòng bản quyền — chân trang còn đúng một câu điều khoản, không liên kết (kho chưa có trang đích); câu chữ theo
  Hỏi-1 (khuyến nghị «Sàn của bạn dùng Quỹ hàng theo điều khoản trong hợp đồng đã ký.», không lời «đồng ý»).
- Không đổi: luồng hai bước, chữ lỗi, đường API (`/api/v1/auth/*`), chuyển hướng giữa ba màn, khối «Máy bị báo mất»
  (hàng 38) trên màn đăng nhập, nút Đăng xuất ở hai màn sau. Không tệp nào dưới `packages/api/src/auth` đổi.
- Sổ thiết kế: dòng «Chỗ hở» «Đăng nhập, chọn sàn, chưa gắn sàn (tạm)» rời `vo-va-ia.md` §3; bảng «Khối đã chuyển thể» của
  `catalog.md` thêm dòng `@reui/auth-15`; `xac-thuc.md` thôi gọi Khung là khuôn tạm; bài kiểm chuẩn (test) đếm 12 dòng
  Chỗ hở và 2 cảnh báo hạn.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: `/login` → gõ email, «Gửi mã» → gõ mã 6 số, «Vào» → `/` (một sàn) hoặc `/select-company` (nhiều sàn) → bấm
  tên sàn → `/`.
- Biên: tài khoản không thuộc sàn nào → `/no-company` (câu nhờ quản trị mời + Đăng xuất); máy bị báo mất → khối báo trên
  `/login` trước ô email.
- Lỗi & quay lại: mã sai → lỗi dưới ô mã, gõ lại; mã hết hạn → nút «Gửi lại mã»; xin mã quá nhiều → lỗi dưới ô email;
  «Đổi email» về bước một.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập | Nhận mã qua email rồi vào | chưa có phiên / `/` hay chọn sàn |
| Chọn sàn làm việc | Chọn một sàn để vào | đăng nhập khi thuộc nhiều sàn / `/` |
| Chưa thuộc sàn nào | Báo chưa có sàn, cho đăng xuất | đăng nhập khi không thuộc sàn nào / `/login` |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dang-nhap-email | Đăng nhập | Ô Email có biểu tượng thư, lời dặn «Quỹ hàng gửi mã 6 số tới email này.», nút «Gửi mã →» | Gõ email, gửi |
| ST-dang-nhap-dang-gui | Đăng nhập | Nút «Đang gửi…» khoá | Chờ |
| ST-dang-nhap-ma | Đăng nhập | Ô «Mã 6 số» có biểu tượng khoá, lời dặn «Đã gửi mã tới <email>», «Vào →», «Đổi email» | Gõ mã, vào |
| ST-dang-nhap-loi | Đăng nhập | Lỗi dưới đúng ô (mã sai · hết hạn · quá nhiều lần · lỗi khác), lời dặn vẫn còn | Gõ lại · Gửi lại mã · Đổi email |
| ST-dang-nhap-bi-bao | Đăng nhập | Khối báo «Máy này đã bị báo mất» trên ô email | Đăng nhập lại |
| ST-dang-nhap-bi-bao-loi | Đăng nhập | Khối lỗi «Chưa xoá được dữ liệu Quỹ hàng trên máy — thử lại» kèm nút «Thử lại» (AC-9) | Thử lại |
| ST-chon-san-mac-dinh | Chọn sàn làm việc | Mỗi sàn một nút rộng trọn cột, Đăng xuất | Bấm sàn |
| ST-chua-gan-mac-dinh | Chưa thuộc sàn nào | Câu «Tài khoản <email> chưa thuộc sàn nào…», Đăng xuất | Đăng xuất |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô email `type=email` bắt buộc, tự focus; ô mã chỉ nhận số, tối đa 6, `autocomplete=one-time-code`; gửi lại mã chuyển
  focus về ô mã. Khổ 375 không cuộn ngang; chân trang xuống hai dòng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `@reui/auth-15` (vào `Khung`) | dùng (chuyển thể) | Khối đích chủ kho chọn |
| `InputGroup`, `Field`, `Button`, `Item` | dùng | Đã cài, đúng thành phần của khối |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: luồng hiển nhiên — hai bước email → mã rồi một bước chọn sàn, giữ nguyên hàng 6; không tra mẫu.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Người trong sàn (mọi vai) |
| Việc chính | Vào được đúng sàn của mình |
| Tần suất | hiếm (phiên 30 ngày trượt) |
| Số bản ghi | một |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
