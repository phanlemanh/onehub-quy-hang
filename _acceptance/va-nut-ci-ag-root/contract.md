---
schema_version: 1
feature: "Nút «Ghim lại hồ sơ cần bản thật» chạy được làn ghim lại trên máy chủ GitHub không cài kit: bước «Ghim lại» trỏ làn vào kit lấy theo tag; một phép đo chạy nguyên dòng lệnh của bước ấy như máy chủ GitHub để lỗi này không lọt lần nữa."
slug: va-nut-ci-ag-root
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci]
status: verified
design_doc: docs/superpowers/specs/2026-11-08-va-nut-ci-ag-root-design.md
approved_by: Manh Phan
approved_at: 2026-11-08
---

# Acceptance Contract: va-nut-ci-ag-root

## Context

Lượt bấm đầu tiên của nút (run 42421859175, 08/11) đỏ ở bước «Ghim lại»: làn ghim lại tìm kit trong thư mục plugin của
máy, máy chủ GitHub không cài nên làn dừng trước khi chạy eval nào. PR #192 chờ hàng này. T3: chạm
`.github/workflows/ghim-lai-ban-that.yml` (rào phát hành, bí mật bản thật). Không chạm bất biến sản phẩm.

Source input: hàng `va-nut-ci-ag-root` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Bước «Ghim lại» chạy được trên máy không cài kit.
  Given `.github/workflows/ghim-lai-ban-that.yml`: khối `run` của bước lấy kit, rồi dòng `run:` của bước «Ghim lại», cả
  hai rút nguyên văn; env của job, `GITHUB_ENV` do bước lấy kit ghi, env của bước (biểu thức GitHub thay bằng giá trị
  giả), `working-directory`; một kho git tạm có một hồ sơ đóng vai thư mục nhánh; `HOME` là thư mục rỗng; vỏ
  `bash --noprofile --norc -eo pipefail` như máy chủ GitHub,
  When chạy bước lấy kit rồi bước «Ghim lại»,
  Then làn chạy suite chung và eval của hồ sơ, thoát 0, và sổ chạy của hồ sơ có dòng `kind: repin` (không `repin-do`);
  cùng dòng bỏ `--ag-root` thì làn thoát khác 0 với «no usable install of acceptance-gate» và không ghi dòng `repin`.

- **AC-2** — Làn lấy bộ máy từ kit theo tag, không từ cây nhánh.
  Given `.github/workflows/ghim-lai-ban-that.yml` và bốn bản sao, mỗi bản phá một chỗ (bỏ `--ag-root`, `--ag-root .`, kit
  lấy theo nhánh main thay vì tag, `CLAUDE_PLUGIN_ROOT` chỉ đặt ở env của bước lấy kit thay vì qua `GITHUB_ENV`),
  When đọc luồng và từng bản sao,
  Then luồng thật: bước «Ghim lại» truyền `--ag-root "$CLAUDE_PLUGIN_ROOT"`, và `CLAUDE_PLUGIN_ROOT` là kit lấy theo
  `refs/tags/$KIT_TAG` vào `$RUNNER_TEMP/kit`, ghi vào `GITHUB_ENV` ở một bước đứng trước «Ghim lại»; mỗi bản sao hỏng
  đúng vế nó phá.

## Coverage

Trục: vật {dòng lệnh của bước «Ghim lại», nguồn bộ máy} × chiều {xanh trên vật thật, đỏ khi phá}. Dòng lệnh: chạy thật
như máy chủ GitHub và một đối chứng bỏ cờ. Nguồn bộ máy: bốn ca phá, phủ cả hai vế (giá trị cờ, và biến tới được bước «Ghim lại»). Thước CE: lỗi của run 42421859175
(đối chứng phải đỏ đúng chữ ấy) và luồng `ci.yml` (cùng cách lấy kit theo `KIT_TAG`).

## Đường đo

Ngưỡng «lượt bấm kế tiếp qua bước Ghim lại» là lượt bấm nút sau khi hàng gộp: chạy từ ref `main` (nút tự từ chối ref
khác), hồ sơ moi-truong-that, input `nhanh` là nhánh của PR #192. Nhật ký bước «Ghim lại» của lượt ấy phải mang
`--ag-root`, tệp đính kèm phải có dòng `kind: repin` (không `repin-do`), và PR #192 phải hết «bằng chứng cũ». Đây không phải AC máy trước
gộp, vì `workflow_dispatch` chỉ chạy luồng đã có ở main. Timebox: 1 ngày sau gộp.

## Out of scope

- Sửa phép đo E4 (`kiem-nut.mjs --trong`) của hồ sơ ghim-lai-ban-that-qua-ci, vốn chạy trên máy có kit cài sẵn: AC-1 của
  hàng này phủ đúng chỗ nó hở.
- Đổi `KIT_TAG`, bộ chặn, bộ quét, `config.yaml`. Các việc «mở hợp đồng mới» từ Cổng Bằng chứng của ghim-lai-ban-that-qua-ci
  (bộ quét giải mã mật khẩu, `KIT_TAG` nhân đôi…) đi hàng riêng.

## Notes

- E4 (`kiem-nut.mjs --trong`) của hồ sơ ghim-lai-ban-that-qua-ci chạy trên máy có kit cài sẵn nên không chứng được «nút
  chạy được trên máy chủ GitHub»; từ hàng này, bằng chứng ấy là AC-1 ở đây. E4 vẫn chứng đúng điều nó hứa (bộ kiểm chung
  không thấy chuỗi kết nối).
