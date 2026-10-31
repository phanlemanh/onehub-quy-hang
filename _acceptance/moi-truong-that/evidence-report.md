---
schema_version: 2
feature_slug: moi-truong-that
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: grader subagent (fresh context, verify phase) — Claude Opus 5.5
enforcement_mode: strict
bypass_used: false
verified_commit: e8ebe9de0c6aa02f64d0d67c7eaf9dea4b2d0304
human_signoff:
---

# Evidence Report: moi-truong-that

Hợp đồng T3 có một eval judgment (E10): người chấm riêng trả UNCERTAIN, và ở T3 mọi mục judgment đều phải có người
ký trực tiếp. Chín eval máy E1–E9 đều đạt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: moi-truong-that-E1-20261031T012011Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:20:11Z
  output: |
    ĐẠT kết nối tới vùng ap-southeast-1
    sổ migration: 3 tệp; kho: 4; chưa ghi sổ: 005_khoa_ham_va_gop_luat.sql
    ...
    KẾT: ĐẠT
    (kiểm thêm, chỉ đọc, không in bí mật: chuỗi kết nối mang mã dự án kcpiamqdangrapfmkiig = SUPABASE_URL của
    dự án quy-hang, đăng nhập bằng vai quy_hang_owner — không phải dự án one-invest)

- eval: E2
  run_id: moi-truong-that-E2-20261031T012019Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:20:19Z
  output: |
    sổ migration: 3 tệp; kho: 4; chưa ghi sổ: 005_khoa_ham_va_gop_luat.sql
    ĐẠT mọi migration của kho đã ghi sổ (005 chờ job deploy)
    ĐẠT hai hàm của luật theo dòng khoá search_path
    ĐẠT companies có đúng một luật đọc (companies_read)
    KẾT: ĐẠT

- eval: E3
  run_id: moi-truong-that-E3-20261031T012034Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cach_ly_that
  verified_at: 2026-10-31T01:20:34Z
  output: |
    ✔ hai quản trị gỡ nhau cùng lúc: đúng một giao dịch thành công
    ✔ dọn sàn: xoá sàn kéo theo thành viên không bị trigger chặn
    ✔ mở sàn: người đầu tiên mang vai quản trị sàn
    ℹ tests 24
    ℹ pass 24
    ℹ fail 0
    (DATABASE_URL trỏ cơ sở dữ liệu Supabase thật. Đếm dòng sau lượt chạy, chỉ đọc: companies 1, company_members 1,
    agreements 0, company_zones 0, member_zones 0 — trùng «1 sàn» đo ở E1 trước lượt chạy; không còn dòng thử nào)

- eval: E4
  run_id: moi-truong-that-E4-20261031T012021Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:20:21Z
  output: |
    ĐẠT anon, authenticated, service_role không có quyền trên bảng nào
    ĐẠT REST companies bị từ chối với khoá công khai (401)
    ĐẠT REST company_members bị từ chối với khoá công khai (401)
    ĐẠT REST agreements bị từ chối với khoá công khai (401)
    ĐẠT REST company_zones bị từ chối với khoá công khai (401)
    ĐẠT REST member_zones bị từ chối với khoá công khai (401)
    ĐẠT REST schema_migrations bị từ chối với khoá công khai (401)
    ĐẠT GraphQL không lộ bảng nào
    KẾT: ĐẠT

- eval: E5
  run_id: moi-truong-that-E5-20261031T012022Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:20:22Z
  output: |
    ĐẠT mọi bảng của công ty bật và ép luật theo dòng (5 bảng)
    ĐẠT quy_hang_app không superuser, không bypassrls
    ĐẠT quy_hang_owner không superuser
    ĐẠT chỉ sàn mẫu (1 sàn)
    KẾT: ĐẠT

- eval: E6
  run_id: moi-truong-that-E6-20261031T012107Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T01:21:07Z
  output: |
    ✔ dựng: production thiếu bộ gửi ném lỗi
    ✔ dựng: production có bộ gửi dựng được
    ✔ thư mã: tiêu đề và thân có mã, hạn 5 phút
    ✔ resend: gửi một thư tới đúng người, đúng người gửi, khoá ở header
    ✔ resend: lỗi gửi ném ra, thông báo không chứa mã
    ℹ tests 12
    ℹ pass 12
    ℹ fail 0

- eval: E7
  run_id: moi-truong-that-E7-20261031T012215Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kiem_ci
  verified_at: 2026-10-31T01:22:15Z
  output: |
    ĐẠT chỉ chạy khi push main
    ĐẠT chờ check, isolation, secrets, gate
    ĐẠT bí mật ở environment production
    ĐẠT thứ tự: migration → bộ kiểm cách ly → deploy hook
    ĐẠT không chạy test API (ghi dữ liệu) trên cơ sở dữ liệu thật
    ĐẠT deploy không nằm trong ci-ok
    ĐẠT vercel.json tắt tự deploy main
    ĐẠT vercel.json ghim vùng sin1
    KẾT: ĐẠT

- eval: E8
  run_id: moi-truong-that-E8-20261031T012215Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.suc_khoe_xem_truoc
  verified_at: 2026-10-31T01:22:15Z
  output: |
    Vercel CLI 65.9.0
    ! This request bypasses Deployment Protection, so its response doesn't show whether the URL is public.
    {"ok":true,"service":"quy-hang","apiVersion":"v1","dataClasses":["catalog","shareable_listing","company_internal","custom_field","source","transaction","behavior"]}
    (lệnh `vercel curl … -- -fsS` không in dòng «ĐẠT GET /api/v1/health trả 200» mà `expected` nêu; curl -f chỉ
    kết thúc sạch khi mã HTTP là 2xx và thân trả {"ok":true} — đạt về nội dung. Kiểm thêm bằng `vercel inspect`/API,
    chỉ đọc: bản xem trước dpl_55kmViu3PvQhszcKaEagFPgajMEi, target preview, READY, githubCommitSha
    e8ebe9de0c6aa02f64d0d67c7eaf9dea4b2d0304 = commit được chấm, nhánh claude/moi-truong-that, vùng sin1)

- eval: E9
  run_id: moi-truong-that-E9-20261031T012232Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hooks
  verified_at: 2026-10-31T01:22:32Z
  output: |
    pre-commit
      ĐẠT  chặn commit trên main
      ĐẠT  chặn bí mật đã stage
      ĐẠT  cho commit sạch trên nhánh
    TỔNG: ĐẠT
    (kiểm thêm: job secrets của ci.yml checkout fetch-depth 0 rồi `gitleaks git` — quét toàn lịch sử; chạy
    gitleaks git cục bộ trên kho: 155 commits scanned, no leaks found)

- eval: E10
  judged_by: judge-subagent (fresh context, feature-loop:cham-doc, blind — chỉ nhận sáu tệp inputs và câu hỏi)
  verdict: UNCERTAIN
  rationale: Ba tài liệu nói cùng một điều và khớp ci.yml, vercel.json, nen-du-an.sql ở nơi chạy, vùng và cách áp migration; không có chỗ nào mâu thuẫn. Nhưng cách giữ khoá và giới hạn còn lại chỉ ADR-0009 nói (§9, «Hệ quả»); Kiến trúc §10 không nhắc hai chủ đề này, Tham chiếu §12 chỉ nêu «chỉ dữ liệu mẫu tới khi pháp lý rà» — chưa rõ im lặng có tính là «nói cùng một điều» không.
  required_evidence:
    - Kiến trúc §10 (dòng «Nơi chạy») và Tham chiếu §12 (dòng 31/10) nêu hoặc trỏ đích danh mục ADR-0009 về cách giữ khoá (Vercel Sensitive + environment production của GitHub; OWNER_PHONE_KEY chưa sinh) và giới hạn còn lại (bản xem trước chung cơ sở dữ liệu, gói Hobby, bản xem trước chưa đăng nhập được, chưa ghim chứng chỉ) — hoặc chủ kho ghi rõ AC-10 chỉ đòi «không mâu thuẫn».
  human_override:

## Known limits

- Gửi mã thật qua Resend hiện trả 403: tên miền gửi onehub.center chưa xác minh ở Resend (ngoài phạm vi, OOS-1 —
  việc của chủ kho trên tài khoản Resend). Thấy trong nhật ký của bản xem trước. E6 chỉ chứng minh bộ gửi đúng trên
  bộ gửi giả, không chứng minh thư tới hộp thư thật.
- Khi gửi hỏng, người dùng vẫn thấy «đã gửi» — đúng thiết kế (ADR-0005, không để lộ tài khoản nào tồn tại); hỏng chỉ
  thấy được trong nhật ký.
- AC-8 đo trên bản xem trước của commit này; sức khoẻ bản thật sau khi gộp do job deploy kiểm, chưa đo ở lượt này.
- AC-2 đo trước khi gộp: 005 chưa ghi sổ, chỉ kiểm vật của nó có mặt. Ghi sổ 005 xảy ra ở job deploy sau khi gộp.

## Ngoài hợp đồng

- Nhánh đang sau main: main đã gộp PR #20 (loi-hang-va-su-kien, có migration 004 và đổi bộ kiểm cách ly). Thư mục
  migration ở commit này có 001, 002, 003, 005 — chưa có 004. Gộp main vào nhánh sẽ đổi cây (verified_commit lệch)
  → cần chấm lại; và job deploy sau khi gộp sẽ áp cả 004 lẫn 005 lên cơ sở dữ liệu thật — lượt này chưa đo
  trường hợp đó.
- Cơ sở dữ liệu thật đang có identity.verification 1 dòng và identity.otp_requests 1 dòng (cùng identity.user 1,
  company_members 1). Có vẻ là lần thử gửi mã trên bản xem trước, không phải do bộ kiểm cách ly để lại; ghi lại để
  người biết.
- `.env.example` có giá trị mặc định của máy dev (chuỗi Postgres localhost:5544 với mật khẩu docker cục bộ, và
  BETTER_AUTH_URL localhost) — có từ trước nhánh này, không phải bí mật thật, nhưng chữ «chỉ có tên biến» của AC-9
  không đúng từng chữ.
- AC-1 «không phải dự án one-invest»: script E1 chỉ kiểm vùng trong tên máy chủ; phần «dự án riêng» do người chấm
  kiểm thêm (mã dự án trong chuỗi kết nối trùng SUPABASE_URL của quy-hang).

## Analyst

Baseline khong do: lượt chấm độc lập này không chạy làn baseline trên diffBase. E1, E2, E4, E5, E7 trỏ tới script
`_acceptance/moi-truong-that/thu/*.mjs` chưa có ở diffBase (eval mới); E3, E8 đo môi trường thật, không có bản «trước
tính năng»; E6, E9 là bộ test của kho — chưa đo trên diffBase.

Non-discriminating evals: chưa xác định được (baseline n-a). E9 (test:hooks) và phần cũ của E3 nhiều khả năng xanh cả
trên main — đóng vai hàng rào hồi quy.

## Variance

none — không eval nào khai runs > 1.

## Iterations

Round 1: E1–E9 đạt; E10 UNCERTAIN (judge riêng) — T3 chờ người ký mọi mục judgment.
