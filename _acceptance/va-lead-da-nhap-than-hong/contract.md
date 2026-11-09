---
schema_version: 1
feature: "Lead đã nhập báo lỗi có nút Thử lại khi máy chủ trả nội dung hỏng, không treo mãi ở khung chờ"
slug: va-lead-da-nhap-than-hong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: _acceptance/va-lead-da-nhap-than-hong/design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-09T13:57:58Z
---

# Acceptance Contract: va-lead-da-nhap-than-hong

## Context

Ngoài-3 của `hom-nay-chiu-loi-tung-phan`, chủ kho chọn mở hợp đồng mới (09/11). Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.

## Criteria

- **AC-1 — Nội dung không đọc được thì báo.** Given telesales mở Lead đã nhập · When lời đọc danh sách trả 200 mà thân không phải JSON · Then hết khung chờ, có đúng một khối báo lỗi và một «Thử lại».
- **AC-2 — JSON sai khuôn thì báo, màn không vỡ.** Given telesales mở Lead đã nhập · When lời đọc trả 200 với JSON không phải danh sách, hay danh sách có phần tử không phải một lead · Then có đúng một khối báo lỗi và một «Thử lại», trang không vỡ.
- **AC-3 — Có lối ra.** Given màn đang báo lỗi vì nội dung hỏng · When bấm «Thử lại» lúc máy chủ trả đúng, hay mạng trở lại lúc máy chủ trả đúng · Then danh sách hiện, khối báo lỗi hết. Bấm «Thử lại» hay mạng trở lại mà nội dung vẫn hỏng thì màn về khối báo lỗi, không đứng ở khung chờ.
- **AC-4 — Phản hồi đúng giữ nguyên.** Given lời đọc trả 200 với danh sách có lead, danh sách rỗng, trả mã lỗi, hay lời gọi không tới máy chủ · When mở màn · Then lần lượt hiện danh sách, «Chưa có lead nào», khối báo lỗi có «Thử lại», khối báo lỗi có «Thử lại»; khuôn và sàn thiết kế sạch.

## Coverage

Quét độ phủ làm ngay trong hợp đồng, một trục vì lời đọc có một đầu vào:

- Trục **phản hồi của lời đọc** — 200 thân hỏng (AC-1) | 200 JSON không phải danh sách, danh sách có phần tử sai khuôn (AC-2) | 200 danh sách có lead, 200 rỗng, mã lỗi, mất mạng (AC-4) | sau khi hỏng: bấm «Thử lại», mạng trở lại (AC-3) [thước CE: mọi nhánh kết quả của một lời fetch JSON]

## Đường đo

- Ngưỡng của ô cơ hội ↔ AC-1 và AC-3: bài nhìn màn giả 200 nội dung hỏng rồi bấm «Thử lại»; số từ E1b, E3b.

## Out of scope

- Tự thử lại sau 2 giây ở màn này — câu giao chỉ đòi báo và có «Thử lại».
- Nội dung hỏng ở nút «Sửa số và gửi lại» — đường ghi, không thuộc lỗi treo khung chờ của danh sách.

## Notes

- Bất biến chạm: không lối đọc mới, không chạm trang khách.
