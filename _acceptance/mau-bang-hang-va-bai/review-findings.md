## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn/đầu vào thay vì đầu ra): E8b «hộp đang mở giữ bộ mẫu lúc mở» là phép thử luôn đúng**
  file: `apps/web/src/app/(app)/inventory/phat-hang/mau.test.ts:77`
  severity: high
  AC: AC-8
  source: measurement
  detail: Phép thử gọi `ban(luc, luc.mauSan!, ID(1), "xlsx")`, tức tự tay đưa vào bộ mẫu cũ. Hộp đang mở không bao giờ nhận bộ mẫu `moi`, vì `moi` chỉ được dùng cho lần `mo(moi)` sau đó. Assert vì thế chỉ kiểm hàm thuần trả kết quả theo đúng đầu vào nó được cho. Nó không chạm đường thật của hộp: `hop-thoai.tsx:173` lấy `mauSan` bằng useMemo từ `mo.mauSan`, còn `bang-hang.tsx:384` gọi `docMauXuat` lúc mở. Chiều đỏ mà evals E8b khai («hộp đọc lại mẫu mỗi lần vẽ») không làm phép thử này đỏ, vì không có thành phần hay đường đọc nào trong phép đo. Lý do vào hợp đồng: AC-8 có vế «hộp Xuất đang mở giữ mẫu lúc mở» và Đường đo chỉ định E8b; phép thử không thể đỏ nên vế này chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **baiFacebook chép lại logic loiSach thay vì dùng chung một hàm của lõi**
  Người dùng thấy gì: Bài Facebook và hai kênh còn lại hiện làm sạch lời mẫu giống hệt nhau. Chỉ khi sau này đổi luật ở một chỗ mà quên chỗ kia thì mới lệch.
  Căn cứ: Người dùng chưa thấy khác biệt nào, và sửa sau rất rẻ khi có nhu cầu đổi luật.
  file: `packages/core/src/export/bai.ts`
  severity: low
  Đề xuất: wont-fix

- **Hộp Xuất bảng hàng giờ chỉ mở khi hai lần đọc mẫu xong; không giới hạn thời gian, không có trạng thái chờ**
  Người dùng thấy gì: Khi mạng chập chờn hoặc máy chủ chậm, bấm Xuất bảng hàng có thể như không có tác dụng, không báo gì.
  Căn cứ: Chỉ xảy ra khi mạng rất chậm, không mất dữ liệu và người dùng tải lại để thử lại được.
  file: `apps/web/src/app/(app)/inventory/bang-hang.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đọc mẫu bảng hàng khoan dung bỏ cột trùng và cột vượt trần mà không ghi lỗi**
  Người dùng thấy gì: Với mẫu cũ hoặc ghi thẳng vào dữ liệu, một số cột trùng hay thừa bị bỏ mà không có báo lỗi nào.
  Căn cứ: Hiếm gặp, không lộ hay mất dữ liệu thật, và đường lưu thông thường đã chặn từ đầu.
  file: `packages/core/src/export/mau-san.ts`
  severity: low
  Đề xuất: known-limits

- **Kiểm mẫu bảng khi ghi không chặn id trùng**
  Người dùng thấy gì: Nếu có người gửi thẳng hai mẫu cùng mã nội bộ, mẫu thứ hai không chọn được và xoá một mẫu thì mất cả hai.
  Căn cứ: Màn hình thông thường không tạo ra được tình huống này, chỉ xảy ra khi gọi thẳng vào hệ thống và mẫu tạo lại được.
  file: `packages/core/src/export/mau-san.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bài rò rỉ «hai tab dựng ra không mang giá trị mồi» chỉ có vế âm và không thể đỏ**
  Người dùng thấy gì: Một phép kiểm phụ về rò rỉ trên màn Mẫu chưa thực sự chứng minh được gì, nên chưa thêm lớp bảo vệ nào.
  Căn cứ: Màn Mẫu không chứa dữ liệu căn thật và phép quét mã nguồn chính vẫn chạy, nên rủi ro thấp.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bộ đọc mẫu của hộp Xuất và màn Gửi chỉ được kiểm bằng thân `{ templates: ... }` viết tay**
  Người dùng thấy gì: Nếu sau này đổi cách máy chủ trả mẫu, các phép kiểm ở màn Xuất và màn Gửi vẫn xanh dù chức năng có thể hỏng.
  Căn cứ: Chưa gây lỗi cho người dùng hiện tại, chỉ là lưới an toàn khi đổi sau này, và bổ sung sau không đắt.
  file: `apps/web/src/app/(app)/inventory/phat-hang/mau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bảng tám trạng thái E10c có hai dòng không dựng thành phần**
  Người dùng thấy gì: Hai trạng thái của màn Mẫu (không quyền và lưu bị từ chối) chưa được kiểm bằng chính màn hình, nên nếu chữ báo bị mất thì phép kiểm không phát hiện.
  Căn cứ: Chưa có dấu hiệu hiển thị sai, người dùng chỉ gặp nếu chữ báo biến mất và sửa lại dễ.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
