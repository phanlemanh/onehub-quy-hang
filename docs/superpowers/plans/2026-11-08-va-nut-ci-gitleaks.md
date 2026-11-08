# va-nut-ci-gitleaks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> Trong vòng feature-loop của kho này: thực thi TUẦN TỰ trong phiên chính (S3), rồi chấm bằng Workflow S4.

**Goal:** Nút «Ghim lại hồ sơ cần bản thật» cài gitleaks (đúng bản CI, kiểm băm) trước bước «Ghim lại», để bài tự kiểm
của rào trong làn chạy được trên máy chủ GitHub.

**Architecture:** Một bước mới trong `.github/workflows/ghim-lai-ban-that.yml` (sau bước lấy kit, trước bộ chặn), hai khoá
mới ở env của job. Bộ đo `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs` đã viết và duyệt ở Cổng Phạm vi; trên cây
hiện tại E1 và E2 đỏ (chiều đỏ đã thấy), E3 xanh (không phụ thuộc luồng).

**Tech Stack:** GitHub Actions YAML, bash, Node ≥ 22 (bộ đo).

**Spec:** `docs/superpowers/specs/2026-11-08-va-nut-ci-gitleaks-design.md` · hợp đồng `_acceptance/va-nut-ci-gitleaks/contract.md`

## Global Constraints

- Bản gitleaks: `GITLEAKS_VERSION: 8.30.1` — phải bằng `GITLEAKS_VERSION` ở env cấp tệp của `.github/workflows/ci.yml`.
- Băm: `GITLEAKS_SHA256: 551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb` (digest GitHub công bố cho
  `gitleaks_8.30.1_linux_x64.tar.gz`).
- Không chạm tệp nào ngoài vùng hàng: `.github/workflows/ghim-lai-ban-that.yml`, `_acceptance/ghim-lai-ban-that-qua-ci/**`,
  `_acceptance/va-nut-ci-gitleaks/**`, cộng `run-log.jsonl` và `evidence-report.md` của `_acceptance/va-nut-ci-ag-root/`
  (Q-14). Không đổi `ci.yml`, `.claude/hooks/**`, `KIT_TAG`, bộ chặn, bộ quét, `config.yaml`.
- Bước cài không mang bí mật nào (không `secrets.` ở bước, ở env của job, hay ở bước trước có ghi `GITHUB_ENV`).
- Mười hai vế gác của hồ sơ ghim-lai-ban-that-qua-ci và bốn ca phá của va-nut-ci-ag-root phải giữ xanh.

## Review Focus

- Ma trận phá của E1 rút chữ từ chính bước cài (dòng kiểm băm, dòng `tar`, dòng `GITHUB_PATH`): bước viết khác chữ ấy
  (vd. `>> $GITHUB_PATH` không nháy) thì ca phá «lệch luồng» và đỏ — viết đúng dạng trong Task 1.
- Bộ tách bước của `kiem-ag-root.mjs` dừng một bước ở dòng `- ` hoặc `# ` cùng thụt: dòng chú thích trước bước mới phải
  thụt 6 như các bước khác, không chen vào giữa khối của bước lấy kit.
- `kiem-nut.mjs` đếm `secrets.` trên cả tệp phải bằng 2: bước mới không thêm `secrets.` nào (Task 2 chạy nó).
- Đầu tệp luồng là chú thích mô tả nút: thêm một câu về gitleaks, không đổi các câu cũ (bộ đo khác không đọc chúng, chỉ
  để người đọc).
- Máy chấm cần mạng tới github.com cho E2 (tải ~8 MB); mất mạng thì E2 đỏ vì hạ tầng, không phải vì vật.

---

### Task 1: Bước cài gitleaks trong luồng nút

**Files:**
- Modify: `.github/workflows/ghim-lai-ban-that.yml` (chú thích đầu tệp; env của job `ghim-lai`; bước mới sau
  «Lấy kit theo tag (ngoài cây kho)»)
- Test: `_acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs` (đã có, không sửa)

**Phục vụ:** E1 (AC-1), E2 (AC-2). **independent:** false (Task 2 đọc tệp này).

**Interfaces:**
- Produces: bước tên bắt đầu `Cài gitleaks` (đủ tên: «Cài gitleaks (bài tự kiểm của rào trong làn cần nó)»); khối `run: |`
  thụt 10 với đúng năm dòng:
  `mkdir -p "$RUNNER_TEMP/gitleaks"` ·
  `curl -sSfL -o "$RUNNER_TEMP/gitleaks.tar.gz" "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"` ·
  `echo "${GITLEAKS_SHA256}  $RUNNER_TEMP/gitleaks.tar.gz" | sha256sum -c -` ·
  `tar -xzf "$RUNNER_TEMP/gitleaks.tar.gz" -C "$RUNNER_TEMP/gitleaks" gitleaks` ·
  `echo "$RUNNER_TEMP/gitleaks" >> "$GITHUB_PATH"`

- [ ] **Step 1: Chạy bộ đo trên cây hiện tại, thấy đỏ**
  Run: `node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --tinh; node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --chay`
  Expected: `HỎNG luồng thật: hỏng có bước «Cài gitleaks» đứng trước «Ghim lại»` và `HỎNG luồng thiếu bước «Cài gitleaks»…`, cả hai thoát 1.
- [ ] **Step 2: Thêm `GITLEAKS_VERSION` và `GITLEAKS_SHA256` vào env của job** (ngay sau `KIT_TAG`, kèm hai dòng chú thích:
  cùng bản với `ci.yml`; băm là digest GitHub công bố; nâng bản thì đổi cả hai dòng và `ci.yml` trong một PR).
- [ ] **Step 3: Thêm bước cài** ngay sau dòng `echo "CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit" >> "$GITHUB_ENV"`, với hai dòng
  chú thích thụt 6 trước nó (bài tự kiểm đòi gitleaks khi `CI=true` như job `check`; tệp chạy cạnh chuỗi kết nối bản
  thật nên kiểm băm trước khi giải nén), và một câu ở chú thích đầu tệp.
- [ ] **Step 4: Chạy bộ đo, thấy xanh**
  Run: `node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --tinh && node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --chay`
  Expected: `ĐẠT luồng thật: đủ 5 vế…`, chín dòng `ĐẠT phá thử…`, `KẾT: ĐẠT`; rồi bốn dòng ĐẠT của `--chay`, `KẾT: ĐẠT`.
- [ ] **Step 5: Commit** `fix(ci): nút ghim lại cài gitleaks đúng bản CI, kiểm băm (va-nut-ci-gitleaks)`

### Task 2: Hai hồ sơ đã ký và bài tự kiểm vẫn xanh trên luồng mới

**Files:** không sửa tệp; chỉ chạy.
**Phục vụ:** E3 (AC-3); Hỏi-3 (tiền đề ghim lại). **independent:** false (sau Task 1).

- [ ] **Step 1:** Run `node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh && node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --pha` — Expected: `12/12 vế gác ĐẠT`, ma trận `14/14`, `KẾT: ĐẠT` ×2.
- [ ] **Step 2:** Run `node _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs --tinh` — Expected: `KẾT: ĐẠT`.
- [ ] **Step 3:** Run `node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --hooks` — Expected: ba dòng ĐẠT, `KẾT: ĐẠT`.
- [ ] **Step 4:** Run `npm run typecheck && npm run lint` — Expected: thoát 0 (rào cuối lượt của kho).

### Sau S3 (không phải task code — theo vòng feature-loop)

S4 chấm E1–E3 (xin lượt `s4`) → khi PASS: ghim lại ghim-lai-ban-that-qua-ci và va-nut-ci-ag-root bằng một lượt
`repin-lane.mjs` (xin `ghim-lai`) → Cổng Bằng chứng (chủ kho ký, T3) → PR → gộp qua `gop` dưới khoá `merge`.
