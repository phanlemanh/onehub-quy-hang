# Review findings: trang-thai-rieng (round 1)

## Trong hợp đồng

- **Đổi nhãn tại chỗ trong Đã bán / Ngừng hẳn làm hỏng bản gập: xoá giá chốt, lý do ngừng và đụng check của cơ sở dữ liệu**
  AC: AC-8
  file: `packages/core/src/listing/fold.ts:80`
  severity: high
  source: conventions
  detail: Đường đổi nhãn tại chỗ mới (`kiemNhanSuKien` trả `doiNhanTaiCho: true`) bỏ qua `checkTransition`, nên `status_changed {to: "Closed"|"Withdrawn", label}` không bắt buộc kèm `closePrice`/`withdrawnReason`. Thế nhưng `stepListing` vẫn chạy nhánh `if (p.to === "Closed") { s.closePrice = p.closePrice as number; s.closeDate = ... ?? e.occurredAt }` và `if (p.to === "Withdrawn") s.withdrawnReason = p.withdrawnReason as string`. Kết quả: closePrice và withdrawnReason thành undefined, còn closeDate bị đặt lại theo ngày ghi. Việc này trái luật «Đổi trạng thái không xoá dữ liệu» (Tham chiếu §5). Ở máy chủ, `update listings set ...` sau đó đụng `listings_closed_has_price` / `listings_withdrawn_has_reason` (migration 004) và trả 500. Có ba đường đi vào lỗi: (1) trình sửa ô ở `dungLenhTrangThai` (apps/web/src/app/(app)/inventory/cell-edit/lenh.ts) chỉ gửi `{to, label}` khi đổi nhãn tại chỗ; (2) `thayNhanCan` (packages/api/src/listings/store.ts) ghi `{to: hienTai.standardStatus, label: thay}`, nên `PUT /company/statuses` gỡ một nhãn neo Closed/Withdrawn mà còn căn mang sẽ lỗi 500; (3) hoàn tác tại chỗ ở hoan-tac.ts. Trên máy, `apTrenMay` gập ra bản mất giá chốt. Bộ test-db chỉ thử nhãn neo Pending và Active, nên không bắt được lỗi này. Cách sửa: khi `to` bằng trạng thái hiện tại, giữ nguyên closePrice/closeDate/withdrawnReason (hoặc chép từ bản hiện tại vào payload).
  rationale: AC-8 đòi gỡ nhãn kèm nhãn thay thì mỗi căn nhận đúng một sự kiện và giữ nguyên trạng thái; với nhãn neo Đã bán/Ngừng hẳn, lượt gỡ ném 500 và cả giao dịch bị huỷ.

- **Đổi nhãn tại chỗ ở Đã bán / Ngừng hẳn xoá giá chốt và lý do, rồi vấp ràng buộc DB (500); gỡ nhãn neo Closed/Withdrawn còn căn mang làm hỏng cả lượt PUT /company/statuses**
  AC: AC-8
  file: `packages/core/src/listing/fold.ts:79`
  severity: high
  source: bugs
  detail: Khi gấp, stepListing luôn ghi `s.closePrice = p.closePrice` (và closeDate = p.closeDate ?? occurredAt) nếu to === 'Closed', và `s.withdrawnReason = p.withdrawnReason` nếu to === 'Withdrawn'. Thay đổi này thêm đường đổi nhãn tại chỗ: sự kiện `status_changed {to: <trạng thái hiện tại>, label}` không kèm closePrice/withdrawnReason. Đường này có ở ba chỗ: (1) dungLenhTrangThai trong apps/web/.../cell-edit/lenh.ts chỉ gửi `{to, label}`; (2) applyCommand trong packages/api/src/listings/store.ts gặp doiNhanTaiCho thì bỏ qua checkTransition, nên không ai đòi closePrice; (3) thayNhanCan (store.ts khoảng dòng 300) ghi `{ to: hienTai.standardStatus, label: thay }`. Với căn Closed, bản gấp ra closePrice = undefined và closeDate bị ghi đè bằng ngày hôm nay. Với căn Withdrawn, withdrawnReason = undefined. Lệnh `update listings set ...` sau đó vấp `listings_closed_has_price` / `listings_withdrawn_has_reason` (migration 004) và ném lỗi không ai bắt, nên người dùng nhận lỗi 500 thay cho lý do. Hệ quả: (a) đổi nhãn tại chỗ cho căn Đã bán / Ngừng hẳn không bao giờ thành công. Thực đơn luaChonTrangThai vẫn mời bấm, vì nấc cuối Closed có nhãn riêng thì vẫn có lựa chọn tại chỗ. (b) PUT /company/statuses gỡ một nhãn neo Closed hay Withdrawn mà còn căn mang, kể cả khi có replace hợp lệ, luôn ném 500 và cả giao dịch bị huỷ, nên quản trị sàn không gỡ được nhãn ấy. (c) Trên máy, apTrenMay gấp lạc quan bằng cùng luật gấp nên bản tạm mất giá chốt / lý do cho tới khi máy chủ từ chối. Cách sửa: ở nhánh status_changed, chỉ ghi closePrice/closeDate/withdrawnReason khi payload có khoá đó, hay khi trạng thái thực sự đổi. Cách khác là đường đổi nhãn tại chỗ chép lại các trường này từ bản hiện tại.
  rationale: Gỡ nhãn đang dùng kèm nhãn thay là hành vi của AC-8; với neo Đã bán/Ngừng hẳn nó luôn trả 500 thay vì chuyển các căn sang nhãn thay.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khuôn mã nhãn chép hai nơi, lời chú thích nói đã dùng chung nhưng không đúng**
  Người dùng thấy gì: Hiện người dùng không thấy gì sai. Nếu sau này có người sửa quy tắc đặt mã nhãn ở một nơi mà quên nơi kia, hai chỗ có thể chấp nhận khác nhau.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, không mất dữ liệu, và chỉ là chuyện dọn dẹp nhẹ nên không đáng mở việc riêng.
  file: `packages/core/src/statuses/index.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — tuyên quét LỚP «mọi chỗ đọc payload ->> 'to'» nhưng ma trận đếm theo TỆP và gộp mọi migration thành một dòng**
  Người dùng thấy gì: Bộ kiểm tra chưa chắc báo đỏ nếu sau này có thêm một chỗ đọc trạng thái mới chưa tính đến nhãn riêng, nên lỗi hiển thị nhãn có thể lọt qua.
  Căn cứ: Hôm nay người dùng chưa gặp lỗi nào; rủi ro chỉ xảy ra khi có thay đổi tương lai và sửa bộ kiểm tra lúc nào cũng được.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa «hai căn deepEqual nhau trừ trường của chính căn» chỉ được đo bằng tập KHOÁ**
  Người dùng thấy gì: Bộ kiểm tra chưa chứng minh đủ rằng căn mang nhãn riêng hiện y như căn thường ở ngoài; nếu sau này có chữ khác lọt ra, kiểm tra có thể không bắt được.
  Căn cứ: Chưa có hậu quả thật với người dùng và việc củng cố kiểm tra có thể làm sau mà không mất dữ liệu.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ca từ chối đổi nhãn trùng không ghim lý do, còn đối chứng «hàng đợi không đổi» thì rỗng nghĩa**
  Người dùng thấy gì: Bộ kiểm tra chỉ biết lệnh bị từ chối chứ không biết vì lý do gì, nên nếu lý do đổi sai thì người dùng có thể thấy thông báo lạ mà kiểm tra không báo.
  Căn cứ: Hậu quả nhẹ, người dùng chỉ có thể thấy thông báo lỗi chưa chuẩn, không mất dữ liệu, và củng cố kiểm tra sau rất rẻ.
  file: `apps/web/src/app/(app)/inventory/trang-thai-rieng.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
