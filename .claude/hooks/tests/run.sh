#!/bin/bash
# Bài tự kiểm của các rào: mỗi rào phải được thấy CHẶN một lần (chuẩn thiết lập kho: rào phải chứng minh đã chạy).
#   - .claude/hooks/guard-edits.sh       chặn sửa migration đã commit và tệp bí mật
#   - .claude/hooks/typecheck-changed.sh chặn kết thúc lượt khi tệp vừa đổi có lỗi kiểu
#   - .githooks/pre-commit               chặn commit trên main và chặn bí mật đã stage
# Chạy: npm run test:hooks (CI chạy trong job check).
set -uo pipefail

root=$(git rev-parse --show-toplevel)
cd "$root" || exit 1
fail=0
pass() { echo "  ĐẠT  $1"; }
bad() { echo "  ĐỎ   $1"; fail=1; }

expect_exit() { # tên, mã mong đợi, mã thật
  if [ "$2" = "$3" ]; then pass "$1"; else bad "$1 (mong $2, được $3)"; fi
}

echo "guard-edits"
guard() { jq -n --arg f "$root/$1" '{tool_input:{file_path:$f}}' | CLAUDE_PROJECT_DIR="$root" .claude/hooks/guard-edits.sh 2>/dev/null; echo $?; }
expect_exit "chặn sửa migration đã commit" 2 "$(guard packages/db/migrations/001_nen_cong_ty.sql)"
expect_exit "cho tạo migration mới" 0 "$(guard packages/db/migrations/999_chua_co.sql)"
expect_exit "chặn ghi .env.local" 2 "$(guard apps/web/.env.local)"
expect_exit "cho sửa .env.example" 0 "$(guard .env.example)"
expect_exit "cho sửa mã thường" 0 "$(guard packages/core/src/index.ts)"

echo "typecheck-changed"
tmp="packages/core/src/__tu_kiem_loi_kieu.ts"
trap 'rm -f "$root/$tmp"' EXIT
echo 'export const x: number = "không phải số";' >"$tmp"
out=$(echo '{}' | CLAUDE_PROJECT_DIR="$root" .claude/hooks/typecheck-changed.sh 2>&1); rc=$?
expect_exit "chặn kết thúc lượt khi tệp vừa đổi có lỗi kiểu" 2 "$rc"
grep -q "__tu_kiem_loi_kieu.ts" <<<"$out" && pass "báo đúng tệp lỗi" || bad "báo đúng tệp lỗi"
rc=$(echo '{"stop_hook_active":true}' | CLAUDE_PROJECT_DIR="$root" .claude/hooks/typecheck-changed.sh >/dev/null 2>&1; echo $?)
expect_exit "lần dừng thứ hai cho qua" 0 "$rc"
rm -f "$tmp"

echo "pre-commit"
if ! command -v gitleaks >/dev/null 2>&1; then
  if [ -n "${CI:-}" ]; then bad "gitleaks phải có trên CI"; else echo "  BỎ QUA  chưa cài gitleaks trên máy này"; fi
else
  sandbox=$(mktemp -d)
  (
    cd "$sandbox" && git init -q -b main && git config user.email t@t && git config user.name t
    echo a >a && git add a
    "$root/.githooks/pre-commit" >/dev/null 2>&1; echo "main:$?"
    git checkout -q -b thu
    # Chuỗi giống token GitHub, dựng lúc chạy để chính tệp này không chứa mẫu bí mật.
    printf 'token = "%s%s"\n' "gh" "p_$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 36)" >b && git add b
    "$root/.githooks/pre-commit" >/dev/null 2>&1; echo "secret:$?"
    git rm -q --cached b && rm b
    "$root/.githooks/pre-commit" >/dev/null 2>&1; echo "clean:$?"
  ) >"$sandbox/out"
  expect_exit "chặn commit trên main" 1 "$(sed -n 's/^main://p' "$sandbox/out")"
  expect_exit "chặn bí mật đã stage" 1 "$(sed -n 's/^secret://p' "$sandbox/out")"
  expect_exit "cho commit sạch trên nhánh" 0 "$(sed -n 's/^clean://p' "$sandbox/out")"
  rm -rf "$sandbox"
fi

[ "$fail" -eq 0 ] && echo "TỔNG: ĐẠT" || echo "TỔNG: ĐỎ"
exit "$fail"
