---
slug: va-thuoc-ci-moi-truong-that-ban-that
at: 2026-11-07T12:05:00Z
verdict: findings
p0: 1
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-3 và E3 chỉ đo bộ đọc của kit nhận con trỏ, không đo lệnh ghim lại mà chủ kho chạy có bỏ ô E3 không | Lệnh ghim lại vẫn chạy cach_ly_that, bộ kiểm cách ly ghi vào bản thật | Đo bộ chọn ô của làn ghim lại bỏ E3, đối chứng dương gỡ status not-run thì chọn lại | fixed: --thay gọi machineEvalIdsSkipped của kit (cùng hàm repin-lane dùng) — E3 bị bỏ, là ô duy nhất trỏ cach_ly_that; đối chứng dương gỡ «status: not-run» thì E3 được chọn; lượt ghim lại thật của chủ kho 07/11 ghi evals_not_run E3 |
| P1 | evals | Ma trận phá thử không có ca đảo thứ tự hay ca đặt chuỗi kết nối ở bước thứ ba | Dời deploy hook lên trước migration hay thêm chuỗi kết nối vào bước deploy hook mà thước vẫn xanh | Thêm hai ca, ma trận 7/7 | fixed: thêm «gọi Vercel trước migration» và «chuỗi kết nối bản thật ở bước gọi Vercel», mỗi ca đỏ đúng vế ghim |
| P2 | evals | Ma trận không chạm db:test và bốn vế vercel.json, cờ --vercel không ai dùng | Vế đọc vercel.json luôn ĐẠT mà E2 vẫn xanh | Ca db:test, ca qua --vercel, đối chứng dương | fixed: thêm «deploy chạy db:test», «vercel.json bật lại tự deploy main», «vercel.json đổi vùng khỏi sin1» qua --vercel; ma trận 10/10, đối chứng dương đi qua cả --ci lẫn --vercel; vế chỉ push main và ngoài ci-ok để ngoài (không đổi ở hàng này) |
| P2 | contract | Nửa sau ngưỡng SỐNG không có điều kiện ký, timebox chưa khai | PR nằm chờ mãi mà không hàng nào chịu trách nhiệm | Điều kiện ký rõ, timebox | fixed: Đường đo ghi lưới trước gộp chặn gộp tới khi moi-truong-that hết «bằng chứng cũ»; timebox đề xuất 3 ngày (tới 10/11), quá hạn giám sát mở hàng gỡ |
