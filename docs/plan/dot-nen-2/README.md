# Gói đợt nen-2 — đợt Điều phối – Thợ thứ hai của Quỹ hàng

Dựng sẵn ngày 30/10 trong lúc đợt `nen-dau` còn chạy, để mở được ngay khi đợt ấy đóng, không dãy nào ngồi không giữa
hai đợt. Cùng khuôn với `docs/plan/dot-nen-dau/` (gói `dieu-phoi` của Acceptance-Gate Kit 2.35.0):
`dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ `docs/plan/lo-trinh.json` qua `nguon_hang`.

Bốn hàng: 9 gõ mã căn, 11 lớp trường nguồn, 12 trục ai thấy hàng, 13 nhanh tức thì. Hàng 10 (nhận danh mục Invest)
đã qua Cổng Đáng với quyết định gác (`park`, Manh Phan 30/10) nên không vào đợt; ô cơ hội của nó giữ ở
`_acceptance/nhan-danh-muc-invest/`.

## Mở đợt

1. Gói này và năm ô cơ hội đã vào `main`; Cổng Đáng của năm hàng đã quyết ở `the-cong-dang.md` (Manh Phan 30/10).
2. Đợt `nen-dau` đã đóng (`/dieu-phoi:dong-dot`) — kit chỉ chạy một đợt mỗi lần.
3. Mở từ một phiên mới ở checkout chính: `/dieu-phoi:mo-dot nen-2`. Docker đang chạy.

Không cần chờ hàng 2, 5, 8 gộp hết mới mở: dãy nào hàng nó đứng trên chưa gộp thì bộ phát lịch giữ ở «chờ phụ thuộc»
và không mở chip; hàng ấy gộp lên `main` là nhịp kế giao ngay.

## Dãy

Xếp theo đường găng: hàng 13 đứng trên 2, 11, 12, nên 11 và 12 chạy song song ở hai dãy, 13 nối sau 11.

| Dãy | Hàng (theo thứ tự) | Bắt đầu khi | Vì sao chung dãy |
|---|---|---|---|
| N · nguồn và nhanh | 11 lớp trường nguồn → 13 nhanh tức thì | 8 gộp; 13 chờ thêm 2 và 12 | Đường găng. 13 đọc từ máy đúng phần người được thấy — cần luật ẩn của 11 |
| A · ai thấy | 12 trục «Chỉ tôi» / «Toàn sàn» | 8 gộp | Một hàng; xong sớm để 13 không chờ |
| D · danh mục | 9 gõ mã căn | 5 và 8 gộp | Một hàng; hàng 10 nối sau nó đã gác |
| X · neo (nghỉ) | 8, 5, 2 của đợt nen-dau | — | Không phải việc: giữ chỗ để `sau` của đợt này trỏ tới được |

Bộ phát lịch chỉ hiểu `sau` trỏ tới hàng trong cùng đợt, nên ba hàng đợt trước nằm ở dãy X nghỉ. Máy coi một hàng là
đã gộp khi hợp đồng của nó trên `origin/main` đã ký, nên hàng neo không bao giờ bị giao lại (luật 17).

Ưu tiên khi tranh lượt chấm: theo đường găng — 11, 12, 9, 13. Chưa đặt mốc ngày cho hàng nào.

Vùng tệp (`ranh_gioi`) lấy từ trường `vung` của lộ trình cộng thư mục hồ sơ; bốn vùng không chồng nhau. Hàng 13 và
hàng 2 cùng vùng `apps/web/src/lib/sync/**` — 13 chờ 2 gộp nên không đụng. Tệp bảo vệ mà hàng 11 sẽ cần
(`data-classes.ts`) xin ở S1 (luật 18).

Cổng dev và Postgres mỗi dãy: N 3471 / 5551, A 3472 / 5552, D 3473 / 5553 (luật 7).

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.

Không vào đợt: hàng 10 (gác) và các hàng từ 14 trở đi — đợt kế. Dãy A hết việc sau hàng 12, dãy D sau hàng 9; bốn
hàng sẽ hết phụ thuộc trong đợt này (14 sau 13; 31 sau 11; 45 sau 7, 8; 52 sau 8, 13) là chỗ lấp dãy rảnh, nếu qua
Cổng Đáng trước khi dãy hết việc — không thêm bằng `hang them` (lệnh ấy bỏ qua `dung_tren` và coi hàng là đã qua Cổng
Đáng).
