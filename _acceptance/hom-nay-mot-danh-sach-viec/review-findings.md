## Trong hợp đồng

- **Đầu màn báo «Không còn việc» khi nguồn đọc lỗi, trái AC-9**
  file: `apps/web/src/app/(app)/today/dau-man.tsx:12`
  severity: high
  AC: AC-9
  source: bugs
  detail: `moTa` chỉ xét `s.so`: `s.so ? ... : 'Không còn việc'`. Khi nguồn lỗi, `gopViec` không đưa nhóm nào vào nên `so` là 0, và effect ở `hom-nay.tsx:485-489` vẫn ghi `datSoViec({ so: 0, ... })` vì `khoaSo` không rỗng. Ví dụ telesales có `/api/v1/leads` trả 500 hai lần, hay đầu khách có tin lỗi: đầu màn ghi «Không còn việc» ngay trên dòng báo «Chưa tải được ...». AC-9 yêu cầu «không câu nào báo “không có việc” cho nguồn ấy», và chú thích đầu `gop-viec.ts` cũng cam kết điều này. Thân màn đã tránh đúng ca này (`tong === 0 ? gop.loi.length ? null : ...`), riêng đầu màn thì không. Cách sửa: khi có mục `so === null` trong `s.muc`, hoặc truyền thêm cờ lỗi vào kho số, thì không hiện «Không còn việc».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Giao lại thất bại trên máy tính không báo lỗi gì**
  Người dùng thấy gì: Khi trưởng nhóm bấm Giao lại trên máy tính mà máy chủ từ chối, màn không nói gì, nên họ tưởng lead đã được giao trong khi chưa.
  Căn cứ: Hậu quả vừa phải vì lead không mất và tải lại là thấy vẫn còn đó, nhưng người dùng bị đánh lừa và sửa sau rẻ.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: high
  Đề xuất: new-contract

- **Cột thứ hai hiện số 0 cho nhóm lead do sàn tự đặt khi nguồn lead hỏng**
  Người dùng thấy gì: Nếu sàn tự đặt một nhóm lead mang mã riêng và việc đọc lead bị hỏng, cột bên cạnh hiện số 0 thay vì để trống, dễ hiểu nhầm là không có việc.
  Căn cứ: Chỉ xảy ra khi đồng thời sàn dùng nhóm tự đặt và nguồn lỗi, số sai chỉ là hiển thị và hết khi đọc lại được.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: medium
  Đề xuất: known-limits

- **Luật khuôn Đội còn nói sáu trạng thái và nút giao đã bỏ**
  Người dùng thấy gì: Tài liệu thiết kế của màn Đội còn mô tả một nút giao và một trạng thái mà màn thật đã bỏ; người dùng không thấy gì khác.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ có thể làm người viết sau hiểu sai, sửa là chỉnh vài dòng chữ.
  file: `design/patterns/hom-nay-truong-nhom.md`
  severity: low
  Đề xuất: known-limits

- **Lỗi «Giao lại» không hiện trên máy tính: bấm hỏng mà màn không báo gì**
  Người dùng thấy gì: Trưởng nhóm bấm Giao lại lúc lỗi hoặc mất mạng thì màn im lặng, không biết lead chưa được giao.
  Căn cứ: Lead không mất dữ liệu và thử lại được, nhưng việc giao bị bỏ sót âm thầm nên nên sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: high
  Đề xuất: new-contract

- **Đọc danh sách đầu chủ lỗi bị nuốt, nút Giao lại tắt kèm câu sai «Sàn chưa có đầu chủ nào»**
  Người dùng thấy gì: Khi việc tải danh sách đầu chủ bị lỗi, nút Giao lại bị tắt và màn báo sai là sàn chưa có đầu chủ nào, đến khi tải lại trang.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu, nhưng câu báo sai gây hoang mang.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: medium
  Đề xuất: new-contract

- **Trang Đội kẹt «Đang mất mạng» sau một lần đọc hỏng mạng, không có đường thoát**
  Người dùng thấy gì: Trang Đội sau một lần rớt mạng thoáng qua vẫn báo đang mất mạng và giữ ô số trống dù mạng đã có lại, phải tải lại trang.
  Căn cứ: Không mất dữ liệu và chỉ cần tải lại trang là hết, sửa vừa phải nên ghi lại là hạn chế đã biết.
  file: `apps/web/src/app/(app)/team/dashboard.tsx`
  severity: medium
  Đề xuất: known-limits

- **Nút «Mở Bảng hàng» khi hết việc đưa người telesales kiêm quản trị quay lại chính Hôm nay**
  Người dùng thấy gì: Người vừa làm telesales vừa quản trị, khi hết việc, bấm nút mở Bảng hàng sẽ bị đưa về đúng màn Hôm nay đang xem.
  Căn cứ: Chỉ gặp ở một tổ hợp vai hiếm trên điện thoại, không mất dữ liệu và người dùng tự đi tiếp bằng menu.
  file: `apps/web/src/app/(app)/today/mobile/het-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): E2 hứa ma trận năm vai × tám loại việc nhưng không có ca nào như vậy**
  Người dùng thấy gì: Chưa có bài kiểm tự động quét đủ mọi vai với mọi loại việc, nên một lỗi về nhóm việc theo vai sau này có thể lọt qua mà không ai biết.
  Căn cứ: Người dùng hiện chưa gặp lỗi gì, rủi ro chỉ là bỏ sót hồi quy về sau và bổ sung bài kiểm có thể làm dần.
  file: `_acceptance/hom-nay-mot-danh-sach-viec/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): E5 dựa vào ca «dòng đầu khách không có khoá lớp nguồn» nhưng ca này không tồn tại**
  Người dùng thấy gì: Chưa có bài kiểm tự động bảo đảm dòng việc của đầu khách không lộ thông tin chủ nhà, nên nếu sau này có lỗi thì khó bị bắt sớm.
  Căn cứ: Chưa thấy dữ liệu nào lộ thật nhưng đây là thông tin nhạy cảm, nên bổ sung ca kiểm sớm là đáng làm.
  file: `_acceptance/hom-nay-mot-danh-sach-viec/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): ma trận sáu tổ hợp vai của E8 chỉ chạy nhánh chưa có số và mỗi ô chỉ soi một phần mã nhóm**
  Người dùng thấy gì: Bài kiểm danh sách nhóm theo vai mới soi một phần, nên nếu một vai thấy nhầm nhóm của vai khác khi đã có số thì chưa chắc bị phát hiện.
  Căn cứ: Người dùng chưa gặp lỗi, rủi ro là bỏ sót về sau và sửa chỉ là viết thêm ca kiểm.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): đối chứng «nguồn lỗi thì mục không có số» của E8 chỉ đi qua một SO viết tay**
  Người dùng thấy gì: Bài kiểm việc nguồn lỗi thì không hiện số chỉ kiểm dữ liệu tự viết, nên nếu khâu ghi số thật sai thì bài kiểm vẫn xanh.
  Căn cứ: Chưa có hậu quả với người dùng, chỉ làm lưới an toàn yếu và có thể gia cố sau.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): các ca «đọc lại» của E9 không dùng fetch giả như eval khai, chỉ dùng hàm trả null dựng sẵn**
  Người dùng thấy gì: Bài kiểm việc tự đọc lại khi lỗi chưa chạy qua chuỗi tải thật, nên một lỗi nối giữa các bước có thể không bị bắt.
  Căn cứ: Người dùng chưa chịu ảnh hưởng nào và chỉ cần bổ sung ca kiểm khi có thời gian.
  file: `apps/web/src/app/(app)/today/viec/doc-nguon.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính thiếu đối chứng dương): E3b hứa đối chứng «lead không giao vẫn còn» và kiểm /leads/assigned, nhưng ca thật không có cả hai**
  Người dùng thấy gì: Bài kiểm việc giao lại chưa chứng minh các lead khác không bị rơi khỏi hàng đợi và đầu chủ có thấy lead được giao, nên lỗi kiểu đó có thể lọt.
  Căn cứ: Chưa thấy lead nào mất thật, nhưng việc giao lead quan trọng nên nên bổ sung ca kiểm khi tiện.
  file: `packages/api/test-db/hom-nay-truong-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/14 lỗi rơi vào file không bộ đo nào phủ (_acceptance/hom-nay-mot-danh-sach-viec/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
