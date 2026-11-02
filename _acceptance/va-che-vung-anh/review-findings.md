# Review findings: va-che-vung-anh (round 3)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài nhìn E2, E4, E5 thiếu tệp số đo mà evals.yaml đã bắt buộc, nhưng hồ sơ vẫn ghi ĐẠT nhờ «mang sang»**
  Người dùng thấy gì: Hồ sơ nghiệm thu ghi một số bài kiểm màn hình là đạt dù chưa có số đo kèm theo như quy định của chính hồ sơ. Người dùng cuối không thấy lỗi nào; chỉ là bằng chứng chưa chắc chắn bằng cách hồ sơ tự đặt ra.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ làm hồ sơ kém chặt, chạy lại bài kiểm để ghi đủ số đo thì rẻ và không có rủi ro.
  file: `_acceptance/va-che-vung-anh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Trần cao khung vẽ dùng dvh, trong khi mã ứng dụng của kho dùng svh cho trần cao theo màn**
  Người dùng thấy gì: Trên điện thoại, khi thanh địa chỉ của trình duyệt co giãn, khung vẽ có thể đổi cỡ nhẹ trong lúc kéo. Vùng che vẫn rơi đúng chỗ nên người dùng gần như không bị ảnh hưởng.
  Căn cứ: Hậu quả rất nhẹ, không mất dữ liệu, tự hết khi thanh địa chỉ ngừng co giãn; đổi cách đặt trần cao này sẽ hết hạn khi trình che chuyển sang ngăn nổi ở hàng 91.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: low
  Đề xuất: wont-fix

- **Below sm, the redaction dialog still overflows the screen for portrait images because the canvas height cap of 13rem is smaller than the dialog's own header and footer**
  Người dùng thấy gì: Trên điện thoại, khi che vùng cho ảnh chụp dọc, hộp che có thể cao hơn màn hình nên tiêu đề hoặc hàng nút phía dưới bị cắt và không cuộn tới được. Người dùng có thể không bấm được «Bỏ khung cuối» hay không thấy số khung đã che.
  Căn cứ: Lỗi thật và dễ gặp với ảnh chụp dọc trên điện thoại, nhưng chỉ làm khó thao tác chứ không mất hay lộ dữ liệu, và trước vòng này điện thoại vốn cũng tràn; nên làm thành một việc riêng cùng với việc che bằng cảm ứng trên điện thoại.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: medium
  Đề xuất: new-contract

- **E2 and E4 are marked PASS but the required measurement files E2-measure.json and E4-measure.json are missing**
  Người dùng thấy gì: Hồ sơ ghi hai bài kiểm khung che là đạt nhưng chưa có số đo thật kèm theo, nên chưa chứng minh chắc chắn vùng che nằm đúng chỗ con trỏ. Người dùng cuối chưa thấy lỗi nào.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng và không mất dữ liệu; đây là khoảng trống bằng chứng, bù lại bằng cách chạy lại hai bài kiểm và ghi số đo, chi phí thấp.
  file: `_acceptance/va-che-vung-anh/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-che-vung-anh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
