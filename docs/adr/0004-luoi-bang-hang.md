# ADR-0004: Lưới bảng hàng dùng lưới dữ liệu ReUI — kết quả bài thử 5.000 dòng

Ngày: 2026-10-30 · Trạng thái: **accepted** khi PR gộp · Liên quan: Kiến trúc §8 (dòng «Lưới bảng hàng»), §9 bước 1 (a) ·
Hồ sơ: `_acceptance/bai-thu-luoi-5000-dong/` · Số đo: `_acceptance/bai-thu-luoi-5000-dong/thu/so-do.json`

## Bối cảnh

Kiến trúc §8 đặt luật cho lưới bảng hàng: dùng lưới dữ liệu ReUI (TanStack Table + Virtual), **thử trước** với 5.000
dòng × 20 cột và dán 500 ô; không đạt thì đổi sang lưới vẽ canvas (Glide Data Grid). Ngưỡng do chủ kho ký ở Cổng Phạm vi
(30/10): trên máy văn phòng mô phỏng, cuộn không tụt khung hình thấy được, gõ không trễ, dán 500 ô dưới một giây.

## Cách đo

- **Trang thử** trên nhánh thử `thu/bai-thu-luoi-5000-dong`, ghim bằng tag `thu/bai-thu-luoi-5000-dong-v1` (sha
  `98735f182194d4c3520632bb9818eb235722e798`), không gộp vào main. Lưới `@reui/data-grid` cài nguyên bản:
  `DataGridTableVirtual` (cuộn ảo dòng, `estimateSize` 32) + `DataGridCellSelection` (chọn ô, sửa trên ô, dán từ
  clipboard), 5.000 dòng × 20 cột dữ liệu sinh tất định mang nhãn mẫu (`MAU-00001`…).
- **Máy đo** `thu/do.mjs`: Chrome có sẵn (headless), khổ 1366×768, **CPU giảm tốc 4×** (DevTools
  `Emulation.setCPUThrottlingRate`). Ba lượt, lấy trung vị; trước mỗi lượt hiệu chuẩn máy (trang rỗng p95 khung
  ≤ 17,5 ms, bài đo JS ≤ 1,2× mốc 86 ms) — lượt máy bận bị loại và đo lại.
- **Thước**: cuộn bánh xe hết 5.000 dòng trong khoảng 8 giây (khoảng cách giữa dấu thời gian khung hình); gõ 30 ký tự
  vào một ô (từ `event.timeStamp` của phím tới lúc khung kế chạy); dán 25 × 20 ô TSV bằng Cmd+V (từ `event.timeStamp`
  tới khung đầu tiên sau khi lô dán vào DOM, ô mẫu đầu, giữa, cuối đúng giá trị).
- **Đối chứng đỏ** trên cùng trang, cùng máy đo: `?cham=1` (bận 60 ms mỗi khung, 1.200 ms mỗi lô ghi) phải trượt cả ba
  thước; `?cham=phim` (bận 80 ms trong hàm nghe phím chạy trước lưới) phải làm thước gõ trượt.
- **Đo lại**: `node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs` dựng lại nhánh thử từ tag, build, đo, so ngưỡng.

## Số đo (lượt `do-lai` ngày 30/10, loadavg 14,4 / 6,4 / 4,9 — hiệu chuẩn hợp lệ cả ba lượt)

| Thước | Ngưỡng | Lượt 1 | Lượt 2 | Lượt 3 | Trung vị | Kết quả |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Cuộn — p95 khoảng cách khung | ≤ 33,4 ms | 33,3 | 16,8 | 16,8 | 16,8 ms | đạt |
| Cuộn — khung > 50 ms | ≤ 1% | 0,14% | 0% | 0,14% | 0,14% | đạt |
| Gõ — p95 | ≤ 50 ms | 16,8 | 15,8 | 16,8 | 16,8 ms | đạt |
| Dán 500 ô | ≤ 1.000 ms | 54 | 55 | 53 | 54 ms | đạt, ô mẫu đúng |

Đối chứng đỏ: `?cham=1` → cuộn p95 100 ms (93% khung chậm), gõ 125 ms, dán 1.378 ms — trượt cả ba; `?cham=phim` → gõ
84 ms — trượt. Máy đo phân biệt được lưới mượt với lưới giật, và mốc đầu của thước gõ đặt đúng chỗ.

Số phụ, không vào ngưỡng: nhịp lúc callback khung thật sự chạy (gồm việc xử lý đầu vào trong khung) có p95 39–40 ms ở
cả ba lượt — tức dưới giảm tốc 4×, mỗi khung có lúc làm việc quá 33 ms mà vẫn không làm rơi khung thấy được. Đây là độ dự
trữ mỏng: lượt 1 đã có p95 khung chạm 33,3 ms.

## Quyết định

Theo đúng luật của Kiến trúc §8: **lưới dữ liệu ReUI đạt cả ba thước → bảng hàng dùng `@reui/data-grid`**. Không dựng
Glide Data Grid (`glide: null` trong số đo).

## Hệ quả

- **Cờ kiểu chặt.** Mã data-grid nguyên bản không qua `noUncheckedIndexedAccess` của `tsconfig.base.json` (đã thấy ở
  hàng 4, 69 lỗi trong data-grid, filters, cascader, event-calendar); nhánh thử tắt cờ cho `apps/web`. Hàng dựng bảng
  hàng (14–16) phải chọn: tắt cờ cho riêng `apps/web` (kiểu chặt còn lại vẫn bật), hay chuyển thể bản cài cho qua cờ
  (mất đường cập nhật nguyên bản từ ReUI). Quyết ở Cổng Phạm vi của hàng đó.
- **Khối đích giữ nguyên** (`data-grid-editing-6` trong `docs/design/vo-va-ia.md`) — khối Pro dựng trên chính thành phần
  đã đo.
- **Độ dự trữ cuộn mỏng**: bảng hàng thật có thêm ô màu, nhóm dòng, cột ghim. Hàng dựng bảng hàng chạy lại máy đo này
  trên màn thật trước Cổng Bằng chứng; nếu cuộn trượt ngưỡng thì mở lại câu hỏi Glide.

## Giới hạn của phép đo

- Máy văn phòng **mô phỏng** bằng giảm tốc CPU, không mô phỏng GPU yếu hay màn hình độ phân giải cao; đo trên máy thật
  của đội ở hai tuần thử.
- Chrome headless trên máy làm việc có tải từ các phiên khác (loadavg ghi trong số đo); hiệu chuẩn mỗi lượt loại lượt
  máy bận nhưng không loại được nhiễu ngắn trong một lượt.
- Bài thử chỉ đo ba thao tác của ngưỡng; lọc, nhóm, sắp xếp, ghim cột chưa đo.
