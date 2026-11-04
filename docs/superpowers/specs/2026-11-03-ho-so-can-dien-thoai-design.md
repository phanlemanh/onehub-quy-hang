# Hồ sơ căn của Đầu khách trên điện thoại — thiết kế

Hàng 33 của lộ trình (màn P0 M3, phủ K3; dãy B, đợt dau-khach-nhap). Ô cơ hội:
`_acceptance/ho-so-can-dien-thoai/opportunity.md` (Cổng Đáng ký `build` 02/11). Đứng trên hàng 17 (hồ sơ căn) và 32 (bảng
thẻ mở hồ sơ toàn màn).

## Hiện trạng

- Hồ sơ căn là một cây cho mọi vai: `CotHoSo` → `HoSoCan` (`apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`) dựng ở
  cột phải Bảng hàng, ở hồ sơ toàn màn điện thoại (`HoSoDienThoai`, hàng 32 gọi từ bảng thẻ) và ở `/units/<mã>`.
- Màn đã có giá kèm điều kiện phí, dòng lần xác nhận («Xác nhận N ngày trước»), mục Ảnh ba ngăn, thuộc tính khoá, lần rao,
  lịch sử. **Chưa có phần chủ nhà nào** — lớp `source` ở bảng riêng, chỉ ra qua `GET /listings/{id}/owner`, web chưa gọi.
- Với Đầu khách: ngăn «Nội bộ» vẫn hiện kèm ổ khoá và lời «chỉ người giữ căn và trưởng nhóm xem»; nút «Sẵn sàng bán» hiện
  theo trạng thái căn mà không theo vai; không có lối hỏi đầu chủ đang giữ căn.
- `ownerView` của lõi đã trả `{ visible: false, listingAgentUserId }` cho người không thấy nguồn, «để màn hiện «Liên hệ đầu
  chủ»». Sàn chỉ lưu tên và email người dùng (`identity.user`), chưa có số điện thoại nhân viên.
- Bản đồ khuôn `design/patterns/ho-so-can.md` ghi hạn ngoại lệ: `/units/[code]/page.tsx` và hai trang mẫu
  `proto/cot-ho-so-can`, `proto/anh-can-ba-ngan` chuyển sang bố cục Hồ sơ ở hàng này.

## Cách làm (theo khuyến nghị ở Hỏi-1…3 — chờ chủ kho chốt ở Cổng Phạm vi)

1. **Lớp phủ quyền trên cùng màn** (Tham chiếu «Quyền là lớp phủ trên cùng một màn»). Một hàm thuần ở lõi
   `lopPhuHoSo(viewer, listingAgentUserId)` trả các cờ hiển thị: `noiBo` (ngăn Nội bộ có mặt), `sanSang` (nút Sẵn sàng
   bán), `suaAnh`, `hoiDauChu` (nút hỏi đầu chủ). Màn đọc cờ, không rẽ theo tên vai. Đầu khách: không ngăn Nội bộ (tab vắng
   hẳn, không ổ khoá), không Sẵn sàng bán, không thêm hay sửa ảnh; thấy giá, lần xác nhận, ảnh Gửi được (bìa trước) và Tự có
   từ mã, thuộc tính, lần rao, lịch sử. «Báo sai thông tin căn» giữ cho mọi vai (danh mục chung, ai thấy sai cũng báo).
   Đầu chủ giữ căn và Trưởng nhóm thấy như trước.
2. **Nút hỏi đầu chủ** (nhãn theo Hỏi-2, khuyến nghị «Hỏi đầu chủ») dính đáy hồ sơ của người không thấy nguồn. API
   `GET /listings/{id}/owner` trả thêm `listingAgentName` (tên người dùng của đầu chủ giữ căn, không email, không số) trong
   nhánh `visible: false`. Chạm nút mở **bảng chia sẻ của máy** (`navigator.share`) với tin soạn sẵn «Hỏi về căn <mã> ·
   <toà>» và đường tới hồ sơ trong sàn (`/inventory?unit=…`); người tự chọn ứng dụng và người nhận (bất biến 3). Máy không
   có bảng chia sẻ → chép tin vào bộ nhớ tạm và báo «Đã chép tin hỏi». Căn chưa ai giữ → nút mờ, chữ «Căn chưa có đầu chủ
   giữ». Mất mạng → tên đầu chủ không tải được, nút vẫn mở bảng chia sẻ với tin không tên.
3. **Bố cục Hồ sơ** cho `/units/<mã>` (hạn ngoại lệ của bản đồ khuôn): trang dựng qua `BoCuc` kiểu `ho-so`; hai trang mẫu
   `proto/cot-ho-so-can`, `proto/anh-can-ba-ngan` theo cùng bố cục; ba dòng `ngoai_le_han` rời bản đồ.
4. Tài liệu: Tham chiếu §12 thêm dòng 03/11; nếu Hỏi-2 đổi nhãn thì sửa §4, §8 và `CONTEXT.md` (dòng va chữ «Liên hệ»).

Không làm: dựng lại hồ sơ điện thoại theo `product-detail-5` (hàng riêng cho 33, 40–41, theo Hỏi-3); «Xin dẫn xem» (P1,
chờ phỏng vấn — Tham chiếu §13); số điện thoại nhân viên; thông báo trong ứng dụng; trang khách.

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Đầu mối liên hệ của căn cho môi giới khác | `Property.ListAgentKey`, `ListAgentFullName`, `ListAgentDirectPhone`, `ListAgentEmail`; `ShowingContactName`/`Phone` | KW Command Internal Listing: chỉ agent KW thấy, agent đứng tên hiện trên listing (chưa kiểm chi tiết trường) | Lofty Manual Listing: chọn agent đứng tên (`docs/product/doi-chieu-nganh.md` §6) | Hiện tên đầu chủ giữ căn (`ListAgentKey` → tên); hỏi qua bảng chia sẻ của máy | Không — đầu mối là người giữ căn, không phải danh sách tự đặt |
| Phần chủ nhà ẩn với môi giới khác | `Media.Permission = Agent Only`; `PrivateRemarks` | KW: phạm vi Internal Listing do người tạo đặt | Lofty: chọn hiện trên site nào (chưa kiểm phạm vi trong đội) | Ẩn ở lõi theo lớp `source` (bất biến 2), màn chỉ đọc cờ | **Ta cứng — họ cấu hình**: ai thấy nguồn là bất biến 2 của kho, không mở cho sàn chỉnh |
| Ảnh của môi giới khác thấy | `Media.Permission`, `Order` | — chưa kiểm | — chưa kiểm | Ngăn Gửi được + Tự có từ mã; Nội bộ vắng | Không — ngăn ảnh là luật hàng 18 |

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng thẻ → chạm thẻ → hồ sơ toàn màn → đọc giá, lần xác nhận, ảnh → chạm «Hỏi đầu chủ» → bảng chia sẻ của
  máy mở với tin soạn sẵn (điểm ra: người chọn Zalo gửi đầu chủ, hoặc lùi về bảng thẻ).
- Biên: căn chưa ai giữ → nút mờ «Căn chưa có đầu chủ giữ»; máy không có bảng chia sẻ → chép tin, báo «Đã chép tin hỏi»;
  Đầu chủ giữ căn mở cùng hồ sơ → không có nút hỏi, có ngăn Nội bộ và Sẵn sàng bán như trước.
- Lỗi & quay lại: mất mạng → hồ sơ từ kho trên máy, tên đầu chủ vắng, nút vẫn mở bảng chia sẻ; người huỷ bảng chia sẻ → về
  hồ sơ, không gì đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn (điện thoại, Đầu khách) | xem một căn đủ để gửi khách hay hỏi đầu chủ | Bảng hàng thẻ, `/units/<mã>` / lùi về, bảng chia sẻ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ho-so-dk-mac-dinh | Hồ sơ căn | giá + điều kiện phí, «Xác nhận N ngày trước», ảnh Gửi được (bìa trước) và Tự có từ mã, thuộc tính, lần rao; nút «Hỏi đầu chủ · <tên>» dính đáy | đọc, hỏi đầu chủ |
| ST-ho-so-dk-chua-giu | Hồ sơ căn | nút mờ «Căn chưa có đầu chủ giữ» | lùi lại |
| ST-ho-so-dk-ngoai-tuyen | Hồ sơ căn | hồ sơ từ kho trên máy, dải ngoại tuyến, nút «Hỏi đầu chủ» không tên | hỏi đầu chủ |
| ST-ho-so-dk-khong-chia-se | Hồ sơ căn | toast «Đã chép tin hỏi» | dán vào ứng dụng nhắn tin |
| ST-ho-so-dk-chua-xac-nhan | Hồ sơ căn | «Chưa xác nhận với chủ nhà» ở chỗ lần xác nhận | hỏi đầu chủ |
| ST-ho-so-dc-giu | Hồ sơ căn (Đầu chủ giữ căn) | như trước hàng này: ngăn Nội bộ, Sẵn sàng bán, không nút hỏi | làm việc của đầu chủ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút hỏi dính đáy chỉ ở khổ điện thoại (dưới `md`); trên máy tính hiện trong đầu hồ sơ, cùng cờ.
- Tin soạn sẵn không mang lớp `source` (không tên, số chủ nhà, giá đáy) — dựng ở lõi.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `CotHoSo`, `MucAnhCan` | dùng | lớp phủ chỉ đổi cờ hiển thị |
| `Button` + `sonner` | dùng | nút hỏi và lời báo chép tin |
| `BoCuc` kiểu `ho-so` | dùng | bố cục Hồ sơ của hệ bố cục (hàng 59) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: giữ khuôn của hồ sơ điện thoại đang có (lớp phủ trên cùng màn); dựng lại theo `product-detail-5` tách hàng riêng
(Hỏi-3).
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu khách |
| Việc chính | xem đủ một căn để gửi khách, hay hỏi đầu chủ đang giữ căn |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
