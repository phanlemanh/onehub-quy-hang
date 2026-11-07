#!/usr/bin/env bash
# Chia đôi CHIỀU NGƯỢC (07/11): giữa bản chậm <cũ> và bản nhanh <mới> trên first-parent, tìm commit đầu tiên đo cặp ĐẠT
# (kiem-e11.sh exit 0) — tức thay đổi đã gỡ chỗ chậm. exit 2 của kiem-e11 (không đo được) thì thử commit kề.
#   bash chia-doi-khoi.sh <cũ chậm> <mới nhanh>
set -uo pipefail
DAY=$(cd "$(dirname "$0")" && pwd)
DS=(); while read -r c; do DS+=("$c"); done < <(git rev-list --first-parent --reverse "$1..$2")
lo=-1; hi=$(( ${#DS[@]} - 1 ))   # lo: chỉ số cuối đã biết chậm (−1 = <cũ>); hi: chỉ số đầu đã biết nhanh
echo "chia đôi ngược ${#DS[@]} commit ${1:0:8}..${2:0:8}"
while [ $(( hi - lo )) -gt 1 ]; do
  mid=$(( (lo + hi) / 2 )); S=${DS[$mid]}
  RA=$(E11_SHA=$S bash "$DAY/kiem-e11.sh" 2>&1); ma=$?
  echo "${S:0:8} [$(( mid + 1 ))/${#DS[@]}] $(echo "$RA" | grep '^E11 cặp:' | tail -1) → mã $ma"
  if [ $ma = 0 ]; then hi=$mid; elif [ $ma = 1 ]; then lo=$mid; else echo "không đo được — dừng"; exit 3; fi
done
echo "commit nhanh đầu tiên: ${DS[$hi]} — $(git log -1 --format=%s ${DS[$hi]})"
