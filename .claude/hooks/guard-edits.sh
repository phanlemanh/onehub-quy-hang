#!/bin/bash
# PreToolUse (Edit|Write|MultiEdit|NotebookEdit) — chặn sửa những thứ bất biến hoặc chứa bí mật.
#   1. Migration đã commit trong packages/db/migrations/ → phải tạo migration mới (AGENTS.md, luật làm việc).
#   2. Tệp bí mật .env / .env.local → khoá do người đặt, agent không ghi.
# Exit 2 = chặn; stderr được đưa lại cho Claude làm lý do.
set -uo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
[ -z "$file" ] && exit 0

# Gốc lấy theo git của CHÍNH tệp, không theo CLAUDE_PROJECT_DIR: trong worktree (.claude/worktrees/…) biến đó trỏ
# kho chính, đường dẫn tệp không khớp mẫu và rào cho qua. Tệp mới có thể nằm trong thư mục chưa có → leo lên tới
# thư mục tồn tại gần nhất.
dir=$(dirname "$file")
while [ ! -d "$dir" ] && [ "$dir" != "/" ]; do dir=$(dirname "$dir"); done
root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)
if [ -n "$root" ]; then
  # --show-prefix trả đường dẫn đã chuẩn hoá theo gốc, tránh lệch /tmp ↔ /private/tmp của macOS.
  rel="$(git -C "$dir" rev-parse --show-prefix)${file#"$dir"/}"
else
  rel="$file"
fi

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
