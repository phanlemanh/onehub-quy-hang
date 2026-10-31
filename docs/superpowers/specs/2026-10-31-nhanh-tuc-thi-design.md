# Nhanh tức thì — bộ đồng bộ trên máy (hàng 13)

Ngày: 2026-10-31 · Hàng 13 của `docs/plan/lo-trinh.json` (nền, dãy N, đợt nen-2), đứng trên hàng 2 (bài thử đồng bộ),
11 (lớp trường nguồn), 12 (trục ai thấy hàng). Căn cứ: Tham chiếu §8 luật 10, 30–32; Kiến trúc §1, §4, §5 dòng 156,
§8; ADR-0006 (bốn việc đã chốt 30/10). Ô cơ hội: `_acceptance/nhanh-tuc-thi/opportunity.md`.

## Mục tiêu

Bảng hàng và hồ sơ căn đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; mỗi lần sửa ghi trên máy trước rồi
gửi lên sau; rớt mạng vài phút không mất thay đổi. Ngưỡng sống của ô: mở hồ sơ không chờ mạng; rút mạng năm phút, sửa
20 ô, nối lại thì đủ 20 sự kiện lên máy chủ; thanh trên luôn nói đang ở đâu; hai người cùng sửa thì báo, «Đã bán» và
«Đã cọc» thắng.

## Hàng này dựng gì, không dựng gì

Màn Bảng hàng (hàng 14, 32) và Hồ sơ căn (hàng 33) còn là chỗ giữ chỗ. Hàng này là **nền**: bộ đồng bộ ở
`apps/web/src/lib/sync/` cùng các hook React mà hai màn ấy sẽ dùng, chỉ báo trạng thái trên thanh trên (máy tính và điện
thoại), hỏi xác nhận khi đăng xuất còn thay đổi chờ gửi, và một trang thử ẩn (`/proto/nhanh-tuc-thi`) để chấm và đo
trên thiết bị. Màn thật dựng ở hàng của chúng, nối vào cùng hook.

Không dựng: kênh thời gian thực (Hỏi-2), ngoại tuyến thật khi mở app lúc không mạng (service worker — Tham chiếu §11
dòng «ngoại tuyến thật (đo trước)» nằm ngoài bản đầu), số chủ trên máy (Hỏi-1), thay đổi API hay cơ sở dữ liệu.

## Kiến trúc

Bộ đồng bộ tự làm mỏng theo ADR-0006, mọi phần thuần (không DOM) để kiểm bằng `node:test`:

| Mô-đun | Việc |
| --- | --- |
| `kho.ts` | Giao diện kho trên máy: bản kéo về (danh sách hàng), lịch sử từng căn đã mở, hàng đợi, mốc kéo cuối. Hai bản: `taoKhoBoNho()` cho kiểm thử, `taoKhoIndexedDb(userId)` cho trình duyệt — một cơ sở dữ liệu IndexedDB cho mỗi người, ngăn theo sàn. |
| `keo.ts` | Kéo `GET /api/v1/listings` (API đã lọc theo sàn bằng luật theo dòng và theo `canRead` của hàng 12), thay trọn bản kéo của sàn đang làm. Từ chối ghi vào kho bản ghi nào mang khoá hay giá trị nguồn (`findSourceLeaks` của lõi) — lưới thứ hai sau API. |
| `ap-tren-may.ts` | Sửa trên máy: kiểm khuôn bằng `validatePayload`, chuyển trạng thái bằng `checkTransition` của lõi; hợp lệ thì gấp sự kiện tạm vào bản trên máy bằng bước gấp của lõi (`stepListing`, tách ra từ `foldListing`, cùng hành vi — không chép luật gấp sang web). |
| `hang-doi.ts` | Hàng đợi ghi: mỗi thao tác mang mã thao tác, mã căn, lệnh, phiên bản kỳ vọng nối chuỗi theo căn. Gửi theo từng căn: một căn kẹt không chặn căn khác. Thao tác chỉ rời hàng đợi khi máy chủ nhận hoặc khi đã nhận ra nó đã áp. |
| `doi-chieu.ts` | Gửi lại không trùng không cần đổi API: gặp từ chối (409 lệch phiên bản, 400 chuyển trạng thái), đọc lịch sử căn (`GET /listings/{id}`); có sự kiện sau phiên bản kỳ vọng do chính người này ghi, cùng loại, cùng nội dung → nhận là đã áp. Không có → căn thành «cần xem». |
| `mang.ts` | Biết có mạng lại: thử định kỳ (15 giây khi có thay đổi chờ hay đang mất mạng, 30 giây khi yên), khi quay lại trang, khi trình duyệt báo có mạng; một lời gọi thành công là có mạng (ADR-0006 việc 2). |
| `trang-thai.ts` | Suy trạng thái cho thanh trên từ kho và hàng đợi (bảng trạng thái dưới). |
| `react.tsx` | `BoDongBoProvider` (gắn ở vỏ), `useDanhSachHang(bộ lọc)`, `useHoSoHang(mã)`, `useSuaHang()`, `useTrangThaiDongBo()`, `useCanXem()`. |

Đường ghi vẫn là một lệnh qua API (`POST /listings/{id}/events`, Kiến trúc §4) — bộ đồng bộ không có đường ghi riêng.

### Đụng nhau

Máy chủ trả 409 khi phiên bản lệch, trừ «Đã cọc» (`Pending`) và «Đã bán» (`Closed`) — hai trạng thái này bỏ qua phép kiểm
phiên bản (`WINS_IMMEDIATELY` của lõi). Bộ đồng bộ:

- Thao tác của tôi bị 409 mà đối chiếu không thấy đã áp → căn thành «cần xem»: hiện giá trị máy chủ (người sửa, lúc) và
  giá trị của tôi; các thao tác chờ còn lại của căn ấy dừng; căn khác vẫn gửi. Hai lối: **Giữ của tôi** (kiểm lại thao
  tác trên bản mới bằng luật lõi, nối chuỗi từ phiên bản mới, gửi lại) và **Lấy bản mới** (bỏ thao tác của tôi trên căn
  ấy, bản trên máy bằng máy chủ). Luật 10 và 31: không âm thầm ghi đè, đụng nhau thì hỏi.
- «Đã cọc», «Đã bán» của tôi lên ngay dù phiên bản lệch. Của người khác đã lên trước thì thay đổi thường của tôi trên căn
  ấy không âm thầm lên: căn thành «cần xem» kèm dòng «Căn đã cọc» hay «Căn đã bán».
- Máy chủ từ chối vì lý do khác (căn không còn đọc được, thiếu điều kiện chuyển trạng thái) → «cần xem» với lý do của lõi,
  hai lối «Sửa lại» (mở ô) và «Bỏ thay đổi». Không thao tác nào biến mất câm (bài học ngoài hợp đồng Ngoài-1 của bài thử).

### Đăng xuất, đổi sàn

Đăng xuất: còn thay đổi chờ gửi thì hỏi «Còn n thay đổi chưa gửi lên — đăng xuất sẽ xoá chúng khỏi máy»; đồng ý thì xoá
sạch cơ sở dữ liệu của người đó trên máy (luật 32, Kiến trúc §8). Đổi sàn: mỗi sàn một ngăn; hàng đợi sàn cũ ở lại và
gửi tiếp khi quay về sàn đó.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: mở app → bộ đồng bộ nạp kho trên máy, hiện ngay → kéo bản mới ở nền → thanh trên «Đã đồng bộ · 10:42». Sửa một ô
  (ở màn sẽ dựng; nay ở trang thử) → ô đổi ngay → thanh «Đang gửi 1 thay đổi» → «Đã đồng bộ».
- Biên: mất mạng → thanh «Mất mạng · 3 thay đổi chờ gửi», vẫn lọc, mở hồ sơ, sửa; có mạng lại → tự gửi. Kho chưa có bản
  (lần đầu, đang mất mạng) → «Đang tải lần đầu».
- Lỗi & quay lại: đụng nhau hay bị từ chối → thanh «1 căn cần xem» (bấm được) → bảng bên liệt căn, mỗi căn hai lối →
  chọn xong thanh trở về trạng thái thường.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chỉ báo đồng bộ (thanh trên) | Nói đang ở đâu | mọi nhà / bấm khi có căn cần xem → bảng Cần xem |
| Bảng Cần xem (Sheet) | Chọn lối cho từng căn đụng nhau hay bị từ chối | chỉ báo / đóng về màn đang ở |
| Hỏi khi đăng xuất (AlertDialog) | Xác nhận xoá thay đổi chưa gửi | menu tài khoản / đăng xuất hoặc ở lại |
| Trang thử `/proto/nhanh-tuc-thi` | Sửa nhanh giá, chi tiết, trạng thái để chấm và đo | gõ địa chỉ / không có lối vào trong điều hướng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dongbo-tai-lan-dau | Chỉ báo | «Đang tải lần đầu» | chờ |
| ST-dongbo-da-dong-bo | Chỉ báo | «Đã đồng bộ · hh:mm» | làm tiếp |
| ST-dongbo-dang-gui | Chỉ báo | «Đang gửi n thay đổi» | làm tiếp |
| ST-dongbo-mat-mang | Chỉ báo | «Mất mạng · n thay đổi chờ gửi» (n = 0: «Mất mạng · đang xem bản trên máy») | làm tiếp; tự gửi khi có mạng |
| ST-dongbo-can-xem | Chỉ báo | «n căn cần xem» — thắng mọi trạng thái trên | bấm → bảng Cần xem |
| ST-canxem-dung-nhau | Bảng Cần xem | căn, giá trị máy chủ (ai, lúc) và của tôi | Giữ của tôi · Lấy bản mới |
| ST-canxem-da-coc | Bảng Cần xem | như trên kèm «Căn đã cọc» / «Căn đã bán» | Giữ của tôi · Lấy bản mới |
| ST-canxem-tu-choi | Bảng Cần xem | căn, thay đổi, lý do của lõi | Sửa lại · Bỏ thay đổi |
| ST-dangxuat-con-cho | Hỏi khi đăng xuất | «Còn n thay đổi chưa gửi lên — đăng xuất sẽ xoá chúng khỏi máy» | Ở lại · Vẫn đăng xuất |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chỉ báo dùng chữ, không chỉ màu; điện thoại chỉ hiện biểu tượng + số khi chật, chữ đầy đủ trong nhãn trợ năng.
- Thử gửi lại 15 giây khi có thay đổi chờ hay mất mạng, 30 giây khi yên; quay lại trang thử ngay.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Badge (shadcn, đã cài) | dùng | chỉ báo trạng thái theo biến thể, không màu thô |
| Sheet (shadcn, đã cài) | dùng | bảng Cần xem mở bên, không lớp phủ tự vẽ |
| AlertDialog (shadcn, đã cài) | dùng | hỏi khi đăng xuất |
| Button, Input, Select (shadcn, đã cài) | dùng | trang thử |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: trang thử là danh sách hàng + hồ sơ một căn như Bảng hàng và Hồ sơ căn sẽ dựng (Tham chiếu §9, `docs/design/vo-va-ia.md`); chỉ báo và bảng Cần xem gắn vào vỏ đã có — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu hỏi cho chủ kho

- **Hỏi-1 — số chủ trên máy.** Khuyến nghị: bộ đồng bộ không chở thông tin chủ nhà xuống máy ở hàng này (giám sát nhắc;
  bất biến 2; API danh sách hàng vốn không trả nguồn). Lệch với dòng «Số chủ trên máy, xoá khi đăng xuất — hàng 13» trong
  phần ngoài phạm vi của hàng 11. Lối khác: chở số chủ của căn mình giữ (luật 32) — giá: thêm một lớp nguồn trên máy phải
  xoá chắc khi đăng xuất hay mất máy, và một chỗ thứ hai giữ khớp luật xem nguồn.
- **Hỏi-2 — kênh thời gian thực.** Khuyến nghị: hàng này kéo định kỳ (30 giây, khi quay lại trang, sau mỗi lần gửi), để
  kênh «có thay đổi, kéo về» của Supabase sang hàng sau. Lối khác: dựng kênh ngay — giá: bật realtime trên dự án Supabase
  thật (việc vận hành, khoá), thêm vùng; ngưỡng của ô không đòi.
- **Hỏi-3 — trang thử trên bản thật.** Khuyến nghị: trang `/proto/nhanh-tuc-thi` có ở bản thật nhưng không có lối vào
  trong điều hướng, chỉ vai có Bảng hàng, gỡ khi Bảng hàng thật ra ở hàng 14 — để đo vế mất mạng trên tên miền thật
  (ADR-0006 việc 4) trên dữ liệu mẫu. Lối khác: chỉ ở bản dev — giá: vế mất mạng trên thiết bị tiếp tục chưa đo tới khi
  hàng 14 ra.

- **Hỏi-4 — duyệt giao diện.** Khuyến nghị: bỏ nghi thức design-pass; chỉ báo, bảng Cần xem và hộp hỏi đăng xuất dựng
  bằng Badge, Sheet, AlertDialog đã cài; anh nhìn ảnh chụp ở Cổng Bằng chứng (E4b, E8b). Lối khác: chạy design-pass —
  máy dựng bản bấm được trước khi viết mã, gửi gói ảnh chín trạng thái ở 1440 và 375; giá: thêm một lượt dựng và một lần
  anh xem trước S3.

## Lựa chọn máy đã quyết

- Không đổi API, không migration: gửi lại không trùng bằng đối chiếu lịch sử căn thay vì khoá chống trùng ở máy chủ
  (vùng của hàng là `apps/web/src/lib/sync/**`; số migration theo dãy đã cấp hết ở đợt này).
- Kéo trọn danh sách mỗi lần (API chưa có con trỏ); giá ghi ở «Giới hạn đã biết».
- Tách bước gấp `stepListing` khỏi `foldListing` trong lõi, cùng hành vi, để web gấp sự kiện tạm bằng đúng luật lõi.
- Kiểm thử web bằng `node:test` như các gói khác: `npm test -w @quy-hang/web` (thuần, kho bộ nhớ) và
  `npm run test:db -w @quy-hang/web` (API thật trên Postgres dãy). Kho IndexedDB đo bằng mắt trên trình duyệt thật.

## Giới hạn đã biết

- Kéo trọn danh sách mỗi 30 giây: sàn 5.000 căn là vài MB mỗi lần; con trỏ kéo cần đổi API ở hàng sau.
- iPhone có thể dọn kho trên máy khi app ít dùng (Kiến trúc §7) — hàng đợi chưa gửi mất theo.
- Mở app khi đang mất mạng chưa chạy (cần service worker).
