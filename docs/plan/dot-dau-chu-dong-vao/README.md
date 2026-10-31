# Gói đợt dau-chu-dong-vao — đợt Điều phối – Thợ thứ ba của Quỹ hàng

Dựng sẵn ngày 31/10 trong lúc đợt `nen-2` còn chạy (còn 55, 56, 60), để mở được ngay khi đợt ấy đóng. Cùng khuôn với
`docs/plan/dot-nen-2/` (gói `dieu-phoi`, kit 2.36.0): `dieu-phoi.config.json`, `hang-viec.json`, `LUAT-rieng.md`. Hàng
lấy từ `docs/plan/lo-trinh.json` qua `nguon_hang`.

21 hàng: nhóm **Đầu chủ** (14–23), nhóm **Dòng vào** (24–30), ba hàng cắt từ việc tồn của đợt nen-2 (61 đồng bộ tự
lành, 62 mã hoá số chủ, 63 căn trùng mã hai toà — bản phạm vi `docs/plan/pham-vi-ton-nen-2.md`), và hàng 10 (nhận danh
mục Invest) nếu Cổng Đáng mở lại nó.

## Mở đợt

1. Gói này và 21 ô cơ hội đã vào `main`; Cổng Đáng đã quyết ở `the-cong-dang.md`.
2. Đợt `nen-2` đã đóng (`/dieu-phoi:dong-dot`) — kit chỉ chạy một đợt mỗi lần.
3. Mở từ một phiên mới ở checkout chính: `/dieu-phoi:mo-dot dau-chu-dong-vao`. Docker đang chạy.

Không cần sửa gói sau Cổng Đáng: bộ phát lịch chỉ giao hàng có ô quyết `build`; hàng quyết khác không tính là việc còn
lại của dãy. Hàng 10 vắng `build` thì dãy D làm xong hàng 63 là hết việc.

## Độ rộng của đồ thị và số dãy

Mọi hàng các hàng này đứng trên mà nằm ngoài đợt đều đã ký trên `main` (kiểm 31/10: 1, 5, 9, 11, 12, 13, 53, 58, 59 đều
`signed-off`). Xếp tầng theo `dung_tren` (tầng = hàng sớm nhất có thể bắt đầu):

| Tầng | Hàng | Rộng |
|---|---|---|
| 0 | 14, 24, 61, 62, 63, (10) | 5–6 |
| 1 | 15, 17, 25 | 3 |
| 2 | 16, 18, 20, 22, 27 | 5 |
| 3 | 19, 21, 23, 26, 28 | 5 |
| 4 | 29, 30 | 2 |

Đường găng dài năm hàng: 14 → 15 → 22 → 26 → 30 (hay 22 → 28 → 30). 20 hàng không kể 10 chia cho năm tầng là trung bình
bốn; tầng rộng nhất là năm. Bốn dãy đủ chạy hết trong năm lượt nối tiếp, bằng đúng độ dài đường găng — dãy thứ năm không
rút ngắn được đợt. **Bốn dãy làm việc chính (B, H, L, G) cộng dãy D nhỏ** cho hai hàng danh mục (63, rồi 10 nếu mở lại):
D không nằm trên đường găng nào, chạy song song mà không đẩy lùi hàng nào. Không lên sáu: máy 36 GB, lượt chấm p95 4,0 GB
và lượt đường nền p95 4,7 GB (số hiệu chuẩn của đợt nen-2, 41 và 18 lượt), bốn dãy đợt nen-2 chạy còn trống 21–29 GB và
chỉ một lượt dưới tải.

Giờ máy dự báo (`du-bao.json` của từng ô): T2 1,3–5,1 giờ, T3 3,8–12,5 giờ. Bốn dãy chính mỗi dãy một hàng T3 và bốn
hàng T2, nên tải gần bằng nhau.

## Dãy

| Dãy | Hàng (theo thứ tự chạy) | Bắt đầu khi | Vì sao chung dãy |
|---|---|---|---|
| B · bảng hàng | 14 → 15 → 20 → 16 → 21 | ngay | Đường găng. Một khu `inventory/**` rồi `imports/**`; 20 cần 15 |
| H · hồ sơ căn | 61 → 17 → 18 → 23 → 19 | ngay (61); 17 chờ 14 | Khu `units/**`: 17 giữ cả khu nên 18, 19, 23 nối sau trong cùng dãy. 61 lấp chỗ chờ 14 |
| L · dòng vào | 24 → 25 → 27 → 26 → 30 | ngay | Chuỗi lead: 24 → 25 → 27 trong khu `leads/**`; 26 chờ thêm 22, 30 chờ 26 và 28 |
| G · gọi và Hôm nay | 62 → 22 → 28 → 29 | ngay (62); 22 chờ 15, 17 | 22 → 28 → 29 là chuỗi Hôm nay → cuộc gọi. 62 lấp chỗ chờ 15 và 17 |
| D · danh mục | 63 → 10 | ngay | Hai hàng danh mục; chủ kho muốn 63 xử cùng 10 |
| X · neo (nghỉ) | 1, 5, 9, 11, 12, 13, 53, 58, 59 | — | Không phải việc: giữ chỗ để `sau` trỏ tới hàng đợt trước (luật 17) |

Bộ phát lịch giao trong mỗi dãy hàng sẵn sàng có `uu_tien` nhỏ nhất, nên thứ tự thật trong dãy theo phụ thuộc: hàng chưa
đủ phụ thuộc thì hàng sau nó trong dãy chạy trước (ví dụ G làm 62 trong lúc 22 chờ 15 và 17).

Ưu tiên khi tranh lượt chấm (`uu_tien`, cũng là thứ tự `nguon_hang`): đường găng trước — 14, 15, 17, 22, 24, 25, 28, 26,
30 — rồi ba việc phải xong trước hai tuần thử (61, 63, 62), rồi 10, rồi phần còn lại (18, 20, 27, 23, 16, 19, 21, 29).
Chưa đặt mốc ngày cho hàng nào: hai tuần thử chưa có ngày.

Vùng tệp (`ranh_gioi`) lấy từ trường `vung` của lộ trình cộng thư mục hồ sơ. Lượt cắt này sửa vùng của 14–30 cho trỏ
đúng `apps/web/src/app/(app)/…` — vùng cũ thiếu nhóm đường `(app)` nên không khớp tệp nào. Chồng vùng giữa các dãy:
17 (`units/**`) chồng 28, 29, 30 — cả ba đứng sau 17 qua 22 nên không chạy cùng lúc; mọi cặp khác ở hai dãy không chồng.

Cổng dev và Postgres mỗi dãy: B 3481 / 5561, H 3482 / 5562, L 3483 / 5563, G 3484 / 5564, D 3485 / 5565 (luật 7; kiểm
31/10 không cổng nào đang nghe).

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.

Không vào đợt: nhóm Đầu khách (31–38) và các hàng sau — đợt kế. 31 (luật ẩn) đã hết phụ thuộc (đứng trên 11); 45 (cách
gọi riêng) cũng vậy. Dãy nào hết việc sớm thì đó là chỗ lấp, nếu qua Cổng Đáng trước — không thêm bằng `hang them` (lệnh
ấy bỏ qua `dung_tren` và coi hàng là đã qua Cổng Đáng).
