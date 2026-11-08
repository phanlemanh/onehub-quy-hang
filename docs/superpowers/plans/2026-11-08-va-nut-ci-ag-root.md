# va-nut-ci-ag-root Implementation Plan

**Goal:** bước «Ghim lại» của nút chạy được trên máy chủ GitHub không cài kit, rồi bấm lại nút để gỡ PR #192.

**Spec:** `docs/superpowers/specs/2026-11-08-va-nut-ci-ag-root-design.md` · hợp đồng `_acceptance/va-nut-ci-ag-root/contract.md`

## Global Constraints

- Không bí mật nào vào kho, chat hay tệp đính kèm; máy không đọc `.env*`.
- Không đổi `KIT_TAG`, bộ chặn, bộ quét, `config.yaml`; không sửa tệp nào của hồ sơ ghim-lai-ban-that-qua-ci.
- Mọi gộp qua công cụ `gop` dưới khoá merge của đợt.

## Review Focus

- Dòng lệnh của bước có biến shell trong nháy kép: phép đo chạy nó bằng `bash -c` nên biến phải giải đúng như trên máy chủ GitHub.
- Làn `--write` trong kho tạm: tự kiểm bằng chứng của kit phải xanh, không chỉ bước dò kit.

### Task 1: Thêm cờ `--ag-root` vào bước «Ghim lại» (phục vụ E1, E2 · independent: false)

**Files:** `.github/workflows/ghim-lai-ban-that.yml` (một dòng `run:` của bước «Ghim lại»).
- [ ] Trước khi sửa: `node _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs --chay` in «HỎNG … thoát 2» và «no usable install of "acceptance-gate"»; `--tinh` HỎNG.
- [ ] Sửa: thêm `--ag-root "$CLAUDE_PLUGIN_ROOT"` sau `--slug "$HO_SO"`.
- [ ] Verify: `--chay` và `--tinh` đều «KẾT: ĐẠT»; `node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh` và `--pha` vẫn «KẾT: ĐẠT»; `npm run lint`.

### Task 2: Chấm, ghim lại hồ sơ cũ, PR, gộp (phục vụ cả hợp đồng · independent: false)

- [ ] S4 qua lượt chấm của đợt; ghim lại ghim-lai-ban-that-qua-ci bằng làn của kit (hồ sơ ấy cũ vì eval đo tệp luồng); PR; `gop` khi CI xanh.

### Task 3: Bấm lại nút cho moi-truong-that (Đường đo · sau Task 2)

- [ ] `gh workflow run ghim-lai-ban-that.yml --ref main -f ho_so=moi-truong-that -f nhanh=claude/va-thuoc-ci-moi-truong-that-ban-that`; tải tệp đính kèm, dòng `kind: repin` vào PR #192.
