---
schema_version: 1
feature: "Quản trị sàn sửa nhãn, mẫu nhập, thuế phí mà không mất việc: «Giữ nhãn» luôn giữ nhãn; xoá hay sửa cột mẫu nhập hỏng thì màn nói rõ và dòng còn; bảng Mẫu nhập trên điện thoại không phải cuộn ngang; ô tỉ lệ môi giới có nhãn cho máy đọc màn"
slug: va-cai-dat-mat-viec
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
design_doc: docs/superpowers/specs/2026-11-09-va-cai-dat-mat-viec-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-11-09T04:24:29Z
---

# Acceptance Contract: va-cai-dat-mat-viec

## Context

Hàng A của `docs/plan/kiem-cai-dat.md`, bốn lỗi L1, L2, L8, L13. Source input: hàng `va-cai-dat-mat-viec` của
`docs/plan/lo-trinh.json` · ô cơ hội đã quyết · thiết kế ở `design_doc`. «Lệnh đo» = `thu/kiem-man.mjs`.

## Criteria

- **AC-1 (cross-layer)** — «Giữ nhãn» giữ nhãn sau một lần chuyển.
  Given một nhóm có hai nhãn riêng đang có căn mang,
  When gỡ nhãn đầu, chọn nhãn thay, bấm «Gỡ và chuyển», gỡ nhãn sau, bấm «Giữ nhãn»,
  Then nhãn sau còn trên màn và Lưu bấm được; bấm Lưu thì nhãn đầu mất, căn của nó sang nhãn thay, nhãn sau và căn của nó giữ nguyên.

- **AC-2** — Huỷ đúng ở mọi lối và mọi lần.
  Given một nhóm có ba nhãn đang có căn mang,
  When gỡ nhãn một và chuyển; gỡ nhãn hai rồi nhấn Esc; gỡ nhãn ba rồi «Giữ nhãn»; gỡ lại nhãn hai,
  Then sau Esc và sau «Giữ nhãn» nhãn đều còn, nhãn một vẫn đang gỡ; lần gỡ lại hộp hỏi mới, chưa chọn sẵn và «Gỡ và chuyển» khoá.

- **AC-3 (cross-layer)** — Đường chuyển không hỏng.
  Given hai nhãn đang có căn mang,
  When gỡ và chuyển cả hai rồi bấm Lưu,
  Then hộp đóng sau mỗi lần chuyển, cả hai nhãn mất, căn của chúng sang nhãn thay đã chọn.

- **AC-4 (cross-layer)** — Xoá hỏng thì nói rõ.
  Given bảng Mẫu nhập có dòng, lời gọi xoá trả 500, đứt mạng hoặc đang treo,
  When bấm Xoá trong hộp xác nhận,
  Then lúc treo hai nút khoá và Esc không đóng hộp; khi hỏng hộp còn mở, có câu lỗi trong hộp, dòng còn; Huỷ rồi mở dòng khác không còn câu cũ; bỏ chặn rồi bấm Xoá thì hộp đóng, dòng mất và máy chủ ghi đã xoá.

- **AC-5** — Hộp xoá nói đúng từng kết quả.
  Given lời gọi xoá trả 204, 403, 404, 400, 500 hoặc đứt mạng,
  When hộp xử lý,
  Then 204 đóng; 403 giữ mở với «Chỉ quản trị sàn xoá được cột đã nhớ»; 404 giữ mở với «Cột này đã bị xoá trước đó» và dòng mất khỏi bảng; còn lại giữ mở với câu thử lại.

- **AC-6 (cross-layer)** — Sửa hỏng thì nói rõ.
  Given lời gọi sửa cột trả 500,
  When bấm Lưu trong hộp sửa,
  Then hộp còn mở, có câu lỗi, tải lại trang thì dòng vẫn như cũ; bỏ chặn thì cùng bản sửa lưu được và máy chủ giữ giá trị mới.

- **AC-7** — Điện thoại không phải cuộn ngang.
  Given bảng có sáu dòng, trong đó một tiêu đề 200 ký tự không dấu cách, khổ 375,
  When mở Mẫu nhập, mở hộp Xoá và hộp Sửa của dòng dài,
  Then khung bảng không tràn, mọi nút Sửa, Xoá nằm trọn trong màn, mỗi dòng đọc được Ghép vào, Quy đổi và Nguồn của chính nó ở dòng phụ; hai hộp không tràn màn và nút của hộp nằm trong màn.

- **AC-8** — Khổ rộng giữ năm cột, khổ vừa không tràn.
  Given cùng dữ liệu, khổ 768, 1024 và 1440,
  When mở Mẫu nhập,
  Then ở 768 hai cột có dòng phụ; ở 1024 và 1440 đủ năm cột, dòng phụ không hiện; cả ba khổ khung bảng không tràn.

- **AC-9** — Ô tỉ lệ có nhãn và vẫn sửa được.
  Given màn Thuế phí, khổ 1440 và 375,
  When chạy axe và gõ một tỉ lệ hợp lệ,
  Then axe không còn lỗi `label`, ô nhập mang tên «Tỉ lệ môi giới (%)», số gõ vào hiện đúng và Lưu bấm được.

- **AC-10** — Nhìn trên màn đúng như lời hứa.
  Given chỗ thử có đủ dữ liệu,
  When nhìn Trạng thái sau khi «Giữ nhãn», hộp xoá lỗi, Mẫu nhập ở 375 và 1440,
  Then màn đúng các trạng thái ở Đặc tả UX, chữ không đè nhau, đủ vỏ.

## Coverage

Trục: màn (Trạng thái · Mẫu nhập · Thuế phí) × lối ra (thành công · huỷ · hỏng) × khổ (375 · 768 · 1024 · 1440). Trạng thái: AC-1, 2 phủ huỷ, AC-3 phủ thành công; lưu hỏng của màn này không đổi ở hàng này. Mẫu nhập: AC-4, 5, 6 phủ hỏng và thành công, AC-4 phủ huỷ sau lỗi. AC-7, 8 phủ khổ; AC-9 phủ Thuế phí. Không gian nhỏ và đóng — xem dòng sổ «bỏ coverage-scan».

## Đường đo

- Bốn điều của ngưỡng ở `opportunity.md`: lệnh đo trên màn thật · AC-1, AC-4, AC-7, AC-9

## Out of scope

- Thống nhất cách lưu, thanh Lưu, số nút Lưu của Trạng thái (hàng `cai-dat-mot-cach-luu`).
- Đổi bảng Mẫu nhập sang khối của kho, lề và khung (hàng `cai-dat-bang-dung-khung`).
- Bảng Từ điển cuộn ngang ở 375 (hàng `cai-dat-bang-dung-khung`).
- Mọi lỗi axe khác nhãn ô nhập.

## Notes
