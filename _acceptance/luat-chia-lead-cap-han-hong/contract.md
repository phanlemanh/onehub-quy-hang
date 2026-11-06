---
schema_version: 1
feature: "Ở mục «Luật chia lead», khi sàn đã có cặp hạn nhận / hạn gọi lưu sai từ trước, quản trị sửa một hạn thì màn báo đúng: hoặc lưu được cặp hợp lệ, hoặc báo lỗi kèm hạn kia — không báo «Đã lưu» trong khi lead mới vẫn chạy theo hạn mặc định."
slug: luat-chia-lead-cap-han-hong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-11-06-luat-chia-lead-cap-han-hong-design.md
---

# Acceptance Contract: luat-chia-lead-cap-han-hong

## Context

Hàng vá của dãy D, ngay sau hàng 48 (đợt `dau-khach-nhap`, yêu cầu D-19): Ngoài-2 và Ngoài-20 của hồ sơ `luat-chia-lead`,
chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11. Hàng 82 đã chốt (Hỏi-1, 04/11): cặp hạn trái luật có từ trước thì
cả cặp chạy theo mặc định 15/30 và GET cấu hình báo lỗi nêu hai khoá — vòng này giữ nguyên điều đó. Lỗi nằm ở lối ghi chung
`PATCH /api/v1/company/settings`: kiểm trên cặp đã giải nhưng chỉ ghi khoá gửi lên, nên hạn kia giữ giá trị hỏng cũ. Không
thêm bảng, migration hay lối API; không chạm bất biến nào (hai hạn là lớp `company_internal`).

Source input: `_acceptance/luat-chia-lead/review-findings.md` (Ngoài-2, Ngoài-20) · `_acceptance/luat-chia-lead-cap-han-hong/opportunity.md`
· thiết kế `docs/superpowers/specs/2026-11-06-luat-chia-lead-cap-han-hong-design.md`

## Criteria

- **AC-1** — Sửa một nửa của cặp hỏng thì lưu đúng cái màn đang hiện. (cross-layer)
  Given sàn mẫu có dòng hạn nhận lead 60 lưu từ trước (hạn gọi lần đầu chưa lưu), GET báo lỗi cặp và hai hạn đọc ra 15/30,
  When quản trị lưu chỉ Hạn gọi lần đầu 40 qua lối chung,
  Then trả 200; GET sau đó không còn lỗi cặp, hai hạn đọc ra 15/40 (hạn nhận là giá trị màn đang hiện, không phải 60); lead
  mới nhập rồi qua nhịp chia mang 15/40; nhật ký thêm đúng hai dòng (hạn gọi 40, hạn nhận 15), mỗi dòng ghi người đổi và vai.

- **AC-2** — Giá trị cũ ẩn không bỗng có hiệu lực. (cross-layer)
  Given sàn mẫu có dòng hạn gọi lần đầu 10 lưu từ trước (hạn nhận chưa lưu), hai hạn đọc ra 15/30 kèm lỗi cặp,
  When quản trị lưu chỉ Hạn nhận lead 5,
  Then trả 200; hai hạn đọc ra 5/30 — không phải 5/10; không còn lỗi cặp; lead mới mang 5/30.

- **AC-3** — Ra cặp không hợp lệ so với cái đang hiện thì báo lỗi nêu hạn kia, không ghi gì.
  Given sàn mẫu có dòng hạn nhận lead 60 lưu từ trước (đọc ra 15/30),
  When quản trị lưu chỉ Hạn gọi lần đầu 10,
  Then trả 400, lý do mở đầu bằng khoá hạn gọi và nêu hạn nhận; không khoá nào đổi trong bảng, nhật ký không thêm dòng.

- **AC-4** — Cặp không hỏng thì lưu một hạn chỉ ghi đúng hạn ấy.
  Given sàn mẫu chưa có dòng hỏng (hay đã lưu cặp hợp lệ 20/40),
  When quản trị lưu chỉ Hạn gọi lần đầu 45,
  Then trả 200; hạn nhận giữ nguyên trong bảng (không có dòng mới nếu chưa từng lưu), nhật ký thêm đúng một dòng.

- **AC-5** — Màn không báo «Đã lưu» khi phản hồi còn lỗi ở dòng vừa lưu.
  Given phản hồi 200 của lối chung có `errors` nhắc một khoá trong số vừa đổi,
  When màn xử lý kết quả lưu,
  Then màn hiện báo lỗi trên đầu khung nêu tên dòng ấy và «chưa áp», không hiện toast «Đã lưu»; `errors` rỗng (hay chỉ nhắc
  khoá không đổi) thì toast như cũ («Đã lưu · áp cho lead mới từ bây giờ» khi có điểm hiệu lực mới).

- **AC-6** — Hạn gọi hỏng, sửa hạn nhận ra cặp trái luật thì báo lỗi, không ghi gì.
  Given sàn mẫu có dòng hạn gọi lần đầu 10 lưu từ trước (đọc ra 15/30),
  When quản trị lưu chỉ Hạn nhận lead 40 (lớn hơn hạn gọi 30 đang hiện), rồi lưu chỉ Hạn nhận lead 20,
  Then lần 40 trả 400, lý do mở đầu bằng khoá hạn gọi và nêu hạn nhận, bảng giữ đúng một dòng hạn gọi 10, nhật ký không thêm
  dòng; lần 20 trả 200 và hai hạn đọc ra 20/30 (kiểm so với 30 đang hiện, không so với 10 đã lưu).

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian của vòng là một bảng nhỏ đã liệt trọn: cặp đang hỏng ×
nửa được sửa (hạn nhận hỏng · hạn gọi hỏng) × kết quả (hợp lệ · trái luật), cộng cặp không hỏng làm đối chứng và lưới màn.
AC-1 (hạn nhận hỏng, sửa hạn gọi, hợp lệ) · AC-2 (hạn gọi hỏng, sửa hạn nhận, hợp lệ) · AC-3 (hạn nhận hỏng, sửa hạn gọi,
trái luật) · AC-6 (hạn gọi hỏng, sửa hạn nhận, trái luật — bổ sung sau phản biện) · AC-4 (không hỏng) · AC-5 (màn; E5 hàm
thuần, E7 nhìn trên bản đang chạy).

## Out of scope

- Dọn dòng hỏng lúc đọc: GET không ghi dữ liệu.
- Đổi bộ giải hay luật cặp của lõi (hàng 82 đã chốt).
- Đổi bố cục màn «Luật chia lead»; mọi dòng, nút và trạng thái khác giữ như hàng 48.
- Lối `PUT /api/v1/company/settings/lead-routing` của hàng 25: vòng không đổi lối ấy; màn «Luật chia lead» không dùng nó.

## Notes

- Lỗi gốc ở `packages/api/src/settings/store.ts` (`writeCompanySettings`); lưới thứ hai ở màn là hàm thuần `ketQuaLuu`
  của `apps/web/src/app/(app)/settings/lead-routing/luat.ts`.
