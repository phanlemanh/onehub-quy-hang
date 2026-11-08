# Review findings: doc-vung-danh-muc (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã lỗi mới catalog-unavailable nằm ngoài API_ERRORS, trái ADR-0007**
  Người dùng thấy gì: Khi hệ thống tạm không đọc được danh mục, ở màn Nhập Excel người dùng có thể thấy một dòng báo lỗi bằng chữ kỹ thuật tiếng Anh thay vì câu tiếng Việt dễ hiểu.
  Căn cứ: Chỉ đổi cách hiện câu báo trong lúc lỗi tạm, không mất dữ liệu, người dùng tải lại là qua, nên ghi lại rồi ship.
  file: `packages/api/src/catalog/nguon.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai tuyến mới trả 500 nhưng không khai trong OpenAPI, bị che bằng `as never`**
  Người dùng thấy gì: Tài liệu API dành cho bên ngoài thiếu một mã lỗi mà hai chức năng thực sự có thể trả; người dùng cuối không thấy khác biệt.
  Căn cứ: Chỉ ảnh hưởng người đọc tài liệu API, không đụng dữ liệu hay thao tác của người dùng, sửa sau rẻ và an toàn.
  file: `packages/api/src/leads/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Màn Nhập Excel nuốt lỗi 500 mới của GET /api/v1/catalog, xem trước chạy không có danh mục mà không báo**
  Người dùng thấy gì: Nếu danh mục tạm không đọc được, bản xem trước khi nhập Excel vẫn hiện bình thường nhưng không đối chiếu căn với danh mục, nên kết quả lúc ghi thật có thể khác bản xem trước.
  Căn cứ: Chỉ xảy ra khi lỗi đọc tạm thời; lúc ghi thật hệ thống vẫn đối chiếu đúng nên không ghi sai dữ liệu, người dùng thử lại được.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Trang nhập lead biến lỗi 500 mới của danh sách toà thành danh sách rỗng, không báo gì**
  Người dùng thấy gì: Khi danh mục tạm lỗi, ô chọn Toà khi nhập lead hiện trống mà không giải thích, người dùng không biết vì sao không chọn được.
  Căn cứ: Nhẹ, không mất dữ liệu, tải lại trang là hết khi lỗi tạm qua.
  file: `apps/web/src/app/(app)/leads/new/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Nhánh --chieu-do gọi process.exit trong try nên finally không chạy, thư mục tạm bị bỏ lại**
  Người dùng thấy gì: Mỗi lần chạy bài kiểm này để lại một thư mục tạm trên máy người kiểm; người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ rác nhỏ trên máy kiểm, không ảnh hưởng người dùng, không đáng mở việc.
  file: `_acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs`
  severity: low
  Đề xuất: wont-fix

- **Bước chép cơ sở dữ liệu của bài E10 không bắt lỗi SQL khi nạp vào bản chép**
  Người dùng thấy gì: Bài chụp màn E10 có thể chạy trên bản chép dữ liệu thiếu mà không báo, làm ảnh chụp sai bối cảnh; người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bài kiểm nội bộ, lộ ra ngay khi chạy lại, sửa rất rẻ khi cần.
  file: `_acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5, tuyên quét LỚP nhưng chỉ có điểm-case: ba trục nơi đọc × trạng thái × căn không có ma trận viết trước**
  Người dùng thấy gì: Một số tổ hợp, như danh mục lỗi hoặc vừa đổi gói ở Nhập Excel và danh sách toà, chưa có bài kiểm riêng nên chưa được chứng minh bằng máy.
  Căn cứ: Là khoảng trống bài kiểm chứ chưa thấy sai thật với người dùng, và chủ kho đã chủ động chọn bỏ quét phủ ở bước trước.
  file: `_acceptance/doc-vung-danh-muc/contract.md`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2, fixture VIẾT TAY đúng khuôn bên đọc: chiều đỏ của E2 không đi qua cửa nhận hay GET /catalog**
  Người dùng thấy gì: Bài kiểm chiều đỏ của Bảng hàng chưa chứng minh được rằng nạp gói khác diện tích thì Bảng hàng đổi theo qua đường thật.
  Căn cứ: Chưa thấy lỗi thật với người dùng, phần dương của bài vẫn đi đường thật, bổ sung bài kiểm sau là rẻ.
  file: `packages/api/test-db/catalog/doc-vung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, tuyên quét LỚP nhưng chỉ có điểm-case: E7 quét một tên ký hiệu mà in kết luận về cả gói mẫu**
  Người dùng thấy gì: Câu báo của bài kiểm nói rộng hơn điều nó thật sự đo; có một lệnh đo tỉ lệ nội bộ vẫn đọc gói mẫu, người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là lệch lời trong báo cáo nội bộ, nơi còn lại không phải đường đọc của người dùng, không đáng mở việc.
  file: `_acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/app/(app)/imports/new/man-nhap.tsx, apps/web/src/app/(app)/leads/new/page.tsx, _acceptance/doc-vung-danh-muc/contract.md) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
