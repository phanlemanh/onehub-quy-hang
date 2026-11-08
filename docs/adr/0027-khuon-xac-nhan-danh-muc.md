# ADR-0027: Khuôn sự kiện «xác nhận danh mục» v1 và trần theo loại kết nối

Ngày: 2026-11-08 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `khuon-xac-nhan-danh-muc` 08/11, Hỏi-1..5
theo khuyến nghị; duyệt kế hoạch cùng ngày) · Liên quan: ADR-0017 §6 sửa đổi 03/11 của kho `onehub-invest`; ADR-0015
(khuôn danh mục v1, chiều vào); ADR-0022 (đối chiếu ngành); Tham chiếu §3, §12; hàng 95 của lộ trình (XN2)

## Bối cảnh

Invest chốt 03/11 (issue #94) rằng lời xác nhận căn của mạng lưới sàn sinh ra trong công việc ở Quỹ hàng và đi sang
Invest qua một loại kết nối chiều ngược, chỉ lớp danh mục, máy thu Invest kéo về. DN6 của Invest đợi một khuôn có số
phiên bản. Trước hàng này, trần chỉ chặn lớp nguồn ở mọi thoả thuận — giá chốt vẫn mở được bằng điều khoản riêng — và
chưa loại kết nối nào ràng «chỉ một lớp».

## Quyết định

1. **Loại kết nối `catalog_confirmation` — «Xác nhận danh mục»** với **trần theo loại** (`KIND_LIMITS`,
   `packages/core/src/agreements.ts`): chỉ chiều ra, chỉ lớp `catalog`, không điều khoản riêng. `agreementErrors` từ
   chối thoả thuận lệch lúc ký; `mayFlow` từ chối từng lớp ngoài danh mục lúc chảy, trước bước điều khoản riêng.
   Migration 040 chặn lần nữa ở cơ sở dữ liệu (`agreements_xac_nhan_chi_danh_muc`), viết lặp lại được vì bản thật áp
   nó sau 052.
2. **Khuôn sự kiện v1** (`packages/connect/src/catalog-confirmation.ts`, `schemaVersion: 1`): ba loại — khung toà
   (`storiesTotal`, `skippedFloors`, `stacks`), thuộc tính căn (`upi`, `unitNumber`, `livingArea`, `bedroomsTotal`,
   `directionFaces`, `floor`, `stack`), báo sai (`upi`, `field`, `correctValue`) — kèm `officeKey`, `memberKey`,
   `observedOn`, `buildingKey`. `.strict()` ở mọi object; mọi chuỗi có mẫu hoặc là tập đóng; `directionFaces` theo lookup
   RESO. Không bao giờ chủ nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng; không trỏ hàng, lead, liên hệ.
3. **Chỉ dựng từ lõi** (`@quy-hang/core/confirmation`): hàm dựng từ chối khoá ngoài biểu mẫu và chữ tự do (không lọc
   lặng), chỉ dựng khi có thoả thuận «Xác nhận danh mục» đang bật, khoá phần riêng tra lớp ở bảng lớp của luật ẩn; kiểu
   sự kiện mang dấu của lõi.
4. **Năm lựa chọn của Cổng Phạm vi:** mốc `observedOn` theo **ngày** (Hỏi-1) · không có ô «sàn đã xác minh chủ với sổ» ở
   v1 (Hỏi-2) · toà chỉ trỏ bằng `buildingKey` có trong danh mục dùng chung (Hỏi-3) · sáu trường báo sai và ba loại sự
   kiện giữ cứng — nghĩa chuẩn để so giữa các sàn, điều khoá K32 (Hỏi-4) · mã mờ = HMAC-SHA256 với **khoá riêng từng bên
   nhận**, tiền tố miền, 43 ký tự (Hỏi-5).

## Hệ quả

- Invest kiểm sự kiện bằng chính khuôn và tệp ví dụ `catalog-confirmation.example.json` (sinh từ hàm dựng). Báo lại ở
  onehub-invest#296 là việc của chủ kho.
- Xoay khoá của một bên nhận là đổi mọi mã của bên ấy — Invest mất nối lịch sử «rút một công ty». Khoá sống lâu, chỉ xoay
  khi lộ; nơi giữ khoá là hàng 97.
- Đổi danh sách trường, loại sự kiện hay cách sinh mã là lên phiên bản khuôn mà Invest phải ghim lại.

## Không làm

- Hộp thư đi, API kéo, gom lô làm mờ giờ (hàng 97); token máy (96); bật / tắt theo sàn và nhật ký (98); sinh sự kiện từ
  công việc (100, 101).
- Toà ngoài danh mục, tầng tên chữ, khung thấp tầng — phiên bản khuôn sau.
