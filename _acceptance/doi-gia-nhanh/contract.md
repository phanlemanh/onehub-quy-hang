---
schema_version: 1
feature: Đầu chủ đổi giá hoặc trạng thái nhanh trên điện thoại sau cuộc gọi, theo đúng luật sửa giá
slug: doi-gia-nhanh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-11-08-doi-gia-nhanh-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: doi-gia-nhanh

## Context

Hàng 40 của lộ trình (dãy H, đợt dau-khach-nhap), T2: không migration, không đổi trần lớp dữ liệu; thêm một cờ vào lớp phủ
hồ sơ của lõi (`packages/core/src/access`). Hàng 39 đã chốt «hạ giá và đổi trạng thái đi qua hồ sơ căn» trên điện thoại, nên
lối sửa nhanh nằm trên hồ sơ căn điện thoại, dùng lại bộ dựng lệnh và luật của ô Bảng hàng.

## Criteria

- AC-1 (cross-layer): Given hồ sơ căn trên điện thoại (dưới 768 px), When người xem theo bảng quyền của lõi được sửa hàng
  (`duocLamVoiHang(…, "sua", …)`: đầu chủ, đầu khách, trưởng nhóm), Then có lối «Đổi giá» trên khối Giá và «Đổi trạng thái»
  trên huy hiệu trạng thái; người không được sửa (telesales, quản trị sàn thuần) không có lối nào, và máy chủ từ chối lệnh sửa
  của họ dù gọi thẳng API. Màn đọc cờ `suaHang` của lõi, không rẽ theo tên vai.
- AC-2: Given ngăn «Đổi giá» mở, When người gõ giá và chọn bao phí rồi «Lưu», Then máy ghi một sự kiện đổi giá mang đúng
  `listPrice` và `feeInclusion`; giá đọc không được hay thiếu điều kiện phí → lời lỗi trong ngăn, không ghi; giá đổi quá ngưỡng
  hỏi lại của sàn (mặc định 20%) hay đổi điều kiện phí → hỏi lại một lần trước khi ghi, «Sửa lại» thì không ghi.
- AC-3: Given căn đang Đã bán, When người mở hồ sơ, Then khối Giá không mở sửa và nói lý do của lõi «Căn đã bán không đổi giá —
  giá chốt đã ghi»; lệnh đổi giá dựng tay cho căn ấy bị chặn trên máy trước khi gửi.
- AC-4: Given ngăn «Đổi trạng thái» mở, When người chọn một nấc, Then danh sách nấc đúng bảng chuyển và nhãn của sàn (người
  không có cờ «Sẵn sàng bán» không thấy nấc Đang bán); Đã bán đòi giá chốt và ngày, Ngừng bán đòi lý do; chuyển trái luật hay
  thiếu điều kiện → lý do của lõi trong ngăn, không ghi; chọn hợp lệ → ghi một sự kiện đổi trạng thái đúng nấc và phần kèm.
- AC-5 (cross-layer): Given một lần đổi giá hay trạng thái đã ghi trên điện thoại, When có mạng, Then máy chủ có đúng một sự
  kiện mới mang người làm và thiết bị `mobile`; mất mạng lúc lưu → ghi trên máy, tự gửi khi có mạng lại, không mất, không trùng;
  máy chủ từ chối về sau → căn vào «Cần xem» như ô Bảng hàng.
- AC-6: Given một lần đổi đã ghi, When người xem lại, Then hồ sơ căn hiện giá / trạng thái mới ngay, Bảng hàng hiện giá mới, và
  Lịch sử của hồ sơ có dòng «Đổi giá cũ → mới» hay «Đổi trạng thái cũ → mới» kèm người làm và lúc làm; trang khách của căn mở
  (hay tải lại) sau lần đổi hiện giá / trạng thái mới (Hỏi-1).
- AC-7: Given mã của hàng, When chạy lint, kiểm kiểu, bộ kiểm giao diện và chấm khuôn nhóm `ho-so-can`, Then ngăn đi qua
  `NganNoi`, báo lỗi qua `TrangThai`, không mã màu thô, không lệch khuôn mới.
- AC-8: Given bản đang chạy với dữ liệu mẫu ở 375×812, When dau-chu-1 đổi giá một căn mình giữ, đổi trạng thái, và mở một căn
  Đã bán, Then ảnh thấy: ngăn Đổi giá, khối hỏi lại khi giá đổi nhiều, khối Giá mới, Lịch sử có dòng mới, ngăn Đổi trạng thái
  với lời lý do khi chọn nấc thiếu điều kiện, căn Đã bán không mở sửa giá; telesales mở cùng căn không có lối sửa. «Vài chạm»
  có trần: đổi giá không quá 4 chạm, đổi trạng thái không quá 3 chạm từ hồ sơ tới «Lưu» (gõ phím không tính).

## Out of scope

- Màn cuộc gọi trên điện thoại (hàng 39 đã loại); lối sửa chỉ ở hồ sơ căn.
- Trang khách đang mở tự làm mới không cần tải lại (Hỏi-1, lối b).
- Sửa trường khác (phí riêng, pháp lý, tình trạng sử dụng) trên điện thoại.
- Thân cột máy tính — Bảng hàng đã có ô sửa.

## Coverage

Quét theo preset entity-feature (người xem × việc × trạng thái căn × mạng):
- Người xem theo bảng quyền: được sửa · không được sửa · có / không cờ «Sẵn sàng bán» → AC-1, AC-4.
- Việc: đổi giá · đổi điều kiện phí · đổi trạng thái (từng nấc đích) → AC-2, AC-4.
- Căn: đang rao · Đã bán · chưa đủ điều kiện → AC-2, AC-3, AC-4.
- Mạng: có · mất lúc lưu · máy chủ từ chối về sau → AC-5.
- Hiện lại: hồ sơ · Bảng hàng · Lịch sử · trang khách → AC-6, AC-8.
Thước đủ: mỗi ô của ma trận giá (6 ca) và trạng thái (theo bảng chuyển) là một ô viết trước. Later: sửa trường khác → Out of scope.

## Đường đo

- Đổi trong vài chạm theo đúng luật: số chạm từ hồ sơ tới «Lưu» (đổi giá: chạm khối Giá · gõ · chọn phí · Lưu) — E8; luật
  chặn và nói lý do — E2, E3, E4. AC-2..AC-4, AC-8.
- Giá mới hiện ở Bảng hàng và trang khách — E8 (đếm trên bản chạy). AC-6.
- Dòng thời gian ghi ai đổi, lúc nào — E6, E8 (sự kiện mang người làm, lúc, thiết bị). AC-5, AC-6.

## Notes

- Hỏi-2 (Cổng Phạm vi): duyệt giao diện bằng thẻ chữ, bản bấm được dựng ở bước dựng (khuyến nghị) hay chạy
  design-pass trước Cổng Phạm vi.
- Hỏi-1 (Cổng Phạm vi): trang khách — (a) giá mới hiện khi khách mở hay tải lại link (khuyến nghị) · (b) trang đang mở tự làm
  mới. Hợp đồng viết theo khuyến nghị.
- Ngoài-1 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Người không được sửa (telesales, quản trị thuần) vẫn bị chặn, nhưng máy báo «không tìm thấy» thay vì «cấm». Câu chữ bài kiểm đã đổi sau khi chủ kho duyệt và chưa được duyệt lại. — `_acceptance/doi-gia-nhanh/evals.yaml`
- Ngoài-2 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Trang hồ sơ căn khi telesales mở có thể đang báo một lỗi nhỏ lúc chạy mà chưa ai xem là lỗi gì. Người dùng có thể không thấy gì khác thường, nhưng báo cáo ghi «sạch» là chưa chắc. — `_acceptance/doi-gia-nhanh/evidence/E8-network.txt`
- Ngoài-3 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Tiêu chí về việc chặn người không có quyền đã được sửa sau khi duyệt, còn bằng chứng đang lưu vẫn là của lượt trước. Hồ sơ nghiệm thu có thể tự mâu thuẫn cho đến khi chạy lại và được phê. — `_acceptance/doi-gia-nhanh/evals.yaml`
- Ngoài-4 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Một số ảnh minh chứng Lịch sử chỉ chụp đầu trang nên không chứng minh được dòng đổi trạng thái hiện ra. Tính năng có thể vẫn chạy đúng, chỉ là bằng chứng chưa rõ. — `_acceptance/doi-gia-nhanh/evidence/E8-canh4d-lich-su.png`
- Ngoài-5 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Máy chưa tự kiểm rằng ngăn Đổi giá còn đủ ô giá, lựa chọn bao phí, nút Lưu và nút «Sửa lại» không ghi. Nếu sau này ai làm mất một phần, bài kiểm vẫn xanh và người dùng mới là người gặp lỗi. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
- Ngoài-7 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Người sửa trên điện thoại không được báo rằng lần sửa đã tính là vừa xác nhận với chủ nhà. Dữ liệu vẫn ghi đúng, chỉ thiếu lời nhắc. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/ngan-sua-nhanh.tsx`
- Ngoài-9 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Bộ kiểm tự động chỉ xác nhận một nửa các tổ hợp trạng thái và quyền. Nếu danh sách nấc hiển thị sai ở các tổ hợp còn lại thì kiểm tự động chưa bắt được. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
- Ngoài-10 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Bài kiểm chỉ xác nhận Lịch sử có dòng đổi giá, chưa xác nhận giá cũ và giá mới ghi đúng chiều. Nếu dòng hiện sai số thì kiểm tự động không báo. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
- Ngoài-11 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Bài kiểm Lịch sử cho đổi trạng thái dùng sự kiện dựng tay nên chưa chứng minh được đường ghi thật sinh ra dòng đúng. Người dùng chưa thấy lỗi nào. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
- Ngoài-12 (máy định tuyến 2026-11-08, đề xuất S4 known-limits): Các ca từ chối chỉ được kiểm là bị từ chối, chưa kiểm đúng lý do. Nếu lý do hiện cho người dùng sai thì kiểm tự động chưa bắt được. — `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
