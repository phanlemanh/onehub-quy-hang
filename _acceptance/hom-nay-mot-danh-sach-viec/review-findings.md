# Review findings: hom-nay-mot-danh-sach-viec (round 2)

## Trong hợp đồng

- **Số của cột hai dùng danh sách mã nhóm cố định: nhóm lead do sàn tự đặt hiện 0 khi nguồn lead giao đọc hỏng**
  AC: AC-8
  file: `apps/web/src/app/(app)/today/viec/kho-so.ts:28`
  severity: medium
  detail: `NGUON_NHOM` gắn nguồn «lead-giao» cho đúng một mã `new_lead`, còn `mucSoTuGop` (dòng 31-35) chỉ nhận `code/label/enabled` nên không biết `subject` của nhóm. Bộ nhóm là dữ liệu của sàn: `kiemBoNhom` (packages/core/src/today/kiem.ts dòng 49, 55, 89) nhận mọi mã đúng khuôn với `subject: "lead"`, và chính hom-nay.tsx (dòng 134, 441) đã xử lý nhóm lead theo `subject`, không theo mã. Vì thế khi `/leads/assigned` lỗi, nhóm lead mang mã khác `new_lead` có `NGUON_NHOM[code]` là undefined, không khớp nguồn lỗi nào, nên `so` ra 0 thay vì null. Cột thứ hai báo «0 việc» cho nhóm chưa đọc được, trái AC-8/E8b («mục của nguồn lỗi không có số»), AC-9 và luật ADR-0022 (danh sách cố định là dữ liệu của sàn). Bài kiểm ở kho-so.test.ts chỉ phủ nguồn lỗi `hang-doi`, nên không bắt được ca này. Hướng sửa: truyền `subject` vào `mucSoTuGop`; tra `NGUON_NHOM` trước cho các nhóm của vai, mã không có trong bảng mà `subject === "lead"` thì tính là nguồn «lead-giao».
  source: conventions

- **Nhóm lead sàn tự đặt mã hiện số 0 khi nguồn lead hỏng (đã ghi vòng 1, HEAD chưa sửa, mã đã dời sang kho-so.ts)**
  AC: AC-8
  file: `apps/web/src/app/(app)/today/viec/kho-so.ts:28`
  severity: medium
  detail: `NGUON_NHOM` chỉ ánh xạ `new_lead` sang `lead-giao`. `kiemBoNhom` cho phép sàn có nhóm `subject: 'lead'` với mã bất kỳ qua PUT `/company/settings/queue`, và `nhomCuaLead` xếp lead vào các nhóm đó. Khi `lead-giao` lỗi, `NGUON_NHOM[n.code]` là `undefined` nên `mucSoTuGop` rơi vào `?? 0`: mục hiện 0 thay vì không số, trái AC-8. Cách sửa: suy nguồn từ `subject === 'lead'` của nhóm thay vì liệt kê mã.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tệp bằng chứng E6-leadqueue.json thực chất là trang 404, không phải dữ liệu hàng đợi; bước E6 ghi sai đường API**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ là một tệp minh chứng của bài chấm chứa trang lỗi thay vì dữ liệu thật, nên người duyệt không đối chiếu được ba ô số của trưởng nhóm.
  Căn cứ: Không ảnh hưởng người dùng cuối và không làm mất dữ liệu; chụp lại bằng chứng sau là rẻ và không gấp.
  file: `_acceptance/hom-nay-mot-danh-sach-viec/evidence/E6-leadqueue.json`
  severity: medium
  Đề xuất: known-limits

- **Cột thứ hai vẫn hiện «Tất cả việc 0» khi nguồn đọc hỏng: bản sửa mới chỉ áp cho đầu màn**
  Người dùng thấy gì: Khi một nguồn việc bị lỗi kéo dài, mục «Tất cả việc» có thể ghi 0 ngay cạnh dòng báo lỗi, dễ đọc nhầm là không có việc.
  Căn cứ: Nhẹ vì đã có dòng báo lỗi và nút Thử lại ngay đó, không mất dữ liệu, người dùng thử lại hoặc tải lại là hết.
  file: `apps/web/src/app/(app)/today/viec/kho-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Giao lại thất bại trên máy tính không báo gì (đã ghi vòng 1, HEAD chưa sửa)**
  Người dùng thấy gì: Trưởng nhóm bấm «Giao lại» trên máy tính, nếu bị từ chối hoặc mất mạng thì nút bật lại và dòng giữ nguyên, không có chữ nào cho biết việc chưa được giao.
  Căn cứ: Khá nặng vì trưởng nhóm có thể tưởng lead đã được giao trong khi nó vẫn quá hạn, nhưng không mất dữ liệu và bấm lại được; cần một việc riêng để định câu báo.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: high
  Đề xuất: new-contract

- **Đọc danh sách đầu chủ lỗi bị nuốt, nút Giao lại tắt với câu sai (đã ghi vòng 1, HEAD chưa sửa)**
  Người dùng thấy gì: Khi danh sách đầu chủ của sàn không tải được, nút «Giao lại» bị tắt kèm câu «Sàn chưa có đầu chủ nào» là sai, và không có cách thử lại hay tự đọc lại khi mạng về.
  Căn cứ: Câu báo sai gây hiểu lầm cho trưởng nhóm nhưng tải lại trang là gỡ được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): các ca «đọc lại» của E9 dùng thân mảng trần, máy chủ thật trả {items} và đường đọc thật là hàm khác**
  Người dùng thấy gì: Một bài kiểm tự hồi khi nguồn lỗi một lần dùng dữ liệu giả khác dữ liệu thật, nên nếu đường đọc thật hỏng đi thì bài vẫn xanh.
  Căn cứ: Người dùng không gặp lỗi ngay; rủi ro là sau này hỏng mà không ai biết, và củng cố bài kiểm có thể làm sau.
  file: `apps/web/src/app/(app)/today/viec/doc-nguon.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): SoViec của cột hai và đầu màn được bài tự dựng lại, không lấy từ chỗ ghi thật**
  Người dùng thấy gì: Bài kiểm tự tính số việc và cờ lỗi thay vì dùng đúng đoạn chạy thật, nên có thể bỏ sót nếu đoạn thật tính sai.
  Căn cứ: Người dùng chưa bị ảnh hưởng; chỉ giảm độ chắc của bài kiểm, sửa sau không đắt.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert có mặt trong khi lời hứa là quan hệ): «một mục sáng» của ma trận sáu tổ hợp đúng với mọi kết quả**
  Người dùng thấy gì: Bài kiểm chưa thật sự chứng minh mục được tô sáng là mục người dùng đang chọn, nên nếu lỗi này xuất hiện bài vẫn xanh.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ là kiểm chưa đủ chặt và có thể siết sau rẻ.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert có mặt trong khi lời hứa là số lượng): «đúng một nút chính» chỉ là kiểm chuỗi khác rỗng**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận mỗi dòng có một nhãn nút chính, không đếm được trường hợp có hai nút chính.
  Căn cứ: Mức thấp, người dùng không bị ảnh hưởng và cấu trúc dòng hiện không cho sinh ra hai nút nên chi phí sửa vượt hậu quả.
  file: `apps/web/src/app/(app)/today/viec/gop-viec.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 5 (tuyên quét lớp nhưng chỉ có điểm-case): «nguồn lỗi» có bốn nguồn, bài chỉ ghim hàng đợi**
  Người dùng thấy gì: Bài kiểm chỉ thử một trong bốn nguồn việc bị lỗi, nên lỗi ở ba nguồn còn lại có thể lọt mà không ai phát hiện.
  Căn cứ: Hậu quả gián tiếp qua bài kiểm, không mất dữ liệu; mở rộng phủ sau là việc vừa phải.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (ma trận có ô không được đo): tổ hợp «đầu chủ» bị nhánh if bỏ qua phép kiểm «nhãn theo sàn»**
  Người dùng thấy gì: Với đầu chủ, bài kiểm không thử việc sàn đổi tên nhóm có hiện ở cột thứ hai hay không, nên lỗi ở đây có thể không bị bắt.
  Căn cứ: Thấp: chỉ là một tổ hợp thiếu kiểm, người dùng tự thấy và báo được, bổ sung sau rẻ.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: low
  Đề xuất: known-limits

- **Giao lại thất bại trên máy tính không báo lỗi gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi trưởng nhóm bấm Giao lại trên máy tính mà máy chủ từ chối, màn không nói gì, nên họ tưởng lead đã được giao trong khi chưa.
  Căn cứ: Hậu quả vừa phải vì lead không mất và tải lại là thấy vẫn còn đó, nhưng người dùng bị đánh lừa và sửa sau rẻ.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: high
  Đề xuất: new-contract

- **Cột thứ hai hiện số 0 cho nhóm lead do sàn tự đặt khi nguồn lead hỏng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sàn tự đặt một nhóm lead mang mã riêng và việc đọc lead bị hỏng, cột bên cạnh hiện số 0 thay vì để trống, dễ hiểu nhầm là không có việc.
  Căn cứ: Chỉ xảy ra khi đồng thời sàn dùng nhóm tự đặt và nguồn lỗi, số sai chỉ là hiển thị và hết khi đọc lại được.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: medium
  Đề xuất: known-limits

- **Luật khuôn Đội còn nói sáu trạng thái và nút giao đã bỏ (r1)**
  Người dùng thấy gì: Tài liệu thiết kế của màn Đội còn mô tả một nút giao và một trạng thái mà màn thật đã bỏ; người dùng không thấy gì khác.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ có thể làm người viết sau hiểu sai, sửa là chỉnh vài dòng chữ.
  file: `design/patterns/hom-nay-truong-nhom.md`
  severity: low
  Đề xuất: known-limits

- **Lỗi «Giao lại» không hiện trên máy tính: bấm hỏng mà màn không báo gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trưởng nhóm bấm Giao lại lúc lỗi hoặc mất mạng thì màn im lặng, không biết lead chưa được giao.
  Căn cứ: Lead không mất dữ liệu và thử lại được, nhưng việc giao bị bỏ sót âm thầm nên nên sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: high
  Đề xuất: new-contract

- **Đọc danh sách đầu chủ lỗi bị nuốt, nút Giao lại tắt kèm câu sai «Sàn chưa có đầu chủ nào» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi việc tải danh sách đầu chủ bị lỗi, nút Giao lại bị tắt và màn báo sai là sàn chưa có đầu chủ nào, đến khi tải lại trang.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu, nhưng câu báo sai gây hoang mang.
  file: `apps/web/src/app/(app)/today/hom-nay.tsx`
  severity: medium
  Đề xuất: new-contract

- **Trang Đội kẹt «Đang mất mạng» sau một lần đọc hỏng mạng, không có đường thoát (r1)**
  Người dùng thấy gì: Trang Đội sau một lần rớt mạng thoáng qua vẫn báo đang mất mạng và giữ ô số trống dù mạng đã có lại, phải tải lại trang.
  Căn cứ: Không mất dữ liệu và chỉ cần tải lại trang là hết, sửa vừa phải nên ghi lại là hạn chế đã biết.
  file: `apps/web/src/app/(app)/team/dashboard.tsx`
  severity: medium
  Đề xuất: known-limits

- **Nút «Mở Bảng hàng» khi hết việc đưa người telesales kiêm quản trị quay lại chính Hôm nay (r1)**
  Người dùng thấy gì: Người vừa làm telesales vừa quản trị, khi hết việc, bấm nút mở Bảng hàng sẽ bị đưa về đúng màn Hôm nay đang xem.
  Căn cứ: Chỉ gặp ở một tổ hợp vai hiếm trên điện thoại, không mất dữ liệu và người dùng tự đi tiếp bằng menu.
  file: `apps/web/src/app/(app)/today/mobile/het-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): E2 hứa ma trận năm vai × tám loại việc nhưng không có ca nào như vậy (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có bài kiểm tự động quét đủ mọi vai với mọi loại việc, nên một lỗi về nhóm việc theo vai sau này có thể lọt qua mà không ai biết.
  Căn cứ: Người dùng hiện chưa gặp lỗi gì, rủi ro chỉ là bỏ sót hồi quy về sau và bổ sung bài kiểm có thể làm dần.
  file: `_acceptance/hom-nay-mot-danh-sach-viec/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): E5 dựa vào ca «dòng đầu khách không có khoá lớp nguồn» nhưng ca này không tồn tại (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có bài kiểm tự động bảo đảm dòng việc của đầu khách không lộ thông tin chủ nhà, nên nếu sau này có lỗi thì khó bị bắt sớm.
  Căn cứ: Chưa thấy dữ liệu nào lộ thật nhưng đây là thông tin nhạy cảm, nên bổ sung ca kiểm sớm là đáng làm.
  file: `_acceptance/hom-nay-mot-danh-sach-viec/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình 5 (tuyên quét lớp, thiếu ma trận toàn phần): ma trận sáu tổ hợp vai của E8 chỉ chạy nhánh chưa có số và mỗi ô chỉ soi một phần mã nhóm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm danh sách nhóm theo vai mới soi một phần, nên nếu một vai thấy nhầm nhóm của vai khác khi đã có số thì chưa chắc bị phát hiện.
  Căn cứ: Người dùng chưa gặp lỗi, rủi ro là bỏ sót về sau và sửa chỉ là viết thêm ca kiểm.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): đối chứng «nguồn lỗi thì mục không có số» của E8 chỉ đi qua một SO viết tay (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm việc nguồn lỗi thì không hiện số chỉ kiểm dữ liệu tự viết, nên nếu khâu ghi số thật sai thì bài kiểm vẫn xanh.
  Căn cứ: Chưa có hậu quả với người dùng, chỉ làm lưới an toàn yếu và có thể gia cố sau.
  file: `apps/web/src/app/(app)/today/viec/kho-so.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): các ca «đọc lại» của E9 không dùng fetch giả như eval khai, chỉ dùng hàm trả null dựng sẵn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm việc tự đọc lại khi lỗi chưa chạy qua chuỗi tải thật, nên một lỗi nối giữa các bước có thể không bị bắt.
  Căn cứ: Người dùng chưa chịu ảnh hưởng nào và chỉ cần bổ sung ca kiểm khi có thời gian.
  file: `apps/web/src/app/(app)/today/viec/doc-nguon.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính thiếu đối chứng dương): E3b hứa đối chứng «lead không giao vẫn còn» và kiểm /leads/assigned, nhưng ca thật không có cả hai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm việc giao lại chưa chứng minh các lead khác không bị rơi khỏi hàng đợi và đầu chủ có thấy lead được giao, nên lỗi kiểu đó có thể lọt.
  Căn cứ: Chưa thấy lead nào mất thật, nhưng việc giao lead quan trọng nên nên bổ sung ca kiểm khi tiện.
  file: `packages/api/test-db/hom-nay-truong-nhom.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
