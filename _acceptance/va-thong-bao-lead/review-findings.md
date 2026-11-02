# Review findings: va-thong-bao-lead (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E2 hứa một ca đối chứng đỏ cho ô (d) nhưng bài kiểm không có ca này**
  Người dùng thấy gì: Hồ sơ nói có một phép thử chứng minh máy chủ thật sự bỏ qua đăng ký có địa chỉ lạ, nhưng phép thử đó chưa có. Hành vi vẫn đúng, chỉ là chưa có bằng chứng chắc như hồ sơ đã ghi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại vì việc chặn địa chỉ lạ vẫn có phép thử khác bắt được; thiếu chỉ làm bằng chứng yếu hơn, và bổ sung sau rẻ.
  file: `_acceptance/va-thong-bao-lead/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — E3 đo đầu ra trung gian (guiCacDong), không đo lời ghi app.push_outbox_mark mà E3 hứa**
  Người dùng thấy gì: Phép thử ở bước này chỉ kiểm danh sách kết quả trả về chứ chưa kiểm việc ghi xuống dữ liệu. Nếu sau này có người sửa để ghi nhầm cả những thông báo chưa gửi, bước này vẫn báo xanh, dù một bài kiểm khác vẫn bắt được.
  Căn cứ: Hiện không gây hại vì đã có một bài kiểm khác đo đúng việc ghi dữ liệu; rủi ro chỉ là bắt chậm khi ai đó sửa code về sau, và người dùng không mất dữ liệu.
  file: `_acceptance/va-thong-bao-lead/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — ca mặc định của E14 đo hằng khai báo, không đo runLeadTick dùng hạn mặc định khi bỏ trống tham số**
  Người dùng thấy gì: Phép thử về hạn gửi mặc định của nhịp chia chỉ so một con số với chính nó, nên nếu hạn mặc định bị đổi nhầm sau này thì phép thử vẫn xanh. Hiện hành vi đang đúng.
  Căn cứ: Hành vi hiện tại đúng và các phép thử về hạn chót khác vẫn chạy; sửa phép thử này tốn công hơn nhiều so với rủi ro nhỏ, người dùng không bị ảnh hưởng.
  file: `packages/api/test-db/va-thong-bao-lead.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-thong-bao-lead/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
