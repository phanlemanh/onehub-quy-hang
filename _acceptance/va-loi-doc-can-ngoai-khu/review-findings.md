## Trong hợp đồng

- **Hình dạng 5 — Tuyên quét LỚP «thân sai khuôn» nhưng chỉ có điểm-case: ba trường bắt buộc, bảng chỉ thử một**
  file: `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts:49`
  severity: medium
  AC: AC-1
  source: measurement
  detail: AC-1 hứa cả lớp «trả thân không đúng khuôn»; mục Coverage Trục A lấy thước là «khuôn trả về đã khai của GET /api/v1/off-compound-units». Khuôn đó có ba trường bắt buộc: id, propertySubType, unparsedAddress (packages/api/src/off-compound-units/routes.ts:54), và laCanNgoaiKhu có đúng ba phép kiểm tương ứng. Bảng mười ca chỉ có một ca sai trường: dòng 49 thiếu unparsedAddress. Không có ca thiếu id, thiếu propertySubType, hay sai kiểu trường (ví dụ unparsedAddress là số). assert.equal(chay, 10) chỉ ghim độ dài bảng đã liệt kê, không ghim bảng phủ đủ các phần tử của khuôn. Bỏ vế `typeof v.id === "string"` hoặc `typeof v.propertySubType === "string"` khỏi laCanNgoaiKhu thì E1 vẫn xanh. Riêng trường propertySubType: phần tử thiếu trường này sẽ thành { kind: xong } và hàng lại hiện «Chưa rõ» không báo, đúng lỗi hợp đồng này đi vá.

- **Hình dạng 3 — Đếm «Chưa rõ» trên toàn bảng trong khi lời hứa là quan hệ với từng hàng ngoài khu**
  file: `_acceptance/va-loi-doc-can-ngoai-khu/thu/chay-ui.mjs:95`
  severity: medium
  AC: AC-6
  source: measurement
  detail: AC-1 hứa «các hàng vẫn hiện trên bảng» trong lúc báo lỗi. Ở trạng thái lỗi, E6 chỉ kiểm bằng chuaRo ≥ so_can và soDong ≥ 1. Dòng 95 là `ds.filter((x) => x.includes("Chưa rõ")).length`, đếm chuỗi có mặt trên MỌI hàng và không buộc vào hàng ngoài khu nào. «Chưa rõ» còn đến từ nguồn khác: hàng căn hộ không khớp danh mục hoặc danh mục chưa mang loại hình (thuocTinhCan trả KHONG_CO, cột loại hình ra CHUA_RO ở cot.ts:185), và hàng lô (ghep-danh-muc.ts:99). Vế coDiaChi = 0 cũng đúng khi hàng ngoài khu biến mất hẳn. Vì vậy nếu hàng ngoài khu bị lọc khỏi lưới mà các hàng khác đủ số «Chưa rõ», và soDong ≥ 1 do hàng căn hộ gánh, thì bài vẫn đạt. Cần đo quan hệ từng hàng: hàng mang offCompoundUnitId nào cũng còn trên lưới và cũng ra «Chưa rõ», hoặc đếm trên đúng tập hàng ấy.

- **Hình dạng 4 — Assertion âm tính ở bước taiLai không có đối chứng rằng lần đọc thật sự lỗi**
  file: `_acceptance/va-loi-doc-can-ngoai-khu/thu/chay-ui.mjs:134`
  severity: low
  AC: AC-6
  source: measurement
  detail: Bước taiLai đo vế AC-6 «tải lại khi ngắt thì không báo và hàng vẫn đúng theo bản giữ», và E6 kỳ vọng bao null. Dòng 134 chỉ gom `{ ...bao, ...quetHang }`. Khác bước sau ở dòng 127 có mayChu và tang, bước này không ghi bộ đếm __dem hay trạng thái performance của lần đọc sau tải lại. Nếu lần đọc sau Page.reload thành công thì bao null và coDiaChi = so_can vẫn ra y hệt, nên kết quả không phân biệt «đọc lỗi, rơi về bản giữ» với «đọc được bình thường». gap-probe P1 lập bước này chính để bắt «hook mất đường rơi về bản giữ», nên đầu ra phải chứng minh điều kiện lỗi đã xảy ra, ví dụ responseStatus 0 của lượt đọc cuối.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — Assertion âm tính trên hàm giả viết ngay trong bài, không bao giờ đỏ được**
  Người dùng thấy gì: Một dòng kiểm trong bộ test không có tác dụng thật, nhưng người dùng không gặp ảnh hưởng nào vì việc báo lỗi đã được các dòng kiểm khác bảo vệ.
  Căn cứ: Không ảnh hưởng người dùng và không làm mất hay lộ dữ liệu; chỉ là một dòng kiểm thừa, các dòng kiểm kế bên đã bắt đúng lỗi nên sửa không đáng công.
  file: `apps/web/src/app/(app)/inventory/loi-doc-can-ngoai-khu.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/va-loi-doc-can-ngoai-khu/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

