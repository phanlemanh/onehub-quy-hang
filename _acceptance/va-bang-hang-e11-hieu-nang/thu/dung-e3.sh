#!/usr/bin/env bash
# Dựng chỗ thử cho bài nhìn E3 (va-bang-hang-e11-hieu-nang) — gọi là «DỰNG D» trong steps của E3:
#   bash dung-e3.sh        giữ khoá đo của dãy D (chung với kiem-e11.sh: cùng cổng 3575/3585), rồi dựng Postgres dãy D
#                          (5575/e11) + bản BUILD của cây hiện tại ở http://localhost:3585 với 5.000 căn ở «[Mẫu] Sàn đo
#                          cuộn» (người do-cuon@mau.quy-hang.test); in bảng người ↔ số hàng thấy.
#   bash dung-e3.sh --tat  tắt máy chủ dung-d.mjs đã bật (chỉ PID nó ghi) và nhả khoá.
# Đăng nhập bằng email, đọc mã ở nhật ký: grep "[ma-dang-nhap] do-cuon@mau.quy-hang.test" .acceptance-runs/va-bang-hang-e11-hieu-nang/web-d.log | tail -1
set -euo pipefail
DAY=$(cd "$(dirname "$0")" && pwd)
GOC=$(cd "$DAY/../../.." && pwd)
RA=$GOC/.acceptance-runs/va-bang-hang-e11-hieu-nang
KHOA=$RA/.khoa-kiem-e11
mkdir -p "$RA"
cd "$GOC"
if [ "${1:-}" = "--tat" ]; then
  node "$DAY/dung-d.mjs" --tat || true
  rmdir "$KHOA" 2>/dev/null || true
  echo "đã tắt và nhả khoá đo"
  exit 0
fi
for _ in $(seq 1 720); do
  if mkdir "$KHOA" 2>/dev/null; then break; fi
  if [ -n "$(find "$KHOA" -maxdepth 0 -mmin +90 2>/dev/null)" ]; then rmdir "$KHOA" 2>/dev/null || true; fi
  sleep 10
done
[ -d "$KHOA" ] || { echo "DỰNG D: chờ khoá đo quá 2 giờ"; exit 2; }
# Khoá giữ tới khi gọi --tat (khoá bỏ quên quá 90 phút thì lượt đo kế tự gỡ).
node "$DAY/dung-d.mjs" --build --nhan 5000 || { rmdir "$KHOA" 2>/dev/null || true; echo "DỰNG D lỗi"; exit 2; }
