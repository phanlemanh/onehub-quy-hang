# Thiết kế — Tab Tôi (hàng 38, `tab-toi`)

Câu giao (hàng 38, mã K9): «Người dùng điện thoại cài Quỹ hàng lên màn hình chính, bật thông báo; đăng xuất hay báo mất
máy thì dữ liệu trên máy bị xoá sạch». Căn cứ: Tham chiếu luật 32 («đăng xuất hay báo mất máy thì xoá sạch»), Kiến trúc
§7 (thông báo trên iPhone cần cài lên màn hình chính, «hướng dẫn cài ngay lần đăng nhập đầu») và §8 («đăng xuất hay báo
mất máy thì xoá kho trên máy»). Khối đích: `settings-2` (vo-va-ia.md dòng «Tôi (điện thoại)», chủ kho chọn lại 02/11),
mỗi dòng một công tắc hay một nút: hồ sơ, sàn, cài lên màn hình chính, thông báo, đăng xuất.

## 1. Cái đã có, cái còn thiếu

Đã có trên `main` (962a8ec):

- Đăng xuất xoá kho trên máy của người đó, hỏi khi còn thay đổi chưa gửi (hàng 13 AC-10, `useBoDongBo().dangXuat`,
  `HoiDangXuat`); thân đăng xuất mang `pushEndpoint` để máy chủ gỡ đăng ký thông báo của thiết bị (hàng 26).
- Phân loại thiết bị cho thông báo (`phanLoai`, `docTrangThai`, `batThongBao` ở `lib/push/dang-ky.ts`) và dải bật ở
  Hôm nay, có ba bước cài cho iPhone.
- Phiên của better-auth ghi `userAgent`, `updatedAt` từng máy (`identity.session`, migration 002).
- `/me` là trang chỗ giữ của vỏ; trên điện thoại là tab «Tôi», trên máy tính mở từ menu tài khoản.

Còn thiếu: màn Tôi thật; nút cài cho Android/máy tính; danh sách máy đang đăng nhập; «báo mất máy»; và cách để chính
máy bị báo xoá kho của nó.

## 2. Màn Tôi

Một cột `Frame` theo `settings-2`, các nhóm dòng (mỗi dòng: nhãn · giá trị hay trạng thái · một nút):

1. **Hồ sơ** — email đăng nhập (đọc từ `/api/v1/me`). Không sửa ở hàng này.
2. **Sàn** — tên sàn đang làm; người thuộc nhiều sàn có nút «Đổi sàn» mở `/select-company`.
3. **Cài lên màn hình chính** — bốn trạng thái: đã cài (đang chạy từ màn hình chính) → «Đã cài»; trình duyệt có lời mời
   cài (`beforeinstallprompt`, Android, Chrome/Edge máy tính) → nút «Cài»; iPhone/iPad Safari chưa cài → ba bước như
   dải bật; còn lại → «Mở bằng Chrome hay Safari để cài».
4. **Thông báo lead** — đúng bảy trạng thái của `phanLoai`, cùng nhãn với dải bật; «chưa bật» có nút «Bật».
5. **Máy đang đăng nhập** — mỗi phiên còn sống của người: loại máy suy từ `userAgent` (iPhone · Android · máy tính ·
   máy khác) kèm trình duyệt, lần dùng gần nhất, dòng «Máy này» đánh dấu. Nút «Báo mất máy» khi có từ hai máy.
6. **Đăng xuất** — đi đúng đường đăng xuất đã có (hỏi khi còn thay đổi chưa gửi, xoá kho, gỡ thông báo máy này).

Trạng thái đang tải, lỗi đọc danh sách máy đi qua `TrangThai`. Màn dùng chung cho mọi vai (telesales, quản trị sàn cũng
có tab Tôi — vo-va-ia.md dòng 51–52).

## 3. Báo mất máy

Hỏi-1 (chỉ người có — nghĩa sản phẩm): **«Báo mất máy» là đăng xuất mọi máy khác** (khuyến nghị) hay chọn từng máy.

- Khuyến nghị: một nút, hỏi xác nhận «Đăng xuất mọi máy khác và xoá dữ liệu Quỹ hàng trên các máy ấy?». Máy chủ thu mọi
  phiên khác của người, gỡ mọi đăng ký thông báo khác máy này ở mọi sàn của người, và ghi dấu «máy bị báo» cho từng phiên
  bị thu. Máy đang bấm giữ phiên.
- Lối khác — chọn từng máy: cần gắn đăng ký thông báo với phiên (hôm nay đăng ký thông báo không biết thuộc phiên nào),
  thêm một cột và một bước khớp; người mất máy thường không chắc máy nào trong danh sách là máy mất. Giá: thêm một
  migration sửa bảng `push_subscriptions` và một ca kiểm cách ly.

Người chỉ còn đúng một máy mà mất máy ấy: đăng nhập bằng mã email trên máy khác (máy tính, máy mượn) rồi báo — không cần
quản trị sàn.

## 4. Máy bị báo xoá kho của nó

Hỏi-2 (chỉ người có — đổi một điều đã ký): máy bị báo xoá kho **khi máy chủ nói nó bị báo mất** (khuyến nghị), hay xoá
kho mỗi khi hết phiên.

- Khuyến nghị: dấu «máy bị báo» lưu ở máy chủ dưới dạng băm của mã phiên (không lưu mã thật), sống bằng hạn phiên dài
  nhất (30 ngày). Máy bị báo lần đầu chạm máy chủ — mở bất kỳ trang nào, hay bộ đồng bộ gửi/kéo — thì máy chủ trả 401
  kèm mã riêng `device_reported_lost`; vỏ chuyển sang `/login?bi-bao-mat=1`; màn đăng nhập xoá mọi kho Quỹ hàng trên
  trình duyệt ấy (kể cả thay đổi chưa gửi), huỷ đăng ký thông báo, xoá cookie phiên, rồi báo «Máy này đã bị báo mất —
  dữ liệu Quỹ hàng trên máy đã xoá». Hết phiên thường (401 không mã riêng) giữ nguyên hành vi của dong-bo-tu-lanh AC-2:
  thay đổi chờ ở lại, gửi tiếp khi đăng nhập lại.
- Lối khác — xoá kho mỗi lần hết phiên: không cần bảng mới, nhưng lật AC-2 của dong-bo-tu-lanh đã ký (thay đổi chưa gửi
  mất khi phiên hết thường). Giá: một quyết định đảo lại hàng 61 và một lần mất việc của đầu chủ khi phiên hết giữa ca.

Vì dấu nằm trong schema `identity` (bảng của danh tính, không thuộc công ty nào), hàng này thêm một migration — hạng
T3 theo `risk_tiers.t3_paths` (`packages/db/**`), số migration do giám sát giữ chỗ (luật 25, yêu cầu H-6). Bảng chỉ vai
chủ của danh tính đọc ghi, vai API của công ty không có quyền.

Hỏi-3 (chỉ người có — xoá dữ liệu trên máy người dùng, phản biện P0): ngoài đường «chạm máy chủ thì xoá», **máy chủ đẩy
một tin «xoá máy» tới mọi đăng ký thông báo khác máy đang bấm, rồi mới gỡ các đăng ký ấy** (khuyến nghị). Service worker
(`/sw.js`) nhận tin có `tag: "xoa-may"` thì xoá kho Quỹ hàng của người bị báo và hiện một thông báo «Quỹ hàng đã đăng xuất
trên máy này» (Web Push bắt hiện thông báo). Tin vừa khít khuôn bốn khoá của `push_outbox` (title, body, url, tag) — không
đổi bảng. Máy có mạng mà không mở Quỹ hàng vẫn bị xoá; máy chưa bật thông báo hay tắt mạng thì chờ đường «chạm máy chủ».
Lối khác: chỉ đường «chạm máy chủ» — không đụng service worker, nhưng máy có mạng mà không ai mở Quỹ hàng giữ kho tới khi
hệ điều hành dọn.

Hỏi-4 (chỉ người có — phạm vi xoá, phản biện P1): máy bị báo **chỉ xoá kho của người bị báo** (khuyến nghị) hay mọi kho Quỹ
hàng trên trình duyệt. Khuyến nghị theo AC-4 (đăng xuất không đụng kho người khác): «đăng xuất mọi máy khác» chạm cả máy
dùng chung ở văn phòng, nơi đồng nghiệp đang có thay đổi chưa gửi. Dấu và tin đẩy mang mã người bị báo để máy biết xoá kho
nào. Lối khác: xoá mọi kho — chắc hơn với máy thật sự bị mất, giá là việc dở của đồng nghiệp trên máy dùng chung.

Hạn dấu bằng hạn phiên của better-auth đọc từ chính hằng `SESSION_EXPIRES_SEC` (30 ngày, phiên trượt theo ngày dùng): dấu
ghi lúc thu = lúc thu + hạn phiên, nên phiên bị thu không thể sống lâu hơn dấu của nó (phiên trượt chỉ dời hạn khi được
dùng, mà phiên đã thu thì không dùng được nữa).

Giới hạn khai luôn: máy bị báo không bật thông báo và không bao giờ chạm máy chủ nữa (tắt mạng vĩnh viễn) thì không xoá
được — web không có lệnh xoá từ xa khi trang không mở và không có đăng ký đẩy. Trên iPhone hệ điều hành có thể tự dọn kho
khi ít dùng (Kiến trúc §7). Máy bị báo vẫn không đọc được gì mới: phiên đã thu.

## 5. Lựa chọn máy đã quyết

- Danh sách máy và thu phiên đi qua better-auth (`listSessions`, `revokeOtherSessions` trong tiến trình) — không viết bảng
  phiên riêng (ADR-0005: better-auth giữ trọn danh tính).
- Gỡ đăng ký thông báo của máy khác chạy dưới luật theo dòng của từng sàn người là thành viên (`withCompany`), không vượt
  cách ly.
- Đường API mới dưới `/api/v1/me/devices` (đọc danh sách, báo mất máy); thân báo mất mang `pushEndpoint` của máy đang bấm
  để giữ lại đúng đăng ký ấy — cùng khuôn với thân đăng xuất (hàng 26) và lời gọi quay số (goi-tu-may-tinh).
- Loại máy suy từ `userAgent` bằng một hàm thuần trong `me/`, không thêm thư viện.
- Nút «Cài»: giữ sự kiện `beforeinstallprompt` trong màn, gọi `prompt()` khi bấm; sự kiện không tới thì không có nút.

## 6. Đối chiếu ngành

- RESO không có trường cho thiết bị hay phiên — đặc trưng sản phẩm, đặt tên riêng.
- Google Account «Your devices» và WhatsApp «Linked devices»: danh sách máy kèm loại máy, lần dùng cuối, «máy này»;
  Google có «Sign out of all other sessions». Slack, Notion: «Log out of all other sessions» một nút. Đường «một nút
  đăng xuất mọi máy khác» là khuôn phổ biến của sản phẩm không quản lý thiết bị (MDM); xoá dữ liệu từ xa có điều kiện
  máy phải mở lại là giới hạn chung của ứng dụng web (Slack, Notion web cùng giới hạn).

## 7. Đặc tả UX

Màn danh sách dòng theo `settings-2`; điện thoại một cột, máy tính cùng cột rộng tối đa của vỏ. Trạng thái: đang tải
(khung xương các nhóm dòng), lỗi đọc danh sách máy (`TrangThai` lỗi, nút «Thử lại»), một máy (không nút «Báo mất máy»,
dòng «Chỉ có máy này»), hai máy trở lên, đang báo mất (nút chờ), báo mất xong (danh sách còn «Máy này», thông báo nhỏ
«Đã đăng xuất N máy khác»). Hỏi xác nhận báo mất máy dùng `AlertDialog` kiểu nguy hiểm như hỏi đăng xuất.
