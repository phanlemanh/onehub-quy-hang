# Review findings: luat-chia-lead (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột Đầu chủ vẫn ghi «Đã rời sàn» cho người giữ mới khi lần đọc lại danh bạ đang chờ hoặc bị lỗi**
  Người dùng thấy gì: Khi một căn vừa gán cho người mới vào sàn, cột Đầu chủ có thể ghi nhầm «Đã rời sàn» trong lúc danh bạ đang đọc lại hoặc đọc lại bị lỗi. Tải lại trang hoặc bấm Thử lại thì hiện đúng tên.
  Căn cứ: Chỉ sai chữ tạm thời ở một ô, không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách tải lại, và chỉ xảy ra với người vừa mới vào sàn.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: known-limits

- **Hằng DA_ROI_SAN bị khai lần thứ hai thay vì dùng lại chỗ đã có**
  Người dùng thấy gì: Chữ «Đã rời sàn» được khai ở hai nơi nên sau này sửa chữ ở một màn có thể lệch với màn kia. Hiện người dùng chưa thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng lúc này, chỉ có nguy cơ lệch chữ về sau và sửa rất rẻ khi cần.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: low
  Đề xuất: known-limits

- **Câu báo lỗi của phép kiểm nói ngược với điều đang được kiểm**
  Người dùng thấy gì: Nếu bài kiểm này đỏ, dòng báo lỗi sẽ nói ngược ý, làm người sửa hiểu nhầm. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ gây hiểu nhầm cho người bảo trì khi bài kiểm đỏ, không đụng người dùng, và sửa một dòng chữ bất cứ lúc nào.
  file: `packages/api/test-db/luat-chia-lead.test.ts`
  severity: low
  Đề xuất: wont-fix

- **When the saved pair of deadlines is invalid, saving one deadline shows 'Đã lưu' even though the value is not applied, or brings back an old bad value the user never saw**
  Người dùng thấy gì: Khi sàn đang có cặp hạn lưu sai từ trước, quản trị sửa một hạn vẫn thấy «Đã lưu» dù luật không được áp, hoặc một giá trị ẩn bất ngờ có hiệu lực. Quản trị có thể tưởng đã sửa xong trong khi lead mới vẫn chia theo hạn mặc định.
  Căn cứ: Gây hiểu lầm về luật đang chạy cho lead thật, nhưng chỉ xảy ra khi dữ liệu đã hỏng từ trước và màn vẫn đang hiện báo mặc định; cần thiết kế cách xử lý riêng.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat-chia-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **If reading the Hôm nay group set fails, the two queue thresholds are silently unlocked, with no notice**
  Người dùng thấy gì: Nếu việc đọc bộ nhóm Hôm nay lỗi mà sàn có bộ nhóm riêng, hai ngưỡng vẫn mở sửa và báo «Đã lưu» nhưng không có tác dụng. Quản trị không được báo gì về lần đọc lỗi.
  Căn cứ: Chỉ xảy ra khi sàn có bộ nhóm riêng và lần đọc đó lỗi đúng lúc; không mất dữ liệu, tải lại sẽ thấy ngưỡng bị khoá đúng.
  file: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **chuNguon shows 'Đã rời sàn' for a current member whose name is blank**
  Người dùng thấy gì: Thành viên còn trong sàn nhưng chưa đặt tên sẽ hiện là «Đã rời sàn» ở dòng người đổi luật. Chỉ là nhãn sai ở dòng thông tin phụ.
  Căn cứ: Rất hiếm, chỉ sai một nhãn phụ, không ảnh hưởng luật hay dữ liệu, người dùng đặt tên là hết.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — kiểm «chữ có mặt» trong khi lời hứa là quan hệ giữa các giá trị (E10b: tên đầu chủ hiện ở đúng ô của căn được gán)**
  Người dùng thấy gì: Bài thử giao diện có thể báo đạt dù ô Đầu chủ của căn được gán vẫn hiện «…», vì nó chỉ tìm tên ở bất kỳ đâu trên trang. Người dùng không bị ảnh hưởng trực tiếp, nhưng bằng chứng nghiệm thu yếu hơn.
  Căn cứ: Chỉ làm bằng chứng kém chặt chứ sản phẩm không sai, và sửa bài thử không tốn nhiều.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình, không có đối chứng dương (E6a: vai khác không thấy mục trong cột mục lục)**
  Người dùng thấy gì: Bài thử có thể báo «vai khác không thấy mục Luật chia lead» là đạt dù thực ra nó không tìm đúng chỗ để thấy mục đó. Người dùng không bị ảnh hưởng trực tiếp, nhưng khẳng định về quyền yếu hơn.
  Căn cứ: Là độ tin cậy của bằng chứng, không phải lỗi người dùng gặp; vì liên quan quyền nên nên ghi vết, nhưng việc ẩn mục còn được gác thêm bằng chặn 403 ở máy chủ.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kèm hình dạng 1) — doesNotMatch đứng một mình trên mã nguồn để chứng «nhãn không viết trong màn» (E8b)**
  Người dùng thấy gì: Bài kiểm có thể bỏ sót nếu ai đó viết lại nhãn lựa chọn thẳng trong màn theo cách khác, làm chữ trên màn lệch khỏi từ vựng chung. Hiện màn chưa sai chữ.
  Căn cứ: Chỉ là nguy cơ về sau, nhãn hiện tại đúng, và lệch chữ nếu có thì dễ thấy và sửa.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 1/4 — đo mã nguồn thay vì hành vi cho lời hứa «không tự thử lại theo nhịp» (E10a)**
  Người dùng thấy gì: Bài kiểm có thể không phát hiện nếu danh bạ sau này tự đọc lại liên tục khi bị lỗi. Hiện không thấy vòng thử lại tự động nào.
  Căn cứ: Đã có bài giao diện đếm số lần gọi bù lại, và sản phẩm hiện đúng nên chi phí sửa không đáng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/luat-chia-lead/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
