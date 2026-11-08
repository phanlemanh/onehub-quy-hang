---
slug: va-nut-ci-ag-root
at: 2026-11-07T22:52:28Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-20261107T225151Z-4 ghi nguồn «mot-loi», nhưng lý do chỉ nói lối kia tốn hơn chứ không nói nó chết; lối sửa E4 rồi ký lại vẫn còn. Giữ nguyên rồi ghim lại một hồ sơ đã ký mà phép đo E4 mù là lựa chọn của người ký. | Làn ghim lại chạy lại năm eval của hồ sơ kia, E4 vẫn xanh trên máy có kit, hồ sơ được ghim mới; chữ ký cũ phủ một phép đo mù mà người ký không biết. | Chuyển thành câu Hỏi cho chủ kho trên thẻ, khuyến nghị giữ nguyên và ghim lại, ghi rõ E4 mù ở Notes. | human-gate1: dòng sổ mới thay -4 (nguồn chỉ-người, khuyến nghị giữ nguyên + ghim lại); Notes hợp đồng ghi E4 mù, bằng chứng chuyển sang AC-1 |
| P0 | design | Sổ d-20261107T225151Z-3 chỉ loại lối «đo trên máy có kit»; lối đo trên máy chủ GitHub thật không bị loại bằng ràng buộc nào. | Máy chủ GitHub khác máy mô phỏng làm lượt bấm đỏ lại vì lỗi cùng lớp trong khi E1 xanh. | Nêu lối chạy trên máy chủ thật và ràng buộc đã loại nó. | fixed: dòng sổ mới thay -3 — nút tự chặn ref khác main nên trước gộp không có lượt chạy thật; máy chủ thật là Đường đo sau gộp |
| P1 | evals | E1 chỉ rút dòng run rồi tự gán biến, chạy bằng bash -c; E2 chỉ kiểm chuỗi có mặt, không kiểm CLAUDE_PLUGIN_ROOT tới được bước «Ghim lại». | Bước lấy kit chỉ đặt biến ở env của riêng nó; E1, E2 vẫn xanh còn máy chủ đỏ. | E1 dựng môi trường từ tệp luồng; thêm bản phá E2 biến chỉ ở env của bước khác. | fixed: E1 chạy khối run của bước lấy kit (RUNNER_TEMP, GITHUB_ENV tạm), rồi bước «Ghim lại» với env job + GITHUB_ENV + env bước, working-directory, bash --noprofile --norc -eo pipefail; E2 thêm vế thứ tự + ca phá thứ tư |
| P1 | evals | AC-1 hứa ghi pin nhưng expected của E1 không đo dòng kind repin. | Làn thoát 0 nhưng ghi repin-do; E1 xanh, Đường đo phán CHẾT. | Thêm vế sổ chạy có kind repin, không repin-do; đối chứng không pin. | fixed: E1 thêm «làn ghi pin: run-log có dòng kind repin, không repin-do», đối chứng đòi không có dòng repin |
| P2 | contract | Đường đo không ghim ref của lượt bấm. | Bấm từ nhánh PR #192 chạy luồng cũ chưa có --ag-root, phán CHẾT oan. | Ghi rõ bấm từ main, kèm vế log mang --ag-root. | fixed: Đường đo ghi chạy từ ref main (nút từ chối ref khác), nhật ký bước «Ghim lại» phải mang --ag-root |
