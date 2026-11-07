# Kế hoạch: va-cdp-tat-chrome

Hợp đồng `_acceptance/va-cdp-tat-chrome/contract.md` (T2, làn V). Ba task, tuần tự (task 2 và 3 cần task 1).

| Task | Tệp | Việc | Kiểm từng task | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs` | Nhóm tiến trình riêng, sổ PID, `dong()` tắt chắc, bộ tắt lúc thoát và lúc nhận tín hiệu, người canh, dọn mồ côi cũ; API giữ nguyên | `node --check` + một lượt mở/đóng tay | E1–E6 | false |
| 2 | `_acceptance/va-cdp-tat-chrome/thu/con.mjs`, `thu/kiem-tat-chrome.mjs` | Tiến trình gọi con theo ca; bài đo chín ca tắt + mo-coi + api, đối chứng dương mỗi ca, thông điệp ghim; `--doi-chung-do <sha>` chạy trên bản cũ | Chạy từng ca trên bản sửa (xanh) | E1–E7 | false |
| 3 | — | Phá thử: chạy `--doi-chung-do 382a010c…` (bản cũ) → mọi ca tắt đỏ đúng thông điệp, api xanh | E7 thoát 0 | E7 | false |
