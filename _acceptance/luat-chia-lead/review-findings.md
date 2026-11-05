# Review findings: luat-chia-lead (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2b: eval ghi lý do có dấu hai chấm, còn bài kiểm lặng lẽ nới khuôn thành «dấu cách hoặc hai chấm»**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: lý do báo lỗi vẫn hiện đúng dòng. Chỉ có tài liệu nghiệm thu mô tả lệch chút so với bài kiểm.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là lệch lời mô tả trong hồ sơ, sửa sau rẻ nhưng không đáng mở việc riêng.
  file: `packages/api/test-db/luat-chia-lead.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Phần đọc danh bạ chỉ kiểm thân là mảng, không kiểm từng phần tử, dù bài kiểm gọi ca đó là «thân sai khuôn»**
  Người dùng thấy gì: Nếu máy chủ trả danh bạ sai dạng (rất hiếm), Bảng hàng có thể vỡ thay vì báo lỗi kèm Thử lại.
  Căn cứ: Rủi ro thấp vì máy chủ đã kiểm khuôn dữ liệu; nếu xảy ra thì tải lại trang là gỡ được, nhưng bản sai có thể còn giữ trên máy.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: known-limits

- **If loading the Today group set fails, the screen hides it and leaves both queue thresholds editable**
  Người dùng thấy gì: Khi không đọc được bộ nhóm Hôm nay riêng của sàn, quản trị vẫn sửa được hai ngưỡng và thấy «Đã lưu», nhưng giá trị không có hiệu lực.
  Căn cứ: Hậu quả vừa: quản trị tưởng đã đổi mà không áp, nhưng không mất dữ liệu và chỉ xảy ra khi lần đọc phụ hỏng; tải lại là thấy lại khoá.
  file: `apps/web/src/app/(app)/settings/lead-routing/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **chuNguon labels a current member with a blank name as «Đã rời sàn»**
  Người dùng thấy gì: Quản trị đang ở sàn nhưng chưa đặt tên sẽ bị ghi là «Đã rời sàn» ở dòng nguồn của luật.
  Căn cứ: Chỉ sai chữ ở dòng thông tin, không ảnh hưởng giá trị hay việc lưu; người dùng tự đặt tên là hết.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.ts`
  severity: medium
  Đề xuất: known-limits

- **The «Đầu chủ» column still concludes «Đã rời sàn» for a newly added member once a server read has happened (moi=true)**
  Người dùng thấy gì: Căn gán cho người vừa vào sàn có thể tạm ghi «Đã rời sàn» cho tới khi danh bạ đọc lại xong; nếu đọc lại hỏng thì chữ sai còn nằm đó kèm báo lỗi.
  Căn cứ: Sai chữ tạm thời ở một ô, không mất dữ liệu, thường tự đúng sau khi đọc lại hoặc bấm Thử lại.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: known-limits

- **E2b's expected text describes a reason format the server and the test do not produce**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ mô tả trong hồ sơ nghiệm thu lệch với cách máy chủ báo lý do.
  Căn cứ: Không có hậu quả với người dùng hay dữ liệu; sửa chữ trong hồ sơ rẻ nhưng không cần mở việc.
  file: `_acceptance/luat-chia-lead/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **Đo chỉ dẫn thay vì đầu ra, kèm assertion âm tính một mình: lời hứa "không tự thử lại" được đo bằng cách grep mã nguồn tìm setTimeout/setInterval**
  Người dùng thấy gì: Hiện Bảng hàng không tự thử lại danh bạ, nhưng nếu sau này ai đó đổi cách đọc thì bài kiểm có thể không bắt được.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ là lưới an toàn cho thay đổi tương lai còn mỏng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị: E8b đo nhãn lấy từ lõi bằng cách tìm tên định danh trong mã nguồn**
  Người dùng thấy gì: Nhãn trên màn hiện đúng, nhưng sau này nếu ai viết tay một nhãn lệch thì bài kiểm có thể không bắt được.
  Căn cứ: Không có sai lệch thật với người dùng hôm nay; rủi ro chỉ là chữ lệch dần về sau, sửa dễ khi gặp.
  file: `apps/web/src/app/(app)/settings/lead-routing/luat.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert chuỗi có mặt trong khi lời hứa là quan hệ giữa các giá trị: E10b xét "ô Đầu chủ hiện tên" bằng tên có mặt ở bất kỳ đâu trong trang**
  Người dùng thấy gì: Kịch bản thử có thể báo đạt dù ô Đầu chủ của đúng căn chưa chắc hiện tên.
  Căn cứ: Không phải lỗi của sản phẩm với người dùng; chỉ là bằng chứng nghiệm thu chưa chặt, bổ sung khi chạy lại chỗ thử.
  file: `_acceptance/luat-chia-lead/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/luat-chia-lead/evals.yaml, _acceptance/luat-chia-lead/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
