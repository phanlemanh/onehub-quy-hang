---
slug: bang-hang-theo-loai-hinh
at: 2026-11-08T07:40:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ bỏ design-pass ghi nguồn mục tiêu nhưng câu trích không quyết việc bỏ; lối dựng bản bấm được vẫn sống [doi-gia-nhanh#F1] | Cổng Phạm vi duyệt bằng chữ ba lựa chọn nhìn; lần đầu thấy màn ở E8, phải mở lại phạm vi | Thay dòng bằng câu chỉ người có, lên thẻ thành Hỏi | human-gate1: dòng d-…-7 bị thay bởi Hỏi-3 (chỉ người, khuyến nghị duyệt bằng chữ + hình, lối khác dựng bản bấm được) |
| P0 | contract | Dòng để ngoài vòng gộp ba thứ, câu trích chỉ phủ nạp lô mẫu; điện thoại và chỗ lưu trường căn ngoài khu là chọn của người | Người ký không biết bản thật hàng lô vẫn Chưa rõ, đất ngoài khu toàn «—» | Tách dòng; hai thứ thành câu chỉ người; Notes nói điều người dùng thật thấy | human-gate1: dòng d-…-8 thay bởi một dòng nạp lô mẫu (giữ câu trích) + Hỏi-4 (điện thoại, chỗ lưu trường); Notes hợp đồng thêm điều người dùng thật thấy |
| P0 | design | Dòng nguồn dữ liệu ghi một lối nhưng lối ghép ở đường đọc danh sách hàng và lối đọc từng căn còn sống [va-nut-ci-ag-root#F2] | Cổng tin chỉ có một lối, mở đường v1 mới | Nêu đủ lối, căn cứ trích dẫn | fixed: dòng d-…-3 thay bằng dòng nguồn mục tiêu trích luật khuôn KH-bh-tren-may (thuộc tính căn ghép từ danh mục giữ trên máy), nêu vì sao hai lối kia trái luật; đường mới chỉ thêm khoá |
| P1 | contract | Cột vị trí (Hỏi-1) không có AC, eval | Hàng ngoài khu vẫn «Căn ngoài khu», mọi eval vẫn xanh | Thêm vế vào AC, ca E2, bước E8 | fixed: AC-2 thêm vế cột vị trí theo Hỏi-1; E2 thêm ca tiêu đề và ô ba dạng kèm đối chứng căn hộ; E8 thêm bước đọc tiêu đề và ô địa chỉ |
| P1 | evals | Đường lô không có lần đo xuyên bên ghi — bên đọc | Máy chủ trả khoá lô khác khoá máy khách đọc, cả E1 lẫn E7a xanh | Round-trip từ bên ghi thật | fixed: E7a đọc lại thân trả bằng buildLotIndex + lookupLot của lõi (cùng hàm Bảng hàng dùng ở E1), thân trả satisfies CatalogData (E14). Lô trên màn đang chạy: rejected — danh mục lô của máy dev là danh mục mặc định rỗng theo Hỏi-1 hàng 74; cài lô mẫu vào máy dev là đổi mã sản phẩm cho bài thử |

Ghi chú ngoài trần 5: E10 bỏ vế «không sửa dòng người khác» (hội đồng không có diff) — fixed. E9b thêm nhánh Hỏi-2 —
fixed. Timebox «…» của ô cơ hội — deferred: ghi ở Notes hợp đồng.
