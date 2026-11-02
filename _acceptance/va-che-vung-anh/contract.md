---
schema_version: 1
feature: Vá Che vùng ảnh — trên máy tính khung vẽ nằm gọn trong hộp che ở mọi cỡ ảnh, ảnh co theo khung; điện thoại giữ như cũ
slug: va-che-vung-anh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
design_doc: _acceptance/va-che-vung-anh/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-02T05:05:04Z
---

# Acceptance Contract: va-che-vung-anh

## Context

Hàng phát sinh từ Cổng Bằng chứng hàng 19 (`_acceptance/che-vung-anh/`): chủ kho chọn «mở hợp đồng mới» cho Ngoài-3 — hộp
che bị giữ ở bề rộng 24rem trên máy tính nên khung vẽ (tới 960×600) tràn khỏi hộp và đè lên hàng nút. Chỉ đổi trình che
(`units/photos/redact/`); không đổi lưu bản che, máy chủ hay cơ sở dữ liệu.

## Criteria

- AC-1: Given khung vẽ đang hiện nhỏ hơn cỡ vẽ của nó (đã co theo hộp), When đầu chủ kéo chuột từ điểm a tới điểm b trên
  khung, Then khung che rơi đúng vùng ảnh dưới con trỏ — cùng khung điểm ảnh như kéo cùng vị trí tương đối trên khung không
  co; kéo tràn mép vẫn kẹp về mép ảnh như hàng 19.
- AC-2: Given máy tính khổ 1440×900, When đầu chủ mở «Che vùng…» cho ảnh ngang lớn (2000×1500), ảnh dọc (1500×2000), ảnh
  nhỏ (400×300) hay ảnh rất rộng (3000×600), Then khung vẽ nằm trọn trong hộp che (bốn cạnh), giữ tỉ lệ ảnh, không đè hàng
  nút; ảnh nhỏ không bị phóng to; hộp nằm trọn trong màn.
- AC-3: Given máy tính khổ 1024×768, When mở «Che vùng…» cho ảnh ngang lớn và ảnh dọc, Then hộp nằm trọn trong màn, khung vẽ
  nằm trọn trong hộp và co nhỏ hơn cỡ vẽ của nó, nút «Lưu bản che» nhìn thấy không phải cuộn.
- AC-4: Given khung vẽ đang co (khổ 1024×768, ảnh dọc), When đầu chủ kéo một khung trên màn, Then vùng tô đen trên khung vẽ
  nằm đúng chỗ con trỏ đã kéo (điểm giữa vùng kéo đen, điểm ngoài vùng kéo không đen).
- AC-5: Given điện thoại khổ 375×812, When mở «Che vùng…» cho ảnh ngang lớn, Then giữ như trước vòng này: hộp che rộng gần
  hết bề ngang (bề ngang màn trừ 2rem), cùng ba nút, không thêm thao tác cảm ứng; đổi duy nhất: khung vẽ co theo hộp nên nằm
  trọn trong hộp thay vì tràn ra ngoài.
- AC-6: Given bài kiểm của hàng 19 (đổi toạ độ, tô kín, cỡ bản nhẹ, EXIF, lưu bản che), When chạy lại sau vòng này, Then vẫn
  xanh — lưu bản che, bản nhẹ, ngăn ảnh không đổi; kiểm kiểu, lint giao diện (mức nợ 0), sàn thiết kế và ranh giới tệp xanh.

## Coverage

Bỏ quét không gian: một lỗi đã có tên (Ngoài-3 hàng 19); trục cỡ ảnh × khổ màn đã liệt kê thẳng trong AC-2, AC-3, AC-5
(descope «bỏ coverage-scan»).

## Out of scope

- Ngoài-4 hàng 19 — khung đã bỏ còn hiện trên PNG có vùng trong suốt (chủ kho đã chọn Known limits).
- Hộp xem ảnh lớn ở `units/photos/muc-anh.tsx` mang cùng kiểu lỗi bề rộng — ngoài vùng của hàng, gửi giám sát.
- Che bằng cảm ứng trên điện thoại (ngoài phạm vi hàng 19).
- Chuyển trình che sang ngăn nổi của hệ bố cục — việc của hàng 91.

## Notes

- Ngoại lệ có hạn (ADR-0024 §9): `sm:max-w-[min(64rem,calc(100%-2rem))]` của hộp che và trần cao `max-h-[calc(100dvh-13rem)]` của khung vẽ là bề rộng,
  bề cao đặt tay; hết hạn khi trình che chuyển sang ngăn nổi của hệ bố cục (hàng 91). Hàng 91 chưa gộp lúc mở vòng này.
  ADR-0024 bảo ghi ngoại lệ ở bản đồ khuôn (`design/patterns/`) — tệp ngoài vùng của hàng, nên ghi ở đây và một dòng chú
  thích tại chỗ; việc phụ B-27 xin hàng 91 liệt trình che vào danh sách chuyển.
- Nếu hàng 91 gộp vào nhánh chính trước khi chấm S4 hay trước khi gộp hàng này và luật quét khuôn đỏ ở hai lớp trên: xin chạm
  bản đồ khuôn (yêu cầu `cham-tep`), ghi ngoại lệ có hạn ở đó, thêm đúng tệp ấy vào danh sách cho phép của E10; báo cáo S4 ghi
  E8 chạy trên nhánh chính có hay chưa có luật quét khuôn của hàng 91.
- Ngoài-1 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Hồ sơ nghiệm thu ghi một số bài kiểm màn hình là đạt dù chưa có số đo kèm theo như quy định của chính hồ sơ. Người dùng cuối không thấy lỗi nào; chỉ là bằng chứng chưa chắc chắn bằng cách hồ sơ tự đặt ra. — `_acceptance/va-che-vung-anh/evals.yaml`
- Ngoài-4 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Hồ sơ ghi hai bài kiểm khung che là đạt nhưng chưa có số đo thật kèm theo, nên chưa chứng minh chắc chắn vùng che nằm đúng chỗ con trỏ. Người dùng cuối chưa thấy lỗi nào. — `_acceptance/va-che-vung-anh/evals.yaml`
