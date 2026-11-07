#!/usr/bin/env bash
# Đo XEN KẼ theo cặp (giám sát 07/11): bản tốt (worktree <tốt>, build sẵn) rồi bản đang xét (<sha>, build trong worktree
# <xét>), ngay lượt nhau nên cùng tải; mỗi bước <cap> cặp. So tỉ lệ khung > 50 ms của bản xét với bản tốt cùng cặp.
#   bash do-cap.sh <worktree tốt> <worktree xét> <sha> [cap=3]
# Bảng: .acceptance-runs/va-bang-hang-e11-hieu-nang/cap.tsv (sha · cặp · tốt: tỷ lệ/p95 · xét: tỷ lệ/p95 · tải đầu cặp).
set -euo pipefail
TOT=$1; W=$2; SHA=$3; CAP=${4:-3}
GOC=$(cd "$(dirname "$0")/../../.." && pwd)
RA=$GOC/.acceptance-runs/va-bang-hang-e11-hieu-nang
DO=$GOC/_acceptance/va-bang-hang-e11-hieu-nang/thu/do-cuon-d.mjs
BANG=$RA/cap.tsv
mkdir -p "$RA"
[ -f "$BANG" ] || printf 'sha\tcap\ttot_ty_le\ttot_p95\txet_ty_le\txet_p95\ttai_1p\tluc\n' > "$BANG"
cd "$W"
# BAN_THU=1: đo đúng cây làm việc của <xét> (bản thử chưa commit), <sha> chỉ là nhãn; build lại khi nội dung diff đổi.
if [ -n "${BAN_THU:-}" ]; then
  KHOA=$(git rev-parse "HEAD:package-lock.json")
  DAU="$SHA-$(git diff HEAD | shasum | cut -c1-12)"
else
  git checkout -q --detach "$SHA"
  KHOA=$(git rev-parse "$SHA:package-lock.json")
  DAU=$SHA
fi
if [ "$(cat .khoa-cai 2>/dev/null)" != "$KHOA" ]; then npm ci --silent >/dev/null 2>&1; echo "$KHOA" > .khoa-cai; fi
# Cùng sha đã build ở lượt trước thì giữ bản build.
if [ "$(cat .da-build 2>/dev/null)" != "$DAU" ]; then
  rm -rf apps/web/.next .da-build
  npm run build -w @quy-hang/web >"$RA/build-${SHA:0:8}.log" 2>&1 || { echo "build lỗi ở ${SHA:0:8}"; exit 2; }
  echo "$DAU" > .da-build
fi
mot() { # $1 cây · $2 nhãn → in "tỷ_lệ<TAB>p95"
  QH_D_GOC_DO="$1" QH_D_NHAN="$2" node "$DO" --khong-build >/dev/null 2>&1 || true
  local J=$RA/so-do-cuon-$2.json
  if [ -f "$J" ]; then jq -r '[(.trung_vi.ty_le_cham // "-"), (.trung_vi.p95 // "-")] | @tsv' "$J"; rm -f "$J"; else printf -- '-\t-\n'; fi
}
for i in $(seq 1 "$CAP"); do
  TAI=$(sysctl -n vm.loadavg | awk '{print $2}')
  A=$(mot "$TOT" "tot-${SHA:0:8}-$i")
  B=$(mot "$W" "xet-${SHA:0:8}-$i")
  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "${SHA:0:8}" "$i" "$A" "$B" "$TAI" "$(date -u +%FT%TZ)" >> "$BANG"
done
tail -n "$CAP" "$BANG" # chỉ các cặp vừa đo — in cả bảng cũ làm cặp đầu bị đếm hai lần (07/11)
