# Gói đợt nen-dau — đợt Điều phối – Thợ đầu tiên của Quỹ hàng

Mạnh 30/10: dọn phiên cũ rồi chạy lộ trình theo mô hình Điều phối – Thợ, thay vì mở từng hàng bằng một phiên riêng.
Gói theo khuôn của gói `dieu-phoi` trong Acceptance-Gate Kit 2.35.0: `dieu-phoi.config.json`, `hang-viec.json`,
`LUAT-rieng.md`. Hàng lấy từ `docs/plan/lo-trinh.json` qua `nguon_hang`. Chủ kho duyệt hàng, Cổng Đáng (`build`) của
từng hàng và quyền tự merge ở thẻ khởi tạo của `/dieu-phoi:mo-dot nen-dau`, không phải ở đây.

## Mở đợt

1. Gói này đã vào `main` (khoá `dieu_phoi.goi_dot` của `_acceptance/config.yaml` trỏ `docs/plan/dot-{ten}`).
2. Mở từ một PHIÊN MỚI ở checkout chính, để nạp gói `dieu-phoi` vừa bật trong `.claude/settings.json`.
3. Docker đang chạy: mỗi dãy dựng Postgres riêng (luật 7 của `LUAT-rieng.md`).

## Dãy

Chín hàng là sáu hàng chưa phụ thuộc hàng nào cộng ba hàng nối thẳng sau chúng. Hàng chung một dãy vì chạm cùng
một chỗ, nên đi lần lượt.

| Dãy | Hàng (theo thứ tự) | Vì sao chung dãy |
|---|---|---|
| Q · nền quyền | 6 đăng nhập theo sàn → 7 mời người, đặt vai → 8 một đường ghi, sự kiện | Đường găng: hàng 8 mở khoá phần lớn các màn sau. Cả ba đổi cơ sở dữ liệu |
| G · giao diện | 4 chuẩn giao diện → 1 bài thử lưới 5.000 dòng → 53 vỏ ứng dụng | Cùng chạm `apps/web`. Bài thử lưới cần ReUI cài ở hàng 4. Vỏ chờ hàng 7 (vai) gộp xong |
| T · bài thử | 3 Zalo → 2 đồng bộ khi mất mạng → 5 dữ liệu mẫu | Câu hỏi kiến trúc cần trả lời trước khi dựng màn. Bài thử Zalo và mất mạng cần điện thoại thật của chủ kho |

Ưu tiên khi tranh lượt chấm: theo đường găng — 6, 4, 3, 7, 1, 2, 8, 53, 5. Chưa đặt mốc ngày cho hàng nào.

Không vào đợt: các màn sản phẩm (hàng 9 trở đi) — đợt kế, khi nền quyền và đường ghi đã gộp.

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.

Ô cơ hội của hàng 4 (`_acceptance/tang-5-giao-dien/`) đã viết ở phiên trước, chưa quyết; Cổng Đáng của nó hỏi cùng
tám hàng kia ở thẻ khởi tạo.
