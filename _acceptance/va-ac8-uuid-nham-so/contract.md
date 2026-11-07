---
schema_version: 1
feature: "Bài kiểm «AC-8 không dữ liệu thật» của bộ dữ liệu mẫu thấp tầng không còn đỏ chập chờn: phép dò số điện thoại gỡ các đoạn được phép (UUID, ngày, mốc giờ) trước khi dò, nên không bắt dãy chữ số nằm trong UUID ngẫu nhiên; một số điện thoại thật cài vào bộ mẫu vẫn bị bắt."
slug: va-ac8-uuid-nham-so
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [db]
status: approved
design_doc: _acceptance/va-ac8-uuid-nham-so/design.md
approved_by: Manh Phan
approved_at: 2026-11-07
---

# Acceptance Contract: va-ac8-uuid-nham-so

## Context

Hàng vá dãy D (đợt `dau-khach-nhap`), giám sát xếp làm trước (D-24). Bài AC-8 của
`packages/db/tests/du-lieu-mau-thap-tang.test.mjs` đỏ ngẫu nhiên khi một UUID của dòng cơ sở dữ liệu chứa dãy chữ số giống
số điện thoại, làm đỏ check `isolation` của mọi PR. Vòng chỉ sửa phép dò số trong tệp kiểm ấy. «Số điện thoại thật» = số
không theo dạng mẫu `0900 000 0xx`.

Source input: hàng `va-ac8-uuid-nham-so` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-ac8-uuid-nham-so/design.md`

## Criteria

- **AC-1** — AC-8 không còn đỏ oan với UUID ngẫu nhiên.
  Given một cơ sở dữ liệu đã migrate,
  When chạy ca AC-8 cần cơ sở dữ liệu 25 lần liền, mỗi lần các dòng nạp mang UUID mới,
  Then cả 25 lần đều xanh và ca ấy thật sự chạy (không bị bỏ qua) cả 25 lần.

- **AC-2** — UUID có dãy giống số điện thoại không bị nhận là số.
  Given sáu chuỗi viết trước: UUID của sự cố 06/11 (`14a1928b-9906-4b2b-af5e-03408001142f`) viết thường và viết hoa, UUID
  nhiều đoạn mở bằng 0, UUID toàn số 0, câu có số mẫu đúng dạng, một mốc giờ ISO,
  When chạy phép dò số của AC-8 trên từng chuỗi,
  Then không chuỗi nào bị báo «số không đúng dạng mẫu», và số mẫu đúng dạng được đếm là một số.

- **AC-3** — Số điện thoại thật vẫn bị bắt.
  Given sáu chuỗi viết trước có số thật («Gọi 0912 345 678», «+84 912 345 678», «liên hệ 0912345678.», «id 03408001142 x»,
  «0912-345-678», «SĐT0912345678»),
  và hai phép phá thử sẵn có của AC-8 cài số thật vào bộ mẫu,
  When chạy phép dò số và chạy AC-8,
  Then mỗi chuỗi bị báo «số không đúng dạng mẫu» và cả hai phép phá thử vẫn đỏ đúng thông điệp ấy.

- **AC-4** — Bản cũ đỏ ở chính phép thử mới (chiều đỏ).
  Given bản tệp kiểm của nhánh chính trước vòng, ghép thêm ma trận và ca «AC-8 dò số» của vòng,
  When chạy ca ấy,
  Then nó đỏ với «nhận nhầm số trong «14a1928b-9906-4b2b-af5e-03408001142f»».

- **AC-5** — Không đổi bộ dữ liệu mẫu và luật nhãn mẫu.
  Given nhánh chính trước vòng (`a4122e9e`),
  When so cây của vòng với nó,
  Then thư mục `packages/db/seed/` không đổi tệp nào, và khai báo `SO_MAU`, `CHO_PHEP` trong tệp kiểm giữ nguyên.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là loại chuỗi (UUID có dãy giống số · số mẫu đúng dạng ·
mốc giờ · số thật các dạng: cách, quốc tế, liền, gạch ngang, dính chữ · dãy số đứng riêng) × bản phép dò (sửa · cũ): mọi
loại chuỗi nằm trong ma trận viết trước của AC-2/AC-3 (kích thước ghim 6 + 6); bản sửa đo ở AC-1/AC-2/AC-3, bản cũ ở AC-4;
điều không đổi ở AC-5.

## Out of scope

- Bộ dữ liệu mẫu, `SO_MAU`, `CHO_PHEP` và luật nhãn mẫu — không đổi.
- Các tệp kiểm khác trong `packages/db/tests/`.

## Notes

- Mọi phép đo cần cơ sở dữ liệu chạy trên cơ sở dữ liệu tạm tạo rồi xoá trong lượt (Postgres của `DATABASE_URL`, mặc định
  dãy D cổng 5575). Bài đo từ chối máy chủ không phải máy cục bộ.
