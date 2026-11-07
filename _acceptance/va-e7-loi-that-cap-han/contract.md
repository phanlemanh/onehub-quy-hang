---
schema_version: 1
feature: "Phép nhìn khung 3 của bài E7 (màn Luật chia lead, cặp hạn hỏng) dựng lỗi bằng phản hồi do máy chủ viết thay cho câu lỗi gõ tay, nên khi chữ lỗi của máy chủ đổi thì phép nhìn đỏ theo."
slug: va-e7-loi-that-cap-han
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: _acceptance/va-e7-loi-that-cap-han/design.md
---

# Acceptance Contract: va-e7-loi-that-cap-han

## Context

Hàng vá dãy D (đợt `dau-khach-nhap`), từ Ngoài-1 của `luat-chia-lead-cap-han-hong` (PR #156). «Phép nhìn E7» =
`_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs` trên chỗ thử dãy D (Postgres 5575/postgres, máy dev 3495). «Chấm E7»
= `_acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs`. Máy chủ tự sửa cặp hạn khi lưu một nửa (06/11), nên «phản hồi do máy
chủ viết» ở khung 3 là thân GET thật lúc cặp hỏng, không phải phản hồi của một lần lưu thật (design.md «Ràng buộc đã kiểm»).

Source input: hàng `va-e7-loi-that-cap-han` (`docs/plan/lo-trinh.json`) · thiết kế `_acceptance/va-e7-loi-that-cap-han/design.md`

## Criteria

- **AC-1** — Câu lỗi đúng thì khung 3 xanh.
  Given cây của vòng và chỗ thử dãy D,
  When chấm E7,
  Then GET thật trả lỗi cặp nêu «lead_routing.first_call_minutes», màn báo «chưa áp» nêu «Hạn gọi lần đầu», không toast «Đã
  lưu»; khung 1 có toast «Đã lưu».

- **AC-2** — Câu lỗi của máy chủ đổi thì khung 3 đỏ.
  Given một bản sao cây mà câu lỗi cặp ở `packages/core/src/config/giai.ts` không còn nêu khoá,
  When chấm E7 với `--doi-cau`,
  Then lệnh đỏ với «khung 3 ĐỎ: …».

- **AC-3** — Không còn phản hồi giả viết tay.
  Given `chay-ui.mjs` của vòng,
  When đọc mã nguồn,
  Then không còn chuỗi lỗi cặp gõ tay (« — cặp về mặc định» trong một mẫu chuỗi) hay biến `__traGia`; thân phản hồi khung 3
  lấy từ GET thật.

## Coverage

Bỏ quét không gian — xem dòng sổ «bỏ coverage-scan». Không gian là câu lỗi (đúng · bỏ khoá) × khung (1 đối chứng · 3): câu đúng
ở AC-1, câu bỏ khoá ở AC-2, nguồn thân khung 3 ở AC-3. Chỗ thử tự nạp căn khi thiếu — xem Notes.

## Out of scope

- Đổi màn Luật chia lead, API hay lõi — vòng chỉ đổi công cụ đo.
- Khung 1, 2 của E7 và các bài khác của `luat-chia-lead-cap-han-hong`.

## Notes

- `dung-d.mjs` của hàng 48 tự nạp một căn Đang bán ở Toà A qua API khi sàn mẫu mất hàng (giám sát duyệt D-30; lần chấm
  08/11 đầu tiên in «đã nạp A-01.01 qua API»). Đây là sửa chỗ thử để E7 chạy được, không phải hành vi câu giao đòi.
- Chấm E7 cần chỗ thử dãy D (5575/postgres, 3495); `--doi-cau` dựng một worktree dưới `.acceptance-runs/` (cài một lần).
