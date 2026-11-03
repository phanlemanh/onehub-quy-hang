---
schema_version: 1
feature: "Ghi thiết bị (máy tính hay điện thoại) vào sự kiện của thao tác, và ghi lượt mất mạng cùng thao tác lúc mất mạng trên điện thoại về máy chủ, để hai số đo §11 «thao tác theo thiết bị và vai» và «mất mạng trên điện thoại» đo được trong hai tuần thử"
slug: ghi-thiet-bi-va-mat-mang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [db, api, core]
status: verified
design_doc: _acceptance/ghi-thiet-bi-va-mat-mang/design.md
approved_by: Manh Phan
approved_at: 2026-11-03
---

# Acceptance Contract: ghi-thiet-bi-va-mat-mang

## Context

Hàng phát sinh của hàng 52 (dãy D, đợt dau-khach-nhap), mở theo Hỏi-1 Cổng Phạm vi hàng 52 (chủ kho duyệt 03/11), Cổng
Đáng «Build» (Manh Phan, 03/11). Hàng 52 trả «chưa có sự kiện» cho hai số đo §11 vì chưa hàng nào ghi thiết bị của thao
tác và lượt mất mạng trên điện thoại. Hàng này ghi hai thứ ấy qua đường ghi đang có — migration `028` (giám sát cấp),
API của hàng (`packages/api/src/listings/`), một đường nhận lượt mất mạng, bộ đồng bộ trên máy (`apps/web/src/lib/sync/`,
cham-tep D-7) — và cho hai dòng của bộ số đo lõi ra số. Không màn, không chữ UI mới.

Source input: `docs/plan/lo-trinh.json` hàng `ghi-thiet-bi-va-mat-mang` · `_acceptance/ghi-thiet-bi-va-mat-mang/opportunity.md`
· thiết kế `_acceptance/ghi-thiet-bi-va-mat-mang/design.md`.

## Criteria

- AC-1: Given cơ sở dữ liệu đã chạy mọi migration tới `028`, When đọc khuôn bảng, Then `listing_events` có cột `device`
  (null hoặc `desktop`/`mobile`, giá trị khác bị ràng buộc từ chối) và `made_offline` (không null, mặc định false), sự
  kiện ghi trước `028` đọc `device` null và `made_offline` false, sự kiện vẫn không sửa, không xoá được; bảng
  `offline_sessions` có `ended_at >= started_at`, `queued_ops >= 0`, thiết bị `desktop`/`mobile`, khoá duy nhất theo
  sàn + người + thiết bị + giờ bắt đầu, và dòng không sửa, không xoá được.
- AC-2: Given hai sàn A và B, mỗi sàn có lượt mất mạng, When vai `quy_hang_app` đọc và ghi trong sàn A, Then chỉ thấy lượt
  của sàn A; ghi dòng mang `company_id` của B hay `user_id` của người khác bị luật theo dòng từ chối; bảng bật cả `enable`
  lẫn `force row level security` (bất biến 1).
- AC-3: Given một người của sàn gửi tạo hàng và lệnh đổi hàng qua API, When đầu yêu cầu `x-quy-hang-device` là `mobile`,
  `desktop`, vắng, hay một giá trị lạ, và lệnh mang `madeOffline: true`, `false` hay vắng, Then sự kiện ghi `device` đúng
  giá trị khai (vắng hay lạ → null, lệnh vẫn được nhận) và `made_offline` đúng khoá (vắng → false); `GET` của hàng trả hai
  trường ấy trên từng sự kiện; lệnh mang khoá lạ khác vẫn bị từ chối 400 như cũ.
- AC-4: Given một người đã đăng nhập ở sàn đang làm, When gửi `POST /api/v1/sync/offline-sessions` với lượt hợp lệ, gửi lại
  đúng lượt ấy, gửi lượt có `endedAt` trước `startedAt`, thiết bị lạ, khoá lạ, hay chưa đăng nhập, Then lần đầu trả 201
  và ghi một dòng của chính người ấy ở sàn ấy; lần gửi lại trả 200, không thêm dòng; ba ca sai khuôn trả 400 không ghi gì;
  chưa đăng nhập trả 401, chưa gắn sàn trả 403 — cả hai không ghi gì.
- AC-5: Given bộ đồng bộ trên máy, When cạnh ngắn của màn hình thiết bị dưới 768px, đúng 768px và trên 768px — kể cả
  điện thoại xoay ngang (cạnh dài 844px, cạnh ngắn 390px) — Then hàm thiết bị trả `mobile`, `desktop`, `desktop`, và
  điện thoại xoay ngang vẫn là `mobile` (Hỏi-2); hàm gọi API của trình duyệt gửi đầu `x-quy-hang-device` mang giá trị ấy
  ở mọi lời gọi.
- AC-6: Given lần thử gần nhất của bộ đồng bộ là mất mạng, When người sửa một căn trên máy, rồi có mạng lại và hàng đợi
  được gửi, Then thao tác ấy mang `madeOffline: true` trong lệnh gửi máy chủ; thao tác ghi lúc lần thử gần nhất còn có mạng mà lần
  gửi đầu của nó gặp mất mạng cũng mang `madeOffline: true` (máy vừa rớt mạng); thao tác ghi và gửi được lúc có mạng không
  mang khoá ấy;
  luật gửi theo căn, đúng thứ tự, gửi lại không trùng của hàng 13/61 không đổi.
- AC-7: Given bộ đồng bộ đang có mạng, When một lượt thử gặp mất mạng, các lượt sau vẫn mất mạng, rồi một lượt có mạng lại,
  Then lượt mất mạng mở đúng một lần ở giờ lượt thử mất mạng đầu, khép ở giờ lượt có mạng lại với số thao tác ghi lúc mất
  mạng, và được gửi qua đường lượt mất mạng đúng một lần; gửi lỗi thì lượt ở lại trong kho trên máy và gửi lại ở lượt kế,
  không gửi hai dòng; tải lại trang giữa chừng không làm mất lượt đang mở.
- AC-8: Given sự kiện của hàng trong kỳ `[tu, den)` — mọi sự kiện của hàng là thao tác của một người (bảng sự kiện đòi
  người làm) — mang thiết bị máy tính, điện thoại và không rõ, của người các vai, When tính `actions_by_device_role`, Then
  số đo ra «đo được» với tử là thao tác trên điện thoại, mẫu là thao tác có thiết bị, chi tiết đếm từng ô thiết bị × vai
  (người nhiều vai đếm vào mỗi vai), `khong-ro` đếm thao tác không rõ thiết bị (không vào mẫu) và `tong` là mọi thao tác
  trong kỳ — tỉ lệ có thiết bị của ngưỡng đọc được bằng `(tong − khong-ro) / tong`; sự kiện ngoài kỳ không vào.
- AC-9: Given lượt mất mạng của điện thoại và máy tính, trong và ngoài kỳ, và sự kiện `madeOffline` trong kỳ, When tính
  `mobile_offline`, Then số đo ra «đo được» với số lượt mất mạng điện thoại bắt đầu trong kỳ, chi tiết tổng phút, lượt dài
  nhất và số thao tác làm lúc mất mạng trên điện thoại trong kỳ; lượt máy tính và lượt ngoài kỳ không vào; và bảng số đo
  chỉ còn bốn mã «chưa có sự kiện» (`inquiry_to_send`, `sheet_publishes`, `customer_link_opens`, `customer_interest`).
- AC-10 (cross-layer): Given bộ đồng bộ trên máy nói với API thật trên Postgres, When điện thoại (bề rộng dưới 768px) mất
  mạng, người sửa một căn, rồi có mạng lại, Then trong cơ sở dữ liệu sự kiện của thao tác ấy có `device = 'mobile'`,
  `made_offline = true`, và có đúng một dòng `offline_sessions` của người ấy với `queued_ops = 1`.

## Coverage

Bỏ quét morphological-scan (sổ: «bỏ coverage-scan»); trục ghi tay theo bốn lớp của đường ghi:

- Trục lớp: cơ sở dữ liệu (AC-1, AC-2) | API (AC-3, AC-4) | bộ đồng bộ (AC-5, AC-6, AC-7) | lõi số đo (AC-8, AC-9) | xuyên
  lớp (AC-10).
- Trục giá trị thiết bị: `mobile` | `desktop` | vắng | lạ (AC-3, AC-5) | mốc 768 đúng (AC-5).
- Trục mất mạng: lượt mở | đang mở (nhiều lượt thử) | khép | gửi lỗi rồi gửi lại | tải lại trang (AC-7) | thao tác trong
  lượt (AC-6, AC-7).
- Trục bất biến: cách ly sàn (AC-2) | chỉ-thêm (AC-1) | không lớp `source` (AC-4 khuôn chặt, AC-1 cột) | một đường ghi
  (AC-3 đi qua `ghiSuKien`).
- Trục kỳ đo: trong | ngoài `[tu, den)` (AC-8, AC-9).
- Later: thiết bị trên lead, liên hệ, ảnh (đường ghi riêng). Never ở hàng này: ngưỡng (Cổng Đáng của chủ kho).

## Đường đo

- Thước SỐNG «hai số đo thôi trả "chưa có sự kiện" và ra số trên dữ liệu mẫu» · số từ: bảng số đo lõi (AC-8, AC-9) · bảo
  đảm bởi: AC-8, AC-9, AC-10.
- Thước SỐNG «≥ 95% sự kiện thao tác ghi sau phát hành mang thiết bị» và thước CHẾT «dưới 80% sau 3 ngày» · số từ:
  `(tong − khong-ro) / tong` trong chi tiết `actions_by_device_role` (AC-8), chạy hàm lõi trên sự kiện của sàn thử với kỳ
  `[phát hành, phát hành + 3 ngày)` — chạy tay: chưa có đường đọc số đo (Out of scope, như hàng 52) · bảo đảm bởi: AC-3
  (máy chủ ghi), AC-5 (máy gửi mọi lời gọi).
- Thước CHẾT «thao tác lúc mất mạng về máy chủ mà mất dấu» · không đo trực tiếp được trên sàn thử (máy chủ không biết thao
  tác nào lẽ ra mang dấu); đo ở bài thử: AC-6 (hai đường gắn dấu, gồm máy vừa rớt mạng) và AC-10 (dấu về tới cơ sở dữ
  liệu) — giới hạn đã khai.

## Out of scope

- Thiết bị và dấu mất mạng cho lead, liên hệ, ảnh, thông báo — đường ghi riêng, hàng sau.
- Màn xem số đo, đường API đọc số đo — hàng sau (hàng 52 cũng không có).
- Ngưỡng của hai số đo — chủ kho đặt ở Cổng Đáng của hàng đọc số.
- Đo lượt mất mạng mịn hơn nhịp thử của bộ đồng bộ (15/30 giây), hay khi trang đóng — giới hạn đã khai ở thiết kế.
- Phân biệt máy tính bảng — tính theo bố cục người ấy thấy (mốc `md`).

## Notes

- Bất biến chạm: (1) cách ly — bảng mới bật luật theo dòng, ca trong `isolation.test.mjs` (AC-2); (2) chủ nhà — không cột
  nào thuộc lớp `source`, khuôn đường mới `.strict()` (AC-4); (3), (4) không chạm.
- Hỏi-2: thiết bị theo cạnh ngắn màn hình (loại máy) hay theo bề rộng cửa sổ (bố cục) — xem sổ quyết định.
- Hỏi-1: hàng 52 đã ký AC-8 «sáu mã chưa có sự kiện»; AC-9 của hàng này đổi thành bốn mã. Ca kiểm và eval E8 của hàng 52
  phải đổi theo — xem sổ quyết định.
- Dãy D: Postgres `quy-hang-db-dkn-D` cổng 5575 (luật đợt 7).
