## Luật riêng của kho onehub-quy-hang (chép vào LUAT.md của đợt nen-dau)

Đợt đầu tiên của kho. Luật 1–6 nhắc lại bất biến và luật làm việc của `AGENTS.md` ở chỗ thợ dễ vấp nhất khi chạy song
song; luật 7 trở đi mang từ các đợt của crm, mỗi luật đến từ một ca đã xảy ra ở đó.

1. Bốn bất biến của `AGENTS.md` (cách ly giữa công ty, chủ nhà không rời công ty, người bấm gửi, phần nội bộ không ra
   trang khách) không hàng nào nới. Hàng T3 đọc lại chúng trước Cổng Phạm vi và hợp đồng nêu bất biến nào nó chạm.
2. Bảng mới bật luật theo dòng trong cùng migration; `npm run db:migrate && npm run db:test` xanh trên Postgres của
   dãy trước khi trình Cổng Bằng chứng.
3. Migration lấy số `NNN` kế tiếp tính trên `origin/main` lúc tạo; trước khi gộp, gộp `origin/main` vào nhánh, thấy
   trùng số thì đổi số của mình (migration chưa commit lên `main` thì chưa bất biến). Không trỏ tới bảng hay cột tạo
   ở migration có số lớn hơn.
4. Dữ liệu cá nhân thật không vào kho, kể cả dữ liệu mẫu của hàng 5: `[Tên]`, `0900 000 0xx`, mọi bản ghi mang nhãn
   mẫu.
5. Bài thử (hàng 1, 2, 3) kết bằng một ADR mới trong `docs/adr/` nêu số đo và lựa chọn; mã thử nằm trong
   `_acceptance/<slug>/` hoặc nhánh thử, không thành mã sản phẩm khi chưa có hàng dựng.
6. Hàng đổi điều đang đúng của sản phẩm thì sửa `docs/product/tham-chieu.md` trong cùng PR.
7. Cổng 3460 và Postgres 5544 là của chủ kho. Mỗi dãy chạy dev và Postgres riêng: Q → 3461 / 5545, G → 3462 / 5546,
   T → 3463 / 5547, container `quy-hang-db-<dãy>`. Đầu mỗi lần thức, phiên giám sát kiểm Docker còn chạy
   (`docker info`) trước khi cấp lượt `s4`.
8. Cấm `pkill -f`, `pkill -P`, `killall` lên `node`, `next`. Chỉ `kill <PID>` đúng tiến trình mình đã ghi lại lúc khởi
   chạy.
9. Gộp `main` mà có đổi `package.json` hay `package-lock.json` thì chạy `npm install` trước khi lên làn đo.
10. Không bao giờ `gh pr merge --auto`. Gộp chỉ qua lệnh `gop` của đợt, dưới khoá `merge`.
11. `PRODUCT-MAP.md` và `LO-TRINH.html` không sửa tay; xung đột thì vẽ lại bằng `product-map.mjs` sau khi gộp
    `origin/main`.
12. Tệp dùng chung (`CONTEXT.md`, `_acceptance/config.yaml`, `docs/product/tham-chieu.md`, `.env.example`) chỉ thêm
    dòng, không sửa hay xoá dòng của người khác; xung đột thì giữ cả hai bên. Sửa dòng có sẵn thì gửi yêu cầu
    `cham-tep`.
13. PR mở ở dạng nháp tới lúc trình Cổng Bằng chứng; chuyển sẵn sàng bằng `gh pr ready`.
14. Một kiểm tra CI đỏ ở phần PR không chạm: đối chiếu cùng kiểm tra trên `main`, chạy lại riêng trên máy; cả hai xanh
    thì chạy lại job đỏ một lần (`gh run rerun <id> --failed`) trước khi sửa gì.
15. Không nâng plugin `acceptance-gate`/`feature-loop` giữa một lượt S4.
16. Việc cần chủ kho cầm điện thoại (bài thử Zalo, bài thử mất mạng) gửi một yêu cầu `can-nguoi` gom đủ các bước cần
    làm, để chủ kho làm trong một lần ngồi.
