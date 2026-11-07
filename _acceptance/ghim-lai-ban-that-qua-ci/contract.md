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
approved_at: 2026-11-08
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

- **AC-3** — Bộ chặn chỉ cho chạy lệnh trong danh sách cho phép, giải như main.
  Given bản «sẵn bấm» rút từ `_acceptance/config.yaml` và `_acceptance/moi-truong-that/evals.yaml` thật (E3 khai không chạy,
  E8 gọi thẳng bản thật), và bảy bản sao mỗi bản sửa một chỗ,
  When chạy `.github/scripts/chan-ghim-ban-that.mjs moi-truong-that --root <nhánh> --goc <main>` (đọc evals bằng bộ đọc của
  kit),
  Then bản sẵn bấm → thoát 0 «CHO CHẠY»; E3 còn chạy `cach_ly_that`, E3 trỏ bộ nạp mẫu, E3 trỏ bộ kiểm chặn trùng tên, E3
  viết dạng khối nhiều dòng → thoát 1 «khoá … không trong danh sách cho phép»; E3 viết thẳng lệnh cách ly → thoát 1 «lệnh
  viết thẳng»; nhánh định nghĩa lại một khoá cho phép → thoát 1 «ở nhánh giải khác main»; thiếu khoá để trống
  `DATABASE_URL` → thoát 1.

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
chặn: tám ca rút từ hồ sơ thật, phủ lớp bộ kiểm ghi (khoá ngoài danh sách, lệnh viết thẳng, viết dạng khối, nhánh định nghĩa
lại khoá). Khoá: một kho tạm hai chiều. Thước CE: luồng `nap-mau.yml` (tiền lệ chạy tay với bí mật bản
thật), job `deploy` của `ci.yml`.

## Đường đo

- Ngưỡng «không bí mật nào rời GitHub» → AC-5 (bộ quét) và vế «chỉ tải khi quét sạch» của AC-1. Ngưỡng còn lại → lượt bấm đầu tiên cho moi-truong-that sau khi hàng gộp: tệp đính kèm có dòng `kind: repin` (không
  `repin-do`), PR #192 hết «bằng chứng cũ» và gộp. Không phải AC máy trước gộp: `workflow_dispatch` chỉ chạy được khi luồng
  đã ở nhánh main. Timebox đề xuất: 1 ngày sau gộp.

## Out of scope

- Bật «Required reviewers» cho environment production — cài đặt của chủ kho trên GitHub.
- Thêm hồ sơ khác vào danh sách; cho luồng ghi thẳng vào kho; đổi `KIT_TAG`.

## Notes
- Known limits — chọn ở Cổng Bằng chứng 2026-11-07:
  - Ngoài-2: Bộ chặn cũ đọc sai lệnh viết dạng khối nhiều dòng — bộ chặn mới đọc bằng bộ đọc của kit, ca này có trong AC-3.
  - Ngoài-4: Khi bộ chặn từ chối, nút vẫn tải lên một tệp đính kèm mang kết quả cũ của nhánh; lượt chạy vẫn báo đỏ.
  - Ngoài-5: Phép đo bộ chặn cũ chỉ thử một ca của lớp bộ kiểm ghi — AC-3 mới thử bảy ca.
- Cổng Bằng chứng 07/11: chủ kho chọn «nâng phạm vi sửa ngay» cho Ngoài-1, Ngoài-3 — AC-3 viết lại thành danh sách cho phép
  giải như main; Cổng Phạm vi duyệt lại.
