---
schema_version: 1
feature: "Bài «AC-9 nạp và xoá một lần» của bộ dữ liệu mẫu thấp tầng chỉ đếm những dòng do chính bài nạp, nên chạy được trên cơ sở dữ liệu đã có sàn mẫu khác (như trên bản thật); bước triển khai trên nhánh chính xanh lại."
slug: va-ac9-mau-co-san
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [db]
status: signed-off
design_doc: _acceptance/va-ac9-mau-co-san/design.md
approved_by: Manh Phan
approved_at: 2026-11-06
---

# Acceptance Contract: va-ac9-mau-co-san

## Context

Hàng vá khẩn dãy D (đợt `dau-khach-nhap`), chủ kho mở 06/11, giám sát trả D-22. Job deploy trên nhánh chính chạy
`npm run test:isolation -w @quy-hang/db` trên cơ sở dữ liệu bản thật; ca AC-9 của
`packages/db/tests/du-lieu-mau-thap-tang.test.mjs` đỏ «còn dòng mẫu sau xoá» (thực 1, kỳ vọng 0) vì nó đếm mọi sàn
`[Mẫu] Sàn…` và mọi người miền mẫu trong cơ sở dữ liệu, kể cả dữ liệu có sẵn bài không nạp. Vòng chỉ sửa tệp kiểm ấy.
«Dữ liệu có sẵn» = mọi dòng trong cơ sở dữ liệu trước lượt chạy, mang nhãn mẫu hay không. «Sàn mẫu khác» = sàn có tên
bắt đầu `[Mẫu] Sàn` mà không đúng tên `[Mẫu] Sàn thử`.

Source input: hàng `va-ac9-mau-co-san` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-ac9-mau-co-san/design.md`

## Criteria

- **AC-1** — Cơ sở dữ liệu có sẵn sàn mẫu khác thì cả tệp kiểm dữ liệu mẫu thấp tầng xanh.
  Given một cơ sở dữ liệu đã migrate, có sẵn — dựng bằng chính bộ ghi của kho — sàn `[Mẫu] Sàn thử` của bộ nạp mẫu,
  sàn `[Mẫu] Sàn trình diễn` mở bằng lệnh mở sàn với quản trị miền mẫu, và sàn không nhãn `[Tên sàn] có sẵn`,
  When chạy `node --test packages/db/tests/du-lieu-mau-thap-tang.test.mjs`, rồi chạy đúng lệnh của job deploy
  (`npm run test:isolation -w @quy-hang/db`), với `DATABASE_URL` trỏ cơ sở dữ liệu ấy,
  Then cả hai lệnh thoát 0 và ca AC-9 được chạy và đạt (không bị bỏ qua).

- **AC-2** — Lượt chạy không đổi dữ liệu có sẵn.
  Given cơ sở dữ liệu của AC-1,
  When lượt chạy của AC-1 xong,
  Then mọi dòng của `companies`, `identity."user"` và `company_members` giống hệt trước lượt chạy — kể cả ba sàn và
  người đã cấy.

- **AC-3** — Phép đếm vẫn bắt dòng bài nạp mà xoá sót và sàn mẫu thứ hai, trên cơ sở dữ liệu có sàn mẫu khác.
  Given cơ sở dữ liệu của AC-1, hoặc cơ sở dữ liệu chỉ có sẵn sàn `[Mẫu] Sàn thử (bản cũ)`,
  When ca AC-9 chạy hai phép phá thử của nó (xoá thiếu một câu; nạp thêm một sàn mẫu tên khác), và khi mỗi phép đếm
  theo tập mốc bị vô hiệu (luôn trả 0),
  Then với phép đếm lành, mỗi phá thử đỏ đúng thông điệp của nó và tệp xanh; với phép đếm bị vô hiệu, tệp đỏ ở đúng
  lời khẳng định của phá thử tương ứng («còn dòng mẫu sau xoá» trên cơ sở dữ liệu của AC-1, «hai sàn mẫu» trên cơ sở
  dữ liệu chỉ có `[Mẫu] Sàn thử (bản cũ)`).

- **AC-4** — Cơ sở dữ liệu sạch chạy như trước.
  Given một cơ sở dữ liệu vừa migrate, không có dữ liệu nào,
  When chạy cả tệp kiểm, rồi chạy bộ kiểm cách ly của kho (`npm run db:test`),
  Then cả hai thoát 0.

- **AC-5** — Bản kiểm cũ đỏ trên cơ sở dữ liệu có sàn mẫu khác (chiều đỏ của AC-1).
  Given bản `du-lieu-mau-thap-tang.test.mjs` của nhánh chính trước vòng và cơ sở dữ liệu của AC-1,
  When chạy bản cũ,
  Then lệnh thoát khác 0 với thông điệp «còn dòng mẫu sau xoá», ở cả cơ sở dữ liệu của AC-1 lẫn cơ sở dữ liệu chỉ có
  `[Mẫu] Sàn thử (bản cũ)`; cùng bản cũ trên cơ sở dữ liệu sạch thì xanh.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian của vòng là hai trục đã liệt trọn: trạng thái cơ sở
dữ liệu trước lượt chạy (sạch · có sàn mẫu khác cùng `[Mẫu] Sàn thử` của bộ nạp và sàn không nhãn · chỉ có sàn
`[Mẫu] Sàn thử (bản cũ)` trùng tiền tố) × bản tệp kiểm (sửa · cũ) — sáu ô, đo đủ sáu. Ô sửa × sạch là AC-4; sửa × có
sàn khác là AC-1, AC-2, AC-3; sửa × trùng tiền tố là AC-3; cũ × có sàn khác và cũ × trùng tiền tố là AC-5; cũ × sạch
là đối chứng của AC-5. Lệnh của job deploy chạy trên ô sửa × có sàn khác (AC-1).

## Đường đo

- Thước sống của ô cơ hội — job deploy trên nhánh chính xanh ở lần gộp đầu sau hàng này: số lấy từ lượt chạy job
  `deploy` của commit gộp (`gh run list --branch main --workflow ci.yml`). Không đo được trước khi gộp; AC-1 bảo đảm
  điều kiện cần (cơ sở dữ liệu có sàn mẫu khác thì tệp xanh), giám sát đọc lượt deploy sau khi gộp.

## Out of scope

- Bước deploy chạy bộ kiểm trên cơ sở dữ liệu bản thật — giữ nguyên; tách tệp dữ liệu mẫu khỏi lệnh chạy trên bản
  thật là câu hỏi riêng.
- `CAU_XOA`, `xoaMau`, bộ nạp mẫu và bộ nạp thấp tầng — không đổi.
- Sàn mẫu có sẵn trên bản thật — không dọn, không đổi.
- Lỗi mã UUID ở cùng tệp — hàng `va-ac8-uuid-nham-so`, chạy sau.

## Notes

- Mọi phép đo chạy trên cơ sở dữ liệu tạm tạo và xoá trong lượt (Postgres chỉ qua `DATABASE_URL`, mặc định Postgres
  dãy D cổng 5575); không chạm cơ sở dữ liệu bản thật.
