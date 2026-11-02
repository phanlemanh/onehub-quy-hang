# Thông báo lead — thiết kế

Ngày 02/11 · hàng 26 `thong-bao-lead` (dãy L, đợt `dau-chu-dong-vao`, Cổng Đáng: build — Manh Phan 31/10) · đứng trên hàng
22 (Hôm nay của đầu chủ) và 25 (chia lead, ADR-0017) · hạng **T3** (thêm một bảng — lộ trình ghi T2, lệch vì cần chỗ lưu
đăng ký thiết bị có luật theo dòng).

## Vấn đề

Lead về đầu chủ (nhịp chia, trưởng nhóm giao, nhập lead khớp đầu chủ đang giữ chủ nhà hay căn) nhưng đầu chủ chỉ biết khi
mở Hôm nay. Hạn nhận 15 phút (ADR-0017) cần một tiếng chuông. Kiến trúc §5 chọn Web Push: máy tính, Android, và iPhone khi
web đã cài lên màn hình chính; §7 hẹn hướng dẫn cài cho iPhone.

## Cách làm

- **Bật trên từng thiết bị.** Dải «Bật thông báo lead» ở đầu khung Hôm nay cho mọi vai nhận đẩy — đầu chủ và trưởng nhóm, kể cả khi trưởng nhóm đang thấy trang giữ chỗ (Hỏi-3) (khuôn `TrangThai` loại notice + nút
  `Button`, cùng họ Frame). Bấm → trình duyệt xin quyền → service worker đăng ký với dịch vụ đẩy bằng khoá công khai VAPID →
  `POST /api/v1/me/push-subscriptions` lưu đăng ký gắn người + sàn. Đã bật thì dải không hiện. `DELETE` cùng đường gỡ đăng
  ký của thiết bị (đăng xuất gọi nó). Một người nhiều thiết bị.
- **iPhone chưa cài lên màn hình chính** (Safari trên iOS, `navigator.standalone` sai): dải đổi thành hướng dẫn cài (Chia sẻ
  → Thêm vào MH chính), không hiện nút bật vì Safari không cho đẩy khi chưa cài. Web có manifest, biểu tượng, service worker.
- **Bảng đăng ký** (`push_subscriptions`, migration `018_thong_bao_lead.sql`): sàn, người, endpoint, khoá `p256dh`/`auth`, lúc tạo, lần gửi
  hỏng gần nhất. Luật theo dòng: người đọc, thêm, xoá đăng ký của chính mình trong sàn đang làm; không ai khác đọc. Gửi đi qua
  một hàm `security definer` trả đăng ký của một người cho lối gửi của máy chủ.
- **Gửi qua hộp thư đi** (`push_outbox`, cùng migration 018): mỗi lối giao lead — nhịp chia, trưởng nhóm giao
  (`reassignLead`), nhập và gửi lại lead khớp đầu chủ (`createLead`) — ghi một dòng «cần báo» trong CÙNG giao dịch giao lead
  (quay lui thì dòng cũng mất); ngay sau khi giao dịch ghi xong, lối ấy gửi các dòng của mình; dòng lỗi tạm được nhịp chia mỗi
  phút gửi lại, tối đa ba lần trong 15 phút (hạn nhận). Tự nhận từ kho chung không ghi dòng. Lỗi gửi không làm hỏng việc giao.
  Hộp thư đi giữ mốc gửi `sent_at` cho số đo lead → cuộc gọi đầu.
- **Nội dung** chỉ «Lead mới» + toà + nhu cầu (Bán · Cho thuê · Cả hai) + đường mở; không số, không tên chủ, không giá, không
  mã căn (Hỏi-2) — thông báo hiện trên màn hình khoá và đi qua dịch vụ đẩy của Apple, Google (bất biến 2). Dựng ở lõi
  (`packages/core/src/push`), có danh sách khoá viết trước.
- **Chạm mở đúng mục**: `/today?lead=<id>` — Hôm nay mở nhóm của lead, chọn dòng `lead:<id>` và cuộn tới; lead không còn
  trong danh sách (đã chuyển, đã trả) thì báo nhẹ «Lead này không còn ở Hôm nay của bạn».
- **Đăng ký chết** (dịch vụ đẩy trả 404 hay 410) → xoá đăng ký ấy; lỗi khác giữ, ghi lần hỏng.
- **Trưởng nhóm** nhận đẩy cho lời báo mới (`unrouted`, `accept_overdue`, `first_call_overdue`) — ADR-0017 Hỏi-6 hẹn nới
  hàng 26 (Hỏi-1). Nội dung: loại lời báo + toà, mở `/today` (màn lời báo là hàng 42).
- **Khoá VAPID — không ai cầm khoá.** Máy chủ tự sinh cặp khoá P-256 ở lần dùng đầu (`web-push`
  `generateVAPIDKeys`), lưu ở bảng hệ thống `push_vapid` (một dòng, không thuộc sàn nào): khoá công khai lưu thường, khoá
  riêng lưu bản mã AES-256-GCM bằng một khoá con suy từ `OWNER_PHONE_KEY` qua HKDF (nhãn `quy-hang/push-vapid/v1`) — cùng
  cách ADR-0013 suy khoá con cho dấu vết số; khoá gốc vẫn chỉ ở Vercel Production. Không thêm biến môi trường, không ai sinh,
  đọc, chép hay chuyển khoá. Hai lần dùng đầu chạy song song: ràng buộc một dòng giữ một cặp, bên sau đọc lại. Bảng bật luật
  theo dòng không có luật đọc nào, vai API không được cấp — chỉ đi qua hai hàm `security definer` (lấy, khởi tạo). Xoay khoá
  = xoá dòng, thiết bị đăng ký lại ở lần mở kế. «Chủ thể» VAPID = `BETTER_AUTH_URL` đã có. Gửi bằng thư viện `web-push`
  (mã hoá aes128gcm theo RFC 8291) — tự viết mã hoá là rủi ro không cần.
- Thử trên điện thoại thật (iPhone đã cài, Android) là việc của phiên nghiệm thu, không phải bài chấm máy.

## Ngoài phạm vi

- Tab «Tôi» trên điện thoại (bật thông báo, cài, đăng xuất) — hàng `tab-toi`; hàng này chỉ đặt dải bật trong Hôm nay.
- Thông báo cho đầu khách, telesales, quản trị; nhắc hạn gọi cho chính đầu chủ; chuông trong app — hàng sau.
- Zalo OA — cần quyết định riêng (Kiến trúc §8).
- Màn lời báo của trưởng nhóm — hàng 42.

## Đặc tả UX

Màn chạm: khung Hôm nay (`KhungHomNay`, cho đầu chủ và trưởng nhóm) (`apps/web/src/app/(app)/today/`) — thêm một dải trạng thái đầu khung (họ Frame, khuôn
`TrangThai` có sẵn). Ba trạng thái dải: chưa bật (notice + nút «Bật thông báo»), iPhone chưa cài (notice + ba bước cài),
không hỗ trợ hay chưa cấu hình (notice chữ, không nút); đã bật hay đã từ chối quyền thì dải ẩn (từ chối: một dòng chữ nhỏ
«Thông báo đang tắt trong trình duyệt»). Không màn mới.
