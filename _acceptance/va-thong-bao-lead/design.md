# Vá Thông báo lead — thiết kế

Hàng vá của dãy B, mở từ Cổng Bằng chứng hàng 26 (`_acceptance/thong-bao-lead/`): chủ kho chọn «mở hợp đồng mới» cho
Ngoài-1, Ngoài-4, Ngoài-5 (sổ `d-20261102T054055Z-19`, `-22`, `-23`).

Câu giao: «Vá Thông báo lead: chỉ nhận địa chỉ của dịch vụ đẩy đã biết; gửi có thời hạn, không treo lối giao lead, không
gửi trùng; lưu đăng ký hỏng thì dải bật vẫn hiện và báo».

## Ba lỗ

1. **Ngoài-1 — địa chỉ nhận bất kỳ https.** `POST /api/v1/me/push-subscriptions` nhận mọi `https://…` (zod `url()` +
   `startsWith("https://")`), rồi lối gửi POST tới địa chỉ ấy bằng `web-push`. Người trong sàn khai địa chỉ tuỳ ý (máy nội
   bộ, dịch vụ lạ) → máy chủ tự gọi tới đó: lỗ SSRF.
2. **Ngoài-4 — gửi không thời hạn.** `webPushSender` không đặt hạn; lối giao lead `await guiSauKhiGhi(...)` nên yêu cầu
   giao treo theo dịch vụ đẩy. Dòng hộp thư đi được giữ một phút (`app.push_outbox_claim`, migration 018: `claimed_at <
   p_now - interval '1 minute'`); gửi quá một phút thì nhịp chia nhận lại đúng dòng ấy và gửi lần nữa — gửi trùng.
3. **Ngoài-5 — dải ẩn dù lưu hỏng.** `docTrangThai()` thấy trình duyệt đã có đăng ký và quyền «granted» thì trả `da-bat`
   (dải ẩn) dù lần lưu lại lên máy chủ thất bại — máy chủ không có đăng ký, đầu chủ không nhận thông báo mà không biết.

## Cách vá

### Lõi (`packages/core/src/push`)

- `PUSH_SERVICE_HOSTS` — danh sách máy của dịch vụ đẩy đã biết, khai một chỗ: khớp đúng `fcm.googleapis.com` (Chrome,
  Edge Android, Opera, Samsung), `updates.push.services.mozilla.com` (Firefox), `web.push.apple.com` (Safari macOS, iPhone
  đã cài), và đuôi `.notify.windows.com` (Edge trên Windows, máy dạng `wns2-<vùng>.notify.windows.com`).
- `laDichVuDay(endpoint)` — hàm thuần: `URL` đọc được, giao thức `https:`, không tên/mật khẩu trong địa chỉ, cổng mặc
  định (rỗng hay 443), máy khớp danh sách (chữ thường; đuôi phải có ít nhất một nhãn đứng trước). Không phân giải DNS: máy
  là tên cố định của nhà cung cấp, không có tên do người khai.
- `PUSH_SEND` — thời hạn gửi, mặc định của sàn khai một chỗ: một lần gửi tối đa 5 giây; lối giao lead gửi tối đa 8 giây
  rồi để phần còn lại cho nhịp chia; nhịp chia gửi tối đa 40 giây cho mọi sàn của nhịp. Mọi ngân sách < 60 giây giữ chỗ của
  migration 018 — dòng nào đã gửi thì được ghi kết quả trước khi hết giữ chỗ, nên không dòng nào bị nhận lại khi đang gửi.

### Máy chủ (`packages/api/src/push`, `packages/api/src/jobs`)

- Đăng ký, gỡ đăng ký, và địa chỉ trong thân đăng xuất cùng một khuôn `Endpoint` thêm điều kiện `laDichVuDay` → địa chỉ lạ
  trả 400, không lưu (đăng xuất thì bỏ qua địa chỉ lạ, vẫn đăng xuất).
- `guiHopThu` thêm hạn chót (`hanChot`, mốc đồng hồ): trước mỗi dòng, nếu không còn đủ một lần gửi trước hạn chót thì dừng
  — dòng chưa gửi giữ nguyên (không tăng lần), nhịp sau nhận lại khi hết giữ chỗ. Mỗi lần gửi chạy đua với hạn 5 giây (cả bộ
  gửi bơm vào, không riêng `web-push`); quá hạn = lỗi tạm «quá hạn gửi» (tăng lần, nhịp sau gửi lại trong khung 15 phút).
  Dòng có địa chỉ không thuộc dịch vụ đẩy đã biết (đăng ký lưu trước bản vá) → ghi «gone»: gỡ đăng ký, không gọi bộ gửi.
  Phần gửi tách thành hàm `guiCacDong` nhận đồng hồ và hạn để bài kiểm thuần đo được.
- `webPushSender` truyền `timeout` cho `web-push` (bỏ kết nối treo ở tầng mạng, không chỉ bỏ chờ).
- `guiSauKhiGhi` (lối giao) đặt hạn chót = bây giờ + 8 giây; `runLeadTick` đặt một hạn chót chung = bây giờ + 40 giây cho
  mọi sàn của nhịp. Thời hạn đi qua một tham số tuỳ chọn (mặc định đọc `PUSH_SEND`) để bài kiểm trên Postgres rút ngắn mà
  vẫn chạy đúng đường nối thật.
- Đăng xuất: địa chỉ lạ trong thân thì bỏ qua phần gỡ đăng ký, vẫn chuyển cho better-auth — không bao giờ trả 400.

### Web (`apps/web/src/lib/push`, dải ở `today/dai-bat.tsx`)

- Trạng thái thiết bị thêm `loi-luu`: trình duyệt đã bật, quyền «granted», nhưng lưu lên máy chủ hỏng (lỗi mạng hay mã
  không 2xx). `phanLoai` nhận thêm `daLuu` (null khi chưa thử); `docTrangThai` lưu lại rồi phân loại theo kết quả.
- Dải ở trạng thái `loi-luu` hiện khối báo lỗi đã có của dải với nút «Bật thông báo». Lời báo là Hỏi-1 ở Cổng Phạm vi:
  khuyến nghị dùng lại lời sẵn có «Chưa bật được thông báo — thử lại» (không thêm chữ); lối khác là một câu riêng nói thiết
  bị đã bật mà máy chủ chưa lưu. `luu()` nhận `fetch` bơm vào để bài kiểm đo được lỗi mạng, 4xx, 5xx. Bấm nút chạy lại `batThongBao`, lưu lại đăng ký đang có.

## Đối chiếu ngành

Không chạm đối tượng nghiệp vụ (chủ nhà, lead, hàng…): đây là ống gửi thông báo — không dòng RESO. Sản phẩm cùng loại (Follow
Up Boss, Lofty) gửi đẩy qua ứng dụng riêng hoặc Web Push qua dịch vụ đẩy của trình duyệt; không bên nào để người dùng khai
máy nhận. Danh sách máy KHÔNG làm dữ liệu của sàn: cho sàn thêm máy là mở lại đúng lỗ SSRF.

## Không làm

- Đổi thời gian giữ chỗ một phút (migration 018, tầng T3) — ngân sách đặt dưới nó.
- Thêm dịch vụ đẩy khác ngoài bốn nhà (trình duyệt dùng dịch vụ lạ sẽ không bật được — báo lỗi ở dải).
- Đổi chữ hay khối của dải, thêm trạng thái mới cho trưởng nhóm — dải dùng chung cho mọi vai như hàng 26.
- Lần gửi quá hạn mà dịch vụ đẩy thật ra đã nhận: nhịp sau gửi lại, máy hiện thay thông báo cũ cùng `tag` — không thành hai
  thông báo trên màn khoá.

## Kiểm

- Lõi: ma trận viết tay của `laDichVuDay` (chấp nhận bốn nhà, từ chối từng kiểu lách), đối chứng đỏ hàm giả chỉ xét
  «https».
- Máy chủ thuần: `guiCacDong` với bộ gửi treo, bộ gửi chậm, hạn chót cạn, địa chỉ lạ — đồng hồ giả, không chờ thật.
- Máy chủ trên Postgres dãy B: đăng ký địa chỉ lạ → 400 không dòng; đăng ký cũ địa chỉ lạ → nhịp chia gỡ, bộ gửi không được
  gọi; bộ gửi treo → lối giao lead trả lời trong hạn, lead đã giao, dòng ghi lỗi tạm. Bộ kiểm hàng 26 đổi địa chỉ thử sang
  miền của dịch vụ đẩy đã biết (bộ gửi giả, không gọi ra ngoài).
- Bài nhìn trên bản dev dãy B: dải ở ba ô — lưu hỏng (hiện, báo lỗi), lưu được (ẩn), chưa bật (như cũ).
