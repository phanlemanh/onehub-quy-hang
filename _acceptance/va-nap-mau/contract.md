---
schema_version: 1
feature: Nút «Nạp dữ liệu mẫu» chạy được trên bản thật và không mở đường chèn lệnh qua ô email; bộ nạp của gói db được kiểm kiểu; lệnh chấm bộ dữ liệu mẫu hàng 5 chạy lại được
slug: va-nap-mau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci, db]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-va-nap-mau-design.md
---

# Acceptance Contract: va-nap-mau

## Context

Hàng `va-nap-mau` (dãy D, ưu tiên 0), gộp bốn mục chủ kho tách ra khi ký hàng 87 `nap-mau-ban-that` (Ngoài-1, 2, 3)
cùng lệnh chấm hàng 5 gãy từ hàng 10 — giám sát D-18. Hạng **T3** (chạm `.github/workflows/**`, `packages/db/**`).
Bất biến chạm: không bất biến dữ liệu nào; rào bí mật của bản thật (`PROD_DATABASE_URL`, `OWNER_PHONE_KEY`).

Source input: `docs/plan/lo-trinh.json` hàng va-nap-mau · `_acceptance/nap-mau-ban-that/review-findings.md` Ngoài-1..3
· thiết kế `docs/superpowers/specs/2026-11-01-va-nap-mau-design.md`

## Criteria

- AC-1: Given tệp `nap-mau.yml`, When dựng môi trường của bước `npm ci` (môi trường job cộng môi trường bước) và hỏi npm
  `npm config get omit` dưới môi trường ấy, Then kết quả không chứa `dev` (tsx được cài); bước «Chạy bộ nạp» vẫn có
  `NODE_ENV=production`. Cùng phép đo trên bản sao tệp đặt `NODE_ENV: production` ở cấp job thì ra `dev`.
- AC-2: Given bước «Kiểm và che email» chạy bằng bash với `viec = nap` và tệp sự kiện giả, When email là một địa chỉ hợp
  lệ, Then bước thoát 0 và in `::add-mask::<email>`; When email chứa ký tự xuống dòng kèm `NODE_OPTIONS=…`, ký tự điều
  khiển, khoảng trắng, chuỗi `%0A`, hay rỗng, Then bước thoát khác 0 và không in `::add-mask::`; với `viec = go` thì email
  rỗng hay rác vẫn thoát 0 (gỡ không cần email); trong mọi ca tệp `GITHUB_ENV` và `GITHUB_OUTPUT` giả không đổi một byte.
- AC-3: Given tệp `nap-mau.yml`, When đọc mọi bước, Then không bước nào ghi vào `$GITHUB_ENV` hay `$GITHUB_OUTPUT`, email
  không nằm trong `env` của job hay của bước nào, và bước «Chạy bộ nạp» đọc email từ `$GITHUB_EVENT_PATH`; không dòng
  `run` nào chèn `${{ … }}`.
- AC-4: Given bộ nạp, When gọi với email chứa bất kỳ ký tự điều khiển nào (gồm xuống dòng, `\r`, `\x00`, `\x7f`, tab) hay
  dấu tách dòng Unicode, Then từ chối với thông điệp «email chủ kho sai dạng» và không dòng nào của cơ sở dữ liệu đổi;
  email hợp lệ vẫn nhận.
- AC-5: Given bước «Chỉ nhánh main» và bước «Xác nhận gỡ» chạy bằng bash, When `GITHUB_REF` là `refs/heads/main` / nhánh
  khác, và `XAC_NHAN` là đúng `[Mẫu] Sàn thử` / chữ khác, Then thoát 0 với ca đúng và khác 0 với ca sai (đo chiều, không
  dò chuỗi).
- AC-6: Given gói db có `tsconfig.json` và script `typecheck`, When chạy `npm run typecheck` ở gốc kho (lệnh của job
  `check` trong CI), Then `tsc` kiểm `packages/db/seed/nap-ban-that.ts` và `nap-ban-that.test.ts` và xanh; một tệp
  TypeScript có lỗi kiểu đặt trong `packages/db/seed/` làm chính lệnh ấy đỏ, thông điệp nêu tên tệp.
- AC-7: Given lệnh chấm `executors.script.du_lieu_mau`, When chạy, Then mọi ca của bộ dữ liệu mẫu hàng 5 xanh.
- AC-8: Given mọi thay đổi trên, When chạy bộ kiểm bộ nạp hàng 87, bộ kiểm cách ly và các bộ hồi quy của kho, Then xanh.

## Coverage

Quét theo khuôn risk-premortem cho thực thể «một lần bấm nút trên bản thật», làm tại chỗ trên bốn mục đã nêu.

- Trục cài đặt: devDependencies dưới chế độ thật (AC-1)
- Trục input email: hợp lệ | xuống dòng chèn biến | ký tự điều khiển | khoảng trắng | rỗng (AC-2, AC-4) [thước CE:
  tài liệu GitHub «workflow commands — environment files», chèn qua ký tự xuống dòng]
- Trục kênh lộ input: env của job, env của bước, `GITHUB_ENV`, `GITHUB_OUTPUT`, chèn `${{ }}` vào lệnh (AC-3)
- Trục rào: nhánh, xác nhận gỡ (AC-5)
- Trục lưới kho: kiểm kiểu gói db (AC-6), lệnh chấm hàng 5 (AC-7), hồi quy (AC-8)
- Later: chạy thật nút trên bản thật (sau khi chủ kho đặt secret).
- Never: input thô vào tệp môi trường của job.

## Out of scope

- Ba giới hạn đo của hàng 87 mà chủ kho ghi Known limits (Ngoài-4, 6, 7).
- Đặt secret `OWNER_PHONE_KEY`, giới hạn environment, bấm nút trên bản thật — việc của chủ kho.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Dãy D chạy Postgres 5565 (`quy-hang-db-D`).
- AC-1 theo khuyến nghị Hỏi-1, AC-7 theo khuyến nghị Hỏi-2; chủ kho chọn lối khác thì đổi cách làm, không đổi tiêu chí.
- AC-5 đóng giới hạn Ngoài-5 của hàng 87 như một hệ quả của việc chạy thật các bước.
- Xin chạm `_acceptance/config.yaml` (một dòng `du_lieu_mau`).
