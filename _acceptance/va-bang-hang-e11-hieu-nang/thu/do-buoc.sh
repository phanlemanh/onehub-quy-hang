#!/usr/bin/env bash
# Một bước chia đôi của va-bang-hang-e11-hieu-nang: dựng cây ở <sha> trong worktree chia đôi, build bản web, chạy máy đo
# cuộn của dãy D (do-cuon-d.mjs — ba lượt hợp lệ + đối chứng bận) <lan> lần, ghi mỗi lần một dòng vào bảng số.
#   bash do-buoc.sh <worktree chia đôi> <sha> [lan=3]
# Bảng số: .acceptance-runs/va-bang-hang-e11-hieu-nang/chia-doi.tsv (sha · lần · tỷ lệ khung > 50 ms · p95 · kết luận · tải).
set -euo pipefail
W=$1; SHA=$2; LAN=${3:-3}
GOC=$(cd "$(dirname "$0")/../../.." && pwd)
RA=$GOC/.acceptance-runs/va-bang-hang-e11-hieu-nang
mkdir -p "$RA"
BANG=$RA/chia-doi.tsv
[ -f "$BANG" ] || printf 'sha\tlan\tty_le_cham\tp95\tket_luan\ttai_1p\tluc\n' > "$BANG"
cd "$W"
git checkout -q --detach "$SHA"
# Đổi phụ thuộc giữa hai bước thì cài lại; không thì giữ node_modules.
KHOA=$(git rev-parse "$SHA:package-lock.json")
if [ "$(cat .khoa-cai 2>/dev/null)" != "$KHOA" ]; then
  npm ci --silent >/dev/null 2>&1
  echo "$KHOA" > .khoa-cai
fi
rm -rf apps/web/.next
npm run build -w @quy-hang/web >"$RA/build-${SHA:0:8}.log" 2>&1 || { echo "build lỗi ở ${SHA:0:8} — xem $RA/build-${SHA:0:8}.log"; exit 2; }
for i in $(seq 1 "$LAN"); do
  # Máy đo nhạy với tải (06/11: cùng commit 0,66% lúc rảnh, trượt lúc tải 9–15) — chờ tải 1 phút dưới TRAN_TAI (mặc định
  # 4), tối đa 90 phút; quá thì vẫn đo và bảng ghi tải thật để người đọc loại.
  for _ in $(seq 1 180); do
    awk -v t="$(sysctl -n vm.loadavg | awk '{print $2}')" -v m="${TRAN_TAI:-4}" 'BEGIN{exit !(t < m)}' && break
    sleep 30
  done
  TAI=$(sysctl -n vm.loadavg | awk '{print $2}')
  set +e
  RA_DO=$(QH_D_GOC_DO="$W" QH_D_NHAN="${SHA:0:8}-$i" node "$GOC/_acceptance/va-bang-hang-e11-hieu-nang/thu/do-cuon-d.mjs" --khong-build 2>&1)
  set -e
  J=$RA/so-do-cuon-${SHA:0:8}-$i.json
  if [ -f "$J" ]; then
    printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "${SHA:0:8}" "$i" "$(jq -r '.trung_vi.ty_le_cham' "$J")" "$(jq -r '.trung_vi.p95' "$J")" "$(jq -r '.ket_luan' "$J")" "$TAI" "$(date -u +%FT%TZ)" >> "$BANG"
  else
    printf '%s\t%s\t-\t-\tkhong-do-duoc: %s\t%s\t%s\n' "${SHA:0:8}" "$i" "$(echo "$RA_DO" | tail -1 | tr '\t' ' ')" "$TAI" "$(date -u +%FT%TZ)" >> "$BANG"
  fi
done
grep "^${SHA:0:8}" "$BANG"
