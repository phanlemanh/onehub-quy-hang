---
slug: va-thuoc-ci-moi-truong-that-ban-that
at: 2026-11-07T11:02:56.294Z
sha: ffa512982e5bff20ae6aa081b30d4dece67280d8
nen: do
cong_cu: xanh
suite: xanh
luoi: do
engine: xanh
---

## Dòng đỏ

- nen luoi: 2 vi pham co san
- VIOLATION [moi-truong-that]: chưa qua phản biện context sạch (gap-probe) — không có gap-probe.md hợp lệ và ledger không có entry descope. Chạy bước S1#7 (phản biện context sạch) để sinh gap-probe.md, HOẶC ghi vào decisions.jsonl một entry {"id":"d-<UTC>-<rand>","type":"descope","stage":"S1","at":"<ISO>","decision":"bỏ gap-probe — <lý do>","impact":"đổi lại không có phản biện context sạch trước duyệt"}
- VIOLATION [moi-truong-that]: evidence is stale — code changed after verify (verified_commit 0422d55bf395ad94fa32bc3b14add3730f26d2a9); re-run verify before merge. Changed:

## Dòng vàng

- không có
