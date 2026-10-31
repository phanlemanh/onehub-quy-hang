---
schema_version: 2
feature_slug: moi-truong-that
verdict: PASS
failed_evals: []
reason:
verified_by: grader subagent (fresh context, verify phase, round 2) — Claude Opus 5.5
enforcement_mode: strict
bypass_used: false
verified_commit: 0422d55bf395ad94fa32bc3b14add3730f26d2a9
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: moi-truong-that

Lượt chấm 2, chạy lại mọi eval từ đầu trên commit 0422d55 (đã gộp main có migration 004; 004 và 005 đã áp lên cơ sở
dữ liệu thật; Kiến trúc §10 và Tham chiếu §12 đã sửa). Chín eval máy E1–E9 đều đạt. E10 (judgment) người chấm riêng
vẫn trả UNCERTAIN; ở T3 mọi mục judgment đều phải có người ký trực tiếp.

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
| E10 | AC-10 | judgment | PASS (human_override) |

## Evidence

- eval: E1
  run_id: moi-truong-that-r2-E1-20261031T012854Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:28:54Z
  output: |
    ĐẠT kết nối tới vùng ap-southeast-1
    sổ migration: 5 tệp; kho: 5; chưa ghi sổ: không
    ...
    KẾT: ĐẠT
    (kiểm thêm ở lượt 1, không đổi: chuỗi kết nối mang mã dự án kcpiamqdangrapfmkiig = SUPABASE_URL của dự án
    quy-hang — không phải one-invest. Script chỉ kiểm vùng trong tên máy chủ.)

- eval: E2
  run_id: moi-truong-that-r2-E2-20261031T012857Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:28:57Z
  output: |
    sổ migration: 5 tệp; kho: 5; chưa ghi sổ: không
    ĐẠT mọi migration của kho đã ghi sổ (005 chờ job deploy)
    ĐẠT hai hàm của luật theo dòng khoá search_path
    ĐẠT companies có đúng một luật đọc (companies_read)
    KẾT: ĐẠT
    (ghi chú người chấm: 001–005 đều đã ghi sổ — mạnh hơn chữ của AC-2 «trừ đúng tệp 005». Nhãn «005 chờ job
    deploy» của script đã cũ; xem Known limits.)

- eval: E3
  run_id: moi-truong-that-r2-E3-20261031T012929Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cach_ly_that
  verified_at: 2026-10-31T01:29:29Z
  output: |
    ✔ cơ sở dữ liệu: không hàm hay trigger nào ghi vào bảng hàng, bảng sự kiện
    ✔ mở sàn: người đầu tiên mang vai quản trị sàn
    ℹ tests 29
    ℹ pass 29
    ℹ fail 0
    (DATABASE_URL trỏ cơ sở dữ liệu Supabase thật; .env.local không có. Đếm dòng mọi bảng public và identity trước
    và sau lượt chạy, chỉ đọc — trùng nhau: companies 1, company_members 1, agreements 0, company_zones 0,
    member_zones 0, listings 0, listing_events 0, schema_migrations 5, identity.user 1, identity.verification 1,
    identity.otp_requests 1, identity.session 0, identity.account 0 — không để lại dòng nào)

- eval: E4
  run_id: moi-truong-that-r2-E4-20261031T012900Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:29:00Z
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
    (kiểm thêm của người chấm: danh sách REST của script viết cứng 6 bảng, thiếu hai bảng mới của 004. Gọi tay
    REST listings và listing_events với khoá công khai: cả hai 401, thân là lỗi 42501, không trả dòng nào. Phần
    kiểm quyền ba vai quét mọi bảng nên đã gồm hai bảng này.)

- eval: E5
  run_id: moi-truong-that-r2-E5-20261031T012902Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.moi_truong_that
  verified_at: 2026-10-31T01:29:02Z
  output: |
    ĐẠT mọi bảng của công ty bật và ép luật theo dòng (7 bảng)
    ĐẠT quy_hang_app không superuser, không bypassrls
    ĐẠT quy_hang_owner không superuser
    ĐẠT chỉ sàn mẫu (1 sàn)
    KẾT: ĐẠT

- eval: E6
  run_id: moi-truong-that-r2-E6-20261031T013000Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T01:30:00Z
  output: |
    ✔ dựng: production thiếu bộ gửi ném lỗi
    ✔ dựng: production có bộ gửi dựng được
    ✔ thư mã: tiêu đề và thân có mã, hạn 5 phút
    ✔ resend: gửi một thư tới đúng người, đúng người gửi, khoá ở header
    ✔ resend: lỗi gửi ném ra, thông báo không chứa mã
    ℹ tests 14
    ℹ pass 14
    ℹ fail 0

- eval: E7
  run_id: moi-truong-that-r2-E7-20261031T013101Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kiem_ci
  verified_at: 2026-10-31T01:31:01Z
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
  run_id: moi-truong-that-r2-E8-20261031T013210Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.suc_khoe_xem_truoc
  verified_at: 2026-10-31T01:32:10Z
  output: |
    Vercel CLI 65.9.0
    ! This request bypasses Deployment Protection, so its response doesn't show whether the URL is public.
    {"ok":true,"service":"quy-hang","apiVersion":"v1","dataClasses":["catalog","shareable_listing","company_internal","custom_field","source","transaction","behavior"]}
    (lệnh `vercel curl … -- -fsS` không in dòng «ĐẠT GET /api/v1/health trả 200» mà `expected` nêu; curl -f chỉ kết
    thúc sạch khi mã HTTP là 2xx, thân trả {"ok":true} — đạt về nội dung. Kiểm thêm bằng `vercel inspect` và API
    deployments, chỉ đọc: dpl_8gWGmU2WT2hEsdFcLnPG1sehFLrk, target preview, READY, githubCommitSha
    0422d55bf395ad94fa32bc3b14add3730f26d2a9 = verified_commit, nhánh claude/moi-truong-that, vùng sin1)

- eval: E9
  run_id: moi-truong-that-r2-E9-20261031T013101Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hooks
  verified_at: 2026-10-31T01:31:01Z
  output: |
    pre-commit
      ĐẠT  chặn commit trên main
      ĐẠT  chặn bí mật đã stage
      ĐẠT  cho commit sạch trên nhánh
    TỔNG: ĐẠT
    (kiểm thêm: job secrets của ci.yml checkout fetch-depth 0 rồi `gitleaks git` — quét toàn lịch sử; chạy
    gitleaks git cục bộ: 166 commits scanned, no leaks found)

- eval: E10
  judged_by: judge-subagent (fresh context, feature-loop:cham-doc, blind — chỉ nhận contract, sáu tệp inputs và câu hỏi)
  verdict: UNCERTAIN
  rationale: Ba chỗ nói cùng một điều và khớp ci.yml, vercel.json, nen-du-an.sql về nơi chạy, vùng, cách áp migration và cách giữ khoá (lượt này §10 và §12 đã nêu bí mật chỉ ở Vercel Sensitive và secret GitHub, khoá số chủ nhà chưa sinh). Riêng giới hạn còn lại thì chưa cùng: Kiến trúc §10 ghi «Còn mở (ADR-0009 Hệ quả):» như danh sách đủ nhưng chỉ kể 3 trong 5 mục của Hệ quả, Tham chiếu §12 cũng kể đúng 3 mục đó; cả hai bỏ «Resend trả 403 tới khi tên miền gửi được xác minh» (nên câu «mã đăng nhập gửi qua Resend» đọc như đã chạy) và «bản xem trước chưa đăng nhập được». Judge cũng nêu ADR dòng 50 «001–005 áp đủ» lệch với chữ AC-2 «005 chưa ghi sổ» — đo lượt này cho thấy ADR đúng với thực tế, chữ của hợp đồng mới là chỗ cũ.
  required_evidence:
    - Bản sửa Kiến trúc §10 (dòng «Còn mở», quanh dòng 214) và Tham chiếu §12 (dòng 31/10, quanh dòng 317) thêm hai mục — thư mã chưa tới hộp thư tới khi Resend xác minh onehub.center, và bản xem trước chưa đăng nhập được — hoặc một dòng của chủ kho trong hồ sơ xác nhận hai danh sách đó cố ý chỉ kể giới hạn hạ tầng.
  human_override: Manh Phan 2026-10-31

## Known limits

- Gửi mã thật qua Resend hiện trả 403: tên miền gửi onehub.center chưa xác minh ở Resend (ngoài phạm vi, OOS-1 —
  việc của chủ kho trên tài khoản Resend). E6 chỉ chứng minh bộ gửi đúng trên bộ gửi giả, không chứng minh thư tới
  hộp thư thật.
- Khi gửi hỏng, người dùng vẫn thấy «đã gửi» — đúng thiết kế (ADR-0005 §4, không để lộ tài khoản nào tồn tại); hỏng
  chỉ thấy được trong nhật ký.
- AC-8 đo trên bản xem trước của commit này; sức khoẻ bản thật sau khi gộp do job deploy kiểm, chưa đo ở lượt này.
- Bản xem trước chưa đăng nhập được (BETTER_AUTH_URL trỏ tên miền chính — ADR-0009 Hệ quả); E8 chỉ đo health.
- AC-2: 004 và 005 đã áp và ghi sổ tay trước khi gộp, nên lần chạy đầu của job deploy sau gộp sẽ không áp migration
  nào mới — đường «CI áp migration lên cơ sở dữ liệu thật» (AC-7) mới được kiểm trên cấu hình (E7), chưa thấy chạy
  thật với một migration chưa áp. Chữ AC-2 «trừ đúng tệp 005» và nhãn «005 chờ job deploy» của script đã cũ; điều
  đo được mạnh hơn (5/5 đã ghi sổ).
- E4: danh sách REST của script viết cứng 6 bảng, không tự gồm bảng mới (listings, listing_events của 004). Lượt này
  người chấm gọi tay hai bảng đó (đều 401); bảng thêm về sau sẽ không được REST-kiểm nếu script không đổi (phần kiểm
  quyền ba vai vẫn quét mọi bảng).

## Ngoài hợp đồng

- Cơ sở dữ liệu thật đang có identity.user 1, identity.verification 1, identity.otp_requests 1 dòng (cùng
  company_members 1) — không đổi từ lượt 1, không do bộ kiểm cách ly để lại; có vẻ là lần thử gửi mã trên bản xem
  trước.
- `.env.example` có giá trị mặc định của máy dev cho DATABASE_URL và BETTER_AUTH_URL (Postgres localhost và URL
  localhost) — có từ trước nhánh này, không phải bí mật thật, nhưng chữ «chỉ có tên biến» của AC-9 không đúng từng chữ.
- AC-1 «không phải dự án one-invest»: script E1 chỉ kiểm vùng trong tên máy chủ; phần «dự án riêng» dựa vào kiểm thêm
  của người chấm (mã dự án trong chuỗi kết nối trùng SUPABASE_URL của quy-hang).

## Analyst

Baseline khong do: lượt chấm độc lập này không chạy làn baseline trên diffBase. E1, E2, E4, E5, E7 trỏ tới script
`_acceptance/moi-truong-that/thu/*.mjs` chưa có ở diffBase (eval mới); E3, E8 đo môi trường thật, không có bản «trước
tính năng»; E6, E9 là bộ test của kho — chưa đo trên diffBase.

Non-discriminating evals: chưa xác định được (baseline n-a). E9 (test:hooks) và phần cũ của E3 nhiều khả năng xanh cả
trên main — đóng vai hàng rào hồi quy.

## Variance

none — không eval nào khai runs > 1.

## Iterations

Round 1 (e8ebe9d): E1–E9 đạt; E10 UNCERTAIN (judge riêng) — Kiến trúc §10 và Tham chiếu §12 không nói về cách giữ
khoá và giới hạn còn lại. T3 chờ người ký mọi mục judgment.
Round 2 (0422d55, sau gộp main có 004, áp 004+005 lên cơ sở dữ liệu thật, sửa hai tài liệu): E1–E9 đạt (cách ly
29/29 trên cơ sở dữ liệu thật, 5/5 migration đã ghi sổ, bản xem trước đúng commit); E10 vẫn UNCERTAIN — cách giữ
khoá nay đã khớp, còn danh sách giới hạn ở §10 và §12 thiếu hai mục của ADR-0009 Hệ quả (Resend 403, bản xem trước
chưa đăng nhập được). T3 chờ người ký.
