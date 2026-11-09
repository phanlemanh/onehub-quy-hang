---
schema_version: 1
feature: Số điện thoại dính dấu tách trong khoá toà hay UPI bị hàm dựng và khuôn Xác nhận danh mục từ chối; khoá dạng thật của Invest vẫn qua.
slug: va-khuon-doan-sdt-ranh-gioi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: draft
design_doc: docs/superpowers/specs/2026-11-09-va-khuon-doan-sdt-ranh-gioi-design.md
approved_by:
approved_at:
---

# Acceptance Contract: va-khuon-doan-sdt-ranh-gioi

## Context

Ngoài-1 của hàng `va-khuon-xac-nhan-bao-sai-quet-ro-ri` (chủ kho chọn «mở hợp đồng mới» khi ký 09/11). Hạng **T3** (chạm
`packages/connect/**`). Bất biến chạm: (2) thông tin chủ nhà không rời công ty. Chưa có đường chảy thật; Invest chưa ghim
khuôn.

Source input: `docs/plan/lo-trinh.json` hàng cùng tên · `_acceptance/va-khuon-doan-sdt-ranh-gioi/opportunity.md` ·
`_acceptance/va-khuon-xac-nhan-bao-sai-quet-ro-ri/review-findings.md` · ADR-0027.

## Criteria

- AC-1: Given ma trận khoá chứa số điện thoại (7 dấu nối × 5 ranh giới trước × 5 ranh giới sau) và ma trận đối chứng cùng hình
  chỉ có 8 chữ số, When đưa từng khoá qua nút `buildingKey` và `upi` của khuôn, Then khuôn từ chối hết khoá số điện thoại với
  thông điệp dáng số điện thoại ở đúng đường nút, và nhận hết khoá đối chứng; số lần so bằng số viết trước.
- AC-2: Given cùng hai ma trận cấy vào danh mục để qua bước tra, When dựng qua ba hàm với khoá toà và hai hàm với UPI, Then hàm
  dựng từ chối khoá số điện thoại nêu đúng trường với thông điệp dáng số điện thoại, và nhận khoá đối chứng; số lần so bằng số
  viết trước.
- AC-3: Given khoá dạng thật của Invest (ULID có chữ, ULID toàn số, UPI có tỉnh chữ hay tỉnh số) và mọi căn của bộ dữ liệu
  mẫu, When đọc bằng khuôn và dựng qua từng hàm dựng, Then không bị từ chối oan ở cả hai tầng.
- AC-4: Given khoá có dãy số nối bằng dấu tách, When đọc bằng khuôn và dựng bằng hàm dựng, Then có một đoạn đứng riêng đủ 9–11
  chữ số thì bị chặn (`toa-1234-56789`, `toa-1234-5678901`, `12-0900000071`, `toa-123-456789012`), không có đoạn nào như vậy thì
  qua (`toa-1234-5678`, `toa-1234-56789012`); hai tầng cho cùng kết quả.
- AC-5: Given số liền không dấu tách dính chữ (`x0900000071`, `0900000071x`), When đọc bằng khuôn và dựng bằng hàm dựng ở cả hai
  loại khoá, Then vẫn qua — phần dư đã chọn ở hàng trước, ghim để đổi luật sau này phải nói ra.
- AC-6: Given số có dấu tách dính chữ ở đầu hay cuối (6 dấu nối × 2 phía), When đọc bằng khuôn và dựng bằng hàm dựng ở cả hai loại
  khoá, Then bị chặn; số lần so bằng số viết trước.

## Coverage

Quét bằng morphological-scan, dựng trục riêng:

- Trục A — tầng đo: khuôn | hàm dựng [thước CE: SUY-TỪ-REPO `packages/core/src/confirmation/dung.ts`, `packages/connect/src/catalog-confirmation.ts`]
- Trục B — dấu nối trong dãy: không | `.` | `-` | `_` | `:` | lặp | trộn (`/` khoá vốn không nhận) [thước CE: SUY-TỪ-REPO `MAU_MA_TOA`, `MAU_UPI` ở `packages/core/src/confirmation/dang-dong.ts`]
- Trục C — ranh giới hai đầu: đầu hay cuối chuỗi | `-` | `.` | `_` | `:` | dính chữ [thước CE: SUY-TỪ-REPO `_acceptance/va-khuon-xac-nhan-bao-sai-quet-ro-ri/review-findings.md`]
- Trục D — đoạn đứng riêng trong dãy: 8 | 9 | 11 | 12 | có tiền tố số [thước CE: SUY-TỪ-REPO `MAU_DOAN_SDT`]

Core: A×B×C → AC-1, AC-2 · B(không)×C(dính chữ) → AC-5 · B(có dấu)×C(dính chữ) → AC-6 · D → AC-4 · khoá thật không oan → AC-3.
Later: siết khuôn chiều vào. Never: chặn số dính chữ bằng cách cấm 9 số liền — từ chối oan ULID của Invest.

## Đường đo

Ngưỡng của ô là câu «bật khi» của hàng: khoá có dãy số dáng điện thoại dính dấu tách bị từ chối ở cả hàm dựng và khuôn
(AC-1, AC-2); khoá dạng thật vẫn qua (AC-3). Số đo là kết quả eval máy.

## Out of scope

- Siết khuôn chiều vào `catalog-feed.ts` — khuôn v1 đã ghim, ngoài vùng.
- Số liền không dấu tách dính chữ trong khoá (`x0900000071`) — đã chọn giữ ở hàng trước.
- Luật mã người gõ `MAU_DANG_SDT` — không đổi.

## Notes

- Không đổi hình khuôn v1: chỉ thêm giá trị bị từ chối; tệp ví dụ giữ nguyên.
- Câu hỏi Cổng Phạm vi: Hỏi-1 dấu nối ngoài câu giao · Hỏi-2 ranh giới hai đầu · Hỏi-3 đoạn đứng riêng · Hỏi-4 dính chữ mà có dấu tách (thiết kế §5).
