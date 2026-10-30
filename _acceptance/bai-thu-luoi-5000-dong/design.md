# Thiết kế: bai-thu-luoi-5000-dong — lưới ReUI có chịu được bảng hàng 5.000 dòng không

Ngày 2026-10-30 · hàng 1 lộ trình · dãy G đợt nen-dau · hạng T2 · ô cơ hội đã ký `build` (Manh Phan, 30/10).

## Câu hỏi

Kiến trúc §8 (bảng stack, dòng «Lưới bảng hàng»): lưới dữ liệu ReUI (TanStack Table + Virtual) — «**Thử trước**: 5.000
dòng × 20 cột, dán 500 ô. Không đạt thì đổi sang lưới vẽ canvas (Glide Data Grid)». Ngưỡng của ô: trên dữ liệu sinh
5.000 dòng, cuộn và gõ không tụt khung hình thấy được, dán 500 ô xong dưới một giây; kết luận ghi thành ADR.

Bài thử trả lời đúng câu đó, theo đúng thứ tự kiến trúc đặt: đo lưới ReUI trước; chỉ khi nó trượt mới dựng Glide và đo
lại. Đây cũng là thang dùng lại của kho (`.claude/rules/giao-dien.md`): khối ReUI trước, tự dựng sau cùng.

## Mã thử ở đâu (luật 5 của đợt)

Luật 5: «mã thử nằm trong `_acceptance/<slug>/` hoặc nhánh thử, không thành mã sản phẩm khi chưa có hàng dựng».

- **Nhánh thử `thu/bai-thu-luoi-5000-dong`** (đẩy lên, không gộp; ghim bằng tag `thu/bai-thu-luoi-5000-dong-v1` để
  nhánh có bị dọn thì commit vẫn còn — `do-lai.mjs` dựng từ tag và báo lỗi gọi tên tag khi không tới được): trang `apps/web/src/app/spikes/luoi` (đúng vùng của
  hàng trong lộ trình), cài `@reui/data-grid`, `playwright-core` (máy đo), và tắt `noUncheckedIndexedAccess` cho
  `apps/web` — mã data-grid nguyên bản không qua cờ này (đã thấy ở hàng 4). Mọi thứ đó ở lại nhánh thử.
- **PR vào main** chỉ mang hồ sơ `_acceptance/bai-thu-luoi-5000-dong/` (kịch bản đo, số đo, ảnh, sha nhánh thử) và
  `docs/adr/0004-luoi-bang-hang.md`, cộng một dòng kết quả ở kiến trúc §8 và Tham chiếu (luật 6). Không chạm
  `apps/web/**`, `package-lock.json`.

## Trang thử (trên nhánh thử)

- 5.000 dòng × 20 cột dữ liệu sinh tất định (hạt cố định), nhãn mẫu: mã căn `MAU-00001`…, toà, tầng, diện tích, giá,
  trạng thái RESO, ghi chú — không dữ liệu thật (luật 4).
- `DataGrid` + `DataGridTableVirtual` (cuộn ảo dòng), `DataGridCellSelection` (chọn ô, Ctrl/Cmd+V dán, sửa trên ô qua
  `onCellEditRequest` + `onCellsChange`), `getRowId` ổn định. Chuyển thể chỉ đổi dữ liệu, chữ, prop.
- Chế độ `?cham=1`: chèn việc bận 60 ms vào mỗi khung hình và 1.200 ms vào mỗi lô ghi — **đối chứng đỏ** cho máy đo.
- Chế độ `?cham=phim`: hàm nghe phím ở pha bắt (chạy trước lưới) bận 80 ms mỗi phím — đối chứng đỏ cho **mốc đầu** của
  thước gõ: chỉ trượt khi mốc đầu là `event.timeStamp` (lúc phím xảy ra), không phải lúc hàm của lưới chạy.
- Trang ghi mốc vào `window.__do`: khung hình qua `requestAnimationFrame`; mốc đầu của gõ và dán là
  `KeyboardEvent.timeStamp`; mốc cuối của dán là khung hình đầu tiên sau lô ghi mà mọi ô dán đang hiện trong khung nhìn
  mang giá trị mới (ô góc cuối kiểm sau khi cuộn tới).
- Hiệu chuẩn máy mỗi lượt: trang rỗng cùng phiên, cùng 4× — p95 khung ≤ 17,5 ms và một bài đo JS cố định ≤ 1,2× mốc
  của S3; ghi `may.hieu_chuan` và loadavg; lượt không hợp lệ đo lại, tối đa ba lần.

## Máy đo

`_acceptance/bai-thu-luoi-5000-dong/thu/do.mjs` (chạy trên nhánh thử, cần `playwright-core`) điều khiển Chrome có sẵn
(`channel: "chrome"`), khổ 1366×768, **giảm tốc CPU 4×** qua giao thức DevTools (`Emulation.setCPUThrottlingRate`) —
thay cho «máy tính văn phòng» vì kho không có máy văn phòng thật để đo; mức 4× là nấc «máy tầm trung» chuẩn của
DevTools.

| Thước | Cách đo | Ngưỡng đạt |
| --- | --- | --- |
| Cuộn | cuộn bánh xe từ dòng 1 tới dòng 5.000 trong khoảng 8 giây; khoảng cách giữa các khung hình | p95 ≤ 33,4 ms **và** khung > 50 ms ≤ 1% |
| Gõ | mở ô, gõ 30 ký tự; từ phím xuống tới khung hình kế | p95 ≤ 50 ms |
| Dán | ghi 25 × 20 ô (TSV) vào clipboard, chọn ô, Ctrl/Cmd+V; từ phím tới khung hình có ô cuối mang giá trị mới | ≤ 1.000 ms, và ô mẫu đúng giá trị |

Mỗi lần đo chạy 3 lượt, lấy trung vị. `do.mjs --cham` chạy trang ở `?cham=1` và phải trượt cả ba thước.

`_acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs` (không phụ thuộc gì, chạy từ main): dựng worktree tạm của nhánh
thử ở **sha ghim** trong `thu/nhanh-thu.json`, `npm ci`, `next build` + `next start -p 3462`, chạy `do.mjs` (thường và
`--cham`), in JSON, so ngưỡng bằng `thu/nguong.mjs` (hàm thuần, có test hai chiều trên số mẫu). Thoát 0 khi bản thường
đạt **và** bản chậm trượt.

Số đo của lượt S3 ghi vào `thu/so-do.json` (commit cùng ADR — nguồn số của ADR). `do-lai.mjs` không ghi vào hồ sơ:
worktree tạm và nhật ký ở `.acceptance-runs/bai-thu-luoi-5000-dong/`. `thu/main-sach.mjs` kiểm diff PR không chạm
`apps/web/**` hay `package-lock.json` (hàm thuần + test đỏ trên danh sách có tệp trang thử).

Khoá cấu hình thêm (chỉ thêm dòng): `executors.test.luoi_nguong` (test của `thu/`), `executors.script.luoi_do_lai`,
`executors.script.luoi_main_sach`.

## Quyết định ghi ở ADR-0004

Luật chọn lấy nguyên từ kiến trúc §8: ReUI đạt cả ba thước → chọn ReUI (`glide: null`, AC-9 không áp); trượt → dựng
Glide trên nhánh thử, đo cùng máy đo (AC-9), ADR ghi cả hai. Ngưỡng số chờ chủ kho ký (Hỏi-1 trong hợp đồng). ADR ghi số đo ba lượt, cấu hình máy đo, sha nhánh thử, và hệ quả: cờ `noUncheckedIndexedAccess`
— hàng dựng bảng hàng (14–16) phải chọn nới cờ cho `apps/web` hay chuyển thể bản cài data-grid.

## Đặc tả UX

<!-- ux-spec: trang thử trên nhánh thử, không phải màn sản phẩm -->
Không có màn sản phẩm: trang thử chỉ tồn tại trên nhánh thử để đo. Khối đích của Bảng hàng (`data-grid-editing-6`) là
khối Pro, cài ở hàng dựng; bài thử dùng thành phần miễn phí `data-grid` mà khối ấy dựng trên.

## Rủi ro

- Đo trên máy làm việc có tải khác (dãy khác chạy song song) → trung vị ba lượt; số đo ghi cả tải máy; lượt dưới tải
  đỏ thì đo lại một lần (luật lượt dưới tải của đợt).
- Giảm tốc CPU không mô phỏng GPU yếu — ghi thành giới hạn trong ADR.
