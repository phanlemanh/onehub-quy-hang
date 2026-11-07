---
schema_version: 1
feature: "Nút chạy tay trên GitHub ghim lại một hồ sơ nghiệm thu cần biến của bản thật: lấy bí mật từ environment production, chạy làn ghim lại cho đúng một hồ sơ trong danh sách cố định trên nhánh của PR, trả dòng ghim lại ra tệp đính kèm; không bí mật nào rời GitHub, không bộ kiểm ghi nào chạy trên bản thật."
slug: ghim-lai-ban-that-qua-ci
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci, config]
status: implemented
design_doc: docs/superpowers/specs/2026-11-07-ghim-lai-ban-that-qua-ci-design.md
approved_by: Manh Phan
approved_at: 2026-11-07
---

# Acceptance Contract: ghim-lai-ban-that-qua-ci

## Context

Chủ kho «Mở hàng nút CI» 07/11 để gỡ PR #192 (ghim lại moi-truong-that cần bí mật bản thật, máy không đọc được, chủ kho không
phải developer). T3: chạm `.github/workflows/` và `_acceptance/config.yaml`. Không chạm bất biến sản phẩm; chạm rào phát
hành (bí mật bản thật).

Source input: hàng `ghim-lai-ban-that-qua-ci` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Luồng có đủ mười hai vế gác.
  Given `.github/workflows/ghim-lai-ban-that.yml`,
  When đọc luồng,
  Then chỉ chạy bằng tay · hồ sơ chọn từ danh sách cố định · quyền chỉ đọc kho · environment production · chỉ chạy từ main,
  không ghim chính main · gác lấy từ main (bộ chặn và bộ quét chạy từ bản checkout main, mã hồ sơ từ bản checkout nhánh) ·
  bộ chặn chạy trước bước ghim lại, đọc cây nhánh PR · bí mật chỉ ở bước ghim lại và bước quét · bước ghim lại chạy làn của
  kit trên cây nhánh, không gọi bộ kiểm ghi · quét bí mật trước khi tải, chỉ tải khi quét sạch · dòng ghim lại ra tệp đính
  kèm cả khi làn đỏ · cùng `KIT_TAG` với CI.

- **AC-2** — Mỗi vế gác đỏ khi bị phá.
  Given mười hai bản sao của luồng, mỗi bản phá đúng một vế,
  When đọc từng bản sao,
  Then đúng vế bị phá hỏng, mười một vế còn lại vẫn đạt; luồng không sửa thì mười hai vế đạt.

- **AC-3** — Bộ chặn từ chối hồ sơ còn eval chạy bộ kiểm ghi.
  Given bản sao rút từ `_acceptance/config.yaml` và `_acceptance/moi-truong-that/evals.yaml` thật,
  When chạy `.github/scripts/chan-ghim-ban-that.mjs moi-truong-that`,
  Then E3 khai không chạy → thoát 0 «CHO CHẠY»; E3 còn chạy `cach_ly_that` → thoát 1 gọi tên E3 và lệnh; khoá để trống
  thiếu `DATABASE_URL` → thoát 1; eval trỏ khoá không có → thoát 1 gọi tên eval.

- **AC-4** — Bộ kiểm chung của làn ghim lại không thấy chuỗi kết nối.
  Given kho git tạm mang khoá `repin_ci_blank_env` của kho, một bộ kiểm chung chỉ xanh khi `DATABASE_URL` trống và một eval
  chỉ xanh khi nó có,
  When chạy `repin-lane.mjs` của kit với `DATABASE_URL` đặt,
  Then bộ kiểm chung thoát 0, eval thoát 0, làn xanh; gỡ khoá thì bộ kiểm chung thoát 1 và làn đỏ.

- **AC-5** — Tệp đính kèm không mang chuỗi kết nối.
  Given `.github/scripts/quet-bi-mat.mjs` với `BI_MAT` là một chuỗi kết nối giả,
  When quét tệp nhật ký sạch, tệp mang nguyên chuỗi kết nối, và tệp chỉ mang mật khẩu,
  Then sạch → thoát 0 «SẠCH»; hai ca kia → thoát 1 «CHẶN tệp mang bí mật»; không ca nào in giá trị bí mật.

## Coverage

Trục: vật {luồng, bộ chặn, bộ quét, khoá config} × chiều {xanh trên vật lành, đỏ khi phá}. Luồng: mười hai vế × một ca phá mỗi
vế. Bộ quét: ba ca. Bộ
chặn: bốn ca rút từ hồ sơ thật. Khoá: một kho tạm hai chiều. Thước CE: luồng `nap-mau.yml` (tiền lệ chạy tay với bí mật bản
thật), job `deploy` của `ci.yml`.

## Đường đo

- Ngưỡng «không bí mật nào rời GitHub» → AC-5 (bộ quét) và vế «chỉ tải khi quét sạch» của AC-1. Ngưỡng còn lại → lượt bấm đầu tiên cho moi-truong-that sau khi hàng gộp: tệp đính kèm có dòng `kind: repin` (không
  `repin-do`), PR #192 hết «bằng chứng cũ» và gộp. Không phải AC máy trước gộp: `workflow_dispatch` chỉ chạy được khi luồng
  đã ở nhánh main. Timebox đề xuất: 1 ngày sau gộp.

## Out of scope

- Bật «Required reviewers» cho environment production — cài đặt của chủ kho trên GitHub.
- Thêm hồ sơ khác vào danh sách; cho luồng ghi thẳng vào kho; đổi `KIT_TAG`.

## Notes
