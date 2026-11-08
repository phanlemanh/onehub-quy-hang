---
schema_version: 1
feature: "Nút «Ghim lại hồ sơ cần bản thật» cài gitleaks (đúng bản của CI, kiểm băm) trước bước «Ghim lại», để bài tự kiểm của rào trong làn chạy được trên máy chủ GitHub; lượt bấm lại không còn đỏ vì thiếu gitleaks."
slug: va-nut-ci-gitleaks
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci]
status: draft
design_doc: docs/superpowers/specs/2026-11-08-va-nut-ci-gitleaks-design.md
---

# Acceptance Contract: va-nut-ci-gitleaks

## Context

Lượt bấm lại nút (run 42440631323, 08/11) đỏ ở bài tự kiểm của rào: «gitleaks phải có trên CI» — máy chủ GitHub đặt
`CI=true` mà luồng của nút không cài gitleaks như job `check` của `ci.yml`. PR #192 chờ hàng này. T3: chạm
`.github/workflows/ghim-lai-ban-that.yml` (rào phát hành, bí mật bản thật). Không chạm bất biến sản phẩm.

Source input: hàng `va-nut-ci-gitleaks` (`docs/plan/lo-trinh.json`) · ô `opportunity.md`

## Criteria

- **AC-1** — Luồng của nút cài đúng gitleaks của CI, kiểm băm, trước bước «Ghim lại».
  Given `.github/workflows/ghim-lai-ban-that.yml`, `.github/workflows/ci.yml` và chín bản sao luồng viết trước kèm tập vế
  phải hỏng của từng bản: tám bản phá một chỗ (bỏ bước cài · bước cài đứng sau «Ghim lại» · bản lệch `ci.yml` · bỏ dòng
  kiểm băm · kiểm băm sau khi giải nén · bỏ dòng `GITHUB_PATH` · bước cài mang bí mật · bí mật ở env của job) và một bản
  phá kép (kiểm băm sau khi giải nén và bỏ dòng `GITHUB_PATH`),
  When chấm đủ năm vế trên luồng thật và trên từng bản sao (không dừng ở vế hỏng đầu tiên),
  Then luồng thật đủ năm vế: có bước «Cài gitleaks» đứng trước «Ghim lại» · bản là `GITLEAKS_VERSION` của `ci.yml` · tệp
  tải được kiểm bằng băm sha256 ghim ở env của job trước khi giải nén · thư mục cài vào `GITHUB_PATH` · env hiệu lực của
  bước (env của job, env của bước, khoá bước trước ghi vào `GITHUB_ENV` từ một bí mật) không có bí mật; tập vế hỏng của
  mỗi bản sao bằng đúng tập đã viết trước (bản phá kép hỏng đúng hai vế; bản bỏ bước hỏng vế đầu, bốn vế còn lại «không
  áp»).

- **AC-2** — Bước cài chạy được như máy chủ GitHub, chỉ nhận tệp đúng băm.
  Given khối `run` của bước «Cài gitleaks» rút nguyên văn từ tệp luồng, env của job, `RUNNER_TEMP` và `GITHUB_PATH` tạm,
  `HOME` rỗng, `CI=true`, vỏ `bash --noprofile --norc -eo pipefail`,
  When chạy khối với băm ghim của luồng, rồi chạy lại với băm lệch một ký tự,
  Then lần đầu thoát 0, `GITHUB_PATH` có đúng một dòng trỏ thư mục chứa tệp `gitleaks`, và tệp ấy là bản linux x64 (đầu
  ELF, máy x86-64); lần hai thoát khác 0 với «FAILED», không dòng `GITHUB_PATH`, không tệp `gitleaks`.

- **AC-3** — Ở chế độ của bước «Ghim lại», gitleaks trên PATH là thứ duy nhất bài tự kiểm của rào còn thiếu.
  Given khối bài tự kiểm trong nhật ký bước «Ghim lại» của run 42440631323 trên máy chủ GitHub, ghim nguyên văn vào
  `_acceptance/va-nut-ci-gitleaks/thu/run-42440631323-suite-4-7.txt`, và lệnh `test:hooks` của `package.json` chạy trên
  cây kho với `CI=true` và bốn biến bản thật để trống (như `feature_loop.repin_ci_blank_env`),
  When đọc khối ghim, chạy lệnh với PATH không thư mục nào có gitleaks, rồi với một thư mục chỉ chứa gitleaks đặt trước
  PATH (cách GitHub áp `GITHUB_PATH`),
  Then tập dòng ĐỎ của khối ghim đúng bằng {«gitleaks phải có trên CI»}; lần chạy đầu cho tập dòng kết luận (ĐẠT · ĐỎ ·
  BỎ QUA) trùng từng dòng với khối ghim và «TỔNG: ĐỎ»; lần hai không dòng ĐỎ nào, giữ mọi dòng ĐẠT của khối ghim, thêm
  «ĐẠT chặn bí mật đã stage», «TỔNG: ĐẠT».

## Coverage

Trục: vật {khai báo bước cài trong luồng, chạy bước cài, nối tới bài tự kiểm} × chiều {xanh trên vật thật, đỏ khi phá}.
Khai báo: năm vế, tám ca phá đơn phủ cả năm vế và một ca phá kép chứng phép so tập. Chạy: tải thật với băm ghim, đối
chứng băm lệch. Nối tới bài tự kiểm: chế độ CI với gitleaks vắng (trùng từng dòng kết luận với run 42440631323) và có
qua thư mục đặt trước PATH. Thước CE: nhật ký run 42440631323 (vật ghim của AC-3) và cách job `check` của `ci.yml` cài
cùng bản gitleaks.

## Đường đo

Ngưỡng «lượt bấm kế tiếp qua bài tự kiểm của rào» là lượt bấm nút sau khi hàng gộp: chạy từ ref `main`, hồ sơ
moi-truong-that, input `nhanh` là nhánh của PR #192. Nhật ký bước «Cài gitleaks» phải có dòng `gitleaks.tar.gz: OK`;
nhật ký bước «Ghim lại» phải có `suite 4/7: npm run test:hooks → exit 0` và `moi-truong-that E9: npm run test:hooks →
exit 0`. Đây không phải AC máy trước gộp, vì `workflow_dispatch` chỉ chạy luồng đã có ở main. Timebox: 1 ngày sau gộp.

## Out of scope

- Các eval của `kiem-moi-truong.mjs` (E1, E2, E4, E5 của moi-truong-that) đỏ ở run 42440631323 vì bản thật có sàn không
  mang nhãn mẫu — câu đang chờ chủ kho ở #192.
- Đổi `ci.yml` (kể cả thêm kiểm băm cho job `check` và `secrets`), bài tự kiểm của rào (`.claude/hooks/**`), `KIT_TAG`,
  bộ chặn, bộ quét, `config.yaml`.
- Sửa hợp đồng hay phép đo của hồ sơ đã ký ghim-lai-ban-that-qua-ci và va-nut-ci-ag-root: chỉ ghim lại bằng làn.

## Notes

- Phép đo AC-2 chạy trên máy chấm darwin/arm64 (bash, tar, sha256sum của macOS) nên chỉ kiểm đầu tệp gitleaks (ELF,
  x86-64), không chạy được tệp và không thấy sai khác công cụ GNU/BSD; trên máy linux x64 nó chạy thêm `gitleaks
  version`. Chạy thật trên máy chủ GitHub là Đường đo sau gộp (Hỏi-2).
- Hai hồ sơ đã ký đo tệp luồng — ghim-lai-ban-that-qua-ci (E1, E2) và va-nut-ci-ag-root (E1, E2) — được ghim lại bằng
  làn của kit trước gộp, không sửa tệp nào của chúng (Hỏi-3). Giám sát đã cấp chạm tệp `run-log.jsonl` và
  `evidence-report.md` của va-nut-ci-ag-root (Q-14, 08/11); hồ sơ ghim-lai-ban-that-qua-ci nằm trong vùng của hàng.
