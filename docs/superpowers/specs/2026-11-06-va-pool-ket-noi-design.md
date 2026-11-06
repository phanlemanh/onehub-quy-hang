# Vá pool kết nối và lỗi đọc phiên — thiết kế

Hàng `va-pool-ket-noi` của lộ trình. Hạng T2: chỉ lớp web, không đổi cơ sở dữ liệu, không đổi chuỗi kết nối.

## Vấn đề

Bản thật `quyhang.onehub.center`, 06/11 khoảng 01:29–01:47Z: người đã đăng nhập mở `/today`, `/inventory`, `/settings`,
`/me` bị chuyển về `/login`. Nhật ký Vercel ghi ở mỗi lần dựng trang:
`(EMAXCONNSESSION) max clients reached in session mode - max clients are limited to pool_size: 15`, tại bước
better-auth lấy kết nối, kèm `Failed to get session` mã 500.

Hai lỗi chồng nhau:

1. **Cạn kết nối.** `DATABASE_URL` bản thật đi qua pooler Supabase chế độ session. Chế độ này cấp TỔNG 15 kết nối cho cả
   dự án, mọi phiên bản hàm đang ấm cùng chia. `getApi()` dựng hai `pg.Pool` mỗi phiên bản (danh tính và ứng dụng) với
   cỡ mặc định của pg — 10 kết nối mỗi pool — và không có gì nhả kết nối trước khi Vercel treo phiên bản. Một phiên bản
   giữ được tới 20 kết nối; vài trang dựng song song (rà soát mở nhiều trang cùng lúc) là cạn.
2. **Lỗi hạ tầng bị đọc thành «chưa đăng nhập».** Khi better-auth không đọc được phiên, `/api/v1/me` trả 500.
   `readMeHayBiBao` trả `null` cho mọi mã không phải 200, và vỏ (`shell-layout.tsx`) coi `null` là chưa đăng nhập → chuyển
   về `/login`. Người còn phiên hợp lệ bị đá ra.

Lúc soạn (02:06Z) bản thật đã tự hồi: không lỗi mới từ 01:47Z, `/api/v1/health` trả 200. Không cần redeploy.

## Cách làm

**Pool nhỏ, nhả sớm** (`apps/web/src/lib/api.ts`):

- `dungPools(url, attach)` dựng hai pool: danh tính `max 2`, ứng dụng `max 2` — một phiên bản giữ tối đa 4 kết nối.
  `idleTimeoutMillis 5000` nhả kết nối rảnh; `connectionTimeoutMillis 10000` để yêu cầu chờ trong hàng đợi của pool có
  hạn, không treo.
- **Phép tính trần, có khoảng dư mỏng.** Trần 15 chia cho mọi khách dùng chung `DATABASE_URL`: phiên bản hàm của bản chính
  thức, của bản xem trước (biến `DATABASE_URL` khai cho cả Production và Preview), và job migrate của CI. Dự kiến 3 phiên
  bản cùng sống × 4 + 2 kết nối của khách khác = 14 < 15. Bài kiểm ghim bất đẳng thức chặt này bằng ba hằng
  `SO_PHIEN_BAN_DU_KIEN`, `KHACH_KHAC`, `TRAN_POOLER`. Phiên bản thứ tư cùng lúc vẫn có thể chạm trần — gốc lâu dài là
  pooler chế độ transaction (vòng riêng, mục cuối).
- Cả hai pool gắn `attachDatabasePool` của `@vercel/functions` (ghim 3.10.2): Vercel nhả kết nối rảnh trước khi treo
  phiên bản, nên phiên bản treo không giữ chỗ của trần 15.
- Yêu cầu vượt cỡ xếp hàng trong pool thay vì mở kết nối mới tới pooler.

**Lỗi hạ tầng không phải hết phiên:**

- `docPhanHoiMe(res)` (thuần) phân loại phản hồi `/api/v1/me`: 5xx → ném `LoiDocPhien(status)`; 200 → người; 401 mang
  `device_reported_lost` → mã người bị báo; 401 khác → `null`. `readMe` và `readMeHayBiBao` cùng đi qua hàm này.
- Vỏ, trang gốc `/`, chọn sàn, chưa gắn sàn: `LoiDocPhien` lên ranh giới lỗi → «Không mở được trang này» kèm «Thử lại»
  (`app/error.tsx` — lỗi ở chính vỏ lên ranh giới của gốc vì ranh giới `(app)/error.tsx` không bọc layout cùng cấp).
- Màn đăng nhập bắt `LoiDocPhien` và hiện ô đăng nhập như trước — chỉ màn sau đăng nhập đổi hành vi.
- «Thử lại» của cả hai ranh giới lỗi gọi `router.refresh()` rồi `reset()` trong `startTransition`: lỗi ở máy chủ,
  `reset()` một mình chỉ vẽ lại lỗi cũ.

**Cách ly giữa công ty không đổi.** `withCompany` (`packages/api/src/db.ts`) vẫn mở giao dịch, `set local role
quy_hang_app`, `set_config(..., true)`; không tệp nào của `packages/` đổi.

**Không chuyển pooler sang chế độ transaction (cổng 6543) trong vòng này.** Pool danh tính đặt `search_path=identity` bằng
tham số khởi động `options` — pooler chế độ transaction không giữ tham số khởi động cho từng giao dịch, nên better-auth sẽ
đọc nhầm schema. Chuyển cần đổi cách đặt `search_path` cho danh tính và đổi biến môi trường bản thật (việc của chủ kho) —
đề xuất làm vòng riêng.

## Đối chiếu ngành (ADR-0022)

Không có đối tượng nghiệp vụ, danh sách cố định hay trường dữ liệu mới — bảng đối chiếu RESO và sản phẩm khác không áp.
Cỡ pool là hằng của nền tảng (lý do «nền tảng» trong bốn lý do giữ cứng): nó phụ thuộc trần của pooler và cách Vercel chạy
hàm, không phải điều sàn chọn — không thành dữ liệu của sàn, không thêm dòng ở Sổ điểm biến thiên.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người đã đăng nhập mở `/today` → màn Hôm nay như cũ.
- Biên: cơ sở dữ liệu không đọc được phiên → trang ghi «Không mở được trang này · Lần tải vừa rồi lỗi. Thử lại sau ít
  phút.» kèm nút «Thử lại»; địa chỉ giữ nguyên `/today`, không chuyển về `/login`.
- Lỗi & quay lại: bấm «Thử lại» → máy chủ dựng lại trang; cơ sở dữ liệu đã hồi thì hiện Hôm nay, chưa hồi thì vẫn trang
  lỗi. Người không có cookie phiên vẫn về `/login` như cũ; màn `/login` vẫn hiện ô đăng nhập.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang lỗi của gốc (`app/error.tsx`) | báo tải hỏng và cho thử lại | mọi màn sau đăng nhập khi đọc phiên hỏng / chính màn đó |
| Trang lỗi trong vỏ (`(app)/error.tsx`) | báo tải hỏng một màn và cho thử lại | một màn trong vỏ / chính màn đó |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doc-phien-hong | Trang lỗi của gốc | «Không mở được trang này» + «Thử lại», địa chỉ giữ nguyên | bấm «Thử lại» |
| ST-thu-lai-van-hong | Trang lỗi của gốc | như trên sau khi máy chủ dựng lại | đợi rồi thử lại |
| ST-chua-dang-nhap | Đăng nhập | ô đăng nhập (không đổi) | đăng nhập |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Thử lại» dựng lại phần máy chủ, không tải lại cả trang.
- Không đổi chữ, bố cục hay thành phần của trang lỗi.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TrangThai` kiểu `error` trong `BoCuc` Đọc | dùng | trang lỗi cấp tuyến đã có (ADR-0024 §4); chỉ đổi việc nút làm |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi IA — trang lỗi cấp tuyến sẵn có, nay được dùng thêm khi đọc phiên hỏng; luồng hiển nhiên, không tra mẫu.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | mọi người đã đăng nhập |
| Việc chính | biết hệ thống đang lỗi tạm và thử lại, không bị bắt đăng nhập lại |
| Tần suất | hiếm — chỉ khi cơ sở dữ liệu nghẽn |
| Số bản ghi | không |
| Thiết bị | máy tính và điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
