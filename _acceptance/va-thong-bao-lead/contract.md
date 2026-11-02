---
schema_version: 1
feature: Vá Thông báo lead — chỉ nhận địa chỉ của dịch vụ đẩy đã biết; gửi có thời hạn, không treo lối giao lead, không gửi trùng; lưu đăng ký hỏng thì dải bật vẫn hiện và báo
slug: va-thong-bao-lead
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
design_doc: _acceptance/va-thong-bao-lead/design.md
approved_by: Manh Phan
approved_at: 2026-11-02
---

# Acceptance Contract: va-thong-bao-lead

## Context

Hàng vá phát sinh từ Cổng Bằng chứng hàng 26 (`_acceptance/thong-bao-lead/`): chủ kho chọn «mở hợp đồng mới» cho Ngoài-1
(đăng ký nhận bất kỳ https, máy chủ POST tới đó), Ngoài-4 (gửi không thời hạn — lối giao lead treo, quá một phút nhịp chia
gửi trùng), Ngoài-5 (dải bật ẩn dù lưu đăng ký hỏng). Không đổi cơ sở dữ liệu (giữ chỗ một phút của migration 018 giữ
nguyên), không đổi nội dung thông báo hay luật ai nhận.

## Criteria

- AC-1: Given một chuỗi địa chỉ đăng ký, When lõi xét nó có phải địa chỉ của dịch vụ đẩy đã biết, Then chỉ chấp nhận https
  tới `fcm.googleapis.com`, `updates.push.services.mozilla.com`, `web.push.apple.com` hay một máy `*.notify.windows.com`, cổng
  mặc định, không tên/mật khẩu trong địa chỉ; từ chối http, máy khác, địa chỉ IP, `localhost`, cổng lạ, tên giả mạo đuôi
  (vd `fcm.googleapis.com.<máy khác>`), địa chỉ có `@`, chuỗi không đọc được.
- AC-2 (cross-layer): Given đầu chủ đã đăng nhập, When thiết bị gửi đăng ký với địa chỉ không thuộc dịch vụ đẩy đã biết,
  Then máy chủ trả 400 và không có dòng đăng ký nào được lưu; địa chỉ của dịch vụ đẩy đã biết vẫn lưu (201) như hàng 26.
- AC-3 (cross-layer): Given một đăng ký đã lưu từ trước bản vá với địa chỉ không thuộc dịch vụ đẩy đã biết và một lead vừa
  về người ấy, When lượt gửi chạy, Then máy chủ không gọi tới địa chỉ ấy và gỡ đăng ký ấy; đăng ký hợp lệ khác của cùng người
  vẫn nhận thông báo.
- AC-4: Given dịch vụ đẩy không trả lời, When máy chủ gửi một thông báo, Then lần gửi kết thúc sau tối đa thời hạn một lần
  gửi và được ghi là lỗi tạm (nhịp sau gửi lại trong khung 15 phút của hàng 26).
- AC-5 (cross-layer): Given một lượt gửi có hạn chót (lối giao hay nhịp chia), When không còn đủ thời gian cho một lần gửi
  trước hạn chót, Then lượt dừng, các dòng chưa gửi giữ nguyên cho nhịp sau (không tăng lần thử); mọi ngân sách gửi cộng một
  lần gửi nhỏ hơn thời gian giữ chỗ một phút, và nhịp chia thật sự dừng ở hạn chót của nó, nên không dòng nào bị nhịp chia
  nhận lại khi đang gửi.
- AC-6 (cross-layer): Given dịch vụ đẩy treo và đầu chủ có ba thiết bị đã bật, When telesales nhập một lead và lead được giao
  ngay cho đầu chủ, Then yêu cầu nhập trả lời trong hạn của lối giao (dưới 8 giây), lead đã giao, đúng một dòng thông báo ghi
  lỗi tạm và hai dòng còn lại chưa thử — nhịp sau gửi tiếp.
- AC-7: Given trình duyệt đã bật thông báo (quyền cho phép, có đăng ký), When mở Hôm nay mà lưu đăng ký lên máy chủ thất bại,
  Then dải bật vẫn hiện với lời báo lỗi theo Hỏi-1 (khuyến nghị: «Chưa bật được thông báo — thử lại») và nút «Bật thông báo» —
  kể cả khi lưu hỏng vì mất mạng, máy chủ lỗi hay hết phiên; lưu được thì dải ẩn như
  hàng 26; chưa bật thì dải như cũ.
- AC-8: Given đầu chủ có đăng ký thông báo, When đăng xuất với thân yêu cầu mang địa chỉ không thuộc dịch vụ đẩy đã biết, Then
  vẫn đăng xuất (phiên hết, lần gọi kế tiếp chưa đăng nhập) và không gỡ đăng ký nào; đăng xuất mang địa chỉ của dịch vụ đẩy
  đã biết thì gỡ đúng đăng ký ấy như hàng 26.
- AC-9: Given bộ kiểm hàng 26 (đổi địa chỉ thử sang miền của dịch vụ đẩy đã biết, bộ gửi giả không gọi ra ngoài), When chạy
  lại sau vòng này, Then vẫn xanh; kiểm kiểu, lint giao diện (mức nợ 0), sàn thiết kế và ranh giới tệp xanh.

## Coverage

Bỏ quét không gian: ba lỗi đã có tên từ Cổng Bằng chứng hàng 26, mỗi lỗi một nhóm tiêu chí — Ngoài-1: AC-1, AC-2, AC-3, AC-8 ·
Ngoài-4: AC-4, AC-5, AC-6 · Ngoài-5: AC-7 (descope «bỏ coverage-scan»).

## Out of scope

- Đổi thời gian giữ chỗ một phút của hộp thư đi (migration 018).
- Dịch vụ đẩy ngoài bốn nhà đã liệt; cho sàn tự thêm máy nhận.
- Đổi chữ, khối hay vai của dải bật; nội dung thông báo; luật ai nhận.
- Lần gửi quá hạn mà dịch vụ đẩy thật đã nhận: nhịp sau gửi lại, máy thay thông báo cũ cùng nhãn — không phải hai thông báo.

## Notes

- Bằng chứng E7 của hàng 26 (ô «đã bật») dùng địa chỉ `push.example.test`; sau vòng này địa chỉ ấy không lưu được nên ô ấy
  sẽ hiện dải báo lỗi — đúng hành vi mới (AC-7), hồ sơ hàng 26 không chấm lại.
- Ngoài-1 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Hồ sơ nói có một phép thử chứng minh máy chủ thật sự bỏ qua đăng ký có địa chỉ lạ, nhưng phép thử đó chưa có. Hành vi vẫn đúng, chỉ là chưa có bằng chứng chắc như hồ sơ đã ghi. — `_acceptance/va-thong-bao-lead/evals.yaml`
- Ngoài-2 (máy định tuyến 2026-11-02, đề xuất S4 known-limits): Phép thử ở bước này chỉ kiểm danh sách kết quả trả về chứ chưa kiểm việc ghi xuống dữ liệu. Nếu sau này có người sửa để ghi nhầm cả những thông báo chưa gửi, bước này vẫn báo xanh, dù một bài kiểm khác vẫn bắt được. — `_acceptance/va-thong-bao-lead/evals.yaml`
- Known limits — chọn ở Cổng Bằng chứng 2026-11-02:
  - Ngoài-1: Bộ kiểm chưa có ca đối chứng đỏ riêng cho việc máy chủ bỏ qua đăng ký có địa chỉ lạ khi gửi.
  - Ngoài-2: Một bài kiểm thuần chỉ đo danh sách kết quả, chưa đo việc ghi xuống dữ liệu (bài trên cơ sở dữ liệu đo thay).
