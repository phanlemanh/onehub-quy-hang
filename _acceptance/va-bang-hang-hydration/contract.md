---
schema_version: 1
feature: "Mở Bảng hàng (máy tính và điện thoại) không còn lỗi hydration trên console: lượt dựng đầu trên máy khách giống lượt dựng trên máy chủ, dữ liệu trên máy hiện ngay lượt sau; giao diện và hành vi không đổi."
slug: va-bang-hang-hydration
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-07T22:17:45Z
design_doc: _acceptance/va-bang-hang-hydration/design.md
---

# Acceptance Contract: va-bang-hang-hydration

## Context

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát mở từ yêu cầu L-46. Bảng hàng mở trên bản dev báo «Hydration failed» (bốn
khung ở `_acceptance/mau-bang-hang-va-bai/evidence/E10-console-errors.txt`). «Lỗi hydration» = lỗi console hay ngoại lệ
có chữ «hydrat», «did not match» hay mã React #418/#423/#425. «Đo hydration» = lệnh
`_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`: bản dev, Chrome không đầu, sáu ca — khổ máy tính 1440: mở đầu
(kho trên máy đã xoá), mở lại (kho đã có hàng), mở góc nhìn đã lưu, mở lại khi chặn /api/v1; khổ điện thoại 375: mở đầu,
mở lại. Ở khổ điện thoại bản trước vòng cũng không báo lỗi trên bàn đo — chỗ sửa danh sách thẻ là phòng ngừa cùng gốc,
thước không phân biệt được ở hai ca ấy.

Source input: hàng `va-bang-hang-hydration` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-bang-hang-hydration/design.md`

## Criteria

- **AC-1** — Mở Bảng hàng sạch lỗi hydration.
  Given bản dev của vòng và người mẫu dau-chu-1 có hàng,
  When đo hydration (sáu ca),
  Then cả sáu ca hiện hàng (máy tính: dòng đếm «N / M căn»; điện thoại: có thẻ căn) và có 0 lỗi hydration.

- **AC-2** — Thước phân biệt được bản lỗi (chiều đỏ).
  Given nhánh chính trước vòng (a5682245),
  When đo hydration bằng đúng lệnh của AC-1,
  Then lệnh đỏ với «hydration ĐỎ: <n> lỗi hydration trên Bảng hàng», và mỗi ca khổ máy tính (mở đầu, mở lại, góc nhìn đã
  lưu, mất mạng) có ít nhất 1 lỗi hydration.

- **AC-3** — Dữ liệu trên máy vẫn hiện ngay, không kẹt ở «đang tải».
  Given Bảng hàng trên bản dev của vòng, người mẫu dau-chu-1, kho trên máy đã có hàng,
  When mở lại /inventory khi chặn mọi yêu cầu /api/v1, và (bài nhìn) mở lại ở khổ máy tính rồi điện thoại khi có mạng,
  Then khi mất mạng dòng đếm «N / M căn» hiện trong 5 giây; khi có mạng lưới hay danh sách thẻ hiện hàng với dòng đếm đúng
  số hàng người ấy thấy, không còn khung đang tải.

- **AC-4** — Không đổi chuẩn kho.
  Given cây của vòng,
  When chạy kiểm kiểu, lint (mức nợ giao diện, bài quét khuôn), bộ test web và sàn thiết kế,
  Then tất cả xanh, mức nợ 0/0, khuôn 0 lệch.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là khổ (máy tính · điện thoại) × đường vào (/inventory ·
góc nhìn đã lưu) × lần mở (đầu với kho trống · lại với kho có hàng · lại khi mất mạng) × bản (vòng · trước vòng): sáu ô của
bản vòng ở AC-1 (góc nhìn và mất mạng đo ở khổ máy tính — cùng thành phần BangHang ở cả hai khổ), bản trước vòng ở AC-2
(khổ điện thoại không đỏ trên bản cũ — ghi ở Context); hàng hiện từ kho trên máy ở AC-3; điều không đổi ở AC-4.

## Out of scope

- Lỗi hydration ở màn khác ngoài Bảng hàng và danh sách thẻ (vd chỉ báo đồng bộ, Cần xem) — chưa thấy khung lỗi nào.
- Đổi bộ đồng bộ (`lib/sync`) hay cách nạp kho trên máy.

## Notes

- Đo hydration cần Postgres dãy D (container `quy-hang-db-dkn-D`, 5575/e11) và cổng 3585; lệnh tự nạp dữ liệu và giữ khoá
  đo chung của dãy D.
- Ngoài-1 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Nếu còn một máy chủ cũ đang chạy, công cụ kiểm có thể báo sạch hoặc đỏ cho một bản mã mà nó không hề đo. Người dùng cuối không bị ảnh hưởng, chỉ kết quả nghiệm thu có thể sai trong tình huống hiếm này. — `_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`
- Ngoài-2 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Khi phiên đăng nhập mẫu đã hết hạn, công cụ kiểm báo lỗi chung chung và giấu nguyên nhân thật, đồng thời tốn một lượt xin mã đăng nhập. Người dùng cuối không bị ảnh hưởng. — `_acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs`
- Ngoài-4 (máy định tuyến 2026-11-07, đề xuất S4 known-limits): Ở khổ điện thoại, việc kiểm không chứng minh được rằng chỗ sửa danh sách thẻ có tác dụng, vì bản cũ cũng không báo lỗi ở đó. Nếu chỗ sửa này bị gỡ sau này, việc kiểm vẫn xanh. — `_acceptance/va-bang-hang-hydration/evals.yaml`
