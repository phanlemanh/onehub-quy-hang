## Luật riêng của kho onehub-quy-hang (chép vào LUAT.md của đợt nen-2)

Đợt thứ hai của kho. Luật 1–16 giữ nguyên ý của đợt nen-dau, chỉ đổi cổng và tên dãy ở luật 7; luật 17 trở đi là của
bốn hàng đợt này, mỗi luật đến từ chỗ hàng chạm tệp bảo vệ hay đứng trên kết luận của đợt trước.

1. Bốn bất biến của `AGENTS.md` (cách ly giữa công ty, chủ nhà không rời công ty, người bấm gửi, phần nội bộ không ra
   trang khách) không hàng nào nới. Hàng T3 đọc lại chúng trước Cổng Phạm vi và hợp đồng nêu bất biến nào nó chạm.
2. Bảng mới bật luật theo dòng trong cùng migration; `npm run db:migrate && npm run db:test` xanh trên Postgres của
   dãy trước khi trình Cổng Bằng chứng.
3. Migration lấy số `NNN` kế tiếp tính trên `origin/main` lúc tạo; trước khi gộp, gộp `origin/main` vào nhánh, thấy
   trùng số thì đổi số của mình (migration chưa commit lên `main` thì chưa bất biến). Không trỏ tới bảng hay cột tạo
   ở migration có số lớn hơn.
4. Dữ liệu cá nhân thật không vào kho, kể cả ca kiểm của hàng 11: `[Tên]`, `0900 000 0xx`, mọi bản ghi mang nhãn
   mẫu. Ca kiểm dùng bộ dữ liệu mẫu của hàng 5, không tự sinh bộ riêng.
5. Đợt này không có bài thử. Mã dựng nằm trong vùng của hàng (`ranh_gioi` ở `hang-viec.json`); chạm ngoài vùng thì
   gửi yêu cầu `cham-tep` trước.
6. Hàng đổi điều đang đúng của sản phẩm thì sửa `docs/product/tham-chieu.md` trong cùng PR.
7. Cổng 3460 và Postgres 5544 là của chủ kho; 3461–3463 / 5545–5547 là của các dãy đợt nen-dau, 3462, 3466, 3468 là
   của các lệnh chấm trong `_acceptance/config.yaml`. Mỗi dãy chạy dev và Postgres riêng: N → 3471 / 5551,
   A → 3472 / 5552, D → 3473 / 5553, container `quy-hang-db-<dãy>`. Đầu mỗi lần thức, phiên giám sát kiểm Docker còn
   chạy (`docker info`) trước khi cấp lượt `s4`.
8. Cấm `pkill -f`, `pkill -P`, `killall` lên `node`, `next`. Chỉ `kill <PID>` đúng tiến trình mình đã ghi lại lúc khởi
   chạy.
9. Gộp `main` mà có đổi `package.json` hay `package-lock.json` thì chạy `npm install` trước khi lên làn đo.
10. Không bao giờ `gh pr merge --auto`. Gộp chỉ qua lệnh `gop` của đợt, dưới khoá `merge`.
11. `PRODUCT-MAP.md` và `LO-TRINH.html` không sửa tay; xung đột thì vẽ lại bằng `product-map.mjs` sau khi gộp
    `origin/main`.
12. Tệp dùng chung (`CONTEXT.md`, `_acceptance/config.yaml`, `docs/product/tham-chieu.md`, `.env.example`,
    `packages/core/src/index.ts`, `packages/api/src/app.ts`) chỉ thêm dòng, không sửa hay xoá dòng của người khác;
    xung đột thì giữ cả hai bên. Sửa dòng có sẵn thì gửi yêu cầu `cham-tep`.
13. PR mở ở dạng nháp tới lúc trình Cổng Bằng chứng; chuyển sẵn sàng bằng `gh pr ready`.
14. Một kiểm tra CI đỏ ở phần PR không chạm: đối chiếu cùng kiểm tra trên `main`, chạy lại riêng trên máy; cả hai xanh
    thì chạy lại job đỏ một lần (`gh run rerun <id> --failed`) trước khi sửa gì.
15. Không nâng plugin `acceptance-gate`/`feature-loop` giữa một lượt S4.
16. Việc cần chủ kho cầm điện thoại (bài kiểm rút mạng của hàng 13 trên máy thật) gửi một yêu cầu `can-nguoi` gom đủ
    các bước cần làm, để chủ kho làm trong một lần ngồi.
17. Dãy X là dãy neo: giữ ba hàng của đợt nen-dau (2, 5, 8) để `sau` của đợt này chặn đúng. Dãy X nghỉ, không mở
    chip, không ai ghi danh vào. Hàng neo đã ký Cổng Đáng ở đợt trước; đổi chúng là việc của đợt nen-dau.
18. Hàng 11 chạm lớp `source` (bất biến 2). Trần `never_leaves_company` ở `packages/core/src/data-classes.ts` và ràng
    buộc của cơ sở dữ liệu không nới; cần đổi `data-classes.ts` thì gửi `cham-tep` ở S1. Ẩn ở lõi và API, không ẩn ở
    giao diện.
19. Hàng 13 đứng trên ADR chọn bộ đồng bộ của hàng 2: đọc ADR ấy trước S1, không đổi bộ đồng bộ đã chọn trong hàng
    này. Thấy ADR không đủ cho hàng 13 thì gửi `can-nguoi`, không tự chọn lại.
20. Hàng 11 và 12 chạy song song ở hai dãy, cùng đứng trên hàng 8 và cùng có thể thêm migration hay sửa bộ kiểm cách ly
    `packages/db/tests/isolation.test.mjs`: luật 3 về số migration và luật 12 về chỉ thêm dòng áp cho cả bộ kiểm.
