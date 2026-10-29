#!/bin/bash
# PreToolUse (Edit|Write|MultiEdit|NotebookEdit) — chặn sửa những thứ bất biến hoặc chứa bí mật.
#   1. Migration đã commit trong packages/db/migrations/ → phải tạo migration mới (AGENTS.md, luật làm việc).
#   2. Tệp bí mật .env / .env.local → khoá do người đặt, agent không ghi.
# Exit 2 = chặn; stderr được đưa lại cho Claude làm lý do.
set -uo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
[ -z "$file" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
rel="${file#"$root"/}"

case "$rel" in
  packages/db/migrations/*.sql)
    if git -C "$root" cat-file -e "HEAD:$rel" 2>/dev/null; then
      echo "Chặn: $rel đã commit. Schema chỉ đổi qua migration MỚI (số kế tiếp) — dùng /new-migration." >&2
      exit 2
    fi ;;
  .env|*/.env|.env.local|*/.env.local|*.env.*.local)
    echo "Chặn: $rel chứa bí mật do người đặt (khoá ReUI, chuỗi kết nối). Agent không ghi tệp này; sửa .env.example nếu cần thêm biến." >&2
    exit 2 ;;
esac
exit 0
