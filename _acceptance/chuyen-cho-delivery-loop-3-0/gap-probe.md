---
slug: chuyen-cho-delivery-loop-3-0
at: 2026-11-19T15:20:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ luật chọn ghim lại ghi nguồn mục-tiêu nhưng câu trích chỉ kể một lần ghim đã xảy ra; không quyết (a) để đỏ hồ sơ đỏ cả hai bên, (b) sửa phép đo hồ sơ đã ký mà giữ chữ ký, (c) nhánh xanh-trên-sửa đỏ-trên-chính — đánh đổi chỉ chủ kho cân được | Chủ kho ký Cổng Phạm vi tưởng luật đã có tiền lệ quyết; một hồ sơ đã ký đổi thước mà chữ ký cũ vẫn đứng; một hồ sơ đỏ vì máy nạp kit 2.38.1 bị xếp nợ cũ | Dòng sổ mới mang supersedes; (a), (b) thành câu hỏi ở Cổng Phạm vi; thiết kế nêu nhánh thứ tư | human-gate1: Hỏi-1 (sửa phép đo + ghim lại giữ chữ ký) và Hỏi-2 (nợ cũ để nguyên) thay dòng d-6; thiết kế mục 4 thành bảng bốn nhánh; đối chứng nhánh chính chạy bằng kit CI 2.39.0 đặt qua CLAUDE_PLUGIN_ROOT, không qua tim-kit |
| P1 | contract | AC-7 đòi sửa tệp đo của hồ sơ cũ nhưng AC-8 chỉ cho run-log và evidence-report; E8 cấy contract của hồ sơ ghim lại | Sửa đúng một tệp đo như AC-7 đòi thì E8 đỏ, hoặc nới danh sách lúc chấm và E8 hết gác | Tệp đo được phép nêu đích danh ở hợp đồng; E8 rút danh sách từ hợp đồng; bản cấy evals.yaml và chữ ký | fixed: AC-8 nêu tệp đo theo mục «Ghim lại — kết quả»; bài đo đọc mục ấy (docKetQuaGhim); bản cấy thêm contract và evals.yaml của hồ sơ ghim lại, đối chứng tệp đo không được nêu tên thì bị liệt; chữ ký do E7 gác |
| P1 | evals | E7 lặp trên danh sách của hợp đồng — đo tài liệu; không eval nào đo lại phân loại đỏ/xanh trên 36 ứng viên; phân loại phụ thuộc máy | Một hồ sơ đỏ trên bản sửa bị bỏ sót, E7 xanh, nhánh chính nhận hồ sơ có bài đo đỏ | Ca máy chạy làn khô trên HEAD và merge-base đủ 36 ứng viên bằng kit theo thẻ; assert quan hệ các tập | fixed: phân loại cuối chạy làn khô --tung-ho-so trên HEAD (kit 3.0.0) và nhánh chính (kit 2.39.0), ghi evidence/phan-loai-ghim.json kèm sha; E7 đòi cây ngoài _acceptance/ của sha bằng HEAD, đủ 36 ứng viên viết trước, hai kit ghim, đỏ HEAD ⊆ đỏ nhánh chính, hai tập của hợp đồng bằng tệp; làn khô không chạy lại trong lượt chấm vì tốn hơn một giờ — deferred phần ấy, ghi ở thiết kế |
| P1 | evals | E1 chỉ đo chuỗi, chiều âm; không đối chiếu bước Ghim lại với cây kit 3.0 | Xoá bước Ghim lại hay gõ sai tên script, E1 vẫn xanh; nút đỏ lần bấm đầu | Phân giải mọi đường $CLAUDE_PLUGIN_ROOT và $RUNNER_TEMP/kit trên cây kit theo thẻ; vế dương cho lệnh gọi làn | fixed: E1c (doi-chung.mjs --duong) phân giải mọi đường của hai luồng trên cây v3.0.0, đối chứng đường bố cục cũ không tồn tại; E1 thêm vế dương đúng một lệnh gọi ../feature-loop/scripts/repin-lane.mjs, bản phá bỏ bước ấy |
| P1 | evals | E5 không có ma trận viết trước; paths sót .sh, .yml, .cjs, tệp không đuôi; bảng tên chép tay không nói nguồn | Một hook .sh còn gọi road-map:… mà E5 vẫn 0 chỗ | Ghim tập loại trừ có tên; mọi tệp bỏ khớp một luật; bảng đối chiếu với kit theo thẻ; bản cấy .sh và tệp không đuôi | fixed: quét mọi tệp git ls-files, sáu luật loại trừ có tên, mỗi tệp sống hoặc bị đúng một luật bỏ; tập quét phải có .sh, .yml, .cjs, tệp không đuôi dưới .githooks/; bảng ở rang/bang-ten.mjs ghi nguồn, E1c đối chiếu 14 tên mới với cây kit 3.0.0; bản cấy thêm .githooks/z và scripts/w.sh |
