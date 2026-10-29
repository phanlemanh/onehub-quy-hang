#!/bin/bash
# Stop — trước khi Claude kết thúc lượt: kiểm kiểu và lint các tệp vừa đổi.
#   - Mỗi gói (apps/*, packages/*) có tệp TS đổi: tsc --noEmit -p <gói>, CHỈ báo lỗi nằm trong tệp đã đổi.
#   - ESLint trên đúng các tệp vừa đổi.
# Có lỗi → exit 2 để Claude sửa tiếp; lần dừng thứ hai (stop_hook_active) cho qua.
set -uo pipefail

input=$(cat)
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0

# Gốc lấy theo cwd của phiên (Claude Code gửi trong JSON), không theo CLAUDE_PROJECT_DIR: trong worktree biến đó
# trỏ kho chính, diff ở đó rỗng và rào luôn cho qua.
cwd=$(jq -r '.cwd // empty' <<<"$input")
root=$(git -C "${cwd:-.}" rev-parse --show-toplevel 2>/dev/null)
cd "${root:-${CLAUDE_PROJECT_DIR:-.}}" || exit 0

changed=$( { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } \
  | grep -E '\.(ts|tsx|mts|mjs)$' | sort -u)
[ -z "$changed" ] && exit 0

if [ ! -x node_modules/.bin/tsc ]; then
  echo "Bỏ qua kiểm kiểu cuối lượt: chưa cài node_modules (npm install)." >&2
  exit 0
fi

report=""

# Kiểm kiểu theo gói. tsc in đường dẫn tương đối theo gói: src/x.ts(1,2): error …
for pkg in apps/* packages/*; do
  [ -f "$pkg/tsconfig.json" ] || continue
  files=$(grep -E "^$pkg/" <<<"$changed" | grep -E '\.(ts|tsx|mts)$' | while read -r f; do [ -f "$f" ] && echo "$f"; done)
  [ -z "$files" ] && continue
  out=$(node_modules/.bin/tsc --noEmit -p "$pkg" 2>&1)
  hits=""
  while read -r f; do
    hits+=$(grep -F "${f#"$pkg"/}(" <<<"$out")$'\n'
  done <<<"$files"
  hits=$(sed '/^$/d' <<<"$hits")
  [ -n "$hits" ] && report+="[$pkg] lỗi TypeScript trong tệp vừa đổi:"$'\n'"$hits"$'\n'
done

# Lint đúng các tệp vừa đổi còn tồn tại. bash 3.2 (macOS) không có mapfile → dựng mảng bằng vòng while.
lint_files=()
while read -r f; do
  [ -f "$f" ] && lint_files+=("$f")
done <<<"$changed"
if [ "${#lint_files[@]}" -gt 0 ] && [ -x node_modules/.bin/eslint ]; then
  lint_out=$(node_modules/.bin/eslint --no-warn-ignored "${lint_files[@]}" 2>&1)
  if [ $? -ne 0 ] && [ -n "$lint_out" ]; then
    report+="Lỗi lint trong tệp vừa đổi:"$'\n'"$lint_out"$'\n'
  fi
fi

if [ -n "$(sed '/^$/d' <<<"$report")" ]; then
  echo "$report" >&2
  exit 2
fi
exit 0
