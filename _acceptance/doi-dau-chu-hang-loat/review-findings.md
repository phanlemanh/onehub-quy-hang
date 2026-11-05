## Trong hợp đồng

none

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hoàn tác đổi đầu chủ không kiểm trục «ai thấy hàng» như xem trước và đổi**
  Người dùng thấy gì: Một trưởng nhóm khác cùng sàn, nếu biết sẵn mã của lần đổi, có thể hoàn tác lần đổi đó và chạm tới cả những căn «Chỉ tôi» của người khác. Hiện không có màn nào hiện mã này nên khó xảy ra.
  Căn cứ: Hậu quả nhẹ vì chỉ trưởng nhóm cùng sàn mới làm được và phải biết sẵn mã lần đổi, không lộ dữ liệu ra ngoài sàn; sửa sau vẫn rẻ.
  file: `packages/api/src/listings/doi-dau-chu.ts`
  severity: low
  Đề xuất: known-limits

- **Hoàn tác trả liên hệ chủ nhà về đầu chủ cũ đã mất vai, trong khi căn của chủ ấy vẫn ở người nhận: một chủ hai đầu chủ**
  Người dùng thấy gì: Nếu đầu chủ cũ đã mất vai hoặc rời sàn trước khi hoàn tác, liên hệ chủ nhà quay về người đó còn các căn của chủ ấy vẫn ở người nhận, nên một chủ nhà có hai người phụ trách. Thông báo trên màn còn nêu sai lý do cho các căn bị bỏ qua.
  Căn cứ: Chỉ xảy ra khi đầu chủ cũ mất vai giữa lúc đổi và hoàn tác, trong vòng 10 giây của thông báo nên rất hiếm; không mất dữ liệu và trưởng nhóm có thể gán lại tay, nhưng lệch không báo ra nên cần ghi rõ.
  file: `packages/db/migrations/027_doi_dau_chu.sql`
  severity: medium
  Đề xuất: known-limits

- **Tải danh sách đầu chủ lỗi thì nuốt im: ô chọn rỗng, không có lời báo**
  Người dùng thấy gì: Khi mạng chập chờn hoặc mất phiên lúc mở hộp đổi đầu chủ, ô chọn người nhận trống và nút đổi tắt mà không có lời giải thích, người dùng không biết vì sao.
  Căn cứ: Không mất hay lộ dữ liệu và người dùng tự gỡ được bằng cách đóng hộp rồi mở lại hoặc tải lại trang; chỉ gây khó hiểu.
  file: `apps/web/src/app/(app)/inventory/bulk/hop-doi-dau-chu.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm-tính-một-mình): ô đếm dòng gán của ca «đổi đầu chủ hàng loạt không chạm hàng Chỉ tôi» không thể đỏ**
  Người dùng thấy gì: Một bài kiểm tự nhận chứng minh hàng «Chỉ tôi» không bị đổi đầu chủ thì thực ra không thể báo lỗi ở một phần kiểm, nên phần đó không bảo vệ được người dùng nếu luật hỏng.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng vì chỉ là độ chắc của bài kiểm và phần còn lại của ca vẫn đo được; có thể gia cố sau mà không đụng tới sản phẩm.
  file: `packages/api/test-db/visibility.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
