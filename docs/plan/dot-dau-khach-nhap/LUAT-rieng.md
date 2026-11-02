## Luật riêng của kho onehub-quy-hang (chép vào LUAT.md của đợt dau-khach-nhap)

Đợt thứ tư của kho. Luật 1–16 giữ ý của đợt dau-chu-dong-vao, đổi cổng ở luật 7 và ví dụ ở luật 16; luật 17 trở đi là
của các hàng đợt này, mỗi luật đến từ chỗ hàng chạm tệp bảo vệ, chạm lớp khó đảo, hay đứng trên kết luận của đợt trước.

1. Bốn bất biến của `AGENTS.md` (cách ly giữa công ty, chủ nhà không rời công ty, người bấm gửi, phần nội bộ không ra
   trang khách) không hàng nào nới. Hàng T3 đọc lại chúng trước Cổng Phạm vi và hợp đồng nêu bất biến nào nó chạm.
   Đợt này chạm cả bốn: cửa ra (31, 34, 35, 36, 43), liên hệ (86, 89), nhập file có chủ nhà và số (65).
2. Bảng mới bật luật theo dòng trong cùng migration; `npm run db:migrate && npm run db:test` xanh trên Postgres của
   dãy trước khi trình Cổng Bằng chứng.
3. Migration lấy số `NNN` kế tiếp tính trên `origin/main` lúc tạo; trước khi gộp, gộp `origin/main` vào nhánh, thấy
   trùng số thì đổi số của mình (migration chưa commit lên `main` thì chưa bất biến). Không trỏ tới bảng hay cột tạo
   ở migration có số lớn hơn.
4. Dữ liệu cá nhân thật không vào kho, kể cả file bảng hàng thử của 64–67: `[Tên]`, `0900 000 0xx`, mọi bản ghi mang
   nhãn mẫu. Ca kiểm dùng bộ dữ liệu mẫu của hàng 5, không tự sinh bộ riêng; hàng mang `du_lieu: gia` (64, 65, 67) đo
   trên bộ ấy và các file bẩn có đáp án của hàng 64.
5. Đợt này không có bài thử. Mã dựng nằm trong vùng của hàng (`ranh_gioi` ở `hang-viec.json`); chạm ngoài vùng thì
   gửi yêu cầu `cham-tep` trước.
6. Hàng đổi điều đang đúng của sản phẩm thì sửa `docs/product/tham-chieu.md` trong cùng PR.
7. Cổng 3460 và Postgres 5544 là của chủ kho; 3461–3463 / 5545–5547 của đợt nen-dau, 3471–3474 / 5551–5554 của đợt
   nen-2, 3481–3485 / 5561–5565 của đợt dau-chu-dong-vao (container `quy-hang-db-<dãy>` của đợt ấy có thể còn chạy);
   3462, 3466, 3468 của các lệnh chấm trong `_acceptance/config.yaml`; 5562 còn bị `crm-postgres` giữ. Mỗi dãy chạy
   dev và Postgres riêng: L → 3491 / 5571, B → 3492 / 5572, G → 3493 / 5573, H → 3494 / 5574, D → 3495 / 5575,
   container `quy-hang-db-dkn-<dãy>`. Lúc mở worktree của dãy, giám sát tạo `.env.local` một dòng `DATABASE_URL` tới
   Postgres của dãy (mật khẩu thử của `AGENTS.md`; git bỏ qua tệp). Đầu mỗi lần thức, giám sát kiểm Docker còn chạy
   (`docker info`) trước khi cấp lượt `s4`.
8. Cấm `pkill -f`, `pkill -P`, `killall` lên `node`, `next`. Chỉ `kill <PID>` đúng tiến trình mình đã ghi lại lúc khởi
   chạy.
9. Gộp `main` mà có đổi `package.json` hay `package-lock.json` thì chạy `npm install` trước khi lên làn đo.
10. Không bao giờ `gh pr merge --auto`. Gộp chỉ qua lệnh `gop` của đợt, dưới khoá `merge`.
11. `PRODUCT-MAP.md` và `LO-TRINH.html` không sửa tay; xung đột thì vẽ lại bằng `product-map.mjs` sau khi gộp
    `origin/main`.
12. Tệp dùng chung (`CONTEXT.md`, `_acceptance/config.yaml`, `docs/product/tham-chieu.md`, `.env.example`,
    `packages/core/src/index.ts`, `packages/api/src/app.ts`, `apps/web/src/app/(app)/today/page.tsx`,
    `.agents/skills/quy-hang-ui/catalog.md`, `docs/design/vo-va-ia.md`, `packages/ui-lint/tests/kiem-chuan.test.mjs`) chỉ thêm dòng,
    không sửa hay xoá dòng của người khác; xung đột thì giữ cả hai bên. Sửa dòng có sẵn thì gửi yêu cầu `cham-tep`.
13. PR mở ở dạng nháp tới lúc trình Cổng Bằng chứng; chuyển sẵn sàng bằng `gh pr ready`.
14. Một kiểm tra CI đỏ ở phần PR không chạm: đối chiếu cùng kiểm tra trên `main`, chạy lại riêng trên máy; cả hai xanh
    thì chạy lại job đỏ một lần (`gh run rerun <id> --failed`) trước khi sửa gì.
15. Không nâng plugin `acceptance-gate`/`feature-loop` giữa một lượt S4.
16. Việc cần chủ kho cầm máy thật (mở bảng chia sẻ và dán link vào Zalo của hàng 34–35, cài lên màn hình chính và xoá
    dữ liệu khi đăng xuất của hàng 38, gọi lại một chạm của hàng 39, nhập lead trên điện thoại của hàng 51) gửi một yêu
    cầu `can-nguoi` gom đủ các bước, để chủ kho làm trong một lần ngồi. Giám sát gom các yêu cầu cùng lượt thành một.
17. Dãy X là dãy neo: giữ hai mươi hai hàng đã ký (3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 25, 26, 27, 53, 85,
    91) để
    `sau` của đợt này chặn đúng. Dãy X nghỉ, không mở chip, không ai ghi danh vào.
18. Bản đồ khuôn (hàng 58–60, `docs/design/vo-va-ia.md`) và hệ bố cục (hàng 91, ADR-0024): mỗi màn mới chọn một trong
    bảy bố cục có tên và khai ở Cổng Phạm vi. Màn đầu tiên của một nhóm chưa có trong `design/patterns/` — Gửi (34),
    Trang khách (35), Đã gửi (36), Hôm nay của đầu khách (37), Tôi (38), Phát hàng (43), Nhập Excel (65), Hôm nay của trưởng nhóm
    (42)
    — tạo tệp nhóm `design/patterns/<nhóm>.md` và khuôn ngay trong vòng ấy, theo khối đích ở `vo-va-ia.md` §2; vòng sau
    của nhóm đi qua khuôn. Nhóm đã có (Bảng hàng cho 32, Hồ sơ căn cho 33, Hôm nay đầu chủ cho 39, Ô nhận lead cho 51)
    đi qua khuôn sẵn; sửa tệp nhóm của người khác là `cham-tep`. Khối đích của từng màn là bảng ở `vo-va-ia.md` §2
    trên `main` sau PR #88 (chủ kho chọn lại bằng khoá ReUI Pro 02/11) — khuyến nghị đầu vào cho lối ReUI của trang ba
    lối, không phải khối của lúc dựng gói; dãy nào đã chụp ba lối theo khối cũ thì chụp lại lối ReUI.
19. Hàng 31 (luật ẩn và bộ kiểm rò rỉ): ẩn ở lõi, không ẩn ở giao diện (bất biến 4). Bộ kiểm rò rỉ vào CI là đổi
    `.github/workflows/**` (tệp bảo vệ) — `cham-tep` ở S1, và job mới phải nối vào `ci-ok`. Hàng 34, 35, 36, 43 chỉ
    dựng dữ liệu ra bằng luật ẩn của 31; không màn nào tự lọc trường.
20. Hàng 86 và 89 chạm liên hệ (ADR-0021): phần chủ nhà của một liên hệ vẫn là lớp `source` — trần
    `never_leaves_company` và ràng buộc cơ sở dữ liệu không nới; số khách không ra trang khách; số ở dạng bản mã theo
    ADR-0013. Hai hàng cùng chạm `packages/api/src/contacts/**`, nên 89 đứng sau 86 trong `sau` (thứ tự vì chồng vùng,
    không phải phụ thuộc nghiệp vụ).
21. Hàng 34 và 35 (bất biến 3): chỉ mở bảng chia sẻ của thiết bị; không tích hợp gửi tin, không đăng nhóm, không tự trả
    lời. Lượt Zalo tự lấy ảnh xem trước không tính là khách mở (kết luận hàng 3). Gửi khách riêng ẩn mã căn, gửi nhóm
    môi giới hiện mã (Sổ quyết định 28/10).
22. Hàng 64–67 (nhập dữ liệu, ADR-0011): đợt này chỉ dựng chế độ không AI — tác tử (68), ô lạ (69), chuẩn hoá mọi cửa
    (70) và dọn từ điển (71) nằm ngoài đợt và Cổng Đáng của 68, 69, 71 đọc số đo của hàng 64. Mọi dòng ghi đi qua lệnh
    của lõi hàng (một cửa); chủ nhà và số trong file thành liên hệ chủ nhà theo đường kiểm trùng của hàng 85 và vào lớp
    `source` ở dạng bản mã. Hoàn tác (66) bằng sự kiện bù, không xoá sự kiện. Ai được nhập (ADR-0011 quyết định 11 —
    Đầu chủ, Trưởng nhóm) hỏi ở Cổng Phạm vi hàng 65, không tự chọn.
23. Hàng 81 và 82 (cấu hình theo sàn, ADR-0018): mặc định của sổ cho đúng số cũ (gọi lại 14 ngày, hỏi lại 20%, hạn lead
    15/30 phút); không khoá nào thuộc lớp `source`; sự kiện cấu hình chỉ thêm. Hàng 82 mở rộng bảng `company_settings`
    hàng 25 đã tạo bằng migration mới, không sửa migration cũ. Màn Cài đặt sàn (45–49) không thuộc đợt này.
24. Hàng 52 (số đo hai tuần thử) chỉ đọc sự kiện đã có; thấy thiếu sự kiện cho một số đo thì ghi vào hợp đồng là giới
    hạn đã biết và gửi `can-nguoi`, không tự thêm sự kiện vào hàng của dãy khác. Ngưỡng của số đo không đặt ở hàng này
    — chủ kho đặt ở Cổng Đáng trước hai tuần thử.
25. Số migration và số ADR: giám sát giữ chỗ lúc mở đợt cho các hàng T3 có thể cần (86, 65, 66, 82, 89, 31), tính trên
    `origin/main` lúc ấy; luật 3 vẫn áp khi gộp.
26. Phiên chờ chủ kho thì tiêu đề bắt đầu «⏳ CHỜ ANH: <việc>»; hết chờ thì đổi lại tên thường.
27. Mọi dãy được vẽ lại `PRODUCT-MAP.md` và `LO-TRINH.html` bằng `product-map.mjs` trong PR của mình, không cần
    `cham-tep` (luật 11).
28. Hàng 92 làm lại Hôm nay đầu chủ (hàng 22 đã ký) theo quyết định 14A ở `vo-va-ia.md` §2: dòng của
    `solution-agents-2`, cột «Vì sao hôm nay» hai tầng kiểu ô hạn của `data-grid-base-5` thay hai cột Lý do và Hạn, mỗi
    dòng đúng một nút viền cùng bề rộng là việc đầu của nhóm (một chạm), việc còn lại vào ⋯. Hàng đợi, luật mỗi căn một
    hàng đợi, ghi kết quả và nguồn dữ liệu của 22 không đổi — mười tiêu chí đã ký của 22 chạy lại phải đạt. Dãy sửa khuôn
    `KhungHomNay` (`design/patterns/hom-nay-dau-chu.md`) và dòng của nó ở bảng «Khối đã chuyển thể» của `catalog.md`.
    Hàng 39 dựng bản điện thoại trên khuôn ấy nên đứng sau 92, cùng dãy H.
29. Hàng 93 chuyển thể `auth-15` cho ba màn đăng nhập, chọn sàn, chưa gắn sàn (khuôn `design/patterns/xac-thuc.md`), bỏ
    nút Google, Apple, GitHub (ADR-0005: chỉ mã một lần qua email). Chỉ đổi giao diện: không tệp nào dưới
    `packages/api/src/auth/**`, luồng và phiên của hàng 6 giữ nguyên — chạm tới đó là đổi hạng, gửi `cham-tep`.
30. Dòng «Chỗ hở» ở `vo-va-ia.md` §3 và bài `packages/ui-lint/tests/kiem-chuan.test.mjs` ghim đúng các cảnh báo hạn đã
    quá. Hàng nào đóng một dòng có hạn đã quá (93 với Đăng nhập; dãy của 51 với Ô nhận lead) thì bớt cảnh báo ấy ở bài
    kiểm trong cùng PR; 92 đóng dòng «Hàng đợi có hạn» (hạn theo điều kiện, không cảnh báo). Dãy của 51 cũng sửa câu «ghép theo khối đích form-2» ở `design/patterns/o-nhan-lead.md`
    thành «bản ghép là đích» (chủ kho 02/11). Dòng «Trống · lỗi · báo» đã chuyển thể `empty-state-1/2` — dãy nào chạm
    `vo-va-ia.md` trước thì đóng nó, kèm bài kiểm.
