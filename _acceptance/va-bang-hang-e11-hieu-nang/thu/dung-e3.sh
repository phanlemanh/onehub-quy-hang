#!/usr/bin/env bash
# Dựng chỗ thử cho bài nhìn E3 (va-bang-hang-e11-hieu-nang) — gọi là «DỰNG D» trong steps của E3:
#   bash dung-e3.sh        giữ khoá đo của dãy D (chung với kiem-e11.sh); dùng bản dev của dung-d.mjs để nạp đủ 5.000
#                          căn ở «[Mẫu] Sàn đo cuộn» và giữ phiên của do-cuon@mau.quy-hang.test, tắt nó; rồi BUILD cây
#                          đang chấm và bật bản build ở http://localhost:3585 như máy đo cuộn (do-cuon-d.mjs): khoá số chủ
#                          ngẫu nhiên, bộ gửi mã giả. In «cây <sha>», «bản build lên ở …» và đường tệp cookie phiên.
#   bash dung-e3.sh --tat  tắt bản build (cả nhóm tiến trình), máy chủ dev dung-d nếu còn, chờ cổng trống, nhả khoá.
# Vì sao bản build (lượt chấm 2, 07/11): bản dev chạy chế độ nghiêm của React nên mỗi trang tải danh sách 5.000 căn hai
# lần, chiếm hết hai kết nối cơ sở dữ liệu của máy chủ trang — danh mục và danh bạ lỗi 500 vì chờ kết nối quá 10 giây.
# Bản build không gửi được mã đăng nhập: vào bằng phiên đã giữ — nạp cookie trong tệp in ra (mảng «tên=giá trị») vào trình
# duyệt cho localhost:3585 rồi mở /inventory.
set -euo pipefail
DAY=$(cd "$(dirname "$0")" && pwd)
GOC=$(cd "$DAY/../../.." && pwd)
RA=$GOC/.acceptance-runs/va-bang-hang-e11-hieu-nang
KHOA=$RA/.khoa-kiem-e11
PIDF=$RA/web-e3.pid
LOGF=$RA/web-e3.log
PHIEN=$RA/phien-do-cuon@mau.quy-hang.test.json
mkdir -p "$RA"
cd "$GOC"
cho_cong_trong() { # chờ cổng 3585 hết người nghe, tối đa 30 giây
  for _ in $(seq 1 30); do lsof -nP -iTCP:3585 -sTCP:LISTEN >/dev/null 2>&1 || return 0; sleep 1; done
  return 1
}
tat_build() {
  if [ -f "$PIDF" ]; then
    local p; p=$(cat "$PIDF")
    kill -TERM -- "-$p" 2>/dev/null || kill -TERM "$p" 2>/dev/null || true
    rm -f "$PIDF"
  fi
}
if [ "${1:-}" = "--tat" ]; then
  tat_build
  node "$DAY/dung-d.mjs" --tat >/dev/null 2>&1 || true
  cho_cong_trong || echo "cảnh báo: cổng 3585 vẫn bận sau 30 giây"
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
nha() { rmdir "$KHOA" 2>/dev/null || true; }
# Máy chủ dãy D cũ không được dùng lại: tắt đúng PID đã ghi, chờ cổng trống; còn bận thì là tiến trình lạ.
tat_build; node "$DAY/dung-d.mjs" --tat >/dev/null 2>&1 || true
cho_cong_trong || { nha; echo "DỰNG D: cổng 3585 đang bị một tiến trình khác giữ (không phải dung-d) — không dựng trên máy chủ lạ"; exit 2; }
SHA=$(git rev-parse HEAD)
echo "cây $SHA"
# 1. Bản dev: nạp đủ 5.000 căn và giữ phiên do-cuon (bản build không xin được mã).
node "$DAY/dung-d.mjs" --nhan 5000 | tail -1 || { nha; echo "DỰNG D lỗi ở bước nạp"; exit 2; }
node "$DAY/dung-d.mjs" --tat >/dev/null 2>&1 || true
cho_cong_trong || { nha; echo "DỰNG D: máy chủ dev không tắt"; exit 2; }
[ -f "$PHIEN" ] || { nha; echo "DỰNG D: thiếu phiên giữ $PHIEN"; exit 2; }
# 2. Build cây đang chấm và bật bản build ở 3585 (nhóm tiến trình riêng để --tat giết trọn).
npm run build -w @quy-hang/web >"$RA/build-e3-${SHA:0:8}.log" 2>&1 || { nha; echo "DỰNG D: build lỗi — xem $RA/build-e3-${SHA:0:8}.log"; exit 2; }
KHOA_SO=$(node -e 'console.log(require("crypto").randomBytes(32).toString("base64"))')
DATABASE_URL=postgres://postgres:quyhang@localhost:5575/e11 \
BETTER_AUTH_SECRET=dev-b-chuoi-thu-khong-dung-o-ban-that \
BETTER_AUTH_URL=http://localhost:3585 \
RESEND_API_KEY=khoa-gia-ban-build-khong-gui \
OWNER_PHONE_KEY="$KHOA_SO" \
MAIL_FROM=khong-gui@mau.quy-hang.test \
  nohup perl -e 'setpgrp(0,0); exec @ARGV' "$GOC/node_modules/.bin/next" start -p 3585 apps/web >>"$LOGF" 2>&1 &
echo $! > "$PIDF"
for i in $(seq 1 120); do
  curl -fsS http://localhost:3585/api/v1/health >/dev/null 2>&1 && break
  [ "$i" = 120 ] && { tat_build; nha; echo "DỰNG D: bản build không lên — xem $LOGF"; exit 2; }
  sleep 1
done
CK=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).join("; "))' "$PHIEN")
[ "$(curl -s -o /dev/null -w '%{http_code}' -H "cookie: $CK" http://localhost:3585/api/v1/me)" = 200 ] || { tat_build; nha; echo "DỰNG D: phiên giữ của do-cuon không vào được bản build"; exit 2; }
echo "bản build lên ở http://localhost:3585 · nhật ký $LOGF"
echo "cookie phiên do-cuon: $PHIEN"
