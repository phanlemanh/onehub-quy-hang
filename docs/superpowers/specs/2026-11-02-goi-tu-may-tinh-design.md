# Gọi từ máy tính — thiết kế (hàng 30)

Ngày: 2026-11-02 · Hồ sơ: `_acceptance/goi-tu-may-tinh/` · Đứng trên: hàng 26 (Thông báo lead, ADR-0025), hàng 28 (chế độ
cuộc gọi), `mo-so-lead` (cửa mở số của lead, mỗi lần một vết).

## Vấn đề

Tham chiếu §13 chốt 29/10 mức tối thiểu: «bấm Gọi trên máy tính mở chế độ cuộc gọi và điện thoại quay số; nối tổng đài là
một loại kết nối, để sau». Hàng 28 đã làm nửa đầu (nút «Gọi» ở Hôm nay mở `/units/call?lead=<id>`). Nửa sau còn thiếu:
ngồi ở máy tính, đầu chủ phải tự cầm điện thoại, mở Hôm nay, tìm lead, mở số rồi mới gọi.

## Cách làm (máy khuyến nghị — Hỏi-1 ở Cổng Phạm vi)

**Máy tính nhờ điện thoại quay số bằng thông báo của hàng 26.** Trong chế độ cuộc gọi, thẻ lead có nút «Quay số trên điện
thoại». Bấm → máy chủ ghi vào hộp thư đi một thông báo cho mọi thiết bị đã bật thông báo lead của chính người ấy:

- `title` «Gọi chủ nhà» · `body` «<Toà> · <nhu cầu>» · `url` `/units/call/dial?lead=<id>` · `tag` `quay-so:<id>`.
- Đúng bốn khoá như hàng 26; không số, không tên chủ, không giá, không mã căn (bất biến 2). Dựng ở lõi
  (`packages/core/src/push`), cơ sở dữ liệu đã chặn nội dung lạ khoá (`push_outbox` check bốn khoá) — không migration mới,
  dùng `app.push_outbox_add` có sẵn.

Chạm thông báo trên điện thoại → service worker mở `url` (đã có, hàng 26) → **trang quay số** `/units/call/dial?lead=<id>`:
tên toà, nhu cầu, một nút lớn «Gọi chủ nhà». Bấm → gọi cửa mở số của `mo-so-lead` (`POST /api/v1/leads/{id}/phone-reveal`,
ghi một vết) → mở `tel:<số>`; số hiện theo nhóm chữ số kèm nút «Gọi» dự phòng khi trình duyệt chặn mở ứng dụng gọi. Tải lại
thì số ẩn, web không lưu số (cùng luật `mo-so-lead`).

Cửa mới của API: `POST /api/v1/leads/{leadId}/phone-dial` → `{ devices: n }`. Ai gọi được = đúng ai mở số được (đầu chủ
đang được giao, lead còn việc: không bỏ, không trả lại, outcome `new`/`owner_has_agent`); người khác 403/404, không dòng hộp
thư nào. Gửi ngay sau giao dịch bằng `guiSauKhiGhi` (như lối giao lead); lỗi tạm do nhịp chia gửi lại theo `PUSH_RETRY`.
Lời gọi không đổi nấc hay mốc của lead và không ghi vết mở số — vết chỉ ghi khi điện thoại thật sự mở số.

Máy tính gửi kèm điểm đăng ký thông báo của chính nó (nếu trình duyệt này đã bật); máy chủ trả `{ devices, otherDevices }` —
`otherDevices` đếm đăng ký của chính người ấy khác máy này (luật theo dòng cho người đọc đăng ký của mình). Máy tính báo theo
`otherDevices`: «Đã gửi tới n thiết bị khác — chạm thông báo trên điện thoại để gọi» và nút «Gửi lại»; 0 → «Chưa có điện
thoại nào bật thông báo lead — trên điện thoại mở Hôm nay, bấm Bật thông báo» (kể cả khi chỉ máy tính này bật).

Trang quay số đọc lead qua `GET /api/v1/leads/assigned/{id}` (cửa của hàng 28: chỉ lead đang giao cho chính người gọi, chưa
bỏ, chưa trả lại) — lead của người khác hay mã sai khuôn ra «Không thấy lead này trong việc của bạn», không hiện tên toà;
trang chặn vai khác Đầu chủ như chế độ cuộc gọi (404). Trang dựng trong khuôn `cuoc-goi` (`KhungCuocGoi`). Lỗi (mất mạng, lead không còn của bạn, hết
phiên) hiện một dòng dưới nút, nút bấm lại được.

### Căn cứ

- Hàng 30 khai `dung_tren: ["26","28"]` (`docs/plan/lo-trinh.json`): thông báo của 26 là đường máy tính → điện thoại có sẵn.
- Lối QR (máy tính hiện mã, điện thoại quét) cần thêm thư viện vẽ mã (đổi `package-lock.json`, ngoài vùng) và không mang
  được việc «điện thoại quay số» khi máy tính ở xa điện thoại hơn tầm quét; thông báo đến cả khi điện thoại đang khoá.
- Tổng đài: §13 đã chốt để sau.
- Không tự quay ngay khi mở trang: trình duyệt chỉ mở `tel:` từ một lần bấm của người; chạm thông báo rồi bấm một nút là
  ít nhất có thể.

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | KW Command | Ta làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|---|
| Gọi chủ nhà từ máy tính | Không có (RESO không chuẩn hoá cuộc gọi) | Call Lists gọi từ máy tính, chỉ trên máy tính ([Call Lists](https://help.followupboss.com/hc/en-us/articles/360014082414-Call-Lists)) | Không tự quay số; bấm số thì chuyển sang ứng dụng gọi ([Call Your Contacts](https://answers.kw.com/hc/en-us/articles/360041340054-Call-Your-Contacts-Using-Command)) | Máy tính gửi thông báo, điện thoại của chính đầu chủ quay số bằng ứng dụng gọi | Không: không có danh sách hay tham số nào để sàn chọn. Chữ thông báo («Gọi chủ nhà») đặt ở một chỗ có tên trong lõi như nhãn của hàng 26, dời vào sổ từ vựng khi hàng 90 xong |

Bài học: hai sản phẩm đều để cuộc gọi đi qua ứng dụng gọi hay dialer riêng; ta giống KW ở chỗ dùng ứng dụng gọi của máy, và
mượn thông báo đã có để nối máy tính với điện thoại thay cho tổng đài (để sau theo §13).

## Ranh giới

- Vùng: `apps/web/src/app/(app)/units/call/dial/**` (trang quay số, nút máy tính, lời gọi), `packages/api/src/leads/*`
  (cửa `phone-dial`), `packages/core/src/push/*` (nội dung thông báo), bài kiểm `packages/api/test-db/goi-tu-may-tinh.test.ts`.
- Một dòng cắm nút vào `units/call/cuoc-goi.tsx` (tệp của hàng 29) — xin giám sát `cham-tep` (L-22).
- Không migration, không đổi service worker.

## Đặc tả UX

<!-- ux-spec -->
**Khuôn IA đã chọn + căn cứ:** hai màn có sẵn khuôn — nút trong FramePanel của chế độ cuộc gọi (khuôn `cuoc-goi`, hàng
28) và trang một việc trên điện thoại theo khuôn trang tạm/hành động đơn (một tiêu đề, một nút chính, một dòng trạng thái).
Không tra mẫu thị trường: luồng hiển nhiên (thông báo → trang → gọi).

**Màn và trạng thái:**

| Màn | Trạng thái | Thấy gì |
|---|---|---|
| Chế độ cuộc gọi (máy tính) | chưa gửi | nút «Quay số trên điện thoại» (outline) trong thẻ lead |
| | đang gửi | nút khoá |
| | đã gửi n ≥ 1 | «Đã gửi tới n thiết bị — chạm thông báo trên điện thoại để gọi» + «Gửi lại» |
| | n = 0 | «Chưa có điện thoại nào bật thông báo lead — trên điện thoại mở Hôm nay, bấm Bật thông báo» |
| | lỗi | một dòng đỏ dưới nút (mất mạng · lead không còn của bạn · hết phiên), nút bấm lại được |
| Trang quay số (điện thoại) | đang tải | khung chờ |
| | có lead | «<Toà> · <nhu cầu>», nút lớn «Gọi chủ nhà» |
| | đang mở số | nút khoá |
| | đã mở số | số theo nhóm chữ số + nút «Gọi» (`tel:`); trình duyệt đã được đưa tới `tel:` |
| | lỗi mở số | một dòng dưới nút, bấm lại được |
| | không thấy lead | «Không thấy lead này trong việc của bạn» + «Về Hôm nay» |
| | vai khác | 404 như chế độ cuộc gọi |

**Khổ:** trang quay số dựng cho 375 trước, nút chính rộng hết khổ; trên máy tính trang vẫn dùng được.
<!-- /ux-spec -->

## Ngoài phạm vi

- Nối tổng đài, gọi trong trình duyệt, ghi âm — §13 để sau.
- Chọn thiết bị nhận: thông báo tới mọi thiết bị đã bật của người ấy, kể cả chính máy tính nếu máy tính cũng bật.
- Tự ghi «Đã gọi» khi điện thoại quay số — đầu chủ vẫn bấm «Đã gọi» (hàng 28) sau cuộc gọi.
- Thử chạm thông báo trên điện thoại thật — phiên nghiệm thu (ADR-0025 Hệ quả).
- Nhãn hai nút «Gọi» ở Hôm nay — hàng 29.
