#!/usr/bin/env bash
# Thước E11 theo cặp (va-bang-hang-e11-hieu-nang, giám sát chốt 07/11): đo xen kẽ bản tốt 028f5636 (bản đã ký của
# bang-hang-kieu-sheet) và bản xét (mặc định HEAD) cùng tải, 3 cặp; đạt khi trung vị tỉ số khung > 50 ms (xét/tốt)
# ≤ 1,2 VÀ trung vị tỷ lệ khung > 50 ms của bản xét ≤ 1%. Không nới ngưỡng E11.
#   bash kiem-e11.sh            # xét HEAD
#   E11_SHA=<sha> bash kiem-e11.sh   # xét một commit khác (đối chứng: fbdad5ad phải đỏ)
# Dựng thiếu gì thì dựng: Postgres dãy D (5575/e11) qua dung-d.mjs, worktree bản tốt và bản xét dưới
# .acceptance-runs/va-bang-hang-e11-hieu-nang/ (build một lần theo sha). Bảng số: cap.tsv cạnh đó.
set -euo pipefail
DAY=$(cd "$(dirname "$0")" && pwd)
GOC=$(cd "$DAY/../../.." && pwd)
RA=$GOC/.acceptance-runs/va-bang-hang-e11-hieu-nang
TOT_SHA=028f56366fb9e425239b7642b861e7ec0e35c078
XET_SHA=$(git -C "$GOC" rev-parse "${E11_SHA:-HEAD}")
CAP=${E11_CAP:-3}
mkdir -p "$RA"

if ! docker exec quy-hang-db-dkn-D psql -U postgres -d e11 -qtAc 'select 1' >/dev/null 2>&1; then
  (cd "$GOC" && node "$DAY/dung-d.mjs") >"$RA/dung-d.log" 2>&1 || { echo "E11 cặp: không dựng được Postgres dãy D — xem $RA/dung-d.log"; exit 2; }
fi
# Cơ sở dữ liệu theo kịp migration của bản xét (chỉ thêm; bản tốt chạy được trên lược đồ mới hơn).
(cd "$GOC" && DATABASE_URL=postgres://postgres:quyhang@localhost:5575/e11 npm run db:migrate >"$RA/migrate.log" 2>&1) || { echo "E11 cặp: migrate lỗi — xem $RA/migrate.log"; exit 2; }

dung_wt() { # $1 thư mục · $2 sha → worktree đã cài và build đúng sha
  if [ ! -d "$1" ]; then git -C "$GOC" worktree add -q --detach "$1" "$2"; fi
  git -C "$1" checkout -q --detach "$2"
  local khoa; khoa=$(git -C "$1" rev-parse "$2:package-lock.json")
  if [ "$(cat "$1/.khoa-cai" 2>/dev/null)" != "$khoa" ]; then (cd "$1" && npm ci --silent >/dev/null 2>&1); echo "$khoa" > "$1/.khoa-cai"; fi
  if [ "$(cat "$1/.da-build" 2>/dev/null)" != "$2" ]; then
    rm -rf "$1/apps/web/.next" "$1/.da-build"
    (cd "$1" && npm run build -w @quy-hang/web >"$RA/build-${2:0:8}.log" 2>&1) || { echo "E11 cặp: build lỗi ở ${2:0:8} — xem $RA/build-${2:0:8}.log"; exit 2; }
    echo "$2" > "$1/.da-build"
  fi
}
WT_TOT=$RA/wt-tot; WT_XET=$RA/wt-xet
dung_wt "$WT_TOT" "$TOT_SHA"
dung_wt "$WT_XET" "$XET_SHA"

RA_CAP=$(bash "$DAY/do-cap.sh" "$WT_TOT" "$WT_XET" "$XET_SHA" "$CAP")
# Luật đo thêm khai trước (gap-probe P1): trung vị 3 cặp nằm trong vùng nhiễu 1,1–1,3 thì đo thêm 2 cặp, kết luận trên 5.
TV3=$(node -e 'const d=process.argv[1].trim().split("\n").map(l=>l.split("\t")).map(([,,a,,b])=>Number(b)/Number(a)).filter(Number.isFinite).sort((a,b)=>a-b);console.log(d.length?d[Math.floor(d.length/2)]:0)' "$RA_CAP")
if [ "$CAP" = 3 ] && awk -v t="$TV3" 'BEGIN{exit !(t>=1.1 && t<=1.3)}'; then
  echo "trung vị 3 cặp $TV3 trong vùng nhiễu 1,1–1,3 → đo thêm 2 cặp"
  RA_CAP="$RA_CAP"$'\n'"$(bash "$DAY/do-cap.sh" "$WT_TOT" "$WT_XET" "$XET_SHA" 2)"
fi
echo "$RA_CAP"
node - "$RA_CAP" <<'JS'
const dong = process.argv[2].trim().split("\n").map((l) => l.split("\t"));
const tv = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const tiSo = [], xet = [], tot = [];
for (const [, , t0, , x] of dong) { const a = Number(t0), b = Number(x); if (Number.isFinite(a) && Number.isFinite(b) && a > 0) { tiSo.push(b / a); xet.push(b); tot.push(a); } }
if (tiSo.length < 3) { console.log(`E11 cặp: chỉ ${tiSo.length} cặp đo được — không kết luận`); process.exit(2); }
const t = tv(tiSo), x = tv(xet);
console.log(`E11 cặp: tỉ số ${tiSo.map((v) => v.toFixed(2)).join(" ")} → trung vị ${t.toFixed(2)} (trần 1,2) · khung > 50 ms bản xét trung vị ${(x * 100).toFixed(2)}% (trần 1%) · bản tốt cùng cặp trung vị ${(tv(tot) * 100).toFixed(2)}%`);
if (t > 1.2) { console.log(`E11 cặp ĐỎ: tỉ số trung vị ${t.toFixed(2)} > 1,2`); process.exit(1); }
if (x > 0.01) { console.log(`E11 cặp ĐỎ: khung > 50 ms ${(x * 100).toFixed(2)}% > 1%`); process.exit(1); }
console.log("E11 cặp ĐẠT");
JS
