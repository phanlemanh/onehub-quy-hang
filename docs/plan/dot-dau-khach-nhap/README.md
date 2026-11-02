# Gói đợt dau-khach-nhap — đợt Điều phối – Thợ thứ tư của Quỹ hàng

Dựng sẵn ngày 02/11 trong lúc đợt `dau-chu-dong-vao` còn chạy (còn 28, 29, 30 và vài hàng vá), để mở được ngay khi đợt
ấy đóng. Cùng khuôn với `docs/plan/dot-dau-chu-dong-vao/` (gói `dieu-phoi`, kit 2.36.0): `dieu-phoi.config.json`,
`hang-viec.json`, `LUAT-rieng.md`. Hàng lấy từ `docs/plan/lo-trinh.json` qua `nguon_hang`.

26 hàng, chọn theo hai câu hỏi: hàng đã hết phụ thuộc chưa, và hai tuần thử có cần nó không.

- **Nửa đầu khách của bản đầu** (nhóm `dau-khach`, 31–38) cùng liên hệ khách (86): mọi màn P0 của §10 còn lại — bảng
  hàng dạng thẻ, hồ sơ trên điện thoại, luồng Gửi, trang khách, Đã gửi, Hôm nay của đầu khách — và tab Tôi.
- **Nhập file bảng hàng cũ, chế độ không AI** (64–67): màn P0 «Nhập Excel» (N1, N2), cắt ở bản phạm vi
  `docs/plan/pham-vi-nhap-du-lieu.md` ngày 31/10.
- **Số đo hai tuần thử** (52): các số đo của Tham chiếu §11 phải đọc được trước khi thử.
- **Nền cấu hình theo sàn** (81, 82): cho Cài đặt sàn ở đợt sau; chạy song song, không kéo dài đợt.
- **Hai việc tách từ đợt đang chạy** (88 vá đường lỗi hoàn tác, 89 đổi đầu chủ hàng loạt).
- **Bốn hàng P1** chọn theo số đo hai tuần thử: 43 Phát hàng («số lần phát bảng hàng» chỉ đo được khi có nó), 39 Hôm nay
  đầu chủ trên điện thoại và 51 lead trên điện thoại («thao tác theo thiết bị và vai»), 42 Hôm nay trưởng nhóm («lead →
  cuộc gọi đầu»). Không hàng nào chờ chúng; chúng lấp chỗ trống của dãy, không kéo dài đợt.
- **Hai màn đã ký làm lại theo khối đích mới** (thêm 02/11 sau PR #88): 92 Hôm nay đầu chủ theo quyết định 14A
  (`solution-agents-2`, một nút mỗi dòng, «Vì sao hôm nay» hai tầng) và 93 Đăng nhập theo `auth-15` bỏ OAuth. 39 (bản
  điện thoại) dựng trên khuôn của 92 nên đứng sau nó.
- **Hai hàng vá máy chủ** (thêm 03/11, chủ kho: «hai lỗi máy chủ: mở hai hàng vá ở đợt kế»; dãy D báo khi làm hàng 28):
  `va-moc-goi-dau-lead-tra-lai` — lead đã trả lại thì máy chủ từ chối mốc gọi đầu của người giữ cũ (luật chia và hạn của
  hàng 25); `va-doi-gia-can-da-ban` — máy chủ từ chối đổi giá trên căn Đã bán, bộ đồng bộ đưa lệnh vào «Cần xem» (luật
  trạng thái của hàng 8). Hàng vá không có mã số, mã là slug như các hàng vá của đợt trước.

Hai tuần thử cần 31–38, 64–65 và 52; 43 là P1 nhưng mang một số đo của §11. Còn lại có thể gác ở Cổng Đáng mà không hàng nào khác bị chặn, trừ chuỗi đã ghi ở
cột «Đứng trên» của thẻ.

## Khối đích mới (PR #88, 02/11)

Chủ kho chọn lại khối đích bằng khoá ReUI Pro; bảng ở `docs/design/vo-va-ia.md` §2 trên `main`. Hàng của đợt lấy khối
ở đó làm khuyến nghị đầu vào cho lối ReUI của trang ba lối (luật 18). Đổi so với lúc dựng gói: 32 `product-grid-4` +
`filter-sidebar-5`; 34 thanh chọn nhiều của `wishlist-1`; 35 `wishlist-3` (chi tiết `product-detail-5`); 36
`wishlist-4`; 38 `settings-2`; 39 dòng hai tầng của `solution-agents-2`; 42 `dashboard-6` bỏ biểu đồ; 43 `dialog-5`; 51
bản ghép `KhungLead` là đích, không `form-2`. Giữ: 33 `product-detail-5`, 37 `solution-crm-5`, 65–67 `solution-crm-6`.
Đợt chưa mở nên chưa trang ba lối nào chụp theo khối cũ.

## Phụ thuộc vào PR #61

Bảy hàng của đợt — 31, 64, 65, 66, 67, 88, 89 — có ô Cổng Đáng ở PR #61 (`claude/cong-dang-88-89`, nháp), và PR ấy
thêm hai hàng 88, 89 vào lộ trình cùng sửa `dung_tren` của 31, 65, 22 theo hàng 85. Gói này xếp tầng theo lộ trình
của PR #61. **PR #61 phải gộp trước khi mở đợt.** Gộp chậm thì kit vẫn mở được (88, 89 khai tay đủ slug trong
`hang-viec.json`, kit cảnh báo một dòng), nhưng `dung_tren` mới của 31 và 65 chỉ có khi PR #61 vào.

Thẻ Cổng Đáng của gói này liệt cả bảy hàng ấy, để chủ kho quyết một lần cho cả hai PR.

## Mở đợt

1. Gói này, PR #61, và 26 ô cơ hội đã vào `main`; Cổng Đáng đã quyết ở `the-cong-dang.md`.
2. Đợt `dau-chu-dong-vao` đã đóng (`/dieu-phoi:dong-dot`) — kit chỉ chạy một đợt mỗi lần.
3. Mở từ một phiên mới ở checkout chính: `/dieu-phoi:mo-dot dau-khach-nhap`. Docker đang chạy.

Không cần sửa gói sau Cổng Đáng: bộ phát lịch chỉ giao hàng có ô quyết `build`; hàng quyết khác không tính là việc còn
lại của dãy.

## Độ rộng của đồ thị và số dãy

Mọi hàng các hàng này đứng trên mà nằm ngoài đợt đều đã ký trên `main` (kiểm 02/11: 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,
16, 17, 18, 22, 23, 25, 26, 27, 53, 85, 91 đều `signed-off`). Không hàng nào đứng trên 28, 29, 30 của đợt đang chạy — đợt này không
chờ phần cuối của đợt trước, chỉ chờ nó đóng. Xếp tầng theo `dung_tren` (tầng = lượt sớm nhất có thể bắt đầu):

| Tầng | Hàng | Rộng |
|---|---|---|
| 0 | 31, 32, 38, 42, 51, 52, 64, 81, 86, 88, 92, 93, hai hàng vá | 14 |
| 1 | 33, 34, 39, 43, 65, 82, 89 | 7 |
| 2 | 35, 66, 67 | 3 |
| 3 | 36 | 1 |
| 4 | 37 | 1 |

**Đường găng dài năm hàng**: 86 → 34 → 35 → 36 → 37 (34 chờ cả 31 và 32 ở tầng 0). Tính theo giờ máy, chuỗi nhập
64 → 65 → 66 → 67 dài gần bằng — hai hàng T3 liền nhau — nên dãy G cũng là đường găng thực tế.

Mô phỏng bằng `chonHangKe` của kit 2.36.0 (mọi hàng quyết `build`, xét cả chồng vùng) cho năm dãy chạy hết trong sáu
lượt. 26 hàng trên năm dãy cần ít nhất sáu lượt, nên sáu là sàn: hai hàng vá 03/11 kéo đợt thêm một lượt so với bản 24
hàng, và lượt 6 chỉ còn 51 (P1) ở dãy D. Đường găng 86 → 37 vẫn xong ở lượt 5. (V = vá: Vmốc = `va-moc-goi-dau-lead-tra-lai`,
Vgiá = `va-doi-gia-can-da-ban`.)

| Lượt | L | B | G | H | D |
|---|---|---|---|---|---|
| 1 | 86 | 32 | 64 | 31 | 52 |
| 2 | 34 | 33 | 65 | 92 | 81 |
| 3 | 35 | 88 | Vgiá | 38 | Vmốc |
| 4 | 36 | 89 | 66 | 43 | 42 |
| 5 | 37 | 93 | 67 | 39 | 82 |
| 6 | — | — | — | — | 51 |

Không lên sáu dãy: tầng 0 rộng mười nhưng các tầng sau hẹp dần, dãy thứ sáu không rút được lượt nào; và máy 36 GB
chạy bốn dãy đợt nen-2 còn trống 21–29 GB (lượt chấm p95 4,0 GB, lượt đường nền p95 4,7 GB). Năm dãy như đợt trước.

Giờ máy dự báo (`du-bao.json` của từng ô): T2 0,99–6,53 giờ, T3 2,02–10,43 giờ (Vmốc 1,2–8,85). Mỗi dãy có một hàng T3,
riêng G có hai (65, 66) — bù lại G không có hàng P1 — và D có hai (82, Vmốc).

## Dãy

| Dãy | Hàng (theo thứ tự chạy) | Bắt đầu khi | Vì sao chung dãy |
|---|---|---|---|
| L · Gửi khách | 86 → 34 → 35 → 36 → 37 | ngay; 34 chờ 31, 32 | Đường găng. Liên hệ khách (86) chạm `core/sharing/**` mà luồng Gửi dùng; 34 → 37 là chuỗi Gửi → trang khách → Đã gửi → Hôm nay đầu khách |
| B · Bảng hàng | 32 → 33 → 88 → 89 → 93 | ngay; 89 chờ 86 | Khu `inventory/**` và `units/**`. 32 mở đầu vì 34 chờ nó; 93 (Đăng nhập, khu `(auth)/**`) lấp lượt 5 |
| G · Nhập | 64 → 65 → Vgiá → 66 → 67 | ngay | Chuỗi nhập trong khu `import/**`, `imports/**`. Vgiá chạm `core/listing/**` như 66 nên chung dãy, chạy trước 66 vì là vá |
| H · Cửa ra và Hôm nay đầu chủ | 31 → 92 → 38 → 43 → 39 | ngay; 43 chờ 31; 39 chờ 92, 38 | 31 (luật ẩn) mở đầu vì 34 chờ nó; Phát hàng (43) là cửa ra thứ hai dựng trên luật ẩn; 92 làm lại Hôm nay đầu chủ và 39 dựng bản điện thoại trên khuôn ấy — cùng dãy để một người giữ khuôn `KhungHomNay`; 38 là tab Tôi |
| D · Nền sàn | 52 → 81 → Vmốc → 42 → 82 → 51 | ngay | Ba hàng nền ở lõi và API (`metrics/**`, `config/**`, `settings/**`), cộng 42 và 51 lấp chỗ. Vmốc về D vì D là dãy làm luồng lead và tìm ra lỗi; 82 lùi sau 42 vì chung `packages/db/migrations/**` với 89 đang chạy ở lượt 4 |
| X · neo (nghỉ) | 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 25, 26, 27, 53, 85, 91 | — | Không phải việc: giữ chỗ để `sau` trỏ tới hàng đợt trước (luật 17) |

Bộ phát lịch giao trong mỗi dãy hàng sẵn sàng có `uu_tien` nhỏ nhất, nên thứ tự thật trong dãy theo phụ thuộc.

Ưu tiên khi tranh lượt chấm (`uu_tien`, cũng là thứ tự `nguon_hang`): đường găng trước — 86, 31, 32, 34, 35, 36, 37 —
rồi 92 (màn đầu chủ dùng mỗi ngày trong hai tuần thử), rồi phần hai tuần thử cần (64, 65, 52, 38, 33), rồi hai hàng vá
máy chủ (Vmốc, Vgiá — trước mọi hàng P1), rồi 43, rồi nhập còn
lại (66, 67), rồi vá và nền (88, 89, 81, 82), rồi 93, cuối cùng ba hàng P1 lấp chỗ (39, 42, 51). Chưa đặt mốc ngày cho hàng nào: hai tuần thử chưa có ngày.

Vùng tệp (`ranh_gioi`) lấy từ trường `vung` của lộ trình cộng thư mục hồ sơ, sửa cho trỏ đúng `apps/web/src/app/(app)/…`
như lượt trước (vùng của lộ trình thiếu nhóm đường `(app)`); trang khách `/s/<mã>` nằm ngoài vỏ nên giữ
`apps/web/src/app/s/**`. Hàng T3 có bảng mới (86, 65, 82, 89) và Vmốc (hàm mới thay `app.mark_first_call`) thêm
`packages/db/migrations/**` — bộ phát lịch không giao hai hàng chung vùng ấy cùng lượt. Chồng vùng giữa các
dãy: 89 (B) và 86 (L) cùng `packages/api/src/contacts/**` — 89 khai `sau` thêm 86 nên không chạy cùng lúc; 37, 39, 42
ở ba thư mục con khác nhau của `today/`, tệp chung `today/page.tsx` theo luật 12. 92 giữ các tệp ở gốc `today/`
(`today/*.tsx`, `today/*.ts`); bộ dò chồng vùng của kit so mẫu theo tiền tố nên coi 92 chồng với 37 và 42 — chúng chỉ
không chạy cùng lúc (mô phỏng: 92 xong ở lượt 2, trước cả hai). Vgiá (G) chồng 89 (B) ở `packages/api/src/listings/**`
— mô phỏng: Vgiá lượt 3, 89 lượt 4. Mọi cặp khác ở hai dãy không chồng.

Cổng dev và Postgres mỗi dãy: L 3491 / 5571, B 3492 / 5572, G 3493 / 5573, H 3494 / 5574, D 3495 / 5575, container
`quy-hang-db-dkn-<dãy>` (luật 7; kiểm 02/11 không cổng nào đang nghe; tên container khác đợt trước vì container
`quy-hang-db-<dãy>` của đợt ấy còn chạy).

Worktree của dãy để chỗ giữ `/CHUA-CO-WORKTREE/<dãy>`; việc đầu tiên của phiên thợ mở từ chip là
`node <thư mục đợt>/loi/dieu-phoi.mjs ghi-danh <dãy>` từ worktree của chip.

## Không vào đợt

- **Cài đặt sàn** (45–50): đứng trên 82 của đợt này; đợt sau. Bản đầu chạy bằng mặc định dựng sẵn (§10, P1).
- **Nhập có AI và chuẩn hoá mọi cửa** (68–71): Cổng Đáng của 68, 69, 71 đọc số đo của hàng 64 (bản phạm vi nhập); 70
  đứng trên 45.
- **Mọi loại hình** (73–80): Sổ quyết định 31/10, Hỏi-4 — hai tuần thử giữ một khu căn hộ.
- **P1 còn lại** (40 đổi giá nhanh, 41 chụp ảnh, 44 trang nhóm môi giới): hết phụ thuộc trong đợt (đứng trên 33, 39,
  35) và vừa lượt, nhưng không số đo nào của §11 chờ chúng — không thêm vào đợt. 49 (thuế phí) đứng trên 28 và 82.

- **Phần còn lại của mục chân trời H16** (ô nhận lead, trống · lỗi · báo): sau PR #88 không còn việc dựng — ô nhận lead
  giữ bản ghép làm đích (dãy của 51 sửa câu «ghép theo khối đích form-2» ở `design/patterns/o-nhan-lead.md`, luật 30),
  trống · lỗi · báo đã chuyển thể `empty-state-1/2`. Phần Đăng nhập của H16 là 93.

Dãy nào hết việc sớm thì đó là chỗ lấp, nếu qua Cổng Đáng trước — không thêm bằng `hang them` (lệnh ấy bỏ qua
`dung_tren` và coi hàng là đã qua Cổng Đáng).
