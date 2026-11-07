---
schema_version: 1
feature: Cách gọi riêng chặn tên riêng của một giá trị trùng tên đang hiện (riêng hay mặc định) của giá trị khác cùng tập đóng, ở máy chủ và ngay ở ô đang sửa
slug: chan-trung-ten-gia-tri
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-07-chan-trung-ten-gia-tri-design.md
approved_by:
approved_at:
---

# Acceptance Contract: chan-trung-ten-gia-tri

## Context

Ngoài-1 và Ngoài-3 của hàng 45 `cach-goi-rieng`: kiểm trùng tên giá trị riêng chỉ so các tên riêng với nhau, bỏ sót tên
mặc định của giá trị anh em chưa đổi — hai lựa chọn khác nghĩa có thể hiện cùng một chữ trên bảng hàng, ô lọc và trang
khách. Chủ kho chọn «mở hợp đồng mới» (Cổng Bằng chứng 05/11), Cổng Đáng build (07/11). Thiết kế: design doc ở
frontmatter.

## Acceptance Criteria

- **AC-1** Given sàn A, giá trị `included` của «Điều kiện phí» chưa đặt tên riêng (đang hiện «Bao phí»)
  When quản trị lưu tên riêng «Bao phí» cho `excluded`
  Then máy chủ trả 400, lý do nêu chữ «Bao phí» trùng tên đang hiện của giá trị kia; không khoá nhãn nào của sàn đổi
  (nguyên khối). Cùng luật cho mọi cặp giá trị của mọi tập đóng (`feeInclusion`, `withdrawnReason`).
- **AC-2** Given hai giá trị cùng tập
  When quản trị gửi hai tên riêng cùng chữ cho chúng
  Then máy chủ trả 400 như AC-1 (luật cũ giữ nguyên).
- **AC-3** Given tên trùng chỉ khác hoa thường hay dấu cách thừa (vd «bao   PHÍ»)
  When lưu
  Then bị chặn như trùng hẳn.
- **AC-4** Given bộ tên không trùng
  When lưu — kể cả gõ đúng tên mặc định của chính giá trị ấy, hay đổi chéo tên hai giá trị
  Then lưu được như cũ (200), bảng đọc lại đúng tên đã lưu; gõ đúng tên mặc định của chính nó vẫn là dùng mặc định.
- **AC-5** Given chữ trùng giữa hai tập khác nhau (một giá trị «Lý do ngừng» lấy tên «Bao phí»)
  When lưu
  Then lưu được — chặn chỉ trong cùng tập.
- **AC-6** Given quản trị trên màn Cách gọi
  When gõ vào ô giá trị một chữ trùng tên đang hiện của giá trị khác cùng tập
  Then chính ô đó hiện câu lỗi nêu giá trị kia và nút «Lưu» khoá; sửa hết trùng thì câu lỗi mất và «Lưu» mở. Hai ô có
  chữ trùng nhau thì cả hai hiện lỗi; ô trống không hiện lỗi.
- **AC-7** Given màn và máy chủ
  When cùng một bộ tên
  Then màn khoá «Lưu» đúng khi và chỉ khi máy chủ từ chối vì trùng — cả hai gọi chung một hàm lõi.
- **AC-8** Given tên trường và nhãn trạng thái
  When lưu như trước
  Then hành vi không đổi (bộ kiểm cũ của Cách gọi và Trạng thái vẫn xanh).

## Coverage

Bỏ quét bằng skill — không gian nhỏ, kê tay (sổ: dòng «bỏ coverage-scan»). Trục:
- Tập: `feeInclusion` (2 giá trị) · `withdrawnReason` (3 giá trị) → ma trận đủ cặp ở E1 (AC-1).
- Kiểu trùng: riêng–mặc định anh em (AC-1) · riêng–riêng (AC-2) · khác hoa thường/dấu cách (AC-3) · khác tập (AC-5).
- Đối chứng: không trùng · đúng mặc định của chính nó · đổi chéo (AC-4).
- Lớp: lõi (E1) · API trên Postgres (E2) · màn thuần (E3) · màn chạy thật (E4) · đồng luật màn–máy chủ (E5).

## Out of scope

- Tên trường trùng nhau (hai cột cùng tên) — câu giao chỉ nói giá trị.
- Nhãn trạng thái — hàng 46 đã có kiểm trùng riêng.
- Tự sửa dữ liệu đã lưu trùng từ trước: màn hiện lỗi ở ô khi mở; lượt lưu kế bị chặn tới khi quản trị sửa.
- Tên đổi chéo gây hiểu nhầm (A lấy tên mặc định của B và ngược lại) — không phải hai lựa chọn cùng chữ.

## Notes

- Hàm lõi mới ở `packages/core/src/labels/index.ts`; màn ở `apps/web/src/app/(app)/settings/labels/`.
- Bài kiểm API trên Postgres dãy B (cổng 5572); dữ liệu thử «[Tên]», `0900 000 0xx`.
