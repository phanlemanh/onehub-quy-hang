---
schema_version: 1
feature: Đầu chủ tải ảnh điện thoại tới 10 MB lên hồ sơ căn trên bản thật mà không bị chặn ở giới hạn máy chủ, mở lại hồ sơ không thấy ảnh vỡ, và thấy lời báo khi sửa hay xoá ảnh không thành
slug: va-anh-ban-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-11-01-va-anh-ban-that-design.md
approved_by: Manh Phan
approved_at: 2026-11-01
---

# Acceptance Contract: va-anh-ban-that

## Context

Hàng phát sinh từ Cổng Bằng chứng hàng 18 (`_acceptance/anh-can-ba-ngan/`): ba mục chủ kho chọn «mở hợp đồng mới» —
Ngoài-6 (thân yêu cầu > 4,5 MB bị Vercel chặn), Ngoài-8 (phản hồi chuyển hướng giữ đệm lâu hơn link ký 60 giây),
Ngoài-10 (lỗi sửa/xoá ảnh không báo). Ngoài-9 giữ ở hạn chế đã biết. Không đổi cơ sở dữ liệu. Cách tải bản gốc là Hỏi-1;
hợp đồng viết theo khuyến nghị: link ký tải lên thẳng kho ảnh.

## Criteria

- AC-1: Given kho ảnh là Supabase Storage, When đầu chủ giữ căn thêm một ảnh gốc 4,5–10 MB, Then bản gốc không đi qua thân
  yêu cầu tới API (không lời gọi nào tới `/api/v1/**` mang thân > 4,5 MB): API cấp link PUT ký 60 giây cho đúng đối
  tượng `<company_id>/<photo_id>/original` sau khi kiểm quyền thêm ảnh, trình duyệt PUT bản gốc lên link ấy, rồi gửi bản
  nhẹ và mã ảnh cho API; ảnh hiện trong ngăn như ảnh nhỏ.
- AC-2: Given bước xác nhận của AC-1, When đối tượng trên kho không phải ảnh (byte đầu) hay lớn hơn 10 MB, hay không có,
  Then API từ chối 400 với mã lỗi như đường cũ, không ghi dòng ảnh hay sự kiện, và xoá đối tượng sai trên kho; người không
  được thêm ảnh (đầu khách, sàn khác) xin link tải lên thì bị từ chối như lệnh thêm, kho không nhận yêu cầu nào; xin link
  với cỡ khai > 10 MB hay loại không phải ảnh bị từ chối 400; xác nhận một mã ảnh không do phiên này xin (mã của sàn
  khác, mã đã có dòng) bị từ chối, không ghi, không xoá đối tượng nào ngoài tiền tố mã sàn của phiên.
- AC-3: Given kho ảnh là Postgres (máy dev, CI), When thêm ảnh, Then đi đường cũ một bước, mọi bài kiểm của hàng 18 vẫn xanh.
- AC-4: Given ảnh ở kho Storage, When trình duyệt xin ảnh, Then phản hồi chuyển hướng tới link ký mang
  `Cache-Control: private, no-store` ở cả hai ngăn (không giữ đệm lâu hơn link — Hỏi-2); phản hồi byte của bản Postgres giữ như
  hàng 18 (nội bộ no-store, gửi được max-age=300).
- AC-5: Given mục Ảnh, When đặt bìa, đánh dấu ảnh mẫu, đổi ngăn, đổi thứ tự hay xoá ảnh mà API trả lỗi hay mất mạng, Then
  một thông báo nổi nói việc nào không thành, đúng chữ của bảng: «Không đặt ảnh bìa được — thử lại», «Không đánh dấu
  ảnh mẫu được — thử lại», «Không chuyển ngăn được — thử lại», «Không đổi thứ tự được — thử lại», «Không xoá ảnh được —
  thử lại», ảnh hiện về trạng thái máy chủ; khi thành công
  không có thông báo lỗi.
- AC-6: Given bản chạy dev của dãy H (kho Postgres) với dữ liệu mẫu, When đầu chủ thêm một ảnh lớn hơn 4,5 MB và làm hỏng một lần xoá (API giả
  trả lỗi qua công cụ trình duyệt), Then mắt thấy ảnh vào ngăn và thông báo lỗi xoá. Đường tải thẳng lên Supabase Storage thật do chủ kho thử khói từ máy mình với khoá trong .env.local
  (`thu/khoi-storage.mjs`, Hỏi-3), không thuộc lượt chấm.

## Coverage

Bỏ quét không gian: ba lỗi đã có tên từ Cổng Bằng chứng hàng 18, mỗi lỗi một nhóm tiêu chí (descope «bỏ coverage-scan»).

## Out of scope

- Ngoài-9 hàng 18 (byte mồ côi khi lỗi giữa chừng, kể cả đối tượng tải lên mà bước xác nhận không tới) — hạn chế đã biết.
- Đổi tên trường API sang tiếng Anh, khai OpenAPI cho đường ảnh — hạn chế đã biết của hàng 18.
- Che vùng ảnh — hàng 19.

## Notes

- Ngoài-1 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Một tên trường trong phản hồi ảnh viết lệch kiểu so với các trường khác; người dùng cuối không thấy gì, chỉ gây phiền cho người viết code về sau. — `packages/api/src/photos/store.ts`
- Ngoài-2 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Nếu khoá hay cấu hình kho ảnh hỏng, người dùng bị báo nhầm là «không phải ảnh» thay vì lỗi hệ thống, nên khó biết cần báo người quản trị. — `packages/api/src/photos/kho-s3.ts`
- Ngoài-3 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Một số lần tải ảnh bị từ chối vẫn để lại bản gốc trong kho mà không hồ sơ nào trỏ tới, chiếm chỗ lâu dài. — `packages/api/src/photos/store.ts`
- Ngoài-4 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Trong vòng một phút sau khi xác nhận, người giữ link tải lên có thể thay bản gốc bằng tệp khác chưa được kiểm. — `packages/api/src/photos/store.ts`
- Ngoài-5 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm khẳng định bản gốc không đi qua API nhưng thực ra chỉ đo thứ do chính bài kiểm tạo ra, nên nếu sau này sai thì bài kiểm không báo. — `packages/api/test-db/photos-ban-that.test.ts`
- Ngoài-6 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm tự động chỉ xem trong mã có đúng dòng chữ chứ không chạy thử xem lời báo lỗi có hiện lên màn hình, nên có thể bỏ sót lỗi hiển thị. — `apps/web/src/app/(app)/units/photos/ban-that.test.ts`
- Ngoài-7 (máy định tuyến 2026-11-01, đề xuất S4 known-limits): Bài kiểm việc chặn mã ảnh của sàn khác chỉ thấy bị từ chối chứ không chắc từ chối đúng lý do, nên có thể bỏ sót lỗi khác che mất. — `packages/api/test-db/photos-ban-that.test.ts`
