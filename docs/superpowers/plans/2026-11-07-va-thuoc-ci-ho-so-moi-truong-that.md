# Vá thước CI của hai hồ sơ đã ký — kế hoạch

**Goal:** Ba thước đo bước triển khai cũ về đúng bước mới. **Spec:** `docs/superpowers/specs/2026-11-07-va-thuoc-ci-ho-so-moi-truong-that-design.md`.

### Task 1: kiem-ci.mjs của moi-truong-that (E1, E2) — independent: true
Files: `_acceptance/moi-truong-that/thu/kiem-ci.mjs`. Hàm `xet(yml, vercel) → tên vế hỏng`; tám vế; ba đối chứng đỏ in
«ĐỐI CHỨNG». Verify: `node _acceptance/moi-truong-that/thu/kiem-ci.mjs` → «KẾT: ĐẠT», đúng tám dòng «ĐẠT ».

### Task 2: khai thay bởi (E3, E4) — independent: true
Files: `_acceptance/moi-truong-that/evals.yaml` (E3), `_acceptance/bat-rang-buoc-ban-ma/evals.yaml` (E4), bảng thay trong
thiết kế của hai hồ sơ thay, `_acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs` (bộ đọc của kit).
Verify: `node …/kiem-thay.mjs` và `--luoi` → «KẾT: ĐẠT».
