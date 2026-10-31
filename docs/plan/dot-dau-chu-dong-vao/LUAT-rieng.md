## Luật riêng của kho onehub-quy-hang (chép vào LUAT.md của đợt dau-chu-dong-vao)

Đợt thứ ba của kho. Luật 1–16 giữ ý của đợt nen-2, đổi cổng ở luật 7 và ví dụ ở luật 16; luật 17 trở đi là của các
hàng đợt này, mỗi luật đến từ chỗ hàng chạm tệp bảo vệ, chạm lớp khó đảo, hay đứng trên kết luận của đợt trước.

1. Bốn bất biến của `AGENTS.md` (cách ly giữa công ty, chủ nhà không rời công ty, người bấm gửi, phần nội bộ không ra
   trang khách) không hàng nào nới. Hàng T3 đọc lại chúng trước Cổng Phạm vi và hợp đồng nêu bất biến nào nó chạm.
2. Bảng mới bật luật theo dòng trong cùng migration; `npm run db:migrate && npm run db:test` xanh trên Postgres của
   dãy trước khi trình Cổng Bằng chứng.
3. Migration lấy số `NNN` kế tiếp tính trên `origin/main` lúc tạo; trước khi gộp, gộp `origin/main` vào nhánh, thấy
   trùng số thì đổi số của mình (migration chưa commit lên `main` thì chưa bất biến). Không trỏ tới bảng hay cột tạo
   ở migration có số lớn hơn.
4. Dữ liệu cá nhân thật không vào kho, kể cả ca kiểm của hàng 62: `[Tên]`, `0900 000 0xx`, mọi bản ghi mang nhãn
   mẫu. Ca kiểm dùng bộ dữ liệu mẫu của hàng 5, không tự sinh bộ riêng; hàng mang `du_lieu: gia` (14, 24) đo trên
   bộ ấy.
5. Đợt này không có bài thử. Mã dựng nằm trong vùng của hàng (`ranh_gioi` ở `hang-viec.json`); chạm ngoài vùng thì
   gửi yêu cầu `cham-tep` trước.
6. Hàng đổi điều đang đúng của sản phẩm thì sửa `docs/product/tham-chieu.md` trong cùng PR.
7. Cổng 3460 và Postgres 5544 là của chủ kho; 3461–3463 / 5545–5547 của đợt nen-dau, 3471–3474 / 5551–5554 của đợt
   nen-2; 3462, 3466, 3468 của các lệnh chấm trong `_acceptance/config.yaml`. Mỗi dãy chạy dev và Postgres riêng:
   B → 3481 / 5561, H → 3482 / 5562, L → 3483 / 5563, G → 3484 / 5564, D → 3485 / 5565, container `quy-hang-db-<dãy>`.
   Lúc mở worktree của dãy, giám sát tạo `.env.local` một dòng `DATABASE_URL` tới Postgres của dãy (mật khẩu thử của
   `AGENTS.md`; git bỏ qua tệp). Đầu mỗi lần thức, giám sát kiểm Docker còn chạy (`docker info`) trước khi cấp lượt `s4`.
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
16. Việc cần chủ kho cầm máy thật (ví dụ thông báo trên điện thoại của hàng 26, quay số từ máy tính của hàng 30, bài
    kiểm rút mạng của hàng 61) gửi một yêu cầu `can-nguoi` gom đủ các bước, để chủ kho làm trong một lần ngồi.
17. Dãy X là dãy neo: giữ chín hàng đã ký (1, 5, 9, 11, 12, 13, 53, 58, 59) để `sau` của đợt này chặn đúng. Dãy X
    nghỉ, không mở chip, không ai ghi danh vào.
18. Bản đồ khuôn (hàng 58–60, `docs/design/vo-va-ia.md`): màn đầu tiên của một nhóm chưa có trong `design/patterns/`
    — Bảng hàng (14), Hồ sơ căn (17), Hôm nay (22), Ô nhận lead (24), Cuộc gọi (28) — tạo tệp nhóm
    `design/patterns/<nhóm>.md` và khuôn ngay trong vòng ấy, theo khối đích ở `vo-va-ia.md` §2; vòng sau của nhóm đi qua
    khuôn. Mỗi vòng chỉ thêm tệp nhóm của mình và khai nó ở Cổng Phạm vi; sửa tệp nhóm khác là `cham-tep`.
19. Hàng 62 chạm lớp `source` (bất biến 2): trần `never_leaves_company` và ràng buộc của cơ sở dữ liệu không nới. Khoá
    thử ở `.env.local` của dãy; tên biến vào `.env.example` (tệp bảo vệ — `cham-tep` ở S1). Khoá thật của môi trường
    chạy thật (Vercel, secret GitHub — ADR-0009) do giám sát đặt theo yêu cầu `khac` của thợ, thợ không tự đặt; số chủ
    không bao giờ ra log hay thông điệp lỗi.
20. Hàng 18 (ảnh căn) và hàng 19: ngăn nội bộ là lớp `source`/nội bộ — không ra trang khách, không lưu trên máy (bất biến
    2 và 4), ẩn ở lõi chứ không ở giao diện. Chọn nơi giữ ảnh mà tốn tiền hay công khai → `can-nguoi` trước khi dựng.
21. Hàng 61 đứng trên ADR bộ đồng bộ (ADR-0006 bài thử đồng bộ) và hợp đồng hàng 13: không đổi bộ đồng bộ, không đổi
    luật Cần xem với lỗi 4xx thật. Thấy ADR không đủ thì `can-nguoi`, không tự chọn lại.
22. Hàng 10 chạm `packages/connect` (T3): khuôn giữ `.strict()`; nâng phiên bản khuôn ghi thành ADR; nhận qua một thoả
    thuận (`agreements.ts`, tệp bảo vệ — `cham-tep` ở S1); không đọc cơ sở dữ liệu của Invest. Phía Invest đẩy gói thật
    là việc ngoài kho, không phải tiêu chí của hàng. Hàng 63 xong trước hàng 10 trong dãy D.
23. Hàng 24, 25 và 26 chạm việc chạy nền (chia lead, hạn 15/30 phút, thông báo): việc nền tốn tiền (dịch vụ hàng đợi,
    gói Vercel cao hơn) → `can-nguoi`. Thông báo chỉ báo, không gửi tin thay người (bất biến 3).
24. Số migration và số ADR: giám sát giữ chỗ lúc mở đợt cho các hàng T3 có thể cần (18, 24, 62, 10), tính trên
    `origin/main` lúc ấy; luật 3 vẫn áp khi gộp.
25. Phiên chờ chủ kho thì tiêu đề bắt đầu «⏳ CHỜ ANH: <việc>»; hết chờ thì đổi lại tên thường.
26. Mọi dãy được vẽ lại `PRODUCT-MAP.md` và `LO-TRINH.html` bằng `product-map.mjs` trong PR của mình, không cần
    `cham-tep` (luật 11).
