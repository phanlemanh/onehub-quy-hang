# ghim-lai-ban-that-qua-ci Implementation Plan

**Goal:** nút chạy tay trên GitHub ghim lại hồ sơ cần biến bản thật, rồi dùng nó gỡ PR #192.

**Spec:** `docs/superpowers/specs/2026-11-07-ghim-lai-ban-that-qua-ci-design.md` · hợp đồng
`_acceptance/ghim-lai-ban-that-qua-ci/contract.md` (Cổng Phạm vi duyệt 07/11, Hỏi-1 và Hỏi-2 theo khuyến nghị)

## Global Constraints

- Không bí mật nào vào kho, chat hay tệp đính kèm; máy không đọc `.env*`.
- Không bộ kiểm ghi nào chạy trên bản thật; không đổi `KIT_TAG`.
- Mọi gộp qua công cụ `gop` dưới khoá merge của đợt.

### Task 1: Luồng, bộ chặn, bộ quét, khoá config (phục vụ E1–E5 · independent: false)

Đã viết trước Cổng Phạm vi (bản trình duyệt), đúng bản đã duyệt.
**Files:** `.github/workflows/ghim-lai-ban-that.yml`, `.github/scripts/chan-ghim-ban-that.mjs`,
`.github/scripts/quet-bi-mat.mjs`, `_acceptance/config.yaml` (`repin_ci_blank_env`).
- [ ] Verify: `node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh|--pha|--chan|--quet|--trong` — năm lượt «KẾT: ĐẠT»; `npm run lint`.

### Task 2: Chấm, PR, gộp (phục vụ cả hợp đồng · independent: false)

- [ ] S4 qua lượt chấm của đợt; PR; `gop` khi CI xanh.

### Task 3: Đặt hai biến công khai trên GitHub (Hỏi-1 · independent: false, sau Task 2)

- [ ] `SUPABASE_URL` = `https://kcpiamqdangrapfmkiig.supabase.co` (ADR-0009 §1); `SUPABASE_PUBLISHABLE_KEY` = khoá công khai
  của dự án lấy bằng Supabase CLI — `gh variable set --env production`. Hai giá trị công khai, không phải bí mật.

### Task 4: Dùng lần đầu cho PR #192 (đường đo · independent: false, sau Task 3)

- [ ] Trên nhánh #192: E8 của moi-truong-that đổi lệnh sang `config:executors.script.suc_khoe_that`; gộp main.
- [ ] Bộ chặn của main chạy tại máy trên cây #192 → «CHO CHẠY moi-truong-that».
- [ ] `gh workflow run ghim-lai-ban-that.yml --ref main -f ho_so=moi-truong-that -f nhanh=claude/va-thuoc-ci-moi-truong-that-ban-that`;
  tải tệp đính kèm (`gh run download`), commit vào #192, đẩy; `gop 192` khi CI xanh.
